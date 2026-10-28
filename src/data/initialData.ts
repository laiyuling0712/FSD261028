import { MESRequirement, UserProfile, NotificationLog } from '../types';
import wireframeTouchscreen from '../assets/images/mes_wireframe_touchscreen_1793073274076.jpg';
import sopInstructionCard from '../assets/images/mes_sop_instruction_card_1793073274392.jpg';

export const SYSTEM_USERS: UserProfile[] = [
  {
    id: 'user_req_1',
    name: '林曉芬 (生管主任)',
    role: 'requester',
    roleName: '需求單位 / 生管製造',
    department: '製造一部 (SMT)',
    avatarInitials: '曉芬',
  },
  {
    id: 'user_req_2',
    name: '王宏志 (車間組長)',
    role: 'requester',
    roleName: '需求單位 / 現場作業',
    department: '製造二部 (CNC)',
    avatarInitials: '宏志',
  },
  {
    id: 'user_sa_1',
    name: '陳建宏 (資深 SA)',
    role: 'sa',
    roleName: '系統分析師 (SA)',
    department: '資訊研發處 / MES小組',
    avatarInitials: '建宏',
  },
  {
    id: 'user_eng_1',
    name: '張瑋庭 (資深架構工程師)',
    role: 'engineer',
    roleName: 'MES 開發工程師',
    department: '資訊研發處 / MES小組',
    avatarInitials: '瑋庭',
  },
  {
    id: 'user_pm_1',
    name: '黃志銘 (IT 部門主管 / PM)',
    role: 'pm',
    roleName: 'IT 主管 / PM',
    department: '資訊管理處',
    avatarInitials: '志銘',
  },
  {
    id: 'user_qa_1',
    name: '李冠宇 (品保驗收專員)',
    role: 'qa',
    roleName: 'QA 品保驗收負責人',
    department: '品質保證部',
    avatarInitials: '冠宇',
  },
];

export const MES_MODULES = [
  '工單調度 (Dispatch)',
  '物料扣帳 (BOM Deduct)',
  '設備連線 (SECS/GEM)',
  '報表看板 (BI/OEE)',
  '品質管制 (QMS/SPC)',
  '倉儲物流 (WMS/AGV)',
  '製程防呆 (Poka-Yoke)',
];

