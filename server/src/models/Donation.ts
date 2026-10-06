import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  donorName: string;
  email: string;
  amount: number;
  paymentType: 'monetary' | 'supplies';
  supplyItem?: string;
  quantity?: number;
  receiptNumber: string;
  status: 'completed' | 'pledged';
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema = new Schema(
  {
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentType: {
      type: String,
      enum: ['monetary', 'supplies'],
      default: 'monetary',
      required: true,
    },
    supplyItem: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pledged'],
      default: 'completed',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDonation>('Donation', DonationSchema);
