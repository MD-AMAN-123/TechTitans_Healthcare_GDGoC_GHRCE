import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Info, Activity, User, AlertCircle, CheckCircle2, Zap, Wind, Timer, Pause, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface MindfulMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindfulMovementModal: React.FC<MindfulMovementModalProps> = ({ isOpen, onClose }) => {
  // Audio State
  const [playingSessionId, setPlayingSessionId] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount or close
      if (sourceNodeRef.current) {
        try {
            sourceNodeRef.current.stop();
        } catch (e) { /* ignore if already stopped */ }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handlePlaySession = async (id: string, script: string) => {
    // If clicking the currently playing session, stop it
    if (playingSessionId === id) {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
      }
      setPlayingSessionId(null);
      return;
    }

    // Stop any existing session
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
    }

    setLoadingSessionId(id);

    try {
      const audioBuffer = await generateSpeech(script);
      
      if (audioBuffer) {
        // Initialize Audio Context if needed (browser requires user interaction first)
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
           audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        
        const ctx = audioContextRef.current;
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
           setPlayingSessionId(null);
        };

        source.start();
        sourceNodeRef.current = source;
        setPlayingSessionId(id);
      }
    } catch (error) {
      console.error("Failed to play session", error);
      alert("Could not generate audio for this session. Please try again.");
    } finally {
      setLoadingSessionId(null);
    }
  };

  const yogaScript = "Welcome to your full-body flow. Let's find some fluidity and space in the body today. Begin by finding a comfortable standing position at the top of your mat. Root down through your feet, spread your toes wide. Inhale, reach your arms up high, lengthening the spine. Exhale, fold forward gently, bending your knees if you need to. Let's move through a gentle flow to awaken your spine and hips, connecting every movement with your breath. Inhale halfway lift, flat back. Exhale fold. Step back into a plank, lower down slowly. Inhale, lift your chest for cobra. Exhale, press back to downward facing dog. Breathe here.";
  
  const stretchScript = "Welcome to your Neck and Shoulder relief session. This is designed for quick relief from tension. Sit comfortably with a tall spine, shoulders relaxed away from your ears. Slowly drop your right ear to your right shoulder. Feel the stretch along the left side of your neck. Breathe deeply here... Now, gently roll your chin down to your chest, feeling the release in the back of your neck. Inhale, lift your head back to center. Let's switch sides. Left ear to left shoulder. Breathe into the space you are creating. Good.";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans']">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)'
        }}
      />

      <div className="bg-slate-950/80 w-full max-w-5xl rounded-[40px] overflow-hidden border border-teal-500/30 shadow-[0_0_60px_rgba(20,184,166,0.15)] relative flex flex-col max-h-[95vh] backdrop-blur-xl z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 text-teal-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-sm border border-white/10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-10 h-full overflow-y-auto custom-scrollbar relative">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative z-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Mindful Movement Dashboard</h2>
              <div className="h-1 w-24 bg-teal-500 rounded-full"></div>
            </div>
            <div className="bg-teal-900/40 p-2 rounded-lg border border-teal-500/30">
               <Activity className="text-teal-400" size={24} />
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Column: Stats & Sessions */}
            <div className="md:col-span-4 flex flex-col gap-6">
               {/* Score Circle */}
               <div className="relative aspect-square max-w-[280px] mx-auto">
                 {/* Outer Rings */}
                 <div className="absolute inset-0 rounded-full border border-teal-500/10"></div>
                 <div className="absolute inset-4 rounded-full border border-teal-500/20 border-dashed animate-[spin_60s_linear_infinite]"></div>
                 
                 {/* Progress Circle SVG */}
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="50%" cy="50%" r="42%" stroke="#0f172a" strokeWidth="12" fill="transparent" />
                   <circle cx="50%" cy="50%" r="42%" stroke="#2dd4bf" strokeWidth="12" fill="transparent" strokeDasharray="264" strokeDashoffset="24" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                 </svg>

                 {/* Center Content */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-teal-200/70 text-xs font-medium uppercase tracking-wider mb-1">Daily movement score:</span>
                    <span className="text-5xl font-bold text-white tracking-tighter">92<span className="text-2xl text-teal-500/50">/100</span></span>
                    
                    <div className="mt-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                       <span className="text-xs font-bold text-white">7 DAY STREAK</span>
                    </div>
                 </div>
               </div>
               
               <p className="text-center text-teal-200/60 text-sm -mt-2">Time spent moving: 45 minutes</p>

               {/* Guided Sessions */}
               <div className="mt-4">
                  <h3 className="text-white font-semibold mb-3">Guided Movement Sessions</h3>
                  <div className="space-y-3">
                     
                     {/* Session 1: Yoga */}
                     <button 
                        onClick={() => handlePlaySession('yoga', yogaScript)}
                        disabled={loadingSessionId === 'yoga'}
                        className={`w-full bg-slate-900/60 border ${playingSessionId === 'yoga' ? 'border-teal-500 bg-teal-900/20' : 'border-slate-700'} p-4 rounded-2xl flex items-center justify-between hover:border-teal-500/50 transition-colors group text-left`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingSessionId === 'yoga' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white'}`}>
                              {loadingSessionId === 'yoga' ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : playingSessionId === 'yoga' ? (
                                <Pause size={16} fill="currentColor" />
                              ) : (
                                <Play size={16} fill="currentColor" />
                              )}
                           </div>
                           <div>
                              <h4 className="text-white text-sm font-bold">Yoga: Full-body flow</h4>
                              <p className="text-slate-400 text-xs">19:10 min</p>
                           </div>
                        </div>
                        <div className="text-teal-500/50 text-xs font-mono">I</div>
                     </button>

                     {/* Session 2: Stretching */}
                     <button 
                        onClick={() => handlePlaySession('stretch', stretchScript)}
                        disabled={loadingSessionId === 'stretch'}
                        className={`w-full bg-slate-900/60 border ${playingSessionId === 'stretch' ? 'border-teal-500 bg-teal-900/20' : 'border-slate-700'} p-4 rounded-2xl flex items-center justify-between hover:border-teal-500/50 transition-colors group text-left`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playingSessionId === 'stretch' ? 'bg-teal-500 text-white' : 'bg-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white'}`}>
                              {loadingSessionId === 'stretch' ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : playingSessionId === 'stretch' ? (
                                <Pause size={16} fill="currentColor" />
                              ) : (
                                <Play size={16} fill="currentColor" />
                              )}
                           </div>
                           <div>
                              <h4 className="text-white text-sm font-bold">Stretching: Neck & shoulders</h4>
                              <p className="text-slate-400 text-xs">Breathing-linked movement</p>
                           </div>
                        </div>
                        <div className="text-teal-500/50 text-xs font-mono flex flex-col items-end">
                           <span>I</span>
                           <span className="text-[10px]">10 min</span>
                        </div>
                     </button>
                  </div>
               </div>
            </div>

            {/* Center Column: Body Visualization */}
            <div className="md:col-span-4 relative min-h-[400px] flex items-center justify-center">
               {/* 3D Body Placeholder / Representation */}
               <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src="https://media.istockphoto.com/id/1150397415/vector/human-body-wire-model-vector-illustration.jpg?s=612x612&w=0&k=20&c=L_7jUq-r8y_J7GgYJ-lQGg2sH-C8_XlB-2qK-w_8-g=" 
                    alt="Body Wireframe" 
                    className="h-[500px] object-contain opacity-80 mix-blend-screen grayscale contrast-125 brightness-150 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" 
                  />
                  
                  {/* Overlay Graphics */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                     <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf] animate-ping"></div>
                     <div className="absolute top-[20%] right-[30%] w-20 h-[1px] bg-teal-500/30 rotate-12 origin-left"></div>
                     <div className="absolute top-[20%] right-[30%] ml-20 mt-1 bg-black/60 backdrop-blur border border-teal-500/30 px-2 py-1 rounded text-[10px] text-teal-200">Shoulder Tension</div>
                  </div>
               </div>
            </div>

            {/* Right Column: Analysis & Awareness */}
            <div className="md:col-span-4 flex flex-col gap-6">
               
               {/* Body Awareness Visualization */}
               <div className="relative aspect-video bg-slate-900/50 rounded-2xl border border-teal-500/20 overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                     {/* Abstract Waveform */}
                     <div className="w-32 h-32 border border-teal-500/30 rounded-full flex items-center justify-center animate-[pulse_4s_infinite]">
                        <div className="w-24 h-24 border border-teal-400/40 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                           <div className="w-16 h-16 bg-teal-500/10 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-[morph_5s_ease-in-out_infinite]"></div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-right">
                     <span className="text-teal-200 text-xs font-medium">Body Awareness: High</span>
                  </div>
                  <div className="absolute top-3 right-3">
                     <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                  </div>
               </div>

               {/* AI Analysis Engine */}
               <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2">
                     <Zap size={16} className="text-teal-400" />
                     <h3 className="text-white font-bold text-sm">AI Movement Analysis Engine</h3>
                  </div>

                  {/* Analysis Item 1 */}
                  <div className="flex justify-between items-start gap-3">
                     <div className="bg-teal-500/10 p-1.5 rounded-lg text-teal-400 mt-0.5">
                        <Activity size={14} />
                     </div>
                     <div className="flex-1">
                        <p className="text-slate-300 text-xs font-medium mb-0.5">Stiffness patterns:</p>
                        <p className="text-slate-400 text-[11px]">Detected in shoulders. Overuse areas.</p>
                     </div>
                     <div className="w-5 h-5 rounded-full border border-teal-500/50 flex items-center justify-center text-[10px] text-teal-400 font-bold">B</div>
                  </div>

                  {/* Analysis Item 2 */}
                  <div className="flex justify-between items-start gap-3">
                     <div className="bg-teal-500/10 p-1.5 rounded-lg text-teal-400 mt-0.5">
                        <AlertCircle size={14} />
                     </div>
                     <div className="flex-1">
                        <p className="text-slate-300 text-xs font-medium mb-0.5">Overuse areas</p>
                        <p className="text-slate-400 text-[11px]">Daily cat-cow (Shoulder tilt). Lower back (Fair)</p>
                     </div>
                     <div className="w-5 h-5 rounded-full border border-teal-500/50 flex items-center justify-center text-[10px] text-teal-400 font-bold">♥</div>
                  </div>

                  {/* Analysis Item 3 */}
                  <div className="flex justify-between items-start gap-3">
                     <div className="bg-teal-500/10 p-1.5 rounded-lg text-teal-400 mt-0.5">
                        <User size={14} />
                     </div>
                     <div className="flex-1">
                        <p className="text-slate-300 text-xs font-medium mb-0.5">Posture correction</p>
                        <p className="text-slate-400 text-[11px]">Forward head posture detected. +2° improve.</p>
                     </div>
                     <div className="w-5 h-5 rounded-full border border-teal-500/50 flex items-center justify-center text-[10px] text-teal-400 font-bold">A-</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(15, 23, 42, 0.5); 
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(45, 212, 191, 0.3); 
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(45, 212, 191, 0.5); 
            }
            @keyframes morph {
               0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
               33% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
               66% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            }
      `}</style>
    </div>
  );
};