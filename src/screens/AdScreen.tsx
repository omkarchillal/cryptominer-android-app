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
import { adManager } from '../services/adManager';

export default function AdScreen({ navigation }: any) {
  const { upgradeMultiplier } = useMining();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [loading, setLoading] = useState(true);

  // AdManager integration
  const [adInstance, setAdInstance] = useState<RewardedAd | null>(null);

  useEffect(() => {
    // Check if ad is already ready in AdManager
    if (adManager.isReady()) {
      console.log('✅ AdManager: Ad already ready for multiplier, using instance');
      const ad = adManager.getAd();
      if (ad) {
        setAdInstance(ad);
        setAdLoaded(true);
        setLoading(false);
      }
    } else {
      console.log('⏳ AdManager: Ad not ready for multiplier, waiting...');
      // Subscribe to updates
      const unsubscribe = adManager.subscribe(() => {
        if (adManager.isReady()) {
          console.log('✅ AdManager: Ad became ready for multiplier');
          const ad = adManager.getAd();
          if (ad) {
            setAdInstance(ad);
            setAdLoaded(true);
            setLoading(false);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!adInstance) return;

    const unsubscribeEarned = adInstance.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('🎁 User earned reward (multiplier):', reward);
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

    // Show the ad
    adInstance
      .show()
      .then(() => {
        console.log('📺 Ad shown successfully');
      })
      .catch(error => {
        console.error('❌ Failed to show ad:', error);
        Alert.alert(
          'Ad Unavailable',
          'Failed to show ad. Please try again later.',
          [
            { text: "OK", onPress: () => navigation.goBack() }
          ]
        );
      });

    return () => {
      unsubscribeEarned();
    };
  }, [adInstance]);

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
