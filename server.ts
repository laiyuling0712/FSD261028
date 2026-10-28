import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) || 3000 : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Cloud Run
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Serve assets directory in both dev and production
const assetsPath = path.resolve(__dirname, 'src/assets');
if (fs.existsSync(assetsPath)) {
  app.use('/src/assets', express.static(assetsPath));
}

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Endpoint: As-Is / To-Be 需求結構化與優化
app.post('/api/ai/refine-requirement', async (req: Request, res: Response) => {
  try {
    const { title, department, asIs, toBe, benefitCategory } = req.body;
    
    if (!ai) {
      // Fallback domain-accurate simulation if key is not active
      return res.json({
        success: true,
        refinedAsIs: `【現狀痛點結構化】\n現行${department || '現場'}於作業時，${asIs || '現行流程採紙本或人工手動記錄'}。由於缺乏系統防呆與即時驗證，容易產生資料延遲登錄、跨班交接落差與高達 3.5% 之人工二次校對負擔。`,
        refinedToBe: `【期望規格結構化】\n於 MES 系統新增${title || '功能'}。${toBe || '提供條碼掃描防呆校驗、即時連動工單狀態，並在異常時鎖定下製程進入報警處理'}。介面需支援觸控條碼機作業，響應時間 < 1 秒。`,
        suggestedBenefits: `1. 預估節省現場人員每日資料核對工時約 45~60 分鐘\n2. 製程錯報與批號混料異常率預期降低 85% 以上\n3. 工單報工履歷 100% 電子化與稽核溯源`,
        suggestedCriteria: [
          { scenario: '現場作業員掃描物料條碼時批號與工單 BOM 相符', expectedResult: '系統綠燈通過，自動扣減庫存並跳轉至下一步驟', result: 'Pass', note: '預設標準流程' },
          { scenario: '作業員誤掃不同規格之已過期或非指定批號料件', expectedResult: '系統跳出紅燈警告聲響並鎖定製程，不可繼續操作', result: 'Pending', note: '防呆關鍵項' },
          { scenario: '產線離線或網路瞬斷時暫存資料於邊緣站台', expectedResult: '網路恢復後 5 秒內自動補上傳且不遺失資料', result: 'Pending', note: '邊緣可靠度' }
        ]
      });
    }

    const prompt = `你是一位資深半導體與高科技製造業 MES (Manufacturing Execution System) 系統架構師與 SA。
請針對以下需求單草案進行專業結構化轉化，解決「需求抽象、溝通落差」的痛點。

【需求名稱】：${title}
【申請部門】：${department}
【原始現況痛點 (As-Is)】：${asIs}
【原始期望功能 (To-Be)】：${toBe}
【預期效益類別】：${benefitCategory}

請以繁體中文輸出 JSON 格式（包含 refinedAsIs, refinedToBe, suggestedBenefits, suggestedCriteria 四個欄位）：
- refinedAsIs: 專業、條理分明的痛點描述（包含量化影響）
- refinedToBe: 具體、無歧義的系統規格期望（包含邊界條件與介面要求）
- suggestedBenefits: 量化預期效益說明（例：節省工時、降低錯報率、產能稼動提升）
- suggestedCriteria: 3~4 個具體 Acceptance Criteria 測試情境陣列，格式為 [{ "scenario": "測試情境", "expectedResult": "預期結果", "result": "Pending", "note": "驗收要點" }]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('AI Refine error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Endpoint: 根據影響模組與歷程預估工時與風險 (TRK-01 AI 擴充)
app.post('/api/ai/estimate-effort', async (req: Request, res: Response) => {
  try {
    const { title, affectedModules, complexity, asIs, toBe } = req.body;
    
    if (!ai) {
      const moduleCount = (affectedModules || []).length || 2;
      const baseDays = complexity === 'high' ? 14 : complexity === 'medium' ? 8 : 4;
      const estimatedDays = baseDays + moduleCount * 2;
      return res.json({
        success: true,
        estimatedDays,
        confidenceLevel: '88%',
        breakdown: [
          { phase: 'SA 系統分析與介面規格凍結', days: Math.max(1, Math.round(estimatedDays * 0.2)) },
          { phase: 'MES 核心邏輯與 API 開發', days: Math.max(2, Math.round(estimatedDays * 0.45)) },
          { phase: '產線機台連線 / 邊緣終端測試', days: Math.max(1, Math.round(estimatedDays * 0.2)) },
          { phase: 'UAT 產線陪測與驗收上線', days: Math.max(1, Math.round(estimatedDays * 0.15)) },
        ],
        riskAssessment: `涉及模組【${(affectedModules || ['工單管理', '扣帳模組']).join('、')}】，需注意在停機保養窗口進行資料表遷移與 API 向下相容性。`,
        suggestedQAFocus: '著重在高頻發料掃描時的併發效能與異常斷網重試機制。'
      });
    }

    const prompt = `你是一位 MES 開發技術主管，請依據歷史製造業 MES 專案數據，為此需求預估精確工作天數與工時拆解：
需求名稱：${title}
影響模組：${(affectedModules || []).join(', ')}
技術複雜度：${complexity}
需求內容：${asIs} -> ${toBe}

請以繁體中文輸出 JSON 格式：
{
  "estimatedDays": 數字,
  "confidenceLevel": "90%",
  "breakdown": [
    { "phase": "階段名稱", "days": 數字 }
  ],
  "riskAssessment": "技術風險與連鎖影響評估 (100字內)",
  "suggestedQAFocus": "QA 驗收重點建議 (60字內)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('AI Estimate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Endpoint: 自動產生 UAT 驗收清單與測試情境 (UAT-01)
app.post('/api/ai/generate-uat', async (req: Request, res: Response) => {
  try {
    const { title, toBe, affectedModules } = req.body;
    
    if (!ai) {
      return res.json({
        success: true,
        criteria: [
          { scenario: '標準流程：現場操作員於正常權限下輸入有效參數並提交', expectedResult: '系統在 0.8 秒內回傳成功並更新狀態，Log 正常寫入', result: 'Pass', note: '正常路徑 (Happy Path)' },
          { scenario: '異常流程：輸入負值、超長字串或特殊符號之例外檢驗', expectedResult: '系統阻擋並跳出清楚之繁體中文提示，不拋出 500 錯誤', result: 'Pending', note: '邊界與型態驗證' },
          { scenario: '併發測試：兩台終端機台同時針對同一工單批次進行異動', expectedResult: '資料庫啟用樂觀鎖 (Optimistic Locking)，防止重複扣帳', result: 'Pending', note: '多站點防衝突' },
          { scenario: '權限管制：非指定班長/工程師角色嘗試強制修改機台配置', expectedResult: '彈出「權限不足」拒絕存取，並留存資安稽核紀錄', result: 'Pending', note: '資安與角色檢核' }
        ]
      });
    }

    const prompt = `你是 MES 品保驗收負責人。請根據功能需求名稱「${title}」、期望功能「${toBe}」、影響模組「${(affectedModules || []).join(', ')}」，設計 4 到 5 個高標準的 UAT Acceptance Criteria 驗收情境。
每個情境必須緊扣製造現場真實操作（包含正常流程、異常防呆、連動扣帳、權限阻擋）。

請以繁體中文輸出 JSON 格式：
{
  "criteria": [
    {
      "scenario": "測試情境詳細步驟",
      "expectedResult": "清楚可量化的預期結果",
      "result": "Pending",
      "note": "驗收檢查重點 (例：正常路徑、邊界條件、異常防呆)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('AI UAT error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Endpoint: 自動派發 Release Note 與操作懶人包 (UAT-02)
app.post('/api/ai/generate-release-note', async (req: Request, res: Response) => {
  try {
    const { title, version, department, toBe, benefits } = req.body;
    
    if (!ai) {
      return res.json({
        success: true,
        version: version || 'v2.4.0',
        releaseDate: new Date().toISOString().split('T')[0],
        headline: `MES 產線升級公告：${title} 正式上線`,
        overview: `本版本旨在全面優化 ${department || '產線作業'} 之作業效率，解決過去人工作業痛點，提供更流暢且具備自動防呆之作業體驗。`,
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
    }

    const prompt = `你是 MES 系統專案經理。該功能已順利通過 UAT 驗收並即將部署上線。
請生成專業且產線人員容易閱讀的「版本發布公告 (Release Note)」與「產線操作懶人包 (Quick SOP Guide)」。

需求標題：${title}
版本編號：${version}
適用單位：${department}
功能說明：${toBe}
預期效益：${benefits}

請以繁體中文輸出 JSON 格式：
{
  "version": "${version}",
  "releaseDate": "${new Date().toISOString().split('T')[0]}",
  "headline": "簡潔有力且具宣導性的公告標題",
  "overview": "版本更新概述 (約 80 字)",
  "highlights": ["3點關鍵革新與亮點"],
  "sopGuide": ["步驟 1...", "步驟 2...", "步驟 3..."],
  "precautions": "產線操作注意事項與緊急聯絡窗口"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('AI Release Note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Production vs Development mode setup
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);
  const isViteDev = process.env.VITE_DEV === 'true';

  // In production (Cloud Run) or whenever dist exists and VITE_DEV is not active, serve static built files
  if (hasDist && !isViteDev) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    // In dev mode (via npm run dev with VITE_DEV=true), mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MES FSD Management Server running at http://0.0.0.0:${port} (mode: ${hasDist && !isViteDev ? 'production' : 'development'})`);
  });
}

startServer();
