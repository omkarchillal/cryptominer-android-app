import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import users from './routes/users';
import mining from './routes/mining';
import config from './routes/config';
import leaderboard from './routes/leaderboard';
import adRewards from './routes/adRewards';
import referral from './routes/referral';
import notification from './routes/notification';
import admin from './routes/admin';

dotenv.config();

async function main() {
  await connectDB(process.env.MONGO_URI!);
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/mining', mining);
  app.use('/api/config', config);
  app.use('/api/leaderboard', leaderboard);
  app.use('/api/ad-rewards', adRewards);
  app.use('/api/referral', referral);
  app.use('/api/notifications', notification);
  app.use('/api/admin', admin);
  app.get('/health', (_, res) => res.json({ ok: true }));
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Server listening on :${port} ✅`));
}
main().catch(err => { console.error(err); process.exit(1); });
