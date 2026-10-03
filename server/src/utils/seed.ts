import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role';
import User from '../models/User';
import FloodIncident from '../models/FloodIncident';
import Shelter from '../models/Shelter';
import ReliefRequest from '../models/ReliefRequest';
import connectDB from '../config/db';

dotenv.config();

const roles = [
  { name: 'Super Admin', description: 'Complete access to the system' },
  { name: 'Government/Admin Officer', description: 'Manage flood incidents, areas, relief, shelters' },
  { name: 'NGO Coordinator', description: 'Manage NGO activities, volunteers, donations' },
  { name: 'Rescue Team', description: 'Manage rescue requests and missions' },
  { name: 'Medical Team', description: 'Manage medical camps and requests' },
  { name: 'Volunteer', description: 'View and accept assigned tasks' },
  { name: 'Donor', description: 'Donate funds and track usage' },
  { name: 'Shelter Manager', description: 'Manage shelter capacity and supplies' },
  { name: 'Citizen', description: 'Submit relief requests, locate shelters' }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});
    await FloodIncident.deleteMany({});
    await Shelter.deleteMany({});
    await ReliefRequest.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Seed roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`Seeded ${createdRoles.length} roles`);
    
    const roleMap: Record<string, mongoose.Types.ObjectId> = {};
    createdRoles.forEach(r => { roleMap[r.name] = r._id as mongoose.Types.ObjectId; });

    // Seed users
    const usersToCreate = [
      { firstName: 'Super', lastName: 'Admin', email: 'admin@floodrelief.demo', password: 'Password123!', role: roleMap['Super Admin'] },
      { firstName: 'Gov', lastName: 'Officer', email: 'officer@floodrelief.demo', password: 'Password123!', role: roleMap['Government/Admin Officer'] },
      { firstName: 'NGO', lastName: 'Coord', email: 'ngo@floodrelief.demo', password: 'Password123!', role: roleMap['NGO Coordinator'] },
      { firstName: 'Rescue', lastName: 'Lead', email: 'rescue@floodrelief.demo', password: 'Password123!', role: roleMap['Rescue Team'] },
      { firstName: 'Medical', lastName: 'Doctor', email: 'medical@floodrelief.demo', password: 'Password123!', role: roleMap['Medical Team'] },
      { firstName: 'Active', lastName: 'Volunteer', email: 'volunteer@floodrelief.demo', password: 'Password123!', role: roleMap['Volunteer'] },
      { firstName: 'Generous', lastName: 'Donor', email: 'donor@floodrelief.demo', password: 'Password123!', role: roleMap['Donor'] },
      { firstName: 'Shelter', lastName: 'Manager', email: 'shelter@floodrelief.demo', password: 'Password123!', role: roleMap['Shelter Manager'] },
      { firstName: 'Local', lastName: 'Citizen', email: 'citizen@floodrelief.demo', password: 'Password123!', role: roleMap['Citizen'] }
    ];

    const users = await User.insertMany(usersToCreate);
    const adminUser = users.find(u => u.email === 'admin@floodrelief.demo');
    const shelterManager = users.find(u => u.email === 'shelter@floodrelief.demo');
    const citizenUser = users.find(u => u.email === 'citizen@floodrelief.demo');

    // Seed Incidents (Assam region coordinates)
    const incident = await FloodIncident.create({
      incidentName: 'Brahmaputra Flash Floods',
      location: 'Guwahati City Center',
      district: 'Kamrup Metropolitan',
      state: 'Assam',
      severity: 'Critical',
      waterLevel: 5.2,
      affectedPopulation: 25000,
      description: 'Severe waterlogging and flash floods in urban areas.',
      status: 'Active',
      emergencyLevel: 5,
      coordinates: { type: 'Point', coordinates: [91.7362, 26.1445] },
      reportedBy: adminUser?._id
    });

    // Seed Shelters
    await Shelter.create({
      name: 'Cotton University Relief Camp',
      address: 'Pan Bazaar, Guwahati',
      coordinates: { type: 'Point', coordinates: [91.7335, 26.1866] },
      contactPerson: 'Manager Name',
      contactNumber: '9876543210',
      capacity: 500,
      currentOccupancy: 378,
      facilities: { food: true, water: true, medicalSupport: true, electricity: true, toilets: true, womenFriendly: true, childFriendly: true, accessibility: false },
      operatingStatus: 'Open',
      managerId: shelterManager?._id
    });

    // Seed Relief Requests
    await ReliefRequest.create({
      citizenName: 'Rahul Das',
      contact: '9876543211',
      location: 'Beltola, Guwahati',
      coordinates: { type: 'Point', coordinates: [91.7963, 26.1306] },
      numberOfPeople: 4,
      numberOfChildren: 2,
      requestCategory: ['Food', 'Drinking water'],
      priority: 'High',
      description: 'Trapped on first floor, need drinking water and food.',
      status: 'Submitted',
      submittedBy: citizenUser?._id,
      incidentId: incident._id
    });

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

