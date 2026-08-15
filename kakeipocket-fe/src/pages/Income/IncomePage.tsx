import {
  useState,
  useEffect,
  type FormEvent,
} from "react";

import { getCategories } from "../../api/categoryApi";
import {
  createIncome,
  getIncomes,
  updateIncome,
  deleteTransaction,
} from "../../api/transactionApi";

import CategorySelectWithAdd from "../../components/CategorySelectWithAdd";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoCategories } from "../../demo/categoryDemo";
import { demoTransactions } from "../../demo/transactionDemo";

import type { Category } from "../../types/category";
import type {
  CreateIncomeRequest,
  ExpenseTransaction,
  UpdateIncomeRequest,
} from "../../types/transaction";

import "./IncomePage.css";

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined || value === 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
};

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTodayDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getFirstDayOfMonth = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

const getLastDayOfMonth = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 2;
  const lastDay = new Date(yyyy, mm, 0).getDate();
  return `${yyyy}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
};

interface FormData {
  categoryId: string;
  amount: string;
  transactionDate: string;
  note: string;
}

const initialFormData: FormData = {
  categoryId: "",
  amount: "",
  transactionDate: getTodayDate(),
  note: "",
};

export default function IncomePage() {
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<
    ExpenseTransaction[]
  >([]);

  const [filterFrom, setFilterFrom] = useState(getFirstDayOfMonth());
  const [filterTo, setFilterTo] = useState(getLastDayOfMonth());

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<ExpenseTransaction | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filterFrom, filterTo, isGuest]);

  const loadInitialData = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      const cats = demoCategories.filter(
        (c) => c.type === "INCOME"
      );
      setCategories(cats);
      if (cats.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: String(cats[0].id),
        }));
      }
      setLoading(false);
      return;
    }

    try {
      const cats = await getCategories("INCOME");
      setCategories(cats);

      if (cats.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: String(cats[0].id),
        }));
      }

      await loadTransactions();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (isGuest) {
      const filtered = demoTransactions
        .filter((t) => t.type === "INCOME")
        .filter((t) => {
          if (filterFrom && t.transactionDate < filterFrom)
            return false;
          if (filterTo && t.transactionDate > filterTo)
            return false;
          return true;
        })
        .sort((a, b) =>
          b.transactionDate.localeCompare(a.transactionDate)
        );
      setTransactions(filtered);
      setLoading(false);
      return;
    }

    try {
      const data = await getIncomes(filterFrom, filterTo);
      setTransactions(data);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setFormData({
      ...formData,
      amount: formatCurrency(parseInt(raw, 10) || 0),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      requireAuth("Đăng nhập để thêm khoản thu.");
      return;
    }

    setError("");
    setSuccess("");

    if (!formData.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    const amount = parseCurrency(formData.amount);
    if (amount <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }

    if (!formData.transactionDate) {
      setError("Vui lòng chọn ngày.");
      return;
    }

    if (categories.length === 0) {
      setError("Bạn chưa có danh mục thu nhập nào.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        categoryId: parseInt(formData.categoryId, 10),
        amount,
        transactionDate: formData.transactionDate,
        note: formData.note.trim() || undefined,
      };

      if (editingId) {
        const data: UpdateIncomeRequest = payload;
        await updateIncome(editingId, data);
        setSuccess("Cập nhật khoản thu thành công!");
      } else {
        const data: CreateIncomeRequest = payload;
        await createIncome(data);
        setSuccess("Tạo khoản thu thành công!");
      }

      resetForm();
      await loadTransactions();
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
      ...initialFormData,
      categoryId:
        categories.length > 0 ? String(categories[0].id) : "",
    });
  };

  const handleEdit = (transaction: ExpenseTransaction) => {
    if (isGuest) {
      requireAuth("Đăng nhập để sửa khoản thu.");
      return;
    }
    setEditingId(transaction.id);
    setFormData({
      categoryId: String(transaction.categoryId),
      amount: formatCurrency(transaction.amount),
      transactionDate: transaction.transactionDate,
      note: transaction.note || "",
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
      requireAuth("Đăng nhập để xóa khoản thu.");
      return;
    }

    setDeleting(deleteTarget.id);
    setError("");

    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Xóa khoản thu thành công!");
      await loadTransactions();
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

  const totalIncome = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  if (loading) {
    return (
      <div className="inc-loading">
        <div className="inc-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="inc-page">
      <div className="inc-header">
        <h1 className="inc-title">
          Thu nhập
          {isGuest && (
            <span className="inc-demo-badge">DEMO</span>
          )}
        </h1>
        <p className="inc-subtitle">
          Quản lý các khoản thu nhập của bạn.
        </p>
      </div>

      {error && <div className="inc-error">{error}</div>}
      {success && (
        <div className="inc-success">{success}</div>
      )}

      <div className="inc-form-card">
        <h2 className="inc-form-title">
          {editingId ? "Sửa khoản thu" : "Thêm khoản thu"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="inc-field">
            <label className="inc-label">Danh mục</label>
            <CategorySelectWithAdd
              categories={categories}
              value={formData.categoryId}
              onChange={(v) =>
                setFormData({ ...formData, categoryId: v })
              }
              type="INCOME"
              disabled={isGuest}
              onCategoryCreated={(cat) => {
                setCategories((prev) => {
                  if (
                    prev.some((p) => p.id === cat.id)
                  ) {
                    return prev;
                  }
                  return [...prev, cat];
                });
                setFormData((prev) => ({
                  ...prev,
                  categoryId: String(cat.id),
                }));
              }}
            />
          </div>

          <div className="inc-row">
            <div className="inc-field">
              <label className="inc-label">Số tiền</label>
              <div className="inc-input-wrapper">
                <input
                  type="text"
                  className="inc-input"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  disabled={isGuest}
                />
                <span className="inc-input-suffix">₫</span>
              </div>
            </div>

            <div className="inc-field">
              <label className="inc-label">Ngày</label>
              <input
                type="date"
                className="inc-input"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionDate: e.target.value,
                  })
                }
                disabled={isGuest}
              />
            </div>
          </div>

          <div className="inc-field">
            <label className="inc-label">Ghi chú</label>
            <input
              type="text"
              className="inc-input"
              placeholder="Ví dụ: Lương tháng 8"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              disabled={isGuest}
            />
          </div>

          <div className="inc-form-actions">
            {editingId && (
              <button
                type="button"
                className="inc-btn-secondary"
                onClick={handleCancelEdit}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="inc-btn-primary"
              disabled={submitting}
            >
              {isGuest
                ? "Đăng nhập để lưu"
                : submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Lưu khoản thu"}
            </button>
          </div>
        </form>
      </div>

      <div className="inc-filter-card">
        <div className="inc-filter-row">
          <div className="inc-field">
            <label className="inc-label">Từ ngày</label>
            <input
              type="date"
              className="inc-input"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="inc-field">
            <label className="inc-label">Đến ngày</label>
            <input
              type="date"
              className="inc-input"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="inc-summary-card">
        <span className="inc-summary-label">Tổng thu nhập</span>
        <span className="inc-summary-value">
          {formatCurrency(totalIncome)} ₫
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="inc-empty">
          <p>Chưa có khoản thu nhập nào.</p>
          <p className="inc-empty-hint">
            Hãy thêm khoản thu đầu tiên của bạn ở form phía trên.
          </p>
        </div>
      ) : (
        <div className="inc-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="inc-item">
              <div className="inc-item-main">
                <div className="inc-item-header">
                  <span className="inc-item-date">
                    {formatDate(tx.transactionDate)}
                  </span>
                  <span className="inc-item-amount">
                    +{formatCurrency(tx.amount)} ₫
                  </span>
                </div>
                <div className="inc-item-info">
                  <span className="inc-item-category">
                    {tx.categoryName}
                  </span>
                </div>
                {tx.note && (
                  <p className="inc-item-note">{tx.note}</p>
                )}
              </div>
              <div className="inc-item-actions">
                <button
                  className="inc-btn-icon"
                  onClick={() => handleEdit(tx)}
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  className="inc-btn-icon"
                  onClick={() => setDeleteTarget(tx)}
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
        <div className="inc-modal-overlay">
          <div className="inc-modal">
            <h2 className="inc-modal-title">Xác nhận xóa</h2>
            <p className="inc-modal-text">
              Bạn có chắc muốn xóa khoản thu này?
            </p>
            <div className="inc-modal-actions">
              <button
                className="inc-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="inc-btn-danger"
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