import { Schema, model } from 'mongoose';

export type NotificationType = 'referral_used' | 'referral_bonus' | 'mining_bonus' | 'general';

interface INotification {
  walletAddress: string; // Recipient's wallet
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Additional data (e.g., amount, referredWallet)
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  walletAddress: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['referral_used', 'referral_bonus', 'mining_bonus', 'general'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
});

// Compound index for efficient queries
NotificationSchema.index({ walletAddress: 1, createdAt: -1 });
NotificationSchema.index({ walletAddress: 1, read: 1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
