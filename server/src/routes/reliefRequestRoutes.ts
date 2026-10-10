import express from 'express';
import { 
  getRequests, 
  getMyRequests, 
  createRequest, 
  updateRequestStatus,
  trackRequest,
  getPublicOverviewStats
} from '../controllers/reliefRequestController';
import { protect, authorize } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';

const emergencyReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 200 : 20, // Max submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many emergency reports submitted from this network. Please call emergency helpline 112 directly if danger is immediate.'
  }
});

const emergencyTrackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isDev ? 1000 : 200, // Generous tracking queries to prevent false 429 lockouts during live monitoring
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many emergency tracking status checks. Please wait a few moments before trying again.'
  }
});

// Public emergency tracking route (Unauthenticated with rate-limiting)
router.get('/track/:requestId', emergencyTrackLimiter, trackRequest);

// Public situational overview metrics (Unauthenticated)
router.get('/overview', getPublicOverviewStats);

// Get all requests (Protected: Authorized Operational Roles Only)
router.get('/', protect, authorize('admin', 'rescue', 'volunteer', 'ngo', 'Super Admin'), getRequests);

// Get citizen's own requests
router.get('/me', protect, getMyRequests);

// Create request (Citizen mostly, but anyone can submit on behalf) - PUBLIC access for SOS
router.post('/', emergencyReportLimiter, createRequest);

// Update status (Admin, NGO, Rescue, Volunteer)
router.put('/:id/status', protect, authorize('admin', 'rescue', 'volunteer', 'ngo', 'Super Admin', 'Government/Admin Officer', 'NGO Coordinator', 'Rescue Team', 'Volunteer'), updateRequestStatus);

export default router;
