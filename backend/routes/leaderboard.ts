import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard';

const r = Router();
r.get('/', getLeaderboard);

export default r;
