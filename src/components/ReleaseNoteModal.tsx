import React, { useState } from 'react';
import { MESRequirement, ReleaseNote } from '../types';
import {
  X,
  Sparkles,
  BookOpen,
  Share2,
  Copy,
  Check,
  Download,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import sopInstructionCard from '../assets/images/mes_sop_instruction_card_1793073274392.jpg';

interface ReleaseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: MESRequirement | null;
  onSendNotification?: (channel: 'Teams' | 'Email' | 'LINE') => void;
}

export const ReleaseNoteModal: React.FC<ReleaseNoteModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onSendNotification,
}) => {
  if (!isOpen || !requirement) return null;

  const [copied, setCopied] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [releaseData, setReleaseData] = useState<ReleaseNote>(
    requirement.releaseNote || {
      version: 'v2.4.0',
      releaseDate: new Date().toISOString().split('T')[0],
      headline: `MES 產線功能更新公告：${requirement.title}`,
      overview: `為優化 ${requirement.department} 作業流程，解決過去人工作業痛點，本次更新正式納入系統標準作業機制。`,
      highlights: [
        '提升現場條碼掃描與自動校驗速度',
        '降低人工作業失誤與資料重工率',
        '與 MES 核心資料庫達成秒級同步',
      ],
      sopGuide: [
        '步驟 1：開啟機台站台 MES 介面，進入新模組頁籤',
        '步驟 2：使用掃描槍讀取工單與料件條碼',
        '步驟 3：確認無誤後點擊執行，系統自動完成扣帳並亮起綠燈',
      ],
      precautions: '如遇讀取不良或系統未響應，請聯繫分機 8800 IT 專線。',
    }
  );

  const [notificationSent, setNotificationSent] = useState<string | null>(null);

  const handleCopy = () => {
    const text = `# 【MES 版本上線公告】${releaseData.headline} (${releaseData.version})
發布日期：${releaseData.releaseDate}
適用單位：${requirement.department}

## 版本更新概述
${releaseData.overview}

## 關鍵革新亮點
${releaseData.highlights.map((h) => `- ${h}`).join('\n')}

## 產線操作懶人包 (Quick SOP Guide)
${releaseData.sopGuide.map((s) => `${s}`).join('\n')}

## 注意事項與異常通報
${releaseData.precautions}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `# 【MES 版本上線公告】${releaseData.headline} (${releaseData.version})
發布日期：${releaseData.releaseDate}
需求單號：${requirement.id}
適用單位：${requirement.department}

## 1. 版本更新概述
${releaseData.overview}

## 2. 關鍵革新亮點
${releaseData.highlights.map((h) => `- ${h}`).join('\n')}

## 3. 產線操作懶人包 (Quick SOP Guide)
${releaseData.sopGuide.map((s) => `${s}`).join('\n')}

## 4. 異常處置與注意事項
${releaseData.precautions}
`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MES_ReleaseNote_${releaseData.version}_${requirement.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiRegenerate = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-release-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: requirement.title,
          version: releaseData.version,
          department: requirement.department,
          toBe: requirement.toBe,
          benefits: requirement.benefitDescription,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReleaseData(data);
          return;
        }
      }
      throw new Error('API unavailable on static hosting');
    } catch (err) {
      setReleaseData({
        version: releaseData.version || 'v2.4.1',
        releaseDate: new Date().toISOString().split('T')[0],
        headline: `MES 產線升級公告：${requirement.title} 正式上線`,
        overview: `本版本旨在全面優化 ${requirement.department || '產線作業'} 之作業效率，解決過去人工作業痛點，提供更流暢且具備自動防呆之作業體驗。`,
        highlights: [
          '新增一鍵防呆驗證，降低人工作業失誤',
          '全面優化系統響應速度至 1 秒以內',
          '與既有 ERP / 工單系統達成無縫即時連動'
        ],
        sopGuide: [
          '步驟 1：開啟 MES 站台主畫面，點選左側選單進入「新功能模組」',
          '步驟 2：掃描工單或批次條碼，系統自動帶出料件明細與規範',
          '步驟 3：確認無誤後點擊「確認執行」，系統即時完成扣帳與上傳'
        ],
        precautions: '如遇條碼模糊或機台連線異常，請聯繫生管分機 8821 或 IT 專線 8800 進行手動調校。'
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const triggerDispatch = (channel: 'Teams' | 'Email' | 'LINE') => {
    if (onSendNotification) {
      onSendNotification(channel);
    }
    setNotificationSent(`已透過 ${channel} 自動推播至全廠區群組`);
    setTimeout(() => setNotificationSent(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              UAT-02
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                版本公告與操作手冊 (Release Note & SOP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {requirement.id} · {releaseData.version} · {releaseData.releaseDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiRegenerate}
              disabled={isAiGenerating}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-700/60 rounded-lg hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {isAiGenerating ? 'AI 生成中...' : 'AI 智能重構公告文案'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {notificationSent && (
            <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-500/40 text-xs text-cyan-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <span>{notificationSent}</span>
            </div>
          )}

          {/* Announcement banner card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  OFFICIAL RELEASE
                </span>
                <span>{releaseData.version}</span>
                <span>·</span>
                <span>{releaseData.releaseDate}</span>
                <span>·</span>
                <span className="text-cyan-400">{requirement.department}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              {releaseData.headline}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {releaseData.overview}
            </p>
          </div>

          {/* Highlights & SOP in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Highlights */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>關鍵革新與亮點 (Highlights)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {releaseData.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold font-mono">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Precautions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>產線注意事項與異常窗口</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {releaseData.precautions}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                IT 服務台熱線：分機 8800 · 生管調度專線：分機 8821
              </div>
            </div>
          </div>

          {/* Quick SOP Guide */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>產線操作懶人包 (Quick SOP Guide)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                適用於現場終端觸控站台
              </span>
            </div>

            {/* SOP Steps */}
            <div className="space-y-2.5">
              {releaseData.sopGuide.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-mono font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-slate-200 leading-relaxed font-medium pt-0.5">
                    {step}
                  </div>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="rounded-lg overflow-hidden border border-slate-800 pt-2">
              <div className="text-[11px] text-slate-400 px-3 py-1 font-mono">
                現場操作視覺化指南 (Visual SOP Illustration)
              </div>
              <img
                src={sopInstructionCard}
                alt="MES SOP Diagram"
                className="w-full h-auto max-h-[280px] object-cover bg-slate-950"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          {/* TRK-02 Automated Notification Trigger buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">TRK-02 自動派發：</span>
            <button
              onClick={() => triggerDispatch('Teams')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3 text-cyan-400" />
              Teams 推播
            </button>
            <button
              onClick={() => triggerDispatch('Email')}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3 text-emerald-400" />
              Email 派發
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  已複製公告
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  複製公告文字
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              下載 Markdown
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-sm shadow-cyan-950"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
