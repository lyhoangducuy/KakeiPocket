export type AdminCategoryType = "EXPENSE" | "INCOME";

export interface AdminCategory {
  id: number;
  name: string;
  type: AdminCategoryType;
  icon: string | null;
  color: string | null;
  isDefault: boolean | null;
  usageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminCategoryPage {
  content: AdminCategory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AdminCategoryListParams {
  page?: number;
  size?: number;
  keyword?: string;
  type?: AdminCategoryType | "" | "ALL";
}

export interface CreateAdminCategoryRequest {
  name: string;
  type: AdminCategoryType;
  icon?: string;
  color?: string;
}

export interface UpdateAdminCategoryRequest {
  name: string;
  type: AdminCategoryType;
  icon?: string;
  color?: string;
}
