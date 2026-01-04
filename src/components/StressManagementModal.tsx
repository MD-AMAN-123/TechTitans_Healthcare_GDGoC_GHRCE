import React from 'react';
import { X, Activity, Wind, Zap, Brain, Battery, Frown, Moon, AlertCircle, BookOpen, Anchor, Smile } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface StressManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const stressData = [
  { time: '6am', value: 30 },
  { time: '9am', value: 45 },
  { time: '12pm', value: 55 },
  { time: '3pm', value: 85 }, // Spike
  { time: '6pm', value: 65 },
  { time: '9pm', value: 70 },
];

export const StressManagementModal: React.FC<StressManagementModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Plus_Jakarta_Sans']">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517898547802-0584229d3cce?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)'
        }}
      />

      <div className="bg-slate-900/60 w-full max-w-5xl rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.15)] relative flex flex-col max-h-[95vh] backdrop-blur-xl z-10 text-white">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 text-slate-300 hover:text-white transition-colors bg-white/5 p-2 rounded-full backdrop-blur-sm border border-white/10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-10 h-full overflow-y-auto custom-scrollbar relative">
          
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-medium text-slate-200">Stress Awareness Dashboard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Gauge & Chart */}
            <div className="md:col-span-7 space-y-8">
               
               <div className="flex flex-col md:flex-row gap-6">
                  {/* Gauge */}
                  <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0">
                     {/* Outer Glow Ring */}
                     <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
                     <div className="absolute inset-2 rounded-full border border-white/10"></div>
                     
                     {/* Progress SVG */}
                     <svg className="w-full h-full transform -rotate-90 p-4">
                       <circle cx="50%" cy="50%" r="45%" stroke="#334155" strokeWidth="4" fill="transparent" />
                       <circle cx="50%" cy="50%" r="45%" stroke="#a5f3fc" strokeWidth="4" fill="transparent" strokeDasharray="283" strokeDashoffset="90" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(165,243,252,0.8)]" />
                     </svg>

                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-300 font-medium mb-1">Daily Stress Level</span>
                        <span className="text-4xl font-bold text-white tracking-tight">68<span className="text-xl text-slate-400">/100</span></span>
                        <Frown size={24} className="text-slate-400 mt-2" />
                     </div>
                  </div>

                  {/* Chart */}
                  <div className="flex-1 flex flex-col justify-center">
                     <div className="mb-2">
                        <h3 className="text-lg font-bold text-white">Daily Stress Level:</h3>
                        <p className="text-xs text-slate-400">Stress trend over time</p>
                     </div>
                     <div className="h-40 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={stressData}>
                              <defs>
                                 <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <Tooltip 
                                 contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                 itemStyle={{ color: '#fff' }}
                              />
                              <XAxis dataKey="time" hide />
                              <Area 
                                 type="monotone" 
                                 dataKey="value" 
                                 stroke="#f43f5e" 
                                 strokeWidth={2} 
                                 fill="url(#stressGradient)" 
                              />
                           </AreaChart>
                        </ResponsiveContainer>
                        
                        {/* Spike annotation */}
                        <div className="absolute top-[10%] left-[55%] flex flex-col items-center">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute"></div>
                           <div className="w-2 h-2 bg-red-500 rounded-full relative z-10"></div>
                        </div>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-500 px-2 mt-1">
                        <span>0</span>
                        <span>10am</span>
                        <span>1pm</span>
                        <span>4pm</span>
                        <span>7pm</span>
                        <span>10pm</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Stress Tracking Details */}
                  <div className="space-y-4">
                     <h3 className="text-base font-semibold text-slate-200 border-b border-white/10 pb-2">Stress Tracking</h3>
                     
                     <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-center">
                        <span className="text-xs font-bold text-red-200">Stress Spike Detected: Tuesday PM</span>
                     </div>

                     <div className="space-y-3 pl-2">
                        <div className="flex items-center gap-3">
                           <Frown size={16} className="text-slate-400" />
                           <span className="text-sm text-slate-300">Mood</span>
                           <div className="h-1 flex-1 bg-slate-700 rounded-full ml-2 overflow-hidden">
                              <div className="h-full w-1/4 bg-indigo-400"></div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Zap size={16} className="text-slate-400" />
                           <span className="text-sm text-slate-300">Energy level</span>
                           <span className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded ml-auto">Low</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Activity size={16} className="text-slate-400" />
                           <span className="text-sm text-slate-300">Workload perception</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <Moon size={16} className="text-slate-400" />
                           <div className="flex-1">
                              <div className="flex justify-between text-xs text-slate-300 mb-1">
                                 <span>Sleep quality</span>
                                 <span className="text-red-300">Poor</span>
                              </div>
                              <div className="h-1 bg-slate-700 rounded-full w-full">
                                 <div className="h-full w-1/3 bg-red-400"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="space-y-4">
                     <h3 className="text-base font-semibold text-slate-200 border-b border-white/10 pb-2">AI Stress Analysis Engine</h3>
                     
                     <div className="space-y-3">
                        <div>
                           <span className="text-xs text-slate-400 block mb-1">Burnout risk:</span>
                           <span className="text-sm text-white font-medium">Moderate</span>
                        </div>
                        <div>
                           <span className="text-xs text-slate-400 block mb-1">Emotional overload:</span>
                           <span className="text-sm text-white font-medium">Yes</span>
                        </div>
                        <div>
                           <span className="text-xs text-slate-400 block mb-1">Recovery gaps:</span>
                           <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium">Strained</span>
                              <AlertCircle size={12} className="text-red-400" />
                           </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 mt-2">
                           <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Personalized Coping</span>
                           <p className="text-xs text-white">Take short breaks every 90 minutes. Focus on deep breathing.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Tools */}
            <div className="md:col-span-5 bg-white/5 rounded-3xl p-6 border border-white/5">
               <h3 className="text-lg font-semibold text-white mb-6">Guided Stress Relief Tools</h3>
               
               <div className="space-y-4">
                  <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left">
                     <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                        <Wind size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Breathing exercises (4-7-8)</h4>
                        <p className="text-xs text-slate-400">Calm your nervous system</p>
                     </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Anchor size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Grounding activity</h4>
                        <p className="text-xs text-slate-400">5-4-3-2-1 Technique</p>
                     </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left">
                     <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <Brain size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Mindfulness prompt</h4>
                        <p className="text-xs text-slate-400">"Notice 5 things around you..."</p>
                     </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left">
                     <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <Smile size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Body relaxation cues</h4>
                        <p className="text-xs text-slate-400">Progressive muscle relaxation</p>
                     </div>
                  </button>
               </div>
            </div>
          </div>

          {/* Bottom Education Section */}
          <div className="mt-8 border-t border-white/10 pt-6">
             <h3 className="text-sm font-bold text-slate-300 mb-4 text-center">Stress Education & Resilience</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs py-3 px-4 rounded-xl transition-all">
                   What stress is
                </button>
                <button className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs py-3 px-4 rounded-xl transition-all">
                   Acute vs Chronic
                </button>
                <button className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs py-3 px-4 rounded-xl transition-all">
                   Healthy Coping
                </button>
                <button className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs py-3 px-4 rounded-xl transition-all">
                   Nervous System Science
                </button>
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
              background: rgba(165, 243, 252, 0.3); 
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(165, 243, 252, 0.5); 
            }
      `}</style>
    </div>
  );
};