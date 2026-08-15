export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "PENDING";

export type AdminUserRole = "USER" | "ADMIN";

export interface AdminUser {
  id: number;
  fullName: string | null;
  email: string;
  role: AdminUserRole | null;
  status: AdminUserStatus | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminUserStatistics {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  totalMonthlyPlans: number;
}

export interface AdminUserDetail extends AdminUser {
  statistics: AdminUserStatistics;
}

export interface AdminUserPage {
  content: AdminUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminUserListParams {
  page?: number;
  size?: number;
  keyword?: string;
  role?: AdminUserRole | "" | "ALL";
  status?: AdminUserStatus | "" | "ALL";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface UpdateAdminUserStatusRequest {
  status: AdminUserStatus;
}
