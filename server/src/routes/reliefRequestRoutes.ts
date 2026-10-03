import express from 'express';
import { 
  getRequests, 
  getMyRequests, 
  createRequest, 
  updateRequestStatus 
} from '../controllers/reliefRequestController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Get all requests (Admin, NGO, Rescue, Volunteer)
router.get('/', protect, authorize('Super Admin', 'Government/Admin Officer', 'NGO Coordinator', 'Rescue Team', 'Volunteer'), getRequests);

// Get citizen's own requests
router.get('/me', protect, getMyRequests);

// Create request (Citizen mostly, but anyone can submit on behalf) - PUBLIC access for SOS
router.post('/', createRequest);

// Update status (Admin, NGO, Rescue, Volunteer)
router.put('/:id/status', protect, authorize('Super Admin', 'Government/Admin Officer', 'NGO Coordinator', 'Rescue Team', 'Volunteer'), updateRequestStatus);

export default router;
