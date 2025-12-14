import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface CustomRefreshControlProps {
  refreshing: boolean;
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
}) => {
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Scale up animation
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Start spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      // Scale down and stop spinning
      Animated.spring(scaleValue, {
        toValue: 0.8,
        useNativeDriver: true,
      }).start();
      spinValue.setValue(0);
    }
  }, [refreshing, scaleValue, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.refreshWrapper, { transform: [{ scale: scaleValue }] }]}
      >
        <View style={styles.refreshContainer}>
          <View style={styles.glassEffect} />
          <Animated.View
            style={[styles.arrowContainer, { transform: [{ rotate: spin }] }]}
          >
            <View style={styles.arrow} />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  refreshWrapper: {
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  refreshContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glassEffect: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
});
