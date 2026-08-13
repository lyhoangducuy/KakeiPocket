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

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryType,
  FilterType,
} from "../../types/category";

import "./CategoryPage.css";

const CATEGORY_ICONS: Record<string, string> = {
  FOOD: "🍜",
  TRANSPORT: "🚗",
  HOME: "🏠",
  SHOPPING: "🛒",
  ENTERTAINMENT: "🎮",
  HEALTH: "💊",
  EDUCATION: "📚",
  SALARY: "💰",
  BONUS: "🎁",
  FREELANCE: "💻",
  INVESTMENT: "📈",
  OTHER: "📦",
};

const getIconForCategory = (name: string, type: CategoryType): string => {
  const lowerName = name.toLowerCase();

  if (type === "EXPENSE") {
    if (lowerName.includes("ăn") || lowerName.includes("uống")) return CATEGORY_ICONS.FOOD;
    if (lowerName.includes("đi") || lowerName.includes("lại") || lowerName.includes("xe")) return CATEGORY_ICONS.TRANSPORT;
    if (lowerName.includes("nhà") || lowerName.includes("ở")) return CATEGORY_ICONS.HOME;
    if (lowerName.includes("mua") || lowerName.includes("sắm")) return CATEGORY_ICONS.SHOPPING;
    if (lowerName.includes("giải") || lowerName.includes("trí")) return CATEGORY_ICONS.ENTERTAINMENT;
    if (lowerName.includes("y tế") || lowerName.includes("thuốc")) return CATEGORY_ICONS.HEALTH;
    if (lowerName.includes("học") || lowerName.includes("tập")) return CATEGORY_ICONS.EDUCATION;
  } else {
    if (lowerName.includes("lương")) return CATEGORY_ICONS.SALARY;
    if (lowerName.includes("thưởng")) return CATEGORY_ICONS.BONUS;
    if (lowerName.includes("freelance")) return CATEGORY_ICONS.FREELANCE;
    if (lowerName.includes("đầu tư")) return CATEGORY_ICONS.INVESTMENT;
  }

  return CATEGORY_ICONS.OTHER;
};

export default function CategoryPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: "",
    type: "EXPENSE",
    icon: "",
    color: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [filter]);

  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const type = filter === "ALL" ? undefined : filter;
      const data = await getCategories(type);
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

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "EXPENSE",
      icon: "",
      color: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || "",
      color: category.color || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "EXPENSE",
      icon: "",
      color: "",
    });
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        const data: UpdateCategoryRequest = {
          name: formData.name.trim(),
          type: formData.type,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
        };
        await updateCategory(editingCategory.id, data);
        setSuccess("Cập nhật danh mục thành công!");
      } else {
        const data: CreateCategoryRequest = {
          name: formData.name.trim(),
          type: formData.type,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
        };
        await createCategory(data);
        setSuccess("Tạo danh mục thành công!");
      }

      closeModal();
      loadCategories();
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

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setDeleting(showDeleteConfirm.id);
    setError("");

    try {
      await deleteCategory(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      loadCategories();
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

  const getTypeLabel = (type: CategoryType): string => {
    return type === "EXPENSE" ? "Chi tiêu" : "Thu nhập";
  };

  const getCategoryIcon = (category: Category): string => {
    if (category.icon) return category.icon;
    return getIconForCategory(category.name, category.type);
  };

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
        <div>
          <h1 className="cat-title">Quản lý danh mục</h1>
          <p className="cat-subtitle">
            Tạo và quản lý các danh mục thu nhập, chi tiêu của bạn.
          </p>
        </div>

        <button
          className="cat-btn-primary"
          onClick={openCreateModal}
        >
          + Thêm danh mục
        </button>
      </div>

      {error && <div className="cat-error">{error}</div>}
      {success && <div className="cat-success">{success}</div>}

      <div className="cat-filters">
        <button
          className={`cat-filter-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          Tất cả
        </button>
        <button
          className={`cat-filter-btn ${filter === "EXPENSE" ? "active" : ""}`}
          onClick={() => setFilter("EXPENSE")}
        >
          Chi tiêu
        </button>
        <button
          className={`cat-filter-btn ${filter === "INCOME" ? "active" : ""}`}
          onClick={() => setFilter("INCOME")}
        >
          Thu nhập
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="cat-empty">
          <p>Bạn chưa có danh mục nào.</p>
          <button
            className="cat-btn-secondary"
            onClick={openCreateModal}
          >
            + Thêm danh mục
          </button>
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="cat-card"
            >
              <div className="cat-card-left">
                <span className="cat-card-icon">
                  {getCategoryIcon(category)}
                </span>
                <div className="cat-card-info">
                  <h3 className="cat-card-name">
                    {category.name}
                  </h3>
                  <span
                    className={`cat-card-type ${
                      category.type === "EXPENSE"
                        ? "cat-type-expense"
                        : "cat-type-income"
                    }`}
                  >
                    {getTypeLabel(category.type)}
                  </span>
                </div>
              </div>

              <div className="cat-card-actions">
                <button
                  className="cat-btn-icon"
                  onClick={() => openEditModal(category)}
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  className="cat-btn-icon"
                  onClick={() => setShowDeleteConfirm(category)}
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="cat-modal-overlay">
          <div className="cat-modal">
            <h2 className="cat-modal-title">
              {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="cat-form-group">
                <label className="cat-label">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  className="cat-input"
                  placeholder="Ví dụ: Ăn uống"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="cat-form-group">
                <label className="cat-label">
                  Loại danh mục
                </label>
                <select
                  className="cat-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CategoryType,
                    })
                  }
                >
                  <option value="EXPENSE">Chi tiêu</option>
                  <option value="INCOME">Thu nhập</option>
                </select>
              </div>

              {error && <div className="cat-error">{error}</div>}

              <div className="cat-modal-actions">
                <button
                  type="button"
                  className="cat-btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="cat-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : editingCategory ? "Cập nhật" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="cat-modal-overlay">
          <div className="cat-modal cat-modal-confirm">
            <h2 className="cat-modal-title">Xác nhận xóa</h2>
            <p className="cat-confirm-text">
              Bạn có chắc muốn xóa danh mục "
              {showDeleteConfirm.name}"?
            </p>

            {error && <div className="cat-error">{error}</div>}

            <div className="cat-modal-actions">
              <button
                type="button"
                className="cat-btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setError("");
                }}
              >
                Hủy
              </button>
              <button
                type="button"
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
