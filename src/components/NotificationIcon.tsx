import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMining } from '../contexts/MiningContext';
import { notificationApiService } from '../services/notificationApiService';

interface NotificationIconProps {
  onPress: () => void;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  onPress,
}) => {
  const { walletAddress } = useMining();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (walletAddress) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApiService.getNotifications(
        walletAddress,
        true, // unreadOnly
      );
      setUnreadCount(response.unreadCount);
    } catch (error: any) {
      // Silently fail - don't show errors for notification polling
      // Just log for debugging
      if (__DEV__) {
        console.log(
          'Notification fetch failed (backend may be offline):',
          error.message,
        );
      }
      // Keep the last known count, don't reset to 0
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Text style={styles.icon}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
