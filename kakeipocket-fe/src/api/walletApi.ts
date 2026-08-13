import api from "./axios";

import type {
  WalletLimitsRequest,
  WalletLimitsResponse,
} from "../types/walletLimit";

export const getWalletLimits = async (
  planId: number
): Promise<WalletLimitsResponse> => {
  const response = await api.get<{
    result: WalletLimitsResponse;
  }>(`/monthly-plans/${planId}/wallets`);

  return response.data.result;
};

export const saveWalletLimits = async (
  planId: number,
  data: WalletLimitsRequest
): Promise<WalletLimitsResponse> => {
  const response = await api.put<{
    result: WalletLimitsResponse;
  }>(`/monthly-plans/${planId}/wallets`, data);

  return response.data.result;
};
