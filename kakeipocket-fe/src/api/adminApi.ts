import api from "./axios";

import type {
  AdminDashboardChart,
  AdminDashboardSummary,
} from "../types/admin";

export const getAdminDashboardSummary =
  async (): Promise<AdminDashboardSummary> => {
    const response = await api.get<{
      result: AdminDashboardSummary;
    }>("/admin/dashboard/summary");
    return response.data.result;
  };

export const getAdminDashboardCharts =
  async (): Promise<AdminDashboardChart> => {
    const response = await api.get<{
      result: AdminDashboardChart;
    }>("/admin/dashboard/charts");
    return response.data.result;
  };
