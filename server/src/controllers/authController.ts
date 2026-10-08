import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { generateToken } from '../utils/jwt';
import { normalizeRole } from '../middleware/auth';

const getOrCreateRoleDoc = async (roleName: string) => {
  let roleDoc = await Role.findOne({ name: { $regex: new RegExp(`^${roleName}$`, 'i') } });
  if (!roleDoc) {
    roleDoc = await Role.create({
      name: roleName,
      description: `${roleName.toUpperCase()} role`
    });
  }
  return roleDoc;
};

/**
 * Public Citizen / General User Registration
 * NOTE: Role is strictly locked to 'citizen'.
 * Clients cannot elevate privileges via this endpoint.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ success: false, status: 'fail', error: 'Please provide all required fields' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, status: 'fail', error: 'Email already exists' });
      return;
    }

    const roleDoc = await getOrCreateRoleDoc('citizen');

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: roleDoc._id,
      roleName: 'citizen',
      status: 'approved',
      contactNumber: contactNumber?.trim() || ''
    });

    const token = generateToken(String(user._id), 'citizen');

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: 'citizen',
      roleName: 'citizen',
      status: user.status,
      organization: user.organization || ''
    };

    res.status(201).json({
      success: true,
      status: 'success',
      token,
      user: userData,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Volunteer Registration
 * Automatically assigned role = 'volunteer' and status = 'pending'.
 * Requires Administrator review and approval before dashboard access.
 */
export const registerVolunteer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, contactNumber, location, skills } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ success: false, status: 'fail', error: 'Please provide all required fields' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, status: 'fail', error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, status: 'fail', error: 'An account with this email already exists' });
      return;
    }

    const roleDoc = await getOrCreateRoleDoc('volunteer');

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: roleDoc._id,
      roleName: 'volunteer',
      status: 'pending',
      organization: location?.trim() || '',
      contactNumber: contactNumber?.trim() || '',
      skills: Array.isArray(skills) ? skills : []
    });

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Volunteer application submitted successfully. Your account is awaiting administrator approval.',
      statusType: 'pending',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: 'volunteer',
        roleName: 'volunteer',
        status: 'pending'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * NGO / Organization Registration
 * Automatically assigned role = 'ngo' and status = 'pending'.
 * Requires Administrator review and approval before dashboard access.
 */
export const registerNgo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, organization, contactNumber, address, details } = req.body;

    if (!firstName || !lastName || !email || !password || !organization) {
      res.status(400).json({ success: false, status: 'fail', error: 'Please provide all required fields including organization name' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, status: 'fail', error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, status: 'fail', error: 'An account with this email already exists' });
      return;
    }

    const roleDoc = await getOrCreateRoleDoc('ngo');

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: roleDoc._id,
      roleName: 'ngo',
      status: 'pending',
      organization: organization.trim(),
      contactNumber: contactNumber?.trim() || ''
    });

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Organization application submitted successfully. Your account is awaiting administrator approval.',
      statusType: 'pending',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: 'ngo',
        roleName: 'ngo',
        status: 'pending',
        organization: user.organization
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rescue Squad Registration
 * Automatically assigned role = 'rescue' and status = 'pending'.
 * Requires Administrator review and approval before dashboard access.
 */
