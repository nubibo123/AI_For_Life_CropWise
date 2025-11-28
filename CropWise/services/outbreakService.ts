import {
    addDoc,
    collection,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { Field, FIELD_COLLECTION } from '../types/field';
import {
    OUTBREAK_COLLECTION,
    OutbreakAlert,
    OutbreakSeverity,
    OutbreakStatus,
} from '../types/outbreak';
import { auth, db } from './firebase';
import { createNotification } from './notificationService';

const outbreaksCollection = collection(db, OUTBREAK_COLLECTION);

export type CreateOutbreakInput = {
  title: string;
  description: string;
  severity: OutbreakSeverity;
  radiusMeters: number;
  center: {
    latitude: number;
    longitude: number;
  };
  fieldId?: string;
  creatorName?: string;
};

const mapOutbreak = (id: string, data: any): OutbreakAlert => ({
  id,
  creatorId: data.creatorId,
  creatorName: data.creatorName,
  fieldId: data.fieldId ?? null,
  title: data.title,
  description: data.description,
  severity: data.severity,
  radiusMeters: data.radiusMeters,
  center: data.center,
  createdAt: data.createdAt ?? Timestamp.now(),
  status: data.status ?? ('active' as OutbreakStatus),
});

const toRadians = (value: number): number => (value * Math.PI) / 180;

const getDistanceMeters = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number => {
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadius * c;
};

const notifyCommunities = async (alert: OutbreakAlert): Promise<void> => {
  const fieldsSnapshot = await getDocs(collection(db, FIELD_COLLECTION));
  const tasks: Promise<unknown>[] = [];

  fieldsSnapshot.forEach((docSnap) => {
    const field = docSnap.data() as Field;
    if (!field.location) return;
    if (field.userId === alert.creatorId) return;
    const distance = getDistanceMeters(field.location, alert.center);
    if (distance <= alert.radiusMeters) {
      tasks.push(
        createNotification({
          recipientId: field.userId,
          actorId: alert.creatorId,
          type: 'alert',
          title: `⚠️ Cảnh báo ổ dịch: ${alert.title}`,
          message: `${alert.creatorName ?? 'Nông dân CropWise'} cảnh báo ổ dịch trong phạm vi ${
            alert.radiusMeters / 1000
          }km. Ruộng của bạn nằm trong vùng nguy cơ lây lan.`,
        })
      );
    }
  });

  await Promise.all(tasks);
};

export const createOutbreakAlert = async (
  input: CreateOutbreakInput
): Promise<OutbreakAlert> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const payload = {
    ...input,
    creatorId: currentUser.uid,
    creatorName: input.creatorName ?? currentUser.displayName ?? 'Nông dân CropWise',
    status: 'active' as OutbreakStatus,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(outbreaksCollection, payload);
  const snap = await getDoc(docRef);
  const alert = mapOutbreak(snap.id, snap.data());
  await notifyCommunities(alert);
  return alert;
};

export const subscribeToOutbreakAlerts = (
  callback: (alerts: OutbreakAlert[]) => void
): (() => void) => {
  const outbreaksQuery = query(outbreaksCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(outbreaksQuery, (snapshot) => {
    const alerts = snapshot.docs.map((docSnap) => mapOutbreak(docSnap.id, docSnap.data()));
    callback(alerts);
  });
};

export const getOutbreakAlerts = async (): Promise<OutbreakAlert[]> => {
  const alertsQuery = query(outbreaksCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(alertsQuery);
  return snapshot.docs.map((docSnap) => mapOutbreak(docSnap.id, docSnap.data()));
};

export const OutbreakUtils = {
  getDistanceMeters,
};

