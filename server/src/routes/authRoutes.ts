import express from 'express';
import {
  register,
  registerVolunteer,
  registerNgo,
  registerRescue,
  login,
  getMe,
  googleAuth
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/authValidators';

const router = express.Router();

// Staff & Partner Login
router.post('/login', validate(loginSchema), login);

// Google Sign-In & Onboarding
router.post('/google', googleAuth);

// Citizen Registration (public, role locked to citizen)
router.post('/register', register);
router.post('/register/citizen', register);

// Operational Registrations (require Admin approval)
router.post('/register/volunteer', registerVolunteer);
router.post('/register/ngo', registerNgo);
router.post('/register/rescue', registerRescue);

// Current User Profile
router.get('/me', protect, getMe);

export default router;
