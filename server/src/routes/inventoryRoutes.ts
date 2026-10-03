import express from 'express';
import { 
  getInventory, 
  addInventoryItem, 
  updateInventoryQuantity 
} from '../controllers/inventoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, authorize('Super Admin', 'Government/Admin Officer', 'NGO Coordinator', 'Shelter Manager'), getInventory);
router.post('/', protect, authorize('Super Admin', 'NGO Coordinator'), addInventoryItem);
router.put('/:id/quantity', protect, authorize('Super Admin', 'NGO Coordinator'), updateInventoryQuantity);

export default router;
