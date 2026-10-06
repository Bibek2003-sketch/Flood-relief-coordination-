import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  itemName: string;
  category: 'Food' | 'Water' | 'Medicine' | 'Blankets' | 'Clothing' | 'Hygiene kits' | 'Baby supplies' | 'Tents' | 'Emergency equipment';
  quantity: number;
  unit: string;
  warehouseLocation: string;
  minimumStock: number;
  expiryDate?: Date;
  supplier?: string;
  batchNumber?: string;
  organization?: mongoose.Types.ObjectId;
  organizationName?: string;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    itemName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Food', 'Water', 'Medicine', 'Blankets', 'Clothing', 'Hygiene kits', 'Baby supplies', 'Tents', 'Emergency equipment'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    warehouseLocation: { type: String, required: true },
    minimumStock: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    supplier: { type: String },
    batchNumber: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: 'User' },
    organizationName: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to generate low-stock alert if needed
inventoryItemSchema.pre('save', function(next) {
  if (this.isModified('quantity') && this.quantity < this.minimumStock) {
    // We would ideally trigger an event or create a Notification here
    // For now, we rely on the controller to emit Socket events
  }
  next();
});

export default mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
