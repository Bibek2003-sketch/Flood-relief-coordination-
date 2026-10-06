import mongoose, { Document, Schema } from 'mongoose';

export interface IRescueTeam extends Document {
  teamId: string;
  name: string;
  teamLeader: string;
  numberOfMembers: number;
  contactNumber: string;
  currentLocation: string;
  skills: string[];
  vehicleAssigned: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_MISSION' | 'MAINTENANCE';
  currentMission?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rescueTeamSchema = new Schema<IRescueTeam>(
  {
    teamId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    teamLeader: { type: String, required: true, trim: true },
    numberOfMembers: { type: Number, required: true, default: 4 },
    contactNumber: { type: String, required: true, trim: true },
    currentLocation: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    vehicleAssigned: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'ON_MISSION', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    currentMission: { type: Schema.Types.ObjectId, ref: 'ReliefRequest' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model<IRescueTeam>('RescueTeam', rescueTeamSchema);
