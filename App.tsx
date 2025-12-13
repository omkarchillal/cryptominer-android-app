import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MiningProvider, useMining } from './src/contexts/MiningContext';
import SplashScreen from './src/screens/SplashScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import MiningScreen from './src/screens/MiningScreen';
import ClaimScreen from './src/screens/ClaimScreen';
import AdScreen from './src/screens/AdScreen';
import AdRewardScreen from './src/screens/AdRewardScreen';
import ReferralScreen from './src/screens/ReferralScreen';
import LeaderBoardScreen from './src/screens/LeaderBoardScreenWrapper';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { notificationService } from './src/services/notificationService';
import notifee from '@notifee/react-native';

const Stack = createStackNavigator();

function Root() {
  const { walletAddress, isLoading, miningStatus, hasUnclaimedRewards } =
    useMining();
  const [showInitialSplash, setShowInitialSplash] = useState(true);
  const navigationRef = useRef<any>(null);

  // Initialize notification service and handle background notifications
  useEffect(() => {
    // Wrap notification initialization in try/catch so missing native module
    // doesn't crash the entire app during startup.
    (async () => {
      try {
        await notificationService.initialize();
        await notificationService.handleBackgroundNotification();

        // Check if app was opened from a notification (when app was killed/closed)
        try {
          const initialNotification = await notifee.getInitialNotification();

          if (initialNotification) {
            console.log(
              '📱 App opened from notification:',
              initialNotification,
            );
            const screen = initialNotification.notification.data?.screen;

            if (screen) {
              // Delay navigation to ensure navigation is ready
              setTimeout(() => {
                if (navigationRef.current) {
                  console.log('🧭 Navigating to:', screen);
                  navigationRef.current.navigate(screen);
                }
              }, 1000);
            }
          }
        } catch (err) {
          console.warn('Notifee getInitialNotification failed:', err);
        }
      } catch (err) {
        console.warn(
          'NotificationService init failed (notifee may be missing):',
          err,
        );
      }
    })();

    // Handle foreground notification press
    const unsubscribe =
      notificationService.setupNotificationHandler(navigationRef);

    return () => {
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
      } catch (err) {
        // ignore
      }
    };
  }, []);

  // Show splash screen while loading (combines initial splash + hydration)
  if (showInitialSplash || isLoading) {
    return <SplashScreen onFinish={() => setShowInitialSplash(false)} />;
  }

  // Determine initial route based on wallet and mining status
  const getInitialRoute = () => {
    if (!walletAddress) return 'Signup';
    if (hasUnclaimedRewards) return 'Claim';
    if (miningStatus === 'active') return 'Mining';
    return 'Home';
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Mining" component={MiningScreen} />
        <Stack.Screen name="Claim" component={ClaimScreen} />
        <Stack.Screen name="Ad" component={AdScreen} />
        <Stack.Screen name="AdReward" component={AdRewardScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoardScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MiningProvider>
          <Root />
        </MiningProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
