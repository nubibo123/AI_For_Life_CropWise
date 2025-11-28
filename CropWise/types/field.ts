import { Timestamp } from 'firebase/firestore';

export interface Field {
  id: string;
  userId: string;
  name: string;
  area: number;
  cropType: string;
  sowingDate: Timestamp;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'harvested';
  lastScanResult?: {
    scanDate: Timestamp;
    healthScore: number;
    issues: string[];
  };
}

export const FIELD_COLLECTION = 'fields';

