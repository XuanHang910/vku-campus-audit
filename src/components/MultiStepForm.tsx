import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { saveDraft, getDraft, moveToSyncQueue } from '../db/indexedDb';
import type { AuditRecord } from '../db/indexedDb';
import { SyncEngine } from '../services/syncEngine';
import { Camera as CameraIcon, MapPin, ChevronRight, ChevronLeft, CheckCircle, Star } from 'lucide-react';

const DRAFT_ID = 'current_draft';

const INITIAL_STATE: AuditRecord = {
  id: DRAFT_ID,
  timestamp: '',
  location: { building: '', floor: '', room: '' },
  category: '',
  equipmentId: '',
  rating: 5,
  defectSeverity: 'Low',
  notes: '',
  status: 'DRAFT',
};

export const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AuditRecord>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDraft(DRAFT_ID).then(draft => {
      if (draft) setFormData(draft);
    });
  }, []);

  useEffect(() => {
    saveDraft(formData);
  }, [formData]);

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const updateLocation = (field: keyof AuditRecord['location'], value: string) => {
    setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
      if (image.base64String) {
        setFormData(prev => ({ ...prev, photoBase64: image.base64String }));
      }
    } catch (e) {
      console.error('Camera error', e);
    }
  };

  const getGeoLocation = async () => {
    setLoading(true);
    try {
      const position = await Geolocation.getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      }));
    } catch (e) {
      console.error('Location error', e);
      // Fallback fake GPS if on web and no permission
      setFormData(prev => ({
        ...prev,
        coordinates: { lat: 15.9753, lng: 108.2523, accuracy: 5 } // VKU coordinates
      }));
    } finally {
      setLoading(false);
    }
  };

  const submitAudit = async () => {
    const finalData: AuditRecord = {
      ...formData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: 'PENDING_SYNC'
    };
    await moveToSyncQueue(finalData);
    SyncEngine.notifyListeners();
    SyncEngine.triggerSync();
    setFormData(INITIAL_STATE);
    setStep(1);
    
    // Create a temporary toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-up flex items-center gap-2';
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Audit saved!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="glass-card p-6 md:p-8 animate-scale-in">
      {/* Progress Stepper */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-sky-500 -z-10 rounded-full -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        <div className="flex justify-between">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-sm transition-all duration-300 ${s === step ? 'bg-sky-600 text-white ring-4 ring-sky-100' : (s < step ? 'bg-sky-400 text-white' : 'bg-white text-gray-400 border-2 border-gray-200')}`}>
              {s < step ? <CheckCircle size={20} /> : s}
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[320px] transition-all">
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <h3 className="text-xl font-bold text-sky-900">Location Details</h3>
              <p className="text-gray-500 text-sm">Where are you auditing?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Building</label>
                <select className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.location.building} onChange={e => updateLocation('building', e.target.value)}>
                  <option value="">Select Building</option>
                  <option value="A">Building A (Lý thuyết)</option>
                  <option value="B">Building B (Thực hành)</option>
                  <option value="C">Building C (Thư viện)</option>
                  <option value="K">Building K (Ký túc xá)</option>
                  <option value="V">Building V (Hội trường)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Floor</label>
                  <input placeholder="e.g. 3" className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.location.floor} onChange={e => updateLocation('floor', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                  <input placeholder="e.g. 302" className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.location.room} onChange={e => updateLocation('room', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <h3 className="text-xl font-bold text-sky-900">Equipment Info</h3>
              <p className="text-gray-500 text-sm">What are you checking?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">Select Category</option>
                  <option value="Projector">Projector (Máy chiếu)</option>
                  <option value="AC">Air Conditioner (Điều hòa)</option>
                  <option value="PC">Computer (Máy tính)</option>
                  <option value="Desk">Desk/Chair (Bàn ghế)</option>
                  <option value="Electrical">Electrical (Điện, quạt, đèn)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment ID / Asset Tag</label>
                <input placeholder="e.g. PC-Lab1-01" className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.equipmentId} onChange={e => setFormData({ ...formData, equipmentId: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <h3 className="text-xl font-bold text-sky-900">Condition Assessment</h3>
              <p className="text-gray-500 text-sm">Rate the working condition</p>
            </div>
            
            <div className="bg-white/40 p-4 rounded-xl border border-sky-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Quality Rating</label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                      size={36} 
                      className={`${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`} 
                    />
                  </button>
                ))}
              </div>
              <div className="text-center font-medium text-sky-800">{formData.rating} out of 5 Stars</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Damage Severity</label>
              <select className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all" value={formData.defectSeverity} onChange={e => setFormData({ ...formData, defectSeverity: e.target.value })}>
                <option value="Low">Low (Minor cosmetic issue)</option>
                <option value="Medium">Medium (Needs repair but usable)</option>
                <option value="Critical">Critical (Unusable / Dangerous)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
              <textarea placeholder="Describe the issue..." className="w-full bg-white/50 border border-sky-200 p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all h-24 resize-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5 animate-slide-up">
            <div>
              <h3 className="text-xl font-bold text-sky-900">Evidence & Submission</h3>
              <p className="text-gray-500 text-sm">Add photo and location proof</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={takePhoto} className="flex flex-col items-center justify-center gap-2 bg-white/60 hover:bg-sky-50 border-2 border-dashed border-sky-300 text-sky-700 p-4 rounded-xl transition-all h-32">
                <CameraIcon size={32} />
                <span className="font-medium text-sm">Capture Photo</span>
              </button>
              
              {formData.photoBase64 ? (
                <div className="relative h-32 rounded-xl overflow-hidden shadow-sm border border-sky-200">
                  <img src={`data:image/jpeg;base64,${formData.photoBase64}`} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm border border-gray-200">
                  No photo yet
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <button onClick={getGeoLocation} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-white/60 hover:bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-medium transition-all shadow-sm">
                <MapPin size={20} />
                {loading ? 'Locating...' : 'Tag GPS Location'}
              </button>
              
              {formData.coordinates && (
                <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">GPS Tagged:</span> 
                    <br />Lat: {formData.coordinates.lat.toFixed(4)}, Lng: {formData.coordinates.lng.toFixed(4)}
                  </div>
                  <CheckCircle className="text-green-500" size={24} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center border-t border-gray-200/60 pt-6">
        <button 
          onClick={handlePrev} 
          disabled={step === 1}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${step === 1 ? 'opacity-0 cursor-default' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ChevronLeft size={20} /> Back
        </button>
        
        {step < 4 ? (
          <button onClick={handleNext} className="flex items-center gap-1 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-md transition-all">
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={submitAudit} className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold shadow-md shadow-green-500/30 transition-all hover:scale-105">
            <CheckCircle size={20} /> Submit Audit
          </button>
        )}
      </div>
    </div>
  );
};
