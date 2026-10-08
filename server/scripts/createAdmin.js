const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in environment or server/.env.');
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
  node scripts/createAdmin.js <email> <password> [firstName] [lastName]

Example:
  node scripts/createAdmin.js commander@floodrelief.org "StrongSecPass987!" Operations Lead
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

    // Schema definitions for direct standalone script execution
    const roleSchema = new mongoose.Schema({ name: String, description: String });
    const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true, lowercase: true },
      password: { type: String, select: false },
      role: { type: mongoose.Schema.Types.Mixed, ref: 'Role' },
      roleName: String,
      status: String,
      organization: String,
      contactNumber: String
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // 2. Check for duplicate admin
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.role = adminRole._id;
      existingUser.roleName = 'admin';
      existingUser.status = 'approved';
      existingUser.password = hashedPassword;
      await existingUser.save();

      console.log(`\nSUCCESS: Existing user "${email}" updated to APPROVED ADMIN.`);
      console.log(`Role: admin`);
      console.log(`Status: approved`);
    } else {
      const newAdmin = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: adminRole._id,
        roleName: 'admin',
        status: 'approved',
        organization: 'Assam Emergency Operations Center (SEOC)'
      });

      console.log(`\nSUCCESS: Created new APPROVED ADMIN account "${newAdmin.email}".`);
      console.log(`Admin ID: ${newAdmin._id}`);
      console.log(`Role: admin`);
      console.log(`Status: approved`);
    }

    console.log('\nAdmin credentials are ready for use at /login.');
  } catch (err) {
    console.error('Provisioning failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();

