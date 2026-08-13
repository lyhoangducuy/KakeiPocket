import {
  WALLET_OPTIONS,
  type WalletType,
} from "../types/transaction";
import type { WalletAlert } from "../types/walletAlert";

import "./WalletAlertCard.css";

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
};

const getWalletLabel = (wallet: WalletType): string => {
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.label ||
    wallet
  );
};

const getWalletIcon = (wallet: WalletType): string => {
  return (
    WALLET_OPTIONS.find((w) => w.value === wallet)?.icon || "💼"
  );
};

const getStatusLabel = (status: WalletAlert["status"]): string => {
  if (status === "EXCEEDED") return "Đã vượt ngân sách";
  if (status === "WARNING") return "Sắp vượt ngân sách";
  return "Đang trong ngân sách";
};

const getStatusMessage = (
  alert: WalletAlert
): string => {
  if (alert.status === "EXCEEDED") {
    return `Bạn đã vượt ngân sách ${formatCurrency(alert.exceededAmount)} ₫.`;
  }
  if (alert.status === "WARNING") {
    return `Bạn đã sử dụng ${alert.usagePercentage.toFixed(0)}% ngân sách.`;
  }
  return "Ngân sách đang trong mức an toàn.";
};

interface Props {
  alert: WalletAlert;
  compact?: boolean;
}

export default function WalletAlertCard({
  alert,
  compact = false,
}: Props) {
  const visualPercentage = Math.min(alert.usagePercentage, 100);
  const limitZero = alert.limit === 0;
  const noData = limitZero && alert.spent === 0;

  return (
    <div
      className={`wallet-alert-card wallet-alert-${alert.status.toLowerCase()} ${compact ? "compact" : ""}`}
    >
      <div className="wallet-alert-header">
        <div className="wallet-alert-title">
          <span className="wallet-alert-icon">
            {getWalletIcon(alert.walletType)}
          </span>
          <span className="wallet-alert-name">
            {getWalletLabel(alert.walletType)}
          </span>
        </div>
        <span
          className={`wallet-alert-badge wallet-alert-badge-${alert.status.toLowerCase()}`}
        >
          {alert.status === "EXCEEDED" && "🚨"}
          {alert.status === "WARNING" && "⚠️"}
          {alert.status === "NORMAL" && "✅"}
          {" "}
          {getStatusLabel(alert.status)}
        </span>
      </div>

      {noData ? (
        <p className="wallet-alert-empty-text">
          Bạn chưa thiết lập ngân sách cho ví này.
        </p>
      ) : (
        <>
          <div className="wallet-alert-amount">
            <span className="wallet-alert-spent">
              {formatCurrency(alert.spent)} ₫
            </span>
            <span className="wallet-alert-divider">/</span>
            <span className="wallet-alert-limit">
              {formatCurrency(alert.limit)} ₫
            </span>
          </div>

          <div className="wallet-alert-progress">
            <div
              className={`wallet-alert-progress-fill wallet-alert-fill-${alert.status.toLowerCase()}`}
              style={{ width: `${visualPercentage}%` }}
            />
          </div>

          <div className="wallet-alert-footer">
            <span className="wallet-alert-percent">
              {alert.usagePercentage.toFixed(2)}%
            </span>
            <span
              className={`wallet-alert-remaining ${alert.remaining < 0 ? "wallet-alert-remaining-negative" : ""}`}
            >
              {alert.remaining < 0
                ? `Vượt ${formatCurrency(Math.abs(alert.remaining))} ₫`
                : `Còn ${formatCurrency(alert.remaining)} ₫`}
            </span>
          </div>

          {!compact && (
            <p className="wallet-alert-message">
              {getStatusMessage(alert)}
            </p>
          )}
        </>
      )}
    </div>
  );
}