import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId | string, roleId: Types.ObjectId | string): string => {
  return jwt.sign({ id: userId, role: roleId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};
