import { useEffect, useState } from 'react';
import { SyncEngine } from './services/syncEngine';
import { MultiStepForm } from './components/MultiStepForm';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { Database } from 'lucide-react';

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    SyncEngine.initialize();
  }, []);

  return (
    <div className="min-h-screen pb-10">
      <NetworkStatusBar />
      
      <header className="glass-header pt-14 pb-4 px-4 flex justify-between items-center mb-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 bg-white/90 p-1 rounded shadow-inner flex items-center justify-center">
            <img src="/vku-logo.png" alt="VKU Logo" className="h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">VKU CAMPUS AUDIT</h1>
            <p className="text-sky-100 text-xs">Field Survey</p>
          </div>
        </div>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Database size={18} />
          <span className="hidden sm:inline">Data Inspector</span>
        </button>
      </header>

      <main className="px-4 animate-slide-up max-w-2xl mx-auto">
        <MultiStepForm />
      </main>

      <AuditHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
}

export default App;
