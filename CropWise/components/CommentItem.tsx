/**
 * Component hiển thị một bình luận/phản hồi trong giao diện kính mờ (Glassmorphism)
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
import GlassCard from './ui/GlassCard';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onLike?: (postId: string, commentId: string) => void;
  onDislike?: (postId: string, commentId: string) => void;
  onUpvote?: (postId: string, commentId: string) => void;
  onDownvote?: (postId: string, commentId: string) => void;
  canMarkBest?: boolean;
  isBestAnswer?: boolean;
  onMarkBest?: (postId: string, commentId: string) => void;
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
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes > 0 ? diffMinutes : 1} phút trước`;
  }
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onUpvote,
  onDownvote,
  canMarkBest,
  isBestAnswer,
  onMarkBest,
}) => {
  const handleUpvote = () => {
    if (onUpvote) onUpvote(postId, comment.id);
  };

  const handleDownvote = () => {
    if (onDownvote) onDownvote(postId, comment.id);
  };

  const handleMarkBest = () => {
    if (onMarkBest) onMarkBest(postId, comment.id);
  };

  return (
    <View style={styles.outerContainer}>
      <GlassCard 
        intensity={comment.user.isExpert ? 35 : isBestAnswer ? 40 : 20} 
        style={[
          styles.container,
          isBestAnswer ? styles.bestAnswerContainer : undefined,
          comment.user.isExpert ? styles.expertCommentContainer : undefined,
        ]}
      >
        {comment.user.isExpert && (
          <View style={styles.expertBadgeTop}>
            <Ionicons name="ribbon-outline" size={14} color="#FFF" />
            <Text style={styles.expertBadgeTopText}>Ý KIẾN CHUYÊN GIA</Text>
          </View>
        )}
        
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
                <Ionicons name="person" size={18} color="rgba(255, 255, 255, 0.7)" />
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, comment.user.isExpert && styles.expertUserName]}>
                {comment.user.name || 'Người dùng'}
              </Text>
              {comment.user.isExpert && (
                <Ionicons name="checkmark-done-circle" size={16} color="#81C784" style={styles.icon} />
              )}
              {comment.user.isModerator && (
                <Ionicons name="shield-checkmark" size={14} color="#64B5F6" style={styles.icon} />
              )}
              {comment.user.reputation !== undefined && comment.user.reputation > 0 && (
                <View style={styles.reputationBadge}>
                  <Ionicons name="star" size={10} color="#FFA726" />
                  <Text style={styles.reputation}>{comment.user.reputation ?? 0}</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={18} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* Nội dung bình luận */}
        <View style={styles.content}>
          <Text style={styles.commentText}>{comment.content || ''}</Text>
        </View>

        {/* Nút tương tác */}
        <View style={styles.interactionRow}>
          {/* Bộ chọn Vote */}
          <View style={styles.voteSection}>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={handleUpvote}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-up" size={18} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
            <Text style={styles.voteCountText}>{comment.voteCount ?? 0}</Text>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={handleDownvote}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-down" size={18} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          {/* Nút chọn bài trả lời tốt nhất */}
          {canMarkBest && !isBestAnswer && (
            <TouchableOpacity style={styles.bestButton} onPress={handleMarkBest}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#81C784" />
              <Text style={styles.bestButtonText}>Tốt nhất</Text>
            </TouchableOpacity>
          )}
          {isBestAnswer && (
            <View style={styles.bestBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#81C784" />
              <Text style={styles.bestBadgeText}>Giải pháp hay nhất</Text>
            </View>
          )}
        </View>
      </GlassCard>
    </View>
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
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bestAnswerContainer: {
    borderColor: 'rgba(129, 199, 132, 0.6)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(129, 199, 132, 0.08)',
  },
  expertCommentContainer: {
    borderColor: 'rgba(76, 175, 80, 0.6)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  expertBadgeTop: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: -14,
    marginTop: -14,
  },
  expertBadgeTopText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  expertUserName: {
    color: '#81C784',
  },
  icon: {
    marginLeft: 2,
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  reputation: {
    fontSize: 10,
    color: '#FFA726',
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    marginBottom: 12,
    paddingLeft: 2,
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 21,
  },
  translateButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  translateText: {
    fontSize: 13,
    color: '#64B5F6',
    fontWeight: '600',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButton: {
    padding: 4,
  },
  voteCountText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  bestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.3)',
  },
  bestButtonText: {
    color: '#81C784',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  bestBadgeText: {
    color: '#81C784',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '700',
  },
});
