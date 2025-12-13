import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
let BlurView: any;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch {}

export const GlassCard: React.FC<{
  style?: ViewStyle;
  children: React.ReactNode;
}> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      {BlurView ? (
        <BlurView
          blurAmount={20}
          blurType="dark"
          style={StyleSheet.absoluteFill}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.06)"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255,255,255,0.06)' },
          ]}
        />
      )}
      <View style={styles.inner}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  inner: { padding: 16 },
});
