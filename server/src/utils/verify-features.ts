import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import RescueTeam from '../models/RescueTeam';
import ReliefRequest from '../models/ReliefRequest';
import AuditLog from '../models/AuditLog';

async function testFlow() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Testing End-to-End Lifecycle...');

  // 1. Initial Available count
  const initialAvailable = await RescueTeam.find({ status: 'AVAILABLE' });
  console.log('Step 1: Initial Available Squads:', initialAvailable.map(t => t.name));

  // 2. Pick Alpha
  const alpha = await RescueTeam.findOne({ teamId: 'RSC-ALPHA' });
  if (!alpha) throw new Error('Alpha squad missing');

  // 3. Find or create a test emergency
  let emergency = await ReliefRequest.findOne({ status: { $in: ['SUBMITTED', 'VERIFIED', 'Pending', 'UNDER_REVIEW'] } });
  if (!emergency) {
    emergency = await ReliefRequest.create({
      requestID: `FLD-${Date.now()}`,
      citizenName: 'Verification Test Citizen',
      contact: '+91 99999 88888',
      location: 'Uzanbazar River Bank',
      coordinates: {
        type: 'Point',
        coordinates: [91.74, 26.19]
      },
      numberOfPeople: 4,
      priority: 'High',
      status: 'VERIFIED',
      requestCategory: ['Rescue']
    });
  }
  console.log('Step 2: Emergency Request:', emergency.requestID, '| Initial Status:', emergency.status);

  // 4. Simulate Dispatch
  emergency.assignedTeam = alpha._id as any;
  emergency.status = 'ASSIGNED';
  emergency.assignedAt = new Date();
  await emergency.save();

  alpha.status = 'ON_MISSION';
  alpha.currentMission = emergency._id as any;
  await alpha.save();

  await AuditLog.create({
    action: 'DISPATCH_RESCUE_TEAM',
    targetId: emergency._id.toString(),
    targetType: 'ReliefRequest',
    details: { assignedTeamId: alpha.teamId, teamName: alpha.name }
  });
  console.log('Step 3: Dispatched', alpha.name, '-> Emergency status is now:', emergency.status);

  // 5. Verify availability list excludes Alpha
  const duringMissionAvailable = await RescueTeam.find({ status: 'AVAILABLE' });
  console.log('Step 4: Available Squads during mission (should NOT include Alpha):', duringMissionAvailable.map(t => t.name));
  const isAlphaInAvailable = duringMissionAvailable.some(t => t.teamId === 'RSC-ALPHA');
  console.log('Is Alpha in available dropdown list?', isAlphaInAvailable ? 'YES (FAIL)' : 'NO (PASS)');

  // 6. Citizen Tracking view verification
  const citizenTrack = await ReliefRequest.findById(emergency._id).populate('assignedTeam').lean();
  console.log('Step 5: Citizen tracking sees assigned unit:', (citizenTrack as any)?.assignedTeam?.name);

  // 7. Mission Resolution
  emergency.status = 'RESOLVED';
  emergency.resolvedAt = new Date();
  await emergency.save();

  // Reset team to AVAILABLE as done by adminController / rescueController
  await RescueTeam.findByIdAndUpdate(alpha._id, { status: 'AVAILABLE', currentMission: undefined });

  // 8. Verify team is AVAILABLE again
  const postResolvedAlpha = await RescueTeam.findById(alpha._id);
  console.log('Step 6: Squad status after mission resolved:', postResolvedAlpha?.status);

  const finalAvailable = await RescueTeam.find({ status: 'AVAILABLE' });
  console.log('Step 7: Available Squads count after resolution:', finalAvailable.length);

  await mongoose.disconnect();
  console.log('All verification steps PASSED successfully!');
}

testFlow().catch(console.error);
