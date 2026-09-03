import React, { useEffect, useState } from 'react';
import { SyncEngine } from '../services/syncEngine';
import { Wifi, WifiOff, UploadCloud, TestTube } from 'lucide-react';

export const NetworkStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState(SyncEngine.isOnline);
  const [pendingCount, setPendingCount] = useState(0);
  const [simulatedNetwork, setSimulatedNetwork] = useState<boolean | null>(null);

  useEffect(() => {
    const cb = (count: number, online: boolean) => {
      setPendingCount(count);
      setIsOnline(online);
    };
    SyncEngine.addListener(cb);
    return () => SyncEngine.removeListener(cb);
  }, []);

  const toggleSimulation = () => {
    const nextState = simulatedNetwork === null ? false : (simulatedNetwork === false ? true : null);
    setSimulatedNetwork(nextState);
    SyncEngine.setSimulatedNetwork(nextState);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${isOnline ? 'bg-sky-500/90 text-white backdrop-blur-md' : 'bg-amber-400/90 text-amber-950 backdrop-blur-md animate-pulse-fast'}`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
        {simulatedNetwork !== null && <span className="ml-2 text-xs bg-black/20 px-2 py-0.5 rounded-full">(Simulated)</span>}
      </div>
      
      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <button 
            onClick={() => SyncEngine.triggerSync()}
            disabled={!isOnline}
            className="flex items-center gap-2 bg-black/10 px-2 py-1 rounded hover:bg-black/20 disabled:opacity-50 transition-colors"
          >
            <UploadCloud size={16} />
            <span>{pendingCount} Pending</span>
          </button>
        )}
        <button
          onClick={toggleSimulation}
          className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded hover:bg-black/20 transition-colors"
          title="Toggle Network Simulation"
        >
          <TestTube size={16} />
          <span className="hidden sm:inline">Simulate</span>
        </button>
      </div>
    </div>
  );
};

