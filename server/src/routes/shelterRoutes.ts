import express from 'express';
import { 
  getShelters, 
  createShelter, 
  updateOccupancy 
} from '../controllers/shelterController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getShelters);
router.post('/', protect, authorize('Super Admin', 'Government/Admin Officer'), createShelter);
router.put('/:id/occupancy', protect, authorize('Super Admin', 'Government/Admin Officer', 'Shelter Manager'), updateOccupancy);

export default router;
