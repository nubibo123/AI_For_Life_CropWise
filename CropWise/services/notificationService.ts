/**
 * Service để lấy dữ liệu thông báo
 * Sử dụng mock data, sẵn sàng thay thế bằng API thật
 */

import {
  Notification,
  NotificationCount,
} from '../types/notification';
import {
  MOCK_NOTIFICATIONS,
  addNotification,
  deleteNotification,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './mockNotificationData';

/**
 * Giả lập độ trễ mạng
 */
const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Lấy danh sách tất cả thông báo
 * @param includeRead Bao gồm thông báo đã đọc (mặc định: true)
 * @returns Promise<Notification[]> Danh sách thông báo
 */
export const getNotifications = async (includeRead: boolean = true): Promise<Notification[]> => {
  await simulateNetworkDelay(300);
  let notifications = JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS));
  
  if (!includeRead) {
    notifications = notifications.filter((n: Notification) => !n.isRead);
  }
  
  return notifications;
};

/**
 * Lấy số lượng thông báo chưa đọc
 * @returns Promise<NotificationCount> Số lượng thông báo
 */
export const getNotificationCount = async (): Promise<NotificationCount> => {
  await simulateNetworkDelay(200);
  const unreadCount = getUnreadNotificationCount();
  const totalCount = MOCK_NOTIFICATIONS.length;
  
  return {
    total: totalCount,
    unread: unreadCount,
  };
};

/**
 * Đánh dấu thông báo là đã đọc
 * @param notificationId ID của thông báo
 * @returns Promise<Notification | null> Thông báo đã cập nhật hoặc null nếu không tìm thấy
 */
export const markAsRead = async (notificationId: string): Promise<Notification | null> => {
  await simulateNetworkDelay(200);
  try {
    const updatedNotification = markNotificationAsRead(notificationId);
    return updatedNotification ? JSON.parse(JSON.stringify(updatedNotification)) : null;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @returns Promise<boolean> Thành công hay không
 */
export const markAllAsRead = async (): Promise<boolean> => {
  await simulateNetworkDelay(300);
  try {
    markAllNotificationsAsRead();
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Xóa thông báo
 * @param notificationId ID của thông báo
 * @returns Promise<boolean> Thành công hay không
 */
export const deleteNotificationById = async (notificationId: string): Promise<boolean> => {
  await simulateNetworkDelay(200);
  try {
    return deleteNotification(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

/**
 * Tạo thông báo mới (thường được gọi từ backend khi có sự kiện)
 * @param notification Dữ liệu thông báo
 * @returns Promise<Notification | null> Thông báo mới tạo hoặc null nếu lỗi
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<Notification | null> => {
  await simulateNetworkDelay(300);
  try {
    const newNotification = addNotification(notification);
    return JSON.parse(JSON.stringify(newNotification));
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

