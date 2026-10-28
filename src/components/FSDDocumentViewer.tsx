import React from 'react';
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FSDDocumentViewerProps {
  onOpenNewRequirement: () => void;
  onOpenEvaluation: (reqId: string) => void;
  onOpenUAT: (reqId: string) => void;
  onOpenReleaseNote: (reqId: string) => void;
}

export const FSDDocumentViewer: React.FC<FSDDocumentViewerProps> = ({
  onOpenNewRequirement,
  onOpenEvaluation,
  onOpenUAT,
  onOpenReleaseNote,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-10">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <FileText className="w-4 h-4" />
          <span>FUNCTIONAL SPECIFICATION DOCUMENT (FSD) · VERSION 1.0</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          MES 新功能開發管理系統 — 功能規格書 (FSD)
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          正式轉化「需求抽象、溝通落差、進度不透明與驗收失真」等現場痛點為標準化規格。點擊各項右側按鈕可直接跳轉至系統對應之即時運作模組。
        </p>
      </div>

      {/* Section 1: Module List */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          1. 系統模組與功能清單 (Module List)
        </h2>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">模組名稱</th>
                <th className="py-3 px-3 font-mono">功能 ID</th>
                <th className="py-3 px-4">功能名稱</th>
                <th className="py-3 px-4">使用者角色</th>
                <th className="py-3 px-4">規格說明</th>
                <th className="py-3 px-4 text-center">實作對照</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {/* REQ-01 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  需求管理模組
                </td>
                <td className="py-3.5 px-3 font-mono text-cyan-400 font-bold">
                  REQ-01
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  結構化需求單建立
                </td>
                <td className="py-3.5 px-4 text-slate-400">需求單位</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  透過必填欄位引導使用者提交完整需求與預期效益。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={onOpenNewRequirement}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded cursor-pointer transition-colors"
                  >
                    開啟建立表單
                  </button>
                </td>
              </tr>

              {/* REQ-02 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  需求管理模組
                </td>
                <td className="py-3.5 px-3 font-mono text-cyan-400 font-bold">
                  REQ-02
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  需求預覽與原型關聯
                </td>
                <td className="py-3.5 px-4 text-slate-400">需求單位, SA</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  支持上傳 Wireframe / Mockup，建立直觀規格體驗。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={onOpenNewRequirement}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                  >
                    原型檢視視角
                  </button>
                </td>
              </tr>

              {/* DEV-01 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  評估與派工模組
                </td>
                <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">
                  DEV-01
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  系統影響與時程評估
                </td>
                <td className="py-3.5 px-4 text-slate-400">SA, 工程師</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  記錄技術可行性、影響模組、預估工時與預計上線日。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onOpenEvaluation('REQ-2026-003')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded cursor-pointer transition-colors"
                  >
                    執行評估介面
                  </button>
                </td>
              </tr>

              {/* DEV-02 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  評估與派工模組
                </td>
                <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">
                  DEV-02
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  開發任務派工管理
                </td>
                <td className="py-3.5 px-4 text-slate-400">IT 主管, PM</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  支援 Scrum/Kanban 模式，指派工程師與 QA 負責人。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onOpenEvaluation('REQ-2026-002')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                  >
                    派工設定
                  </button>
                </td>
              </tr>

              {/* TRK-01 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  追蹤與通知模組
                </td>
                <td className="py-3.5 px-3 font-mono text-cyan-400 font-bold">
                  TRK-01
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  進度看板與透明化
                </td>
                <td className="py-3.5 px-4 text-slate-400">全體角色</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  即時顯示需求狀態（待處理、開發中、UAT 中、已上線）。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[11px] text-cyan-400 font-medium">
                    即首頁看板
                  </span>
                </td>
              </tr>

              {/* TRK-02 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  追蹤與通知模組
                </td>
                <td className="py-3.5 px-3 font-mono text-cyan-400 font-bold">
                  TRK-02
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  自動化狀態通知
                </td>
                <td className="py-3.5 px-4 text-slate-400">全體角色</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  狀態變更時自動發送 Email / Teams / LINE 訊息給相關人員。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[11px] text-slate-400">
                    自動即時觸發
                  </span>
                </td>
              </tr>

              {/* UAT-01 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  驗收與部署模組
                </td>
                <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">
                  UAT-01
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  UAT 驗收清單管理
                </td>
                <td className="py-3.5 px-4 text-slate-400">QA, 需求單位</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  開發前訂定 Acceptance Criteria，提供單鍵驗收簽核。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onOpenUAT('REQ-2026-001')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded cursor-pointer transition-colors"
                  >
                    開啟驗收簽核
                  </button>
                </td>
              </tr>

              {/* UAT-02 */}
              <tr className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  驗收與部署模組
                </td>
                <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">
                  UAT-02
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  版本公告與操作手冊
                </td>
                <td className="py-3.5 px-4 text-slate-400">使用者, IT</td>
                <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                  上線時自動派發 Release Note 與操作懶人包連結。
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onOpenReleaseNote('REQ-2026-004')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
                  >
                    查看發布手冊
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Feature Details & Business Logic */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          2. 核心功能規格明細與業務邏輯落實
        </h2>

        {/* Feature Detail 1: REQ-01 */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                REQ-01
              </span>
              <span>結構化需求單建立</span>
            </h3>
            <span className="text-slate-500 font-mono">Status: Production Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="space-y-2">
              <div className="font-semibold text-slate-200">
                輸入欄位 (Input Fields)：
              </div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                <li>
                  <strong className="text-slate-200">需求名稱：</strong>文字輸入（必填）
                </li>
                <li>
                  <strong className="text-slate-200">申請部門 / 申請人：</strong>
                  系統自動帶入當前登入者（必填）
                </li>
                <li>
                  <strong className="text-slate-200">現況痛點 (As-Is)：</strong>
                  多行文字（必填，附帶引導語與 AI 量化轉化）
                </li>
                <li>
                  <strong className="text-slate-200">期望功能 (To-Be)：</strong>
                  多行文字（必填，附帶引導語與 AI 規格擴充）
                </li>
                <li>
                  <strong className="text-slate-200">預期效益：</strong>
                  選單（節省工時 / 降低錯報率 / 提升產能）+ 效益說明（必填）
                </li>
                <li>
                  <strong className="text-slate-200">急迫性 / 優先級：</strong>
                  下拉選單（高 / 中 / 低）（必填）
                </li>
                <li>
                  <strong className="text-slate-200">附件上傳：</strong>支援圖片
                  (PNG/JPG)、Excel、PDF（選填）
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-200">
                業務邏輯 (Business Logic)：
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    表單提交後，狀態自動變更為{' '}
                    <strong className="text-cyan-400">[待 SA 評估]</strong>
                    ，並自動發送 TRK-02 通知給負責的 SA。
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    若必填欄位未填寫完全，系統立即阻擋提交並呈現紅框明確提示。
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>AI 擴充：</strong>點擊「AI
                    需求結構化輔助」可由 Gemini 模型智能將口語痛點轉為具體 MES
                    邊界規格。
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Detail 2: TRK-01 */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <span className="font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                TRK-01
              </span>
              <span>進度看板與透明化</span>
            </h3>
            <span className="text-slate-500 font-mono">Status: Production Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="space-y-2">
              <div className="font-semibold text-slate-200">
                介面規格 (UI Specification)：
              </div>
              <p className="text-slate-400">
                提供完整的 Kanban 看板流動檢視，欄位涵蓋：
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                [草稿] ➔ [待評估] ➔ [開發中] ➔ [UAT 驗收中] ➔ [已上線]
              </div>
              <p className="text-slate-400 text-[11px]">
                卡片完整標示需求名稱、申請人、預計完成日、卡點負責人與影響模組。
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-200">
                業務邏輯 (Business Logic)：
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>部門權限過濾：</strong>需求單位僅能查看「本部門提交的需求」，IT
                    團隊與主管可查看「全廠區需求」。
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>AI 擴充介面：</strong>根據模組影響數與歷史工時數據，自動計算並預估卡片的「預計完成天數」與風險評估。
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Detail 3: UAT-01 */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span className="font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                UAT-01
              </span>
              <span>UAT 驗收清單管理與簽核</span>
            </h3>
            <span className="text-slate-500 font-mono">Status: Production Ready</span>
          </div>

          <div className="space-y-3 text-slate-300">
            <p className="text-slate-400 leading-relaxed">
              在需求進入 <code className="text-cyan-400">[開發中]</code>{' '}
              狀態前，SA 與需求單位共同訂定 Acceptance Criteria。驗收項目包含：
              <strong>測試情境、預期結果、驗收結果 (Pass/Fail)、備註</strong>。
            </p>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 font-semibold">
              嚴格簽核邏輯：只有當所有 UAT 項目皆為 Pass
              且需求單位/QA完成電子簽核後，系統才允許將狀態轉為 [可部署上線]。
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Non-Functional Requirements */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          3. 非功能性需求 (Non-Functional Requirements) 驗證
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>安全性與權限管制 (Security)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              依據現場作業員/生管、SA、工程師、主管與 QA 嚴格劃分資料讀寫權限，提供頂部模擬切換工具，即時驗證部門資料隔離。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>效能需求 (Performance)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              看板載入時間 &lt; 0.2 秒（目標 &lt; 2 秒），狀態變更更新與推播通知於 3 秒內完成，保證產線高頻操作流暢。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>系統整合 (Integration)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              支援 Teams、Email、LINE 自動通知推播日誌紀錄，並結合 Google GenAI 現代化 SDK 提供多項智能預估與生成工具。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
