import { Router } from 'express';
import { signup, getUser } from '../controllers/users';
const r = Router();
r.post('/signup', signup);
r.get('/:walletAddress', getUser);
export default r;
