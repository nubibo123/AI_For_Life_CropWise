import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommentItem } from '../../components/CommentItem';
import { Comment, Post } from '../../types/community';
import {
  createCommentRealtime,
  likePost,
  subscribeToPost,
  voteComment,
  markBestAnswer,
} from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';


/**
 * Format thời gian đăng bài
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

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsub = subscribeToPost(id, (p) => {
      setPost(p);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !post) {
      return;
    }

    try {
      await createCommentRealtime({
        postId: post.id,
        content: replyText.trim(),
      });
      setReplyText('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleLikePost = async (action: 'like' | 'dislike' | 'remove') => {
    if (!post) return;

    try {
      await likePost({
        postId: post.id,
        action,
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleVoteComment = async (commentId: string, value: 1 | -1 | 0) => {
    if (!post) return;
    try {
      await voteComment(post.id, commentId, value);
    } catch (e) {
      console.error('Error voting comment', e);
    }
  };

  const handleMarkBest = async (commentId: string) => {
    if (!post) return;
    try {
      await markBestAnswer(post.id, commentId);
    } catch (e) {
      console.error('Error marking best answer', e);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isBest = post?.bestAnswerId === item.id;
    const canMark = !!user && user.id === post?.authorId;
    return (
      <CommentItem
        comment={item}
        postId={post?.id || ''}
        onUpvote={() => handleVoteComment(item.id, 1)}
        onDownvote={() => handleVoteComment(item.id, -1)}
        canMarkBest={canMark}
        isBestAnswer={isBest}
        onMarkBest={() => handleMarkBest(item.id)}
      />
    );
  };

  const renderEmptyComments = () => (
    <View style={styles.emptyComments}>
      <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
      <Text style={styles.emptyCommentsText}>
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#81C784" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="rgba(255,255,255,0.4)" />
        <Text style={styles.errorText}>Không tìm thấy bài đăng</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const comments = post.comments || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="light" />
      
      {/* Header với back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết bài đăng</Text>
        <TouchableOpacity style={styles.moreButtonHeader}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <GlassCard 
            intensity={post.hasExpertComment ? 35 : 20}
            style={[
              styles.postContent,
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

              {/* Tiêu đề và nội dung */}
              {post.title && (
                <Text style={styles.postTitle}>{post.title}</Text>
              )}
              <Text style={styles.postContentText}>{post.content || ''}</Text>

              {/* Hình ảnh bài đăng */}
              {post.imageUrl && (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                </View>
              )}

              {/* Dịch */}
              <TouchableOpacity style={styles.translateButton}>
                <Text style={styles.translateText}>Dịch</Text>
              </TouchableOpacity>

              {/* Nút tương tác bài đăng */}
              <View style={styles.postInteractionRow}>
                <View style={styles.leftActions}>
                  <TouchableOpacity
                    style={[styles.interactionButton, post.userLiked && styles.activeLikeButton]}
                    onPress={() => {
                      const action = post.userLiked ? 'remove' : 'like';
                      handleLikePost(action);
                    }}
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
                    onPress={() => {
                      const action = post.userDisliked ? 'remove' : 'dislike';
                      handleLikePost(action);
                    }}
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
                </View>

                <TouchableOpacity 
                  style={styles.shareButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-social-outline" size={18} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        }
        ListEmptyComponent={renderEmptyComments}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Thanh nhập liệu phản hồi */}
      <View style={styles.replyInputContainer}>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
        <TextInput
          style={styles.replyInput}
          placeholder="Viết câu trả lời của bạn..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={replyText}
          onChangeText={setReplyText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendReply}
          disabled={!replyText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={replyText.trim() ? '#81C784' : 'rgba(255, 255, 255, 0.3)'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#81C784',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonHeader: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  moreButtonHeader: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postContent: {
    margin: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
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
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 25,
  },
  postContentText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    marginBottom: 12,
  },
  translateButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  translateText: {
    fontSize: 13,
    color: '#64B5F6',
    fontWeight: '600',
  },
  postInteractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 10, 30, 0.65)',
    gap: 8,
  },
  cameraButton: {
    padding: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFF',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    padding: 8,
  },
});

