import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  private channelId = 'mining-complete';
  private initialized = false;

  async checkPermissions() {
    try {
      const settings = await notifee.getNotificationSettings();
      console.log('🔔 Current notification settings:', settings);
      
      // Check if we have notification permission
      const hasNotificationPermission = settings.authorizationStatus >= 1; // 1 = authorized
      
      if (!hasNotificationPermission) {
        console.warn('⚠️ Notification permission not granted');
        return false;
      }

      // For Android 12+, check exact alarm permission
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        try {
          const alarmPermission = await notifee.getNotificationSettings();
          console.log('⏰ Alarm settings:', alarmPermission);
        } catch (err) {
          console.warn('Could not check alarm permission:', err);
        }
      }

      return hasNotificationPermission;
    } catch (err) {
      console.warn('Failed to check notification permissions:', err);
      return false;
    }
  }

  async requestExactAlarmPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const settings = await notifee.getNotificationSettings();
        
        // Check if exact alarm permission is granted
        if (settings.android?.alarm === 0) {
          console.log('📱 Exact alarm permission not granted, opening settings...');
          
          // Open settings to allow exact alarms
          await notifee.openAlarmPermissionSettings();
          return false;
        }
        
        console.log('✅ Exact alarm permission already granted');
        return true;
      }
      
      // For Android < 12, no special permission needed
      return true;
    } catch (err) {
      console.warn('Failed to request exact alarm permission:', err);
      return false;
    }
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Request permissions for both Android and iOS
      const settings = await notifee.requestPermission();
      console.log('📱 Notification permission status:', settings);

      // Check if permission was granted
      if (settings.authorizationStatus < 1) {
        console.warn('⚠️ Notification permission denied by user');
      }

      if (Platform.OS === 'android') {
        // Create notification channel for Android with high priority
        await notifee.createChannel({
          id: this.channelId,
          name: 'Mining Notifications',
          description: 'Notifications for mining completion',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: '#FF6B35',
        });
        console.log('✅ Android notification channel created');

        // For Android 12+ (API 31+), request exact alarm permission
        if (Platform.Version >= 31) {
          const alarmSettings = await notifee.getNotificationSettings();
          console.log('⏰ Alarm permission settings:', alarmSettings);
          
          // Check if exact alarm permission is needed
          // Note: This will be undefined if permission is granted
          if (alarmSettings.android?.alarm === 0) {
            console.warn('⚠️ Exact alarm permission not granted - notifications may not work reliably');
            console.log('💡 User needs to grant exact alarm permission in settings');
          }
        }
      }

      this.initialized = true;
    } catch (err) {
      // If native module isn't available, warn and continue without failing
      console.warn('Notifee not available during initialize():', err);
      this.initialized = false;
    }
  }

  async scheduleMiningCompleteNotification(durationSeconds: number) {
    try {
      await this.initialize();

      // Check if permissions are granted
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Notification permissions not granted!');
        return null;
      }

      // For Android 12+, check and request exact alarm permission
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const hasExactAlarm = await this.requestExactAlarmPermission();
        if (!hasExactAlarm) {
          console.warn('⚠️ Exact alarm permission needed for reliable notifications');
          // Continue anyway - notification will still be scheduled but may be delayed
        }
      }

      const triggerTime = Date.now() + durationSeconds * 1000;
      const triggerDate = new Date(triggerTime);
      
      console.log(`📅 Scheduling notification for ${durationSeconds} seconds from now`);
      console.log(`📅 Trigger time: ${triggerDate.toLocaleString()}`);

      // Use proper TypeScript types for trigger
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime,
        alarmManager: {
          allowWhileIdle: true, // Critical: allows notification even in Doze mode
        },
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          id: 'mining-complete',
          title: '⛏️ Mining Complete!',
          body: 'Your mining session has finished. Tap to claim your rewards!',
          android: {
            channelId: this.channelId,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            sound: 'default',
            vibrationPattern: [300, 500],
            lightUpScreen: true,
            autoCancel: true,
            showTimestamp: true,
            timestamp: triggerTime,
            // Ensure notification persists and is visible
            ongoing: false,
            smallIcon: 'ic_launcher',
          },
          ios: {
            sound: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
          data: {
            screen: 'Home',
            type: 'mining-complete',
          },
        },
        trigger,
      );

      console.log('✅ Successfully scheduled notification:', notificationId);
      
      // Verify the notification was scheduled
      const triggers = await notifee.getTriggerNotifications();
      console.log('📋 All scheduled notifications:', triggers.length);
      
      return notificationId;
    } catch (err) {
      console.error('❌ Error scheduling notification:', err);
      return null;
    }
  }

  async cancelMiningNotification() {
    try {
      // Cancel both displayed and trigger notifications
      await notifee.cancelNotification('mining-complete');
      await notifee.cancelTriggerNotification('mining-complete');
      console.log('🚫 Cancelled mining notification');
      
      // Verify cancellation
      const triggers = await notifee.getTriggerNotifications();
      console.log('📋 Remaining scheduled notifications:', triggers.length);
    } catch (err) {
      console.warn('Notifee not available during cancelMiningNotification():', err);
    }
  }

  async displayImmediateNotification(title: string, body: string) {
    try {
      await this.initialize();
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
        data: {
          screen: 'Home',
        },
      });
    } catch (err) {
      console.warn('Notifee not available during displayImmediateNotification():', err);
    }
  }

  setupNotificationHandler(navigationRef: any) {
    try {
      // Handle notification press when app is in background or foreground
      return notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
          console.log('📱 Notification pressed:', detail.notification);
          const screen = detail.notification?.data?.screen;
          if (screen && navigationRef?.current) {
            navigationRef.current.navigate(screen);
          }
        }
      });
    } catch (err) {
      console.warn('Notifee not available during setupNotificationHandler():', err);
      // Return a no-op unsubscribe function so caller can always call it
      return () => {};
    }
  }

  async handleBackgroundNotification() {
    try {
      // Handle notification press when app is killed/closed
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        console.log('📱 Background event received:', type, detail);
        
        if (type === EventType.PRESS) {
          console.log('📱 Background notification pressed:', detail.notification);
          // Navigation will be handled when app starts via getInitialNotification
        }
        
        if (type === EventType.DELIVERED) {
          console.log('📱 Notification delivered in background');
        }
      });
    } catch (err) {
      console.warn('Notifee not available during handleBackgroundNotification():', err);
    }
  }
}

export const notificationService = new NotificationService();
