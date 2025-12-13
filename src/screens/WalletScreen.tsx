import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';

export default function WalletScreen({ navigation }: any) {
  const { walletAddress, totalBalance } = useMining();

  return (
    <LinearGradient colors={['#581c87', '#2e2e81']} style={styles.container}>
      {/* Animated background elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.mainTitle}>💼 Wallet</Text>
          <View style={styles.spacer} />
        </View>

        {/* Wallet Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.cardTitle}>💳 Your Wallet Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{walletAddress}</Text>
          </View>
        </View>

        {/* Balances */}
        <View style={styles.balancesContainer}>
          <LinearGradient
            colors={['#fbbf24', '#f97316', '#ec4899']}
            style={styles.balanceCard}
          >
            <View style={styles.cardDecoration} />
            <Text style={styles.balanceLabel}>Mining Balance</Text>
            <Text style={styles.balanceValue}>{totalBalance.toFixed(4)}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#4ade80', '#10b981', '#14b8a6']}
            style={styles.balanceCard}
          >
            <View style={styles.cardDecoration} />
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceValue}>{totalBalance.toFixed(4)}</Text>
          </LinearGradient>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Wallet Information</Text>
          <Text style={styles.infoText}>
            Your wallet stores all mined tokens. You can view your balance and
            transaction history here.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  spacer: {
    width: 96,
  },
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  addressBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  addressText: {
    color: '#fff',
    fontSize: 14,
  },
  balancesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
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
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
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
    elevation: 5,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#e9d5ff',
    fontSize: 14,
    lineHeight: 20,
  },
});
