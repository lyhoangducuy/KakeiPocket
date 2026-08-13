import type { StatisticsResponse } from "../types/statistics";

import {
  DEMO_BALANCE,
  DEMO_EXPENSE_TOTAL,
  DEMO_INCOME_TARGET,
  DEMO_INCOME_TOTAL,
  DEMO_SAVING_TARGET,
  DEMO_SAVING_TOTAL,
} from "./demoConstants";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const lastDay = new Date(year, month, 0).getDate();
const from = `${year}-${String(month).padStart(2, "0")}-01`;
const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

// daily income/expense trend (synthetic but plausible)
const trend = [];
for (let d = 1; d <= Math.min(lastDay, 30); d++) {
  const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  trend.push({
    date,
    income: d === 1 ? DEMO_INCOME_TOTAL : 0,
    expense:
      d === 2
        ? 3_500_000
        : d === 3
          ? 1_500_000
          : d === 4
            ? 1_800_000
            : d === 5
              ? 1_200_000
              : d === 6
                ? 800_000
                : d === 7
                  ? 400_000
                  : d === 8
                    ? 300_000
                    : 0,
  });
}

export const demoStatistics: StatisticsResponse = {
  period: {
    from,
    to,
    mode: "MONTH",
  },
  overview: {
    totalIncome: DEMO_INCOME_TOTAL,
    totalExpense: DEMO_EXPENSE_TOTAL,
    balance: DEMO_BALANCE,
    savingRate: (DEMO_SAVING_TOTAL / DEMO_INCOME_TOTAL) * 100,
  },
  incomeExpenseTrend: trend,
  expenseByCategory: [
    { categoryId: 202, categoryName: "Tiền thuê nhà", amount: 3_500_000, percentage: 36.84 },
    { categoryId: 201, categoryName: "Tiền ăn", amount: 1_900_000, percentage: 20.0 },
    { categoryId: 203, categoryName: "Mua sắm", amount: 1_800_000, percentage: 18.95 },
    { categoryId: 204, categoryName: "Giải trí", amount: 1_500_000, percentage: 15.79 },
    { categoryId: 205, categoryName: "Đi lại", amount: 800_000, percentage: 8.42 },
  ],
  expenseByWallet: [
    { walletType: "NECESSARY", amount: 5_000_000, percentage: 52.63 },
    { walletType: "WANTS", amount: 1_800_000, percentage: 18.95 },
    { walletType: "CULTURE", amount: 1_500_000, percentage: 15.79 },
    { walletType: "UNEXPECTED", amount: 1_000_000, percentage: 10.53 },
  ],
  incomeByCategory: [
    { categoryId: 101, categoryName: "Lương", amount: 15_000_000, percentage: 100 },
  ],
  topExpenseCategories: [
    { categoryId: 202, categoryName: "Tiền thuê nhà", amount: 3_500_000, percentage: 36.84 },
    { categoryId: 201, categoryName: "Tiền ăn", amount: 1_900_000, percentage: 20.0 },
    { categoryId: 203, categoryName: "Mua sắm", amount: 1_800_000, percentage: 18.95 },
    { categoryId: 204, categoryName: "Giải trí", amount: 1_500_000, percentage: 15.79 },
    { categoryId: 205, categoryName: "Đi lại", amount: 800_000, percentage: 8.42 },
  ],
  monthlyPlanComparison: {
    hasPlan: true,
    incomeTarget: DEMO_INCOME_TARGET,
    actualIncome: DEMO_INCOME_TOTAL,
    incomeAchievement: (DEMO_INCOME_TOTAL / DEMO_INCOME_TARGET) * 100,
    savingTarget: DEMO_SAVING_TARGET,
    actualSaving: DEMO_SAVING_TOTAL,
    savingAchievement: (DEMO_SAVING_TOTAL / DEMO_SAVING_TARGET) * 100,
  },
};
