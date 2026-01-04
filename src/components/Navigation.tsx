import React from 'react';
import { LayoutGrid, Calendar, User, Shield, Mic, MessageSquare } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  activeTab: AppView;
  onTabChange: (tab: AppView) => void;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, isAdmin }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-safe md:relative md:border-t-0 md:bg-transparent z-50">
      <div className="flex justify-around items-center p-2">
        <button 
          onClick={() => onTabChange(AppView.DASHBOARD)}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.DASHBOARD ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <LayoutGrid size={24} strokeWidth={activeTab === AppView.DASHBOARD ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        
        <button 
          onClick={() => onTabChange(AppView.AI_CHAT)}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.AI_CHAT ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <div className={`${activeTab === AppView.AI_CHAT ? 'bg-teal-100 dark:bg-teal-900/50 p-1 rounded-full' : ''}`}>
             <MessageSquare size={24} strokeWidth={activeTab === AppView.AI_CHAT ? 2.5 : 2} className={activeTab === AppView.AI_CHAT ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
          </div>
          <span className="text-[10px] font-medium">Chat</span>
        </button>

        <button 
          onClick={() => onTabChange(AppView.LIVE_ASSISTANT)}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.LIVE_ASSISTANT ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <div className={`${activeTab === AppView.LIVE_ASSISTANT ? 'bg-teal-100 dark:bg-teal-900/50 p-1 rounded-full' : ''}`}>
             <Mic size={24} strokeWidth={activeTab === AppView.LIVE_ASSISTANT ? 2.5 : 2} className={activeTab === AppView.LIVE_ASSISTANT ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
          </div>
          <span className="text-[10px] font-medium">Voice</span>
        </button>

        <button 
          onClick={() => onTabChange(AppView.APPOINTMENTS)}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.APPOINTMENTS ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Calendar size={24} strokeWidth={activeTab === AppView.APPOINTMENTS ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Book</span>
        </button>

        {isAdmin && (
          <button 
            onClick={() => onTabChange(AppView.ADMIN_PANEL)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.ADMIN_PANEL ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Shield size={24} strokeWidth={activeTab === AppView.ADMIN_PANEL ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        )}

        <button 
          onClick={() => onTabChange(AppView.PROFILE)}
          className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeTab === AppView.PROFILE ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <User size={24} strokeWidth={activeTab === AppView.PROFILE ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;