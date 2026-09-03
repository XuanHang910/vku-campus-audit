import React, { useEffect, useState } from 'react';
import { getPendingSyncs, getSyncedItems } from '../db/indexedDb';
import type { AuditRecord } from '../db/indexedDb';
import { SyncEngine } from '../services/syncEngine';
import { X, Clock, MapPin, UploadCloud, Download, CheckCircle, Star, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'SYNCED'>('PENDING');
  const [pendingItems, setPendingItems] = useState<AuditRecord[]>([]);
  const [syncedItems, setSyncedItems] = useState<AuditRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    const [pending, synced] = await Promise.all([
      getPendingSyncs(),
      getSyncedItems()
    ]);
    setPendingItems(pending);
    setSyncedItems(synced);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleForceSync = async () => {
    if (!SyncEngine.isOnline) {
      alert("Cannot sync while offline. Use the simulator toggle if testing.");
      return;
    }
    setIsSyncing(true);
    await SyncEngine.triggerSync();
    await loadData();
    setIsSyncing(false);
  };

  const handleExport = (format: 'json' | 'csv') => {
    const allData = [...pendingItems, ...syncedItems];
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vku_audit_export_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['ID', 'Timestamp', 'Building', 'Floor', 'Room', 'Category', 'Equipment', 'Rating', 'Severity', 'Status'];
      const rows = allData.map(item => [
        item.id,
        item.timestamp,
        item.location.building,
        item.location.floor,
        item.location.room,
        item.category,
        item.equipmentId,
        item.rating,
        item.defectSeverity,
        item.status
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vku_audit_export_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  const displayItems = activeTab === 'PENDING' ? pendingItems : syncedItems;

  return (
    <div className="fixed inset-0 z-50 bg-sky-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-scale-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-sky-100">
        
        {/* Header */}
        <div className="bg-sky-50 px-6 py-4 border-b border-sky-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sky-900">Data Inspector</h2>
            <p className="text-sm text-sky-600">Local IndexedDB Storage</p>
          </div>
          <button onClick={onClose} className="text-sky-400 hover:text-sky-600 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow">
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pending ({pendingItems.length})
            </button>
            <button 
              onClick={() => setActiveTab('SYNCED')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'SYNCED' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Synced ({syncedItems.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={14} /> JSON
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={14} /> CSV
            </button>
            {activeTab === 'PENDING' && pendingItems.length > 0 && (
              <button 
                onClick={handleForceSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <UploadCloud size={14} /> {isSyncing ? 'Syncing...' : 'Force Sync'}
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {displayItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12 flex flex-col items-center">
              <Database size={48} className="mb-4 text-sky-200" />
              <p className="text-lg">No records found in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayItems.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                  
                  {/* Thumbnail */}
                  <div className="sm:w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    {item.photoBase64 ? (
                      <img src={`data:image/jpeg;base64,${item.photoBase64}`} className="w-full h-full object-cover" alt="Evidence" />
                    ) : (
                      <span className="text-xs text-gray-400">No Photo</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {item.category} <span className="text-sky-600 text-sm font-medium">#{item.equipmentId}</span>
                        </h3>
                        {item.status === 'PENDING_SYNC' ? (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={10} /> Pending
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> Synced
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-sky-500" />
                          <span className="font-medium">Room {item.location.room}</span> (Bldg {item.location.building}, Fl {item.location.floor})
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          <Star size={14} className="fill-yellow-500" />
                          <span className="font-bold text-gray-700 ml-0.5">{item.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                      <div className="text-xs text-gray-400 font-mono" title={item.id}>
                        ID: {item.id.split('-')[0]}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
