import { API_BASE_URL } from './api';

export interface Notification {
  _id: string;
  walletAddress: string;
  type: 'referral_used' | 'mining_bonus' | 'general';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

class NotificationApiService {
  private baseUrl = `${API_BASE_URL}/api/notifications`;

  async getNotifications(
    walletAddress: string,
    unreadOnly = false
  ): Promise<NotificationsResponse> {
    try {
      const url = `${this.baseUrl}/${walletAddress}?unreadOnly=${unreadOnly}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json() as NotificationsResponse;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(walletAddress: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export const notificationApiService = new NotificationApiService();
