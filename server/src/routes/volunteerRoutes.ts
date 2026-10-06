import express from 'express';
import {
  enrollVolunteer,
  getVolunteerTasks,
  acceptTask,
  declineTask,
  completeTask,
  toggleAvailability,
  getVolunteerProfile
} from '../controllers/volunteerController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public volunteer enrollment
router.post('/enroll', enrollVolunteer);

router.use(protect);
router.use(authorize('volunteer', 'Volunteer', 'admin', 'Super Admin'));

router.get('/tasks', getVolunteerTasks);
router.post('/tasks/:id/accept', acceptTask);
router.post('/tasks/:id/decline', declineTask);
router.post('/tasks/:id/complete', completeTask);
router.patch('/availability', toggleAvailability);
router.get('/profile', getVolunteerProfile);

export default router;
