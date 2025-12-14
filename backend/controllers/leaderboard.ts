import { Request, Response } from 'express';
import { MiningSession } from '../models/MiningSession';
import { Referral } from '../models/Referral';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // Get the most recent mining session for each wallet address
    const miningData = await MiningSession.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$walletAddress',
          totalCoins: { $first: '$totalCoins' },
        },
      },
    ]);

    // Get all referral data
    const referralData = await Referral.find({}, {
      walletAddress: 1,
      totalBalance: 1,
    });

    // Create a map to combine mining and referral data
    const userBalances = new Map<string, number>();

    // Add mining balances
    miningData.forEach(session => {
      userBalances.set(session._id, session.totalCoins || 0);
    });

    // Add or update with referral balances (referral totalBalance is the source of truth)
    referralData.forEach(referral => {
      userBalances.set(referral.walletAddress, referral.totalBalance || 0);
    });

    // Convert to leaderboard format and sort
    const leaderboard = Array.from(userBalances.entries())
      .map(([walletAddress, totalCoins]) => ({
        walletAddress,
        totalCoins,
      }))
      .filter(user => user.totalCoins > 0) // Only show users with positive balance
      .sort((a, b) => b.totalCoins - a.totalCoins) // Sort by totalCoins descending
      .slice(0, 100); // Limit to top 100

    console.log(`📊 Leaderboard: ${leaderboard.length} users (including referral-only users)`);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};
