import mongoose, { Document, Schema } from 'mongoose';

export interface IFloodIncident extends Document {
  incidentName: string;
  location: string;
  district: string;
  state: string;
  startDate: Date;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  waterLevel?: number;
  affectedPopulation?: number;
  description: string;
  status: 'Monitoring' | 'Warning' | 'Active' | 'Critical' | 'Recovering' | 'Resolved';
  emergencyLevel: number;
  weatherInformation?: string;
  images?: string[];
  coordinates: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  reportedBy: mongoose.Types.ObjectId;
}

const floodIncidentSchema = new Schema<IFloodIncident>(
  {
    incidentName: { type: String, required: true },
    location: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    startDate: { type: Date, required: true, default: Date.now },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
    waterLevel: { type: Number },
    affectedPopulation: { type: Number },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Monitoring', 'Warning', 'Active', 'Critical', 'Recovering', 'Resolved'],
      default: 'Active',
    },
    emergencyLevel: { type: Number, default: 1 },
    weatherInformation: { type: String },
    images: [{ type: String }],
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

floodIncidentSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IFloodIncident>('FloodIncident', floodIncidentSchema);
