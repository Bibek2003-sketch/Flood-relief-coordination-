import express from 'express';
import {
  getNgoResources,
  createNgoResource,
  updateNgoResource,
  deleteNgoResource,
  getNgoStats,
  getNgoShelters
} from '../controllers/ngoController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(authorize('ngo', 'NGO Coordinator', 'admin', 'Super Admin'));

router.get('/resources', getNgoResources);
router.post('/resources', createNgoResource);
router.put('/resources/:id', updateNgoResource);
router.delete('/resources/:id', deleteNgoResource);
router.get('/stats', getNgoStats);
router.get('/shelters', getNgoShelters);

export default router;
