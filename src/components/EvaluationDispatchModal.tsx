import React, { useState } from 'react';
import { MESRequirement, UserProfile } from '../types';
import { MES_MODULES, SYSTEM_USERS } from '../data/initialData';
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Cpu,
  UserCheck,
  Kanban,
  AlertTriangle,
} from 'lucide-react';

interface EvaluationDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: MESRequirement | null;
  onSave: (updatedReq: MESRequirement, proceedToDeveloping?: boolean) => void;
  currentUser: UserProfile;
}

export const EvaluationDispatchModal: React.FC<EvaluationDispatchModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onSave,
  currentUser,
}) => {
  if (!isOpen || !requirement) return null;

  const [activeTab, setActiveTab] = useState<'dev01' | 'dev02'>('dev01');

  // DEV-01 fields
  const [technicalFeasibility, setTechnicalFeasibility] = useState(
    requirement.technicalFeasibility ||
      '可行。評估既有產線設備與 MES API 支援度完整，可透過資料庫觸發器與微服務架構實現即時防呆與報工連動。'
  );
  const [affectedModules, setAffectedModules] = useState<string[]>(
    requirement.affectedModules?.length
      ? requirement.affectedModules
      : ['工單調度 (Dispatch)', '物料扣帳 (BOM Deduct)']
  );
  const [estimatedHours, setEstimatedHours] = useState<number>(
    requirement.estimatedHours || 40
  );
  const [estimatedDays, setEstimatedDays] = useState<number>(
    requirement.estimatedDays || 5
  );
  const [targetReleaseDate, setTargetReleaseDate] = useState(
    requirement.targetReleaseDate || '2026-11-15'
  );

  // DEV-02 fields
  const [assignedEngineer, setAssignedEngineer] = useState(
    requirement.assignedEngineer || '張瑋庭 (資深架構工程師)'
  );
  const [assignedQA, setAssignedQA] = useState(
    requirement.assignedQA || '李冠宇 (品保驗收專員)'
  );
  const [sprint, setSprint] = useState(
    requirement.sprint || 'Sprint 2026-S11'
  );
  const [scrumMode, setScrumMode] = useState<'Scrum' | 'Kanban'>(
    requirement.scrumMode || 'Scrum'
  );

  // AI Estimation
  const [isAiEstimating, setIsAiEstimating] = useState(false);
  const [aiEstimateResult, setAiEstimateResult] = useState<{
    estimatedDays?: number;
    confidenceLevel?: string;
    breakdown?: Array<{ phase: string; days: number }>;
    riskAssessment?: string;
    suggestedQAFocus?: string;
  } | null>(null);

  const toggleModule = (mod: string) => {
    setAffectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleAiEstimate = async () => {
    setIsAiEstimating(true);
    try {
      const res = await fetch('/api/ai/estimate-effort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: requirement.title,
          affectedModules,
          complexity: affectedModules.length >= 3 ? 'high' : 'medium',
          asIs: requirement.asIs,
          toBe: requirement.toBe,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiEstimateResult(data);
        if (data.estimatedDays) {
          setEstimatedDays(data.estimatedDays);
          setEstimatedHours(data.estimatedDays * 8);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiEstimating(false);
    }
  };

  const handleSave = (proceedToDeveloping = false) => {
    const updated: MESRequirement = {
      ...requirement,
      technicalFeasibility,
      affectedModules,
      estimatedHours,
      estimatedDays,
      aiEstimatedDays: aiEstimateResult?.estimatedDays || requirement.aiEstimatedDays,
      aiConfidence: aiEstimateResult?.confidenceLevel || requirement.aiConfidence || '90%',
      targetReleaseDate,
      assignedEngineer,
      assignedQA,
      sprint,
      scrumMode,
      updatedAt: new Date().toISOString().split('T')[0],
      status: proceedToDeveloping ? 'developing' : requirement.status,
      currentBlocker: proceedToDeveloping
        ? `開發中，負責工程師：${assignedEngineer}`
        : requirement.currentBlocker,
      blockerOwner: proceedToDeveloping ? assignedEngineer : requirement.blockerOwner,
    };

    onSave(updated, proceedToDeveloping);
    onClose();
  };

  // Filter engineers and QAs for assignment
  const engineers = SYSTEM_USERS.filter((u) => u.role === 'engineer' || u.role === 'sa');
  const qas = SYSTEM_USERS.filter((u) => u.role === 'qa');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              DEV-01 / DEV-02
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                評估與派工模組 (DEV-01 & DEV-02)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {requirement.id} · {requirement.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dev01')}
            className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dev01'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            DEV-01 系統影響與時程評估 (SA, 工程師)
          </button>
          <button
            onClick={() => setActiveTab('dev02')}
            className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dev02'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            DEV-02 開發任務派工管理 (IT 主管, PM)
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {activeTab === 'dev01' ? (
            <div className="space-y-5">
              {/* Technical Feasibility */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  技術可行性分析 (Technical Feasibility)
                </label>
                <textarea
                  rows={3}
                  value={technicalFeasibility}
                  onChange={(e) => setTechnicalFeasibility(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm leading-relaxed"
                  placeholder="說明資料庫架構、機台通訊協定、API 整合與效能可行性..."
                />
              </div>

              {/* Affected Modules */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  系統影響模組勾選 (Affected Modules)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MES_MODULES.map((mod) => {
                    const isChecked = affectedModules.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => toggleModule(mod)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{mod}</span>
                        {isChecked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Effort Estimation Trigger */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      AI 歷史工時數據推估與風險評估 (TRK-01 AI 擴充)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiEstimate}
                    disabled={isAiEstimating}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-semibold rounded-md text-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAiEstimating ? 'AI 分析計算中...' : '執行 AI 工時推估'}
                  </button>
                </div>

                {aiEstimateResult ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">
                          AI 預估工作天數
                        </span>
                        <span className="text-lg font-bold font-mono text-cyan-400">
                          {aiEstimateResult.estimatedDays} 天
                        </span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          (可信度 {aiEstimateResult.confidenceLevel})
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">
                          QA 驗收重點提醒
                        </span>
                        <span className="text-slate-300">
                          {aiEstimateResult.suggestedQAFocus}
                        </span>
                      </div>
                    </div>

                    {aiEstimateResult.breakdown && (
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block mb-1">
                          開發階段時程拆解：
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {aiEstimateResult.breakdown.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded bg-slate-900 text-[11px]"
                            >
                              <div className="text-slate-400 truncate">
                                {item.phase}
                              </div>
                              <div className="font-mono font-bold text-slate-200">
                                {item.days} 天
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiEstimateResult.riskAssessment && (
                      <div className="flex items-start gap-2 p-2.5 rounded bg-amber-950/30 border border-amber-900/50 text-amber-200/90 text-[11px]">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>{aiEstimateResult.riskAssessment}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">
                    根據需求涉及之 {affectedModules.length} 個核心模組及 As-Is/To-Be
                    複雜度，AI 可結合歷史專案平均產出時間進行精準天數推估與排程建議。
                  </p>
                )}
              </div>

              {/* Hours & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>預估工時 (小時)</span>
                  </label>
                  <input
                    type="number"
                    min={4}
                    value={estimatedHours}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setEstimatedHours(h);
                      setEstimatedDays(Math.ceil(h / 8));
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>預計完成工作天</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setEstimatedDays(d);
                      setEstimatedHours(d * 8);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>預計上線日 (Target Date)</span>
                  </label>
                  <input
                    type="date"
                    value={targetReleaseDate}
                    onChange={(e) => setTargetReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* DEV-02 派工管理 */
            <div className="space-y-5">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Kanban className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">
                    DEV-02 開發任務派工管理 (IT 主管, PM)
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    指派負責工程師與 QA
                    驗收人員，並安排所屬敏捷週程（Sprint）或持續看板交付模式。
                  </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  專案管理模式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScrumMode('Scrum')}
                    className={`px-4 py-3 rounded-lg border text-left cursor-pointer transition-colors ${
                      scrumMode === 'Scrum'
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">
                      Scrum 衝刺模式 (2週 Sprint)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      固定雙週週期發布，適合跨系統較大規模功能迭代
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScrumMode('Kanban')}
                    className={`px-4 py-3 rounded-lg border text-left cursor-pointer transition-colors ${
                      scrumMode === 'Kanban'
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">
                      Kanban 連續交付模式 (Continuous)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      即時拉動、限制在製品 (WIP)，適合現場產線緊急優化
                    </div>
                  </button>
                </div>
              </div>

              {/* Assignments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    指派負責工程師 (Lead Engineer)
                  </label>
                  <select
                    value={assignedEngineer}
                    onChange={(e) => setAssignedEngineer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {engineers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} · {u.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    指派 QA 品保負責人 (QA Lead)
                  </label>
                  <select
                    value={assignedQA}
                    onChange={(e) => setAssignedQA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {qas.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} · {u.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sprint identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  納入開發週程 (Sprint / Cycle)
                </label>
                <input
                  type="text"
                  value={sprint}
                  onChange={(e) => setSprint(e.target.value)}
                  placeholder="例：Sprint 2026-S11"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400">
            目前狀態：
            <span className="text-amber-400 font-semibold uppercase ml-1">
              {requirement.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              僅儲存評估結果
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm shadow-amber-950"
            >
              核准並正式派工 (➔ 進入開發中)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
