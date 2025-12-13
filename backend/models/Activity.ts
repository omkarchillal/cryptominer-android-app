import { Schema, model } from 'mongoose';

export type ActivityType =
  | 'user_created'
  | 'mining_started'
  | 'mining_claimed'
  | 'reward_claimed'
  | 'referral_created'
  | 'payment_processed';

interface IActivity {
  type: ActivityType;
  walletAddress: string;
  description: string;
  metadata?: any;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  type: {
    type: String,
    enum: [
      'user_created',
      'mining_started',
      'mining_claimed',
      'reward_claimed',
      'referral_created',
      'payment_processed',
    ],
    required: true,
    index: true,
  },
  walletAddress: { type: String, required: true, index: true },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

// Index for efficient queries
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

export const Activity = model<IActivity>('Activity', ActivitySchema);
