import type {
  TransactionType,
  WalletType,
} from "./transaction";

export interface MonthlyPlanSummary {
  id: number;
  incomeTarget: number | null;
  savingTarget: number | null;
  note: string | null;
}

export interface IncomeSummary {
  total: number;
  target: number | null;
  progress: number;
}

export interface ExpenseSummary {
  total: number;
}

export interface SavingSummary {
  target: number | null;
  actual: number;
  progress: number;
}

export interface WalletSummary {
  walletType: WalletType;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface RecentTransaction {
  id: number;
  type: TransactionType;
  categoryId: number | null;
  categoryName: string | null;
  walletType: WalletType | null;
  amount: number;
  transactionDate: string;
  note: string | null;
}

export interface TopExpenseCategory {
  categoryId: number;
  categoryName: string;
  categoryIcon?: string | null;
  totalAmount: number;
}

export interface DashboardResponse {
  year: number;
  month: number;

  monthlyPlan: MonthlyPlanSummary | null;

  income: IncomeSummary;
  expense: ExpenseSummary;
  balance: number;

  saving: SavingSummary;

  wallets: WalletSummary[];

  recentTransactions: RecentTransaction[];

  topExpenseCategories: TopExpenseCategory[];
}