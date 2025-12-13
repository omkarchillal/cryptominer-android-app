import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';
import { BannerAdComponent } from '../components/BannerAd';

export default function ClaimScreen({ navigation }: any) {
  const { claimRewards } = useMining();
  const [awarded, setAwarded] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await claimRewards();
        setAwarded(a);
      } catch (e: any) {
        Alert.alert('Claim failed', e.message);
        navigation.goBack();
      }
    })();
  }, []);

  return (
    <LinearGradient
      colors={['#581c87', '#2e2e81']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Banner Ad at Top */}
        <BannerAdComponent />

        {/* Animated background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✅</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Mining Complete!</Text>
          <Text style={styles.subtitle}>You've successfully mined tokens</Text>

          {/* Reward Display */}
          <LinearGradient
            colors={['#fbbf24', '#f97316', '#ec4899']}
            style={styles.rewardCard}
          >
            <View style={styles.cardDecorationTop} />
            <View style={styles.cardDecorationBottom} />
            <View style={styles.rewardContent}>
              <Text style={styles.rewardIcon}>💰</Text>
              <Text style={styles.rewardLabel}>Total Mined</Text>
              <Text style={styles.rewardValue}>
                {awarded?.toFixed(4) ?? '...'}
              </Text>
              <Text style={styles.rewardUnit}>Tokens</Text>
            </View>
          </LinearGradient>

          {/* Claim Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#16a34a', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>🎁 Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 192,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    borderRadius: 192,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a7f3d0',
    textAlign: 'center',
    marginBottom: 32,
  },
  rewardCard: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  cardDecorationTop: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  cardDecorationBottom: {
    position: 'absolute',
    bottom: -64,
    left: -64,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  rewardContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  rewardIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  rewardLabel: {
    color: 'rgba(254, 243, 199, 1)',
    fontSize: 12,
    marginBottom: 12,
  },
  rewardValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  rewardUnit: {
    color: 'rgba(254, 243, 199, 1)',
    fontSize: 12,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    padding: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
