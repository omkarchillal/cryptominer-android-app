import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/config';

const r = Router();
r.get('/', getConfig);
r.put('/', updateConfig);

export default r;
