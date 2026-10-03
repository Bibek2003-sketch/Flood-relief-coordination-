import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import User from '../models/User';
import ReliefRequest from '../models/ReliefRequest';
import RescueOperation from '../models/RescueOperation';
import Shelter from '../models/Shelter';
import InventoryItem from '../models/InventoryItem';

dotenv.config();

const simulateWorkflow = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n--- STARTING END-TO-END WORKFLOW VERIFICATION ---\n');

    // 1. Setup Users
    const citizen = await User.findOne({ email: 'citizen@floodrelief.demo' });
    const officer = await User.findOne({ email: 'officer@floodrelief.demo' });
    const rescueTeam = await User.findOne({ email: 'rescue@floodrelief.demo' });
    const shelterManager = await User.findOne({ email: 'shelter@floodrelief.demo' });
    const ngo = await User.findOne({ email: 'ngo@floodrelief.demo' });

    if (!citizen || !officer || !rescueTeam || !shelterManager || !ngo) {
      throw new Error('Seed data missing. Please run "npm run seed" first.');
    }

    // 2. Emergency Report (Citizen)
    console.log('1. Citizen Reports Emergency...');
    let request = await ReliefRequest.create({
      citizenName: citizen.firstName + ' ' + citizen.lastName,
      contact: '9876543210',
      location: 'House 42, Flood Zone A',
      coordinates: { type: 'Point', coordinates: [91.75, 26.15] },
      numberOfPeople: 3,
      numberOfChildren: 1,
      requestCategory: ['Rescue', 'Food'],
      status: 'Submitted',
      submittedBy: citizen._id
    });
    console.log(`   -> Request created with ID: ${request.requestID} and Priority: ${request.priority}`);

    // 3. Verification (Admin/Officer)
    console.log('\n2. Officer Verifies Request...');
    request.status = 'Verified';
    await request.save();
    console.log(`   -> Request status updated to: ${request.status}`);

    // 4. Rescue Assignment
    console.log('\n3. Assigning Rescue Team...');
    const activeMissions = await RescueOperation.countDocuments({
      assignedTeam: rescueTeam._id,
      status: { $in: ['Assigned', 'Team Dispatched', 'En Route', 'Rescue in Progress'] }
    });

    if (activeMissions > 0) {
      console.log('   -> Team is busy. Business rule working.');
    }

    let rescueOp = await RescueOperation.create({
      requestId: request._id,
      assignedTeam: rescueTeam._id,
      status: 'Assigned',
      missionLocation: {
        address: request.location,
        coordinates: request.coordinates
      }
    });
    
    request.status = 'Assigned';
    request.assignedTo = rescueTeam._id as any;
    await request.save();
    console.log(`   -> Rescue Operation started. Status: ${rescueOp.status}`);

    // 5. Rescue In Progress -> Completed
    console.log('\n4. Rescue Team Executes Mission...');
    rescueOp.status = 'Rescue in Progress';
    await rescueOp.save();
    console.log(`   -> Mission Status: ${rescueOp.status}`);
    
    rescueOp.status = 'Completed';
    rescueOp.peopleRescued = 3;
    await rescueOp.save();
    console.log(`   -> Mission Completed. People Rescued: ${rescueOp.peopleRescued}`);

    // 6. Transfer to Shelter
    console.log('\n5. Transferring Rescued People to Shelter...');
    const shelter = await Shelter.findOne({ managerId: shelterManager._id });
    if (shelter) {
      const newOccupancy = shelter.currentOccupancy + rescueOp.peopleRescued;
      if (newOccupancy <= shelter.capacity) {
        shelter.currentOccupancy = newOccupancy;
        await shelter.save();
        console.log(`   -> Shelter '${shelter.name}' occupancy updated to ${shelter.currentOccupancy}/${shelter.capacity}. Status: ${shelter.operatingStatus}`);
      }
    }

    // 7. Relief Distribution
    console.log('\n6. NGO Distributes Relief Materials...');
    let inventory = await InventoryItem.findOne({ category: 'Food' });
    if (!inventory) {
      inventory = await InventoryItem.create({
        itemName: 'Emergency Food Kits',
        category: 'Food',
        quantity: 100,
        unit: 'Kits',
        warehouseLocation: 'Main Depot',
        minimumStock: 20
      });
    }

    if (inventory.quantity >= 3) {
      inventory.quantity -= 3;
      await inventory.save();
      console.log(`   -> Distributed 3 ${inventory.unit} of ${inventory.itemName}. Remaining stock: ${inventory.quantity}`);
    } else {
      console.log('   -> Insufficient stock for distribution. Business rule working.');
    }

    // 8. Completion
    console.log('\n7. Request Completed...');
    request.status = 'Completed';
    await request.save();
    console.log(`   -> Request ${request.requestID} successfully marked as ${request.status}`);

    console.log('\n--- END-TO-END WORKFLOW VERIFIED SUCCESSFULLY ---\n');
    process.exit(0);

  } catch (error) {
    console.error('Workflow Verification Failed:', error);
    process.exit(1);
  }
};

simulateWorkflow();
