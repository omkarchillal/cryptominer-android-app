import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import cryptoAnimation from '../assets/crypto_bitcoins.json';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    // Auto-finish after 2 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, onFinish]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#581c87', '#2e2e81']} style={styles.container}>
      {/* Animated background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Rotating coin icon */}
        {/* <Animated.View
          style={[
            styles.coinContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={['#fbbf24', '#f97316', '#ec4899']}
            style={styles.coin}
          >
            <Text style={styles.coinIcon}>₿</Text>
          </LinearGradient>
        </Animated.View> */}

        {/* App name */}
        {/* <Text style={styles.appName}>Crypto Miner</Text>
        <Text style={styles.tagline}>Mine. Earn. Grow.</Text> */}

        {/* Replace rotating coin with Lottie animation */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LottieView
            source={cryptoAnimation}
            autoPlay
            loop
            style={{ width: 240, height: 240, marginBottom: 24 }}
          />

          <Text style={styles.appName}>Crypto Miner</Text>
          <Text style={styles.tagline}>Mine. Earn. Grow.</Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 192,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 192,
  },
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 192,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  coinContainer: {
    marginBottom: 32,
  },
  coin: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  coinIcon: {
    fontSize: 80,
    color: '#fff',
    fontWeight: '700',
  },
  appName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#e9d5ff',
    fontWeight: '600',
    letterSpacing: 2,
  },
});
