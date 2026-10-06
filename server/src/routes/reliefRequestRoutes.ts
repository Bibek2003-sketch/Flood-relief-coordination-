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

const router = express.Router();

// Public emergency tracking route (Unauthenticated)
router.get('/track/:requestId', trackRequest);

// Public situational overview metrics (Unauthenticated)
router.get('/overview', getPublicOverviewStats);

// Get all requests (Public situational awareness & dashboard feed)
router.get('/', getRequests);

// Get citizen's own requests
router.get('/me', protect, getMyRequests);

// Create request (Citizen mostly, but anyone can submit on behalf) - PUBLIC access for SOS
router.post('/', createRequest);

// Update status (Admin, NGO, Rescue, Volunteer)
router.put('/:id/status', protect, authorize('admin', 'rescue', 'volunteer', 'ngo', 'Super Admin', 'Government/Admin Officer', 'NGO Coordinator', 'Rescue Team', 'Volunteer'), updateRequestStatus);

export default router;
