import express from 'express';
import { dispatchRescueEmail } from '../controllers/emailController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Only admins or rescue team can dispatch emergency emails
router.post('/dispatch', protect, authorize('Super Admin', 'Government/Admin Officer', 'Rescue Team'), dispatchRescueEmail);

export default router;
