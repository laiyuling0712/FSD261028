import React from 'react';
import { UserProfile } from '../types';
import { SYSTEM_USERS } from '../data/initialData';
import { Shield, Eye, Lock } from 'lucide-react';

interface RoleSwitcherBarProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSelectUser,
}) => {
  const isRequester = currentUser.role === 'requester';

  return (
    <div className="bg-slate-950/70 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>角色權限模擬：</span>
        </div>
        
        {/* Role options segmented control */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg overflow-x-auto">
          {SYSTEM_USERS.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={`${user.name} - ${user.department}`}
              >
                <span>{user.name}</span>
                <span className="text-slate-500 ml-1">· {user.roleName.split('/')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-1.5">
          {isRequester ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300/90 font-medium">
                部門權限隔離：僅限檢視【{currentUser.department}】需求
              </span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300/90 font-medium">
                IT 研發視角：可檢視與評估【全廠區需求】
              </span>
            </>
          )}
        </div>
        
        <div className="h-3 w-px bg-slate-800" />
        
        <div className="text-slate-500">
          登入身分：<span className="text-slate-300 font-mono">{currentUser.name}</span>
        </div>
      </div>
    </div>
  );
};
