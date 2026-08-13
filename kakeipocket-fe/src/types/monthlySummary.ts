import type { WalletType } from "./transaction";

export type FinancialStatus = "HEALTHY" | "WARNING" | "CRITICAL";

export interface MonthlySummaryPeriod {
  year: number;
  month: number;
  from: string;
  to: string;
}

export interface MonthlySummaryOverview {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingRate: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
}

export interface PlanComparison {
  hasPlan: boolean;
  incomeTarget: number | null;
  actualIncome: number | null;
  incomeAchievement: number | null;
  incomeDifference: number | null;
  savingTarget: number | null;
  actualSaving: number | null;
  savingAchievement: number | null;
  savingDifference: number | null;
}

export interface TopExpenseCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface TopExpenseWallet {
  walletType: WalletType;
  amount: number;
  percentage: number;
}

export interface LargestExpense {
  transactionId: number;
  amount: number;
  categoryId: number | null;
  categoryName: string | null;
  walletType: WalletType | null;
  date: string;
  note: string | null;
}

export interface PeakSpendingDay {
  date: string;
  amount: number;
}

export interface WalletSummary {
  totalWarningWallets: number;
  totalExceededWallets: number;
  hasBudgetAlert: boolean;
}

export interface MonthlyFinancialStatus {
  status: FinancialStatus;
  message: string;
}

export interface MonthlySummaryResponse {
  period: MonthlySummaryPeriod;
  overview: MonthlySummaryOverview;
  transactionSummary: TransactionSummary;
  planComparison: PlanComparison;
  topExpenseCategory: TopExpenseCategory | null;
  topExpenseWallet: TopExpenseWallet | null;
  largestExpense: LargestExpense | null;
  peakSpendingDay: PeakSpendingDay | null;
  walletSummary: WalletSummary;
  financialStatus: MonthlyFinancialStatus;
}