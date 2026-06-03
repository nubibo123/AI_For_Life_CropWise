/**
 * Component hiển thị một thông báo trong giao diện kính mờ (Glassmorphism)
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Notification } from '../types/notification';
import GlassCard from './ui/GlassCard';

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
}

/**
 * Format thời gian thông báo (ví dụ: "45 phút trước", "2 giờ trước")
 */
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return 'Vừa xong';
  
  const now = new Date();
  const notificationDate = new Date(dateString);
  
  if (isNaN(notificationDate.getTime())) return 'Vừa xong';
  
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes > 0 ? diffMinutes : 1} phút trước`;
  }
};

/**
 * Lấy icon theo loại thông báo
 */
const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'comment':
    case 'reply':
      return 'chatbubble-ellipses';
    case 'like':
      return 'thumbs-up';
    case 'mention':
      return 'at';
    case 'follow':
      return 'person-add';
    case 'post_approved':
      return 'checkmark-circle';
    case 'post_rejected':
      return 'close-circle';
    default:
      return 'notifications';
  }
};

/**
 * Lấy màu icon theo loại thông báo
 */
const getNotificationIconColor = (type: Notification['type']): string => {
  switch (type) {
    case 'comment':
    case 'reply':
      return '#81C784';
    case 'like':
      return '#81C784';
    case 'mention':
      return '#FFA726';
    case 'follow':
      return '#64B5F6';
    case 'post_approved':
      return '#81C784';
    case 'post_rejected':
      return '#FF5252';
    default:
      return 'rgba(255, 255, 255, 0.6)';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    }
    // Tự động đánh dấu đã đọc khi nhấn
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <TouchableOpacity
      style={styles.outerContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <GlassCard
        intensity={notification.isRead ? 20 : 35}
        style={[
          styles.container,
          !notification.isRead && styles.unreadContainer,
        ]}
      >
        {/* Icon thông báo */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getNotificationIconColor(notification.type)}15` },
          ]}
        >
          <Ionicons
            name={getNotificationIcon(notification.type) as any}
            size={20}
            color={getNotificationIconColor(notification.type)}
          />
        </View>

        {/* Nội dung thông báo */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message || ''}
          </Text>
          <Text style={styles.timeAgo}>
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>

        {/* Avatar người dùng (nếu có) */}
        {notification.user && (
          <View style={styles.avatarContainer}>
            {notification.user.avatarUrl ? (
              <Image
                source={{ uri: notification.user.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={14} color="rgba(255, 255, 255, 0.5)" />
              </View>
            )}
          </View>
        )}

        {/* Nút xóa */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.4)" />
        </TouchableOpacity>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadContainer: {
    borderColor: 'rgba(129, 199, 132, 0.45)',
    backgroundColor: 'rgba(129, 199, 132, 0.08)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
    marginRight: 4,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  avatarContainer: {
    marginLeft: 8,
    marginRight: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
