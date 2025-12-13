import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useMining } from '../contexts/MiningContext';
import { ProgressBar } from '../components/ProgressBar';
import { BannerAdComponent } from '../components/BannerAd';

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${ss
    .toString()
    .padStart(2, '0')}`;
};

export default function MiningScreen({ navigation }: any) {
  const { remainingSeconds, selectedDuration, liveTokens, currentMultiplier } =
    useMining();

  const progress =
    selectedDuration > 0
      ? (selectedDuration - remainingSeconds) / selectedDuration
      : 0;
  const finished = remainingSeconds === 0 && selectedDuration > 0;

  const durationHours = selectedDuration / 3600;
  const baseRate = 0.01;
  const effectiveRate = baseRate * currentMultiplier;
  const totalReward = effectiveRate * selectedDuration;

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
        <View style={styles.bgCircle3} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            }}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LottieView
              source={require('../assets/bitcoin_loader.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.mainTitle}>Mining in Progress</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </View>

          {/* Timer Card */}
          <LinearGradient
            colors={['#3b82f6', '#9333ea', '#ec4899']}
            style={styles.timerCard}
          >
            <View style={styles.cardDecoration} />
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={styles.timerValue}>
              {fmt(Math.max(0, remainingSeconds))}
            </Text>
          </LinearGradient>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.cardTitle}>Mining Progress</Text>
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
              <View style={styles.progressOverlay}>
                <Text style={styles.progressText}>
                  {(Math.min(progress, 1) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Tokens Mined Card */}
          <LinearGradient
            colors={['#fbbf24', '#f97316', '#ec4899']}
            style={styles.tokensCard}
          >
            <View style={styles.cardDecorationBottom} />
            <Text style={styles.tokensIcon}>💰</Text>
            <Text style={styles.tokensLabel}>Tokens Mined</Text>
            <Text style={styles.tokensValue}>{liveTokens.toFixed(6)}</Text>
            <Text style={styles.tokensTotal}>
              / {totalReward.toFixed(4)} total
            </Text>
          </LinearGradient>

          {/* Mining Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{durationHours}h</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Multiplier</Text>
                <Text style={styles.infoValue}>{currentMultiplier}×</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rate</Text>
                <Text style={styles.infoValueSmall}>
                  {effectiveRate.toFixed(6)}/s
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Ad')}
              activeOpacity={0.8}
              disabled={finished || currentMultiplier >= 6}
              style={styles.buttonHalf}
            >
              <LinearGradient
                colors={
                  finished || currentMultiplier >= 6
                    ? ['#6b7280', '#4b5563']
                    : ['#ca8a04', '#ea580c']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {currentMultiplier >= 6
                    ? '✅ Max Multiplier'
                    : '⚡ Upgrade Multiplier'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Claim')}
              activeOpacity={0.8}
              disabled={!finished}
              style={styles.buttonHalf}
            >
              <LinearGradient
                colors={
                  finished ? ['#16a34a', '#059669'] : ['#6b7280', '#4b5563']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {finished ? '✅ Claim Rewards' : '⏳ Claim (Mining...)'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 192,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 17,
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    marginBottom: 1,
  },
  mainTitle: {
    fontSize: 35,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.3)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerCard: {
    borderRadius: 16,
    padding: 5,
    marginBottom: 17,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDecoration: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 80,
  },
  cardDecorationBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 80,
  },
  timerLabel: {
    color: 'rgba(191, 219, 254, 1)',
    fontSize: 16,
    marginBottom: 8,
    zIndex: 10,
  },
  timerValue: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    zIndex: 10,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    // elevation: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 13,
    paddingVertical: 6,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#371e1eff',
    fontSize: 15,
    fontWeight: '700',
  },
  progressInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 5,
    alignItems: 'center',
  },
  progressInfoLabel: {
    color: '#e9d5ff',
    fontSize: 12,
    marginBottom: 4,
  },
  progressInfoValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  tokensCard: {
    borderRadius: 16,
    padding: 9,
    marginBottom: 17,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tokensIcon: {
    fontSize: 48,
    marginBottom: 3,
    zIndex: 10,
  },
  tokensLabel: {
    color: 'rgba(254, 243, 199, 1)',
    fontSize: 14,
    zIndex: 10,
  },
  tokensValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    zIndex: 10,
  },
  tokensTotal: {
    color: 'rgba(254, 243, 199, 1)',
    fontSize: 17,

    zIndex: 10,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    // elevation: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 9,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#e9d5ff',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoValueSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonHalf: {
    flex: 1,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
