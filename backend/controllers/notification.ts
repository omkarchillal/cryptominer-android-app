import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

// Get notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 50, unreadOnly = false } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const query: any = { walletAddress };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({
      walletAddress,
      read: false,
    });

    return res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    await Notification.updateMany(
      { walletAddress, read: false },
      { read: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
};
