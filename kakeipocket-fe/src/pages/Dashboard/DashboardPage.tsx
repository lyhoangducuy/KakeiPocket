import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboard } from "../../api/dashboardApi";
import { getWalletAlerts } from "../../api/walletAlertApi";

import WalletAlertCard from "../../components/WalletAlertCard";
import SetupProgress, {
  computeSetupState,
  type SetupState,
} from "../../components/SetupProgress";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoDashboard } from "../../demo/dashboardDemo";
import { demoWalletAlerts } from "../../demo/walletAlertDemo";
import { demoCategories } from "../../demo/categoryDemo";

import type {
  DashboardResponse,
  WalletSummary,
} from "../../types/dashboard";
import type { WalletAlertSummary } from "../../types/walletAlert";
import { WALLET_OPTIONS } from "../../types/transaction";
import type { WalletType } from "../../types/transaction";

import "./DashboardPage.css";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const getCurrentMonth = () => {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
};

type QuickActionTone = "create" | "view" | "ai" | "data";

interface QuickAction {
  key: string;
  label: string;
  sub: string;
  icon: string;
  tone: QuickActionTone;
  path?: string;
  requiresAuth: boolean;
  authMessage: string;
}

const buildQuickActions = (
  setup: SetupState
): QuickAction[] => {
  const current = getCurrentMonth();
  const monthLabel = MONTH_NAMES[current.month - 1];

  const all: QuickAction[] = [
    {
      key: "plan",
      label: "Thêm kế hoạch",
      sub: "Bước 1: thiết lập mục tiêu tháng",
      icon: "📅",
      tone: "create",
      path: "/monthly-plan",
      requiresAuth: true,
      authMessage: "Đăng nhập để tạo kế hoạch tháng.",
    },
    {
      key: "wallet",
      label: "Thêm giới hạn ví",
      sub: "Bước 2: thiết lập hạn mức 4 ví",
      icon: "👛",
      tone: "create",
      path: "/wallet-configuration",
      requiresAuth: true,
      authMessage: "Đăng nhập để thiết lập giới hạn ví.",
    },
    {
      key: "expense",
      label: "Thêm chi tiêu",
      sub: "Bước 3: ghi nhận khoản chi",
      icon: "➕",
      tone: "create",
      path: "/expenses",
      requiresAuth: true,
      authMessage: "Đăng nhập để thêm chi tiêu.",
    },
    {
      key: "income",
      label: "Thêm thu nhập",
      sub: "Bước 4: ghi nhận khoản thu",
      icon: "💰",
      tone: "create",
      path: "/incomes",
      requiresAuth: true,
      authMessage: "Đăng nhập để thêm thu nhập.",
    },
    {
      key: "transactions",
      label: "Giao dịch",
      sub: "Lịch sử thu chi",
      icon: "📋",
      tone: "view",
      path: "/transactions",
      requiresAuth: false,
      authMessage: "",
    },
    {
      key: "statistics",
      label: "Thống kê",
      sub: "Biểu đồ chi tiêu",
      icon: "📊",
      tone: "view",
      path: "/statistics",
      requiresAuth: false,
      authMessage: "",
    },
    {
      key: "monthly-summary",
      label: "Tổng kết tháng",
      sub: `Tổng kết ${monthLabel}`,
      icon: "📈",
      tone: "data",
      path: `/monthly-summary?year=${current.year}&month=${current.month}`,
      requiresAuth: false,
      authMessage: "",
    },
    {
      key: "ai",
      label: "Kakeibo AI",
      sub: "Trợ lý tài chính",
      icon: "🤖",
      tone: "ai",
      path: `/ai-financial?year=${current.year}&month=${current.month}`,
      requiresAuth: false,
      authMessage: "",
    },
  ];

  const flowKeys = ["plan", "wallet", "expense", "income"];
  const flowOrder: Record<string, number> = {
    plan: 0,
    wallet: 1,
    expense: 2,
    income: 3,
  };
  const completedFlow: Record<string, boolean> = {
    plan: setup.hasPlan,
    wallet: setup.hasWalletLimit,
    expense: setup.hasExpense,
    income: setup.hasIncome,
  };

  all.sort((a, b) => {
    const aFlow = flowKeys.includes(a.key);
    const bFlow = flowKeys.includes(b.key);

    if (aFlow && !bFlow) return -1;
    if (!aFlow && bFlow) return 1;

    if (aFlow && bFlow) {
      const aDone = completedFlow[a.key];
      const bDone = completedFlow[b.key];
      if (aDone !== bDone) {
        return aDone ? 1 : -1;
      }
      return flowOrder[a.key] - flowOrder[b.key];
    }

    return 0;
  });

  return all;
};

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const getWalletLabel = (
  wallet: WalletType
): string => {
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
    wallet
  );
};

