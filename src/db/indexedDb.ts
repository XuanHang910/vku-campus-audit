import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface AuditRecord {
  id: string;
  timestamp: string;
  location: {
    building: string;
    floor: string;
    room: string;
  };
  category: string;
  equipmentId: string;
  rating: number;
  defectSeverity: string;
  notes: string;
  photoBase64?: string;
  coordinates?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  status: 'DRAFT' | 'PENDING_SYNC' | 'SYNCED';
}

interface AuditDB extends DBSchema {
  drafts: {
    key: string;
    value: AuditRecord;
  };
  sync_queue: {
    key: string;
    value: AuditRecord;
  };
  synced_items: {
    key: string;
    value: AuditRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<AuditDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AuditDB>('vku-audit-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('drafts', { keyPath: 'id' });
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('synced_items', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveDraft = async (draft: AuditRecord) => {
  const db = await initDB();
  await db.put('drafts', draft);
};

export const getDraft = async (id: string) => {
  const db = await initDB();
  return db.get('drafts', id);
};

export const deleteDraft = async (id: string) => {
  const db = await initDB();
  await db.delete('drafts', id);
};

export const moveToSyncQueue = async (draft: AuditRecord) => {
  const db = await initDB();
  const tx = db.transaction(['drafts', 'sync_queue'], 'readwrite');
  
  draft.status = 'PENDING_SYNC';
  await tx.objectStore('sync_queue').put(draft);
  await tx.objectStore('drafts').delete(draft.id);
  
  await tx.done;
};

export const getPendingSyncs = async () => {
  const db = await initDB();
  return db.getAll('sync_queue');
};

export const getSyncedItems = async () => {
  const db = await initDB();
  return db.getAll('synced_items');
};

export const moveToSynced = async (item: AuditRecord) => {
  const db = await initDB();
  const tx = db.transaction(['sync_queue', 'synced_items'], 'readwrite');
  
  item.status = 'SYNCED';
  await tx.objectStore('synced_items').put(item);
  await tx.objectStore('sync_queue').delete(item.id);
  
  await tx.done;
};

