import { api } from './api';

export interface ReferralStats {
  referralCode: string;
  hasUsedReferralCode: boolean;
  usedReferralCode?: string;
  referralPoints: number;
  referralCount: number;
  bonusEarned: number;
  canUseReferral: boolean;
}

export interface ApplyReferralResponse {
  success: boolean;
  userReward: number;
  referrerReward: number;
  newBalance: number;
  message: string;
}

class ReferralService {
  async getStats(walletAddress: string): Promise<ReferralStats> {
    try {
      const response = await api.get(`/api/referral/stats/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get referral stats:', error);
      throw error;
    }
  }

  async applyReferralCode(
    walletAddress: string,
    referralCode: string,
  ): Promise<ApplyReferralResponse> {
    try {
      const response = await api.post('/api/referral/apply', {
        walletAddress,
        referralCode: referralCode.toUpperCase(),
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to apply referral code';
      throw new Error(errorMessage);
    }
  }
}

export const referralService = new ReferralService();
