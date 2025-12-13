import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { theme } from './theme';

export const GradientCard: React.FC<ViewProps & { padding?: number }> = ({
  style,
  children,
  padding = 16,
  ...rest
}) => {
  return (
    <View style={[styles.wrapper, style]} {...rest}>
      <LinearGradient
        colors={[theme.colors.glow, 'transparent', theme.colors.glow2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      />
      <View style={styles.inner}>
        {/* Blur: iOS best, Android works but lighter; fallback is rgba card */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={16}
        />
        <View style={{ padding }}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius['2xl'],
    position: 'relative',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius['2xl'],
    opacity: 0.9,
  },
  inner: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.cardBorder,
    borderWidth: 1,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
});
