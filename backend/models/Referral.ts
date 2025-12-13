import { Schema, model } from 'mongoose';

interface IReferral {
  walletAddress: string;
  referralCode: string;
  totalBalance: number;
  totalReferrals: number;
  hasUsedReferralCode: boolean;
  totalReferralPoints: number;
  usedReferralCode?: string;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  walletAddress: { type: String, unique: true, index: true, required: true },
  referralCode: { type: String, unique: true, index: true, required: true },
  totalBalance: { type: Number, default: 0 },
  totalReferrals: { type: Number, default: 0 },
  hasUsedReferralCode: { type: Boolean, default: false },
  totalReferralPoints: { type: Number, default: 0 },
  usedReferralCode: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export const Referral = model<IReferral>('Referral', ReferralSchema);
