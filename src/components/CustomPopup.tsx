import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CustomPopupProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onClose: () => void;
  primaryButtonColors?: string[];
}

export const CustomPopup: React.FC<CustomPopupProps> = ({
  visible,
  title,
  message,
  icon = '⚠️',
  primaryButtonText,
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
  onClose,
  primaryButtonColors = ['#9333ea', '#6d28d9', '#2563eb'],
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
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
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {secondaryButtonText && onSecondaryPress && (
                <TouchableOpacity
                  onPress={onSecondaryPress}
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onPrimaryPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={primaryButtonColors}
                  style={[
                    styles.primaryButton,
                    !secondaryButtonText && styles.primaryButtonFull,
                  ]}
                >
                  <View style={styles.cardDecoration} />
                  <View style={styles.textContainer}>
                    <Text style={styles.primaryButtonText}>
                      {primaryButtonText}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>✕</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryButtonFull: {
    flex: 1,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardDecoration: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    zIndex: 1,
  },
});
