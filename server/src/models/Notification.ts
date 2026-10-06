import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient?: mongoose.Types.ObjectId;
  targetRole?: 'admin' | 'rescue' | 'volunteer' | 'ngo' | 'all';
  title: string;
  message: string;
  type: 'emergency' | 'task' | 'resource' | 'system' | 'assignment';
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    targetRole: { 
      type: String, 
      enum: ['admin', 'rescue', 'volunteer', 'ngo', 'all'],
      default: 'all'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['emergency', 'task', 'resource', 'system', 'assignment'],
      default: 'system'
    },
    relatedId: { type: String },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
