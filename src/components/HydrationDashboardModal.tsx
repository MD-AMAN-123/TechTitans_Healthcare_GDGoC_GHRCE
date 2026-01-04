import React from 'react';
import { X, Droplets, Activity, Zap, Info, Clock, Sun, Wind, Coffee, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HydrationDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const data = [
  { time: '6am', amount: 0 },
  { time: '9am', amount: 250 },
  { time: '12pm', amount: 800 },
  { time: '3pm', amount: 1200 },
  { time: '6pm', amount: 1600 },
  { time: '9pm', amount: 1850 },
];

export const HydrationDashboardModal: React.FC<HydrationDashboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 w-full max-w-5xl rounded-3xl overflow-hidden border border-cyan-900/50 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative flex flex-col md:flex-row max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-cyan-500 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Left Panel - Main Stats */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-cyan-900/30 bg-gradient-to-br from-slate-900 to-slate-950">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Hydration Dashboard</h2>
            <p className="text-cyan-200/60 font-mono text-sm mt-1">Daily water intake: <span className="text-cyan-400 font-bold">1850 ml</span> / 1.85 liters</p>
          </div>

          <div className="flex gap-6 items-start">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex-shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="365" strokeDashoffset="91" className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-3xl font-bold text-white">75%</span>
               </div>
            </div>
            
            {/* Score & Context */}
            <div className="flex-1">
               <div className="bg-slate-900/50 border border-cyan-900/30 rounded-2xl p-4 mb-3">
                  <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Hydration Score</div>
                  <div className="text-3xl font-bold text-white">88<span className="text-lg text-slate-500">/100</span></div>
               </div>
               <div className="flex gap-2">
                 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded">Missed hydration detected</div>
               </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 w-full bg-slate-900/50 border border-cyan-900/30 rounded-2xl p-4 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-2">
               <span className="text-xs text-slate-400 uppercase tracking-wider">Time-based intake tracking</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Analysis Engine */}
          <div className="bg-slate-900/50 border border-cyan-900/30 rounded-2xl p-5">
             <div className="flex items-center gap-2 mb-4 border-b border-cyan-900/30 pb-2">
                <Activity size={16} className="text-cyan-400" />
                <h3 className="text-white font-bold text-sm">AI Hydration Analysis Engine</h3>
             </div>
             <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between">
                   <span className="text-slate-400">Body weight:</span>
                   <span className="text-slate-200">75kg</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400">Activity level:</span>
                   <span className="text-slate-200">Moderate</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400">Climate:</span>
                   <span className="text-slate-200">28°C</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-400">Caffeine:</span>
                   <span className="text-slate-200">1 espresso</span>
                </div>
                <div className="col-span-2 border-t border-cyan-900/30 pt-2 flex justify-between items-center mt-1">
                   <span className="text-cyan-200/70">Personalized daily water target:</span>
                   <span className="text-cyan-400 font-bold">3.2 liters</span>
                </div>
             </div>
          </div>

          {/* Education Modules */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
             {['Why hydration matters', 'Effects of dehydration', 'Myths vs Facts', 'Science of Electrolytes'].map((text, i) => (
               <button key={i} className="bg-slate-800/50 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 text-slate-300 text-xs p-2 rounded-lg transition-all text-center h-full flex items-center justify-center">
                  {text}
               </button>
             ))}
          </div>
        </div>

        {/* Right Panel - Visual & Controls */}
        <div className="w-full md:w-2/5 p-6 md:p-8 bg-slate-950 relative overflow-hidden flex flex-col gap-6">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Smart Tracking Section */}
          <div className="relative z-10">
             <h3 className="text-white font-bold mb-4">Smart Hydration Tracking</h3>
             <div className="grid grid-cols-3 gap-2 mb-6">
                <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20">
                     <div className="w-3 h-5 border-2 border-slate-500 group-hover:border-cyan-400 rounded-sm"></div>
                   </div>
                   <span className="text-[10px] text-slate-400 text-center leading-tight">Wearable sync</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20">
                     <div className="w-2 h-5 bg-slate-500 group-hover:bg-cyan-400 rounded-sm"></div>
                   </div>
                   <span className="text-[10px] text-slate-400 text-center leading-tight">Smart Bottle</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all group">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20">
                      <Zap size={14} className="text-slate-500 group-hover:text-cyan-400" />
                   </div>
                   <span className="text-[10px] text-slate-400 text-center leading-tight">Manual Log</span>
                </button>
             </div>
          </div>

          {/* Visual Bottle */}
          <div className="flex-1 flex items-center justify-center relative my-4">
             {/* Simple Bottle Visualization using CSS */}
             <div className="w-24 h-64 border-4 border-cyan-500/30 rounded-[30px] rounded-t-lg relative overflow-hidden backdrop-blur-sm bg-slate-900/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                {/* Cap */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-4 bg-cyan-900/80 rounded-t-md"></div>
                {/* Water Level */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-cyan-400 opacity-80 transition-all duration-1000 ease-in-out" style={{ height: '75%' }}>
                   <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 animate-pulse"></div>
                   {/* Bubbles */}
                   <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
                   <div className="absolute bottom-12 right-6 w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
                {/* Text overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-3xl font-bold text-white drop-shadow-md">75%</span>
                </div>
             </div>
          </div>

          {/* Smart Reminders */}
          <div className="space-y-4 relative z-10">
             <h3 className="text-white font-bold text-sm">Smart Hydration Reminders</h3>
             <div className="flex justify-between gap-2">
                <div className="flex-1 bg-slate-900/80 p-3 rounded-xl border border-cyan-900/30 flex flex-col items-center gap-2 text-center">
                   <Activity className="text-cyan-400" size={20} />
                   <span className="text-[10px] text-slate-400">Post-exercise</span>
                </div>
                <div className="flex-1 bg-slate-900/80 p-3 rounded-xl border border-cyan-900/30 flex flex-col items-center gap-2 text-center">
                   <Sun className="text-orange-400" size={20} />
                   <span className="text-[10px] text-slate-400">High Temp</span>
                </div>
                <div className="flex-1 bg-slate-900/80 p-3 rounded-xl border border-cyan-900/30 flex flex-col items-center gap-2 text-center">
                   <Clock className="text-purple-400" size={20} />
                   <span className="text-[10px] text-slate-400">Every 2 hrs</span>
                </div>
             </div>
             
             {/* Reminder Alert */}
             <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                   <div className="bg-cyan-500/20 p-2 rounded-full text-cyan-400">
                      <Droplets size={16} />
                   </div>
                   <div>
                      <h4 className="text-white text-sm font-bold">Time to hydrate!</h4>
                      <p className="text-slate-400 text-xs">Have a glass of water.</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg transition-colors">Snooze</button>
                   <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2 rounded-lg transition-colors font-bold">Dismiss</button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
