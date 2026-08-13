import {
  useState,
  useEffect,
  type FormEvent,
} from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoCategories } from "../../demo/categoryDemo";

import type {
  Category,
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../../types/category";

import "./CategoryPage.css";

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

type FilterType = "ALL" | CategoryType;

export default function CategoryPage() {
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    type: "EXPENSE",
    icon: "📦",
    color: "#3b82f6",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setCategories(demoCategories);
      setLoading(false);
      return;
    }

    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      requireAuth("Đăng nhập để quản lý danh mục.");
      return;
    }

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    if (formData.name.trim().length > 50) {
      setError("Tên danh mục tối đa 50 ký tự.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: CreateCategoryRequest = {
        name: formData.name.trim(),
        type: formData.type,
        icon: (formData.icon ?? "").trim() || "📦",
        color: formData.color ?? "#3b82f6",
      };

      if (editingId) {
        const data: UpdateCategoryRequest = payload;
        await updateCategory(editingId, data);
        setSuccess("Cập nhật danh mục thành công!");
      } else {
        const data: CreateCategoryRequest = payload;
        await createCategory(data);
        setSuccess("Tạo danh mục thành công!");
      }

      resetForm();
      await loadCategories();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      type: "EXPENSE",
      icon: "📦",
      color: "#3b82f6",
    });
  };

  const handleEdit = (category: Category) => {
    if (isGuest) {
      requireAuth("Đăng nhập để sửa danh mục.");
      return;
    }
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon ?? "",
      color: category.color ?? "#3b82f6",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setError("");
    setSuccess("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (isGuest) {
      requireAuth("Đăng nhập để xóa danh mục.");
      return;
    }

    setDeleting(deleteTarget.id);
    setError("");

    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Xóa danh mục thành công!");
      await loadCategories();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đã xảy ra lỗi khi xóa.");
      }
    } finally {
      setDeleting(null);
    }
  };

  const filteredCategories =
    filterType === "ALL"
      ? categories
      : categories.filter((c) => c.type === filterType);

  const expenseCategories = categories.filter(
    (c) => c.type === "EXPENSE"
  );
  const incomeCategories = categories.filter(
    (c) => c.type === "INCOME"
  );

  if (loading) {
    return (
      <div className="cat-loading">
        <div className="cat-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="cat-page">
      <div className="cat-header">
        <h1 className="cat-title">
          Quản lý danh mục
          {isGuest && (
            <span className="cat-demo-badge">DEMO</span>
          )}
        </h1>
        <p className="cat-subtitle">
          Tạo và quản lý danh mục thu chi của bạn.
        </p>
      </div>

      {error && <div className="cat-error">{error}</div>}
      {success && (
        <div className="cat-success">{success}</div>
      )}

      <div className="cat-form-card">
        <h2 className="cat-form-title">
          {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="cat-row">
            <div className="cat-field">
              <label className="cat-label">Tên danh mục</label>
              <input
                type="text"
                className="cat-input"
                placeholder="Ví dụ: Ăn uống"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isGuest}
              />
            </div>

            <div className="cat-field">
              <label className="cat-label">Loại</label>
              <select
                className="cat-select"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as CategoryType,
                  })
                }
                disabled={isGuest}
              >
                <option value="EXPENSE">Chi tiêu</option>
                <option value="INCOME">Thu nhập</option>
              </select>
            </div>
          </div>

          <div className="cat-row">
            <div className="cat-field">
              <label className="cat-label">Biểu tượng (emoji)</label>
              <input
                type="text"
                className="cat-input cat-input-icon"
                placeholder="🍜"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                maxLength={4}
                disabled={isGuest}
              />
              <div className="cat-emoji-picker">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`cat-emoji-btn ${
                      formData.icon === e ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, icon: e })
                    }
                    disabled={isGuest}
                    title={e}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="cat-field">
              <label className="cat-label">Màu sắc</label>
              <input
                type="color"
                className="cat-input-color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                disabled={isGuest}
              />
              <div className="cat-color-swatches">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cat-color-swatch ${
                      formData.color === c ? "active" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() =>
                      setFormData({ ...formData, color: c })
                    }
                    disabled={isGuest}
                    title={c}
                    aria-label={`Chọn màu ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cat-form-actions">
            {editingId && (
              <button
                type="button"
                className="cat-btn-secondary"
                onClick={handleCancelEdit}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="cat-btn-primary"
              disabled={submitting}
            >
              {isGuest
                ? "Đăng nhập để lưu"
                : submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Tạo danh mục"}
            </button>
          </div>
        </form>
      </div>

      <div className="cat-filter-bar">
        <button
          className={`cat-filter-btn ${filterType === "ALL" ? "active" : ""}`}
          onClick={() => setFilterType("ALL")}
        >
          Tất cả ({categories.length})
        </button>
        <button
          className={`cat-filter-btn ${filterType === "EXPENSE" ? "active" : ""}`}
          onClick={() => setFilterType("EXPENSE")}
        >
          Chi tiêu ({expenseCategories.length})
        </button>
        <button
          className={`cat-filter-btn ${filterType === "INCOME" ? "active" : ""}`}
          onClick={() => setFilterType("INCOME")}
        >
          Thu nhập ({incomeCategories.length})
        </button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="cat-empty">
          <p>Chưa có danh mục nào.</p>
          <p className="cat-empty-hint">
            Hãy tạo danh mục đầu tiên ở form phía trên.
          </p>
        </div>
      ) : (
        <div className="cat-grid">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="cat-card">
              <div
                className="cat-card-color-bar"
                style={{ backgroundColor: cat.color ?? "#3b82f6" }}
              />
              <div className="cat-card-icon">{cat.icon ?? "📦"}</div>
              <div className="cat-card-info">
                <h3 className="cat-card-name">{cat.name}</h3>
                <span
                  className={`cat-card-type cat-type-${cat.type.toLowerCase()}`}
                >
                  {cat.type === "EXPENSE" ? "Chi tiêu" : "Thu nhập"}
                </span>
              </div>
              <div className="cat-card-actions">
                <button
                  className="cat-btn-icon"
                  onClick={() => handleEdit(cat)}
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  className="cat-btn-icon"
                  onClick={() => setDeleteTarget(cat)}
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="cat-modal-overlay">
          <div className="cat-modal">
            <h2 className="cat-modal-title">Xác nhận xóa</h2>
            <p className="cat-modal-text">
              Bạn có chắc muốn xóa danh mục "{deleteTarget.name}"?
            </p>
            <p className="cat-modal-warning">
              Các giao dịch thuộc danh mục này có thể bị ảnh hưởng.
            </p>
            <div className="cat-modal-actions">
              <button
                className="cat-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="cat-btn-danger"
                onClick={handleDelete}
                disabled={deleting !== null}
              >
                {deleting !== null ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}