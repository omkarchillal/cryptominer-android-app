import { Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { AdReward } from '../models/AdReward';
import { MiningSession } from '../models/MiningSession';

const MAX_DAILY_CLAIMS = 6;
const REWARD_OPTIONS = [10, 20, 30, 40, 50, 60];

const getStartOfDay = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const getEndOfDay = (): Date => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

const getRandomReward = (): number => {
  const randomIndex = Math.floor(Math.random() * REWARD_OPTIONS.length);
  return REWARD_OPTIONS[randomIndex];
};

export const claimAdReward = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Count today's claims for this wallet
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const todayClaimsCount = await AdReward.countDocuments({
      walletAddress,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Check if user has reached daily limit
    if (todayClaimsCount >= MAX_DAILY_CLAIMS) {
      return res.status(429).json({
        error: 'Daily limit reached',
        message:
          'You have reached the maximum 6 ad rewards for today. Come back tomorrow!',
        claimedCount: todayClaimsCount,
        maxClaims: MAX_DAILY_CLAIMS,
      });
    }

    // Get random reward
    const reward = getRandomReward();

    // Ensure referral record is present (created during signup)
    const referral = await Referral.findOne({ walletAddress });
    if (!referral) {
      return res.status(404).json({ error: 'Referral record not found' });
    }

    // Update referral totalBalance (keep referral metrics and source-of-truth consistent)
    referral.totalBalance += reward;
    await referral.save();

    // Update the latest mining session (active or not) to maintain consistency
    const latestSession = await MiningSession.findOne({ walletAddress }).sort({ createdAt: -1 });
    let newBalance: number = referral.totalBalance;
    
    if (latestSession) {
      // Update the latest session's totalCoins to include the ad reward
      latestSession.totalCoins += reward;
      await latestSession.save();
      newBalance = latestSession.totalCoins;
      console.log(`💰 Updated latest session totalCoins: ${latestSession.totalCoins}`);
    } else {
      // If no session exists, create a basic one to maintain consistency
      const newSession = new MiningSession({
        walletAddress,
        totalCoins: referral.totalBalance,
        status: 'inactive',
        selectedHour: 0,
        multiplier: 1,
        miningStartTime: new Date(),
        createdAt: new Date(),
      });
      await newSession.save();
      newBalance = newSession.totalCoins;
      console.log(`💰 Created new session with totalCoins: ${newSession.totalCoins}`);
    }

    // Create a new entry for this claim
    const adRewardEntry = new AdReward({
      walletAddress,
      rewardAmount: reward,
      createdAt: new Date(),
    });
    await adRewardEntry.save();

    const newClaimsCount = todayClaimsCount + 1;

    console.log(
      `💰 Ad reward claimed: ${walletAddress} earned ${reward} tokens (${newClaimsCount}/${MAX_DAILY_CLAIMS})`,
    );
    console.log(`📊 New balance: ${newBalance}`);

    return res.json({
      success: true,
      reward,
      newBalance,
      claimedCount: newClaimsCount,
      remainingClaims: MAX_DAILY_CLAIMS - newClaimsCount,
    });
  } catch (error) {
    console.error('Error claiming ad reward:', error);
    return res.status(500).json({ error: 'Failed to claim ad reward' });
  }
};

export const getAdRewardStatus = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Count today's claims for this wallet
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const todayClaimsCount = await AdReward.countDocuments({
      walletAddress,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const canClaim = todayClaimsCount < MAX_DAILY_CLAIMS;

    // Get the last claim time
    const lastClaim = await AdReward.findOne({
      walletAddress,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    return res.json({
      claimedCount: todayClaimsCount,
      remainingClaims: MAX_DAILY_CLAIMS - todayClaimsCount,
      maxClaims: MAX_DAILY_CLAIMS,
      canClaim,
      lastClaimTime: lastClaim?.createdAt || null,
    });
  } catch (error) {
    console.error('Error getting ad reward status:', error);
    return res.status(500).json({ error: 'Failed to get ad reward status' });
  }
};
