import {
  useEffect,
  useState,
} from "react";

import { createCategory } from "../api/categoryApi";

import type {
  Category,
  CategoryType,
} from "../types/category";

import "./QuickAddCategoryModal.css";

const EMOJI_OPTIONS = [
  "🍜", "🍔", "🍕", "🍣", "🍱", "🍰", "☕", "🍺",
  "🛒", "🛍️", "👕", "👟", "💄", "💊", "🏥", "🏠",
  "🚗", "⛽", "✈️", "🚌", "📱", "💻", "🎮", "📚",
  "🎬", "🎵", "🏋️", "⚽", "🎁", "💼", "📈", "🐶",
  "🐱", "🌳", "💡", "💧", "📦", "💰", "💵", "💳",
  "🏦", "📊", "✏️", "🧹", "🔧", "🎓", "👶", "💍",
];

const COLOR_SWATCHES = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4", "#a855f7",
];

interface QuickAddCategoryModalProps {
  open: boolean;
  defaultType: CategoryType;
  onCancel: () => void;
  onCreated: (category: Category) => void;
  lockType?: boolean;
}

export default function QuickAddCategoryModal({
  open,
  defaultType,
  onCancel,
  onCreated,
  lockType = true,
}: QuickAddCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState("#3b82f6");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setType(defaultType);
      setIcon("📦");
      setColor("#3b82f6");
      setSubmitting(false);
      setError("");
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onCancel();
      }
    };
    document.addEventListener("keydown", handler);
    return () =>
      document.removeEventListener("keydown", handler);
  }, [open, submitting, onCancel]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tên danh mục không được để trống.");
      return;
    }
    if (trimmed.length > 100) {
      setError("Tên danh mục tối đa 100 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCategory({
        name: trimmed,
        type,
        icon: icon.trim() || "📦",
        color,
      });
      onCreated(created);
    } catch (err: any) {
      const sc = err?.response?.status;
      const code = err?.response?.data?.code;
      if (sc === 401) {
        setError("Phiên đăng nhập đã hết hạn.");
      } else if (code === 1018) {
        setError(
          `Danh mục "${trimmed}" đã tồn tại trong ${
            type === "EXPENSE" ? "chi tiêu" : "thu nhập"
          }.`
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Không thể tạo danh mục. Vui lòng thử lại."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    onCancel();
  };

  return (
    <div
      className="qacm-overlay"
      onClick={() => !submitting && onCancel()}
    >
      <div
        className="qacm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="qacm-header">
          <h3>Thêm danh mục</h3>
          <button
            type="button"
            className="qacm-close"
            onClick={handleCancel}
            disabled={submitting}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div
          className="qacm-body"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !submitting) {
              e.preventDefault();
              void handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        >
          <div className="qacm-field">
            <label className="qacm-label">
              Tên danh mục <span className="qacm-required">*</span>
            </label>
            <input
              type="text"
              className="qacm-input"
              placeholder="Ví dụ: Ăn sáng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="qacm-field">
            <label className="qacm-label">Loại</label>
            <select
              className="qacm-select"
              value={type}
              onChange={(e) =>
                setType(e.target.value as CategoryType)
              }
              disabled={submitting || lockType}
            >
              <option value="EXPENSE">Chi tiêu</option>
              <option value="INCOME">Thu nhập</option>
            </select>
            <span className="qacm-hint">
              {lockType
                ? "Loại danh mục khớp với loại giao dịch."
                : "Loại danh mục phải khớp với loại giao dịch."}
            </span>
          </div>

          <div className="qacm-field">
            <label className="qacm-label">Biểu tượng</label>
            <input
              type="text"
              className="qacm-input"
              placeholder="📦"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
              disabled={submitting}
            />
            <div className="qacm-emoji-grid">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`qacm-emoji-btn ${
                    icon === e ? "active" : ""
                  }`}
                  onClick={() => setIcon(e)}
                  disabled={submitting}
                  title={e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="qacm-field">
            <label className="qacm-label">Màu sắc</label>
            <div className="qacm-color-row">
              <input
                type="color"
                className="qacm-color-picker"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={submitting}
              />
              <div className="qacm-color-swatches">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`qacm-color-swatch ${
                      color === c ? "active" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    disabled={submitting}
                    title={c}
                    aria-label={`Chọn màu ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="qacm-error">{error}</div>
          )}

          <div className="qacm-actions">
            <button
              type="button"
              className="qacm-btn-secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="button"
              className="qacm-btn-primary"
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                void handleSubmit(
                  e as unknown as React.FormEvent
                );
              }}
            >
              {submitting ? "Đang thêm..." : "Thêm danh mục"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}