import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/User';
import Role from '../models/Role';
import ReliefRequest from '../models/ReliefRequest';
import { generateToken } from '../utils/jwt';
import { protect, authorize } from '../middleware/auth';
import { register, registerVolunteer, registerNgo, registerRescue, login, googleAuth } from '../controllers/authController';
import { createRequest, trackRequest } from '../controllers/reliefRequestController';

// Helper to simulate express req/res
function mockReqRes(headers: Record<string, string> = {}, body: any = {}, params: any = {}, query: any = {}) {
  let statusCode = 200;
  let responseData: any = null;

  const req: any = {
    headers: { ...headers },
    body,
    params,
    query,
    app: { get: () => null }
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    }
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

async function runTests() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in env');
  await mongoose.connect(uri);
  console.log('\n============================================================');
  console.log('AUTHENTICATION & RBAC ARCHITECTURE TEST SUITE');
  console.log('============================================================\n');

  const results: { testNumber: number; title: string; passed: boolean; details: string }[] = [];

  const addResult = (testNumber: number, title: string, passed: boolean, details: string) => {
    results.push({ testNumber, title, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Test ${testNumber.toString().padStart(2, '0')}] ${mark}: ${title}`);
    console.log(`         Details: ${details}\n`);
  };

  // Test timestamp suffix
  const ts = Date.now();

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Citizen can report emergency without registration
    // -------------------------------------------------------------------------
    {
      const { req, res, getStatus, getData } = mockReqRes({}, {
        citizenName: `Victim-${ts}`,
        contact: '+91 98000 11111',
        location: 'Guwahati Waterlogged Sector 3',
        coordinates: { type: 'Point', coordinates: [91.73, 26.15] },
        requestCategory: ['Rescue'],
        numberOfPeople: 3
      });

      await createRequest(req, res);
      const data = getData();
      const status = getStatus();

      const passed = status === 201 && (data.success || data.status === 'success') && !!(data.requestId || data.data?.requestID);
      const generatedRequestId = data.requestId || data.data?.requestID;
      addResult(1, 'Citizen can report emergency without registration', passed,
        `Status: ${status}, Generated ID: ${generatedRequestId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Citizen can access Track Emergency without login
    // -------------------------------------------------------------------------
    {
      const latest = await ReliefRequest.findOne().sort({ createdAt: -1 });
      const trackId = latest?.requestID || latest?._id?.toString();

      const { req, res, getStatus, getData } = mockReqRes({}, {}, { id: trackId });
      await trackRequest(req, res);

      const status = getStatus();
      const data = getData();
      const passed = status === 200 && (data.success || data.status === 'success');
      addResult(2, 'Citizen can access Track Emergency without login', passed,
        `Status: ${status}, Found Track Info for ID: ${trackId}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: User cannot publicly create an admin account
    // -------------------------------------------------------------------------
    {
      const maliciousEmail = `hacker-${ts}@evil.com`;
      const { req, res, getStatus, getData } = mockReqRes({}, {
        firstName: 'Malicious',
        lastName: 'Actor',
        email: maliciousEmail,
        password: 'Password123!',
        role: 'admin',
        roleName: 'admin'
      });

      let nextCalled = false;
      await register(req, res, ((err?: any) => { if (err) throw err; nextCalled = true; }) as any);

      const userInDb = await User.findOne({ email: maliciousEmail });
      const passed = userInDb !== null && (userInDb.roleName as string) === 'citizen';
      addResult(3, 'User cannot publicly create an admin account', passed,
        `Requested: admin -> Saved role: ${userInDb?.roleName} (Strictly downgraded to citizen)`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Volunteer registration automatically creates role=volunteer
    // -------------------------------------------------------------------------
    let volunteerEmail = `vol-${ts}@relief.org`;
    {
      const { req, res, getStatus, getData } = mockReqRes({}, {
        firstName: 'Rohit',
        lastName: 'Bora',
        email: volunteerEmail,
        password: 'Password123!',
        location: 'Guwahati Central',
        contactNumber: '+91 98765 00001',
        skills: ['First Aid', 'Boat Handling']
      });

      await registerVolunteer(req, res, (() => {}) as any);
      const userInDb = await User.findOne({ email: volunteerEmail });
      const passed = userInDb !== null && userInDb.roleName === 'volunteer';
      addResult(4, 'Volunteer registration automatically creates role=volunteer', passed,
        `User saved with role: ${userInDb?.roleName}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: NGO registration automatically creates role=ngo
    // -------------------------------------------------------------------------
    let ngoEmail = `ngo-${ts}@relief.org`;
    {
      const { req, res, getStatus, getData } = mockReqRes({}, {
        firstName: 'Relief',
        lastName: 'Trustee',
        email: ngoEmail,
        password: 'Password123!',
        organization: 'Assam Flood Aid Mission',
        contactNumber: '+91 98765 00002'
      });

      await registerNgo(req, res, (() => {}) as any);
      const userInDb = await User.findOne({ email: ngoEmail });
      const passed = userInDb !== null && userInDb.roleName === 'ngo' && userInDb.organization === 'Assam Flood Aid Mission';
      addResult(5, 'NGO registration automatically creates role=ngo', passed,
        `User saved with role: ${userInDb?.roleName}, org: ${userInDb?.organization}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Rescue registration automatically creates role=rescue
    // -------------------------------------------------------------------------
    let rescueEmail = `rescue-${ts}@relief.org`;
    {
      const { req, res, getStatus, getData } = mockReqRes({}, {
        firstName: 'Commander',
        lastName: 'Sarma',
        email: rescueEmail,
        password: 'Password123!',
        organization: 'Field Extraction Delta',
        contactNumber: '+91 98765 00003',
        skills: ['Swiftwater Rescue']
      });

      await registerRescue(req, res, (() => {}) as any);
      const userInDb = await User.findOne({ email: rescueEmail });
      const passed = userInDb !== null && userInDb.roleName === 'rescue';
      addResult(6, 'Rescue registration automatically creates role=rescue', passed,
        `User saved with role: ${userInDb?.roleName}`);
    }

    // -------------------------------------------------------------------------
    // TEST 7: New volunteer/NGO/rescue account starts as pending
    // -------------------------------------------------------------------------
    {
      const volUser = await User.findOne({ email: volunteerEmail });
      const ngoUser = await User.findOne({ email: ngoEmail });
      const rscUser = await User.findOne({ email: rescueEmail });

      const passed = volUser?.status === 'pending' && ngoUser?.status === 'pending' && rscUser?.status === 'pending';
      addResult(7, 'New volunteer/NGO/rescue account starts as pending', passed,
        `Statuses -> Volunteer: ${volUser?.status}, NGO: ${ngoUser?.status}, Rescue: ${rscUser?.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Pending account cannot access its dashboard / login is blocked
    // -------------------------------------------------------------------------
    {
      const { req, res, getStatus, getData } = mockReqRes({}, {
        email: volunteerEmail,
        password: 'Password123!'
      });

      await login(req, res, (() => {}) as any);
      const status = getStatus();
      const data = getData();
      const passed = status === 403 && data.error?.includes('approval');
      addResult(8, 'Pending account cannot access its dashboard', passed,
        `Status: ${status}, Error: "${data.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Approved volunteer reaches volunteer access
    // -------------------------------------------------------------------------
    {
      // Approve volunteer
      await User.updateOne({ email: volunteerEmail }, { status: 'approved' });
      const volUser = await User.findOne({ email: volunteerEmail });
      const token = generateToken(String(volUser?._id), 'volunteer');

      const { req, res, getStatus } = mockReqRes({ authorization: `Bearer ${token}` });
      let protectPassed = false;
      await protect(req, res, () => { protectPassed = true; });

      let authorizePassed = false;
      const volAuthorize = authorize('volunteer');
      await volAuthorize(req, res, () => { authorizePassed = true; });

      const passed = protectPassed && authorizePassed;
      addResult(9, 'Approved volunteer reaches /volunteer/dashboard', passed,
        `Volunteer token authorized for 'volunteer' scope (status: approved)`);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Approved NGO reaches NGO access
    // -------------------------------------------------------------------------
    {
      await User.updateOne({ email: ngoEmail }, { status: 'approved' });
      const ngoUser = await User.findOne({ email: ngoEmail });
      const token = generateToken(String(ngoUser?._id), 'ngo');

      const { req, res } = mockReqRes({ authorization: `Bearer ${token}` });
      let protectPassed = false;
      await protect(req, res, () => { protectPassed = true; });

      let authorizePassed = false;
      const ngoAuthorize = authorize('ngo');
      await ngoAuthorize(req, res, () => { authorizePassed = true; });

      const passed = protectPassed && authorizePassed;
      addResult(10, 'Approved NGO reaches /ngo/dashboard', passed,
        `NGO token authorized for 'ngo' scope (status: approved)`);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Approved rescue user reaches rescue access
    // -------------------------------------------------------------------------
    {
      await User.updateOne({ email: rescueEmail }, { status: 'approved' });
      const rscUser = await User.findOne({ email: rescueEmail });
      const token = generateToken(String(rscUser?._id), 'rescue');

      const { req, res } = mockReqRes({ authorization: `Bearer ${token}` });
      let protectPassed = false;
      await protect(req, res, () => { protectPassed = true; });

      let authorizePassed = false;
      const rscAuthorize = authorize('rescue');
      await rscAuthorize(req, res, () => { authorizePassed = true; });

      const passed = protectPassed && authorizePassed;
      addResult(11, 'Approved rescue user reaches /rescue/dashboard', passed,
        `Rescue squad token authorized for 'rescue' scope (status: approved)`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Admin reaches admin access
    // -------------------------------------------------------------------------
    {
      let adminUser = await User.findOne({ roleName: 'admin', status: 'approved' });
      if (!adminUser) {
        adminUser = await User.create({
          firstName: 'HQ',
          lastName: 'Admin',
          email: `admin-${ts}@relief.org`,
          password: 'Password123!',
          roleName: 'admin',
          role: 'admin',
          status: 'approved'
        });
      }
      const token = generateToken(String(adminUser._id), 'admin');

      const { req, res } = mockReqRes({ authorization: `Bearer ${token}` });
      let protectPassed = false;
      await protect(req, res, () => { protectPassed = true; });

      let authorizePassed = false;
      const adminAuthorize = authorize('admin');
      await adminAuthorize(req, res, () => { authorizePassed = true; });

      const passed = protectPassed && authorizePassed;
      addResult(12, 'Admin reaches /admin/dashboard', passed,
        `Admin account verified and authorized for 'admin' scope`);
    }

    // -------------------------------------------------------------------------
    // TEST 13: Volunteer cannot access /admin/dashboard
    // -------------------------------------------------------------------------
    {
      const volUser = await User.findOne({ email: volunteerEmail });
      const token = generateToken(String(volUser?._id), 'volunteer');

      const { req, res, getStatus, getData } = mockReqRes({ authorization: `Bearer ${token}` });
      await protect(req, res, () => {});

      const adminAuthorize = authorize('admin');
      let nextCalled = false;
      await adminAuthorize(req, res, () => { nextCalled = true; });

      const status = getStatus();
      const passed = !nextCalled && status === 403;
      addResult(13, 'Volunteer cannot access /admin/dashboard', passed,
        `Status: ${status}, Message: "${getData()?.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 14: NGO cannot access /admin/dashboard
    // -------------------------------------------------------------------------
    {
      const ngoUser = await User.findOne({ email: ngoEmail });
      const token = generateToken(String(ngoUser?._id), 'ngo');

      const { req, res, getStatus, getData } = mockReqRes({ authorization: `Bearer ${token}` });
      await protect(req, res, () => {});

      const adminAuthorize = authorize('admin');
      let nextCalled = false;
      await adminAuthorize(req, res, () => { nextCalled = true; });

      const status = getStatus();
      const passed = !nextCalled && status === 403;
      addResult(14, 'NGO cannot access /admin/dashboard', passed,
        `Status: ${status}, Message: "${getData()?.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 15: Rescue cannot access /admin/dashboard
    // -------------------------------------------------------------------------
    {
      const rscUser = await User.findOne({ email: rescueEmail });
      const token = generateToken(String(rscUser?._id), 'rescue');

      const { req, res, getStatus, getData } = mockReqRes({ authorization: `Bearer ${token}` });
      await protect(req, res, () => {});

      const adminAuthorize = authorize('admin');
      let nextCalled = false;
      await adminAuthorize(req, res, () => { nextCalled = true; });

      const status = getStatus();
      const passed = !nextCalled && status === 403;
      addResult(15, 'Rescue cannot access /admin/dashboard', passed,
        `Status: ${status}, Message: "${getData()?.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 16: Direct API requests from unauthorized roles return 403
    // -------------------------------------------------------------------------
    {
      const volUser = await User.findOne({ email: volunteerEmail });
      const token = generateToken(String(volUser?._id), 'volunteer');

      const { req, res, getStatus } = mockReqRes({ authorization: `Bearer ${token}` });
      await protect(req, res, () => {});

      const ngoOnlyAuthorize = authorize('ngo');
      let nextCalled = false;
      await ngoOnlyAuthorize(req, res, () => { nextCalled = true; });

      const passed = !nextCalled && getStatus() === 403;
      addResult(16, 'Direct API requests from unauthorized roles return 403', passed,
        `Volunteer calling NGO-only route returns HTTP status 403 Forbidden`);
    }

    // -------------------------------------------------------------------------
    // TEST 17: Unauthenticated API requests return 401
    // -------------------------------------------------------------------------
    {
      const { req, res, getStatus, getData } = mockReqRes({});
      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      const passed = !nextCalled && getStatus() === 401;
      addResult(17, 'Unauthenticated API requests return 401', passed,
        `Status: ${getStatus()}, Error: "${getData()?.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 18: Google Sign-In does not allow privilege escalation
    // -------------------------------------------------------------------------
    {
      // Mock Google JWT token payload
      const mockGoogleEmail = `googletest-${ts}@example.com`;
      const fakePayload = Buffer.from(JSON.stringify({
        email: mockGoogleEmail,
        given_name: 'Google',
        family_name: 'Tester'
      })).toString('base64');
      const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${fakePayload}.fakesig`;

      const { req, res, getStatus, getData } = mockReqRes({}, {
        token: fakeJwt,
        intent: 'admin', // Malicious attempt to claim admin via Google!
        role: 'admin'
      });

      await googleAuth(req, res, (() => {}) as any);
      const userInDb = await User.findOne({ email: mockGoogleEmail });

      const passed = userInDb !== null && userInDb.roleName !== 'admin' && userInDb.roleName === 'citizen';
      addResult(18, 'Google Sign-In does not allow privilege escalation', passed,
        `Malicious Google intent: 'admin' -> Stored role: ${userInDb?.roleName} (Escalation blocked!)`);
    }

    // -------------------------------------------------------------------------
    // TEST 19: Suspended users cannot access protected dashboards
    // -------------------------------------------------------------------------
    {
      const suspendedEmail = `suspended-${ts}@relief.org`;
      let roleDoc = await Role.findOne({ name: 'volunteer' });
      if (!roleDoc) roleDoc = await Role.create({ name: 'volunteer', description: 'Volunteer' });
      const suspendedUser = await User.create({
        firstName: 'Bad',
        lastName: 'Actor',
        email: suspendedEmail,
        password: 'Password123!',
        roleName: 'volunteer',
        role: roleDoc._id,
        status: 'suspended'
      });

      const token = generateToken(String(suspendedUser._id), 'volunteer');
      const { req, res, getStatus, getData } = mockReqRes({ authorization: `Bearer ${token}` });

      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      const passed = !nextCalled && getStatus() === 403 && getData()?.error?.includes('suspended');
      addResult(19, 'Suspended users cannot access protected dashboards', passed,
        `Status: ${getStatus()}, Error: "${getData()?.error}"`);
    }

    // -------------------------------------------------------------------------
    // TEST 20: Existing emergency-reporting functionality still works
    // -------------------------------------------------------------------------
    {
      const emergencyCountBefore = await ReliefRequest.countDocuments();
      const { req, res, getStatus, getData } = mockReqRes({}, {
        citizenName: `Verification Victim ${ts}`,
        contact: '+91 99999 12345',
        location: 'Beltola Central Market Flood Zone',
        coordinates: { type: 'Point', coordinates: [91.78, 26.13] },
        requestCategory: ['Food', 'Drinking water'],
        numberOfPeople: 5,
        numberOfChildren: 2,
        numberOfElderly: 1,
        description: 'Flooded ground floor with kids and elderly.'
      });

      await createRequest(req, res);
      const emergencyCountAfter = await ReliefRequest.countDocuments();
      const passed = getStatus() === 201 && emergencyCountAfter === emergencyCountBefore + 1;
      addResult(20, 'Existing emergency-reporting functionality still works', passed,
        `Emergency reported without auth, Total count increased to ${emergencyCountAfter}`);
    }

    // Clean up test records
    await User.deleteMany({ email: { $regex: new RegExp(String(ts)) } });

    console.log('\n============================================================');
    const allPassed = results.every(r => r.passed);
    console.log(`TEST SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} TESTS PASSED`);
    console.log(`OVERALL STATUS: ${allPassed ? 'ALL 20 CHECKS PASSED ✅' : 'FAILURES DETECTED ❌'}`);
    console.log('============================================================\n');

  } catch (err: any) {
    console.error('Test execution failed with error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
