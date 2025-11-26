/**
 * Service dữ liệu Cộng đồng sử dụng Firebase Firestore
 */

import {
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  LikePostRequest,
  Post,
} from '../types/community';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Transaction,
  where,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { createNotification } from './notificationService';
import { uploadImageToCloudinary, uploadMultipleImages } from './cloudinaryService';

const mapPost = (id: string, data: any): Post => ({
  id,
  authorId: data.authorId,
  user: {
    id: data.authorId,
    name: data.authorName || 'Người dùng',
    avatarUrl: data.authorAvatarUrl,
  },
  content: data.content || '',
  description: data.description || undefined,
  title: data.title || undefined,
  imageUrl: data.imageUrl || undefined,
  imageUrls: data.imageUrls || undefined,
  createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  likeCount: data.likeCount ?? 0,
  dislikeCount: data.dislikeCount ?? 0,
  voteCount: data.voteCount ?? 0,
  commentCount: data.commentCount ?? 0,
  comments: [],
  cropType: data.cropType || undefined,
  tags: data.tags || undefined,
  userLiked: false,
  userDisliked: false,
  bestAnswerId: data.bestAnswerId ?? null,
});

const mapComment = (id: string, data: any): Comment => ({
  id,
  authorId: data.authorId,
  user: {
    id: data.authorId,
    name: data.authorName || 'Người dùng',
    avatarUrl: data.authorAvatarUrl,
  },
  content: data.content || '',
  createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  likeCount: data.likeCount ?? 0,
  dislikeCount: data.dislikeCount ?? 0,
  voteCount: data.voteCount ?? 0,
});

const applyUserVoteToPost = (post: Post, vote: number): Post => ({
  ...post,
  userLiked: vote === 1,
  userDisliked: vote === -1,
});

const resolveVoteValue = (action: LikePostRequest['action']): 1 | -1 | 0 => {
  switch (action) {
    case 'like':
      return 1;
    case 'dislike':
      return -1;
    default:
      return 0;
  }
};

const attachUserVote = async (post: Post, userId: string): Promise<Post> => {
  const voteSnap = await getDoc(doc(db, 'posts', post.id, 'votes', userId));
  const vote = voteSnap.exists() ? ((voteSnap.data().value as number) ?? 0) : 0;
  return applyUserVoteToPost(post, vote);
};

const orderComments = (comments: Comment[], bestAnswerId?: string | null): Comment[] => {
  const sorted = [...comments].sort((a, b) => {
    if (bestAnswerId) {
      if (a.id === bestAnswerId) return -1;
      if (b.id === bestAnswerId) return 1;
    }
    const voteDiff = (b.voteCount ?? 0) - (a.voteCount ?? 0);
    if (voteDiff !== 0) return voteDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return sorted;
};

const logFirestoreError = (error: unknown, context: string) => {
  console.error(`[Firestore:${context}]`, error);
  if (error && typeof error === 'object' && 'message' in error) {
    console.error(`[Firestore:${context}] message:`, (error as { message: string }).message);
  }
  if (error && typeof error === 'object' && 'code' in error) {
    console.error(`[Firestore:${context}] code:`, (error as { code: string }).code);
  }
};

/**
 * Realtime danh sách bài đăng (sorted by createdAt desc)
 */
export const subscribeToCommunityPosts = (
  callback: (posts: Post[]) => void
): (() => void) => {
  const currentUser = auth.currentUser;
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
    const rawPosts = snapshot.docs.map((docSnap) => mapPost(docSnap.id, docSnap.data()));

    if (!currentUser) {
      callback(rawPosts);
      return;
    }

    const postsWithVote = await Promise.all(
      rawPosts.map((post) => attachUserVote(post, currentUser.uid))
    );
    callback(postsWithVote);
  }, (error) => {
    logFirestoreError(error, 'subscribeToCommunityPosts');
  });

  return unsubscribe;
};

/**
 * Fetch danh sách bài đăng một lần
 */
export const getCommunityPosts = async (): Promise<Post[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
    const currentUser = auth.currentUser;
    const posts = snapshot.docs.map((docSnap) => mapPost(docSnap.id, docSnap.data()));

    if (!currentUser) {
      return posts;
    }

    return await Promise.all(posts.map((post) => attachUserVote(post, currentUser.uid)));
  } catch (error) {
    logFirestoreError(error, 'getCommunityPosts');
    throw error;
  }
};

/**
 * Fetch chi tiết bài đăng một lần
 */
export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const snap = await getDoc(doc(db, 'posts', id));
    if (!snap.exists()) return null;
    const post = mapPost(snap.id, snap.data());
    const currentUser = auth.currentUser;
    if (!currentUser) return post;
    return await attachUserVote(post, currentUser.uid);
  } catch (error) {
    logFirestoreError(error, `getPostById(${id})`);
    throw error;
  }
};

/**
 * Fetch bài đăng theo loại cây trồng
 */
