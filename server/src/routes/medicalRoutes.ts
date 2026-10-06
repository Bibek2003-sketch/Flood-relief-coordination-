import express from 'express';
import {
  getMedicalStats,
  getMedicalCamps,
  deployMedicalCamp,
  getCriticalEvacuations,
  dispatchEvacuationBoat
} from '../controllers/medicalController';

const router = express.Router();

router.get('/stats', getMedicalStats);
router.get('/camps', getMedicalCamps);
router.post('/camps', deployMedicalCamp);
router.get('/evacuations', getCriticalEvacuations);
router.post('/evacuations/:id/dispatch', dispatchEvacuationBoat);

export default router;
