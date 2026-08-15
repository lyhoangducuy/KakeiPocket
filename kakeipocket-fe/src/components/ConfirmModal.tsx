import { useEffect } from "react";

import "./ConfirmModal.css";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  details?: Array<{ label: string; value: string }>;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  details,
  confirmLabel,
  cancelLabel = "Hủy",
  variant = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={() => !busy && onCancel()}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h3 id="confirm-title" className="confirm-title">
          {title}
        </h3>
        <p className="confirm-message">{message}</p>

        {details && details.length > 0 && (
          <div className="confirm-details">
            {details.map((d) => (
              <div className="confirm-detail-row" key={d.label}>
                <span className="confirm-detail-label">{d.label}</span>
                <span className="confirm-detail-value">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-btn confirm-btn-${variant}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
