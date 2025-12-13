import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from './theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'success' | 'danger';
export const NeonButton: React.FC<{
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, variant = 'primary', disabled, style }) => {
  const isPrimary =
    variant === 'primary' || variant === 'success' || variant === 'danger';
  const grad =
    variant === 'success'
      ? ['#22C55E', '#32D4FF']
      : variant === 'danger'
      ? ['#EF4444', '#7C5CFF']
      : [theme.colors.primary, theme.colors.primary2];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, style, disabled && { opacity: 0.5 }]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{title}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.altText, variant === 'outline' && styles.outline]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 16, overflow: 'hidden' },
  primary: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: theme.colors.primary,
    shadowRadius: 12,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryText: {
    color: '#0B0F14',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  altText: {
    color: theme.colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 16,
  },
});
