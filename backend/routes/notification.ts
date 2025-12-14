import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notification';

const r = Router();
r.get('/:walletAddress', getNotifications);
r.patch('/:notificationId/read', markAsRead);
r.post('/mark-all-read', markAllAsRead);
r.post('/clear-all', clearAllNotifications);
r.delete('/:notificationId', deleteNotification);

export default r;