export const registerRescue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, organization, contactNumber, skills } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ success: false, status: 'fail', error: 'Please provide all required fields' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, status: 'fail', error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, status: 'fail', error: 'An account with this email already exists' });
      return;
    }

    const roleDoc = await getOrCreateRoleDoc('rescue');

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: roleDoc._id,
      roleName: 'rescue',
      status: 'pending',
      organization: organization?.trim() || 'Rescue Squad',
      contactNumber: contactNumber?.trim() || '',
      skills: Array.isArray(skills) ? skills : []
    });

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Rescue squad application submitted successfully. Your account is awaiting administrator approval.',
      statusType: 'pending',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: 'rescue',
        roleName: 'rescue',
        status: 'pending',
        organization: user.organization
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unified Staff & Partner Login
 * Role is strictly determined by the authenticated database account.
 * Client-supplied roles are completely ignored to prevent privilege escalation.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, status: 'fail', error: 'Please provide email and password' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('role');
    if (!user) {
      res.status(401).json({ success: false, status: 'fail', error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, status: 'fail', error: 'Invalid credentials' });
      return;
    }

    // Check account approval lifecycle
    if (user.status === 'pending') {
      res.status(403).json({
        success: false,
        status: 'fail',
        error: 'Your account is awaiting administrator approval.'
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        status: 'fail',
        error: 'Your account has been suspended. Please contact the administrator.'
      });
      return;
    }

    if (user.status === 'rejected') {
      res.status(403).json({
        success: false,
        status: 'fail',
        error: 'Your registration application has been rejected. Please contact support.'
      });
      return;
    }

    // Strictly resolve role from database
    const canonicalRole = normalizeRole(user.roleName || user.role);
    const token = generateToken(String(user._id), canonicalRole);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: canonicalRole,
      roleName: canonicalRole,
      status: user.status || 'approved',
      organization: user.organization || ''
    };

    res.status(200).json({
      success: true,
      status: 'success',
      token,
      user: userData,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Current Authenticated User Profile
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id).populate('role');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const canonicalRole = normalizeRole(user.roleName || user.role);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: canonicalRole,
        roleName: canonicalRole,
        status: user.status || 'approved',
        organization: user.organization || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google Sign-In / OAuth
 * - Existing accounts maintain their verified role and lifecycle status.
 * - New accounts can register intent for volunteer/ngo/rescue (pending status) or citizen.
 * - Under NO circumstances can Google Sign-In create or escalate to an admin account.
 */
export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, intent, organization, contactNumber, skills } = req.body;
    if (!token) {
      res.status(400).json({ success: false, error: 'Google token is required' });
      return;
    }

    let payload: any = null;
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      }
    } catch (e) {
      // payload parsing error
    }

    // If token is an access_token (from custom Google popup login)
    if (!payload || !payload.email) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userInfoRes.ok) {
          payload = await userInfoRes.json();
        }
      } catch (e) {
        // network fetch error
      }
    }

    if (!payload || !payload.email) {
      res.status(400).json({ success: false, error: 'Invalid Google authentication token' });
      return;
    }

    const email = payload.email.toLowerCase().trim();
    let firstName = payload.given_name;
    let lastName = payload.family_name;

    if (!firstName && payload.name) {
      const parts = payload.name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    firstName = firstName || 'User';
    lastName = lastName || '';

    let user = await User.findOne({ email }).populate('role');

    // 1. Existing Account Flow
    if (user) {
      if (user.status === 'pending') {
        res.status(403).json({
          success: false,
          status: 'fail',
          error: 'Your account is awaiting administrator approval.'
        });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({
          success: false,
          status: 'fail',
          error: 'Your account has been suspended. Please contact the administrator.'
        });
        return;
      }

      if (user.status === 'rejected') {
        res.status(403).json({
          success: false,
          status: 'fail',
          error: 'Your registration application has been rejected. Please contact support.'
        });
        return;
      }

      const canonicalRole = normalizeRole(user.roleName || user.role);
      const jwtToken = generateToken(String(user._id), canonicalRole);

      res.status(200).json({
        success: true,
        status: 'success',
        token: jwtToken,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: canonicalRole,
          roleName: canonicalRole,
          status: user.status || 'approved',
          organization: user.organization || ''
        }
      });
      return;
    }

    // 2. New Account Registration via Google
    // Determine assigned role based on intent; PREVENT ADMIN ESCALATION
    const safeIntent = (intent || '').toString().toLowerCase().trim();

    if (safeIntent === 'volunteer') {
      const roleDoc = await getOrCreateRoleDoc('volunteer');
      user = await User.create({
        firstName,
        lastName,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!',
        role: roleDoc._id,
        roleName: 'volunteer',
        status: 'pending',
        contactNumber: contactNumber?.trim() || '',
        skills: Array.isArray(skills) ? skills : []
      });

      res.status(201).json({
        success: true,
        status: 'success',
        message: 'Volunteer application submitted via Google. Your account is awaiting administrator approval.',
        statusType: 'pending',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: 'volunteer',
          roleName: 'volunteer',
          status: 'pending'
        }
      });
      return;
    }

    if (safeIntent === 'ngo') {
      const roleDoc = await getOrCreateRoleDoc('ngo');
      user = await User.create({
        firstName,
        lastName,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!',
        role: roleDoc._id,
        roleName: 'ngo',
        status: 'pending',
        organization: organization?.trim() || 'Registered NGO',
        contactNumber: contactNumber?.trim() || ''
      });

      res.status(201).json({
        success: true,
        status: 'success',
        message: 'Organization registration submitted via Google. Your account is awaiting administrator approval.',
        statusType: 'pending',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: 'ngo',
          roleName: 'ngo',
          status: 'pending',
          organization: user.organization
        }
      });
      return;
    }

    if (safeIntent === 'rescue') {
      const roleDoc = await getOrCreateRoleDoc('rescue');
      user = await User.create({
        firstName,
        lastName,
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!',
        role: roleDoc._id,
        roleName: 'rescue',
        status: 'pending',
        organization: organization?.trim() || 'Rescue Squad',
        contactNumber: contactNumber?.trim() || ''
      });

      res.status(201).json({
        success: true,
        status: 'success',
        message: 'Rescue squad application submitted via Google. Your account is awaiting administrator approval.',
        statusType: 'pending',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: 'rescue',
          roleName: 'rescue',
          status: 'pending',
          organization: user.organization
        }
      });
      return;
    }

    // Default: Citizen Public Account
    const roleDoc = await getOrCreateRoleDoc('citizen');
    user = await User.create({
      firstName,
      lastName,
      email,
      password: Math.random().toString(36).slice(-8) + 'Aa1!',
      role: roleDoc._id,
      roleName: 'citizen',
      status: 'approved'
    });

    const jwtToken = generateToken(String(user._id), 'citizen');

    res.status(200).json({
      success: true,
      status: 'success',
      token: jwtToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: 'citizen',
        roleName: 'citizen',
        status: 'approved',
        organization: ''
      }
    });
  } catch (error) {
    next(error);
  }
};
