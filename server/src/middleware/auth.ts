import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';

export interface AuthRequest extends Request {
  user?: any;
  userRole?: string;
}

export const normalizeRole = (role: any): string => {
  if (!role) return '';
  const r = (typeof role === 'string' ? role : role.name || '').toLowerCase().trim();
  if (r.includes('admin') || r.includes('officer')) return 'admin';
  if (r.includes('rescue')) return 'rescue';
  if (r.includes('ngo')) return 'ngo';
  if (r.includes('volunteer')) return 'volunteer';
  return r;
};

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, status: 'fail', error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role?: string };

    let user;
    try {
      user = await User.findById(decoded.id).populate('role');
    } catch {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      res.status(401).json({ success: false, status: 'fail', error: 'User associated with token no longer exists.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, status: 'fail', error: 'Your account has been suspended. Please contact the administrator.' });
      return;
    }

    if (user.status === 'pending') {
      res.status(403).json({ success: false, status: 'fail', error: 'Your account is awaiting administrator approval.' });
      return;
    }

    if (user.status === 'rejected') {
      res.status(403).json({ success: false, status: 'fail', error: 'Your registration application has been rejected. Please contact support.' });
      return;
    }

    const resolvedRole = normalizeRole(user.roleName || user.role);
    (req as any).user = user;
    (req as any).userRole = resolvedRole;
    (user as any).roleString = resolvedRole;

    next();
  } catch (error) {
    res.status(401).json({ success: false, status: 'fail', error: 'Invalid or expired authentication token.' });
  }
};

export const authenticate = protect;

export const authorize = (...roles: string[]) => {
  const allowed = roles.map(r => normalizeRole(r));

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, status: 'fail', error: 'Authentication required' });
        return;
      }

      const userRole = normalizeRole((req as any).userRole || user.roleName || user.role);

      // Super admin or admin has universal administrative access
      const hasPermission = allowed.includes(userRole) || (allowed.includes('admin') && userRole === 'admin');

      if (!hasPermission) {
        res.status(403).json({ 
          success: false, 
          status: 'fail',
          error: `Forbidden: User role '${userRole}' is not authorized to access this resource` 
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
