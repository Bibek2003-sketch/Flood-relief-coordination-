import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shelter from './models/Shelter';

dotenv.config();

const shelters = [
  {
    name: 'Cotton University Relief Camp',
    address: 'Pan Bazaar, Guwahati',
    coordinates: { type: 'Point', coordinates: [91.7335, 26.1866] },
    contactPerson: 'Admin',
    contactNumber: '9999999999',
    capacity: 500,
    currentOccupancy: 378,
    facilities: { food: true, water: true, medicalSupport: true, womenFriendly: true },
    operatingStatus: 'Open'
  },
  {
    name: 'Dispur Government School',
    address: 'Dispur, Guwahati',
    coordinates: { type: 'Point', coordinates: [91.7915, 26.1433] },
    contactPerson: 'Admin',
    contactNumber: '9999999999',
    capacity: 800,
    currentOccupancy: 800,
    facilities: { food: true, water: true, medicalSupport: true },
    operatingStatus: 'Full'
  },
  {
    name: 'Kamakhya Temple Relief Center',
    address: 'Kamakhya, Guwahati',
    coordinates: { type: 'Point', coordinates: [91.7046, 26.1673] },
    contactPerson: 'Admin',
    contactNumber: '9999999999',
    capacity: 300,
    currentOccupancy: 120,
    facilities: { food: true, water: true },
    operatingStatus: 'Open'
  },
  {
    name: 'Jalukbari University Camp',
    address: 'Jalukbari, Guwahati',
    coordinates: { type: 'Point', coordinates: [91.6622, 26.1524] },
    contactPerson: 'Admin',
    contactNumber: '9999999999',
    capacity: 1000,
    currentOccupancy: 450,
    facilities: { food: true, water: true, medicalSupport: true, childFriendly: true },
    operatingStatus: 'Open'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');

    await Shelter.deleteMany({});
    console.log('Old shelters cleared');

    await Shelter.insertMany(shelters);
    console.log('New shelters inserted!');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
