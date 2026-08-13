import api from "./axios";

import type { DashboardResponse } from "../types/dashboard";

export const getDashboard = async (
  year?: number,
  month?: number
): Promise<DashboardResponse> => {
  const params: Record<string, number> = {};
  if (year !== undefined) params.year = year;
  if (month !== undefined) params.month = month;

  const response = await api.get<{
    result: DashboardResponse;
  }>("/dashboard", { params });

  return response.data.result;
};