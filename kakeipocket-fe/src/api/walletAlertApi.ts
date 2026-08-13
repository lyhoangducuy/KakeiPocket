import api from "./axios";

import type { WalletAlertSummary } from "../types/walletAlert";

export const getWalletAlerts = async (
  year?: number,
  month?: number
): Promise<WalletAlertSummary> => {
  const params: Record<string, number> = {};
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;

  const response = await api.get<{
    result: WalletAlertSummary;
  }>("/wallet-alerts", { params });

  return response.data.result;
};