export const getPostsByCropType = async (cropType: string): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('cropType', '==', cropType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(postsQuery);
    const currentUser = auth.currentUser;
    const posts = snapshot.docs.map((docSnap) => mapPost(docSnap.id, docSnap.data()));

    if (!currentUser) {
      return posts;
    }

    return await Promise.all(posts.map((post) => attachUserVote(post, currentUser.uid)));
  } catch (error) {
    logFirestoreError(error, `getPostsByCropType(${cropType})`);
    throw error;
  }
};

/**
 * Tạo bài đăng mới
 */
export const createPost = async (postData: CreatePostRequest): Promise<Post | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  try {
    // Upload ảnh lên Cloudinary nếu có
    let cloudinaryImageUrl: string | null = null;
    let cloudinaryImageUrls: string[] | null = null;

    if (postData.imageUrl) {
      console.log('📤 Đang upload ảnh đơn lên Cloudinary...');
      const result = await uploadImageToCloudinary(postData.imageUrl, 'cropwise/community');
      if (result.success && result.url) {
        cloudinaryImageUrl = result.url;
        console.log('✅ Upload ảnh thành công:', cloudinaryImageUrl);
      } else {
        console.error('❌ Upload ảnh thất bại:', result.error);
        throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
      }
    }

    if (postData.imageUrls && postData.imageUrls.length > 0) {
      console.log('📤 Đang upload nhiều ảnh lên Cloudinary...');
      cloudinaryImageUrls = await uploadMultipleImages(postData.imageUrls, 'cropwise/community');
      if (cloudinaryImageUrls.length === 0) {
        throw new Error('Không thể upload ảnh. Vui lòng thử lại.');
      }
      console.log(`✅ Upload ${cloudinaryImageUrls.length} ảnh thành công`);
    }

    const postRef = await addDoc(collection(db, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName ?? null,
      authorAvatarUrl: user.photoURL ?? null,
      title: postData.title ?? null,
      content: postData.content,
      description: postData.description ?? null,
      imageUrl: cloudinaryImageUrl,
      imageUrls: cloudinaryImageUrls,
      cropType: postData.cropType ?? null,
      tags: postData.tags ?? null,
      likeCount: 0,
      dislikeCount: 0,
      voteCount: 0,
      commentCount: 0,
      bestAnswerId: null,
      createdAt: serverTimestamp(),
    });

    const snap = await getDoc(postRef);
    if (!snap.exists()) return null;
    return applyUserVoteToPost(mapPost(snap.id, snap.data()), 0);
  } catch (error) {
    logFirestoreError(error, 'createPost');
    throw error;
  }
};

/**
 * Transaction xử lý like/dislike bài đăng
 */
export const likePost = async (likeData: LikePostRequest): Promise<Post | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const postRef = doc(db, 'posts', likeData.postId);
  const voteRef = doc(db, 'posts', likeData.postId, 'votes', user.uid);
  const nextValue = resolveVoteValue(likeData.action);

  try {
    let postAuthorId: string | null = null;
    let postTitle: string | null = null;
    let shouldNotify = false;

    await runTransaction(db, async (tx: Transaction) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) throw new Error('Post not found');

      const voteSnap = await tx.get(voteRef);
      const prevValue = voteSnap.exists() ? ((voteSnap.data().value as number) ?? 0) : 0;

      if (prevValue === nextValue) {
        return;
      }

      const data = postSnap.data() ?? {};
      postAuthorId = data.authorId ?? null;
      postTitle = data.title ?? null;
      const likeCount = data.likeCount ?? 0;
      const dislikeCount = data.dislikeCount ?? 0;
      const voteCount = data.voteCount ?? 0;

      const updatedLikeCount = likeCount + (nextValue === 1 ? 1 : 0) - (prevValue === 1 ? 1 : 0);
      const updatedDislikeCount =
        dislikeCount + (nextValue === -1 ? 1 : 0) - (prevValue === -1 ? 1 : 0);
      const updatedVoteCount = voteCount + (nextValue - prevValue);

      tx.update(postRef, {
        likeCount: updatedLikeCount,
        dislikeCount: updatedDislikeCount,
        voteCount: updatedVoteCount,
      });

      tx.set(voteRef, { value: nextValue });

      if (prevValue !== 1 && nextValue === 1) {
        shouldNotify = true;
      }
    });

    const updatedSnap = await getDoc(postRef);
    if (!updatedSnap.exists()) return null;

    if (shouldNotify && postAuthorId && postAuthorId !== user.uid) {
      await createNotification({
        recipientId: postAuthorId,
        actorId: user.uid,
        type: 'like',
        title: 'Bài viết được thích',
        message: `${user.displayName ?? 'Người dùng'} đã thích bài viết của bạn${postTitle ? `: "${postTitle}"` : ''}.`,
        postId: likeData.postId,
      });
    }

    return applyUserVoteToPost(mapPost(updatedSnap.id, updatedSnap.data()), nextValue);
  } catch (error) {
    logFirestoreError(error, `likePost(${likeData.postId})`);
    throw error;
  }
};

/**
 * Realtime theo dõi một bài đăng & comment của nó
 */
