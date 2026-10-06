import express from 'express';
import {
  getAdminStats,
  getEmergencies,
  assignRescueTeam,
  verifyEmergency,
  updateEmergencyPriority,
  updateEmergencyStatus,
  getOperationalUsers,
  updateUserStatus,
  getRescueTeams
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require admin privileges
router.use(protect);
router.use(authorize('admin', 'Super Admin', 'Government/Admin Officer'));

router.get('/stats', getAdminStats);
router.get('/rescue-teams', getRescueTeams);
router.get('/emergencies', getEmergencies);
router.patch('/emergencies/:id/assign', assignRescueTeam);
router.patch('/emergencies/:id/verify', verifyEmergency);
router.patch('/emergencies/:id/priority', updateEmergencyPriority);
router.patch('/emergencies/:id/status', updateEmergencyStatus);

router.get('/users', getOperationalUsers);
router.patch('/users/:id/status', updateUserStatus);

export default router;
