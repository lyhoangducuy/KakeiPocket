export type WalletType =
  | "NECESSARY"
  | "WANTS"
  | "CULTURE"
  | "UNEXPECTED";

export type TransactionType = "EXPENSE" | "INCOME";

export type TransactionFilterType =
  | "ALL"
  | "EXPENSE"
  | "INCOME";

export type TransactionSort =
  | "DATE_DESC"
  | "DATE_ASC"
  | "AMOUNT_DESC"
  | "AMOUNT_ASC";

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: number;
  walletType?: WalletType;
  from?: string;
  to?: string;
  keyword?: string;
  sort?: TransactionSort;
}

export interface ExpenseTransaction {
  id: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  walletType: WalletType | null;
  amount: number;
  transactionDate: string;
  note: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionDetail {
  id: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  walletType: WalletType | null;
  amount: number;
  transactionDate: string;
  note: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseRequest {
  categoryId: number;
  walletType: WalletType;
  amount: number;
  transactionDate: string;
  note?: string;
}

export interface UpdateExpenseRequest {
  categoryId: number;
  walletType: WalletType;
  amount: number;
  transactionDate: string;
  note?: string;
}

export interface CreateIncomeRequest {
  categoryId: number;
  amount: number;
  transactionDate: string;
  note?: string;
}

export interface UpdateIncomeRequest {
  categoryId: number;
  amount: number;
  transactionDate: string;
  note?: string;
}

export const WALLET_OPTIONS: Array<{
  value: WalletType;
  label: string;
  icon: string;
}> = [
  { value: "NECESSARY", label: "Thiết yếu", icon: "🏠" },
  { value: "WANTS", label: "Mong muốn", icon: "🛒" },
  { value: "CULTURE", label: "Tinh thần", icon: "📚" },
  { value: "UNEXPECTED", label: "Phát sinh", icon: "⚠️" },
];