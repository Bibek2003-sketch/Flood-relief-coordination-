import mongoose, { Document, Schema } from 'mongoose';

export type NotificationStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRY_SCHEDULED'
  | 'SKIPPED'
  | 'UNKNOWN';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'br' | 'as';

export interface INotificationLog extends Document {
  emergencyId: mongoose.Types.ObjectId;
  requestId: string;
  eventType: string;
  channel: 'SMS';
  preferredLanguage: SupportedLanguage;
  recipientMasked: string;
  recipientPhoneHash?: string;
  provider: string;
  providerMessageId?: string;
  templateId?: string;
  templateVersion?: string;
  reviewStatus?: 'approved' | 'needs_review';
  idempotencyKey: string;
  status: NotificationStatus;
  encoding: 'GSM-7' | 'UCS-2';
  characterCount: number;
  segmentCount: number;
  messagePreview: string;
  attemptCount: number;
  lastAttemptAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failureCode?: string;
  safeFailureReason?: string;
  rawResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    emergencyId: { type: Schema.Types.ObjectId, ref: 'ReliefRequest', required: true, index: true },
    requestId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    channel: { type: String, enum: ['SMS'], default: 'SMS' },
    preferredLanguage: { type: String, enum: ['en', 'hi', 'bn', 'br', 'as'], default: 'en', index: true },
    recipientMasked: { type: String, required: true },
    recipientPhoneHash: { type: String, index: true },
    provider: { type: String, default: 'mock' },
    providerMessageId: { type: String, index: true },
    templateId: { type: String, index: true },
    templateVersion: { type: String },
    reviewStatus: { type: String, enum: ['approved', 'needs_review'], default: 'needs_review', index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'RETRY_SCHEDULED', 'SKIPPED', 'UNKNOWN'],
      default: 'PENDING',
      index: true
    },
    encoding: { type: String, enum: ['GSM-7', 'UCS-2'], default: 'GSM-7' },
    characterCount: { type: Number, default: 0 },
    segmentCount: { type: Number, default: 1 },
    messagePreview: { type: String, required: true },
    attemptCount: { type: Number, default: 1 },
    lastAttemptAt: { type: Date },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    failureCode: { type: String },
    safeFailureReason: { type: String },
    rawResponse: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

notificationLogSchema.index({ createdAt: -1 });
notificationLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<INotificationLog>('NotificationLog', notificationLogSchema);

