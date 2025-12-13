import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Duration {
  h: number;
  label: string;
  seconds: number;
}

interface MultiplierOption {
  value: number;
  label: string;
  requiresAd: boolean;
}

export const DurationPopup: React.FC<{
  visible: boolean;
  currentMultiplier: number;
  durations: Duration[];
  multiplierOptions: MultiplierOption[];
  baseRate: number;
  loading?: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onStart: (seconds: number) => void;
}> = ({
  visible,
  currentMultiplier,
  durations,
  multiplierOptions,
  baseRate,
  loading = false,
  onClose,
  onUpgrade,
  onStart,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(
    durations[0]?.h || 1,
  );
  const [selectedMultiplier, setSelectedMultiplier] =
    useState(currentMultiplier);

  const seconds = selectedDuration * 3600;
  const effectiveRate = baseRate * selectedMultiplier;
  const reward = seconds * effectiveRate;
  const requiresAd = selectedMultiplier > currentMultiplier;

  const handleStart = () => {
    if (requiresAd) {
      onUpgrade();
    } else {
      onStart(seconds);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#581c87', '#1e3a8a', '#312e81']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>⚙️</Text>
              <Text style={styles.title}>Select Mining Duration</Text>
              <Text style={styles.subtitle}>
                Choose how long you want to mine and select a multiplier
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Loading options...</Text>
                </View>
              ) : (
                <>
                  {/* Duration Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>⏱️ Duration</Text>
                    <View style={styles.grid}>
                      {durations.map(d => {
                        const active = selectedDuration === d.h;
                        return (
                          <TouchableOpacity
                            key={d.h}
                            onPress={() => setSelectedDuration(d.h)}
                            activeOpacity={0.8}
                          >
                            {active ? (
                              <LinearGradient
                                colors={['#3b82f6', '#5b21b6', '#9333ea']} // upgraded 3-color gradient like balanceCard
                                style={[
                                  styles.balanceCardButton,
                                  styles.optionButtonCard,
                                ]}
                              >
                                <View style={styles.cardDecorationSmall} />

                                <Text style={styles.optionTextActive}>
                                  {d.label}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <View style={styles.optionButtonInactive}>
                                <Text style={styles.optionText}>{d.label}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Multiplier Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>⚡ Multiplier</Text>
                    <View style={styles.grid}>
                      {multiplierOptions.map(m => {
                        const active = selectedMultiplier === m.value;
                        const locked = m.value > currentMultiplier;
                        return (
                          <TouchableOpacity
                            key={m.value}
                            onPress={() =>
                              !locked && setSelectedMultiplier(m.value)
                            }
                            activeOpacity={0.8}
                            disabled={locked}
                          >
                            {active ? (
                              <LinearGradient
                                colors={['#fbbf24', '#f97316', '#f43f5e']} // three-tone like the balance card
                                style={[
                                  styles.balanceCardButton,
                                  styles.optionButtonCard,
                                ]}
                              >
                                <View style={styles.cardDecorationSmall} />

                                <Text style={styles.optionTextActive}>
                                  {m.label}
                                </Text>

                                {m.requiresAd && (
                                  <Text style={styles.adBadge}>📺 Ad</Text>
                                )}
                              </LinearGradient>
                            ) : (
                              <View
                                style={[
                                  styles.optionButtonInactive,
                                  locked && styles.optionButtonLocked,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.optionText,
                                    locked && styles.optionTextLocked,
                                  ]}
                                >
                                  {m.label}
                                </Text>
                                {m.requiresAd && (
                                  <Text style={styles.adBadge}>📺 Ad</Text>
                                )}
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {requiresAd && (
                      <Text style={styles.adNote}>
                        📺 Watch an ad to unlock this multiplier
                      </Text>
                    )}
                  </View>

                  {/* Reward Box */}
                  <View style={styles.rewardBox}>
                    <View style={styles.rewardRow}>
                      <Text style={styles.rewardLabel}>Estimated Reward:</Text>
                      <Text style={styles.rewardValue}>
                        {reward.toFixed(4)} tokens
                      </Text>
                    </View>
                    <View style={styles.rewardRow}>
                      <Text style={styles.rewardLabel}>Effective Rate:</Text>
                      <Text style={styles.rewardValueSmall}>
                        {effectiveRate.toFixed(6)} tokens/sec
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleStart} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#5bde8b', '#00a542', '#004e3a']}
                  style={[styles.balanceCardButton, styles.startButtonCard]}
                >
                  <View style={styles.cardDecorationSmall} />

                  <Text style={styles.startButtonText}>🚀 Start Mining</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 448,
    maxHeight: '90%',
  },
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    fontWeight: '700',
    marginBottom: 12,
    justifyContent: 'center',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  optionButtonInactive: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionButtonLocked: {
    opacity: 0.5,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  adBadge: {
    fontSize: 10,
    color: '#fff',
    marginTop: 4,
  },
  adNote: {
    fontSize: 12,
    color: '#e9d5ff',
    marginTop: 8,
  },
  rewardBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  rewardValue: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '700',
  },
  rewardValueSmall: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#e9d5ff',
    fontSize: 14,
    marginTop: 16,
  },
  balanceCardButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    position: 'relative',
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  optionButtonCard: {
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDecorationSmall: {
    position: 'absolute',
    top: -89,
    right: -81,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 64,
  },
  startButtonCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
