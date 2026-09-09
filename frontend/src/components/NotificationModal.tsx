import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApplication: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectApplication,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: "n1",
      title: "Automated Approval Logged",
      body: "Application #1024 - Sarah Jenkins was auto-approved via Ruleset V2.4.",
      time: "5m ago",
      type: "success",
      appId: "APP-1024",
    },
    {
      id: "n2",
      title: "Manual Underwriting Flag",
      body: "Application APP-9022 (Global Industries Inc) routed to queue due to 44% DTI ratio.",
      time: "1h ago",
      type: "warning",
      appId: "APP-9022",
    },
    {
      id: "n3",
      title: "Latency Spike Resolved",
      body: "ML Inference API latency returned to 45ms nominal baseline.",
      time: "2h ago",
      type: "info",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-lg w-full max-w-md mt-16 p-4 shadow-xl animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black">notifications</span>
            <h3 className="text-[15px] font-bold text-[#0b1c30]">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-black p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.appId) {
                  onSelectApplication(n.appId);
                  onClose();
                }
              }}
              className={`p-3 rounded border text-left cursor-pointer transition-colors ${
                n.type === 'success'
                  ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                  : n.type === 'warning'
                  ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                  : 'bg-[#eff4ff] border-[#c6c6cd] hover:bg-[#dce9ff]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[13px] font-bold text-[#0b1c30]">{n.title}</span>
                <span className="text-[10px] text-[#76777d] font-mono">{n.time}</span>
              </div>
              <p className="text-[12px] text-[#45464d]">{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
