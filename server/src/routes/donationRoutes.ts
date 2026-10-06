import express from 'express';
import { createDonation, getDonationStats } from '../controllers/donationController';

const router = express.Router();

router.post('/', createDonation);
router.get('/stats', getDonationStats);

export default router;
