import React from 'react';
import { NotificationLog } from '../types';
import { Bell, Send, CheckCircle2, MessageSquare, Mail, Sparkles, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  onClear: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              TRK-02 自動化狀態通知紀錄
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80 text-xs text-slate-400 leading-relaxed">
          <strong>TRK-02 規範：</strong>當需求單狀態於
          <code className="text-cyan-400 mx-1">
            [草稿 ➔ 待評估 ➔ 開發中 ➔ UAT ➔ 已上線]
          </code>
          變更時，系統於 3 秒內自動推播 Teams、Email、LINE 訊息至相關負責人員。
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              暫無狀態通知記錄
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    {notif.channel === 'Teams' ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Teams
                      </span>
                    ) : notif.channel === 'Email' ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-green-950 text-green-400 border border-green-800 font-bold flex items-center gap-1">
                        LINE
                      </span>
                    )}
                    <span>{notif.reqId}</span>
                  </div>
                  <span>{notif.timestamp}</span>
                </div>

                <div className="font-semibold text-slate-200">
                  {notif.reqTitle}
                </div>

                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/50">
                  {notif.message}
                </p>

                <div className="text-[11px] text-slate-500">
                  接收者：
                  <span className="text-slate-400">
                    {notif.recipients.join(', ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            共 {notifications.length} 筆通報
          </span>
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            清除紀錄
          </button>
        </div>
      </div>
    </div>
  );
};
