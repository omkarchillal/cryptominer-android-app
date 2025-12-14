import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface RewardEarnedPopupProps {
  visible: boolean;
  tokensEarned: number;
  onClose: () => void;
}

export const RewardEarnedPopup: React.FC<RewardEarnedPopupProps> = ({
  visible,
  tokensEarned,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        // Prevent dismissing with back button on Android
        // User must click "Awesome" button
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#581c87', '#1e3a8a', '#312e81']}
            style={styles.modalContent}
          >
            {/* Animated background elements */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>🎉</Text>
              <Text style={styles.title}>Congratulations!</Text>
              <Text style={styles.tokensText}>
                {tokensEarned} tokens earned
              </Text>
            </View>

            {/* Reward Display Card */}
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              style={styles.rewardCard}
            >
              <View style={styles.cardDecorationsmall} />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardIcon}>💰</Text>
                <Text style={styles.rewardValue}>+{tokensEarned}</Text>
                <Text style={styles.rewardLabel}>Tokens Added</Text>
              </View>
            </LinearGradient>

            {/* Success Message */}
            <Text style={styles.successMessage}>
              Your tokens have been added to your mining balance!
            </Text>

            {/* Awesome Button */}
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <LinearGradient
                colors={['#9333ea', '#6d28d9', '#2563eb']}
                style={styles.awesomeButton}
              >
                <View style={styles.cardDecoration} />
                <Text style={styles.awesomeButtonText}>Awesome</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 50,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 10,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tokensText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  rewardInfo: {
    alignItems: 'center',
    zIndex: 10,
  },
  rewardIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  rewardValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  rewardLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    zIndex: 10,
  },
  awesomeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  awesomeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 10,
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
  cardDecorationsmall: {
    position: 'absolute',
    top: -72,
    right: -72,
    width: 174,
    height: 174,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
  },
});
