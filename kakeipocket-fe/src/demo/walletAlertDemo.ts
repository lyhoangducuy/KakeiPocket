import type { WalletAlertSummary } from "../types/walletAlert";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

export const demoWalletAlerts: WalletAlertSummary = {
  year,
  month,
  totalAlerts: 3,
  hasWarning: true,
  hasExceeded: true,
  hasWalletConfig: true,
  wallets: [
    {
      walletType: "NECESSARY",
      limit: 5_000_000,
      spent: 5_000_000,
      remaining: 0,
      usagePercentage: 100,
      status: "EXCEEDED",
      exceededAmount: 0,
    },
    {
      walletType: "WANTS",
      limit: 3_000_000,
      spent: 1_800_000,
      remaining: 1_200_000,
      usagePercentage: 60,
      status: "WARNING",
      exceededAmount: 0,
    },
    {
      walletType: "CULTURE",
      limit: 1_500_000,
      spent: 1_500_000,
      remaining: 0,
      usagePercentage: 100,
      status: "EXCEEDED",
      exceededAmount: 0,
    },
    {
      walletType: "UNEXPECTED",
      limit: 1_000_000,
      spent: 1_000_000,
      remaining: 0,
      usagePercentage: 100,
      status: "EXCEEDED",
      exceededAmount: 0,
    },
  ],
};