export const INITIAL_REQUIREMENTS: MESRequirement[] = [
  {
    id: 'REQ-2026-001',
    title: 'SMT 產線物料批號防呆校驗功能',
    department: '製造一部 (SMT)',
    requesterName: '林曉芬 (生管主任)',
    asIs: '現場作業員於上料時，需人工逐一核對料捲上的二維條碼與工單紙本 BOM 表。因批號料件長度高達 24 碼且字型細小，常發生誤上相近料號事件，導致整批 PCB 重工，每次重工損失約 2.5 小時與額外報廢成本。',
    toBe: '於 MES 站台操作介面新增物料批號防呆校驗模組。作業員使用工業條碼槍掃描工單及料捲條碼後，系統需在 0.5 秒內比對 ERP BOM 與效期，綠燈通過方可啟動供料機；若料號不符或過期即時閃爍紅燈警告並鎖死上料機構。',
    benefitCategory: 'lower_defect',
    benefitDescription: '預估消除 100% 混料誤上問題，每月降低 SMT 重工工時約 40 小時，不良重工率下降 95%。',
    priority: 'high',
    attachments: [
      { id: 'att-1', name: 'SMT_上料混料異常統計表.xlsx', size: '1.4 MB', type: 'excel' },
      { id: 'att-2', name: '產線條碼格式規範書_v3.pdf', size: '820 KB', type: 'pdf' },
    ],
    wireframeUrl: wireframeTouchscreen,
    wireframeAnnotations: [
      { id: 'ann-1', x: 30, y: 45, label: '條碼輸入框', description: '支援工業 USB 條碼槍自動輸入並觸發校驗' },
      { id: 'ann-2', x: 70, y: 28, label: '批號比對燈號', description: '綠燈 Pass / 紅燈鎖定並發出 85dB 警示音' },
      { id: 'ann-3', x: 65, y: 60, label: 'BOM 即時核對表', description: '顯示工單料件清單與目前已掃描狀態' },
    ],
    status: 'uat',
    createdAt: '2026-10-18',
    updatedAt: '2026-10-25',
    currentBlocker: '等待製造一部林主任進行最終電子驗收簽核',
    blockerOwner: '林曉芬 (生管主任)',
    technicalFeasibility: '可行。利用既有 MES Station 觸控終端與 WebSocket 廣播通訊，呼叫後端料號快取字典進行微秒級驗證。',
    affectedModules: ['物料扣帳 (BOM Deduct)', '製程防呆 (Poka-Yoke)', '設備連線 (SECS/GEM)'],
    estimatedHours: 48,
    estimatedDays: 6,
    aiEstimatedDays: 6,
    aiConfidence: '92%',
    targetReleaseDate: '2026-10-30',
    assignedEngineer: '張瑋庭 (資深架構工程師)',
    assignedQA: '李冠宇 (品保驗收專員)',
    sprint: 'Sprint 2026-S10',
    scrumMode: 'Scrum',
    acceptanceCriteria: [
      {
        id: 'tc-1',
        scenario: '作業員掃描與工單 BOM 完全一致之合格料捲條碼',
        expectedResult: '系統於 0.3 秒內顯示綠色【BATCH VERIFICATION SUCCESSFUL】，供料機解除鎖定',
        result: 'Pass',
        note: 'Happy path 驗證無誤'
      },
      {
        id: 'tc-2',
        scenario: '作業員刻意掃描規格不符或效期已過之測試料捲條碼',
        expectedResult: '畫面顯示紅色警戒訊息，蜂鳴器響鳴，供料機鎖定且無法繼續投料',
        result: 'Pass',
        note: '防呆阻斷實機驗證通過'
      },
      {
        id: 'tc-3',
        scenario: '同一工單重複掃描相同料捲唯一碼 (Serial Number)',
        expectedResult: '系統阻擋重複進料，提示「該料捲已於本工單過帳」，防止重覆扣帳',
        result: 'Pass',
        note: '防重複機制通過'
      },
      {
        id: 'tc-4',
        scenario: '現場區域網路短暫中斷 10 秒後恢復',
        expectedResult: '本地站台暫存掃描紀錄，待連線復原後自動同步至雲端 MES 不掉單',
        result: 'Pass',
        note: '離線容錯測試通過'
      }
    ],
    uatSignature: {
      isSigned: true,
      signedBy: '李冠宇 (品保驗收專員)',
      signedRole: 'QA 品保驗收負責人',
      signedDate: '2026-10-26 14:30',
      hashDigest: 'SHA256:8f9b2c3d4e5a6f7b8c9d0e1f2a3b4c5d6e7f8a9b'
    },
    releaseNote: {
      version: 'v2.4.1',
      releaseDate: '2026-10-30',
      headline: 'MES SMT 產線物料批號防呆校驗功能正式釋出',
      overview: '本次升級將 SMT 上料流程全面導入條碼自動核對防呆機制，徹底杜絕錯料誤打問題，大幅提升投產精確度與產線稼動率。',
      highlights: [
        '即時 0.3 秒條碼比對與雙重防呆鎖定',
        '整合現場聲光警報與觸控終端即時 BOM 視圖',
        '斷網本地容錯離線快取機制'
      ],
      sopGuide: [
        '步驟 1：產線操作員於 MES 站台點選「SMT 上料檢核」進入畫面',
        '步驟 2：使用掃描槍讀取工單條碼，系統自動載入對應料表',
        '步驟 3：逐一掃描各料捲二維條碼，綠燈即自動入料，若遇紅燈請即刻暫停並通報班長'
      ],
      precautions: '若二維條碼受污損無法讀取，需經由現場工程師刷卡複驗後方可進行人工特殊放行。'
    }
  },
  {
    id: 'REQ-2026-002',
    title: 'CNC 車間工單自動報工與 OEE 稼動率即時計算',
    department: '製造二部 (CNC)',
    requesterName: '王宏志 (車間組長)',
    asIs: 'CNC 機台加工完成後，班長需在紙本流轉卡手寫生產數量、換模時間與調機工時，每日下班前再由助理花費 1.5 小時集中鍵入舊版系統，導致稼動率 (OEE) 數據延遲 24 小時以上，管理層無法即時掌握停機瓶頸。',
    toBe: '透過 PLC / OPC-UA 直接自機台控制器讀取主軸轉速、加工週期與良品/NG 計數，結合 MES 工單自動觸發報工。即時計算可用率 (A)、表現率 (P)、品質率 (Q)，並推播戰情看板。',
    benefitCategory: 'save_hours',
    benefitDescription: '每日節省人工抄寫與輸入工時 90 分鐘，OEE 計算即時化由 T+1 日縮短至 5 秒內，能及時排除刀具異常停機。',
    priority: 'high',
    attachments: [
      { id: 'att-3', name: 'Fanuc_CNC_PLC暫存器對照表.pdf', size: '2.1 MB', type: 'pdf' },
    ],
    status: 'developing',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-24',
    currentBlocker: 'OPC-UA 網路防火牆 Port 4840 跨廠區網段設定中',
    blockerOwner: '張瑋庭 (資深架構工程師)',
    technicalFeasibility: '可行。採用 Edge Gateway 進行協議轉換，透過 MQTT 傳送時間序列數據至 MES 報表引擎。',
    affectedModules: ['工單調度 (Dispatch)', '設備連線 (SECS/GEM)', '報表看板 (BI/OEE)'],
    estimatedHours: 80,
    estimatedDays: 10,
    aiEstimatedDays: 10,
    aiConfidence: '89%',
    targetReleaseDate: '2026-11-08',
    assignedEngineer: '張瑋庭 (資深架構工程師)',
    assignedQA: '李冠宇 (品保驗收專員)',
    sprint: 'Sprint 2026-S11',
    scrumMode: 'Scrum',
    acceptanceCriteria: [
      {
        id: 'tc-201',
        scenario: '機台主軸啟動並完成一個加工週期 (Cycle Time)',
        expectedResult: 'MES 工單已完成良品數自動 +1，無需任何人工按鍵',
        result: 'Pass',
        note: '機台連動已完成驗證'
      },
      {
        id: 'tc-202',
        scenario: '機台發生主軸過載警報 (Alarm E-04) 停機',
        expectedResult: '戰情看板 3 秒內將該機台標記為黃燈停機，並計入未計畫停機時間',
        result: 'Pending',
        note: '待現場機台測試'
      },
      {
        id: 'tc-203',
        scenario: '工單換線切換不同料號',
        expectedResult: '自動觸發換模時間記錄，換線確認後重新計算表現率',
        result: 'Pending',
        note: '邏輯待串接'
      }
    ]
  },
  {
    id: 'REQ-2026-003',
    title: 'AOI 光學檢測即時警報與 NG 品返工流程',
    department: '品質保證部',
    requesterName: '李冠宇 (品保驗收專員)',
    asIs: 'AOI 檢驗站發現不良品 (NG) 時，僅於機台端閃燈，品管需徒步走至產線標註黃標。若連續出現 3 片以上相同焊點空焊，常延誤至生產了 20 片後才發現回焊爐溫異常。',
    toBe: 'AOI 檢驗站判定 NG 時，自動將不良影像與缺陷座標 (Defect Map) 上傳至 MES，若同一製程連續 3 片同位置異常即觸發產線停線訊號，並自動生成返工維修工單。',
    benefitCategory: 'lower_defect',
    benefitDescription: '減少連續批次性不良損失，避免不良擴大，估計每年節省材料報廢損失逾 120 萬元。',
    priority: 'high',
    attachments: [
      { id: 'att-4', name: 'AOI_連續不良處置SOP.docx', size: '420 KB', type: 'doc' },
    ],
    status: 'evaluating',
    createdAt: '2026-10-22',
    updatedAt: '2026-10-23',
    currentBlocker: '待 SA 評估與 AOI 廠商 API 規格對接相容性',
    blockerOwner: '陳建宏 (資深 SA)',
    affectedModules: ['品質管制 (QMS/SPC)', '工單調度 (Dispatch)', '製程防呆 (Poka-Yoke)'],
    acceptanceCriteria: [
      {
        id: 'tc-301',
        scenario: 'AOI 產生不良時將 defect code 寫入 MES',
        expectedResult: 'MES 在 1 秒內接收並將工單不良品數累加，並產生返工序號',
        result: 'Pending',
        note: '初期評估情境'
      }
    ]
  },
  {
    id: 'REQ-2026-004',
    title: '倉儲 AGV 叫料自動派車與電子看板連動',
    department: '製造一部 (SMT)',
    requesterName: '林曉芬 (生管主任)',
    asIs: '產線站點缺料時，生管需撥打電話至立體倉儲，倉管員抄寫後人工推車送料，平均等待送達時間 35 分鐘，常發生機台斷料待人情況。',
    toBe: '於站台螢幕增加「一鍵叫料」按鈕，MES 判斷物料安全庫存自動向 WMS 與 AGV 車隊管理系統發送任務，派車自動導引至指定機台停靠點，看板顯示車輛剩餘距離與預計到達時間。',
    benefitCategory: 'boost_capacity',
    benefitDescription: '將平均送料等待時間由 35 分鐘降至 8 分鐘以內，機台因缺料停機時間下降 78%，產能稼動顯著提升。',
    priority: 'medium',
    attachments: [
      { id: 'att-5', name: 'AGV_調度通訊協定規範.pdf', size: '1.8 MB', type: 'pdf' },
    ],
    wireframeUrl: sopInstructionCard,
    status: 'deployed',
    createdAt: '2026-09-20',
    updatedAt: '2026-10-15',
    technicalFeasibility: '可行，已透過 RESTful API 與 AGV 派車系統介接完成。',
    affectedModules: ['倉儲物流 (WMS/AGV)', '工單調度 (Dispatch)'],
    estimatedHours: 64,
    estimatedDays: 8,
    aiEstimatedDays: 8,
    aiConfidence: '95%',
    targetReleaseDate: '2026-10-15',
    assignedEngineer: '張瑋庭 (資深架構工程師)',
    assignedQA: '李冠宇 (品保驗收專員)',
    sprint: 'Sprint 2026-S08',
    scrumMode: 'Kanban',
    acceptanceCriteria: [
      {
        id: 'tc-401',
        scenario: '站點按下叫料按鈕',
        expectedResult: 'WMS 立即備料且 AGV 接受派工，5 秒內看板更新任務狀態',
        result: 'Pass',
        note: '驗收通過'
      },
      {
        id: 'tc-402',
        scenario: 'AGV 抵達指定機台停車格',
        expectedResult: '光電感測器觸發站點放料確認，MES 庫存自動完成站別移轉',
        result: 'Pass',
        note: '驗收通過'
      }
    ],
    uatSignature: {
      isSigned: true,
      signedBy: '林曉芬 (生管主任)',
      signedRole: '製造部生管代表',
      signedDate: '2026-10-14 16:20',
      hashDigest: 'SHA256:4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b'
    },
    releaseNote: {
      version: 'v2.3.0',
      releaseDate: '2026-10-15',
      headline: 'MES AGV 無人搬運叫料自動派車系統正式上線公告',
      overview: '為解決產線頻繁電話催料與人工推車等待問題，全面開通站台一鍵叫料與 AGV 自動巡航配送，打造現代化智慧工廠物流。',
      highlights: [
        '產線站台 1-Click 智能叫料，完全免打電話催料',
        'AGV 派車調度系統毫秒級即時連線與動態路徑導航',
        '站點物料移轉自動記帳，即時維持安全庫存水位'
      ],
      sopGuide: [
        '步驟 1：產線操作員於機台終端點選「物料叫修/叫料」頁籤',
        '步驟 2：確認需求料號與批次數量，點擊「確認發送派車」',
        '步驟 3：待 AGV 抵達機台燈號提示，取料後刷卡完成簽收'
      ],
      precautions: 'AGV 行駛通道嚴禁堆放雜物；若遇緊急情況可按壓 AGV 車體前後紅色急停按鈕。'
    }
  },
  {
    id: 'REQ-2026-005',
    title: '潔淨室溫濕度環境監測異動即時警報',
    department: '製造二部 (CNC)',
    requesterName: '王宏志 (車間組長)',
    asIs: '目前無塵室環境溫濕度由警衛每 4 小時巡檢抄表記錄，若冷卻水塔短暫跳機造成濕度上升超過 65%，往往要數小時後才被發現，可能導致微塵粒子附著不良。',
    toBe: '於潔淨室部署 Modbus 溫濕度感知器，每分鐘採樣一次數據寫入 MES 環境監控庫。超出規範閥值（溫度 > 24°C 或 濕度 > 60%）持續超過 5 分鐘時，自動發送 Teams 告警與站台紅燈警示。',
    benefitCategory: 'lower_defect',
    benefitDescription: '實現 24 小時無死角自動環控監測，杜絕環境跳變造成的製程不良風險，省去巡檢人力。',
    priority: 'low',
    attachments: [],
    status: 'draft',
    createdAt: '2026-10-26',
    updatedAt: '2026-10-26',
    currentBlocker: '草稿階段，等待申請單位確認感測器規格後正式提交評估',
    blockerOwner: '王宏志 (車間組長)',
    affectedModules: ['設備連線 (SECS/GEM)', '報表看板 (BI/OEE)'],
    acceptanceCriteria: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1',
    timestamp: '2026-10-26 14:31',
    reqId: 'REQ-2026-001',
    reqTitle: 'SMT 產線物料批號防呆校驗功能',
    fromStatus: 'developing',
    toStatus: 'uat',
    channel: 'Teams',
    recipients: ['林曉芬 (生管主任)', '李冠宇 (品保驗收專員)'],
    message: '【MES 開發通報】需求單 REQ-2026-001 已完成工程師開發與單元測試，進入 [UAT 驗收中] 階段。請品保與生管代表進行驗收簽核。'
  },
  {
    id: 'notif-2',
    timestamp: '2026-10-24 09:15',
    reqId: 'REQ-2026-002',
    reqTitle: 'CNC 車間工單自動報工與 OEE 稼動率即時計算',
    fromStatus: 'evaluating',
    toStatus: 'developing',
    channel: 'Email',
    recipients: ['張瑋庭 (資深架構工程師)', '王宏志 (車間組長)'],
    message: '【MES 派工通知】需求單 REQ-2026-002 系統分析與工時評估已核准（預估 10 天），已分派至 Sprint 2026-S11 進入 [開發中]。'
  },
  {
    id: 'notif-3',
    timestamp: '2026-10-15 17:00',
    reqId: 'REQ-2026-004',
    reqTitle: '倉儲 AGV 叫料自動派車與電子看板連動',
    fromStatus: 'uat',
    toStatus: 'deployed',
    channel: 'Teams',
    recipients: ['全廠區生管及產線作業群組', 'IT 運維團隊'],
    message: '【MES 上線公告】需求單 REQ-2026-004 已通過 UAT 驗收並成功部署上線 (v2.3.0)！已派發 Release Note 與操作懶人包。'
  }
];
