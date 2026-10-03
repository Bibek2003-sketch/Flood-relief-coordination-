import mongoose, { Document, Schema } from 'mongoose';

export interface IReliefRequest extends Document {
  requestID: string;
  citizenName: string;
  contact: string;
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
  description?: string;
  photos?: string[];
  status: 'Submitted' | 'Under Review' | 'Verified' | 'Assigned' | 'In Progress' | 'Completed' | 'Rejected';
  submittedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId; // Team/Volunteer
  incidentId?: mongoose.Types.ObjectId;
}

const reliefRequestSchema = new Schema<IReliefRequest>(
  {
    requestID: { type: String, unique: true },
    citizenName: { type: String, required: true },
    contact: { type: String, required: true },
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
    description: { type: String },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Completed', 'Rejected'],
      default: 'Submitted',
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    incidentId: { type: Schema.Types.ObjectId, ref: 'FloodIncident' },
  },
  { timestamps: true }
);

// Pre-save hook to generate request ID and calculate priority if not explicitly set
reliefRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate simple ID
    this.requestID = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Auto priority calculation logic (simple example)
    if (this.numberOfDisabled > 0 || this.numberOfElderly > 2 || this.requestCategory.includes('Rescue') || this.requestCategory.includes('Medical assistance')) {
      this.priority = 'Critical';
    } else if (this.numberOfChildren > 2 || this.numberOfPeople > 10) {
      this.priority = 'High';
    }
  }
  next();
});

reliefRequestSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IReliefRequest>('ReliefRequest', reliefRequestSchema);
