import { useState, useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

import { getStatistics } from "../../api/statisticsApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoStatistics } from "../../demo/statisticsDemo";

import type { StatisticsResponse } from "../../types/statistics";
import { WALLET_OPTIONS } from "../../types/transaction";
import type { WalletType } from "../../types/transaction";

import "./StatisticsPage.css";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const WALLET_COLORS: Record<WalletType, string> = {
  NECESSARY: "#2563eb",
  WANTS: "#16a34a",
  CULTURE: "#f59e0b",
  UNEXPECTED: "#dc2626",
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

const getCurrentMonth = () => {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
};

const getWalletLabel = (wallet: WalletType): string => {
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
    wallet
  );
};

const tooltipFormatter = (value: any): string => {
  let num = 0;
  if (typeof value === "number") num = value;
  else if (typeof value === "string") num = parseFloat(value);
  return `${formatCurrency(num)} ₫`;
};

const tooltipLabel = (label: any): string => {
  if (typeof label !== "string") return "";
  return `Ngày ${formatShortDate(label)}`;
};

type FilterMode = "MONTH" | "CUSTOM";

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();
  const now = getCurrentMonth();

  const [filterMode, setFilterMode] =
    useState<FilterMode>("MONTH");
  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const yearOptions = useMemo(() => {
    const arr: number[] = [];
    for (let y = now.year - 3; y <= now.year + 1; y++) arr.push(y);
    return arr;
  }, [now.year]);

  const loadStats = async (
    _mode: FilterMode,
    payload: {
      year?: number;
      month?: number;
      from?: string;
      to?: string;
    }
  ) => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setData(demoStatistics);
      setLoading(false);
      return;
    }

    try {
      const result = await getStatistics(payload);
      setData(result);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải dữ liệu thống kê.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats("MONTH", { year, month });
  }, [year, month, isGuest]);

  const handleApplyCustom = () => {
    if (!fromDate || !toDate) {
      setError("Vui lòng chọn cả ngày bắt đầu và kết thúc.");
      return;
    }
    if (fromDate > toDate) {
      setError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
      return;
    }
    setError("");
    loadStats("CUSTOM", { from: fromDate, to: toDate });
  };

  const handleClearCustom = () => {
    setFromDate("");
    setToDate("");
    setFilterMode("MONTH");
    setError("");
  };

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

  const handleQuick = (m: number) => {
    setFilterMode("MONTH");
    setMonth(m);
  };

  const handleQuickRange = (months: number) => {
    if (isGuest) {
      requireAuth("Đăng nhập để xem thống kê tùy chỉnh.");
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months + 1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
    setFilterMode("CUSTOM");
    loadStats("CUSTOM", {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
  };

  const handleRetry = () => {
    if (filterMode === "MONTH") {
      loadStats("MONTH", { year, month });
    } else {
      loadStats("CUSTOM", { from: fromDate, to: toDate });
    }
  };

  const handleViewTransactions = (categoryId: number) => {
    if (isGuest) {
      requireAuth("Đăng nhập để xem giao dịch.");
      return;
    }
    navigate(`/transactions?type=EXPENSE&categoryId=${categoryId}`);
  };

  if (loading && !data) {
    return (
      <div className="stat-loading">
        <div className="stat-loading-spinner"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="stat-error-state">
        <p className="stat-error-message">{error}</p>
        <button
          className="stat-btn-primary"
          onClick={handleRetry}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { overview, period } = data;
  const savingRateColor =
    overview.savingRate < 0
      ? "#dc2626"
      : overview.savingRate >= 20
        ? "#16a34a"
        : "#f59e0b";

  return (
    <div className="stat-page">
      <div className="stat-header">
        <div>
          <h1 className="stat-title">
            Thống kê
            {isGuest && (
              <span className="stat-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="stat-subtitle">
            Phân tích tình hình tài chính của bạn.
          </p>
        </div>
      </div>

      {error && <div className="stat-error">{error}</div>}

      <div className="stat-period-bar">
        <span className="stat-period-label">
          {period.mode === "MONTH"
            ? `${MONTH_NAMES[month - 1]} ${year}`
            : `${formatShortDate(period.from)} → ${formatShortDate(period.to)}`}
        </span>
        <span className="stat-period-mode-tag">
          {period.mode === "MONTH" ? "Tháng" : "Tùy chỉnh"}
        </span>
      </div>

      <div className="stat-controls">
        <div className="stat-mode-tabs">
          <button
            className={`stat-mode-tab ${filterMode === "MONTH" ? "active" : ""}`}
            onClick={() => {
              setFilterMode("MONTH");
              setError("");
            }}
          >
            Tháng
          </button>
          <button
            className={`stat-mode-tab ${filterMode === "CUSTOM" ? "active" : ""}`}
            onClick={() => setFilterMode("CUSTOM")}
          >
            Khoảng thời gian
          </button>
        </div>

        {filterMode === "MONTH" ? (
          <div className="stat-month-bar">
            <button
              className="stat-month-btn"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
            >
              ←
            </button>
            <select
              className="stat-select"
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
              className="stat-select"
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
              className="stat-month-btn"
              onClick={handleNextMonth}
              aria-label="Tháng sau"
            >
              →
            </button>
          </div>
        ) : (
          <div className="stat-range-bar">
            <input
              type="date"
              className="stat-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className="stat-range-arrow">→</span>
            <input
              type="date"
              className="stat-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button
              className="stat-btn-primary"
              onClick={handleApplyCustom}
            >
              Áp dụng
            </button>
            <button
              className="stat-btn-secondary"
              onClick={handleClearCustom}
            >
              Xóa
            </button>
          </div>
        )}

        <div className="stat-quick-row">
          <span className="stat-quick-label">Nhanh:</span>
          <button
            className="stat-quick-btn"
            onClick={() => handleQuick(now.month)}
          >
            Tháng này
          </button>
          <button
            className="stat-quick-btn"
            onClick={() =>
              handleQuick(now.month === 1 ? 12 : now.month - 1)
            }
          >
            Tháng trước
          </button>
          <button
            className="stat-quick-btn"
            onClick={() => handleQuickRange(3)}
          >
            3 tháng
          </button>
          <button
            className="stat-quick-btn"
            onClick={() => handleQuickRange(6)}
          >
            6 tháng
          </button>
          <button
            className="stat-quick-btn"
            onClick={() => {
              setYear(now.year);
              setMonth(1);
              setError("");
            }}
          >
            Cả năm
          </button>
        </div>
      </div>

      <div className="stat-overview-grid">
        <div className="stat-overview-card stat-overview-income">
          <span className="stat-overview-label">
            Tổng thu nhập
          </span>
          <span className="stat-overview-value">
            {formatCurrency(overview.totalIncome)} ₫
          </span>
        </div>

        <div className="stat-overview-card stat-overview-expense">
          <span className="stat-overview-label">
            Tổng chi tiêu
          </span>
          <span className="stat-overview-value">
            {formatCurrency(overview.totalExpense)} ₫
          </span>
        </div>

        <div
          className={`stat-overview-card ${overview.balance < 0 ? "stat-overview-negative" : "stat-overview-balance"}`}
        >
          <span className="stat-overview-label">Số dư</span>
          <span className="stat-overview-value">
            {formatCurrency(overview.balance)} ₫
          </span>
        </div>

        <div className="stat-overview-card">
          <span className="stat-overview-label">
            Tỷ lệ tiết kiệm
          </span>
          <span
            className="stat-overview-value"
            style={{ color: savingRateColor }}
          >
            {overview.savingRate.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="stat-card">
        <h2 className="stat-card-title">
          Thu nhập &amp; Chi tiêu theo ngày
        </h2>
        {data.incomeExpenseTrend.every(
          (d) => d.income === 0 && d.expense === 0
        ) ? (
          <div className="stat-empty">
            <p>
              Chưa có giao dịch nào trong khoảng thời gian này.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.incomeExpenseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) =>
                  `${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabel}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Thu nhập"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Chi tiêu"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="stat-grid-2">
        <div className="stat-card">
          <h2 className="stat-card-title">
            Chi tiêu theo danh mục
          </h2>
          {data.expenseByCategory.length === 0 ? (
            <div className="stat-empty">
              <p>Chưa có dữ liệu chi tiêu.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.expenseByCategory}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: any) =>
                    `${entry.categoryName}: ${entry.percentage.toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {data.expenseByCategory.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        CHART_COLORS[idx % CHART_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={tooltipFormatter}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="stat-card">
          <h2 className="stat-card-title">
            Chi tiêu theo 4 ví
          </h2>
          {data.expenseByWallet.every((w) => w.amount === 0) ? (
            <div className="stat-empty">
              <p>Chưa có dữ liệu chi tiêu theo ví.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.expenseByWallet.map((w) => ({
                  name: getWalletLabel(w.walletType),
                  amount: w.amount,
                  color:
                    WALLET_COLORS[w.walletType] || "#2563eb",
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    `${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  formatter={tooltipFormatter}
                />
                <Bar
                  dataKey="amount"
                  name="Chi tiêu"
                  radius={[6, 6, 0, 0]}
                >
                  {data.expenseByWallet.map((w, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        WALLET_COLORS[w.walletType] || "#dc2626"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="stat-card">
        <h2 className="stat-card-title">
          Thu nhập theo danh mục
        </h2>
        {data.incomeByCategory.length === 0 ? (
          <div className="stat-empty">
            <p>Chưa có dữ liệu thu nhập.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.incomeByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="categoryName"
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) =>
                  `${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={tooltipFormatter}
              />
              <Bar
                dataKey="amount"
                name="Thu nhập"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="stat-card">
        <h2 className="stat-card-title">
          Top 5 danh mục chi tiêu
        </h2>
        {data.topExpenseCategories.length === 0 ? (
          <div className="stat-empty">
            <p>Chưa có dữ liệu chi tiêu.</p>
          </div>
        ) : (
          <ol className="stat-top-list">
            {data.topExpenseCategories.map((cat, idx) => (
              <li key={cat.categoryId} className="stat-top-item">
                <div className="stat-top-rank">#{idx + 1}</div>
                <div className="stat-top-info">
                  <span className="stat-top-name">
                    {cat.categoryName}
                  </span>
                  <span className="stat-top-meta">
                    {formatCurrency(cat.amount)} ₫
                    {" · "}
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
                <button
                  className="stat-link-btn"
                  onClick={() =>
                    handleViewTransactions(cat.categoryId)
                  }
                >
                  Xem →
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="stat-card">
        <h2 className="stat-card-title">So sánh với kế hoạch tháng</h2>
        {data.monthlyPlanComparison.hasPlan ? (
          <div className="stat-compare-grid">
            <div className="stat-compare-card">
              <span className="stat-compare-label">
                Thu nhập
              </span>
              <div className="stat-compare-row">
                <span className="stat-compare-target">
                  Mục tiêu:{" "}
                  {formatCurrency(
                    data.monthlyPlanComparison.incomeTarget ?? 0
                  )}{" "}
                  ₫
                </span>
                <span className="stat-compare-actual">
                  Thực tế:{" "}
                  {formatCurrency(
                    data.monthlyPlanComparison.actualIncome ?? 0
                  )}{" "}
                  ₫
                </span>
              </div>
              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill"
                  style={{
                    width: `${Math.min(
                      data.monthlyPlanComparison.incomeAchievement ?? 0,
                      100
                    )}%`,
                    background: "#16a34a",
                  }}
                />
              </div>
              <span className="stat-compare-percent">
                Đạt{" "}
                {(
                  data.monthlyPlanComparison.incomeAchievement ?? 0
                ).toFixed(2)}
                %
              </span>
            </div>

            <div className="stat-compare-card">
              <span className="stat-compare-label">
                Tiết kiệm
              </span>
              <div className="stat-compare-row">
                <span className="stat-compare-target">
                  Mục tiêu:{" "}
                  {formatCurrency(
                    data.monthlyPlanComparison.savingTarget ?? 0
                  )}{" "}
                  ₫
                </span>
                <span className="stat-compare-actual">
                  Thực tế:{" "}
                  {formatCurrency(
                    data.monthlyPlanComparison.actualSaving ?? 0
                  )}{" "}
                  ₫
                </span>
              </div>
              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill"
                  style={{
                    width: `${Math.min(
                      data.monthlyPlanComparison.savingAchievement ?? 0,
                      100
                    )}%`,
                    background: "#2563eb",
                  }}
                />
              </div>
              <span className="stat-compare-percent">
                Đạt{" "}
                {(
                  data.monthlyPlanComparison.savingAchievement ?? 0
                ).toFixed(2)}
                %
              </span>
            </div>
          </div>
        ) : (
          <div className="stat-empty">
            <p>Chưa có kế hoạch tháng này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
