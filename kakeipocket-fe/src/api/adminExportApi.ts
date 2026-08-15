import api from "./axios";

import type {
  AdminExportParams,
  AdminExportReportType,
} from "../types/adminExport";

const REPORT_PATHS: Record<AdminExportReportType, string> = {
  USERS: "/admin/export/users",
  TRANSACTIONS: "/admin/export/transactions",
  STATISTICS: "/admin/export/statistics",
  MONTHLY_PLANS: "/admin/export/monthly-plans",
  CATEGORIES: "/admin/export/categories",
};

export const exportAdminReport = async (
  params: AdminExportParams
): Promise<Blob> => {
  const path = REPORT_PATHS[params.reportType];
  const query: Record<string, unknown> = {};

  if (params.fromDate) {
    query.fromDate = params.fromDate;
  }
  if (params.toDate) {
    query.toDate = params.toDate;
  }
  if (params.userId) {
    query.userId = params.userId;
  }
  if (params.categoryId) {
    query.categoryId = params.categoryId;
  }
  if (params.type) {
    query.type = params.type;
  }

  const response = await api.get(path, {
    params: query,
    responseType: "blob",
  });
  return response.data as Blob;
};

/**
 * Trigger a browser download for the given blob.
 * Honours Content-Disposition filename when present, otherwise
 * falls back to a sensible default.
 */
export const triggerBlobDownload = (
  blob: Blob,
  fallbackFilename: string
): void => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  anchor.download = fallbackFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};