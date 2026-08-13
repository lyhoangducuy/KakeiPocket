import api from "./axios";

import type {
  CreateExpenseRequest,
  CreateIncomeRequest,
  ExpenseTransaction,
  TransactionDetail,
  TransactionFilter,
  UpdateExpenseRequest,
  UpdateIncomeRequest,
} from "../types/transaction";

export const getTransactions = async (
  filter?: TransactionFilter
): Promise<ExpenseTransaction[]> => {
  const params: Record<string, string> = {};

  if (filter?.type) params.type = filter.type;
  if (filter?.categoryId)
    params.categoryId = String(filter.categoryId);
  if (filter?.walletType) params.walletType = filter.walletType;
  if (filter?.from) params.from = filter.from;
  if (filter?.to) params.to = filter.to;
  if (filter?.keyword && filter.keyword.trim())
    params.keyword = filter.keyword.trim();
  if (filter?.sort) params.sort = filter.sort;

  const response = await api.get<{
    result: ExpenseTransaction[];
  }>("/transactions", { params });

  return response.data.result;
};

export const getTransactionById = async (
  id: number
): Promise<TransactionDetail> => {
  const response = await api.get<{
    result: TransactionDetail;
  }>(`/transactions/${id}`);

  return response.data.result;
};

export const createExpense = async (
  data: CreateExpenseRequest
): Promise<ExpenseTransaction> => {
  const response = await api.post<{
    result: ExpenseTransaction;
  }>("/transactions/expense", data);

  return response.data.result;
};

export const createIncome = async (
  data: CreateIncomeRequest
): Promise<ExpenseTransaction> => {
  const response = await api.post<{
    result: ExpenseTransaction;
  }>("/transactions/income", data);

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

export const getIncomes = async (
  from?: string,
  to?: string
): Promise<ExpenseTransaction[]> => {
  const params: { from?: string; to?: string } = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get<{
    result: ExpenseTransaction[];
  }>("/transactions/incomes", { params });

  return response.data.result;
};

export const updateExpense = async (
  id: number,
  data: UpdateExpenseRequest
): Promise<ExpenseTransaction> => {
  const response = await api.put<{
    result: ExpenseTransaction;
  }>(`/transactions/${id}/expense`, data);

  return response.data.result;
};

export const updateIncome = async (
  id: number,
  data: UpdateIncomeRequest
): Promise<ExpenseTransaction> => {
  const response = await api.put<{
    result: ExpenseTransaction;
  }>(`/transactions/${id}/income`, data);

  return response.data.result;
};

export const deleteTransaction = async (
  id: number
): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};