import { Router } from 'express';
import {
  start,
  upgrade,
  stop,
  claim,
  getCurrentSession,
} from '../controllers/mining';
const r = Router();
r.post('/start', start);
r.put('/upgrade', upgrade);
r.post('/stop', stop);
r.post('/claim', claim);
r.get('/session/:walletAddress', getCurrentSession);
export default r;
