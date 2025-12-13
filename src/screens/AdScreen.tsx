import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useMining } from '../contexts/MiningContext';

// ✅ ADMOB REWARDED AD UNIT ID - CONFIGURED ✅
// Development: Uses TestIds.REWARDED (test ads)
// Production: Uses your actual Ad Unit ID from AdMob console
// Your Ad Unit ID: ca-app-pub-7930332952469106/6559535492
const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED // Test ad for development
  : 'ca-app-pub-7930332952469106/6559535492'; // ✅ YOUR PRODUCTION AD UNIT ID

let rewardedAd: RewardedAd | null = null;

export default function AdScreen({ navigation }: any) {
  const { upgradeMultiplier } = useMining();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create and load the ad when component mounts
    rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('✅ Rewarded ad loaded');
        setAdLoaded(true);
        setLoading(false);
      },
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('🎁 User earned reward:', reward);
        setAdShown(true);
        // Upgrade multiplier after user earns reward
        upgradeMultiplier()
          .then(() => {
            console.log('✅ Multiplier upgraded');
            // Navigate back safely
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          })
          .catch(error => {
            console.error('❌ Failed to upgrade multiplier:', error);
            Alert.alert('Error', 'Failed to upgrade multiplier');
            // Navigate back safely
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          });
      },
    );

    // Load the ad
    rewardedAd.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  useEffect(() => {
    // Show ad when it's loaded
    if (adLoaded && !adShown && rewardedAd) {
      rewardedAd
        .show()
        .then(() => {
          console.log('📺 Ad shown successfully');
          // Ad is now showing, EARNED_REWARD event will handle completion
        })
        .catch(error => {
          console.error('❌ Failed to show ad:', error);
          Alert.alert(
            'Ad Unavailable',
            'Failed to show ad. Please try again later.',
          );
          // Navigate back safely
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        });
    }
  }, [adLoaded, adShown]);

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
          <Text style={styles.icon}>📺</Text>
          <Text style={styles.title}>
            {loading ? 'Loading Ad...' : 'Showing Ad'}
          </Text>
          <Text style={styles.subtitle}>
            {loading
              ? 'Please wait while we load the advertisement'
              : 'Watch the full ad to unlock multiplier boost'}
          </Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.spinner} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>
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
