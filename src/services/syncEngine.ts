import { Network } from '@capacitor/network';
import { getPendingSyncs, moveToSynced } from '../db/indexedDb';
import type { AuditRecord } from '../db/indexedDb';

type SyncCallback = (pendingCount: number, isOnline: boolean) => void;

export class SyncEngine {
  private static isSyncing = false;
  private static listeners: SyncCallback[] = [];
  
  // Real network state
  private static realIsOnline = navigator.onLine;
  // Simulated network state
  private static simulatedIsOnline: boolean | null = null;

  public static get isOnline(): boolean {
    if (this.simulatedIsOnline !== null) return this.simulatedIsOnline;
    return this.realIsOnline;
  }

  public static setSimulatedNetwork(isOnline: boolean | null) {
    this.simulatedIsOnline = isOnline;
    this.notifyListeners();
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  static async initialize() {
    this.realIsOnline = (await Network.getStatus()).connected;

    Network.addListener('networkStatusChange', status => {
      this.realIsOnline = status.connected;
      this.notifyListeners();
      if (this.isOnline) {
        this.triggerSync();
      }
    });

    // Fallback for pure web
    window.addEventListener('online', () => {
      this.realIsOnline = true;
      this.notifyListeners();
      this.triggerSync();
    });
    window.addEventListener('offline', () => {
      this.realIsOnline = false;
      this.notifyListeners();
    });
    
    this.notifyListeners();
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  static addListener(cb: SyncCallback) {
    this.listeners.push(cb);
    this.notifyListeners();
  }

  static removeListener(cb: SyncCallback) {
    this.listeners = this.listeners.filter(l => l !== cb);
  }

  static async notifyListeners() {
    const pendingCount = (await getPendingSyncs()).length;
    this.listeners.forEach(cb => cb(pendingCount, this.isOnline));
  }

  static async triggerSync() {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    try {
      const pendingItems = await getPendingSyncs();
      if (pendingItems.length === 0) return;

      for (const item of pendingItems) {
        if (!this.isOnline) break;
        
        try {
          const success = await this.pushToServer(item);
          if (success) {
            await moveToSynced(item);
            console.log(`Synced audit ${item.id}`);
            await this.notifyListeners();
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}`, error);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private static async pushToServer(item: AuditRecord): Promise<boolean> {
    try {
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

