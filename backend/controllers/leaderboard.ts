import { Request, Response } from 'express';
import { MiningSession } from '../models/MiningSession';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // Get the most recent session for each wallet address and their totalCoins
    const leaderboard = await MiningSession.aggregate([
      {
        // Sort by createdAt descending to get latest sessions first
        $sort: { createdAt: -1 },
      },
      {
        // Group by walletAddress and take the first (most recent) session
        $group: {
          _id: '$walletAddress',
          totalCoins: { $first: '$totalCoins' },
        },
      },
      {
        // Sort by totalCoins in descending order
        $sort: { totalCoins: -1 },
      },
      {
        // Limit to top 100 users
        $limit: 100,
      },
      {
        // Reshape the output
        $project: {
          _id: 0,
          walletAddress: '$_id',
          totalCoins: 1,
        },
      },
    ]);

    console.log(`📊 Leaderboard: ${leaderboard.length} users`);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};
