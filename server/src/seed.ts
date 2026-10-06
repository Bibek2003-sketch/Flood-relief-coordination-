import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shelter from './models/Shelter';
import User from './models/User';
import ReliefRequest from './models/ReliefRequest';
import Task from './models/Task';
import InventoryItem from './models/InventoryItem';
import { ensureDemoRescueTeams } from './utils/rescueTeamSeeder';

dotenv.config();

const shelters = [
  {
    name: 'Gauhati University Indoor Stadium Relief Camp',
    address: 'Jalukbari, Guwahati, Assam',
    coordinates: { type: 'Point', coordinates: [91.6622, 26.1524] },
    contactPerson: 'Dr. M. K. Sarma (Camp Incharge)',
    contactNumber: '+91 94350 12345',
    capacity: 1200,
    currentOccupancy: 450,
    facilities: { food: true, water: true, medicalSupport: true, womenFriendly: true, childFriendly: true, electricity: true, toilets: true, accessibility: true },
    operatingStatus: 'Open'
  },
  {
    name: 'Cotton University Panbazar Relief Center',
    address: 'Pan Bazaar, Guwahati, Assam',
    coordinates: { type: 'Point', coordinates: [91.7335, 26.1866] },
    contactPerson: 'Prof. Anup Das (Nodal Officer)',
    contactNumber: '+91 98640 23456',
    capacity: 650,
    currentOccupancy: 380,
    facilities: { food: true, water: true, medicalSupport: true, womenFriendly: true, toilets: true, electricity: true },
    operatingStatus: 'Open'
  },
  {
    name: 'Dispur Government Higher Secondary School',
    address: 'Dispur Last Gate, Guwahati, Assam',
    coordinates: { type: 'Point', coordinates: [91.7915, 26.1433] },
    contactPerson: 'Ruma Hazarika (Principal)',
    contactNumber: '+91 94351 34567',
    capacity: 800,
    currentOccupancy: 800,
    facilities: { food: true, water: true, medicalSupport: true, electricity: true, toilets: true },
    operatingStatus: 'Full'
  },
  {
    name: 'Kamakhya High School Relief Center',
    address: 'Kamakhya Foothills, Guwahati, Assam',
    coordinates: { type: 'Point', coordinates: [91.7046, 26.1673] },
    contactPerson: 'Biren Kalita (Relief Officer)',
    contactNumber: '+91 97060 45678',
    capacity: 450,
    currentOccupancy: 180,
    facilities: { food: true, water: true, medicalSupport: true, childFriendly: true, toilets: true },
    operatingStatus: 'Open'
  },
  {
    name: 'Sarusajai Indoor Stadium Relief Hub',
    address: 'National Highway 37, Lokhra, Guwahati, Assam',
    coordinates: { type: 'Point', coordinates: [91.7362, 26.1132] },
    contactPerson: 'SDRF Base Officer Guwahati',
    contactNumber: '+91 98540 56789',
    capacity: 2500,
    currentOccupancy: 950,
    facilities: { food: true, water: true, medicalSupport: true, womenFriendly: true, childFriendly: true, electricity: true, toilets: true, accessibility: true },
    operatingStatus: 'Open'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');

    // 1. Seed Shelters
    await Shelter.deleteMany({});
    await Shelter.insertMany(shelters);
    console.log('Shelters seeded successfully');

    // 2. Seed Users
    const demoUsers = [
      {
        email: 'admin@floodrelief.demo',
        password: 'Password123!',
        firstName: 'Central',
        lastName: 'Commander',
        role: 'admin',
        roleName: 'admin',
        status: 'approved',
        organization: 'State Disaster Management Authority',
        contactNumber: '+91 98640 10001'
      },
      {
        email: 'rescue@floodrelief.demo',
        password: 'Password123!',
        firstName: 'Quick Response',
        lastName: 'Unit-1',
        role: 'rescue',
        roleName: 'rescue',
        status: 'approved',
        organization: 'National Disaster Response Force (NDRF)',
        contactNumber: '+91 98640 20002'
      },
      {
        email: 'volunteer@floodrelief.demo',
        password: 'Password123!',
        firstName: 'Aarav',
        lastName: 'Sharma',
        role: 'volunteer',
        roleName: 'volunteer',
        status: 'approved',
        organization: 'Youth Relief Brigade',
        contactNumber: '+91 98640 30003',
        skills: ['First Aid', 'Boat Handling', 'Food Distribution'],
        isAvailable: true
      },
      {
        email: 'ngo@floodrelief.demo',
        password: 'Password123!',
        firstName: 'Relief',
        lastName: 'Coordinator',
        role: 'ngo',
        roleName: 'ngo',
        status: 'approved',
        organization: 'Red Cross Flood Response Network',
        contactNumber: '+91 98640 40004'
      }
    ];

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.firstName = u.firstName;
        existing.lastName = u.lastName;
        existing.role = u.role;
        existing.roleName = u.roleName as any;
        existing.status = u.status as any;
        existing.organization = u.organization;
        existing.password = u.password;
        await existing.save();
        console.log(`Updated user: ${u.email}`);
      } else {
        await User.create(u);
        console.log(`Created user: ${u.email}`);
      }
    }

    const rescueUser = await User.findOne({ email: 'rescue@floodrelief.demo' });
    const ngoUser = await User.findOne({ email: 'ngo@floodrelief.demo' });
    const volunteerUser = await User.findOne({ email: 'volunteer@floodrelief.demo' });

    // 3. Seed Sample Emergencies
    const existingEmergencies = await ReliefRequest.countDocuments();
    if (existingEmergencies === 0) {
      const sampleEmergencies = [
        {
          name: 'Hitesh Barua',
          contact: '+91 98540 11223',
          contactEmail: 'hitesh.barua@example.com',
          location: 'Ward 4, Anil Nagar, Guwahati, Assam',
          latitude: 26.1785,
          longitude: 91.7692,
          numberOfPeople: 5,
          children: 2,
          elderly: 1,
          disabled: 0,
          priority: 'Critical',
          status: 'ASSIGNED',
          assignedTeam: rescueUser?._id,
          requestCategory: ['Immediate Evacuation', 'Medical Attention'],
          notes: 'Water level reached second floor balcony. Elderly grandmother needs oxygen support.'
        },
        {
          name: 'Sunita Gogoi',
          contact: '+91 97060 22334',
          location: 'Tarun Nagar Bye-lane 2, Guwahati',
          latitude: 26.1620,
          longitude: 91.7750,
          numberOfPeople: 4,
          children: 1,
          elderly: 2,
          disabled: 1,
          priority: 'High',
          status: 'VERIFIED',
          requestCategory: ['Food / Clean Water', 'Shelter Required'],
          notes: 'Ground floor submerged completely. Stranded on roof with drinking water running out.'
        },
        {
          name: 'Biren Kalita',
          contact: '+91 94350 33445',
          location: 'Hatigaon Chariali, Guwahati',
          latitude: 26.1380,
          longitude: 91.7920,
          numberOfPeople: 8,
          children: 3,
          elderly: 2,
          disabled: 0,
          priority: 'Medium',
          status: 'SUBMITTED',
          requestCategory: ['Food / Clean Water', 'Medicines'],
          notes: 'Water logged street. Need rations and infant formula.'
        }
      ];

      for (const e of sampleEmergencies) {
        await ReliefRequest.create(e);
      }
      console.log('Sample emergencies seeded with FLD request IDs');
    }

    // 4. Seed Volunteer Tasks
    await Task.deleteMany({});
    const sampleTasks = [
      {
        title: 'Drinking Water & Rations Distribution at Jalukbari Camp',
        description: 'Distribute 500 packets of cooked food and clean drinking water jerrycans to sheltered families.',
        taskType: 'Food distribution',
        priority: 'High',
        location: 'Jalukbari Relief Camp, Guwahati',
        coordinates: { type: 'Point', coordinates: [91.6622, 26.1524] },
        status: 'AVAILABLE'
      },
      {
        title: 'Emergency Medicines & ORS Packet Delivery',
        description: 'Deliver water purification tablets, ORS, and fever medication to community center in Panbazar.',
        taskType: 'Medicine delivery',
        priority: 'High',
        location: 'Panbazar Community Hall, Guwahati',
        coordinates: { type: 'Point', coordinates: [91.7335, 26.1866] },
        status: 'AVAILABLE'
      },
      {
        title: 'Temporary Shelter Setup & Bedding Allocation',
        description: 'Assist arriving families with mattress arrangement and registration checklist verification.',
        taskType: 'Shelter assistance',
        priority: 'Medium',
        location: 'Sarusajai Indoor Stadium, Lokhra',
        coordinates: { type: 'Point', coordinates: [91.7362, 26.1132] },
        assignedVolunteer: volunteerUser?._id,
        assignedVolunteerName: `${volunteerUser?.firstName} ${volunteerUser?.lastName}`,
        status: 'IN_PROGRESS'
      }
    ];
    await Task.insertMany(sampleTasks);
    console.log('Sample volunteer tasks seeded');

    // 5. Seed NGO Inventory
    if (ngoUser) {
      await InventoryItem.deleteMany({ organization: ngoUser._id });
      const sampleInventory = [
        {
          itemName: 'Emergency Drinking Water (20L Cans)',
          category: 'Water',
          quantity: 450,
          unit: 'cans',
          warehouseLocation: 'Red Cross Central Warehouse, Beltola',
          minimumStock: 100,
          organization: ngoUser._id,
          organizationName: ngoUser.organization
        },
        {
          itemName: 'Ready-to-Eat Meal Packets (Khichdi & Biscuits)',
          category: 'Food',
          quantity: 1200,
          unit: 'packets',
          warehouseLocation: 'Dispur Logistics Depot',
          minimumStock: 300,
          organization: ngoUser._id,
          organizationName: ngoUser.organization
        },
        {
          itemName: 'Water Purification Tablets (Halazone 100s)',
          category: 'Medicine',
          quantity: 80,
          unit: 'boxes',
          warehouseLocation: 'Red Cross Medical Cache',
          minimumStock: 150, // Low stock on purpose
          organization: ngoUser._id,
          organizationName: ngoUser.organization
        },
        {
          itemName: 'Thermal Blankets & Mats',
          category: 'Blankets',
          quantity: 350,
          unit: 'pieces',
          warehouseLocation: 'Red Cross Central Warehouse, Beltola',
          minimumStock: 50,
          organization: ngoUser._id,
          organizationName: ngoUser.organization
        }
      ];
      await InventoryItem.insertMany(sampleInventory);
      console.log('Sample NGO inventory seeded');
    }

    // 6. Seed Demo Rescue Teams
    await ensureDemoRescueTeams();
    console.log('Sample Rescue Squads seeded');

    console.log('All seed data completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
