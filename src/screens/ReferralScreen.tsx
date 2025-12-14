import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  Clipboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';
import { referralService } from '../services/referralService';
import { CustomPopup } from '../components/CustomPopup';

export default function ReferralScreen({ navigation }: any) {
  const { walletAddress, refreshBalance } = useMining();
  const [referralCode, setReferralCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [stats, setStats] = useState({
    referralPoints: 0,
    referralCount: 0,
    bonusEarned: 0,
    canUseReferral: true,
    hasUsedReferralCode: false,
    usedReferralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    icon: '',
    primaryButtonText: 'Okay',
    onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
  });

  useEffect(() => {
    fetchReferralStats();
  }, [walletAddress]);

  const fetchReferralStats = async () => {
    try {
      const data = await referralService.getStats(walletAddress);
      setReferralCode(data.referralCode);
      setStats({
        referralPoints: data.referralPoints,
        referralCount: data.referralCount,
        bonusEarned: data.bonusEarned || 0,
        canUseReferral: data.canUseReferral,
        hasUsedReferralCode: data.hasUsedReferralCode,
        usedReferralCode: data.usedReferralCode || '',
      });
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setPopup({
      visible: true,
      title: 'Copied!',
      message: 'Your referral code has been copied to clipboard',
      icon: '📋',
      primaryButtonText: 'Okay',
      onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
    });
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join me on Crypto Miner! Use my referral code ${referralCode} to get 100 tokens bonus! 🎁`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) {
      setPopup({
        visible: true,
        title: 'Error',
        message: 'Please enter a referral code',
        icon: '⚠️',
        primaryButtonText: 'Okay',
        onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    setLoading(true);
    try {
      const result = await referralService.applyReferralCode(
        walletAddress,
        inputCode.trim(),
      );

      await refreshBalance();
      await fetchReferralStats();

      setPopup({
        visible: true,
        title: 'Success! 🎉',
        message: result.message,
        icon: '🎉',
        primaryButtonText: 'Okay',
        onPrimaryPress: () => {
          setPopup(prev => ({ ...prev, visible: false }));
          setInputCode('');
          navigation.goBack();
        },
      });
    } catch (error: any) {
      setPopup({
        visible: true,
        title: 'Error',
        message: error.message,
        icon: '❌',
        primaryButtonText: 'Okay',
        onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#581c87', '#2e2e81']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>🎁 Referral Program</Text>
          <Text style={styles.subtitle}>
            Invite friends and earn rewards together!
          </Text>

          {/* Your Referral Code Card */}
          <LinearGradient
            colors={['#5bde8bff', '#00a542', '#004e3a']}
            style={[styles.balanceCard, styles.codeCard]}
          >
            <View style={styles.cardDecoration} />
            <Text style={styles.cardTitle}>Your Referral Code</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleCopyCode}
                activeOpacity={0.85}
                style={styles.smallButton}
              >
                <Text style={styles.smallButtonText}>📋 Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareCode}
                activeOpacity={0.85}
                style={styles.smallButton}
              >
                <Text style={styles.smallButtonText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Referral Stats</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.referralCount}</Text>
                <Text style={styles.statLabel}>Referrals</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.referralPoints}</Text>
                <Text style={styles.statLabel}>Direct Rewards</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.bonusEarned}</Text>
                <Text style={styles.statLabel}>Mining Bonus</Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>1️⃣</Text>
              <Text style={styles.infoText}>
                Share your referral code with friends
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>2️⃣</Text>
              <Text style={styles.infoText}>
                They enter your code and get 100 tokens
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>3️⃣</Text>
              <Text style={styles.infoText}>
                You get 200 tokens for each referral!
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>4️⃣</Text>
              <Text style={styles.infoText}>
                Earn 10% bonus from their mining rewards forever!
              </Text>
            </View>
          </View>

          {/* Use Referral Code Section */}
          {stats.canUseReferral ? (
            <View style={styles.inputCard}>
              <Text style={styles.inputTitle}>Have a Referral Code?</Text>
              <Text style={styles.inputSubtitle}>
                Enter a code to get 100 tokens bonus!
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter referral code"
                placeholderTextColor="#9ca3af"
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
                maxLength={8}
              />

              <TouchableOpacity
                onPress={handleApplyCode}
                disabled={loading}
                style={styles.applyButton}
              >
                <LinearGradient
                  colors={
                    loading ? ['#6b7280', '#4b5563'] : ['#3b82f6', '#2563eb']
                  }
                  style={styles.applyButtonGradient}
                >
                  <Text style={styles.applyButtonText}>
                    {loading ? 'Applying...' : 'Apply Code'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.usedCard}>
              <Text style={styles.usedIcon}>✅</Text>
              <Text style={styles.usedTitle}>Referral Code Used</Text>
              <Text style={styles.usedText}>
                You used code: {stats.usedReferralCode}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        icon={popup.icon}
        primaryButtonText={popup.primaryButtonText}
        onPrimaryPress={popup.onPrimaryPress}
        onClose={() => setPopup(prev => ({ ...prev, visible: false }))}
      />
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
    top: '20%',
    left: '20%',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 150,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
    width: 300,
    height: 300,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 150,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 32,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16, // same as balanceCard
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  codeContainer: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  codeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#e9d5ff',
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  inputSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  usedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  usedIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  usedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  usedText: {
    fontSize: 14,
    color: '#d1fae5',
  },
  smallButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDecoration: {
    position: 'absolute',
    top: -44,
    right: -44,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  balanceCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
});
