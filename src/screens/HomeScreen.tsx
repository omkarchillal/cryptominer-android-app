import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useMining } from '../contexts/MiningContext';
import { DurationPopup } from '../components/DurationPopup';
import { BannerAdComponent } from '../components/BannerAd';
import { NotificationIcon } from '../components/NotificationIcon';
import { RewardEarnedPopup } from '../components/RewardEarnedPopup';
import { CustomPopup } from '../components/CustomPopup';
import { CustomRefreshControl } from '../components/CustomRefreshControl';

import { useAdRewards } from '../hooks/useAdRewards';

export default function HomeScreen({ navigation }: any) {
  const {
    // ... existing ref ...
    totalBalance,
    miningStatus,
    currentMultiplier,
    startMining,
    refreshBalance,
    walletAddress,
    walletBalance,
    logout,
    hasUnclaimedRewards,
    config,
    configLoading,
    showAdRewardPopup,
    adRewardTokens,
    setAdRewardPopup,
    adRewardStatus,
  } = useMining();

  const { showAdForReward, showAdForMultiplier, loadingAd } = useAdRewards(); // Use our new hook

  // ... existing state ...
  const [popup, setPopup] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [adLimitPopup, setAdLimitPopup] = useState(false);
  const [notificationPopup, setNotificationPopup] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [miningErrorPopup, setMiningErrorPopup] = useState({
    visible: false,
    message: '',
  });


  const [notificationKey, setNotificationKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const isMining = miningStatus === 'active';
  const canClaim = hasUnclaimedRewards;



  const handleWatchAd = () => {
    if (!adRewardStatus.canClaim) {
      setAdLimitPopup(true);
      return;
    }

    // Trigger ad directly using hook
    showAdForReward(() => {
      // Handle limit reached
      setAdLimitPopup(true);
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBalance();
      setNotificationKey(prev => prev + 1); // Force notification icon to refresh
    } catch (error) {
      console.error('Error refreshing HomeScreen:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh ad status, balance, and notifications when returning to this screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (walletAddress) {
        refreshBalance(); // Refresh balance to show new referral bonuses
        setNotificationKey(prev => prev + 1); // Force notification icon to refresh

        // Check if we should show the ad reward popup
        if (showAdRewardPopup) {
          console.log('🎉 HomeScreen focused with ad reward popup to show');
        }
      }
    });

    return unsubscribe;
  }, [navigation, walletAddress, showAdRewardPopup]);

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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="transparent"
              colors={['transparent']}
              progressBackgroundColor="transparent"
            />
          }
        >
          <CustomRefreshControl refreshing={refreshing} />
          {/* Header */}
          <View style={styles.header}>
            {/* Top Buttons Row - Leaderboard, Notifications, and Logout */}
            <View style={styles.topButtonsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LeaderBoard')}
                activeOpacity={0.8}
                style={styles.leaderboardButton}
              >
                <Text style={styles.leaderboardButtonText}>🏆 Leaderboard</Text>
              </TouchableOpacity>

              <View style={styles.rightButtons}>
                <NotificationIcon
                  key={notificationKey}
                  onPress={() => navigation.navigate('Notifications')}
                />
                <TouchableOpacity
                  onPress={async () => {
                    if (isMining) {
                      setLogoutPopup(true);
                    } else {
                      await logout();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Signup' }],
                      });
                    }
                  }}
                  style={styles.logoutButton}
                >
                  <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title and Address - Centered */}
            <Text style={styles.mainTitle}>🪙 Crypto Miner</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {walletAddress && walletAddress.length > 10
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : walletAddress}
              </Text>
            </View>
          </View>

          {/* Balances */}
          <View style={styles.balancesContainer}>
            <LinearGradient
              colors={['#fbbf24', '#f97316', '#ec4899']}
              style={styles.balanceCard}
            >
              <View style={styles.cardDecoration} />
              <Text style={styles.balanceLabel}>Mining Balance : </Text>
              <Text style={styles.balanceValue}>{totalBalance.toFixed(4)}</Text>
            </LinearGradient>
          </View>

          {/* Mining Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Mining Status</Text>
              <View style={[styles.badge, isMining && styles.badgeActive]}>
                <Text style={styles.badgeText}>
                  {isMining ? '🟢 Active' : '⚪ Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.statusContent}>
              {!isMining && !canClaim && (
                <View style={styles.centerContent}>
                  <Text style={styles.statusMessage}>
                    Start mining to earn tokens
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPopup(true)}
                    activeOpacity={0.85}
                    style={{ width: '100%' }}
                  >
                    <LinearGradient
                      colors={['#9333ea', '#6d28d9', '#2563eb']} // upgraded 3-tone gradient like your balance card
                      style={[styles.balanceCard, styles.startMiningButton]}
                    >
                      <View style={styles.cardDecoration} />

                      <Text style={styles.startMiningText}>Start Mining</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {canClaim && (
                <View style={styles.centerContent}>
                  <Text style={styles.checkmark}>✅</Text>
                  <Text style={styles.successMessage}>
                    Mining completed! Claim your rewards.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Claim')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#16a34a', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Claim Rewards</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {isMining && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Mining')}
                  activeOpacity={0.8}
                  style={styles.centerContent}
                >
                  <LottieView
                    source={require('../assets/bitcoin_loader.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                  />
                  <Text style={styles.miningMessage}>
                    Mining in progress... Tap to view
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Watch Ads to Earn Card */}
          <View style={styles.adRewardCard}>
            <View style={styles.adRewardHeader}>
              <Text style={styles.adRewardTitle}>📺 Watch Ads to Earn</Text>
              <View style={styles.adRewardBadge}>
                <Text style={styles.adRewardBadgeText}>
                  {adRewardStatus.claimedCount}/6 Today
                </Text>
              </View>
            </View>

            <Text style={styles.adRewardDescription}>
              Watch ads and earn 10-60 tokens instantly!
            </Text>

            <TouchableOpacity
              onPress={handleWatchAd}
              activeOpacity={0.8}
              disabled={!adRewardStatus.canClaim}
              style={{ marginTop: 12 }}
            >
              <LinearGradient
                colors={
                  adRewardStatus.canClaim
                    ? ['#5bde8bff', '#00a542', '#004e3a']
                    : ['#6b7280', '#4b5563']
                }
                style={[styles.balanceCard, styles.adRewardButtonGradient]}
              >
                {/* <View style={styles.cardDecoration} /> */}
                <View style={styles.cardDecoration} />
                <Text style={styles.balanceLabel}>
                  {adRewardStatus.canClaim
                    ? `🎁 Watch Ad (${adRewardStatus.remainingClaims} left)`
                    : '✅ All Claimed Today'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Referral Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Referral')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#9333ea', '#6d28d9', '#2563eb']} // upgraded gradient
              style={[styles.balanceCard, styles.referralButtonGradient]}
            >
              <View style={styles.cardDecoration} />
              <Text style={styles.referralIcon}>🎁</Text>
              <View style={styles.referralContent}>
                <Text style={styles.referralTitle}>Referral Program</Text>
                <Text style={styles.referralText}>
                  Click here to add referral code
                </Text>
              </View>
              <Text style={styles.referralArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Test Notification Button - Debug Only */}
          {/* <TouchableOpacity
            onPress={async () => {
              const { notificationService } = await import(
                '../services/notificationService'
              );

              // Test immediate notification
              await notificationService.displayImmediateNotification(
                '🧪 Test Notification',
                'If you see this, notifications are working!',
              );

              // Test scheduled notification (10 seconds)
              const notifId =
                await notificationService.scheduleMiningCompleteNotification(
                  30,
                );

              if (notifId) {
                setNotificationPopup({
                  visible: true,
                  title: 'Notification Test',
                  message: 'Immediate notification sent! A scheduled notification will appear in 30 seconds.',
                });
              } else {
                setNotificationPopup({
                  visible: true,
                  title: 'Notification Permission Required',
                  message: 'Please enable notifications in your device settings for this app.',
                });
              }
            }}
            activeOpacity={0.8}
            style={{ marginTop: 16, alignSelf: 'center' }}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>🧪 Test Notifications</Text>
            </LinearGradient>
          </TouchableOpacity> */}
        </ScrollView>

        <DurationPopup
          visible={popup}
          currentMultiplier={currentMultiplier}
          durations={config.durations}
          multiplierOptions={config.multiplierOptions}
          baseRate={config.baseRate}
          loading={configLoading}
          onClose={() => setPopup(false)}
          onUpgrade={() => {
            setPopup(false);
            showAdForMultiplier(
              () => {
                console.log('Multiplier upgraded via home screen hook');
              },
              () => {
                // Limit reached callback
                setTimeout(() => setAdLimitPopup(true), 500); // Small delay to let popup close
              }
            );
          }}
          onStart={async sec => {
            try {
              setPopup(false);
              await startMining(sec);
              navigation.navigate('Mining');
            } catch (error: any) {
              setMiningErrorPopup({
                visible: true,
                message:
                  error.message || 'Please claim your previous rewards first',
              });
            }
          }}
        />

        {/* Ad Reward Earned Popup */}
        <RewardEarnedPopup
          visible={showAdRewardPopup}
          tokensEarned={adRewardTokens}
          onClose={async () => {
            console.log('🎉 User clicked Awesome button on HomeScreen');

            // Refresh balance one more time to ensure it's updated
            console.log('🔄 Final balance refresh on HomeScreen...');
            await refreshBalance();
            console.log('✅ Final balance refresh completed on HomeScreen');

            // Close the popup
            setAdRewardPopup(false);
          }}
        />

        {/* Logout During Mining Popup */}
        <CustomPopup
          visible={logoutPopup}
          title="Logout During Mining"
          message="Your mining session will continue on the server. You can log back in anytime to check your progress."
          icon="🚪"
          primaryButtonText="Logout"
          secondaryButtonText="Cancel"
          onPrimaryPress={async () => {
            setLogoutPopup(false);
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Signup' }],
            });
          }}
          onSecondaryPress={() => setLogoutPopup(false)}
          onClose={() => setLogoutPopup(false)}
          primaryButtonColors={['#ef4444', '#dc2626', '#b91c1c']}
        />

        {/* Ad Limit Popup */}
        <CustomPopup
          visible={adLimitPopup}
          title="Daily Limit Reached"
          message="You have claimed all 6 ad rewards for today. Come back tomorrow!"
          icon="⏰"
          primaryButtonText="Okay"
          onPrimaryPress={() => setAdLimitPopup(false)}
          onClose={() => setAdLimitPopup(false)}
        />

        {/* Notification Test Popup */}
        <CustomPopup
          visible={notificationPopup.visible}
          title={notificationPopup.title}
          message={notificationPopup.message}
          icon="🔔"
          primaryButtonText="Okay"
          onPrimaryPress={() =>
            setNotificationPopup({ visible: false, title: '', message: '' })
          }
          onClose={() =>
            setNotificationPopup({ visible: false, title: '', message: '' })
          }
        />

        {/* Mining Error Popup */}
        <CustomPopup
          visible={miningErrorPopup.visible}
          title="Cannot Start Mining"
          message={miningErrorPopup.message}
          icon="⚠️"
          primaryButtonText="Claim Now"
          secondaryButtonText="Okay"
          onPrimaryPress={() => {
            setMiningErrorPopup({ visible: false, message: '' });
            navigation.navigate('Claim');
          }}
          onSecondaryPress={() =>
            setMiningErrorPopup({ visible: false, message: '' })
          }
          onClose={() => setMiningErrorPopup({ visible: false, message: '' })}
        />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 32,
    zIndex: 10,
  },
  header: {
    marginBottom: 11,
  },
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
    gap: 12,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leaderboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  addressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  addressText: {
    color: '#e9d5ff',
    fontSize: 14,
  },
  balancesContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  balanceCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDecoration: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 11,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    borderColor: 'rgba(134, 239, 172, 0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContent: {
    paddingVertical: 10,
  },
  centerContent: {
    alignItems: 'center',
  },
  statusMessage: {
    color: '#e9d5ff',
    fontSize: 14,
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 48,
    marginBottom: 16,
  },
  successMessage: {
    color: '#86efac',
    fontSize: 14,
    marginBottom: 16,
  },
  lottieAnimation: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  miningMessage: {
    color: '#93c5fd',
    fontSize: 14,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
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
    padding: 16,
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
    fontWeight: '600',
  },
  adRewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  adRewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adRewardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  adRewardBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  adRewardBadgeText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
  adRewardDescription: {
    color: '#d1fae5',
    fontSize: 14,
    marginBottom: 4,
  },
  adRewardButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  adRewardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  referralIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  referralContent: {
    flex: 1,
  },
  referralTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  referralText: {
    color: '#e9d5ff',
    fontSize: 14,
  },
  referralArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  adRewardButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
  },
  referralButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: 72,
    overflow: 'hidden',
  },
  cardDecorationSmall: {
    position: 'absolute',
    top: -89,
    right: -71,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  startMiningButton: {
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startMiningText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
