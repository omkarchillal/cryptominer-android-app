import { api } from './api';

export interface AdRewardStatus {
  claimedCount: number;
  remainingClaims: number;
  maxClaims: number;
  canClaim: boolean;
  lastClaimTime?: Date;
}

export interface ClaimAdRewardResponse {
  success: boolean;
  reward: number;
  newBalance: number;
  claimedCount: number;
  remainingClaims: number;
}

class AdRewardService {
  async getStatus(walletAddress: string): Promise<AdRewardStatus> {
    try {
      const response = await api.get(`/api/ad-rewards/status/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get ad reward status:', error);
      throw error;
    }
  }

  async claimReward(walletAddress: string): Promise<ClaimAdRewardResponse> {
    try {
      const response = await api.post('/api/ad-rewards/claim', {
        walletAddress,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error(
          error.response.data.message || 'Daily limit reached',
        );
      }
      console.error('Failed to claim ad reward:', error);
      throw error;
    }
  }
}

export const adRewardService = new AdRewardService();
