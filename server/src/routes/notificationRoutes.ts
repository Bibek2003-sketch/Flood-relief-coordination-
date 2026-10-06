import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;
