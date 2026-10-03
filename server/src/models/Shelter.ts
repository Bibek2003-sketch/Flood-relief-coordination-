import mongoose, { Document, Schema } from 'mongoose';

export interface IShelter extends Document {
  name: string;
  address: string;
  coordinates: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  contactPerson: string;
  contactNumber: string;
  capacity: number;
  currentOccupancy: number;
  facilities: {
    food: boolean;
    water: boolean;
    medicalSupport: boolean;
    electricity: boolean;
    toilets: boolean;
    womenFriendly: boolean;
    childFriendly: boolean;
    accessibility: boolean;
  };
  operatingStatus: 'Open' | 'Full' | 'Closed' | 'Maintenance';
  managerId?: mongoose.Types.ObjectId;
}

const shelterSchema = new Schema<IShelter>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    facilities: {
      food: { type: Boolean, default: false },
      water: { type: Boolean, default: false },
      medicalSupport: { type: Boolean, default: false },
      electricity: { type: Boolean, default: false },
      toilets: { type: Boolean, default: false },
      womenFriendly: { type: Boolean, default: false },
      childFriendly: { type: Boolean, default: false },
      accessibility: { type: Boolean, default: false },
    },
    operatingStatus: {
      type: String,
      enum: ['Open', 'Full', 'Closed', 'Maintenance'],
      default: 'Open',
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

shelterSchema.virtual('availableCapacity').get(function () {
  return this.capacity - this.currentOccupancy;
});

// Update operating status automatically
shelterSchema.pre('save', function(next) {
  if (this.currentOccupancy >= this.capacity && this.operatingStatus === 'Open') {
    this.operatingStatus = 'Full';
  } else if (this.currentOccupancy < this.capacity && this.operatingStatus === 'Full') {
    this.operatingStatus = 'Open';
  }
  next();
});

shelterSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IShelter>('Shelter', shelterSchema);
