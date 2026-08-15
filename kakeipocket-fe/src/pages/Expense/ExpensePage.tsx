import {
  useState,
  useEffect,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../api/categoryApi";
import {
  createExpense,
  getExpenses,
  getIncomes,
  updateExpense,
  deleteTransaction,
} from "../../api/transactionApi";

import CategorySelectWithAdd from "../../components/CategorySelectWithAdd";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoCategories } from "../../demo/categoryDemo";
import { demoTransactions } from "../../demo/transactionDemo";

import type { Category } from "../../types/category";
import type {
  CreateExpenseRequest,
  ExpenseTransaction,
  UpdateExpenseRequest,
  WalletType,
} from "../../types/transaction";
import { WALLET_OPTIONS } from "../../types/transaction";

import "./ExpensePage.css";
import { getCategoryIcon } from "../../utils/categoryIcon";

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
  walletType: WalletType;
  amount: string;
  transactionDate: string;
  note: string;
}

const initialFormData: FormData = {
  categoryId: "",
  walletType: "NECESSARY",
  amount: "",
  transactionDate: getTodayDate(),
  note: "",
};

export default function ExpensePage() {
  const navigate = useNavigate();
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

  const [hasIncome, setHasIncome] = useState<boolean>(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isGuest) {
      checkHasIncome();
    }
  }, [isGuest]);

  const checkHasIncome = async () => {
    try {
      const incomes = await getIncomes();
      setHasIncome(incomes.length > 0);
    } catch {
      setHasIncome(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filterFrom, filterTo, isGuest]);

  const loadInitialData = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      const cats = demoCategories.filter(
        (c) => c.type === "EXPENSE"
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
      const cats = await getCategories("EXPENSE");
      setCategories(cats);

      setFormData((prev) => {
        if (prev.categoryId) return prev;
        if (cats.length > 0) {
          return { ...prev, categoryId: String(cats[0].id) };
        }
        return prev;
      });

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
        .filter((t) => t.type === "EXPENSE")
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
      const data = await getExpenses(filterFrom, filterTo);
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
      requireAuth("Đăng nhập để thêm khoản chi.");
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
      setError("Bạn chưa có danh mục chi tiêu nào.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        categoryId: parseInt(formData.categoryId, 10),
        walletType: formData.walletType,
        amount,
        transactionDate: formData.transactionDate,
        note: formData.note.trim() || undefined,
      };

      if (editingId) {
        const data: UpdateExpenseRequest = payload;
        await updateExpense(editingId, data);
        setSuccess("Cập nhật khoản chi thành công!");
      } else {
        const data: CreateExpenseRequest = payload;
        await createExpense(data);
        setSuccess("Tạo khoản chi thành công!");
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
      requireAuth("Đăng nhập để sửa khoản chi.");
      return;
    }
    setEditingId(transaction.id);
    setFormData({
      categoryId: String(transaction.categoryId),
      walletType:
        transaction.walletType ?? "NECESSARY",
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
      requireAuth("Đăng nhập để xóa khoản chi.");
      return;
    }

    setDeleting(deleteTarget.id);
    setError("");

    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Xóa khoản chi thành công!");
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

  const getWalletLabel = (
    wallet: WalletType | null
  ): string => {
    if (!wallet) return "";
    return (
      WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
      wallet
    );
  };

  const getWalletIcon = (
    wallet: WalletType | null
  ): string => {
    if (!wallet) return "💼";
    return (
      WALLET_OPTIONS.find((w) => w.value === wallet)?.icon ||
      "💼"
    );
  };

  const totalExpense = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  if (loading) {
    return (
      <div className="exp-loading">
        <div className="exp-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="exp-page">
      <div className="exp-header">
        <h1 className="exp-title">
          Chi tiêu
          {isGuest && (
            <span className="exp-demo-badge">DEMO</span>
          )}
        </h1>
        <p className="exp-subtitle">
          Ghi lại và quản lý các khoản chi tiêu của bạn.
        </p>
      </div>

      {error && <div className="exp-error">{error}</div>}
      {success && !editingId && !hasIncome && (
        <div className="exp-success-card">
          <span className="exp-success-icon">✓</span>
          <div className="exp-success-body">
            <strong>{success}</strong>
            <p>
              Bước tiếp theo: ghi nhận khoản thu nhập để theo dõi
              dòng tiền.
            </p>
          </div>
          <button
            type="button"
            className="exp-btn-primary exp-btn-next"
            onClick={() => navigate("/incomes")}
          >
            Thêm thu nhập →
          </button>
        </div>
      )}
      {success && (editingId || hasIncome) && (
        <div className="exp-success">{success}</div>
      )}

      <div className="exp-form-card">
        <h2 className="exp-form-title">
          {editingId ? "Sửa khoản chi" : "Thêm khoản chi"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="exp-row">
            <div className="exp-field">
              <label className="exp-label">Danh mục</label>
              <CategorySelectWithAdd
                categories={categories}
                value={formData.categoryId}
                onChange={(v) =>
                  setFormData({ ...formData, categoryId: v })
                }
                type="EXPENSE"
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

            <div className="exp-field">
              <label className="exp-label">Ví</label>
              <select
                className="exp-select"
                value={formData.walletType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    walletType: e.target.value as WalletType,
                  })
                }
                disabled={isGuest}
              >
                {WALLET_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.icon} {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="exp-row">
            <div className="exp-field">
              <label className="exp-label">Số tiền</label>
              <div className="exp-input-wrapper">
                <input
                  type="text"
                  className="exp-input"
                  placeholder="0"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  disabled={isGuest}
                />
                <span className="exp-input-suffix">₫</span>
              </div>
            </div>

            <div className="exp-field">
              <label className="exp-label">Ngày</label>
              <input
                type="date"
                className="exp-input"
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

          <div className="exp-field">
            <label className="exp-label">Ghi chú</label>
            <input
              type="text"
              className="exp-input"
              placeholder="Ví dụ: Ăn tối với bạn"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              disabled={isGuest}
            />
          </div>

          <div className="exp-form-actions">
            {editingId && (
              <button
                type="button"
                className="exp-btn-secondary"
                onClick={handleCancelEdit}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="exp-btn-primary"
              disabled={submitting}
            >
              {isGuest
                ? "Đăng nhập để lưu"
                : submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Lưu khoản chi"}
            </button>
          </div>
        </form>
      </div>

      <div className="exp-filter-card">
        <div className="exp-filter-row">
          <div className="exp-field">
            <label className="exp-label">Từ ngày</label>
            <input
              type="date"
              className="exp-input"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="exp-field">
            <label className="exp-label">Đến ngày</label>
            <input
              type="date"
              className="exp-input"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="exp-summary-card">
        <span className="exp-summary-label">Tổng chi tiêu</span>
        <span className="exp-summary-value">
          {formatCurrency(totalExpense)} ₫
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="exp-empty">
          <p>Chưa có khoản chi tiêu nào.</p>
          <p className="exp-empty-hint">
            Hãy thêm khoản chi đầu tiên của bạn ở form phía trên.
          </p>
        </div>
      ) : (
        <div className="exp-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="exp-item">
              <div className="exp-item-main">
                <div className="exp-item-header">
                  <span className="exp-item-icon">
                    {getCategoryIcon(tx, categories)}
                  </span>
                  <span className="exp-item-date">
                    {formatDate(tx.transactionDate)}
                  </span>
                  <span className="exp-item-amount">
                    -{formatCurrency(tx.amount)} ₫
                  </span>
                </div>
                <div className="exp-item-info">
                  <span className="exp-item-category">
                    {tx.categoryName}
                  </span>
                  <span className="exp-item-wallet">
                    {getWalletIcon(tx.walletType)}{" "}
                    {getWalletLabel(tx.walletType)}
                  </span>
                </div>
                {tx.note && (
                  <p className="exp-item-note">{tx.note}</p>
                )}
              </div>
              <div className="exp-item-actions">
                <button
                  className="exp-btn-icon"
                  onClick={() => handleEdit(tx)}
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  className="exp-btn-icon"
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
        <div className="exp-modal-overlay">
          <div className="exp-modal">
            <h2 className="exp-modal-title">Xác nhận xóa</h2>
            <p className="exp-modal-text">
              Bạn có chắc muốn xóa khoản chi này?
            </p>
            <div className="exp-modal-actions">
              <button
                className="exp-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="exp-btn-danger"
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