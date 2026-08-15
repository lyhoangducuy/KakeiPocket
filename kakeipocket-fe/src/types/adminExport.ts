export type AdminExportReportType =
  | "USERS"
  | "TRANSACTIONS"
  | "STATISTICS"
  | "MONTHLY_PLANS"
  | "CATEGORIES";

export interface AdminExportParams {
  reportType: AdminExportReportType;
  fromDate?: string; // yyyy-MM-dd
  toDate?: string;   // yyyy-MM-dd
  userId?: number;
  categoryId?: number;
  type?: "INCOME" | "EXPENSE";
}