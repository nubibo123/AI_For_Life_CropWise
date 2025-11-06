/**
 * Mock data cho tính năng Cộng đồng
 * Dữ liệu giả dựa trên các ảnh mẫu UI
 */

import {
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  Post,
  User,
} from '../types/community';

// Mock Users
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: 'Shushi',
    country: 'Đà Nẵng',
    avatarUrl: undefined, // Placeholder
    reputation: 0,
  },
  {
    id: 'user2',
    name: 'Bánh xèo',
    country: 'Quảng Nam',
    avatarUrl: undefined, // Placeholder với hình cà chua
    reputation: 987410,
  },
  {
    id: 'user3',
    name: 'Tàu phớ',
    country: 'Cần Thơ',
    avatarUrl: undefined,
    reputation: 0,
  },
  {
    id: 'user4',
    name: 'Trà sữa trân châu',
    country: 'Vũng Tàu',
    avatarUrl: undefined, // Avatar người đàn ông mặc vest
    reputation: 508080,
    isExpert: true,
    isModerator: true,
  },
];

// Mock Comments
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment1',
    user: MOCK_USERS[1], // Venkat P.
    content: '@Shashi No problem is there',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 phút trước
    likeCount: 0,
    dislikeCount: 0,
  },
  {
    id: 'comment2',
    user: MOCK_USERS[3], // Suresh Gollar
    content: '@Abhi V. Check the presence of any insects',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 giờ trước
    likeCount: 0,
    dislikeCount: 0,
  },
];

// Mock User hiện tại (giả lập user đang đăng nhập)
const CURRENT_USER: User = {
  id: 'current_user',
  name: 'Người dùng hiện tại',
  country: 'Việt Nam',
  avatarUrl: undefined,
  reputation: 0,
};

// Mock Posts (sử dụng let để có thể thay đổi)
let MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    user: MOCK_USERS[0], // Shashi
    title: 'Help identifying problem with my Bean',
    content:
      'Plantix has detected a possible problem with my Bean. I was given a few possibilities: Healthy. Can you help me identifying the issue?',
    imageUrl: undefined, // Hình ảnh bó đậu que màu xanh lá và vàng nhạt
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 giờ trước
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 1,
    comments: [MOCK_COMMENTS[0]],
    cropType: 'Đậu',
    tags: ['Đậu'],
  },
  {
    id: 'post2',
    user: MOCK_USERS[2], // Abhi V
    title: 'What is the problem with the crop?',
    content:
      'Plants are having stalk without leaves and some nest like structure in leaf tip',
    imageUrl: undefined, // Hình ảnh cây trồng trong đất nâu, có cấu trúc tổ ở đầu lá
    imageUrls: undefined, // Có thể có nhiều ảnh
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 1,
    comments: [MOCK_COMMENTS[1]],
    cropType: 'Đậu gà & Đậu xanh',
    tags: ['Đậu gà & Đậu xanh'],
  },
  {
    id: 'post3',
    user: MOCK_USERS[1], // Venkat P.
    title: 'Cây đậu tương của tôi có vấn đề gì?',
    content:
      'Tôi đã trồng đậu tương được 2 tháng. Gần đây tôi nhận thấy một số lá bị vàng và có đốm nâu. Có ai biết nguyên nhân không?',
    imageUrl: undefined,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 giờ trước
    likeCount: 2,
    dislikeCount: 0,
    commentCount: 0,
    comments: [],
    cropType: 'Đậu tương',
    tags: ['Đậu tương'],
  },
];

// Export MOCK_POSTS
export { MOCK_POSTS };

/**
 * Thêm bài đăng mới vào mock data
 */
export const addPost = (postData: CreatePostRequest): Post => {
  const newPost: Post = {
    id: `post${Date.now()}`,
    user: CURRENT_USER,
    title: postData.title,
    content: postData.content || postData.description || '',
    imageUrl: postData.imageUrl,
    imageUrls: postData.imageUrls,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    comments: [],
    cropType: postData.cropType,
    tags: postData.tags,
    userLiked: false,
    userDisliked: false,
  };

  MOCK_POSTS = [newPost, ...MOCK_POSTS];
  return newPost;
};

/**
 * Thêm bình luận mới vào bài đăng
 */
export const addComment = (commentData: CreateCommentRequest): Comment => {
  const post = MOCK_POSTS.find((p) => p.id === commentData.postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const newComment: Comment = {
    id: `comment${Date.now()}`,
    user: CURRENT_USER,
    content: commentData.content,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    dislikeCount: 0,
  };

  post.comments.push(newComment);
  post.commentCount = post.comments.length;

  // Tự động tạo thông báo cho chủ bài đăng (nếu không phải chính họ comment)
  // Trong thực tế, điều này sẽ được xử lý bởi backend
  if (post.user.id !== CURRENT_USER.id) {
    // Import động để tránh circular dependency
    import('./mockNotificationData').then(({ addNotification }) => {
      addNotification({
        type: 'comment',
        title: 'Bình luận mới',
        message: `${CURRENT_USER.name} đã bình luận vào bài đăng của bạn: "${commentData.content.substring(0, 50)}${commentData.content.length > 50 ? '...' : ''}"`,
        user: CURRENT_USER,
        postId: post.id,
        commentId: newComment.id,
      });
    });
  }

  return newComment;
};

/**
 * Cập nhật like/dislike cho bài đăng
 */
export const updatePostLike = (
  postId: string,
  action: 'like' | 'dislike' | 'remove'
): Post => {
  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const wasLiked = post.userLiked || false;
  const wasDisliked = post.userDisliked || false;

  // Xóa like/dislike cũ nếu có
  if (wasLiked) {
    post.likeCount = Math.max(0, post.likeCount - 1);
    post.userLiked = false;
  }
  if (wasDisliked) {
    post.dislikeCount = Math.max(0, post.dislikeCount - 1);
    post.userDisliked = false;
  }

  // Thêm like/dislike mới
  if (action === 'like') {
    post.likeCount += 1;
    post.userLiked = true;
    post.userDisliked = false;
  } else if (action === 'dislike') {
    post.dislikeCount += 1;
    post.userDisliked = true;
    post.userLiked = false;
  }
  // Nếu action === 'remove', đã xóa ở trên

  return post;
};

/**
 * Cập nhật like/dislike cho bình luận
 */
export const updateCommentLike = (
  postId: string,
  commentId: string,
  action: 'like' | 'dislike' | 'remove'
): Comment => {
  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Giả lập trạng thái like/dislike (trong thực tế sẽ lưu trong comment)
  const wasLiked = (comment as any).userLiked || false;
  const wasDisliked = (comment as any).userDisliked || false;

  // Xóa like/dislike cũ nếu có
  if (wasLiked) {
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    (comment as any).userLiked = false;
  }
  if (wasDisliked) {
    comment.dislikeCount = Math.max(0, comment.dislikeCount - 1);
    (comment as any).userDisliked = false;
  }

  // Thêm like/dislike mới
  if (action === 'like') {
    comment.likeCount += 1;
    (comment as any).userLiked = true;
    (comment as any).userDisliked = false;
  } else if (action === 'dislike') {
    comment.dislikeCount += 1;
    (comment as any).userDisliked = true;
    (comment as any).userLiked = false;
  }

  return comment;
};

