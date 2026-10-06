import express from 'express';
import { 
  getRescueOperations, 
  getMyRescueMissions, 
  createRescueOperation, 
  updateRescueStatus,
  updateMissionStatus,
  getRescueStats
} from '../controllers/rescueController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Mission routes for rescue teams
router.get('/me', authorize('rescue', 'Rescue Team'), getMyRescueMissions);
router.get('/stats', authorize('rescue', 'Rescue Team'), getRescueStats);
router.patch('/missions/:id/status', authorize('rescue', 'Rescue Team'), updateMissionStatus);

// Admin / coordinator routes
router.get('/', authorize('admin', 'ngo', 'Super Admin', 'Government/Admin Officer', 'NGO Coordinator'), getRescueOperations);
router.post('/', authorize('admin', 'ngo', 'Super Admin', 'Government/Admin Officer', 'NGO Coordinator'), createRescueOperation);
router.put('/:id', authorize('admin', 'rescue', 'Super Admin', 'Government/Admin Officer', 'Rescue Team'), updateRescueStatus);

export default router;
