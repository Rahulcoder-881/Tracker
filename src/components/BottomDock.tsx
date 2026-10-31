import React from 'react';
import { CheckSquare, TrendingUp, Timer, Image as ImageIcon, Settings, Bot, Radio, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';
import { User } from '../types';

interface BottomDockProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: User | null;
}

export const BottomDock: React.FC<BottomDockProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'dharamveersharma8809' || currentUser?.email === 'dharamveersharma8809@gmail.com';

  const tabs = [
    { id: 'today', label: 'Tasks', icon: CheckSquare },
    { id: 'focus', label: 'Timer', icon: Timer },
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'trajectory', label: 'Goals', icon: TrendingUp },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
    { id: 'cms', label: 'Notes', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-2 right-2 sm:left-4 sm:right-4 z-40 pb-[max(env(safe-area-inset-bottom),0.25rem)] pointer-events-none">
      <nav 
        className="pointer-events-auto mx-auto max-w-lg flex items-center justify-around px-1.5 sm:px-3 py-1.5 rounded-2xl border border-[var(--border-medium)] shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(23, 35, 56, 0.94)'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`min-h-[44px] min-w-[42px] sm:min-w-[52px] flex flex-col items-center justify-center rounded-xl px-1 sm:px-2 py-1 transition-all ${
                isActive
                  ? 'bg-[#8296FF]/20 text-[#8296FF]'
                  : 'text-[#98A6BC] hover:text-[#F4F6FC]'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#8296FF]' : 'text-[#98A6BC]'}`} />
              <span className={`text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'text-[#8296FF] font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
