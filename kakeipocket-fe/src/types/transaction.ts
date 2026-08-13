export type WalletType =
  | "NECESSARY"
  | "WANTS"
  | "CULTURE"
  | "UNEXPECTED";

export type TransactionType = "EXPENSE" | "INCOME";

export interface ExpenseTransaction {
  id: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  walletType: WalletType;
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
