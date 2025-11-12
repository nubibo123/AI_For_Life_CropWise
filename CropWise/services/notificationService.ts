/**
 * Service thông báo sử dụng Firebase Firestore
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  Notification,
  NotificationCount,
  NotificationType,
} from '../types/notification';

const mapNotification = (id: string, data: any): Notification => ({
  id,
  recipientId: data.recipientId,
  actorId: data.actorId ?? undefined,
  type: data.type as NotificationType,
  title: data.title ?? '',
  message: data.message ?? '',
  user: data.user ?? undefined,
  post: data.post ?? undefined,
  postId: data.postId ?? undefined,
  commentId: data.commentId ?? undefined,
  createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  isRead: data.isRead ?? false,
  imageUrl: data.imageUrl ?? undefined,
});

const getCurrentUserId = (): string | null => {
  const currentUser = auth.currentUser;
  return currentUser ? currentUser.uid : null;
};

export const getNotifications = async (includeRead: boolean = true): Promise<Notification[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  let notificationsQuery = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (!includeRead) {
    notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(notificationsQuery);
  return snapshot.docs.map((docSnap) => mapNotification(docSnap.id, docSnap.data()));
};

export const getNotificationCount = async (): Promise<NotificationCount> => {
  const userId = getCurrentUserId();
  if (!userId) {
    return { total: 0, unread: 0 };
  }

  const totalSnapshot = await getDocs(
    query(collection(db, 'notifications'), where('recipientId', '==', userId))
  );

  const unreadSnapshot = await getDocs(
    query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    )
  );

  return {
    total: totalSnapshot.size,
    unread: unreadSnapshot.size,
  };
};

export const markAsRead = async (notificationId: string): Promise<Notification | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { isRead: true });
  const docSnap = await getDoc(notificationRef);
  return docSnap ? mapNotification(docSnap.id, docSnap.data()) : null;
};

export const markAllAsRead = async (): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const unreadSnapshot = await getDocs(
    query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    )
  );

  const promises = unreadSnapshot.docs.map((docSnap) =>
    updateDoc(doc(db, 'notifications', docSnap.id), { isRead: true })
  );

  await Promise.all(promises);
  return true;
};

export const deleteNotificationById = async (notificationId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  await deleteDoc(doc(db, 'notifications', notificationId));
  return true;
};

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  postId?: string;
  commentId?: string;
  imageUrl?: string;
}

export const createNotification = async (
  notification: CreateNotificationInput
): Promise<Notification | null> => {
  try {
    const ref = await addDoc(collection(db, 'notifications'), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    const docSnap = await getDoc(ref);
    return docSnap ? mapNotification(docSnap.id, docSnap.data()) : null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

