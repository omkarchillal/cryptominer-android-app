import { Request, Response } from 'express';
import { MiningSession } from '../models/MiningSession';
import { Referral } from '../models/Referral';
import { ReferralBonus } from '../models/ReferralBonus';
import { Notification } from '../models/Notification';
import { computeReward, clampMultiplier } from '../utils/calc';

const MAX_MULTIPLIER = Number(process.env.MAX_MULTIPLIER ?? '6');

export const start = async (req: Request, res: Response) => {
  const { walletAddress, selectedHour, multiplier } = req.body as {
    walletAddress: string;
    selectedHour: number;
    multiplier?: number;
  };
  if (!walletAddress || !selectedHour)
    return res
      .status(400)
      .json({ message: 'walletAddress & selectedHour required' });

  // Close any existing mining sessions
  await MiningSession.updateMany(
    { walletAddress, status: 'mining' },
    { $set: { status: 'claimed' } },
  );

  // Get totalCoins from the most recent session (source of truth for display)
  const previousSession = await MiningSession.findOne({ walletAddress })
    .sort({ createdAt: -1 });

  let totalCoins = 0;
  if (previousSession) {
    // Carry forward totalCoins from previous session
    totalCoins = previousSession.totalCoins;
  } else {
    // First session: use Referral's totalBalance if it exists
    const referral = await Referral.findOne({ walletAddress });
    totalCoins = referral?.totalBalance ?? 0;
  }

  const now = new Date();
  const ms = await MiningSession.create({
    walletAddress,
    totalCoins, // Carry forward from previous session
    currentMiningPoints: 0, // Current session starts at 0
    multiplier: clampMultiplier(multiplier ?? 1, MAX_MULTIPLIER),
    miningStartTime: now,
    multiplierStartTime: now,
    status: 'mining',
    selectedHour,
  });
  res.status(201).json(ms);
};

export const upgrade = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  const session = await MiningSession.findOne({ walletAddress, status: 'mining' }).sort({ createdAt: -1 });
  if (!session) return res.status(404).json({ message: 'No active session' });
  session.multiplier = clampMultiplier(session.multiplier + 1, MAX_MULTIPLIER);
  session.multiplierStartTime = new Date();
  await session.save();
  res.json({ multiplier: session.multiplier });
};

export const stop = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  const session = await MiningSession.findOne({ walletAddress, status: 'mining' }).sort({ createdAt: -1 });
  if (!session) return res.status(404).json({ message: 'No active session' });
  session.status = 'claimed';
  await session.save();
  res.json({ ok: true });
};

export const claim = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  const session = await MiningSession.findOne({
    walletAddress,
    status: 'mining',
  }).sort({ createdAt: -1 });
  if (!session)
    return res.status(404).json({ message: 'No active session' });

  const now = new Date();
  const durationSec = session.selectedHour * 3600;
  const elapsedSec = Math.min(
    Math.floor((now.getTime() - session.miningStartTime.getTime()) / 1000),
    durationSec,
  );

  // Calculate tokens earned in this session
  const awarded = computeReward(elapsedSec, session.multiplier);

  // Update referral's total balance (single source of truth)
  const referral = await Referral.findOneAndUpdate(
    { walletAddress },
    { $inc: { totalBalance: awarded } },
    { new: true, upsert: false },
  );

  // Check if this user was referred by someone
  if (referral?.hasUsedReferralCode && referral.usedReferralCode) {
    // Find the referrer
    const referrer = await Referral.findOne({
      referralCode: referral.usedReferralCode,
    });

    if (referrer) {
      // Calculate 10% bonus
      // Calculate 10% bonus (allow decimals)
      const bonusAmount = awarded * 0.1;

      // Award bonus to referrer
      await Referral.findOneAndUpdate(
        { walletAddress: referrer.walletAddress },
        { $inc: { totalBalance: bonusAmount } },
      );

      // Record the bonus
      await ReferralBonus.create({
        walletAddress: referrer.walletAddress,
        referredWallet: walletAddress,
        bonusAmount,
        miningReward: awarded,
        createdAt: new Date(),
      });

      console.log(
        `🎁 Referral bonus: ${referrer.walletAddress} earned ${bonusAmount} tokens (10% of ${walletAddress}'s ${awarded} tokens)`,
      );

      // Create notification for referrer
      const shortWallet = walletAddress.length > 10
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : walletAddress;
      await Notification.create({
        walletAddress: referrer.walletAddress,
        type: 'mining_bonus',
        title: '💰 Mining Bonus Earned!',
        message: `${shortWallet} mined and you earned ${bonusAmount} tokens bonus (10% of ${awarded} tokens).`,
        data: {
          referredWallet: walletAddress,
          bonusAmount,
          miningReward: awarded,
        },
      });
    }
  }

  // Update session: when status becomes 'claimed', totalCoins = totalCoins + currentMiningPoints
  session.currentMiningPoints = awarded; // Tokens earned in this session
  session.totalCoins = session.totalCoins + awarded; // Add currentMiningPoints to totalCoins
  session.status = 'claimed';
  await session.save();

  // Log Activity for Admin Panel
  const shortWallet = walletAddress.length > 10
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

  await import('../utils/activity').then(({ logActivity }) =>
    logActivity(
      'mining_claimed',
      walletAddress,
      `${shortWallet} claimed mining reward: ${awarded.toFixed(2)} tokens`
    )
  );

  res.json({ awarded, totalBalance: referral?.totalBalance ?? awarded });
};

// Get current mining session with real-time points
export const getCurrentSession = async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const session = await MiningSession.findOne({
    walletAddress,
    status: 'mining',
  }).sort({ createdAt: -1 });

  if (!session)
    return res.status(404).json({ message: 'No active session' });

  const now = new Date();
  const durationSec = session.selectedHour * 3600;
  const elapsedSec = Math.min(
    Math.floor((now.getTime() - session.miningStartTime.getTime()) / 1000),
    durationSec,
  );

  // Calculate current mining points in real-time
  const currentMiningPoints = computeReward(elapsedSec, session.multiplier);

  res.json({
    ...session.toObject(),
    currentMiningPoints, // Real-time calculation
    elapsedSeconds: elapsedSec,
    remainingSeconds: Math.max(0, durationSec - elapsedSec),
  });
};
