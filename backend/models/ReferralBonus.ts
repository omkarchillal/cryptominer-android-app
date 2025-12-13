import { Schema, model } from 'mongoose';

interface IReferralBonus {
  walletAddress: string; // Referrer's wallet (who receives the bonus)
  referredWallet: string; // Referred user's wallet (who generated the bonus)
  bonusAmount: number; // 10% of mining reward
  miningReward: number; // Original mining reward of referred user
  createdAt: Date;
}

const ReferralBonusSchema = new Schema<IReferralBonus>({
  walletAddress: { type: String, required: true, index: true },
  referredWallet: { type: String, required: true, index: true },
  bonusAmount: { type: Number, required: true },
  miningReward: { type: Number, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

// Compound index for efficient queries
ReferralBonusSchema.index({ walletAddress: 1, createdAt: -1 });
ReferralBonusSchema.index({ referredWallet: 1, createdAt: -1 });

export const ReferralBonus = model<IReferralBonus>(
  'ReferralBonus',
  ReferralBonusSchema,
);
