/**
 * Component hiển thị một bài đăng trong danh sách
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
import { Post } from '../types/community';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

/**
 * Format thời gian đăng bài (ví dụ: "4 h", "1 d", "2 ngày")
 */
const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return 'Vừa xong';
  
  const now = new Date();
  const postDate = new Date(dateString);
  
  if (isNaN(postDate.getTime())) return 'Vừa xong';
  
  const diffMs = now.getTime() - postDate.getTime();
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

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  onDislike,
  onShare,
}) => {
  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike(post.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Hình ảnh bài đăng */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      {/* Thông tin người đăng */}
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {post.user.avatarUrl ? (
            <Image
              source={{ uri: post.user.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{post.user.name || 'Người dùng'}</Text>
            {post.user.country && (
              <>
                <Text style={styles.separator}> • </Text>
                <Text style={styles.country}>{post.user.country}</Text>
              </>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
            {post.cropType && (
              <>
                <Ionicons name="leaf" size={12} color="#4CAF50" />
                <Text style={styles.cropType}>{post.cropType}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Nội dung bài đăng */}
      <View style={styles.content}>
        {post.title && (
          <Text style={styles.title}>{post.title}</Text>
        )}
        <Text style={styles.text} numberOfLines={3}>
          {post.content || ''}
        </Text>
      </View>

      {/* Dịch và số bình luận */}
      <View style={styles.actionRow}>
        <TouchableOpacity>
          <Text style={styles.translateButton}>Dịch</Text>
        </TouchableOpacity>
        <Text style={styles.commentCount}>
          {post.commentCount ?? 0} {post.commentCount === 1 ? 'trả lời' : 'trả lời'}
        </Text>
      </View>

      {/* Nút tương tác */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
            size={20}
            color={post.userLiked ? '#1976D2' : '#666'}
          />
          <Text
            style={[
              styles.interactionCount,
              post.userLiked && styles.interactionCountActive,
            ]}
          >
            {post.likeCount ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={handleDislike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.userDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
            size={20}
            color={post.userDisliked ? '#1976D2' : '#666'}
          />
          <Text
            style={[
              styles.interactionCount,
              post.userDisliked && styles.interactionCountActive,
            ]}
          >
            {post.dislikeCount ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    marginRight: 10,
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
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  separator: {
    fontSize: 15,
    color: '#999',
  },
  country: {
    fontSize: 14,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  cropType: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  translateButton: {
    fontSize: 14,
    color: '#1976D2',
  },
  commentCount: {
    fontSize: 14,
    color: '#666',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
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

