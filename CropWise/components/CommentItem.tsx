/**
 * Component hiển thị một bình luận/phản hồi
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
import { Comment } from '../types/community';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onLike?: (postId: string, commentId: string) => void;
  onDislike?: (postId: string, commentId: string) => void;
}

/**
 * Format thời gian bình luận (ví dụ: "45 m", "7 h", "2 d")
 */
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return 'Vừa xong';
  
  const now = new Date();
  const commentDate = new Date(dateString);
  
  if (isNaN(commentDate.getTime())) return 'Vừa xong';
  
  const diffMs = now.getTime() - commentDate.getTime();
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

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onLike,
  onDislike,
}) => {
  const userLiked = (comment as any).userLiked || false;
  const userDisliked = (comment as any).userDisliked || false;

  const handleLike = () => {
    if (onLike) {
      onLike(postId, comment.id);
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike(postId, comment.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Thông tin người bình luận */}
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {comment.user.avatarUrl ? (
            <Image
              source={{ uri: comment.user.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={18} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{comment.user.name || 'Người dùng'}</Text>
            {comment.user.isExpert && (
              <Ionicons name="school" size={14} color="#4CAF50" style={styles.icon} />
            )}
            {comment.user.isModerator && (
              <Ionicons name="settings" size={14} color="#666" style={styles.icon} />
            )}
            {comment.user.reputation && comment.user.reputation > 0 && (
              <>
                <Ionicons name="star" size={12} color="#FFA726" style={styles.icon} />
                <Text style={styles.reputation}>{comment.user.reputation ?? 0}</Text>
              </>
            )}
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Nội dung bình luận */}
      <View style={styles.content}>
        <Text style={styles.commentText}>{comment.content || ''}</Text>
      </View>

      {/* Dịch */}
      <TouchableOpacity style={styles.translateButton}>
        <Text style={styles.translateText}>Dịch</Text>
      </TouchableOpacity>

      {/* Nút tương tác */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
            size={18}
            color={userLiked ? '#1976D2' : '#666'}
          />
          <Text
            style={[
              styles.interactionCount,
              userLiked && styles.interactionCountActive,
            ]}
          >
            {comment.likeCount ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={handleDislike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={userDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={18}
            color={userDisliked ? '#1976D2' : '#666'}
          />
          <Text
            style={[
              styles.interactionCount,
              userDisliked && styles.interactionCountActive,
            ]}
          >
            {comment.dislikeCount ?? 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
    marginRight: 4,
  },
  icon: {
    marginLeft: 4,
    marginRight: 2,
  },
  reputation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  translateButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  translateText: {
    fontSize: 14,
    color: '#1976D2',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  interactionCountActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
});

