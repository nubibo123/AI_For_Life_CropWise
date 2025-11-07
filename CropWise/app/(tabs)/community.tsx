import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PostCard } from '../../components/PostCard';
import { Post } from '../../types/community';
import {
  getCommunityPosts,
  likePost,
} from '../../services/communityService';
import { getNotificationCount } from '../../services/notificationService';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    loadPosts();
    loadNotificationCount();
  }, []);

  // Refresh notification count when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotificationCount();
    }, [])
  );

  const loadNotificationCount = async () => {
    try {
      const count = await getNotificationCount();
      setUnreadNotificationCount(count.unread);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (postId: string) => {
    router.push(`/community/${postId}`);
  };

  const handleCreatePost = () => {
    router.push('/community/create');
  };

  const handleLikePost = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const action = post.userLiked ? 'remove' : 'like';
      const updatedPost = await likePost({
        postId,
        action,
      });

      if (updatedPost) {
        setPosts(
          posts.map((p) => (p.id === postId ? updatedPost : p))
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislikePost = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const action = post.userDisliked ? 'remove' : 'dislike';
      const updatedPost = await likePost({
        postId,
        action,
      });

      if (updatedPost) {
        setPosts(
          posts.map((p) => (p.id === postId ? updatedPost : p))
        );
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item.id)}
      onLike={handleLikePost}
      onDislike={handleDislikePost}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>Chưa có bài đăng nào</Text>
      <Text style={styles.emptyStateSubtext}>
        Hãy là người đầu tiên chia sẻ!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header với tìm kiếm */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm trong Cộng đồng"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/notifications')}
        >
          <View style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {unreadNotificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Thanh lọc */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Lọc theo</Text>
          <TouchableOpacity>
            <Text style={styles.changeButton}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterChips}>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="leaf" size={16} color="#4CAF50" />
            <Text style={styles.filterChipText}>Đậu gà & Đậu xanh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="leaf" size={16} color="#4CAF50" />
            <Text style={styles.filterChipText}>Đậu tương</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="leaf" size={16} color="#4CAF50" />
            <Text style={styles.filterChipText}>Đậu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thanh tạo bài đăng mới */}
      <TouchableOpacity
        style={styles.createPostBar}
        onPress={handleCreatePost}
        activeOpacity={0.7}
      >
        <View style={styles.createPostContent}>
          <Ionicons name="create-outline" size={20} color="#1976D2" />
          <Text style={styles.createPostText}>Tạo bài đăng mới</Text>
        </View>
      </TouchableOpacity>

      {/* Danh sách bài đăng */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Nút FAB - Hỏi Cộng đồng */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Ionicons name="create" size={24} color="#fff" />
        <Text style={styles.fabText}>Hỏi Cộng đồng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  headerButton: {
    padding: 4,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  changeButton: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#333',
  },
  createPostBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  createPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createPostText: {
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
