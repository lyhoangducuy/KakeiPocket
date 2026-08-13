import api from "./axios";

import type { MonthlySummaryResponse } from "../types/monthlySummary";

export const getMonthlySummary = async (
  year?: number,
  month?: number
): Promise<MonthlySummaryResponse> => {
  const params: Record<string, number> = {};
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;

  const response = await api.get<{
    result: MonthlySummaryResponse;
  }>("/monthly-summary", { params });

  return response.data.result;
};