import api from "./axios";

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryType,
} from "../types/category";

export const getCategories = async (
  type?: CategoryType
): Promise<Category[]> => {
  const params = type ? { type } : {};
  const response = await api.get<{
    result: Category[];
  }>("/categories", { params });

  return response.data.result;
};

export const createCategory = async (
  data: CreateCategoryRequest
): Promise<Category> => {
  const response = await api.post<{
    result: Category;
  }>("/categories", data);

  return response.data.result;
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await api.put<{
    result: Category;
  }>(`/categories/${id}`, data);

  return response.data.result;
};

export const deleteCategory = async (
  id: number
): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
