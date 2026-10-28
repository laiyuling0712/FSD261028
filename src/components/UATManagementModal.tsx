import React, { useState } from 'react';
import {
  MESRequirement,
  UATItem,
  ElectronicSignature,
  UserProfile,
} from '../types';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface UATManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: MESRequirement | null;
  onSave: (updatedReq: MESRequirement, deployNow?: boolean) => void;
  currentUser: UserProfile;
}

export const UATManagementModal: React.FC<UATManagementModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onSave,
  currentUser,
}) => {
  if (!isOpen || !requirement) return null;

  const [items, setItems] = useState<UATItem[]>(
    requirement.acceptanceCriteria || []
  );
  const [signature, setSignature] = useState<ElectronicSignature | undefined>(
    requirement.uatSignature
  );
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 4000);
  };

  // New item inputs
  const [newScenario, setNewScenario] = useState('');
  const [newExpectedResult, setNewExpectedResult] = useState('');
  const [newNote, setNewNote] = useState('');

  // Check if all are Pass
  const hasItems = items.length > 0;
  const allPassed =
    hasItems && items.every((item) => item.result === 'Pass');
  const isSigned = !!signature?.isSigned;
  const canDeploy = allPassed && isSigned;

  // Add Item
  const handleAddItem = () => {
    if (!newScenario.trim() || !newExpectedResult.trim()) {
      showWarning('請輸入測試情境與預期結果');
      return;
    }
    const newItem: UATItem = {
      id: `tc-${Date.now()}`,
      scenario: newScenario.trim(),
      expectedResult: newExpectedResult.trim(),
      result: 'Pending',
      note: newNote.trim() || '常規驗收項',
    };
    setItems((prev) => [...prev, newItem]);
    setNewScenario('');
    setNewExpectedResult('');
    setNewNote('');
    // Invalidate signature if items change
    setSignature(undefined);
  };

  const handleUpdateResult = (
    id: string,
    result: 'Pass' | 'Fail' | 'Pending'
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, result } : item))
    );
    // If result changed to non-pass, clear signature
    if (result !== 'Pass') {
      setSignature(undefined);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSignature(undefined);
  };

  // AI Generate UAT items
  const handleAiGenerateUAT = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-uat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: requirement.title,
          toBe: requirement.toBe,
          affectedModules: requirement.affectedModules,
        }),
      });
      const data = await res.json();
      if (data.success && data.criteria) {
        const mappedItems: UATItem[] = data.criteria.map((c: any, i: number) => ({
          id: `tc-ai-${Date.now()}-${i}`,
          scenario: c.scenario,
          expectedResult: c.expectedResult,
          result: c.result || 'Pending',
          note: c.note || 'AI 自動生成之情境',
        }));
        setItems(mappedItems);
        setSignature(undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Sign off
  const handleElectronicSign = () => {
    if (!allPassed) {
      showWarning('所有 UAT 驗收項目皆需為 [Pass] 狀態後，方可執行電子簽核！');
      return;
    }

    const randomHash = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newSignature: ElectronicSignature = {
      isSigned: true,
      signedBy: currentUser.name,
      signedRole: currentUser.roleName,
      signedDate: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      hashDigest: `SHA256:${randomHash}`,
    };

    setSignature(newSignature);
  };

  const handleRevokeSign = () => {
    setSignature(undefined);
  };

  const handleSave = (deployNow = false) => {
    if (deployNow && !canDeploy) {
      showWarning('依據 FSD 簽核邏輯：只有當所有項目皆 Pass 且完成電子簽核後，才允許部署上線！');
      return;
    }

    const updated: MESRequirement = {
      ...requirement,
      acceptanceCriteria: items,
      uatSignature: signature,
      status: deployNow ? 'deployed' : requirement.status,
      currentBlocker: deployNow
        ? '已順利完成驗收並部署上線'
        : !allPassed
        ? 'UAT 驗收中：尚有未通過之測試情境'
        : !isSigned
        ? '等待需求單位/QA 進行電子簽核'
        : requirement.currentBlocker,
      updatedAt: new Date().toISOString().split('T')[0],
      releaseNote:
        deployNow && !requirement.releaseNote
          ? {
              version: 'v2.5.0',
              releaseDate: new Date().toISOString().split('T')[0],
              headline: `${requirement.title} 正式上線公告`,
              overview: `本版本成功通過嚴格 UAT 驗收，已正式部署至生產環境供現場使用。`,
              highlights: [
                '通過 100% 現場驗收測試情境',
                '系統響應效能符合作業標準',
                '具備完整異常防呆與錯誤攔截',
              ],
              sopGuide: [
                '開啟機台 MES 終端，進入對應站台',
                '依照標準作業指導書 (SOP) 進行條碼讀取與操作',
                '若有疑問請致電 IT 服務台',
              ],
              precautions: '上線首週由駐廠工程師與生管代表進行現場巡視輔導。',
            }
          : requirement.releaseNote,
    };

    onSave(updated, deployNow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              UAT-01
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                UAT 驗收清單與電子簽核 (UAT-01)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {requirement.id} · {requirement.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiGenerateUAT}
              disabled={isAiGenerating}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 rounded-lg hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {isAiGenerating ? 'AI 生成中...' : 'AI 智能生成驗收情境'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FSD acceptance logic prompt */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>FSD 簽核邏輯：</strong>只有當所有 UAT 項目皆為{' '}
              <span className="text-emerald-400 font-bold">Pass</span>{' '}
              且需求單位完成電子簽核後，系統才允許將狀態轉為{' '}
              <span className="text-cyan-400 font-bold">[可部署上線]</span>。
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>
              通過率：
              <span className="font-mono font-bold text-slate-200">
                {items.filter((i) => i.result === 'Pass').length}/{items.length}
              </span>
            </span>
            <div className="h-3 w-px bg-slate-800" />
            <span>
              簽核狀態：
              {isSigned ? (
                <span className="text-emerald-400 font-medium">已完成簽核</span>
              ) : (
                <span className="text-amber-400 font-medium">待簽核</span>
              )}
            </span>
          </div>
        </div>

        {/* Body: Acceptance Criteria table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {warningMessage && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-600/60 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-4 w-1/3">測試情境 (Scenario)</th>
                  <th className="py-2.5 px-4 w-1/3">預期結果 (Expected)</th>
                  <th className="py-2.5 px-3 w-28 text-center">
                    驗收結果 (Pass/Fail)
                  </th>
                  <th className="py-2.5 px-3">備註</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-500 text-xs"
                    >
                      尚未建立驗收項目。可點擊右上角「AI 智能生成驗收情境」或在下方手動新增。
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-medium leading-relaxed">
                        {item.scenario}
                      </td>
                      <td className="py-3 px-4 text-slate-300 leading-relaxed">
                        {item.expectedResult}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex rounded-md p-0.5 bg-slate-900 border border-slate-800">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateResult(item.id, 'Pass')
                            }
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              item.result === 'Pass'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'text-slate-400 hover:text-emerald-300'
                            }`}
                          >
                            Pass
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateResult(item.id, 'Fail')
                            }
                            className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              item.result === 'Fail'
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-400 hover:text-rose-300'
                            }`}
                          >
                            Fail
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateResult(item.id, 'Pending')
                            }
                            className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                              item.result === 'Pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            待測
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {item.note}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add custom UAT item row */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              手動新增自訂驗收情境
            </span>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <input
                type="text"
                placeholder="測試情境（例：掃描非指定料號條碼）"
                value={newScenario}
                onChange={(e) => setNewScenario(e.target.value)}
                className="md:col-span-5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="預期結果（例：系統跳出紅燈警告聲響並鎖定製程）"
                value={newExpectedResult}
                onChange={(e) => setNewExpectedResult(e.target.value)}
                className="md:col-span-5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                placeholder="備註"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="md:col-span-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                + 加入驗收清單
              </button>
            </div>
          </div>

          {/* Electronic Signature Box */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  需求單位 / QA 電子簽核驗收證明 (Digital Sign-off)
                </span>
              </div>
              {signature?.isSigned ? (
                <button
                  type="button"
                  onClick={handleRevokeSign}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  撤銷簽核
                </button>
              ) : null}
            </div>

            {signature?.isSigned ? (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已完成電子數位簽核</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {signature.signedDate}
                  </span>
                </div>
                <div className="text-slate-300">
                  簽核人員：
                  <span className="font-semibold text-slate-100">
                    {signature.signedBy}
                  </span>{' '}
                  ({signature.signedRole})
                </div>
                <div className="font-mono text-[11px] text-slate-500 break-all">
                  防偽摘要：{signature.hashDigest}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <div className="font-medium text-slate-300">
                    簽核授權人員：{currentUser.name} ({currentUser.roleName})
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {allPassed
                      ? '所有測試情境皆已通過，符合簽核條件。'
                      : '尚有測試情境未通過 (需全數為 Pass 方能簽核)。'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleElectronicSign}
                  disabled={!allPassed}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    allPassed
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-sm shadow-emerald-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  執行電子簽核
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs">
            {!canDeploy ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                尚未滿足上線條件 (需全數 Pass 且完成簽核)
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                驗收與簽核齊備，可正式發布上線！
              </span>
            )}
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
              僅儲存驗收紀錄
            </button>
            <button
              type="button"
              disabled={!canDeploy}
              onClick={() => handleSave(true)}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm ${
                canDeploy
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              驗收合格 ➔ 部署上線 (UAT-02)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
