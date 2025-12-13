import { Router } from 'express';
import {
  applyReferralCode,
  getReferralStats,
  getReferralBonusHistory,
} from '../controllers/referral';

const r = Router();
r.post('/apply', applyReferralCode);
r.get('/stats/:walletAddress', getReferralStats);
r.get('/bonus-history/:walletAddress', getReferralBonusHistory);

export default r;
