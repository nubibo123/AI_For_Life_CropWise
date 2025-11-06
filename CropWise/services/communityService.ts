/**
 * Service để lấy dữ liệu cộng đồng
 * Sử dụng mock data, sẵn sàng thay thế bằng API thật
 */

import {
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  LikeCommentRequest,
  LikePostRequest,
  Post,
} from '../types/community';
import { MOCK_POSTS, addPost, addComment, updatePostLike, updateCommentLike } from './mockData';

/**
 * Giả lập độ trễ mạng
 */
const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Lấy danh sách tất cả bài đăng trong cộng đồng
 * @returns Promise<Post[]> Danh sách bài đăng
 */
export const getCommunityPosts = async (): Promise<Post[]> => {
  await simulateNetworkDelay(300);
  // Trả về bản sao để tránh mutation
  return JSON.parse(JSON.stringify(MOCK_POSTS));
};

/**
 * Lấy chi tiết một bài đăng theo ID
 * @param id ID của bài đăng
 * @returns Promise<Post | null> Bài đăng hoặc null nếu không tìm thấy
 */
export const getPostById = async (id: string): Promise<Post | null> => {
  await simulateNetworkDelay(200);
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) {
    return null;
  }
  // Trả về bản sao để tránh mutation
  return JSON.parse(JSON.stringify(post));
};

/**
 * Lấy danh sách bài đăng theo loại cây trồng
 * @param cropType Loại cây trồng
 * @returns Promise<Post[]> Danh sách bài đăng
 */
export const getPostsByCropType = async (cropType: string): Promise<Post[]> => {
  await simulateNetworkDelay(300);
  const filteredPosts = MOCK_POSTS.filter(
    (post) => post.cropType === cropType
  );
  return JSON.parse(JSON.stringify(filteredPosts));
};

/**
 * Tạo bài đăng mới
 * @param postData Dữ liệu bài đăng
 * @returns Promise<Post | null> Bài đăng mới tạo hoặc null nếu lỗi
 */
export const createPost = async (postData: CreatePostRequest): Promise<Post | null> => {
  await simulateNetworkDelay(500);
  try {
    const newPost = addPost(postData);
    return JSON.parse(JSON.stringify(newPost));
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

/**
 * Tạo bình luận mới cho bài đăng
 * @param commentData Dữ liệu bình luận
 * @returns Promise<Comment | null> Bình luận mới tạo hoặc null nếu lỗi
 */
export const createComment = async (
  commentData: CreateCommentRequest
): Promise<Comment | null> => {
  await simulateNetworkDelay(400);
  try {
    const newComment = addComment(commentData);
    return JSON.parse(JSON.stringify(newComment));
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
};

/**
 * Like/Dislike bài đăng
 * @param likeData Dữ liệu like/dislike
 * @returns Promise<Post | null> Bài đăng đã cập nhật hoặc null nếu lỗi
 */
export const likePost = async (likeData: LikePostRequest): Promise<Post | null> => {
  await simulateNetworkDelay(300);
  try {
    const updatedPost = updatePostLike(likeData.postId, likeData.action);
    return JSON.parse(JSON.stringify(updatedPost));
  } catch (error) {
    console.error('Error liking post:', error);
    return null;
  }
};

/**
 * Like/Dislike bình luận
 * @param likeData Dữ liệu like/dislike
 * @returns Promise<Comment | null> Bình luận đã cập nhật hoặc null nếu lỗi
 */
export const likeComment = async (
  likeData: LikeCommentRequest
): Promise<Comment | null> => {
  await simulateNetworkDelay(300);
  try {
    const updatedComment = updateCommentLike(
      likeData.postId,
      likeData.commentId,
      likeData.action
    );
    return JSON.parse(JSON.stringify(updatedComment));
  } catch (error) {
    console.error('Error liking comment:', error);
    return null;
  }
};

