import { Request, Response } from 'express';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { ReferralBonus } from '../models/ReferralBonus';
import { Notification } from '../models/Notification';

// Apply referral code
export const applyReferralCode = async (req: Request, res: Response) => {
  try {
    const { walletAddress, referralCode } = req.body;

    if (!walletAddress || !referralCode) {
      return res
        .status(400)
        .json({ error: 'Wallet address and referral code required' });
    }

    // Find the user who is applying the code
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find user's referral record
    const userReferral = await Referral.findOne({ walletAddress });
    if (!userReferral) {
      return res.status(404).json({ error: 'Referral record not found' });
    }

    // Check if user has already used a referral code
    if (userReferral.hasUsedReferralCode) {
      return res
        .status(400)
        .json({ error: 'You have already used a referral code' });
    }

    // Check if user is trying to use their own code
    if (userReferral.referralCode === referralCode.toUpperCase()) {
      return res
        .status(400)
        .json({ error: 'You cannot use your own referral code' });
    }

    // Find the referral record of the code owner
    const referrerReferral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
    });
    if (!referrerReferral) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Find the referrer user
    const referrer = await User.findOne({
      walletAddress: referrerReferral.walletAddress,
    });
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    // Award tokens
    const REFERRER_REWARD = 200; // Tokens for code owner
    const USER_REWARD = 100; // Tokens for code user

    // Update referrer (code owner)
    referrerReferral.totalBalance += REFERRER_REWARD;
    referrerReferral.totalReferralPoints += REFERRER_REWARD;
    referrerReferral.totalReferrals += 1;
    await referrerReferral.save();

    // Update user (code user)
    userReferral.totalBalance += USER_REWARD;
    userReferral.hasUsedReferralCode = true;
    userReferral.usedReferralCode = referralCode.toUpperCase();
    await userReferral.save();

    // Create a bonus record for the referrer so it appears in history
    await ReferralBonus.create({
      walletAddress: referrerReferral.walletAddress,
      referredWallet: walletAddress,
      bonusAmount: REFERRER_REWARD,
      miningReward: 0, // 0 indicates this is a fixed signup reward, not from mining
    });

    console.log(
      `🎁 Referral applied: ${walletAddress} used ${referralCode} | Referrer earned ${REFERRER_REWARD}, User earned ${USER_REWARD}`,
    );

    // Create notification for referrer (user1 - code owner)
    const shortWallet = walletAddress.length > 10
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;
    await Notification.create({
      walletAddress: referrerReferral.walletAddress,
      type: 'referral_used',
      title: '🎉 New Referral!',
      message: `${shortWallet} used your referral code! You earned ${REFERRER_REWARD} tokens.`,
      data: {
        referredWallet: walletAddress,
        reward: REFERRER_REWARD,
        referralCode: referralCode.toUpperCase(),
      },
    });

    // Create notification for user who used the code (user2 - code user)
    const shortReferrerWallet = referrerReferral.walletAddress.length > 10
      ? `${referrerReferral.walletAddress.slice(0, 6)}...${referrerReferral.walletAddress.slice(-4)}`
      : referrerReferral.walletAddress;
    await Notification.create({
      walletAddress: walletAddress,
      type: 'referral_bonus',
      title: '🎁 Referral Bonus Received!',
      message: `You used ${shortReferrerWallet}'s referral code and earned ${USER_REWARD} tokens!`,
      data: {
        referrerWallet: referrerReferral.walletAddress,
        reward: USER_REWARD,
        referralCode: referralCode.toUpperCase(),
      },
    });

    return res.json({
      success: true,
      userReward: USER_REWARD,
      referrerReward: REFERRER_REWARD,
      newBalance: userReferral.totalBalance,
      message: `Success! You earned ${USER_REWARD} tokens and ${referrerReferral.walletAddress.slice(0, 6)}... earned ${REFERRER_REWARD} tokens!`,
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return res.status(500).json({ error: 'Failed to apply referral code' });
  }
};

// Get referral stats
export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const referral = await Referral.findOne({ walletAddress });
    if (!referral) {
      return res.status(404).json({ error: 'Referral record not found' });
    }

    // Count how many users used this user's referral code
    const referralCount = await Referral.countDocuments({
      usedReferralCode: referral.referralCode,
    });

    // Calculate total bonus earned from referrals' mining
    const totalBonusEarned = await ReferralBonus.aggregate([
      { $match: { walletAddress } },
      { $group: { _id: null, total: { $sum: '$bonusAmount' } } },
    ]);

    const bonusEarned = totalBonusEarned[0]?.total || 0;

    return res.json({
      referralCode: referral.referralCode,
      hasUsedReferralCode: referral.hasUsedReferralCode,
      usedReferralCode: referral.usedReferralCode,
      referralPoints: referral.totalReferralPoints,
      referralCount: referral.totalReferrals,
      bonusEarned,
      canUseReferral: !referral.hasUsedReferralCode,
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return res.status(500).json({ error: 'Failed to get referral stats' });
  }
};

// Get referral bonus history
export const getReferralBonusHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Get bonus history
    const bonuses = await ReferralBonus.find({ walletAddress })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate total
    const total = bonuses.reduce((sum, b) => sum + b.bonusAmount, 0);

    return res.json({
      bonuses,
      total,
      count: bonuses.length,
    });
  } catch (error) {
    console.error('Error getting referral bonus history:', error);
    return res
      .status(500)
      .json({ error: 'Failed to get referral bonus history' });
  }
};
