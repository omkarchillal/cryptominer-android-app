import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';

export const Chip: React.FC<{
  label: string;
  tone?: 'blue' | 'green' | 'amber' | 'gray';
  style?: ViewStyle;
}> = ({ label, tone = 'blue', style }) => {
  const map = {
    blue: {
      bg: 'rgba(59,130,246,0.15)',
      fg: '#93C5FD',
      br: 'rgba(147,197,253,0.35)',
    },
    green: {
      bg: 'rgba(16,185,129,0.15)',
      fg: '#86EFAC',
      br: 'rgba(134,239,172,0.35)',
    },
    amber: {
      bg: 'rgba(245,158,11,0.15)',
      fg: '#FDE68A',
      br: 'rgba(253,230,138,0.35)',
    },
    gray: {
      bg: 'rgba(255,255,255,0.08)',
      fg: '#D1D5DB',
      br: 'rgba(255,255,255,0.15)',
    },
  }[tone];
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: map.bg, borderColor: map.br },
        style,
      ]}
    >
      <Text style={[styles.text, { color: map.fg }]}>{label}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
