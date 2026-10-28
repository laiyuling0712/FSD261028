import React from 'react';
import { Layers, Plus, FileText, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: 'kanban' | 'fsd' | 'notifications';
  setActiveTab: (tab: 'kanban' | 'fsd' | 'notifications') => void;
  onOpenNewRequirement: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewRequirement,
  notificationCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Layers className="w-4 h-4" />
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('kanban');
          }}
          className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap hover:text-cyan-400 transition-colors"
        >
          MES 新功能開發管理系統
        </a>
      </div>

      {/* Zone 2: 4 nav links with subtle hover underlines */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`transition-colors whitespace-nowrap hover:text-slate-100 cursor-pointer ${
            activeTab === 'kanban' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          進度看板 (TRK-01)
        </button>
        <button
          onClick={() => {
            onOpenNewRequirement();
          }}
          className="transition-colors whitespace-nowrap hover:text-slate-100 cursor-pointer"
        >
          結構化提報 (REQ-01/02)
        </button>
        <button
          onClick={() => setActiveTab('fsd')}
          className={`transition-colors whitespace-nowrap hover:text-slate-100 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'fsd' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          FSD 功能規格書對照
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`transition-colors whitespace-nowrap hover:text-slate-100 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notifications' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          推播通知紀錄 (TRK-02)
          {notificationCount > 0 && (
            <span className="font-mono text-xs text-cyan-400">({notificationCount})</span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenNewRequirement}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-950"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          建立結構化需求單
        </button>
      </div>
    </header>
  );
};
