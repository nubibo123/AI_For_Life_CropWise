/**
 * TypeScript interfaces cho tính năng Thông báo
 */

import { Post, User } from './community';

export type NotificationType =
  | 'comment'
  | 'like'
  | 'reply'
  | 'mention'
  | 'follow'
  | 'post_approved'
  | 'post_rejected'
  | 'alert';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  user?: User; // Người tạo thông báo
  post?: Post; // Bài đăng liên quan (nếu có)
  postId?: string; // ID bài đăng liên quan
  commentId?: string; // ID bình luận liên quan (nếu có)
  createdAt: string; // ISO date string
  isRead: boolean;
  imageUrl?: string; // Ảnh đại diện cho thông báo
}

export interface NotificationCount {
  total: number;
  unread: number;
}

