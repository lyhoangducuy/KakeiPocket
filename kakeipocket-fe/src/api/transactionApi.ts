import api from "./axios";

import type {
  CreateExpenseRequest,
  ExpenseTransaction,
  UpdateExpenseRequest,
} from "../types/transaction";

export const createExpense = async (
  data: CreateExpenseRequest
): Promise<ExpenseTransaction> => {
  const response = await api.post<{
    result: ExpenseTransaction;
  }>("/transactions/expense", data);

  return response.data.result;
};

export const getExpenses = async (
  from?: string,
  to?: string
): Promise<ExpenseTransaction[]> => {
  const params: { from?: string; to?: string } = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get<{
    result: ExpenseTransaction[];
  }>("/transactions/expenses", { params });

  return response.data.result;
};

export const getExpenseById = async (
  id: number
): Promise<ExpenseTransaction> => {
  const response = await api.get<{
    result: ExpenseTransaction;
  }>(`/transactions/${id}`);

  return response.data.result;
};

export const updateExpense = async (
  id: number,
  data: UpdateExpenseRequest
): Promise<ExpenseTransaction> => {
  const response = await api.put<{
    result: ExpenseTransaction;
  }>(`/transactions/${id}`, data);

  return response.data.result;
};

export const deleteExpense = async (
  id: number
): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};
