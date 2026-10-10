import express from 'express';
import {
  getSmsLogs,
  getSmsStats,
  previewSmsTemplate,
  getTemplateCatalog,
  handleSmsWebhook
} from '../controllers/smsNotificationController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public Carrier Delivery Receipt (DLR) Webhook
router.post('/webhook', handleSmsWebhook);

// Protected Admin Management Endpoints
router.use(protect);
router.use(authorize('admin', 'Super Admin', 'Government/Admin Officer'));

router.get('/logs', getSmsLogs);
router.get('/stats', getSmsStats);
router.post('/preview', previewSmsTemplate);
router.get('/catalog', getTemplateCatalog);

export default router;
