import mongoose, { Document, Schema } from 'mongoose';

export interface IReliefRequest extends Document {
  requestID: string;
  requestId?: string;
  citizenName: string;
  contact: string;
  contactEmail?: string;
  location: string;
  coordinates: {
    type: string;
    coordinates: number[];
  };
  numberOfPeople: number;
  numberOfChildren: number;
  numberOfElderly: number;
  numberOfDisabled: number;
  requestCategory: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  preferredLanguage?: 'en' | 'hi' | 'bn' | 'br' | 'as';
  description?: string;
  photos?: string[];
  status: string;
  submittedBy?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedTeam?: mongoose.Types.ObjectId;
  assignedVolunteer?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  verifiedAt?: Date;
  resolvedAt?: Date;
  notes?: string;
  incidentId?: mongoose.Types.ObjectId;
  timeline?: Array<{
    status: string;
    title?: string;
    note?: string;
    timestamp: Date;
    updatedBy?: mongoose.Types.ObjectId;
    updatedByName?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const reliefRequestSchema = new Schema<IReliefRequest>(
  {
    requestID: { type: String, unique: true, index: true },
    citizenName: { type: String, default: 'Citizen' },
    contact: { type: String, required: true },
    contactEmail: { type: String },
    location: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    numberOfPeople: { type: Number, required: true, min: 1 },
    numberOfChildren: { type: Number, default: 0 },
    numberOfElderly: { type: Number, default: 0 },
    numberOfDisabled: { type: Number, default: 0 },
    requestCategory: [{ 
      type: String, 
      enum: ['Food', 'Drinking water', 'Medicine', 'Rescue', 'Shelter', 'Clothing', 'Baby supplies', 'Sanitary products', 'Electricity', 'Transportation', 'Medical assistance', 'Other emergency needs']
    }],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'bn', 'br', 'as'],
      default: 'en',
      index: true
    },
    description: { type: String },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: [
        'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED',
        'RESCUE_IN_PROGRESS', 'DELAYED', 'RESOLVED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'DUPLICATE',
        'REOPENED', 'INFO_REQUIRED',
        'Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Completed', 'Rejected'
      ],
      default: 'SUBMITTED',
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTeam: { type: Schema.Types.ObjectId, ref: 'RescueTeam' },
    assignedVolunteer: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    verifiedAt: { type: Date },
    resolvedAt: { type: Date },
    notes: { type: String },
    incidentId: { type: Schema.Types.ObjectId, ref: 'FloodIncident' },
    timeline: [{
      status: { type: String, required: true },
      title: { type: String },
      note: { type: String },
      timestamp: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      updatedByName: { type: String }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reliefRequestSchema.virtual('requestId').get(function() {
  return this.requestID;
});

// Pre-save hook to generate request ID and calculate priority if not explicitly set
reliefRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.requestID) {
    const year = new Date().getFullYear();
    const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
    this.requestID = `FLD-${year}-${randomFiveDigits}`;
  }
  
  if (this.isNew) {
    // Auto priority calculation
    if (this.numberOfDisabled > 0 || this.numberOfElderly > 2 || this.requestCategory.includes('Rescue') || this.requestCategory.includes('Medical assistance')) {
      this.priority = 'Critical';
    } else if (this.numberOfChildren > 2 || this.numberOfPeople > 10) {
      this.priority = 'High';
    }

    // Initialize first timeline entry
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'SUBMITTED',
        title: 'Emergency Distress Call Logged',
        note: `Initial SOS report submitted for ${this.numberOfPeople} people. Auto-priority set to ${this.priority}.`,
        timestamp: new Date()
      }];
    }
  }
  next();
});

reliefRequestSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IReliefRequest>('ReliefRequest', reliefRequestSchema);
