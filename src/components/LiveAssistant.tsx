import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Activity, Volume2, Radio } from 'lucide-react';
import { connectLive, disconnectLive } from '../services/geminiService';
import { HealthMetric, Appointment, Doctor } from '../types';

interface LiveAssistantProps {
  userName: string;
  metrics: HealthMetric[];
  appointments: Appointment[];
  onUpdateProfile: (data: { name?: string; email?: string; mobile?: string }) => void;
  onBookAppointment: (data: { doctorName: string; specialty: string; date: string; time: string; type: 'video' | 'in-person' }) => void;
  isAdmin?: boolean;
  doctors?: Doctor[];
  onAddDoctor?: (data: { name: string; specialty: string; price?: number; rating?: number }) => void;
  onUpdateAppointment?: (data: { appointmentId: string; date?: string; time?: string; status?: string }) => void;
  onDeleteAppointment?: (data: { appointmentId: string }) => void;
}

export const LiveAssistant: React.FC<LiveAssistantProps> = ({ 
  userName, 
  metrics, 
  appointments, 
  onUpdateProfile, 
  onBookAppointment, 
  isAdmin = false,
  doctors = [],
  onAddDoctor,
  onUpdateAppointment,
  onDeleteAppointment
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'permission_denied'>('idle');
  const [volume, setVolume] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      disconnectLive();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleToggleConnection = async () => {
    if (status === 'connected' || status === 'connecting') {
      disconnectLive();
      setStatus('idle');
      setVolume(0);
    } else {
      // Ensure API Key for Live API
      const win = window as any;
      if (win.aistudio) {
        try {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await win.aistudio.openSelectKey();
                const nowHasKey = await win.aistudio.hasSelectedApiKey();
                if (!nowHasKey) {
                    alert("An API Key is required to use the Live Assistant. Please select a project.");
                    return;
                }
            }
        } catch (e) {
            console.error("API Key selection error", e);
            // Fallthrough to attempt connection anyway, possibly using env key
        }
      }

      setStatus('connecting');
      
      // Pass the current app context to the live service
      connectLive(
        { userName, metrics, appointments, isAdmin, doctors },
        {
          onStatusChange: (newStatus) => {
            // Map service status to component status
            if (newStatus === 'disconnected') setStatus('idle');
            else setStatus(newStatus as any);
          },
          onVolume: (vol) => {
            // Smooth volume for visualization
            setVolume(prev => prev * 0.8 + vol * 0.2);
          },
          onUpdateProfile: onUpdateProfile,
          onBookAppointment: onBookAppointment,
          onAddDoctor: onAddDoctor,
          onUpdateAppointment: onUpdateAppointment,
          onDeleteAppointment: onDeleteAppointment
        }
      );
    }
  };

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (status !== 'connected') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Base radius plus volume-based expansion
      // Amplify volume for visual effect
      const radius = 60 + (volume * 500); 

      // Draw Pulsing Orb
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(20, 184, 166, 0.8)'); // Teal-500
      gradient.addColorStop(0.6, 'rgba(45, 212, 191, 0.4)'); // Teal-400
      gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#0f766e'; // Teal-700
      ctx.fill();

      // Draw Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    if (status === 'connected') {
       draw();
    } else {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
       ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

  }, [status, volume]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative font-['Plus_Jakarta_Sans'] animate-fade-in">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950"></div>
      
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/10 p-2 rounded-xl border border-teal-500/20">
            <Radio className={`text-teal-400 ${status === 'connected' ? 'animate-pulse' : ''}`} size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Live Assistant</h2>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-yellow-500' : 'bg-slate-600'}`}></span>
               {status === 'connected' ? 'Live Connection' : status === 'connecting' ? 'Establishing secure line...' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 relative flex items-center justify-center">
         <canvas ref={canvasRef} width={400} height={400} className="absolute z-0" />
         
         {/* Status Text */}
         {status === 'connected' && (
           <div className="absolute bottom-10 text-center animate-fade-in px-8">
              <p className="text-teal-200 text-sm font-medium tracking-wide mb-1">Listening...</p>
              <p className="text-slate-500 text-xs">
                {isAdmin 
                  ? "Admin Mode: Add doctors, delete patients, or manage appointments." 
                  : "Ask to update profile, book appointments, or medical questions."
                }
              </p>
           </div>
         )}
         
         {(status === 'error' || status === 'permission_denied') && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
              <div className="text-center p-6 bg-slate-900 rounded-2xl border border-red-500/30">
                 <X className="text-red-500 mx-auto mb-3" size={32} />
                 <p className="text-white font-bold">
                   {status === 'permission_denied' ? "Microphone Access Denied" : "Connection Failed"}
                 </p>
                 <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">
                   {status === 'permission_denied' 
                     ? "Please allow microphone access in your browser settings to use the voice assistant." 
                     : "Please check your network connection and try again."}
                 </p>
                 <button 
                   onClick={() => setStatus('idle')}
                   className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
                 >
                   Dismiss
                 </button>
              </div>
           </div>
         )}
      </div>

      {/* Controls */}
      <div className="relative z-10 p-8 pb-12 flex justify-center">
         <button 
            onClick={handleToggleConnection}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
              ${status === 'connected' 
                 ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 ring-4 ring-red-500/20' 
                 : status === 'connecting'
                 ? 'bg-slate-700 cursor-wait ring-4 ring-slate-700/20'
                 : 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/30 ring-4 ring-teal-500/20 hover:scale-105'
              }
            `}
         >
            {status === 'connected' ? (
               <X size={32} className="text-white" />
            ) : status === 'connecting' ? (
               <Activity size={32} className="text-white animate-spin" />
            ) : (
               <Mic size={32} className="text-white" />
            )}
         </button>
      </div>

      <div className="absolute bottom-4 w-full text-center text-[10px] text-slate-600 font-medium">
         Powered by Gemini 2.5 Native Audio
      </div>
    </div>
  );
};