const getWalletIcon = (
  wallet: WalletType
): string => {
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.icon ||
    "💼"
  );
};

const clampProgress = (
  pct: number | null | undefined
): number => {
  if (pct === null || pct === undefined) return 0;
  return Math.max(0, Math.min(100, pct));
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const now = getCurrentMonth();

  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [alerts, setAlerts] =
    useState<WalletAlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async (
    targetYear: number,
    targetMonth: number
  ) => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setData(demoDashboard);
      setAlerts(demoWalletAlerts);
      setLoading(false);
      return;
    }

    try {
      const [dashboardData, alertsData] = await Promise.all([
        getDashboard(targetYear, targetMonth),
        getWalletAlerts(targetYear, targetMonth),
      ]);
      setData(dashboardData);
      setAlerts(alertsData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải dữ liệu Dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(year, month);
  }, [year, month, isGuest]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleRetry = () => {
    loadDashboard(year, month);
  };

  const isCurrentMonth =
    year === now.year && month === now.month;

  if (loading && !data) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-spinner"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dash-error-state">
        <p className="dash-error-message">{error}</p>
        <button
          className="dash-btn-primary"
          onClick={handleRetry}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const setupState = computeSetupState(data);

  const yearOptions = [
    now.year - 1,
    now.year,
    now.year + 1,
  ];

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">
            Dashboard
            {isGuest && (
              <span className="dash-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="dash-subtitle">
            Tổng quan tài chính cá nhân của bạn.
          </p>
        </div>
        <div className="dash-month-selector">
          <button
            className="dash-month-btn"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
          >
            ←
          </button>
          <div className="dash-month-controls">
            <select
              className="dash-select"
              value={month}
              onChange={(e) =>
                setMonth(parseInt(e.target.value, 10))
              }
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className="dash-select"
              value={year}
              onChange={(e) =>
                setYear(parseInt(e.target.value, 10))
              }
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            className="dash-month-btn"
            onClick={handleNextMonth}
            aria-label="Tháng sau"
          >
            →
          </button>
        </div>
      </div>

      {isCurrentMonth && (
        <p className="dash-period-tag">Tháng này</p>
      )}

      <SetupProgress state={setupState} />

      {error && <div className="dash-error">{error}</div>}

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card dash-kpi-income">
          <span className="dash-kpi-label">Tổng thu nhập</span>
          <span className="dash-kpi-value">
            {formatCurrency(data.income.total)} ₫
          </span>
          {data.monthlyPlan?.incomeTarget !== null &&
            data.monthlyPlan?.incomeTarget !== undefined}
          <button
            className="dash-link-btn"
            onClick={() => {
              if (isGuest) {
                requireAuth("Đăng nhập để xem thu nhập của bạn.");
                return;
              }
              navigate("/incomes");
            }}
          >
            Xem thu nhập →
          </button>
        </div>

        <div className="dash-kpi-card dash-kpi-expense">
          <span className="dash-kpi-label">Tổng chi tiêu</span>
          <span className="dash-kpi-value">
            {formatCurrency(data.expense.total)} ₫
          </span>
          <button
            className="dash-link-btn"
            onClick={() => {
              if (isGuest) {
                requireAuth("Đăng nhập để xem chi tiêu của bạn.");
                return;
              }
              navigate("/expenses");
            }}
          >
            Xem chi tiêu →
          </button>
        </div>

        <div
          className={`dash-kpi-card ${data.balance < 0 ? "dash-kpi-negative" : "dash-kpi-balance"}`}
        >
          <span className="dash-kpi-label">Số dư</span>
          <span className="dash-kpi-value">
            {formatCurrency(data.balance)} ₫
          </span>
          <span className="dash-kpi-hint">
            Thu nhập − Chi tiêu
          </span>
          {data.balance < 0 && (
            <p className="dash-warning-text">
              Bạn đang chi nhiều hơn thu.
            </p>
          )}
        </div>
      </div>

      {alerts && (
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">
              Cảnh báo ngân sách
            </h2>
            {alerts.totalAlerts > 0 && (
              <span
                className={`dash-alert-count ${
                  alerts.hasExceeded
                    ? "dash-alert-count-danger"
                    : "dash-alert-count-warning"
                }`}
              >
                {alerts.totalAlerts} ví cần chú ý
              </span>
            )}
          </div>

          {alerts.totalAlerts === 0 ? (
            <div className="dash-alert-safe">
              <span className="dash-alert-safe-icon">✅</span>
              <p>
                Ngân sách của bạn đang được kiểm soát tốt.
              </p>
            </div>
          ) : (
            <div className="dash-alert-list">
              {alerts.wallets
                .filter((a) => a.status !== "NORMAL")
                .map((alert) => (
                  <WalletAlertCard
                    key={alert.walletType}
                    alert={alert}
                    compact
                  />
                ))}
            </div>
          )}

          {alerts.totalAlerts > 0 && (
            <button
              className="dash-btn-secondary dash-alert-view-all"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để xem cảnh báo ngân sách.");
                  return;
                }
                navigate("/wallet-alerts");
              }}
            >
              Xem tất cả cảnh báo →
            </button>
          )}
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Thao tác nhanh</h2>
          <span className="dash-section-hint">
            Truy cập nhanh các chức năng thường dùng
          </span>
        </div>

        <div className="dash-quick-grid">
          {buildQuickActions(setupState).map((action) => {
            const requiresAuth = action.requiresAuth;
            const disabled =
              requiresAuth && isGuest;

            return (
              <button
                key={action.key}
                type="button"
                className={`dash-quick-tile dash-quick-tile-${action.tone} ${
                  disabled ? "dash-quick-tile-disabled" : ""
                }`}
                onClick={() => {
                  if (isGuest && requiresAuth) {
                    requireAuth(action.authMessage);
                    return;
                  }
                  if (action.path) {
                    navigate(action.path);
                  }
                }}
                disabled={disabled}
              >
                <span className="dash-quick-tile-icon">
                  {action.icon}
                </span>
                <span className="dash-quick-tile-label">
                  {action.label}
                </span>
                <span className="dash-quick-tile-sub">
                  {action.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Kế hoạch tháng</h2>
          {!data.monthlyPlan && (
            <button
              className="dash-btn-primary"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để thiết lập kế hoạch tháng.");
                  return;
                }
                navigate("/monthly-plan");
              }}
            >
              Thiết lập ngay
            </button>
          )}
        </div>

        {!data.monthlyPlan ? (
          <div className="dash-empty-card">
            <p>Bạn chưa thiết lập kế hoạch tháng này.</p>
          </div>
        ) : (
          <div className="dash-plan-grid">
            <div className="dash-plan-card">
              <span className="dash-plan-label">
                Thu nhập mục tiêu
              </span>
              <span className="dash-plan-value">
                {formatCurrency(data.monthlyPlan.incomeTarget)} ₫
              </span>
              <div className="dash-progress-bar">
                <div
                  className="dash-progress-fill dash-progress-income"
                  style={{
                    width: `${clampProgress(data.income.progress)}%`,
                  }}
                />
              </div>
              <span className="dash-plan-actual">
                Đạt{" "}
                {formatCurrency(data.income.total)} ₫ /{" "}
                {Math.round(clampProgress(data.income.progress))}%
              </span>
            </div>

            <div className="dash-plan-card">
              <span className="dash-plan-label">
                Mục tiêu tiết kiệm
              </span>
              <span className="dash-plan-value">
                {formatCurrency(data.monthlyPlan.savingTarget)} ₫
              </span>
              <div className="dash-progress-bar">
                <div
                  className="dash-progress-fill dash-progress-saving"
                  style={{
                    width: `${clampProgress(data.saving.progress)}%`,
                  }}
                />
              </div>
              <span className="dash-plan-actual">
                Đã tiết kiệm{" "}
                {formatCurrency(data.saving.actual)} ₫ /{" "}
                {Math.round(clampProgress(data.saving.progress))}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Ngân sách 4 ví</h2>
          {data.monthlyPlan && !setupState.hasWalletLimit && (
            <button
              className="dash-btn-primary"
              onClick={() => {
                if (isGuest) {
                  requireAuth(
                    "Đăng nhập để thiết lập giới hạn ví."
                  );
                  return;
                }
                navigate("/wallet-configuration");
              }}
            >
              Thiết lập giới hạn
            </button>
          )}
        </div>
        {data.wallets.length === 0 ||
        data.wallets.every((w) => w.limit === 0) ? (
          <div className="dash-empty-card">
            <p>
              Bạn đã có kế hoạch tháng. Bước tiếp theo là thiết lập
              giới hạn cho từng ví.
            </p>
            <button
              className="dash-btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                if (isGuest) {
                  requireAuth(
                    "Đăng nhập để thiết lập giới hạn ví."
                  );
                  return;
                }
                navigate("/wallet-configuration");
              }}
            >
              Thêm giới hạn ví
            </button>
          </div>
        ) : (
          <div className="dash-wallet-grid">
            {data.wallets.map((wallet) => (
              <WalletCard
                key={wallet.walletType}
                wallet={wallet}
              />
            ))}
          </div>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">
            Giao dịch gần đây
          </h2>
          <button
            className="dash-btn-secondary"
            onClick={() => {
              if (isGuest) {
                requireAuth("Đăng nhập để xem lịch sử giao dịch.");
                return;
              }
              navigate("/transactions");
            }}
          >
            Xem tất cả
          </button>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="dash-empty-card">
            <p>Bạn chưa có khoản chi tiêu nào.</p>
            <p className="dash-empty-hint">
              Bắt đầu bằng cách ghi nhận khoản chi đầu tiên.
            </p>
            <button
              className="dash-btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để thêm chi tiêu.");
                  return;
                }
                navigate("/expenses");
              }}
            >
              Thêm chi tiêu
            </button>
          </div>
        ) : (
          <div className="dash-recent-list">
            {data.recentTransactions.map((tx) => {
              const catIcon =
                tx.categoryId != null
                  ? demoCategories.find((c) => c.id === tx.categoryId)?.icon
                  : null;
              const fallback =
                tx.type === "EXPENSE" ? "💸" : "💰";
              return (
                <div
                  key={tx.id}
                  className="dash-recent-item"
                >
                  <span className="dash-recent-icon">
                    {catIcon ?? fallback}
                  </span>
                  <div className="dash-recent-info">
                    <span className="dash-recent-category">
                      {tx.categoryName ?? "—"}
                    </span>
                    <span className="dash-recent-date">
                      {formatDate(tx.transactionDate)}
                    </span>
                  </div>
                  <span
                    className={`dash-recent-amount ${tx.type === "EXPENSE" ? "dash-amount-expense" : "dash-amount-income"}`}
                  >
                    {tx.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(tx.amount)} ₫
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dash-section">
        <h2 className="dash-section-title">
          Chi tiêu theo danh mục
        </h2>
        {data.topExpenseCategories.length === 0 ? (
          <div className="dash-empty-card">
            <p>Chưa có dữ liệu chi tiêu trong tháng này.</p>
          </div>
        ) : (
          <div className="dash-top-list">
            {(() => {
              const max = Math.max(
                ...data.topExpenseCategories.map(
                  (c) => c.totalAmount
                ),
                1
              );
              return data.topExpenseCategories.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="dash-top-item"
                >
                  <div className="dash-top-info">
                    <span className="dash-top-icon">
                      {cat.categoryIcon ?? "💸"}
                    </span>
                    <div className="dash-top-text">
                      <span className="dash-top-name">
                        {cat.categoryName}
                      </span>
                      <span className="dash-top-amount">
                        {formatCurrency(cat.totalAmount)} ₫
                      </span>
                    </div>
                  </div>
                  <div className="dash-progress-bar">
                    <div
                      className="dash-progress-fill dash-progress-expense"
                      style={{
                        width: `${Math.max(
                          (cat.totalAmount / max) * 100,
                          2
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function WalletCard({
  wallet,
}: {
  wallet: WalletSummary;
}) {
  const isExceeded = wallet.spent > wallet.limit && wallet.limit > 0;

  return (
    <div
      className={`dash-wallet-card ${isExceeded ? "dash-wallet-exceeded" : ""}`}
    >
      <div className="dash-wallet-header">
        <span className="dash-wallet-icon">
          {getWalletIcon(wallet.walletType)}
        </span>
        <span className="dash-wallet-name">
          {getWalletLabel(wallet.walletType)}
        </span>
      </div>
      <div className="dash-wallet-amount">
        <span className="dash-wallet-spent">
          {formatCurrency(wallet.spent)} ₫
        </span>
        <span className="dash-wallet-divider">/</span>
        <span className="dash-wallet-limit">
          {formatCurrency(wallet.limit)} ₫
        </span>
      </div>
      <div className="dash-progress-bar">
        <div
          className={`dash-progress-fill ${isExceeded ? "dash-progress-danger" : "dash-progress-expense"}`}
          style={{
            width: `${Math.min(wallet.percentage, 100)}%`,
          }}
        />
      </div>
      <div className="dash-wallet-footer">
        <span className="dash-wallet-percent">
          {Math.round(wallet.percentage)}%
        </span>
        <span
          className={`dash-wallet-remaining ${wallet.remaining < 0 ? "dash-amount-expense" : ""}`}
        >
          Còn {formatCurrency(wallet.remaining)} ₫
        </span>
      </div>
    </div>
  );
}
