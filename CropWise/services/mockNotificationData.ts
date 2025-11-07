/**
 * Mock data cho tính năng Thông báo
 */

import { Notification, NotificationType } from '../types/notification';
import { MOCK_POSTS } from './mockData';

// Mock Notifications (sử dụng let để có thể thay đổi)
let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    type: 'comment',
    title: 'Bình luận mới',
    message: 'Shashi đã bình luận vào bài đăng của bạn: "No problem is there"',
    user: {
      id: 'user1',
      name: 'Shashi',
      country: 'Đà Nẵng',
      avatarUrl: undefined,
      reputation: 0,
    },
    postId: 'post1',
    commentId: 'comment1',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 phút trước
    isRead: false,
  },
  {
    id: 'notif2',
    type: 'like',
    title: 'Thích bài đăng',
    message: 'Bánh xèo đã thích bài đăng của bạn',
    user: {
      id: 'user2',
      name: 'Bánh xèo',
      country: 'Quảng Nam',
      avatarUrl: undefined,
      reputation: 987410,
    },
    postId: 'post1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
    isRead: false,
  },
  {
    id: 'notif3',
    type: 'comment',
    title: 'Bình luận mới',
    message: 'Trà sữa trân châu đã bình luận vào bài đăng của bạn: "Check the presence of any insects"',
    user: {
      id: 'user4',
      name: 'Trà sữa trân châu',
      country: 'Vũng Tàu',
      avatarUrl: undefined,
      reputation: 508080,
      isExpert: true,
      isModerator: true,
    },
    postId: 'post2',
    commentId: 'comment2',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 giờ trước
    isRead: true,
  },
  {
    id: 'notif4',
    type: 'reply',
    title: 'Phản hồi bình luận',
    message: 'Tàu phớ đã phản hồi bình luận của bạn',
    user: {
      id: 'user3',
      name: 'Tàu phớ',
      country: 'Cần Thơ',
      avatarUrl: undefined,
      reputation: 0,
    },
    postId: 'post1',
    commentId: 'comment1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
    isRead: true,
  },
];

// Export MOCK_NOTIFICATIONS
export { MOCK_NOTIFICATIONS };

/**
 * Thêm thông báo mới
 */
export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: `notif${Date.now()}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  MOCK_NOTIFICATIONS = [newNotification, ...MOCK_NOTIFICATIONS];
  return newNotification;
};

/**
 * Đánh dấu thông báo là đã đọc
 */
export const markNotificationAsRead = (notificationId: string): Notification | null => {
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
  if (!notification) {
    return null;
  }

  notification.isRead = true;
  return notification;
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllNotificationsAsRead = (): void => {
  MOCK_NOTIFICATIONS.forEach((notification) => {
    notification.isRead = true;
  });
};

/**
 * Xóa thông báo
 */
export const deleteNotification = (notificationId: string): boolean => {
  const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === notificationId);
  if (index === -1) {
    return false;
  }

  MOCK_NOTIFICATIONS.splice(index, 1);
  return true;
};

/**
 * Lấy số lượng thông báo chưa đọc
 */
export const getUnreadNotificationCount = (): number => {
  return MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
};

