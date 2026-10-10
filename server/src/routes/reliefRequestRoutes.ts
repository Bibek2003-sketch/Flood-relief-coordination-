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

const emergencyReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 submissions per IP per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many emergency reports submitted from this network. Please call emergency helpline 112 directly if danger is immediate.'
  }
});

const emergencyTrackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // Max 60 tracking queries per IP per 10 min window (allows auto-refresh while blocking brute-force)
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
