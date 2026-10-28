import React, { useState } from 'react';
import {
  MESRequirement,
  Priority,
  BenefitCategory,
  Attachment,
  UserProfile,
} from '../types';
import {
  X,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  MapPin,
} from 'lucide-react';

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: MESRequirement) => void;
  currentUser: UserProfile;
  initialRequirement?: MESRequirement | null;
}

export const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  initialRequirement,
}) => {
  const isEditing = !!initialRequirement;

  const [title, setTitle] = useState(initialRequirement?.title || '');
  const [department] = useState(
    initialRequirement?.department || currentUser.department
  );
  const [requesterName] = useState(
    initialRequirement?.requesterName || currentUser.name
  );
  const [asIs, setAsIs] = useState(initialRequirement?.asIs || '');
  const [toBe, setToBe] = useState(initialRequirement?.toBe || '');
  const [benefitCategory, setBenefitCategory] = useState<BenefitCategory>(
    initialRequirement?.benefitCategory || 'save_hours'
  );
  const [benefitDescription, setBenefitDescription] = useState(
    initialRequirement?.benefitDescription || ''
  );
  const [priority, setPriority] = useState<Priority>(
    initialRequirement?.priority || 'medium'
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialRequirement?.attachments || []
  );
  const [wireframeUrl, setWireframeUrl] = useState(
    initialRequirement?.wireframeUrl ||
      '/src/assets/images/mes_wireframe_touchscreen_1793073274076.jpg'
  );
  const [activeTab, setActiveTab] = useState<'form' | 'wireframe'>('form');

  // AI Refine state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    refinedAsIs?: string;
    refinedToBe?: string;
    suggestedBenefits?: string;
    suggestedCriteria?: any[];
  } | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalWarning, setModalWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiRefine = async () => {
    if (!title && !asIs && !toBe) {
      setModalWarning('請先輸入簡要的需求名稱或現狀描述，供 AI 進行專業結構化分析！');
      setTimeout(() => setModalWarning(null), 4000);
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/refine-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          asIs,
          toBe,
          benefitCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestions) return;
    if (aiSuggestions.refinedAsIs) setAsIs(aiSuggestions.refinedAsIs);
    if (aiSuggestions.refinedToBe) setToBe(aiSuggestions.refinedToBe);
    if (aiSuggestions.suggestedBenefits) {
      setBenefitDescription(aiSuggestions.suggestedBenefits);
    }
    setAiSuggestions(null);
  };

  const handleAddSampleAttachment = (type: 'image' | 'excel' | 'pdf') => {
    const id = `att-${Date.now()}`;
    if (type === 'excel') {
      setAttachments((prev) => [
        ...prev,
        {
          id,
          name: `MES_${title ? title.slice(0, 8) : '需求'}_效益評估表.xlsx`,
          size: '640 KB',
          type: 'excel',
        },
      ]);
    } else if (type === 'pdf') {
      setAttachments((prev) => [
        ...prev,
        {
          id,
          name: `產線現行作業規範與錯誤流轉卡.pdf`,
          size: '1.2 MB',
          type: 'pdf',
        },
      ]);
    } else {
      setAttachments((prev) => [
        ...prev,
        {
          id,
          name: `機台螢幕報警實體翻拍.jpg`,
          size: '950 KB',
          type: 'image',
          url: '/src/assets/images/mes_wireframe_touchscreen_1793073274076.jpg',
        },
      ]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '需求名稱為必填項目';
    if (!asIs.trim()) newErrors.asIs = '現況痛點 (As-Is) 為必填項目';
    if (!toBe.trim()) newErrors.toBe = '期望功能 (To-Be) 為必填項目';
    if (!benefitDescription.trim())
      newErrors.benefitDescription = '效益說明為必填項目';
    if (!priority) newErrors.priority = '請選擇急迫性 / 優先級';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const reqId =
      initialRequirement?.id ||
      `REQ-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

    const newReq: MESRequirement = {
      id: reqId,
      title: title.trim(),
      department,
      requesterName,
      asIs: asIs.trim(),
      toBe: toBe.trim(),
      benefitCategory,
      benefitDescription: benefitDescription.trim(),
      priority,
      attachments,
      wireframeUrl,
      wireframeAnnotations: [
        {
          id: 'ann-1',
          x: 25,
          y: 45,
          label: '掃描條碼輸入項',
          description: '支援觸控鍵盤與條碼槍連動',
        },
        {
          id: 'ann-2',
          x: 75,
          y: 25,
          label: '防呆燈號指示',
          description: 'Pass 綠燈解除上料機構 / Fail 紅燈停線',
        },
      ],
      // 業務邏輯：表單提交後，狀態自動變更為 [待 SA 評估]
      status: initialRequirement?.status === 'draft' || !initialRequirement ? 'evaluating' : initialRequirement.status,
      createdAt:
        initialRequirement?.createdAt ||
        new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentBlocker: '已提交需求單，待 SA (陳建宏) 進行影響模組與技術可行性評估',
      blockerOwner: '陳建宏 (資深 SA)',
      affectedModules: initialRequirement?.affectedModules || [
        '工單調度 (Dispatch)',
        '物料扣帳 (BOM Deduct)',
      ],
      acceptanceCriteria:
        initialRequirement?.acceptanceCriteria?.length
          ? initialRequirement.acceptanceCriteria
          : aiSuggestions?.suggestedCriteria || [
              {
                id: `tc-${Date.now()}-1`,
                scenario: '標準操作：操作員輸入符合規格之工單與料號',
                expectedResult: '系統於 1 秒內回傳驗證通過，正常過帳',
                result: 'Pending',
                note: '核心功能驗收',
              },
            ],
    };

    onSubmit(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              REQ-01 / REQ-02
            </span>
            <h2 className="text-base font-bold text-slate-100">
              {isEditing ? '編輯需求單規格' : '結構化需求單建立 (FSD REQ-01)'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAiRefine}
              disabled={isAiLoading}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-700/50 rounded-lg hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="呼叫 Gemini AI 進行痛點結構化與無歧義規格擴充"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {isAiLoading ? 'AI 智能分析中...' : 'AI 需求結構化輔助'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch: Form vs REQ-02 Wireframe Mockup */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'form'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            結構化欄位表單 (REQ-01)
          </button>
          <button
            onClick={() => setActiveTab('wireframe')}
            className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wireframe'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            需求預覽與原型關聯 (REQ-02)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {modalWarning && (
            <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-600/50 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{modalWarning}</span>
            </div>
          )}

          {/* AI Suggestion Banner if ready */}
          {aiSuggestions && (
            <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Gemini AI 需求結構化建議已生成</span>
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded cursor-pointer transition-colors"
                >
                  一鍵套用至表單
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                已針對半導體與高科技製造業 MES 規範將 As-Is
                現況痛點量化、To-Be 規格無歧義化，並產生了預估效益說明。
              </p>
            </div>
          )}

          {activeTab === 'form' ? (
            <form id="req-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: 需求名稱 (必填) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  1. 需求名稱 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：SMT 產線物料批號防呆校驗功能"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm ${
                    errors.title ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Field 2: 申請部門 / 申請人 (系統自動帶入) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    2. 申請部門（系統自動帶入）
                  </label>
                  <input
                    type="text"
                    disabled
                    value={department}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-slate-300 text-sm cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    申請人（系統自動帶入）
                  </label>
                  <input
                    type="text"
                    disabled
                    value={requesterName}
                    className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-slate-300 text-sm cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Field 3: 現況痛點 (As-Is) (必填) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>3. 現況痛點 (As-Is)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    引導：現在遇到了什麼困難？造成多少工時損失或異常？
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={asIs}
                  onChange={(e) => setAsIs(e.target.value)}
                  placeholder="請具體描述目前現場作業流程遭遇之困難、人工抄寫弊端、或重工不良率損失..."
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm leading-relaxed ${
                    errors.asIs ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.asIs && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.asIs}
                  </p>
                )}
              </div>

              {/* Field 4: 期望功能 (To-Be) (必填) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>4. 期望功能 (To-Be)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    引導：希望系統如何運作？包含哪些防呆、連線或介面操作？
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={toBe}
                  onChange={(e) => setToBe(e.target.value)}
                  placeholder="請清楚定義預期的操作步驟、觸發時機、警報判斷條件與介面回饋..."
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm leading-relaxed ${
                    errors.toBe ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {errors.toBe && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.toBe}
                  </p>
                )}
              </div>

              {/* Field 5: 預期效益 (選單 + 說明 必填) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    5. 預期效益類別 <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={benefitCategory}
                    onChange={(e) =>
                      setBenefitCategory(e.target.value as BenefitCategory)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value="save_hours">節省工時 (Save Hours)</option>
                    <option value="lower_defect">
                      降低錯報率 (Lower Defect Rate)
                    </option>
                    <option value="boost_capacity">
                      提升產能 (Boost Capacity)
                    </option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    效益具體說明 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={benefitDescription}
                    onChange={(e) => setBenefitDescription(e.target.value)}
                    placeholder="例：預計每日節省抄寫工時 45 分鐘，混料異常率降低 90%"
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm ${
                      errors.benefitDescription
                        ? 'border-rose-500'
                        : 'border-slate-800'
                    }`}
                  />
                  {errors.benefitDescription && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.benefitDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Field 6: 急迫性 / 優先級 (下拉選單 必填) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  6. 急迫性 / 優先級 <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                    const label =
                      p === 'high'
                        ? '高 (High) - 影響出貨或頻繁重工'
                        : p === 'medium'
                        ? '中 (Medium) - 流程優化與改善'
                        : '低 (Low) - 介面輔助或日常改善';
                    const isSelected = priority === p;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? p === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                              : p === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                              : 'bg-slate-700/50 text-slate-200 border-slate-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 7: 附件上傳 (PNG/JPG, Excel, PDF 選填) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>7. 附件上傳（支援圖片 PNG/JPG、Excel、PDF）</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      快速新增測試附件：
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSampleAttachment('excel')}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                    >
                      + Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleAttachment('pdf')}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                    >
                      + PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSampleAttachment('image')}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                    >
                      + 截圖
                    </button>
                  </div>
                </div>

                {attachments.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500 bg-slate-950/40">
                    目前尚未附加任何檔案，可點擊上方按鈕附加作業異常表、條碼規範或拍照截圖。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-300">
                          {att.type === 'excel' ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          ) : att.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-rose-400" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-cyan-400" />
                          )}
                          <span className="font-medium">{att.name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({att.size})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* REQ-02: 需求預覽與原型關聯 */
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">
                    REQ-02 原型直觀規格體驗
                  </div>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    提供需求單位與 SA
                    在開發前直觀預覽觸控介面與操作熱點，避免傳統規格文字在產線現場產生的認知落差。
                  </p>
                </div>
              </div>

              {/* Prototype display with visual hotpins */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={wireframeUrl}
                  alt="MES Wireframe Mockup"
                  className="w-full h-auto max-h-[420px] object-contain mx-auto bg-slate-950"
                  referrerPolicy="no-referrer"
                />

                {/* Hotspot 1 */}
                <div
                  className="absolute top-[44%] left-[26%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  title="掃描條碼輸入項：支援 USB 條碼槍快速連動"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center ring-4 ring-cyan-500/30">
                    1
                  </div>
                  <div className="hidden group-hover:block absolute left-6 top-0 bg-slate-900 border border-slate-700 p-2 rounded shadow-lg text-[11px] whitespace-nowrap text-slate-200 z-10">
                    【熱點 1】條碼掃描輸入區（自動焦點防呆）
                  </div>
                </div>

                {/* Hotspot 2 */}
                <div
                  className="absolute top-[28%] left-[72%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  title="批號比對燈號：雙色聲光警報機制"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center ring-4 ring-emerald-500/30">
                    2
                  </div>
                  <div className="hidden group-hover:block absolute right-6 top-0 bg-slate-900 border border-slate-700 p-2 rounded shadow-lg text-[11px] whitespace-nowrap text-slate-200 z-10">
                    【熱點 2】BATCH VERIFICATION 狀態即時回饋
                  </div>
                </div>
              </div>

              {/* Wireframe spec description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>熱點 1 規格定義：條碼掃描防呆</span>
                  </div>
                  <p className="text-slate-400">
                    產線作業員在觸控站台以條碼槍刷入料捲唯一序號，系統在 300ms
                    內檢核工單 BOM
                    對應項，不需手動點選滑鼠，支援手套觸控大按鈕。
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>熱點 2 規格定義：狀態與機構聯鎖</span>
                  </div>
                  <p className="text-slate-400">
                    比對 Pass
                    發出嗶聲並解除機台供料門鎖；若比對失敗立即彈出紅底告警框，並透過
                    DI/DO 繼電器鎖死上料機構，杜絕混料。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-500">
            狀態業務邏輯：提交後將自動推進至{' '}
            <span className="text-cyan-400 font-semibold">[待 SA 評估]</span>{' '}
            並推播通知負責 SA
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
              type="submit"
              form="req-form"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer shadow-sm shadow-cyan-950"
            >
              {isEditing ? '儲存變更' : '正式提交需求單 (➔ 待 SA 評估)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
