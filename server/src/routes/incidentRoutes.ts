import express from 'express';
import { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncident, 
  deleteIncident 
} from '../controllers/incidentController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);

// Protected routes (Admin, Officer)
router.post('/', protect, authorize('Super Admin', 'Government/Admin Officer'), createIncident);
router.put('/:id', protect, authorize('Super Admin', 'Government/Admin Officer'), updateIncident);
router.delete('/:id', protect, authorize('Super Admin', 'Government/Admin Officer'), deleteIncident);

export default router;
