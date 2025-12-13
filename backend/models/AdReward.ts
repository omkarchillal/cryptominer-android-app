import { Schema, model } from 'mongoose';

interface IAdReward {
  walletAddress: string;
  rewardAmount: number;
  createdAt: Date;
}

const AdRewardSchema = new Schema<IAdReward>({
  walletAddress: { type: String, required: true, index: true },
  rewardAmount: { type: Number, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

// Index for efficient queries by wallet and date
AdRewardSchema.index({ walletAddress: 1, createdAt: -1 });

export const AdReward = model<IAdReward>('AdReward', AdRewardSchema);
