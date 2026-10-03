import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  vehicleNumber: string;
  type: 'Ambulance' | 'Rescue boat' | 'Truck' | 'Van' | 'Bus' | 'Emergency vehicle';
  capacity: number; // people or weight
  status: 'Available' | 'Assigned' | 'On Route' | 'Maintenance' | 'Unavailable';
  currentLocation?: {
    address: string;
    coordinates: number[]; // [longitude, latitude]
  };
  organization: string; // Govt, NGO name, etc.
}

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['Ambulance', 'Rescue boat', 'Truck', 'Van', 'Bus', 'Emergency vehicle'],
      required: true,
    },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'On Route', 'Maintenance', 'Unavailable'],
      default: 'Available',
    },
    currentLocation: {
      address: String,
      coordinates: [Number],
    },
    organization: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>('Vehicle', vehicleSchema);
