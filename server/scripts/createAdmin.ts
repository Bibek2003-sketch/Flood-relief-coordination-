import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User';
import Role from '../src/models/Role';

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const rawPassword = process.argv[3] || process.env.ADMIN_PASSWORD || '';
  const firstName = process.argv[4] || 'System';
  const lastName = process.argv[5] || 'Administrator';

  if (!email || !rawPassword) {
    console.log(`
========================================================================
FloodRelief Controlled Admin Provisioning Utility
========================================================================
Usage:
  npx tsx scripts/createAdmin.ts <email> <password> [firstName] [lastName]

Example:
  npx tsx scripts/createAdmin.ts ops.admin@floodrelief.org "StrongSecPass987!" Operations Lead
========================================================================
`);
    process.exit(1);
  }

  if (rawPassword.length < 8) {
    console.error('ERROR: Admin password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    // 1. Locate or create Super Admin role document
    let adminRole = await Role.findOne({
      name: { $in: ['Super Admin', 'admin', 'Government/Admin Officer'] }
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Super Admin',
        description: 'Complete system-wide administrative control'
      });
      console.log('Created Super Admin role record.');
    }

    // 2. Check for duplicate admin
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Re-provision existing user as an approved Admin with new hashed password
      existingUser.role = adminRole._id as any;
      existingUser.roleName = 'admin';
      existingUser.status = 'approved';
      existingUser.password = rawPassword; // User model pre-save hook will hash it with bcrypt
      await existingUser.save();

      console.log(`\nSUCCESS: Existing user "${email}" updated to APPROVED ADMIN.`);
      console.log(`Role: admin`);
      console.log(`Status: approved`);
    } else {
      // 3. Create brand-new admin record
      const newAdmin = await User.create({
        firstName,
        lastName,
        email,
        password: rawPassword, // User model pre-save hook automatically hashes with bcryptjs
        role: adminRole._id,
        roleName: 'admin',
        status: 'approved'
      });

      console.log(`\nSUCCESS: Created new APPROVED ADMIN account "${newAdmin.email}".`);
      console.log(`Admin ID: ${newAdmin._id}`);
      console.log(`Status: approved`);
    }

    console.log('\nAdmin credentials are ready for use at /login.');
  } catch (err: any) {
    console.error('Provisioning failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();

