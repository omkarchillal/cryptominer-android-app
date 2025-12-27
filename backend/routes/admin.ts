import { Router } from 'express';
import {
  getAllUsers,
  getAllMiningSessions,
  getAllPayments,
  getAllReferrals,
  getAllDailyRewards,
  getDashboardStats,
  processPayment,
  getActivities,
  deleteUser,
} from '../controllers/admin';

const r = Router();

r.get('/dashboard/stats', getDashboardStats);
r.get('/activities', getActivities);
r.get('/users', getAllUsers);
r.get('/mining', getAllMiningSessions);
r.get('/payments', getAllPayments);
r.post('/payments/process', processPayment);
r.get('/referrals', getAllReferrals);
r.get('/daily-rewards', getAllDailyRewards);
r.delete('/users/:walletAddress', deleteUser);

export default r;
