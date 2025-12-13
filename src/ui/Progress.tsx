import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from './theme';

export const Progress: React.FC<{ value: number }> = ({ value }) => {
  const p = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.fill, { width: `${p}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%' },
});
