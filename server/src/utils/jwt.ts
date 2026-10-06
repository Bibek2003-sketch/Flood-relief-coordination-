import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId | string, role: string): string => {
  return jwt.sign({ id: String(userId), role: String(role).toLowerCase() }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};
