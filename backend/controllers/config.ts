import { Request, Response } from 'express';
import { Config } from '../models/Config';

export const getConfig = async (req: Request, res: Response) => {
  try {
    let config = await Config.findOne({ key: 'mining_config' });
    
    // If config doesn't exist, create default config
    if (!config) {
      config = await Config.create({
        key: 'mining_config',
        durations: [
          { h: 1, label: '1 Hour', seconds: 3600 },
          { h: 2, label: '2 Hours', seconds: 7200 },
          { h: 4, label: '4 Hours', seconds: 14400 },
          { h: 12, label: '12 Hours', seconds: 43200 },
          { h: 24, label: '24 Hours', seconds: 86400 },
        ],
        multiplierOptions: [
          { value: 1, label: '1×', requiresAd: false },
          { value: 2, label: '2×', requiresAd: true },
          { value: 3, label: '3×', requiresAd: true },
          { value: 4, label: '4×', requiresAd: true },
          { value: 5, label: '5×', requiresAd: true },
          { value: 6, label: '6×', requiresAd: true },
        ],
        baseRate: 0.01,
      });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ message: 'Failed to fetch config' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { durations, multiplierOptions, baseRate } = req.body;
    
    const config = await Config.findOneAndUpdate(
      { key: 'mining_config' },
      { durations, multiplierOptions, baseRate },
      { new: true, upsert: true },
    );
    
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Failed to update config' });
  }
};
