import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  taskType: 'Food distribution' | 'Water distribution' | 'Medicine delivery' | 'Shelter assistance' | 'Transportation assistance' | 'Relief material delivery' | 'General assistance';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  coordinates?: {
    type: string;
    coordinates: number[];
  };
  assignedVolunteer?: mongoose.Types.ObjectId;
  assignedVolunteerName?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  relatedRequestId?: mongoose.Types.ObjectId;
  relatedShelterId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    taskType: {
      type: String,
      enum: [
        'Food distribution',
        'Water distribution',
        'Medicine delivery',
        'Shelter assistance',
        'Transportation assistance',
        'Relief material delivery',
        'General assistance'
      ],
      default: 'Food distribution'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    location: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [91.7362, 26.1445] }
    },
    assignedVolunteer: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedVolunteerName: { type: String },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'AVAILABLE'
    },
    relatedRequestId: { type: Schema.Types.ObjectId, ref: 'ReliefRequest' },
    relatedShelterId: { type: Schema.Types.ObjectId, ref: 'Shelter' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

taskSchema.index({ 'coordinates.coordinates': '2dsphere' });

export default mongoose.model<ITask>('Task', taskSchema);
