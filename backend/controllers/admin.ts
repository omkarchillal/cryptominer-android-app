import { Request, Response } from 'express';
import { User } from '../models/User';
import { MiningSession } from '../models/MiningSession';
import { Referral } from '../models/Referral';
import { AdReward } from '../models/AdReward';
import { Payment } from '../models/Payment';
import { Activity } from '../models/Activity';

export async function getDashboardStats(_req: Request, res: Response) {
  try {
    const totalUsers = await User.countDocuments();
    const activeMiningSessions = await MiningSession.countDocuments({
      status: 'mining',
    });
    const totalReferrals = await Referral.countDocuments();
    const totalRewardsClaimed = await AdReward.countDocuments({
      claimed: true,
    });

    // Get total balance from Referral collection (Source of Truth)
    const balanceResult = await Referral.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$totalBalance' },
        },
      },
    ]);

    const totalBalance = balanceResult[0]?.totalBalance || 0;

    // Calculate average mining rate
    const activeSessions = await MiningSession.find({ status: 'mining' });
    const avgMiningRate =
      activeSessions.length > 0
        ? activeSessions.reduce((sum, s) => sum + 0.01 * s.multiplier, 0) /
        activeSessions.length
        : 0;

    // Count total transactions (mining sessions + payments)
    const totalMiningSessions = await MiningSession.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalTransactions = totalMiningSessions + totalPayments;

    // Calculate success rate (claimed sessions / total sessions)
    const claimedSessions = await MiningSession.countDocuments({
      status: 'claimed',
    });
    const successRate =
      totalMiningSessions > 0
        ? (claimedSessions / totalMiningSessions) * 100
        : 0;

    res.json({
      totalUsers,
      activeMiningSessions,
      totalReferrals,
      totalRewardsClaimed,
      totalBalance,
      avgMiningRate,
      totalTransactions,
      successRate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    // Build search query
    const query: any = {};
    if (search) {
      query.walletAddress = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments(query);

    // Enrich user data with balance, mining rate, referral code, and status
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Get referral data
        const referral = await Referral.findOne({
          walletAddress: user.walletAddress,
        });

        // Get latest mining session for balance
        const latestSession = await MiningSession.findOne({
          walletAddress: user.walletAddress,
        }).sort({ createdAt: -1 });

        // Check for active mining session
        const activeSession = await MiningSession.findOne({
          walletAddress: user.walletAddress,
          status: 'mining',
        });

        // Calculate mining rate (coins per hour)
        const baseRate = 0.01; // BASE_RATE from env
        const multiplier = activeSession?.multiplier || 1;
        const miningRate = baseRate * multiplier;

        return {
          ...user.toObject(),
          balance: latestSession?.totalCoins || referral?.totalBalance || 0,
          miningRate: miningRate,
          referralCode: referral?.referralCode || 'N/A',
          status: activeSession ? 'active' : 'inactive',
          totalReferrals: referral?.totalReferrals || 0,
        };
      }),
    );

    res.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getAllMiningSessions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const sessions = await MiningSession.find()
      .sort({ miningStartTime: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await MiningSession.countDocuments();

    // Enrich session data with calculated mining rate
    const enrichedSessions = sessions.map((session) => {
      const baseRate = 0.01; // BASE_RATE from env
      const miningRate = baseRate * session.multiplier;

      return {
        ...session.toObject(),
        walletAddress: session.walletAddress,
        currentMiningPoints: session.currentMiningPoints, // Current session tokens
        totalEarned: session.totalCoins, // Total balance
        miningRate: miningRate,
        status: session.status === 'mining' ? 'active' : 'claimed',
        startTime: session.miningStartTime,
        multiplier: session.multiplier,
        selectedHour: session.selectedHour,
      };
    });

    res.json({
      sessions: enrichedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mining sessions' });
  }
}

export async function getAllPayments(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get all users
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Enrich with balance and payment status
    const enrichedPayments = await Promise.all(
      users.map(async (user) => {
        // Get latest mining session for balance
        const latestSession = await MiningSession.findOne({
          walletAddress: user.walletAddress,
        }).sort({ createdAt: -1 });

        const balance = latestSession?.totalCoins || 0;

        // Check for latest payment record
        const latestPayment = await Payment.findOne({
          walletAddress: user.walletAddress,
        }).sort({ createdAt: -1 });

        // Determine payment status
        let paymentStatus = 'unpaid';
        if (latestPayment) {
          if (latestPayment.status === 'paid') {
            paymentStatus = 'paid';
          } else if (latestPayment.status === 'pending') {
            paymentStatus = 'pending';
          }
        }

        return {
          walletAddress: user.walletAddress,
          balance: balance,
          usdValue: balance * 45000, // BTC to USD conversion
          paymentStatus: paymentStatus,
          lastPayment: latestPayment?.paidAt || null,
          createdAt: user.createdAt,
        };
      }),
    );

    res.json({
      payments: enrichedPayments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

export async function processPayment(req: Request, res: Response) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Get user's balance
    const latestSession = await MiningSession.findOne({
      walletAddress,
    }).sort({ createdAt: -1 });

    const balance = latestSession?.totalCoins || 0;

    if (balance <= 0) {
      return res.status(400).json({ error: 'No balance to pay' });
    }

    // Create payment record
    const payment = await Payment.create({
      walletAddress,
      amount: balance,
      status: 'paid',
      paidAt: new Date(),
      transactionHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`, // Mock transaction hash
    });

    // In a real application, you would:
    // 1. Process actual blockchain transaction
    // 2. Wait for confirmation
    // 3. Update payment status
    // 4. Reset user balance

    // For demo purposes, we'll just mark as paid
    console.log(
      `✅ Payment processed: ${walletAddress} | Amount: ${balance} BTC`,
    );

    res.json({
      success: true,
      payment: {
        walletAddress: payment.walletAddress,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        transactionHash: payment.transactionHash,
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
}

export async function getAllReferrals(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get all referrals (users who have used a referral code)
    const referrals = await Referral.find({ hasUsedReferralCode: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Referral.countDocuments({ hasUsedReferralCode: true });

    // Enrich referral data with referrer info and bonuses
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        // Find the referrer (who owns the code that was used)
        const referrer = await Referral.findOne({
          referralCode: referral.usedReferralCode,
        });

        // Get referral mining bonuses for this relationship
        const bonuses = await import('../models/ReferralBonus').then(
          ({ ReferralBonus }) =>
            ReferralBonus.find({
              walletAddress: referrer?.walletAddress,
              referredWallet: referral.walletAddress,
            }),
        );

        // Calculate total mining bonus amount (10% commissions)
        // Filter out records where miningReward is 0 (which are fixed signup bonuses)
        const totalMiningBonus = bonuses.reduce(
          (sum, b) => (b.miningReward > 0 ? sum + b.bonusAmount : sum),
          0,
        );

        // Constants for signup rewards (as defined in referral controller)
        const REFERRER_SIGNUP_BONUS = 200;
        const REFERRED_SIGNUP_BONUS = 100;

        return {
          referrerWallet: referrer?.walletAddress || 'Unknown',
          referredWallet: referral.walletAddress,
          referralCode: referral.usedReferralCode || 'N/A',
          referrerBonus: REFERRER_SIGNUP_BONUS, // Fixed 200 tokens
          referredReward: REFERRED_SIGNUP_BONUS, // Fixed 100 tokens
          miningBonus: totalMiningBonus, // Accumulated mining commissions
          createdAt: referral.createdAt,
        };
      }),
    );

    res.json({
      referrals: enrichedReferrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
}

export async function getAllDailyRewards(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const rewards = await AdReward.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await AdReward.countDocuments();

    // Enrich rewards with status (since they exist in DB, they are claimed)
    const enrichedRewards = rewards.map((reward) => ({
      ...reward.toObject(),
      claimed: true,
      claimedAt: reward.createdAt,
    }));

    res.json({
      rewards: enrichedRewards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily rewards' });
  }
}


export async function getActivities(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    // Fetch recent activities from Activity collection
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    // If no activities in Activity collection, generate from existing data
    if (activities.length === 0) {
      const generatedActivities = [];

      // Get recent users
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(10);
      for (const user of recentUsers) {
        generatedActivities.push({
          type: 'user_created',
          walletAddress: user.walletAddress,
          description: `New user registered`,
          createdAt: user.createdAt,
        });
      }

      // Get recent mining sessions
      const recentSessions = await MiningSession.find()
        .sort({ miningStartTime: -1 })
        .limit(10);
      for (const session of recentSessions) {
        if (session.status === 'mining') {
          generatedActivities.push({
            type: 'mining_started',
            walletAddress: session.walletAddress,
            description: `Started mining session`,
            createdAt: session.miningStartTime,
          });
        } else {
          generatedActivities.push({
            type: 'mining_claimed',
            walletAddress: session.walletAddress,
            description: `Claimed mining rewards`,
            createdAt: session.miningStartTime,
          });
        }
      }

      // Get recent referrals
      const recentReferrals = await Referral.find({
        hasUsedReferralCode: true,
      })
        .sort({ createdAt: -1 })
        .limit(10);
      for (const referral of recentReferrals) {
        generatedActivities.push({
          type: 'referral_created',
          walletAddress: referral.walletAddress,
          description: `Used referral code ${referral.usedReferralCode}`,
          createdAt: referral.createdAt,
        });
      }

      // Get recent ad rewards
      const recentRewards = await AdReward.find({ claimed: true })
        .sort({ claimedAt: -1 })
        .limit(10);
      for (const reward of recentRewards) {
        generatedActivities.push({
          type: 'reward_claimed',
          walletAddress: reward.walletAddress,
          description: `Claimed daily reward`,
          createdAt: reward.createdAt,
        });
      }

      // Get recent payments
      const recentPayments = await Payment.find({ status: 'paid' })
        .sort({ paidAt: -1 })
        .limit(10);
      for (const payment of recentPayments) {
        generatedActivities.push({
          type: 'payment_processed',
          walletAddress: payment.walletAddress,
          description: `Payment processed: ${payment.amount.toFixed(8)} BTC`,
          createdAt: payment.paidAt || new Date(),
        });
      }

      // Sort by date and limit
      const sortedActivities = generatedActivities
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);

      return res.json({ activities: sortedActivities });
    }

    res.json({ activities });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // 1. Delete Primary User Record
    const userResult = await User.deleteOne({ walletAddress });
    if (userResult.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Delete Referral Record
    await Referral.deleteOne({ walletAddress });

    // 3. Delete Mining Sessions
    await MiningSession.deleteMany({ walletAddress });

    // 4. Delete Ad Rewards
    await AdReward.deleteMany({ walletAddress });

    // 5. Delete Payments
    await Payment.deleteMany({ walletAddress });

    // 6. Delete Activities
    await Activity.deleteMany({ walletAddress });

    // 7. Delete Notifications (optional, if you have this model)
    // await Notification.deleteMany({ walletAddress });

    // 8. Delete Referral Bonuses
    // Delete bonuses earned BY this user (as referrer)
    await import('../models/ReferralBonus').then(({ ReferralBonus }) =>
      ReferralBonus.deleteMany({ walletAddress }),
    );
    // Delete bonuses earned FOR this user (as referee) - optional, keeping for data integrity of referrer
    // But user requested "all data belong to the user", so we delete where they are the source too?
    // Let's delete where they are the referredWallet as well to be clean.
    await import('../models/ReferralBonus').then(({ ReferralBonus }) =>
      ReferralBonus.deleteMany({ referredWallet: walletAddress }),
    );

    // Log activity
    const shortWallet = walletAddress.length > 10
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

    await import('../utils/activity').then(({ logActivity }) =>
      logActivity('user_deleted', walletAddress, `Admin deleted user: ${shortWallet}`)
    );

    console.log(`🗑️ User deleted: ${walletAddress} and all associated data.`);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}
