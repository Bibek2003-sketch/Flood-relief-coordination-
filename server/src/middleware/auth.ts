import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    (req as any).user = user;
    (req as any).userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Not authorized' });
        return;
      }

      const role = await Role.findById(user.role);
      if (!role) {
        res.status(401).json({ success: false, error: 'Role not found' });
        return;
      }

      if (!roles.includes(role.name)) {
        res.status(403).json({ success: false, error: `User role ${role.name} is not authorized to access this route` });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
