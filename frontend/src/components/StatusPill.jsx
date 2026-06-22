import { Activity } from "lucide-react";

export function StatusPill({ health }) {
  const statusLabel = health.state === "ok" ? "정상" : health.state === "error" ? "확인 필요" : "확인 중";

  return (
    <div className={`status-pill ${health.state}`} title={health.message}>
      <Activity size={18} aria-hidden="true" />
      <span>{statusLabel}</span>
    </div>
  );
}
