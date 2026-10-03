import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, roleName, contactNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already exists' });
      return;
    }

    // Default to Citizen role if not provided or valid
    let role = await Role.findOne({ name: roleName || 'Citizen' });
    if (!role) {
      role = await Role.findOne({ name: 'Citizen' });
    }

    if (!role) {
      res.status(500).json({ success: false, error: 'Role not found. Please seed the database.' });
      return;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role._id,
      contactNumber
    });

    const token = generateToken(user._id as string, role._id as string);

    res.status(201).json({
      success: true,
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role.name,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please provide an email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id as string, (user.role as any)._id);

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: (user.role as any).name,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id).populate('role');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: (user.role as any).name,
      }
    });
  } catch (error) {
    next(error);
  }
};
