import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';
import {
  notificationApiService,
  Notification,
} from '../services/notificationApiService';
import { CustomPopup } from '../components/CustomPopup';

export default function NotificationsScreen({ navigation }: any) {
  const { walletAddress } = useMining();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    icon: '',
    primaryButtonText: 'Okay',
    secondaryButtonText: '',
    onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
    onSecondaryPress: undefined as (() => void) | undefined,
  });

  useEffect(() => {
    if (walletAddress) {
      fetchNotifications();
    }
  }, [walletAddress]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApiService.getNotifications(
        walletAddress,
      );
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApiService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApiService.markAllAsRead(walletAddress);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setPopup({
        visible: true,
        title: 'Error',
        message: 'Failed to mark all notifications as read',
        icon: '❌',
        primaryButtonText: 'Okay',
        secondaryButtonText: '',
        onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
        onSecondaryPress: undefined,
      });
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await notificationApiService.clearAllNotifications(walletAddress);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      setPopup({
        visible: true,
        title: 'Error',
        message: 'Failed to clear all notifications',
        icon: '❌',
        primaryButtonText: 'Okay',
        secondaryButtonText: '',
        onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
        onSecondaryPress: undefined,
      });
    }
  };

  const showClearConfirmation = () => {
    setPopup({
      visible: true,
      title: 'Clear All Notifications',
      message:
        'Are you sure you want to clear all notifications? This action cannot be undone.',
      icon: '🗑️',
      primaryButtonText: 'Clear All',
      secondaryButtonText: 'Cancel',
      onPrimaryPress: () => {
        setPopup(prev => ({ ...prev, visible: false }));
        handleClearAllNotifications();
      },
      onSecondaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
    });
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationApiService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setPopup({
        visible: true,
        title: 'Error',
        message: 'Failed to delete notification',
        icon: '❌',
        primaryButtonText: 'Okay',
        secondaryButtonText: '',
        onPrimaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
        onSecondaryPress: undefined,
      });
    }
  };

  const showDeleteConfirmation = (notificationId: string) => {
    setPopup({
      visible: true,
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      icon: '🗑️',
      primaryButtonText: 'Delete',
      secondaryButtonText: 'Cancel',
      onPrimaryPress: () => {
        setPopup(prev => ({ ...prev, visible: false }));
        handleDelete(notificationId);
      },
      onSecondaryPress: () => setPopup(prev => ({ ...prev, visible: false })),
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'referral_used':
        return '🎉';
      case 'referral_bonus':
        return '🎁';
      case 'mining_bonus':
        return '💰';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <LinearGradient
      colors={['#581c87', '#2e2e81']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Animated background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerButtons}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={showClearConfirmation}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
        >
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll be notified when someone uses your referral code or when
                you earn mining bonuses
              </Text>
            </View>
          ) : (
            notifications.map(notification => (
              <TouchableOpacity
                key={notification._id}
                onPress={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification._id);
                  }
                }}
                activeOpacity={0.8}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard,
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                    <View style={styles.notificationTextContainer}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => showDeleteConfirmation(notification._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        icon={popup.icon}
        primaryButtonText={popup.primaryButtonText}
        secondaryButtonText={popup.secondaryButtonText}
        onPrimaryPress={popup.onPrimaryPress}
        onSecondaryPress={popup.onSecondaryPress}
        onClose={() => setPopup(prev => ({ ...prev, visible: false }))}
        primaryButtonColors={
          popup.primaryButtonText === 'Delete'
            ? ['#ef4444', '#dc2626', '#b91c1c']
            : ['#9333ea', '#6d28d9', '#2563eb']
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    borderRadius: 8,
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#e9d5ff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#e9d5ff',
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTime: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9333ea',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 24,
    fontWeight: '700',
  },
});
