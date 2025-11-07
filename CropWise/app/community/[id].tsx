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
  createComment,
  getPostById,
  likeComment,
  likePost,
} from '../../services/communityService';

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
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await getPostById(id!);
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !post) {
      return;
    }

    try {
      const newComment = await createComment({
        postId: post.id,
        content: replyText.trim(),
      });

      if (newComment && post) {
        // Cập nhật post với comment mới
        const updatedPost = {
          ...post,
          comments: [...post.comments, newComment],
          commentCount: post.commentCount + 1,
        };
        setPost(updatedPost);
        setReplyText('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleLikePost = async (action: 'like' | 'dislike' | 'remove') => {
    if (!post) return;

    try {
      const updatedPost = await likePost({
        postId: post.id,
        action,
      });

      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLikeComment = async (
    commentId: string,
    action: 'like' | 'dislike' | 'remove'
  ) => {
    if (!post) return;

    try {
      const updatedComment = await likeComment({
        postId: post.id,
        commentId,
        action,
      });

      if (updatedComment && post) {
        // Cập nhật comment trong post
        const updatedComments = post.comments.map((c) =>
          c.id === commentId ? updatedComment : c
        );
        setPost({
          ...post,
          comments: updatedComments,
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      postId={post?.id || ''}
      onLike={(postId, commentId) => {
        const currentAction = (item as any).userLiked ? 'remove' : 'like';
        handleLikeComment(commentId, currentAction);
      }}
      onDislike={(postId, commentId) => {
        const currentAction = (item as any).userDisliked ? 'remove' : 'dislike';
        handleLikeComment(commentId, currentAction);
      }}
    />
  );

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
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButtonHeader}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hình ảnh bài đăng */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}

      <FlatList
        data={post.comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.postContent}>
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

            {/* Tiêu đề và nội dung */}
            {post.title && (
              <Text style={styles.postTitle}>{post.title}</Text>
            )}
            <Text style={styles.postContentText}>{post.content || ''}</Text>

            {/* Dịch */}
            <TouchableOpacity style={styles.translateButton}>
              <Text style={styles.translateText}>Dịch</Text>
            </TouchableOpacity>

            {/* Nút tương tác bài đăng */}
            <View style={styles.postInteractionRow}>
              <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => {
                  const action = post.userLiked ? 'remove' : 'like';
                  handleLikePost(action);
                }}
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
                onPress={() => {
                  const action = post.userDisliked ? 'remove' : 'dislike';
                  handleLikePost(action);
                }}
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
              <TouchableOpacity style={styles.interactionButton}>
                <Ionicons name="share-outline" size={20} color="#666" />
                <Text style={styles.interactionCount}>0</Text>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separatorLine} />
          </View>
        }
        ListEmptyComponent={renderEmptyComments}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Thanh nhập liệu phản hồi */}
      <View style={styles.replyInputContainer}>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.replyInput}
          placeholder="Viết câu trả lời của bạn"
          placeholderTextColor="#999"
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
            color={replyText.trim() ? '#1976D2' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButtonHeader: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  moreButtonHeader: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  postContentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  translateButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  translateText: {
    fontSize: 14,
    color: '#1976D2',
  },
  postInteractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
  separatorLine: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
    gap: 8,
  },
  cameraButton: {
    padding: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
});

