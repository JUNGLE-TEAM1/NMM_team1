import { X } from "lucide-react";

export function ToastNotice({ message, isLeaving, onClose }) {
  return (
    <div className={`toast-notice ${isLeaving ? "leaving" : ""}`} role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="알림 닫기">
        <X size={16} />
      </button>
    </div>
  );
}
