export type CategoryType = "EXPENSE" | "INCOME";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  isDefault?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export type FilterType = "ALL" | "EXPENSE" | "INCOME";
