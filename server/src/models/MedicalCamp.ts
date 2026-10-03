import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalCamp extends Document {
  name: string;
  address: string;
  coordinates: {
    type: string;
    coordinates: number[];
  };
  doctorsAvailable: number;
  capacity: number;
  operatingHours: string;
  emergencyStatus: 'Normal' | 'High Alert' | 'Overwhelmed';
  managerId: mongoose.Types.ObjectId;
}

const medicalCampSchema = new Schema<IMedicalCamp>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    doctorsAvailable: { type: Number, default: 0 },
    capacity: { type: Number, required: true },
    operatingHours: { type: String, default: '24/7' },
    emergencyStatus: {
      type: String,
      enum: ['Normal', 'High Alert', 'Overwhelmed'],
      default: 'Normal',
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

medicalCampSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IMedicalCamp>('MedicalCamp', medicalCampSchema);
