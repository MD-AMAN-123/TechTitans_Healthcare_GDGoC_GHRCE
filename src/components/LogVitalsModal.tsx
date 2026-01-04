import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Moon, Droplets, Activity, Camera, RefreshCw, Smartphone } from 'lucide-react';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vitals: { heartRate: string; sleep: string; water: string }) => void;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [heartRate, setHeartRate] = useState('');
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('');
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [liveBPM, setLiveBPM] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Cleanup stream on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsScanning(false);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startHeartRateScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setLiveBPM(60);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, using simulation only.");
    }

    // Simulate scanning process
    const interval = setInterval(() => {
      setLiveBPM(prev => {
        // Fluctuate between 65 and 85
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.min(Math.max(prev + change, 65), 85);
      });
      setScanProgress(prev => prev + 2);
    }, 100);

    // Finish scan
    setTimeout(() => {
      clearInterval(interval);
      stopCamera();
      setIsScanning(false);
      // Set a final "detected" value
      const finalBPM = Math.floor(Math.random() * (82 - 70 + 1) + 70); // Random between 70-82
      setHeartRate(finalBPM.toString());
    }, 5000);
  };

  const handleSmartSync = () => {
    setIsSyncing(true);
    // Simulate fetching from wearable API
    setTimeout(() => {
      setSleep('7h 45m'); // Simulated detected sleep
      setWater('1.8');    // Simulated smart bottle data
      if (!heartRate) setHeartRate('72'); // Fallback if not scanned
      setIsSyncing(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ heartRate, sleep, water });
    // Reset form
    setHeartRate('');
    setSleep('');
    setWater('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Log Daily Vitals</h2>
            <p className="text-slate-500 text-sm mt-1">Record your health metrics</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner">
                 {cameraStream ? (
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     muted 
                     playsInline 
                     className="w-full h-full object-cover opacity-50"
                   />
                 ) : (
                   <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                     <Heart size={64} className="text-rose-200 animate-pulse" />
                   </div>
                 )}
                 
                 {/* Scanning Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-slate-800 animate-pulse">{liveBPM}</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-t-4 border-rose-500 rounded-full animate-spin"></div>
                 </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Detecting Heart Rate...</h3>
                <p className="text-slate-500 text-sm">Hold still while we measure your pulse</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full transition-all duration-100 ease-linear" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Smart Sync Button */}
              <button
                type="button"
                onClick={handleSmartSync}
                disabled={isSyncing}
                className="w-full py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-70"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Syncing with wearable...
                  </>
                ) : (
                  <>
                    <Smartphone size={18} />
                    Sync from Device
                  </>
                )}
              </button>

              <div className="space-y-5">
                {/* Heart Rate Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Heart Rate</label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <Heart className="absolute left-3 top-3.5 text-rose-500 group-focus-within:scale-110 transition-transform" size={20} />
                      <input 
                        type="number" 
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-700"
                        placeholder="--"
                        required
                      />
                      <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">bpm</span>
                    </div>
                    <button 
                      type="button"
                      onClick={startHeartRateScan}
                      className="bg-rose-100 text-rose-600 p-3 rounded-xl hover:bg-rose-200 transition-colors tooltip"
                      title="Measure with Camera"
                    >
                      <Activity size={24} />
                    </button>
                  </div>
                </div>

                {/* Sleep Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Sleep Duration</label>
                  <div className="relative group">
                    <Moon className="absolute left-3 top-3.5 text-indigo-500 group-focus-within:scale-110 transition-transform" size={20} />
                    <input 
                      type="text" 
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-700"
                      placeholder="-- h -- m"
                      required
                    />
                  </div>
                </div>

                {/* Water Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Water Intake</label>
                  <div className="relative group">
                    <Droplets className="absolute left-3 top-3.5 text-cyan-500 group-focus-within:scale-110 transition-transform" size={20} />
                    <input 
                      type="number" 
                      step="0.1"
                      value={water}
                      onChange={(e) => setWater(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all placeholder:text-slate-400 font-semibold text-slate-700"
                      placeholder="--"
                      required
                    />
                    <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">L</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Save Vitals
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};