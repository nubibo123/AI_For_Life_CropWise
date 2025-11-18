/**
 * TypeScript interfaces cho tính năng Cộng đồng
 */

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  country?: string;
  reputation?: number;
  isExpert?: boolean;
  isModerator?: boolean;
}

export interface Comment {
  id: string;
  authorId?: string;
  user: User;
  content: string;
  createdAt: string; // ISO date string
  likeCount: number;
  dislikeCount: number;
  voteCount?: number;
}

export interface Post {
  id: string;
  authorId?: string;
  user: User;
  content: string;
  description?: string;
  title?: string;
  imageUrl?: string;
  imageUrls?: string[]; // Hỗ trợ nhiều ảnh
  createdAt: string; // ISO date string
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  comments: Comment[];
  cropType?: string; // Loại cây trồng (ví dụ: "Đậu", "Đậu gà & Đậu xanh")
  tags?: string[];
  userLiked?: boolean; // Người dùng hiện tại đã like chưa
  userDisliked?: boolean; // Người dùng hiện tại đã dislike chưa
  voteCount?: number;
  bestAnswerId?: string | null;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  cropType?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  imageUrl?: string;
}

export interface LikePostRequest {
  postId: string;
  action: 'like' | 'dislike' | 'remove';
}

export interface LikeCommentRequest {
  commentId: string;
  postId: string;
  action: 'like' | 'dislike' | 'remove';
}

