import { Schema, model } from 'mongoose';

interface IDuration {
  h: number;
  label: string;
  seconds: number;
}

interface IMultiplierOption {
  value: number;
  label: string;
  requiresAd: boolean;
}

interface IConfig {
  key: string;
  durations: IDuration[];
  multiplierOptions: IMultiplierOption[];
  baseRate: number;
}

const ConfigSchema = new Schema<IConfig>(
  {
    key: { type: String, required: true, unique: true, default: 'mining_config' },
    durations: [
      {
        h: { type: Number, required: true },
        label: { type: String, required: true },
        seconds: { type: Number, required: true },
      },
    ],
    multiplierOptions: [
      {
        value: { type: Number, required: true },
        label: { type: String, required: true },
        requiresAd: { type: Boolean, required: true },
      },
    ],
    baseRate: { type: Number, required: true, default: 0.01 },
  },
  { timestamps: true },
);

export const Config = model<IConfig>('Config', ConfigSchema);
