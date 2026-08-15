import { useEffect, useState } from "react";

import type {
  AdminCategory,
  AdminCategoryType,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "../../types/adminCategory";

import "./CategoryFormModal.css";

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  category?: AdminCategory | null;
  busy?: boolean;
  errorMessage?: string;
  onSubmit: (
    payload: CreateAdminCategoryRequest | UpdateAdminCategoryRequest
  ) => Promise<void>;
  onCancel: () => void;
}

const EMOJI_OPTIONS = [
  "🍜", "🍔", "🍕", "🍣", "🍱", "🍰", "☕", "🍺",
  "🛒", "🛍️", "👕", "👟", "💄", "💊", "🏥", "🏠",
  "🚗", "⛽", "✈️", "🚌", "📱", "�", "🎮", "📚",
  "🎬", "🎵", "🏋️", "⚽", "🎁", "💼", "📈", "�",
  "🐱", "🌳", "💡", "💧", "📦", "💰", "💵", "💳",
  "🏦", "📊", "✏️", "🧹", "🔧", "�", "👶", "💍",
];

const COLOR_SWATCHES = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4", "#a855f7",
];

export default function CategoryFormModal({
  open,
  mode,
  category,
  busy = false,
  errorMessage,
  onSubmit,
  onCancel,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AdminCategoryType>("EXPENSE");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState("#3b82f6");

  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && category) {
      setName(category.name ?? "");
      setType(category.type ?? "EXPENSE");
      setIcon(category.icon ?? "📦");
      setColor(category.color ?? "#3b82f6");
    } else {
      setName("");
      setType("EXPENSE");
      setIcon("📦");
      setColor("#3b82f6");
    }
    setLocalError("");
  }, [open, mode, category]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Tên danh mục không được để trống.");
      return;
    }
    if (trimmed.length > 100) {
      setLocalError("Tên danh mục tối đa 100 ký tự.");
      return;
    }

    const payload = {
      name: trimmed,
      type,
      icon: icon.trim() || "📦",
      color,
    };

    try {
      await onSubmit(payload);
    } catch {
      // error shown via errorMessage prop
    }
  };

  return (
    <div className="cat-modal-overlay" onClick={() => !busy && onCancel()}>
      <div
        className="cat-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="cat-modal-header">
          <h3>
            {mode === "create" ? "Thêm danh mục mặc định" : "Sửa danh mục"}
          </h3>
          <button
            type="button"
            className="cat-modal-close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cat-modal-body">
          <div className="cat-modal-grid">
            <div className="cat-modal-field">
              <label className="cat-modal-label">
                Tên danh mục <span className="required">*</span>
              </label>
              <input
                type="text"
                className="cat-modal-input"
                placeholder="Ví dụ: Ăn uống"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="cat-modal-field">
              <label className="cat-modal-label">
                Loại <span className="required">*</span>
              </label>
              <select
                className="cat-modal-select"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as AdminCategoryType)
                }
                disabled={busy}
              >
                <option value="EXPENSE">Chi tiêu</option>
                <option value="INCOME">Thu nhập</option>
              </select>
            </div>
          </div>

          <div className="cat-modal-field">
            <label className="cat-modal-label">Biểu tượng</label>
            <input
              type="text"
              className="cat-modal-input"
              placeholder="📦"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
              disabled={busy}
            />
            <div className="cat-modal-emoji-picker">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`cat-modal-emoji-btn ${
                    icon === e ? "active" : ""
                  }`}
                  onClick={() => setIcon(e)}
                  disabled={busy}
                  title={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="cat-modal-field">
            <label className="cat-modal-label">Màu sắc</label>
            <div className="cat-modal-color-row">
              <input
                type="color"
                className="cat-modal-color-picker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={busy}
              />
              <div className="cat-modal-color-swatches">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cat-modal-color-swatch ${
                      color === c ? "active" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    disabled={busy}
                    title={c}
                    aria-label={`Chọn màu ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {(localError || errorMessage) && (
            <div className="cat-modal-error">
              {localError || errorMessage}
            </div>
          )}

          <div className="cat-modal-actions">
            <button
              type="button"
              className="cat-modal-btn-secondary"
              onClick={onCancel}
              disabled={busy}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="cat-modal-btn-primary"
              disabled={busy}
            >
              {busy
                ? "Đang xử lý..."
                : mode === "create"
                  ? "Thêm danh mục"
                  : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
