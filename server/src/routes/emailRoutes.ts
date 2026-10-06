import express from 'express';
import { dispatchRescueEmail } from '../controllers/emailController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Temporarily public for demo purposes so it works with the mock login
router.post('/dispatch', dispatchRescueEmail);

export default router;
