import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useMining } from '../contexts/MiningContext';
import { adRewardService } from '../services/adRewardService';
import { RewardEarnedPopup } from '../components/RewardEarnedPopup';

// AdMob Rewarded Ad Unit ID for earning tokens
const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED // Test ad for development
  : 'ca-app-pub-7930332952469106/6559535492'; // Production Ad Unit ID

let rewardedAd: RewardedAd | null = null;

export default function AdRewardScreen({ navigation }: any) {
  const { walletAddress, refreshBalance } = useMining();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const appState = useRef(AppState.currentState);
  const adShownTime = useRef<number | null>(null);

  // Navigation guard - prevent navigation when popup is showing
  const safeNavigate = (route: string, force: boolean = false) => {
    if (showRewardPopup && !popupDismissed && !force) {
      console.log('🚫 Navigation blocked - reward popup is showing');
      return;
    }
    console.log(`🧭 Navigating to ${route}`);
    navigation.navigate(route);
  };

  useEffect(() => {
    // Create and load the ad when component mounts
    rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('✅ Rewarded ad loaded for token earning');
        setAdLoaded(true);
        setLoading(false);
      },
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async reward => {
        console.log('🎁 User earned reward from ad:', reward);
        setAdShown(true);
        setRewardClaimed(true);

        try {
          // Claim the ad reward from backend
          console.log('🔄 Claiming ad reward from backend...');
          const result = await adRewardService.claimReward(walletAddress);

          // Refresh balance to show new tokens
          console.log('🔄 Refreshing balance...');
          console.log('💰 Backend response:', result);

          // Small delay to ensure backend has processed the update
          await new Promise(resolve => setTimeout(resolve, 500));

          await refreshBalance();
          console.log('✅ Balance refreshed');

          console.log(
            `💰 User earned ${result.reward} tokens! (${result.claimedCount}/6 today)`,
          );

          // Show custom reward popup - this should stay visible until "Awesome" is clicked
          console.log('🎉 Showing reward popup...');
          setEarnedTokens(result.reward);
          setShowRewardPopup(true);
        } catch (error: any) {
          console.error('❌ Failed to claim ad reward:', error);

          // Check if it's a backend connection error
          const isBackendError =
            error.message?.includes('404') ||
            error.message?.includes('Network') ||
            error.message?.includes('Request failed');

          const errorTitle = isBackendError ? 'Backend Not Available' : 'Error';
          const errorMessage = isBackendError
            ? 'The backend server is not running. Please restart the backend server and try again.\n\nSee RESTART_BACKEND.md for instructions.'
            : error.message || 'Failed to claim reward. Please try again.';

          Alert.alert(errorTitle, errorMessage, [
            {
              text: 'OK',
              onPress: () => {
                safeNavigate('Home');
              },
            },
          ]);
        }
      },
    );

    // Load the ad
    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, [walletAddress]);

  useEffect(() => {
    // Show ad when it's loaded
    if (adLoaded && !adShown && rewardedAd) {
      rewardedAd
        .show()
        .then(() => {
          console.log('📺 Ad shown successfully');
          adShownTime.current = Date.now();

          // Set a timeout to navigate back if reward not claimed
          // This handles cases where ad is dismissed quickly
          const timeoutId = setTimeout(() => {
            // Only navigate if no reward was claimed and no popup is showing
            if (!rewardClaimed && !showRewardPopup && !popupDismissed) {
              console.log(
                '⚠️ Ad dismissed without completion, navigating back to Home',
              );
              safeNavigate('Home');
            } else {
              console.log(
                '✅ Reward claimed or popup showing, staying on screen',
              );
            }
          }, 5000); // Wait 5 seconds after ad is shown

          // Clear timeout if component unmounts
          return () => clearTimeout(timeoutId);
        })
        .catch(error => {
          console.error('❌ Failed to show ad:', error);
          Alert.alert(
            'Ad Unavailable',
            'Failed to show ad. Please try again later.',
            [
              {
                text: 'OK',
                onPress: () => {
                  safeNavigate('Home');
                },
              },
            ],
          );
        });
    }
  }, [
    adLoaded,
    adShown,
    rewardClaimed,
    navigation,
    showRewardPopup,
    popupDismissed,
  ]);

  // Monitor app state to detect when user closes the ad
  useEffect(() => {
    // Don't monitor app state if popup is showing or has been dismissed
    if (showRewardPopup || popupDismissed) {
      console.log(
        '🎉 Popup is showing or dismissed, skipping app state monitoring',
      );
      return;
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      // Only navigate if no popup is showing and reward not claimed
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        adShownTime.current &&
        !rewardClaimed &&
        !showRewardPopup &&
        !popupDismissed
      ) {
        const timeSinceAdShown = Date.now() - adShownTime.current;
        // If more than 2 seconds passed, assume ad was closed
        if (timeSinceAdShown > 2000) {
          console.log('⚠️ Ad was closed without completion, navigating back');
          setTimeout(() => {
            safeNavigate('Home');
          }, 500);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [rewardClaimed, navigation, showRewardPopup, popupDismissed]);

  return (
    <LinearGradient
      colors={['#581c87', '#2e2e81']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Animated background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.content}>
          <Text style={styles.icon}>💰</Text>
          <Text style={styles.title}>
            {loading ? 'Loading Ad...' : 'Showing Ad'}
          </Text>
          <Text style={styles.subtitle}>
            {loading
              ? 'Please wait while we load the advertisement'
              : 'Watch the full ad to earn 10-60 tokens!'}
          </Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.spinner} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Custom Reward Earned Popup */}
        <RewardEarnedPopup
          visible={showRewardPopup}
          tokensEarned={earnedTokens}
          onClose={async () => {
            console.log('🎉 User clicked Awesome button, closing popup');
            setPopupDismissed(true);
            setShowRewardPopup(false);

            // Refresh balance one more time to ensure it's updated
            console.log('🔄 Final balance refresh before navigation...');
            await refreshBalance();
            console.log('✅ Final balance refresh completed');

            // Navigate back to home using safe navigation (force = true since user clicked Awesome)
            safeNavigate('Home', true);
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bgCircle1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 192,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 192,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
  },
  loadingText: {
    fontSize: 14,
    color: '#e9d5ff',
    marginTop: 16,
  },
});
