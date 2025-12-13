import React, { useEffect } from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { theme } from './theme';

export const ModalSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}> = ({ visible, onClose, children, height = 420 }) => {
  const y = useSharedValue(height);

  useEffect(() => {
    y.value = visible ? 0 : height;
  }, [visible, height, y]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(y.value, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { height }, sheetStyle]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    marginBottom: 12,
  },
});
