/**
 * Component hiển thị một thông báo
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

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
}

/**
 * Format thời gian thông báo (ví dụ: "45 m", "7 h", "2 d")
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
    return `${diffDays} d`;
  } else if (diffHours > 0) {
    return `${diffHours} h`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} m`;
  }
};

/**
 * Lấy icon theo loại thông báo
 */
const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'comment':
    case 'reply':
      return 'chatbubble';
    case 'like':
      return 'heart';
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
      return '#1976D2';
    case 'like':
      return '#E91E63';
    case 'mention':
      return '#FF9800';
    case 'follow':
      return '#4CAF50';
    case 'post_approved':
      return '#4CAF50';
    case 'post_rejected':
      return '#F44336';
    default:
      return '#666';
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
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon thông báo */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getNotificationIconColor(notification.type)}20` },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(notification.type) as any}
          size={24}
          color={getNotificationIconColor(notification.type)}
        />
      </View>

      {/* Nội dung thông báo */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{notification.title}</Text>
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
              <Ionicons name="person" size={16} color="#666" />
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
        <Ionicons name="close" size={18} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  unreadContainer: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976D2',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});

