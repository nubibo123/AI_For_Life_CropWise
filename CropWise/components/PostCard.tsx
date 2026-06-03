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
import GlassCard from './ui/GlassCard';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

/**
 * Format thời gian đăng bài (ví dụ: "4 giờ trước", "1 ngày trước")
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
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes > 0 ? diffMinutes : 1} phút trước`;
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
      activeOpacity={0.85}
    >
      <GlassCard 
        intensity={post.hasExpertComment ? 35 : 20} 
        style={[
          styles.card,
          post.hasExpertComment && styles.expertCardBorder
        ]}
      >
        {post.hasExpertComment && (
          <View style={styles.expertBanner}>
            <Ionicons name="ribbon" size={14} color="#FFF" />
            <Text style={styles.expertBannerText}>ĐÃ ĐƯỢC CHUYÊN GIA GIẢI ĐÁP</Text>
          </View>
        )}

        <View style={styles.cardPadding}>
          {/* Thông tin người đăng */}
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {post.user.avatarUrl ? (
                <Image
                  source={{ uri: post.user.avatarUrl }}
                  style={[
                    styles.avatar,
                    post.user.isExpert && styles.expertAvatarBorder
                  ]}
                />
              ) : (
                <View style={[
                  styles.avatarPlaceholder,
                  post.user.isExpert && styles.expertAvatarBorder
                ]}>
                  <Ionicons name="person" size={18} color="rgba(255,255,255,0.7)" />
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userName, post.user.isExpert && styles.expertUserName]}>
                  {post.user.name || 'Người dùng'}
                </Text>
                {post.user.isExpert && (
                  <Ionicons name="checkmark-done-circle" size={16} color="#81C784" style={styles.badgeIcon} />
                )}
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
                  <View style={styles.cropBadge}>
                    <Ionicons name="leaf" size={10} color="#81C784" />
                    <Text style={styles.cropType}>{post.cropType}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Nội dung bài đăng */}
          <View style={styles.contentContainer}>
            {post.title && (
              <Text style={styles.postTitle}>{post.title}</Text>
            )}
            <Text style={styles.postContent} numberOfLines={3}>
              {post.content || ''}
            </Text>
          </View>

          {/* Hình ảnh bài đăng (nếu có) - đặt lọt lòng trong card */}
          {post.imageUrl && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: post.imageUrl }} style={styles.image} />
            </View>
          )}

          {/* Nút tương tác */}
          <View style={styles.interactionBar}>
            <View style={styles.leftActions}>
              <TouchableOpacity
                style={[styles.interactionButton, post.userLiked && styles.activeLikeButton]}
                onPress={handleLike}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={post.userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                  size={18}
                  color={post.userLiked ? '#81C784' : 'rgba(255, 255, 255, 0.7)'}
                />
                <Text
                  style={[
                    styles.interactionCount,
                    post.userLiked && styles.activeLikeText,
                  ]}
                >
                  {post.likeCount ?? 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.interactionButton, post.userDisliked && styles.activeDislikeButton]}
                onPress={handleDislike}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={post.userDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                  size={18}
                  color={post.userDisliked ? '#FF5252' : 'rgba(255, 255, 255, 0.7)'}
                />
                <Text
                  style={[
                    styles.interactionCount,
                    post.userDisliked && styles.activeDislikeText,
                  ]}
                >
                  {post.dislikeCount ?? 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.interactionButton}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.interactionCount}>
                  {post.commentCount ?? 0}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  expertCardBorder: {
    borderColor: 'rgba(129, 199, 132, 0.45)',
    borderWidth: 1.5,
  },
  expertBanner: {
    backgroundColor: 'rgba(76, 175, 80, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  expertBannerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardPadding: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  expertAvatarBorder: {
    borderColor: '#81C784',
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    fontWeight: '700',
    color: '#FFF',
  },
  expertUserName: {
    color: '#81C784',
  },
  badgeIcon: {
    marginLeft: 4,
  },
  separator: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  country: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  timeAgo: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  cropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  cropType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#81C784',
  },
  contentContainer: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    marginTop: 4,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeLikeButton: {
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    borderColor: 'rgba(129, 199, 132, 0.3)',
    borderWidth: 1,
  },
  activeDislikeButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderColor: 'rgba(255, 82, 82, 0.3)',
    borderWidth: 1,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  interactionCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeLikeText: {
    color: '#81C784',
    fontWeight: '700',
  },
  activeDislikeText: {
    color: '#FF5252',
    fontWeight: '700',
  },
});


