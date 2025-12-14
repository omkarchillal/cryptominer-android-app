import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';
import { api } from '../services/api';
import { CustomPopup } from '../components/CustomPopup';

export default function SignupScreen({ navigation }: any) {
  const { setWalletAddress, refreshBalance } = useMining();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState({
    visible: false,
    message: '',
  });

  const create = async () => {
    const trimmedAddress = address.trim();

    // Check if wallet address is empty
    if (!trimmedAddress) {
      setShowWalletPopup(true);
      return;
    }

    try {
      await api.post('/api/users/signup', { walletAddress: trimmedAddress });
      await setWalletAddress(trimmedAddress);
      await refreshBalance();
      navigation.replace('Home');
    } catch (error: any) {
      setErrorPopup({
        visible: true,
        message: error.message || 'Failed to create account',
      });
    }
  };

  return (
    <LinearGradient colors={['#581c87', '#2e2e81']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Animated background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />

        <View style={styles.content}>
          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🪙</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Crypto Miner</Text>
            <Text style={styles.subtitle}>
              Enter your wallet address or name to start mining tokens
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  setError('');
                }}
                placeholder="0x... wallet address or your name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                autoCapitalize="none"
                style={styles.input}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Button */}
            <TouchableOpacity onPress={create} activeOpacity={0.8}>
              <LinearGradient
                colors={['#9333ea', '#6d28d9', '#2563eb']}
                style={styles.button}
              >
                <View style={styles.cardDecoration} />
                <Text style={styles.buttonText}>Continue...</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Wallet Popup */}
        <CustomPopup
          visible={showWalletPopup}
          title="Enter Wallet Address to Continue"
          message="Please enter your wallet address or name to start mining and track your progress."
          icon="💼"
          primaryButtonText="Okay"
          onPrimaryPress={() => setShowWalletPopup(false)}
          onClose={() => setShowWalletPopup(false)}
          primaryButtonColors={['#9333ea', '#6d28d9', '#2563eb']}
        />

        {/* Error Popup */}
        <CustomPopup
          visible={errorPopup.visible}
          title="Error"
          message={errorPopup.message}
          icon="❌"
          primaryButtonText="Okay"
          onPrimaryPress={() => setErrorPopup({ visible: false, message: '' })}
          onClose={() => setErrorPopup({ visible: false, message: '' })}
          primaryButtonColors={['#ef4444', '#dc2626', '#b91c1c']}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bgCircle1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 192,
    opacity: 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 192,
    opacity: 0.2,
  },
  bgCircle3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 192,
    opacity: 0.2,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    // elevation: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDecoration: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
  },
});
