import {
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

import { getDashboard } from "../../api/dashboardApi";
import { getWalletAlerts } from "../../api/walletAlertApi";

import WalletAlertCard from "../../components/WalletAlertCard";

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

const getCurrentMonth = () => {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
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
  }, [year, month]);

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

  const yearOptions = [
    now.year - 1,
    now.year,
    now.year + 1,
  ];

  return (
    <div className="dash-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
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

      {error && <div className="dash-error">{error}</div>}

      <div className="dash-kpi-grid">
        <div className="dash-kpi-card dash-kpi-income">
          <span className="dash-kpi-label">Tổng thu nhập</span>
          <span className="dash-kpi-value">
            {formatCurrency(data.income.total)} ₫
          </span>
          {data.monthlyPlan?.incomeTarget !== null &&
            data.monthlyPlan?.incomeTarget !== undefined && (
              <div className="dash-kpi-progress-wrap">
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill dash-progress-income"
                    style={{
                      width: `${clampProgress(data.income.progress)}%`,
                    }}
                  />
                </div>
                <span className="dash-progress-text">
                  {Math.round(clampProgress(data.income.progress))}%
                </span>
              </div>
            )}
          <button
            className="dash-link-btn"
            onClick={() => navigate("/incomes")}
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
            onClick={() => navigate("/expenses")}
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
              onClick={() => navigate("/wallet-alerts")}
            >
              Xem tất cả cảnh báo →
            </button>
          )}
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Kế hoạch tháng</h2>
          {!data.monthlyPlan && (
            <button
              className="dash-btn-primary"
              onClick={() => navigate("/monthly-plan")}
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
        <h2 className="dash-section-title">Ngân sách 4 ví</h2>
        <div className="dash-wallet-grid">
          {data.wallets.map((wallet) => (
            <WalletCard key={wallet.walletType} wallet={wallet} />
          ))}
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">
            Giao dịch gần đây
          </h2>
          <button
            className="dash-btn-secondary"
            onClick={() => navigate("/transactions")}
          >
            Xem tất cả
          </button>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="dash-empty-card">
            <p>Chưa có giao dịch nào trong tháng này.</p>
          </div>
        ) : (
          <div className="dash-recent-list">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="dash-recent-item">
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
            ))}
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
                    <span className="dash-top-name">
                      {cat.categoryName}
                    </span>
                    <span className="dash-top-amount">
                      {formatCurrency(cat.totalAmount)} ₫
                    </span>
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