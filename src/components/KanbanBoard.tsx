import React, { useState } from 'react';
import {
  MESRequirement,
  RequirementStatus,
  UserProfile,
  Priority,
} from '../types';
import {
  Search,
  Filter,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  ChevronRight,
  Shield,
  FileCheck,
  Send,
  BookOpen,
} from 'lucide-react';

interface KanbanBoardProps {
  requirements: MESRequirement[];
  currentUser: UserProfile;
  onOpenRequirementDetail: (req: MESRequirement) => void;
  onOpenEvaluation: (req: MESRequirement) => void;
  onOpenUAT: (req: MESRequirement) => void;
  onOpenReleaseNote: (req: MESRequirement) => void;
  onMoveStatus: (
    req: MESRequirement,
    newStatus: RequirementStatus,
    reason?: string
  ) => void;
  onOpenNewRequirement: () => void;
}

const COLUMNS: {
  id: RequirementStatus;
  title: string;
  badgeColor: string;
  description: string;
}[] = [
  {
    id: 'draft',
    title: '草稿',
    badgeColor: 'border-slate-700 text-slate-400 bg-slate-800/40',
    description: '使用者編輯中，尚未正式提報',
  },
  {
    id: 'evaluating',
    title: '待 SA 評估',
    badgeColor: 'border-amber-700/60 text-amber-300 bg-amber-950/30',
    description: 'DEV-01 系統影響與時程分析',
  },
  {
    id: 'developing',
    title: '開發中',
    badgeColor: 'border-blue-700/60 text-blue-300 bg-blue-950/30',
    description: '工程師開發與單元測試',
  },
  {
    id: 'uat',
    title: 'UAT 驗收中',
    badgeColor: 'border-purple-700/60 text-purple-300 bg-purple-950/30',
    description: 'UAT-01 驗收標準與電子簽核',
  },
  {
    id: 'deployed',
    title: '已上線',
    badgeColor: 'border-emerald-700/60 text-emerald-300 bg-emerald-950/30',
    description: 'UAT-02 版本公告與產線手冊',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requirements,
  currentUser,
  onOpenRequirementDetail,
  onOpenEvaluation,
  onOpenUAT,
  onOpenReleaseNote,
  onMoveStatus,
  onOpenNewRequirement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Business Logic: 需求單位僅能查看「本部門提交的需求」，IT 團隊可查看「全廠區需求」
  const isRequester = currentUser.role === 'requester';
  const roleFiltered = requirements.filter((req) => {
    if (isRequester) {
      return req.department === currentUser.department;
    }
    return true; // IT roles (SA, Engineer, PM, QA) see all
  });

  // Search & Filter
  const filteredRequirements = roleFiltered.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.asIs.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      selectedPriority === 'all' || req.priority === selectedPriority;

    const matchesModule =
      selectedModule === 'all' ||
      (req.affectedModules && req.affectedModules.includes(selectedModule));

    return matchesSearch && matchesPriority && matchesModule;
  });

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'text-rose-400 font-semibold';
      case 'medium':
        return 'text-amber-400 font-medium';
      case 'low':
        return 'text-slate-400';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋需求單號、名稱、痛點或申請人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>優先級：</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedPriority === p
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === 'all'
                    ? '全部'
                    : p === 'high'
                    ? '高'
                    : p === 'medium'
                    ? '中'
                    : '低'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Counter and status */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            顯示需求數：
            <strong className="text-cyan-400 font-mono text-sm ml-1">
              {filteredRequirements.length}
            </strong>
            <span className="text-slate-500 ml-1">
              (總量: {requirements.length})
            </span>
          </span>
          {isRequester && (
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[11px]">
              已依登入單位隔離
            </span>
          )}
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto min-h-[580px] pb-4">
        {COLUMNS.map((col) => {
          const colCards = filteredRequirements.filter(
            (r) => r.status === col.id
          );

          return (
            <div
              key={col.id}
              className="flex flex-col bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden min-w-[270px]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      {col.title}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                      {colCards.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {col.description}
                  </p>
                </div>
              </div>

              {/* Cards list */}
              <div className="flex-1 p-2.5 space-y-3 overflow-y-auto">
                {colCards.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-900 rounded-lg">
                    此階段暫無需求
                  </div>
                ) : (
                  colCards.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-lg p-3 space-y-3 text-xs shadow-xs transition-colors group"
                    >
                      {/* Top metadata line: ID, Priority, Department */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-cyan-400 font-semibold">
                          {req.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={getPriorityStyle(req.priority)}>
                            {getPriorityLabel(req.priority)}優先
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 truncate max-w-[100px]">
                            {req.department.replace('製造', '')}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onOpenRequirementDetail(req)}
                        className="text-xs font-bold text-slate-100 hover:text-cyan-300 cursor-pointer line-clamp-2 leading-snug transition-colors"
                        title={req.title}
                      >
                        {req.title}
                      </h4>

                      {/* Affected Modules */}
                      {req.affectedModules && req.affectedModules.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {req.affectedModules.slice(0, 2).map((mod, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 truncate max-w-[110px]"
                            >
                              {mod.split(' ')[0]}
                            </span>
                          ))}
                          {req.affectedModules.length > 2 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{req.affectedModules.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Blocker & Owner requirement from FSD: 卡片需顯示目前卡點負責人 */}
                      <div className="p-2 rounded bg-slate-950/80 border border-slate-800/60 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-slate-500">卡點負責人：</span>
                          <span className="text-slate-200 font-medium truncate max-w-[120px]">
                            {req.blockerOwner || req.requesterName}
                          </span>
                        </div>
                        {req.currentBlocker && (
                          <div className="text-[10px] text-slate-400 truncate" title={req.currentBlocker}>
                            {req.currentBlocker}
                          </div>
                        )}
                      </div>

                      {/* AI Effort Estimation Badge (TRK-01 AI 擴充介面) */}
                      {req.aiEstimatedDays && (
                        <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-950/30 border border-cyan-800/30 text-[11px] text-cyan-300">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>AI 預估天數：</span>
                          </span>
                          <span className="font-mono font-bold">
                            {req.aiEstimatedDays} 天
                          </span>
                        </div>
                      )}

                      {/* Requester & Target Date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 truncate max-w-[100px]">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{req.requesterName.split(' ')[0]}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{req.targetReleaseDate || req.createdAt}</span>
                        </span>
                      </div>

                      {/* Contextual Action Button based on column status */}
                      <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-800/50">
                        {/* Backward move if not draft */}
                        {col.id !== 'draft' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const prevIdx = COLUMNS.findIndex((c) => c.id === col.id) - 1;
                              if (prevIdx >= 0) {
                                onMoveStatus(req, COLUMNS[prevIdx].id, '流程退回重新檢視');
                              }
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                            title="退回前一階段"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-4" />
                        )}

                        {/* Central primary button for this status */}
                        {col.id === 'draft' && (
                          <button
                            type="button"
                            onClick={() =>
                              onMoveStatus(
                                req,
                                'evaluating',
                                '草稿完成，正式提報至待 SA 評估'
                              )
                            }
                            className="flex-1 py-1 px-2 text-[11px] font-semibold bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded cursor-pointer transition-colors text-center"
                          >
                            提交評估 (➔ DEV-01)
                          </button>
                        )}

                        {col.id === 'evaluating' && (
                          <button
                            type="button"
                            onClick={() => onOpenEvaluation(req)}
                            className="flex-1 py-1 px-2 text-[11px] font-semibold bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                          >
                            <Layers className="w-3 h-3" />
                            SA 評估與派工
                          </button>
                        )}

                        {col.id === 'developing' && (
                          <button
                            type="button"
                            onClick={() =>
                              onMoveStatus(
                                req,
                                'uat',
                                '開發與單元測試完成，進入 UAT 驗收'
                              )
                            }
                            className="flex-1 py-1 px-2 text-[11px] font-semibold bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                          >
                            提報 UAT (➔ 驗收)
                          </button>
                        )}

                        {col.id === 'uat' && (
                          <button
                            type="button"
                            onClick={() => onOpenUAT(req)}
                            className="flex-1 py-1 px-2 text-[11px] font-semibold bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                          >
                            <FileCheck className="w-3 h-3" />
                            UAT 驗收與簽核
                          </button>
                        )}

                        {col.id === 'deployed' && (
                          <button
                            type="button"
                            onClick={() => onOpenReleaseNote(req)}
                            className="flex-1 py-1 px-2 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors text-center flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            發布公告與手冊
                          </button>
                        )}

                        {/* Forward move if not deployed */}
                        {col.id !== 'deployed' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const nextIdx = COLUMNS.findIndex((c) => c.id === col.id) + 1;
                              if (nextIdx < COLUMNS.length) {
                                if (col.id === 'uat') {
                                  // Trigger UAT modal for strict validation
                                  onOpenUAT(req);
                                } else {
                                  onMoveStatus(
                                    req,
                                    COLUMNS[nextIdx].id,
                                    `推進至 ${COLUMNS[nextIdx].title}`
                                  );
                                }
                              }
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                            title="推進至下一階段"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
