import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { Field, FIELD_COLLECTION } from '../types/field';
import { db } from './firebase';

export type CreateFieldInput = Omit<Field, 'id' | 'lastScanResult'> & {
  lastScanResult?: Field['lastScanResult'];
};

const fieldsCollection = collection(db, FIELD_COLLECTION);

const mapField = (fieldId: string, data: Field): Field => ({
  id: fieldId,
  userId: data.userId,
  name: data.name,
  area: data.area,
  cropType: data.cropType,
  sowingDate: data.sowingDate,
  location: data.location,
  status: data.status,
  lastScanResult: data.lastScanResult,
});

export const addField = async (field: CreateFieldInput): Promise<Field> => {
  const docRef = await addDoc(fieldsCollection, field);
  const snapshot = await getDoc(docRef);
  const data = snapshot.data() as Field;
  return mapField(snapshot.id, data);
};

export const getMyFields = async (userId: string): Promise<Field[]> => {
  const fieldsQuery = query(fieldsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(fieldsQuery);
  return snapshot.docs.map((docSnap) => mapField(docSnap.id, docSnap.data() as Field));
};

export const updateFieldScan = async (
  fieldId: string,
  scanResult: NonNullable<Field['lastScanResult']>
): Promise<void> => {
  const fieldRef = doc(db, FIELD_COLLECTION, fieldId);
  await updateDoc(fieldRef, {
    lastScanResult: {
      ...scanResult,
      scanDate: scanResult.scanDate ?? Timestamp.now(),
    },
  });
};

