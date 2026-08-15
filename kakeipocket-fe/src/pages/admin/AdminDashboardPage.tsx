import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAdminDashboardCharts,
  getAdminDashboardSummary,
} from "../../api/adminApi";

import type {
  AdminDashboardChart,
  AdminDashboardSummary,
} from "../../types/admin";

import "./AdminDashboardPage.css";

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(
    null
  );
  const [charts, setCharts] = useState<AdminDashboardChart | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, c] = await Promise.all([
        getAdminDashboardSummary(),
        getAdminDashboardCharts(),
      ]);
      setSummary(s);
      setCharts(c);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (status === 403) {
        setError("Bạn không có quyền truy cập trang quản trị.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải dữ liệu quản trị.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !summary) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="admin-error-state">
        <p className="admin-error-message">{error}</p>
        <button
          className="admin-btn-primary"
          onClick={loadData}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const chartData = (charts?.transactionStatistics ?? []).slice().reverse();
  const userGrowth = (charts?.userGrowth ?? []).slice().reverse();

  return (
    <div className="admin-dash">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title">Tổng quan hệ thống</h2>
          <p className="admin-dash-subtitle">
            Thống kê toàn bộ người dùng và giao dịch trên KakeiPocket.
          </p>
        </div>
        <button
          className="admin-btn-secondary"
          onClick={loadData}
        >
          ↻ Làm mới
        </button>
      </div>

      {/* KPI GRID 1 */}
      <div className="admin-kpi-grid">
        <KpiCard
          label="Tổng người dùng"
          value={summary.totalUsers.toLocaleString("vi-VN")}
          hint={`+${summary.newUsers} tháng này`}
          tone="blue"
          icon="👥"
        />
        <KpiCard
          label="Tổng giao dịch"
          value={summary.totalTransactions.toLocaleString("vi-VN")}
          hint={`+${summary.newTransactions} tháng này`}
          tone="purple"
          icon="📋"
        />
        <KpiCard
          label="Tổng thu nhập"
          value={`${formatCurrency(summary.totalIncome)} ₫`}
          tone="green"
          icon="💰"
        />
        <KpiCard
          label="Tổng chi tiêu"
          value={`${formatCurrency(summary.totalExpense)} ₫`}
          tone="red"
          icon="💸"
        />
      </div>

      {/* KPI GRID 2 */}
      <div className="admin-kpi-grid admin-kpi-grid-sm">
        <KpiCard
          label="Monthly Plans"
          value={summary.totalMonthlyPlans.toLocaleString("vi-VN")}
          tone="amber"
          icon="📅"
          small
        />
        <KpiCard
          label="Wallet Limits"
          value={summary.totalWallets.toLocaleString("vi-VN")}
          tone="teal"
          icon="👛"
          small
        />
        <KpiCard
          label="User mới (tháng này)"
          value={summary.newUsers.toLocaleString("vi-VN")}
          tone="blue"
          icon="✨"
          small
        />
        <KpiCard
          label="Giao dịch mới (tháng này)"
          value={summary.newTransactions.toLocaleString("vi-VN")}
          tone="purple"
          icon="🆕"
          small
        />
      </div>

      {/* CHARTS */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">User Growth (12 tháng)</h3>
          <span className="admin-section-hint">
            Số user được tạo mỗi tháng
          </span>
        </div>
        {userGrowth.length === 0 ? (
          <div className="admin-chart-empty">
            Chưa có dữ liệu người dùng trong 12 tháng qua.
          </div>
        ) : (
          <div className="admin-chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient
                    id="admin-user-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v) => [
                    `${Number(v ?? 0)} user`,
                    "Đăng ký",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#admin-user-gradient)"
                  name="User mới"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            Transaction Statistics (12 tháng)
          </h3>
          <span className="admin-section-hint">
            Tổng thu nhập và chi tiêu theo tháng
          </span>
        </div>
        {chartData.length === 0 ? (
          <div className="admin-chart-empty">
            Chưa có dữ liệu giao dịch trong 12 tháng qua.
          </div>
        ) : (
          <div className="admin-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : v.toString()
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v) =>
                    `${formatCurrency(Number(v ?? 0))} ₫`
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  name="Thu nhập"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Chi tiêu"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">
            Income vs Expense Trend
          </h3>
          <span className="admin-section-hint">
            Xu hướng thu chi 12 tháng gần nhất
          </span>
        </div>
        {chartData.length === 0 ? (
          <div className="admin-chart-empty">
            Chưa có dữ liệu.
          </div>
        ) : (
          <div className="admin-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(0)}K`
                        : v.toString()
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                  formatter={(v) =>
                    `${formatCurrency(Number(v ?? 0))} ₫`
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="Thu nhập"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  name="Chi tiêu"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
  icon,
  small,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: string;
  icon: string;
  small?: boolean;
}) {
  return (
    <div
      className={`admin-kpi ${small ? "admin-kpi-sm" : ""} admin-kpi-${tone}`}
    >
      <div className="admin-kpi-top">
        <span className="admin-kpi-label">{label}</span>
        <span className="admin-kpi-icon">{icon}</span>
      </div>
      <span className="admin-kpi-value">{value}</span>
      {hint && <span className="admin-kpi-hint">{hint}</span>}
    </div>
  );
}
