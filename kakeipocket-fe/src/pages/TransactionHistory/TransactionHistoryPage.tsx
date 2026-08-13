import {
  useState,
  useEffect,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import { getCategories } from "../../api/categoryApi";
import {
  getTransactions,
  getTransactionById,
  updateExpense,
  updateIncome,
  deleteTransaction,
} from "../../api/transactionApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoCategories } from "../../demo/categoryDemo";
import { demoTransactions } from "../../demo/transactionDemo";

import type { Category } from "../../types/category";
import type {
  ExpenseTransaction,
  TransactionDetail,
  TransactionFilter,
  TransactionFilterType,
  TransactionSort,
  TransactionType,
  UpdateExpenseRequest,
  UpdateIncomeRequest,
  WalletType,
} from "../../types/transaction";
import { WALLET_OPTIONS } from "../../types/transaction";

import "./TransactionHistoryPage.css";

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined || value === 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return "";
  return dateStr;
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
  transactionDate: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<
    ExpenseTransaction[]
  >([]);

  const [type, setType] = useState<TransactionFilterType>("ALL");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletType, setWalletType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<TransactionSort>("DATE_DESC");

  const [detailModal, setDetailModal] =
    useState<TransactionDetail | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] =
    useState<TransactionType | null>(null);
  const [editFormData, setEditFormData] =
    useState<FormData>(initialFormData);
  const [deleteTarget, setDeleteTarget] =
    useState<ExpenseTransaction | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, []);

  useEffect(() => {
    if (type === "INCOME") {
      setWalletType("");
    }
  }, [type]);

  const loadCategories = async () => {
    if (isGuest) {
      setAllCategories(demoCategories);
      return;
    }

    try {
      const expenseCats = await getCategories("EXPENSE");
      const incomeCats = await getCategories("INCOME");
      setAllCategories([...expenseCats, ...incomeCats]);
    } catch (err: any) {
      console.error("Failed to load categories", err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setTransactions(demoTransactions);
      setLoading(false);
      return;
    }

    try {
      const filter: TransactionFilter = {};
      if (type !== "ALL") filter.type = type;
      if (categoryId) filter.categoryId = parseInt(categoryId, 10);
      if (walletType) filter.walletType = walletType as WalletType;
      if (filterFrom) filter.from = filterFrom;
      if (filterTo) filter.to = filterTo;
      if (keyword.trim()) filter.keyword = keyword.trim();
      if (sort) filter.sort = sort;

      const data = await getTransactions(filter);
      setTransactions(data);
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

  const handleApplyFilters = () => {
    if (filterFrom && filterTo && filterFrom > filterTo) {
      setError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
      return;
    }
    setError("");
    loadTransactions();
  };

  const handleClearFilters = () => {
    setType("ALL");
    setFilterFrom("");
    setFilterTo("");
    setCategoryId("");
    setWalletType("");
    setKeyword("");
    setSort("DATE_DESC");
    setError("");
  };

  const handleViewDetail = async (tx: ExpenseTransaction) => {
    if (isGuest) {
      setDetailModal({
        id: tx.id,
        type: tx.type,
        categoryId: tx.categoryId,
        categoryName: tx.categoryName,
        walletType: tx.walletType,
        amount: tx.amount,
        transactionDate: tx.transactionDate,
        note: tx.note,
      });
      return;
    }

    setError("");

    try {
      const detail = await getTransactionById(tx.id);
      setDetailModal(detail);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải chi tiết giao dịch.");
      }
    }
  };

  const handleEdit = (tx: ExpenseTransaction) => {
    if (isGuest) {
      requireAuth("Đăng nhập để sửa giao dịch.");
      return;
    }
    setEditingId(tx.id);
    setEditingType(tx.type);
    setEditFormData({
      categoryId: String(tx.categoryId),
      walletType: tx.walletType ?? "NECESSARY",
      amount: formatCurrency(tx.amount),
      transactionDate: tx.transactionDate,
      note: tx.note || "",
    });
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    setEditFormData(initialFormData);
    setError("");
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setEditFormData({
      ...editFormData,
      amount: formatCurrency(parseInt(raw, 10) || 0),
    });
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();

    if (!editingId || !editingType) return;

    if (!editFormData.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    const amountStr = editFormData.amount.replace(/[^\d]/g, "");
    const amount = parseInt(amountStr, 10) || 0;
    if (amount <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }

    if (!editFormData.transactionDate) {
      setError("Vui lòng chọn ngày.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (editingType === "EXPENSE") {
        const data: UpdateExpenseRequest = {
          categoryId: parseInt(editFormData.categoryId, 10),
          walletType: editFormData.walletType,
          amount,
          transactionDate: editFormData.transactionDate,
          note: editFormData.note.trim() || undefined,
        };
        await updateExpense(editingId, data);
      } else {
        const data: UpdateIncomeRequest = {
          categoryId: parseInt(editFormData.categoryId, 10),
          amount,
          transactionDate: editFormData.transactionDate,
          note: editFormData.note.trim() || undefined,
        };
        await updateIncome(editingId, data);
      }

      setSuccess("Cập nhật giao dịch thành công!");
      setEditingId(null);
      setEditingType(null);
      setEditFormData(initialFormData);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (isGuest) {
      requireAuth("Đăng nhập để xóa giao dịch.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Xóa giao dịch thành công!");
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
      setSubmitting(false);
    }
  };

  const getWalletLabel = (
    wallet: WalletType | null
  ): string => {
    if (!wallet) return "Không áp dụng";
    return (
      WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
      wallet
    );
  };

  const getWalletIcon = (
    wallet: WalletType | null
  ): string => {
    if (!wallet) return "—";
    return (
      WALLET_OPTIONS.find((w) => w.value === wallet)?.icon ||
      "💼"
    );
  };

  const filteredCategories = allCategories.filter((c) => {
    if (type === "ALL") return true;
    return c.type === type;
  });

  const visibleTransactions = transactions.filter((t) => {
    if (type !== "ALL" && t.type !== type) return false;
    if (categoryId && t.categoryId !== parseInt(categoryId, 10))
      return false;
    if (walletType && t.walletType !== walletType) return false;
    if (filterFrom && t.transactionDate < filterFrom) return false;
    if (filterTo && t.transactionDate > filterTo) return false;
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      const inCat = (t.categoryName || "").toLowerCase().includes(k);
      const inNote = (t.note || "").toLowerCase().includes(k);
      if (!inCat && !inNote) return false;
    }
    return true;
  });

  const sortedTransactions = visibleTransactions.slice().sort((a, b) => {
    switch (sort) {
      case "DATE_ASC":
        return a.transactionDate.localeCompare(b.transactionDate);
      case "AMOUNT_DESC":
        return b.amount - a.amount;
      case "AMOUNT_ASC":
        return a.amount - b.amount;
      case "DATE_DESC":
      default:
        return b.transactionDate.localeCompare(a.transactionDate);
    }
  });

  const totalExpense = sortedTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = sortedTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading && transactions.length === 0) {
    return (
      <div className="hist-loading">
        <div className="hist-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hist-page">
      <div className="hist-header">
        <div>
          <h1 className="hist-title">
            Lịch sử giao dịch
            {isGuest && (
              <span className="hist-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="hist-subtitle">
            Xem và quản lý các khoản thu chi của bạn.
          </p>
        </div>
      </div>

      {error && <div className="hist-error">{error}</div>}
      {success && (
        <div className="hist-success">{success}</div>
      )}

      <div className="hist-filters-card">
        <div className="hist-type-tabs">
          <button
            className={`hist-type-tab ${type === "ALL" ? "active" : ""}`}
            onClick={() => setType("ALL")}
          >
            Tất cả
          </button>
          <button
            className={`hist-type-tab ${type === "EXPENSE" ? "active" : ""}`}
            onClick={() => setType("EXPENSE")}
          >
            Chi tiêu
          </button>
          <button
            className={`hist-type-tab ${type === "INCOME" ? "active" : ""}`}
            onClick={() => setType("INCOME")}
          >
            Thu nhập
          </button>
        </div>

        <div className="hist-filter-grid">
          <div className="hist-field">
            <label className="hist-label">Từ ngày</label>
            <input
              type="date"
              className="hist-input"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="hist-field">
            <label className="hist-label">Đến ngày</label>
            <input
              type="date"
              className="hist-input"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <div className="hist-field">
            <label className="hist-label">Danh mục</label>
            <select
              className="hist-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {type !== "INCOME" && (
            <div className="hist-field">
              <label className="hist-label">Ví</label>
              <select
                className="hist-select"
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
              >
                <option value="">Tất cả ví</option>
                {WALLET_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.icon} {w.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="hist-field">
            <label className="hist-label">Sắp xếp</label>
            <select
              className="hist-select"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as TransactionSort)
              }
            >
              <option value="DATE_DESC">Mới nhất</option>
              <option value="DATE_ASC">Cũ nhất</option>
              <option value="AMOUNT_DESC">Số tiền giảm dần</option>
              <option value="AMOUNT_ASC">Số tiền tăng dần</option>
            </select>
          </div>
        </div>

        <div className="hist-search-row">
          <input
            type="text"
            className="hist-search"
            placeholder="Tìm kiếm theo danh mục hoặc ghi chú..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyFilters();
            }}
          />
          <button
            className="hist-btn-primary"
            onClick={handleApplyFilters}
          >
            Lọc
          </button>
          <button
            className="hist-btn-secondary"
            onClick={handleClearFilters}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="hist-summary-card">
        <div className="hist-summary-item">
          <span className="hist-summary-label">Số giao dịch</span>
          <span className="hist-summary-value">
            {sortedTransactions.length}
          </span>
        </div>
        <div className="hist-summary-item">
          <span className="hist-summary-label">Tổng thu</span>
          <span className="hist-summary-value hist-summary-income">
            +{formatCurrency(totalIncome)} ₫
          </span>
        </div>
        <div className="hist-summary-item">
          <span className="hist-summary-label">Tổng chi</span>
          <span className="hist-summary-value hist-summary-expense">
            -{formatCurrency(totalExpense)} ₫
          </span>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="hist-empty">
          <p>Không tìm thấy giao dịch.</p>
          <div className="hist-empty-actions">
            <button
              className="hist-btn-secondary"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để thêm chi tiêu.");
                  return;
                }
                navigate("/expenses");
              }}
            >
              + Thêm chi tiêu
            </button>
            <button
              className="hist-btn-primary"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để thêm thu nhập.");
                  return;
                }
                navigate("/incomes");
              }}
            >
              + Thêm thu nhập
            </button>
          </div>
        </div>
      ) : (
        <div className="hist-list">
          {sortedTransactions.map((tx) => (
            <div key={tx.id} className="hist-item">
              <div
                className="hist-item-main"
                onClick={() => handleViewDetail(tx)}
              >
                <div className="hist-item-header">
                  <span className="hist-item-date">
                    {formatDate(tx.transactionDate)}
                  </span>
                  <span
                    className={`hist-item-amount ${tx.type === "EXPENSE" ? "hist-amount-expense" : "hist-amount-income"}`}
                  >
                    {tx.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(tx.amount)} ₫
                  </span>
                </div>
                <div className="hist-item-info">
                  <span className="hist-item-category">
                    {tx.categoryName}
                  </span>
                  <span className="hist-item-type">
                    {tx.type === "EXPENSE" ? "Chi tiêu" : "Thu nhập"}
                  </span>
                  {tx.walletType && (
                    <span className="hist-item-wallet">
                      {getWalletIcon(tx.walletType)}{" "}
                      {getWalletLabel(tx.walletType)}
                    </span>
                  )}
                </div>
                {tx.note && (
                  <p className="hist-item-note">{tx.note}</p>
                )}
              </div>
              <div className="hist-item-actions">
                <button
                  className="hist-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(tx);
                  }}
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  className="hist-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isGuest) {
                      requireAuth("Đăng nhập để xóa giao dịch.");
                      return;
                    }
                    setDeleteTarget(tx);
                  }}
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailModal && (
        <div
          className="hist-modal-overlay"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="hist-modal hist-modal-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="hist-modal-title">Chi tiết giao dịch</h2>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Loại</span>
              <span className="hist-detail-value">
                {detailModal.type === "EXPENSE"
                  ? "Chi tiêu"
                  : "Thu nhập"}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Danh mục</span>
              <span className="hist-detail-value">
                {detailModal.categoryName}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Ví</span>
              <span className="hist-detail-value">
                {detailModal.walletType
                  ? `${getWalletIcon(detailModal.walletType)} ${getWalletLabel(detailModal.walletType)}`
                  : "Không áp dụng"}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Số tiền</span>
              <span
                className={`hist-detail-value ${detailModal.type === "EXPENSE" ? "hist-amount-expense" : "hist-amount-income"}`}
              >
                {detailModal.type === "EXPENSE" ? "-" : "+"}
                {formatCurrency(detailModal.amount)} ₫
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Ngày</span>
              <span className="hist-detail-value">
                {formatDate(detailModal.transactionDate)}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Ghi chú</span>
              <span className="hist-detail-value">
                {detailModal.note || "—"}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">Ngày tạo</span>
              <span className="hist-detail-value">
                {formatDateTime(detailModal.createdAt) || "—"}
              </span>
            </div>
            <div className="hist-detail-row">
              <span className="hist-detail-label">
                Cập nhật lần cuối
              </span>
              <span className="hist-detail-value">
                {formatDateTime(detailModal.updatedAt) || "—"}
              </span>
            </div>
            <div className="hist-modal-actions">
              <button
                className="hist-btn-secondary"
                onClick={() => setDetailModal(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {editingId !== null && editingType && !isGuest && (
        <div
          className="hist-modal-overlay"
          onClick={handleCancelEdit}
        >
          <div
            className="hist-modal hist-modal-edit"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="hist-modal-title">
              Sửa giao dịch{" "}
              {editingType === "EXPENSE" ? "chi tiêu" : "thu nhập"}
            </h2>
            <form onSubmit={handleSaveEdit}>
              <div className="hist-field">
                <label className="hist-label">Danh mục</label>
                <select
                  className="hist-select"
                  value={editFormData.categoryId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      categoryId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {allCategories
                    .filter((c) => c.type === editingType)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {editingType === "EXPENSE" && (
                <div className="hist-field">
                  <label className="hist-label">Ví</label>
                  <select
                    className="hist-select"
                    value={editFormData.walletType}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        walletType: e.target.value as WalletType,
                      })
                    }
                  >
                    {WALLET_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.icon} {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="hist-row">
                <div className="hist-field">
                  <label className="hist-label">Số tiền</label>
                  <div className="hist-input-wrapper">
                    <input
                      type="text"
                      className="hist-input"
                      placeholder="0"
                      value={editFormData.amount}
                      onChange={handleAmountChange}
                    />
                    <span className="hist-input-suffix">₫</span>
                  </div>
                </div>
                <div className="hist-field">
                  <label className="hist-label">Ngày</label>
                  <input
                    type="date"
                    className="hist-input"
                    value={editFormData.transactionDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        transactionDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="hist-field">
                <label className="hist-label">Ghi chú</label>
                <input
                  type="text"
                  className="hist-input"
                  placeholder="Ghi chú"
                  value={editFormData.note}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      note: e.target.value,
                    })
                  }
                />
              </div>

              <div className="hist-modal-actions">
                <button
                  type="button"
                  className="hist-btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="hist-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="hist-modal-overlay">
          <div className="hist-modal">
            <h2 className="hist-modal-title">Xác nhận xóa</h2>
            <p className="hist-modal-text">
              Bạn có chắc muốn xóa giao dịch này?
            </p>
            <div className="hist-modal-actions">
              <button
                className="hist-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="hist-btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
