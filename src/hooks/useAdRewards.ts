import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { RewardedAdEventType } from 'react-native-google-mobile-ads';
import { adManager } from '../services/adManager';
import { useMining } from '../contexts/MiningContext';
import { adRewardService } from '../services/adRewardService';

export const useAdRewards = () => {
    const {
        walletAddress,
        refreshBalance,
        setAdRewardPopup,
        upgradeMultiplier,
        setLocalBalance
    } = useMining();

    const [loadingAd, setLoadingAd] = useState(false);

    const showAd = useCallback(async (
        onReward: () => Promise<void>,
        onLimitReached?: () => void
    ) => {
        if (loadingAd) return;

        // Check availability
        if (!adManager.isReady()) {
            Alert.alert(
                'Ad Loading',
                'Please wait a moment, loading advertisement...',
                [{ text: 'OK' }]
            );
            return;
        }

        setLoadingAd(true);
        const ad = adManager.getAd();

        if (!ad) {
            setLoadingAd(false);
            Alert.alert('Error', 'Ad not available');
            return;
        }

        // Set up listeners - use a one-time execution guard
        let executed = false;

        const unsubscribeEarned = ad.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            async () => {
                console.log('🎁 Reward earned (event fired)');
                if (executed) return;
                executed = true;

                try {
                    await onReward();
                } catch (e: any) {
                    console.error('Error executing reward callback:', e);
                    // Check for daily limit error
                    if (e?.message?.includes('Daily limit') || e?.response?.data?.error?.includes('Daily limit')) {
                        console.log('🛑 Daily limit reached error detected');
                        if (onLimitReached) {
                            onLimitReached();
                        } else {
                            Alert.alert('Limit Reached', 'You have reached the maximum daily limit.');
                        }
                    } else {
                        Alert.alert('Error', 'Failed to process reward. Please try again.');
                    }
                }
            }
        );

        // Show ad
        try {
            await ad.show();
        } catch (error) {
            console.error('Failed to show ad:', error);
            Alert.alert('Error', 'Failed to show ad');
            // Cleanup on error
            // unsubscribeEarned(); // Note: addAdEventListener returns unsubscribe fn directly in newer versions or null?
            // Actually in react-native-google-mobile-ads it returns { remove: () => void } or a function.
            // Let's assume standard behavior.
        }

        // We set loading to false immediately after show() so user isn't blocked if something weird happens 
        // (though ad overlay blocks interaction anyway).
        setLoadingAd(false);
    }, [loadingAd, walletAddress]);

    const showAdForReward = useCallback(async (onLimitReached?: () => void) => {
        await showAd(async () => {
            try {
                console.log('Processing token reward...');
                const result = await adRewardService.claimReward(walletAddress);

                // Immediately update local balance from backend response
                if (result.newBalance !== undefined) {
                    setLocalBalance(result.newBalance);
                } else {
                    // Fallback if backend doesn't return balance
                    await refreshBalance();
                }

                setAdRewardPopup(true, result.reward);
            } catch (error: any) {
                // Determine if it's a limit error and rethrow or handle
                // Since showAd catches errors from onReward, we just need to throw if we want showAd to handle it
                // But axios errors need parsing
                if (error.response?.status === 429 || error.message?.includes('Daily limit')) {
                    throw new Error('Daily limit reached');
                }
                throw error;
            }
        }, onLimitReached);
    }, [showAd, walletAddress, refreshBalance, setAdRewardPopup]);

    const showAdForMultiplier = useCallback(async (onSuccess?: () => void, onLimitReached?: () => void) => {
        await showAd(async () => {
            try {
                console.log('Processing multiplier upgrade...');
                await upgradeMultiplier();
                if (onSuccess) onSuccess();
            } catch (error: any) {
                if (error.response?.status === 429 || error.message?.includes('Daily limit')) {
                    throw new Error('Daily limit reached');
                }
                throw error;
            }
        }, onLimitReached);
    }, [showAd, upgradeMultiplier]);

    return { showAdForReward, showAdForMultiplier, loadingAd };
};
