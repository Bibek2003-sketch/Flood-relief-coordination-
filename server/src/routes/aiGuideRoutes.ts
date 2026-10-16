import express from 'express';
import rateLimit from 'express-rate-limit';
import { AIGuideController } from '../controllers/aiGuideController';

const router = express.Router();
const isDev = process.env.NODE_ENV !== 'production';

// Rate limiter: 40 requests per 10 minutes in production, 200 in dev
const aiGuideLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 200 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many guide requests from this IP. Please try again in a few minutes.'
  }
});

router.post('/chat', aiGuideLimiter, AIGuideController.chat);
router.get('/routes', AIGuideController.getApprovedRoutes);

export default router;

