import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getMonthlySummary } from "../../api/monthlySummaryApi";

import WalletAlertCard from "../../components/WalletAlertCard";
import { getWalletAlerts } from "../../api/walletAlertApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoMonthlySummary } from "../../demo/monthlySummaryDemo";
import { demoWalletAlerts } from "../../demo/walletAlertDemo";

import type { MonthlySummaryResponse } from "../../types/monthlySummary";
import type { WalletAlertSummary } from "../../types/walletAlert";
import {
  WALLET_OPTIONS,
  type WalletType,
} from "../../types/transaction";

import "./MonthlySummaryPage.css";

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

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
};

const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

const getWalletLabel = (wallet: WalletType | null | undefined): string => {
  if (!wallet) return "—";
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
    wallet
  );
};

const getStatusInfo = (
  status: "HEALTHY" | "WARNING" | "CRITICAL"
) => {
  if (status === "CRITICAL") {
    return { label: "Nghiêm trọng", icon: "🚨", className: "ms-status-critical" };
  }
  if (status === "WARNING") {
    return { label: "Cảnh báo", icon: "⚠️", className: "ms-status-warning" };
  }
  return { label: "Ổn định", icon: "🟢", className: "ms-status-healthy" };
};

export default function MonthlySummaryPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();
  const now = getCurrentMonth();

  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);

  const [data, setData] = useState<MonthlySummaryResponse | null>(null);
  const [walletAlerts, setWalletAlerts] =
    useState<WalletAlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (
    targetYear: number,
    targetMonth: number
  ) => {
    setLoading(true);
    setError("");

    if (isGuest) {
      const summary: MonthlySummaryResponse = {
        ...demoMonthlySummary,
        period: {
          ...demoMonthlySummary.period,
          year: targetYear,
          month: targetMonth,
        },
      };
      setData(summary);
      setWalletAlerts(demoWalletAlerts);
      setLoading(false);
      return;
    }

    try {
      const [summary, alerts] = await Promise.all([
        getMonthlySummary(targetYear, targetMonth),
        getWalletAlerts(targetYear, targetMonth),
      ]);
      setData(summary);
      setWalletAlerts(alerts);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải tổng kết tháng.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(year, month);
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

  const handleRetry = () => load(year, month);

  const yearOptions = [now.year - 1, now.year, now.year + 1];

  if (loading && !data) {
    return (
      <div className="ms-loading">
        <div className="ms-loading-spinner"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="ms-error-state">
        <p className="ms-error-message">{error}</p>
        <button
          className="ms-btn-primary"
          onClick={handleRetry}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { overview, period, transactionSummary } = data;
  const statusInfo = getStatusInfo(data.financialStatus.status);

  return (
    <div className="ms-page">
      <div className="ms-header">
        <div>
          <h1 className="ms-title">
            Tổng kết tháng
            {isGuest && (
              <span className="ms-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="ms-subtitle">
            Toàn cảnh tài chính tháng{" "}
            {MONTH_NAMES[period.month - 1].toLowerCase()}{" "}
            {period.year}.
          </p>
        </div>

        <div className="ms-month-selector">
          <button
            className="ms-month-btn"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
          >
            ←
          </button>
          <select
            className="ms-select"
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
            className="ms-select"
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
          <button
            className="ms-month-btn"
            onClick={handleNextMonth}
            aria-label="Tháng sau"
          >
            →
          </button>
        </div>
      </div>

      {error && <div className="ms-error">{error}</div>}

      <div className={`ms-status-banner ${statusInfo.className}`}>
        <span className="ms-status-icon">
          {statusInfo.icon}
        </span>
        <div className="ms-status-content">
          <span className="ms-status-label">
            {statusInfo.label}
          </span>
          <p className="ms-status-message">
            {data.financialStatus.message}
          </p>
        </div>
      </div>

      <div className="ms-overview-grid">
        <div className="ms-overview-card ms-overview-income">
          <span className="ms-overview-label">
            Tổng thu nhập
          </span>
          <span className="ms-overview-value">
            {formatCurrency(overview.totalIncome)} ₫
          </span>
        </div>

        <div className="ms-overview-card ms-overview-expense">
          <span className="ms-overview-label">
            Tổng chi tiêu
          </span>
          <span className="ms-overview-value">
            {formatCurrency(overview.totalExpense)} ₫
          </span>
        </div>

        <div
          className={`ms-overview-card ${overview.balance < 0 ? "ms-overview-negative" : "ms-overview-balance"}`}
        >
          <span className="ms-overview-label">Tiết kiệm</span>
          <span className="ms-overview-value">
            {formatCurrency(overview.balance)} ₫
          </span>
        </div>

        <div className="ms-overview-card">
          <span className="ms-overview-label">
            Tỷ lệ tiết kiệm
          </span>
          <span
            className="ms-overview-value"
            style={{
              color:
                overview.savingRate < 0
                  ? "#dc2626"
                  : overview.savingRate >= 20
                    ? "#16a34a"
                    : "#f59e0b",
            }}
          >
            {overview.savingRate.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="ms-section">
        <h2 className="ms-section-title">
          So với kế hoạch tháng
        </h2>
        {data.planComparison.hasPlan ? (
          <div className="ms-plan-grid">
            <div className="ms-plan-card">
              <span className="ms-plan-label">
                Thu nhập
              </span>
              <div className="ms-plan-row">
                <span className="ms-plan-target">
                  Mục tiêu:{" "}
                  {formatCurrency(
                    data.planComparison.incomeTarget ?? 0
                  )}{" "}
                  ₫
                </span>
                <span className="ms-plan-actual">
                  Thực tế:{" "}
                  {formatCurrency(
                    data.planComparison.actualIncome ?? 0
                  )}{" "}
                  ₫
                </span>
              </div>
              <div className="ms-progress-bar">
                <div
                  className="ms-progress-fill"
                  style={{
                    width: `${Math.min(
                      data.planComparison.incomeAchievement ?? 0,
                      100
                    )}%`,
                    background: "#16a34a",
                  }}
                />
              </div>
              <div className="ms-plan-footer">
                <span className="ms-plan-achievement">
                  Đạt{" "}
                  {(
                    data.planComparison.incomeAchievement ?? 0
                  ).toFixed(2)}
                  %
                </span>
                <span
                  className={`ms-plan-diff ${(data.planComparison.incomeDifference ?? 0) < 0 ? "ms-plan-diff-negative" : ""}`}
                >
                  {(data.planComparison.incomeDifference ?? 0) < 0
                    ? `Thiếu ${formatCurrency(Math.abs(data.planComparison.incomeDifference ?? 0))} ₫`
                    : `Dư ${formatCurrency(data.planComparison.incomeDifference ?? 0)} ₫`}
                </span>
              </div>
            </div>

            <div className="ms-plan-card">
              <span className="ms-plan-label">
                Tiết kiệm
              </span>
              <div className="ms-plan-row">
                <span className="ms-plan-target">
                  Mục tiêu:{" "}
                  {formatCurrency(
                    data.planComparison.savingTarget ?? 0
                  )}{" "}
                  ₫
                </span>
                <span className="ms-plan-actual">
                  Thực tế:{" "}
                  {formatCurrency(
                    data.planComparison.actualSaving ?? 0
                  )}{" "}
                  ₫
                </span>
              </div>
              <div className="ms-progress-bar">
                <div
                  className="ms-progress-fill"
                  style={{
                    width: `${Math.min(
                      data.planComparison.savingAchievement ?? 0,
                      100
                    )}%`,
                    background: "#2563eb",
                  }}
                />
              </div>
              <div className="ms-plan-footer">
                <span className="ms-plan-achievement">
                  Đạt{" "}
                  {(
                    data.planComparison.savingAchievement ?? 0
                  ).toFixed(2)}
                  %
                </span>
                <span
                  className={`ms-plan-diff ${(data.planComparison.savingDifference ?? 0) < 0 ? "ms-plan-diff-negative" : ""}`}
                >
                  {(data.planComparison.savingDifference ?? 0) < 0
                    ? `Thiếu ${formatCurrency(Math.abs(data.planComparison.savingDifference ?? 0))} ₫`
                    : `Dư ${formatCurrency(data.planComparison.savingDifference ?? 0)} ₫`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="ms-no-plan">
            <p>Bạn chưa lập kế hoạch cho tháng này.</p>
            <button
              className="ms-btn-primary"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để lập kế hoạch tháng.");
                  return;
                }
                navigate("/monthly-plan");
              }}
            >
              Lập kế hoạch tháng
            </button>
          </div>
        )}
      </div>

      <div className="ms-section">
        <h2 className="ms-section-title">Chi tiêu nổi bật</h2>
        <div className="ms-highlight-grid">
          <div className="ms-highlight-card">
            <span className="ms-highlight-label">
              Danh mục hàng đầu
            </span>
            {data.topExpenseCategory ? (
              <>
                <span className="ms-highlight-name">
                  {data.topExpenseCategory.categoryName}
                </span>
                <span className="ms-highlight-value">
                  {formatCurrency(
                    data.topExpenseCategory.amount
                  )}{" "}
                  ₫
                </span>
                <span className="ms-highlight-meta">
                  {data.topExpenseCategory.percentage.toFixed(2)}%
                  của tổng chi
                </span>
              </>
            ) : (
              <span className="ms-highlight-empty">
                Chưa có chi tiêu.
              </span>
            )}
          </div>

          <div className="ms-highlight-card">
            <span className="ms-highlight-label">
              Ví chi nhiều nhất
            </span>
            {data.topExpenseWallet ? (
              <>
                <span className="ms-highlight-name">
                  {getWalletLabel(
                    data.topExpenseWallet.walletType
                  )}
                </span>
                <span className="ms-highlight-value">
                  {formatCurrency(data.topExpenseWallet.amount)}{" "}
                  ₫
                </span>
                <span className="ms-highlight-meta">
                  {data.topExpenseWallet.percentage.toFixed(2)}%
                  của tổng chi
                </span>
              </>
            ) : (
              <span className="ms-highlight-empty">
                Chưa có chi tiêu.
              </span>
            )}
          </div>

          <div className="ms-highlight-card">
            <span className="ms-highlight-label">
              Khoản chi lớn nhất
            </span>
            {data.largestExpense ? (
              <>
                <span className="ms-highlight-name">
                  {data.largestExpense.note ||
                    data.largestExpense.categoryName ||
                    "Không có mô tả"}
                </span>
                <span className="ms-highlight-value">
                  {formatCurrency(data.largestExpense.amount)}{" "}
                  ₫
                </span>
                <span className="ms-highlight-meta">
                  {data.largestExpense.categoryName} ·{" "}
                  {getWalletLabel(
                    data.largestExpense.walletType
                  )}{" "}
                  ·{" "}
                  {formatShortDate(
                    data.largestExpense.date
                  )}
                </span>
              </>
            ) : (
              <span className="ms-highlight-empty">
                Chưa có chi tiêu.
              </span>
            )}
          </div>

          <div className="ms-highlight-card">
            <span className="ms-highlight-label">
              Ngày chi nhiều nhất
            </span>
            {data.peakSpendingDay ? (
              <>
                <span className="ms-highlight-name">
                  {formatShortDate(data.peakSpendingDay.date)}
                </span>
                <span className="ms-highlight-value">
                  {formatCurrency(data.peakSpendingDay.amount)}{" "}
                  ₫
                </span>
                <span className="ms-highlight-meta">
                  Tổng chi trong ngày
                </span>
              </>
            ) : (
              <span className="ms-highlight-empty">
                Chưa có chi tiêu.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ms-section">
        <h2 className="ms-section-title">
          Ngân sách 4 ví
        </h2>
        {walletAlerts &&
        walletAlerts.wallets.some(
          (w) =>
            w.limit > 0 || w.spent > 0
        ) ? (
          <div className="ms-wallet-grid">
            {walletAlerts.wallets.map((alert) => (
              <WalletAlertCard
                key={alert.walletType}
                alert={alert}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="ms-empty-state">
            <p>
              Bạn chưa thiết lập ngân sách cho tháng này.
            </p>
            <button
              className="ms-btn-primary"
              onClick={() => {
                if (isGuest) {
                  requireAuth("Đăng nhập để thiết lập ngân sách.");
                  return;
                }
                navigate("/wallet-configuration");
              }}
            >
              Thiết lập ngân sách
            </button>
          </div>
        )}
      </div>

      <div className="ms-section">
        <h2 className="ms-section-title">Giao dịch</h2>
        <div className="ms-stat-grid">
          <div className="ms-stat-card">
            <span className="ms-stat-label">Tổng giao dịch</span>
            <span className="ms-stat-value">
              {transactionSummary.totalTransactions}
            </span>
          </div>
          <div className="ms-stat-card ms-stat-income">
            <span className="ms-stat-label">Thu nhập</span>
            <span className="ms-stat-value">
              {transactionSummary.incomeTransactions}
            </span>
          </div>
          <div className="ms-stat-card ms-stat-expense">
            <span className="ms-stat-label">Chi tiêu</span>
            <span className="ms-stat-value">
              {transactionSummary.expenseTransactions}
            </span>
          </div>
        </div>
      </div>

      <div className="ms-quick-actions">
        <button
          className="ms-btn-ai"
          onClick={() => {
            if (isGuest) {
              requireAuth("Đăng nhập để Kakeibo AI phân tích tài chính của bạn.");
              return;
            }
            navigate(`/ai-financial?year=${year}&month=${month}`);
          }}
        >
          <span className="ms-btn-ai-icon">🤖</span>
          Phân tích bằng AI
        </button>
        <button
          className="ms-btn-secondary"
          onClick={() => {
            if (isGuest) {
              requireAuth("Đăng nhập để xem thống kê.");
              return;
            }
            navigate(`/statistics?year=${year}&month=${month}`);
          }}
        >
          Xem thống kê
        </button>
        <button
          className="ms-btn-secondary"
          onClick={() => {
            if (isGuest) {
              requireAuth("Đăng nhập để xem lịch sử giao dịch.");
              return;
            }
            navigate("/transactions");
          }}
        >
          Xem lịch sử
        </button>
        <button
          className="ms-btn-secondary"
          onClick={() => {
            if (isGuest) {
              requireAuth("Đăng nhập để xem cảnh báo ví.");
              return;
            }
            navigate("/wallet-alerts");
          }}
        >
          Cảnh báo ví
        </button>
      </div>
    </div>
  );
}
