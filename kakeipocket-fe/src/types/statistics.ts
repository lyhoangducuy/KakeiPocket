import type { WalletType } from "./transaction";

export interface StatisticsPeriod {
  from: string;
  to: string;
  mode: "MONTH" | "CUSTOM";
}

export interface StatisticsOverview {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingRate: number;
}

export interface IncomeExpenseTrend {
  date: string;
  income: number;
  expense: number;
}

export interface CategoryStatistic {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface WalletExpenseStatistic {
  walletType: WalletType;
  amount: number;
  percentage: number;
}

export interface TopExpenseCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyPlanComparison {
  hasPlan: boolean;
  incomeTarget: number | null;
  actualIncome: number | null;
  incomeAchievement: number | null;
  savingTarget: number | null;
  actualSaving: number | null;
  savingAchievement: number | null;
}

export interface StatisticsResponse {
  period: StatisticsPeriod;

  overview: StatisticsOverview;

  incomeExpenseTrend: IncomeExpenseTrend[];

  expenseByCategory: CategoryStatistic[];

  expenseByWallet: WalletExpenseStatistic[];

  incomeByCategory: CategoryStatistic[];

  topExpenseCategories: TopExpenseCategory[];

  monthlyPlanComparison: MonthlyPlanComparison;
}

export interface StatisticsParams {
  year?: number;
  month?: number;
  from?: string;
  to?: string;
}