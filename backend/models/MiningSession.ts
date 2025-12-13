import { Schema, model } from 'mongoose';
export type MiningStatus = 'mining' | 'claimed';
interface IMiningSession {
  walletAddress: string;
  totalCoins: number; // Total mining balance (all-time)
  currentMiningPoints: number; // Tokens earned in current session
  multiplier: number;
  miningStartTime: Date;
  multiplierStartTime: Date;
  status: MiningStatus;
  selectedHour: number;
}
const MiningSessionSchema = new Schema<IMiningSession>(
  {
    walletAddress: { type: String, index: true, required: true },
    totalCoins: { type: Number, default: 0 }, // Total mining balance
    currentMiningPoints: { type: Number, default: 0 }, // Current session tokens
    multiplier: { type: Number, default: 1 },
    miningStartTime: { type: Date, required: true },
    multiplierStartTime: { type: Date, required: true },
    status: { type: String, enum: ['mining', 'claimed'], default: 'mining' },
    selectedHour: { type: Number, required: true },
  },
  { timestamps: true },
);
export const MiningSession = model<IMiningSession>(
  'MiningSession',
  MiningSessionSchema,
);