export const subscribeToPost = (
  postId: string,
  callback: (post: Post | null) => void
): (() => void) => {
  const postRef = doc(db, 'posts', postId);
  const commentsQuery = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('voteCount', 'desc')
  );

  const currentUser = auth.currentUser;
  let postData: Post | null = null;
  let commentsData: Comment[] = [];
  let userVote: number = 0;

  const notify = () => {
    if (!postData) {
      callback(null);
      return;
    }
    const orderedComments = orderComments(commentsData, postData.bestAnswerId);
    callback({
      ...postData,
      comments: orderedComments,
      userLiked: userVote === 1,
      userDisliked: userVote === -1,
    });
  };

  const unsubscribePost = onSnapshot(postRef, (snap) => {
    if (!snap.exists()) {
      postData = null;
      notify();
      return;
    }
    postData = mapPost(snap.id, snap.data());
    notify();
  }, (error) => {
    logFirestoreError(error, `subscribeToPost(${postId})`);
  });

  const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
    commentsData = snapshot.docs.map((docSnap) => mapComment(docSnap.id, docSnap.data()));
    notify();
  }, (error) => {
    logFirestoreError(error, `subscribeToPost(${postId})/comments`);
  });

  let unsubscribeVote: (() => void) | null = null;
  if (currentUser) {
    const voteDoc = doc(db, 'posts', postId, 'votes', currentUser.uid);
    unsubscribeVote = onSnapshot(voteDoc, (voteSnap) => {
      userVote = voteSnap.exists() ? ((voteSnap.data().value as number) ?? 0) : 0;
      notify();
    }, (error) => {
      logFirestoreError(error, `subscribeToPost(${postId})/vote`);
    });
  }

  return () => {
    unsubscribePost();
    unsubscribeComments();
    if (unsubscribeVote) unsubscribeVote();
  };
};

/**
 * Tạo bình luận realtime và tăng commentCount
 */
export const createCommentRealtime = async (
  commentData: CreateCommentRequest
): Promise<Comment | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const commentsCol = collection(db, 'posts', commentData.postId, 'comments');
    const commentRef = doc(commentsCol);
    const postRef = doc(db, 'posts', commentData.postId);
    let postAuthorId: string | null = null;
    let postTitle: string | null = null;

    await runTransaction(db, async (tx: Transaction) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) throw new Error('Post not found');
      const data = postSnap.data() ?? {};
      postAuthorId = data.authorId ?? null;
      postTitle = data.title ?? null;
      const currentCount = data.commentCount ?? 0;

      tx.set(commentRef, {
        authorId: user.uid,
        authorName: user.displayName ?? null,
        authorAvatarUrl: user.photoURL ?? null,
        content: commentData.content,
        imageUrl: commentData.imageUrl ?? null,
        voteCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        createdAt: serverTimestamp(),
      });

      tx.update(postRef, { commentCount: currentCount + 1 });
    });

    const snap = await getDoc(commentRef);
    if (!snap.exists()) return null;

    if (postAuthorId && postAuthorId !== user.uid) {
      await createNotification({
        recipientId: postAuthorId,
        actorId: user.uid,
        type: 'comment',
        title: 'Bình luận mới',
        message: `${user.displayName ?? 'Người dùng'} đã bình luận vào bài viết của bạn${postTitle ? `: "${postTitle}"` : ''}.`,
        postId: commentData.postId,
        commentId: commentRef.id,
      });
    }

    return mapComment(snap.id, snap.data());
  } catch (error) {
    logFirestoreError(error, `createCommentRealtime(${commentData.postId})`);
    throw error;
  }
};

/**
 * Giữ lại hàm createComment để tương thích ngược
 */
export const createComment = createCommentRealtime;

/**
 * Vote bình luận (+1, -1, 0)
 */
export const voteComment = async (
  postId: string,
  commentId: string,
  value: 1 | -1 | 0
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const voteDocRef = doc(db, 'posts', postId, 'comments', commentId, 'votes', user.uid);
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);

  try {
    await runTransaction(db, async (tx: Transaction) => {
      const voteSnap = await tx.get(voteDocRef);
      const prevValue = voteSnap.exists() ? ((voteSnap.data().value as number) ?? 0) : 0;
      const delta = value - prevValue;

      if (delta !== 0) {
        const commentSnap = await tx.get(commentRef);
        if (!commentSnap.exists()) throw new Error('Comment not found');
        const data = commentSnap.data() ?? {};
        const currentVoteCount = data.voteCount ?? 0;
        tx.update(commentRef, { voteCount: currentVoteCount + delta });
      }

      tx.set(voteDocRef, { value });
    });
  } catch (error) {
    logFirestoreError(error, `voteComment(${postId}, ${commentId})`);
    throw error;
  }
};

export const markBestAnswer = async (postId: string, commentId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) throw new Error('Post not found');
    const data = snap.data();
    if (data.authorId !== user.uid) throw new Error('Not post author');
    await updateDoc(postRef, { bestAnswerId: commentId });
  } catch (error) {
    logFirestoreError(error, `markBestAnswer(${postId}, ${commentId})`);
    throw error;
  }
};

