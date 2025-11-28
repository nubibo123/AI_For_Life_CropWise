import { Timestamp } from 'firebase/firestore';

export type OutbreakSeverity = 'low' | 'medium' | 'high';
export type OutbreakStatus = 'active' | 'resolved';

export interface OutbreakAlert {
  id: string;
  creatorId: string;
  creatorName?: string;
  fieldId?: string | null;
  title: string;
  description: string;
  severity: OutbreakSeverity;
  radiusMeters: number;
  center: {
    latitude: number;
    longitude: number;
  };
  createdAt: Timestamp;
  status: OutbreakStatus;
}

export const OUTBREAK_COLLECTION = 'outbreakAlerts';

