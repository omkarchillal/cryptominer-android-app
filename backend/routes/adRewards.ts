import { Router } from 'express';
import { claimAdReward, getAdRewardStatus } from '../controllers/adRewards';

const r = Router();
r.post('/claim', claimAdReward);
r.get('/status/:walletAddress', getAdRewardStatus);

export default r;
