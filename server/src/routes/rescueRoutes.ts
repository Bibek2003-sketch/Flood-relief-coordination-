import express from 'express';
import { 
  getRescueOperations, 
  getMyRescueMissions, 
  createRescueOperation, 
  updateRescueStatus 
} from '../controllers/rescueController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, authorize('Super Admin', 'Government/Admin Officer', 'NGO Coordinator'), getRescueOperations);
router.get('/me', protect, authorize('Rescue Team'), getMyRescueMissions);
router.post('/', protect, authorize('Super Admin', 'Government/Admin Officer', 'NGO Coordinator'), createRescueOperation);
router.put('/:id', protect, authorize('Super Admin', 'Government/Admin Officer', 'Rescue Team'), updateRescueStatus);

export default router;
