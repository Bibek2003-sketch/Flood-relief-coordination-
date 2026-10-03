import mongoose, { Document, Schema } from 'mongoose';

export interface IRescueOperation extends Document {
  requestId?: mongoose.Types.ObjectId; // Optional, might be direct dispatch
  incidentId?: mongoose.Types.ObjectId;
  assignedTeam: mongoose.Types.ObjectId; // User with Rescue Team role
  vehicleId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  status: 'Pending' | 'Assigned' | 'Team Dispatched' | 'En Route' | 'Rescue in Progress' | 'Completed' | 'Cancelled';
  peopleRescued: number;
  missionLocation: {
    address: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
  };
  notes?: string;
}

const rescueOperationSchema = new Schema<IRescueOperation>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'ReliefRequest' },
    incidentId: { type: Schema.Types.ObjectId, ref: 'FloodIncident' },
    assignedTeam: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'Team Dispatched', 'En Route', 'Rescue in Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    peopleRescued: { type: Number, default: 0 },
    missionLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

rescueOperationSchema.index({ 'missionLocation.coordinates': '2dsphere' });

export default mongoose.model<IRescueOperation>('RescueOperation', rescueOperationSchema);
