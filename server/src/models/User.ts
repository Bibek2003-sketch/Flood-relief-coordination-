import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: any;
  roleName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  organization?: string;
  contactNumber?: string;
  skills?: string[];
  isAvailable?: boolean;
  getRoleName(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Role',
      required: true,
    },
    roleName: {
      type: String,
      enum: ['admin', 'rescue', 'volunteer', 'ngo', 'citizen'],
      default: 'volunteer',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    organization: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.getRoleName = function(): string {
  if (this.roleName) return this.roleName.toLowerCase();
  if (typeof this.role === 'string') {
    const r = this.role.toLowerCase();
    if (r.includes('admin')) return 'admin';
    if (r.includes('rescue')) return 'rescue';
    if (r.includes('ngo')) return 'ngo';
    if (r.includes('volunteer')) return 'volunteer';
    return r;
  }
  if (this.role && typeof this.role === 'object' && this.role.name) {
    const r = this.role.name.toLowerCase();
    if (r.includes('admin')) return 'admin';
    if (r.includes('rescue')) return 'rescue';
    if (r.includes('ngo')) return 'ngo';
    if (r.includes('volunteer')) return 'volunteer';
    return r;
  }
  return 'volunteer';
};

export default mongoose.model<IUser>('User', UserSchema);
