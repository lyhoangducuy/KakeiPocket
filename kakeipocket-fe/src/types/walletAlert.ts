import type { WalletType } from "./transaction";

export type WalletAlertStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export interface WalletAlert {
  walletType: WalletType;
  limit: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  status: WalletAlertStatus;
  exceededAmount: number;
}

export interface WalletAlertSummary {
  year: number;
  month: number;
  totalAlerts: number;
  hasWarning: boolean;
  hasExceeded: boolean;
  hasWalletConfig: boolean;
  wallets: WalletAlert[];
}