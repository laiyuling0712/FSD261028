import React, { useState } from 'react';
import {
  MESRequirement,
  RequirementStatus,
  UserProfile,
  NotificationLog,
} from './types';
import {
  INITIAL_REQUIREMENTS,
  INITIAL_NOTIFICATIONS,
  SYSTEM_USERS,
} from './data/initialData';
import { Header } from './components/Header';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { KanbanBoard } from './components/KanbanBoard';
import { RequirementModal } from './components/RequirementModal';
import { EvaluationDispatchModal } from './components/EvaluationDispatchModal';
import { UATManagementModal } from './components/UATManagementModal';
import { ReleaseNoteModal } from './components/ReleaseNoteModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { FSDDocumentViewer } from './components/FSDDocumentViewer';

export default function App() {
  const [requirements, setRequirements] =
    useState<MESRequirement[]>(INITIAL_REQUIREMENTS);
  const [notifications, setNotifications] =
    useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(SYSTEM_USERS[0]);
  const [activeTab, setActiveTab] = useState<'kanban' | 'fsd' | 'notifications'>('kanban');

  // Modals state
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<MESRequirement | null>(null);

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evaluatingReq, setEvaluatingReq] = useState<MESRequirement | null>(null);

  const [isUATModalOpen, setIsUATModalOpen] = useState(false);
  const [uatReq, setUatReq] = useState<MESRequirement | null>(null);

  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseReq, setReleaseReq] = useState<MESRequirement | null>(null);

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Helper to trigger automated status change notification (TRK-02)
  const triggerStatusNotification = (
    req: MESRequirement,
    fromStatus: RequirementStatus,
    toStatus: RequirementStatus,
    customMsg?: string
  ) => {
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const channel: 'Teams' | 'Email' | 'LINE' =
      toStatus === 'deployed' ? 'Teams' : toStatus === 'developing' ? 'Email' : 'Teams';

    const recipients =
      toStatus === 'evaluating'
        ? ['陳建宏 (資深 SA)', '黃志銘 (IT 主管)']
        : toStatus === 'developing'
        ? [req.assignedEngineer || '張瑋庭 (資深架構工程師)', req.requesterName]
        : toStatus === 'uat'
        ? [req.assignedQA || '李冠宇 (品保驗收專員)', req.requesterName]
        : ['全廠區製造生管群組', 'IT 運維小組'];

    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      timestamp,
      reqId: req.id,
      reqTitle: req.title,
      fromStatus,
      toStatus,
      channel,
      recipients,
      message:
        customMsg ||
        `【MES 狀態通報】需求單 ${req.id}（${req.title}）狀態已由 [${fromStatus}] 變更為 [${toStatus}]。目前卡點負責人：${req.blockerOwner || req.requesterName}。`,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Submit/Update requirement
  const handleSaveRequirement = (req: MESRequirement) => {
    setRequirements((prev) => {
      const exists = prev.some((r) => r.id === req.id);
      if (exists) {
        return prev.map((r) => (r.id === req.id ? req : r));
      } else {
        triggerStatusNotification(
          req,
          'draft',
          req.status,
          `【新需求提報】${req.requesterName} 提交了新需求單 ${req.id}《${req.title}》，已自動轉為 [待 SA 評估] 階段。`
        );
        return [req, ...prev];
      }
    });
  };

  // Move status directly from Kanban
  const handleMoveStatus = (
    req: MESRequirement,
    newStatus: RequirementStatus,
    reason?: string
  ) => {
    const oldStatus = req.status;
    const updated: MESRequirement = {
      ...req,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      currentBlocker:
        newStatus === 'evaluating'
          ? '待 SA 進行系統影響與時程分析'
          : newStatus === 'developing'
          ? `開發中，工程師：${req.assignedEngineer || '張瑋庭'}`
          : newStatus === 'uat'
          ? '進入 UAT 驗收清單核對與簽核'
          : newStatus === 'deployed'
          ? '已順利上線，派發 Release Note'
          : '草稿階段',
    };

    setRequirements((prev) =>
      prev.map((r) => (r.id === req.id ? updated : r))
    );

    triggerStatusNotification(updated, oldStatus, newStatus, reason);
  };

  // Save DEV-01 & DEV-02
  const handleSaveEvaluation = (
    updatedReq: MESRequirement,
    proceedToDeveloping = false
  ) => {
    const oldStatus = updatedReq.status;
    setRequirements((prev) =>
      prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
    );

    if (proceedToDeveloping) {
      triggerStatusNotification(
        updatedReq,
        oldStatus,
        'developing',
        `【派工核准通報】需求單 ${updatedReq.id} 系統影響評估與排程完成，已派發給 ${updatedReq.assignedEngineer}，納入 ${updatedReq.sprint} 開始開發。`
      );
    }
  };

  // Save UAT-01
  const handleSaveUAT = (updatedReq: MESRequirement, deployNow = false) => {
    const oldStatus = updatedReq.status;
    setRequirements((prev) =>
      prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
    );

    if (deployNow) {
      triggerStatusNotification(
        updatedReq,
        oldStatus,
        'deployed',
        `【正式上線公告】需求單 ${updatedReq.id}《${updatedReq.title}》已完成所有 UAT 驗收並通過電子簽核，正式部署上線！`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar Contract (3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'notifications') {
            setIsNotificationDrawerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenNewRequirement={() => {
          setEditingReq(null);
          setIsReqModalOpen(true);
        }}
        notificationCount={notifications.length}
      />

      {/* Role Switcher Bar for RBAC simulation */}
      <RoleSwitcherBar
        currentUser={currentUser}
        onSelectUser={(u) => setCurrentUser(u)}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'kanban' && (
          <KanbanBoard
            requirements={requirements}
            currentUser={currentUser}
            onOpenRequirementDetail={(req) => {
              setEditingReq(req);
              setIsReqModalOpen(true);
            }}
            onOpenEvaluation={(req) => {
              setEvaluatingReq(req);
              setIsEvalModalOpen(true);
            }}
            onOpenUAT={(req) => {
              setUatReq(req);
              setIsUATModalOpen(true);
            }}
            onOpenReleaseNote={(req) => {
              setReleaseReq(req);
              setIsReleaseModalOpen(true);
            }}
            onMoveStatus={handleMoveStatus}
            onOpenNewRequirement={() => {
              setEditingReq(null);
              setIsReqModalOpen(true);
            }}
          />
        )}

        {activeTab === 'fsd' && (
          <FSDDocumentViewer
            onOpenNewRequirement={() => {
              setEditingReq(null);
              setIsReqModalOpen(true);
            }}
            onOpenEvaluation={(reqId) => {
              const target =
                requirements.find((r) => r.id === reqId) || requirements[0];
              setEvaluatingReq(target);
              setIsEvalModalOpen(true);
            }}
            onOpenUAT={(reqId) => {
              const target =
                requirements.find((r) => r.id === reqId) || requirements[0];
              setUatReq(target);
              setIsUATModalOpen(true);
            }}
            onOpenReleaseNote={(reqId) => {
              const target =
                requirements.find((r) => r.id === reqId) || requirements[0];
              setReleaseReq(target);
              setIsReleaseModalOpen(true);
            }}
          />
        )}
      </main>

      {/* REQ-01 / REQ-02 Modal */}
      <RequirementModal
        isOpen={isReqModalOpen}
        onClose={() => {
          setIsReqModalOpen(false);
          setEditingReq(null);
        }}
        onSubmit={handleSaveRequirement}
        currentUser={currentUser}
        initialRequirement={editingReq}
      />

      {/* DEV-01 / DEV-02 Modal */}
      <EvaluationDispatchModal
        isOpen={isEvalModalOpen}
        onClose={() => {
          setIsEvalModalOpen(false);
          setEvaluatingReq(null);
        }}
        requirement={evaluatingReq}
        onSave={handleSaveEvaluation}
        currentUser={currentUser}
      />

      {/* UAT-01 Modal */}
      <UATManagementModal
        isOpen={isUATModalOpen}
        onClose={() => {
          setIsUATModalOpen(false);
          setUatReq(null);
        }}
        requirement={uatReq}
        onSave={handleSaveUAT}
        currentUser={currentUser}
      />

      {/* UAT-02 Modal */}
      <ReleaseNoteModal
        isOpen={isReleaseModalOpen}
        onClose={() => {
          setIsReleaseModalOpen(false);
          setReleaseReq(null);
        }}
        requirement={releaseReq}
        onSendNotification={(channel) => {
          if (releaseReq) {
            triggerStatusNotification(
              releaseReq,
              releaseReq.status,
              'deployed',
              `【手動推播】${releaseReq.title} 版本發布公告已透過 ${channel} 派送給現場相關同仁。`
            );
          }
        }}
      />

      {/* TRK-02 Automated Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onClear={() => setNotifications([])}
      />
    </div>
  );
}
