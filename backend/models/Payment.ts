import { Schema, model } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

interface IPayment {
  walletAddress: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  transactionHash?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    walletAddress: { type: String, index: true, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paidAt: { type: Date },
    transactionHash: { type: String },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
