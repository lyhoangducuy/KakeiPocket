import api from "./axios";

import type {
  AdminCategory,
  AdminCategoryListParams,
  AdminCategoryPage,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "../types/adminCategory";

export const getAdminCategories = async (
  params: AdminCategoryListParams = {}
): Promise<AdminCategoryPage> => {
  const query: Record<string, unknown> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  };

  if (params.keyword && params.keyword.trim()) {
    query.keyword = params.keyword.trim();
  }
  if (
    params.type &&
    params.type !== "ALL" &&
    (params.type as string) !== ""
  ) {
    query.type = params.type;
  }

  const response = await api.get<{ result: AdminCategoryPage }>(
    "/admin/categories",
    { params: query }
  );
  return response.data.result;
};

export const getAdminCategoryById = async (
  id: number
): Promise<AdminCategory> => {
  const response = await api.get<{ result: AdminCategory }>(
    `/admin/categories/${id}`
  );
  return response.data.result;
};

export const createAdminCategory = async (
  payload: CreateAdminCategoryRequest
): Promise<AdminCategory> => {
  const response = await api.post<{ result: AdminCategory }>(
    "/admin/categories",
    payload
  );
  return response.data.result;
};

export const updateAdminCategory = async (
  id: number,
  payload: UpdateAdminCategoryRequest
): Promise<AdminCategory> => {
  const response = await api.put<{ result: AdminCategory }>(
    `/admin/categories/${id}`,
    payload
  );
  return response.data.result;
};

export const deleteAdminCategory = async (
  id: number
): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};
