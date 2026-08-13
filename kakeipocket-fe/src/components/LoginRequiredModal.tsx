import { useEffect } from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import "./LoginRequiredModal.css";

interface Props {
  open: boolean;
  intent?: string;
  onClose: () => void;
}

export default function LoginRequiredModal({
  open,
  intent,
  onClose,
}: Props) {
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const message =
    intent ||
    "Bạn cần đăng nhập để sử dụng chức năng này.";

  const from =
    location.pathname + (location.search || "");

  return (
    <div
      className="lrm-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="lrm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="lrm-icon" aria-hidden="true">
          🔒
        </div>
        <h2 className="lrm-title">Yêu cầu đăng nhập</h2>
        <p className="lrm-message">{message}</p>
        <div className="lrm-actions">
          <button
            type="button"
            className="lrm-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
          <Link
            to="/login"
            state={{ from }}
            className="lrm-btn-primary"
            onClick={onClose}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
