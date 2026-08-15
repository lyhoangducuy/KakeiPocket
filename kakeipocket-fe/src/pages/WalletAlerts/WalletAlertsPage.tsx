import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getWalletAlerts } from "../../api/walletAlertApi";

import WalletAlertCard from "../../components/WalletAlertCard";

import { useAuth } from "../../context/AuthContext";
import { useSystemConfig } from "../../context/SystemConfigContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoWalletAlerts } from "../../demo/walletAlertDemo";

import type { WalletAlertSummary } from "../../types/walletAlert";

import "./WalletAlertsPage.css";

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

export default function WalletAlertsPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const { warningThreshold, dangerThreshold } = useSystemConfig();
  const requireAuth = useRequireAuth();
  const now = getCurrentMonth();

  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);

  const [data, setData] =
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
      const demo: WalletAlertSummary = {
        ...demoWalletAlerts,
        year: targetYear,
        month: targetMonth,
      };
      setData(demo);
      setLoading(false);
      return;
    }

    try {
      const result = await getWalletAlerts(targetYear, targetMonth);
      setData(result);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể tải cảnh báo ngân sách.");
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

  const yearOptions = [
    now.year - 1,
    now.year,
    now.year + 1,
  ];

  const isCurrentMonth =
    year === now.year && month === now.month;

  if (loading && !data) {
    return (
      <div className="wa-loading">
        <div className="wa-loading-spinner"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="wa-error-state">
        <p className="wa-error-message">{error}</p>
        <button
          className="wa-btn-primary"
          onClick={handleRetry}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const exceededWallets = data.wallets.filter(
    (w) => w.status === "EXCEEDED"
  );
  const warningWallets = data.wallets.filter(
    (w) => w.status === "WARNING"
  );
  const normalWallets = data.wallets.filter(
    (w) => w.status === "NORMAL"
  );

  return (
    <div className="wa-page">
      <div className="wa-header">
        <div>
          <h1 className="wa-title">
            Cảnh báo ngân sách
            {isGuest && (
              <span className="wa-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="wa-subtitle">
            Theo dõi mức sử dụng 4 ví trong tháng.
          </p>
        </div>

        <div className="wa-month-selector">
          <button
            className="wa-month-btn"
            onClick={handlePrevMonth}
            aria-label="Tháng trước"
          >
            ←
          </button>
          <select
            className="wa-select"
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
            className="wa-select"
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
            className="wa-month-btn"
            onClick={handleNextMonth}
            aria-label="Tháng sau"
          >
            →
          </button>
        </div>
      </div>

      {isCurrentMonth && (
        <p className="wa-period-tag">Tháng này</p>
      )}

      {error && <div className="wa-error">{error}</div>}

      <div className="wa-summary-grid">
        <div className="wa-summary-card wa-summary-total">
          <span className="wa-summary-label">
            Tổng cảnh báo
          </span>
          <span className="wa-summary-value">
            {data.totalAlerts}
          </span>
          <span className="wa-summary-hint">
            Ví cần chú ý
          </span>
        </div>
        <div className="wa-summary-card wa-summary-warning">
          <span className="wa-summary-label">Sắp vượt</span>
          <span className="wa-summary-value">
            {warningWallets.length}
          </span>
          <span className="wa-summary-hint">
            ≥ {warningThreshold}%
          </span>
        </div>
        <div className="wa-summary-card wa-summary-exceeded">
          <span className="wa-summary-label">Đã vượt</span>
          <span className="wa-summary-value">
            {exceededWallets.length}
          </span>
          <span className="wa-summary-hint">
            ≥ {dangerThreshold}%
          </span>
        </div>
        <div className="wa-summary-card wa-summary-normal">
          <span className="wa-summary-label">An toàn</span>
          <span className="wa-summary-value">
            {normalWallets.length}
          </span>
          <span className="wa-summary-hint">
            &lt; {warningThreshold}%
          </span>
        </div>
      </div>

      {!data.hasWalletConfig && (
        <div className="wa-no-config">
          <p>Bạn chưa thiết lập ngân sách cho tháng này.</p>
          <button
            className="wa-btn-primary"
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

      {data.totalAlerts === 0 && data.hasWalletConfig && (
        <div className="wa-all-safe">
          <span className="wa-all-safe-icon">✅</span>
          <p>
            Ngân sách của bạn đang được kiểm soát tốt.
          </p>
        </div>
      )}

      {exceededWallets.length > 0 && (
        <section className="wa-section">
          <h2 className="wa-section-title">
            🚨 Đã vượt ngân sách ({exceededWallets.length})
          </h2>
          <div className="wa-cards-grid">
            {exceededWallets.map((alert) => (
              <WalletAlertCard key={alert.walletType} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {warningWallets.length > 0 && (
        <section className="wa-section">
          <h2 className="wa-section-title">
            ⚠️ Sắp vượt ngân sách ({warningWallets.length})
          </h2>
          <div className="wa-cards-grid">
            {warningWallets.map((alert) => (
              <WalletAlertCard key={alert.walletType} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {normalWallets.length > 0 && (
        <section className="wa-section">
          <h2 className="wa-section-title">
            ✅ Đang trong ngân sách ({normalWallets.length})
          </h2>
          <div className="wa-cards-grid">
            {normalWallets.map((alert) => (
              <WalletAlertCard key={alert.walletType} alert={alert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}