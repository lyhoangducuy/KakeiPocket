import type { DashboardResponse } from "../types/dashboard";

import { demoMonthlyPlan } from "./monthlyPlanDemo";
import { demoTransactions } from "./transactionDemo";
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

export const demoDashboard: DashboardResponse = {
  year,
  month,
  monthlyPlan: {
    id: demoMonthlyPlan.id,
    incomeTarget: DEMO_INCOME_TARGET,
    savingTarget: DEMO_SAVING_TARGET,
    note: demoMonthlyPlan.note,
  },
  income: {
    total: DEMO_INCOME_TOTAL,
    target: DEMO_INCOME_TARGET,
    progress: (DEMO_INCOME_TOTAL / DEMO_INCOME_TARGET) * 100,
  },
  expense: {
    total: DEMO_EXPENSE_TOTAL,
  },
  balance: DEMO_BALANCE,
  saving: {
    target: DEMO_SAVING_TARGET,
    actual: DEMO_SAVING_TOTAL,
    progress: (DEMO_SAVING_TOTAL / DEMO_SAVING_TARGET) * 100,
  },
  wallets: [
    {
      walletType: "NECESSARY",
      limit: 5_000_000,
      spent: 5_000_000,
      remaining: 0,
      percentage: 100,
    },
    {
      walletType: "WANTS",
      limit: 3_000_000,
      spent: 1_800_000,
      remaining: 1_200_000,
      percentage: 60,
    },
    {
      walletType: "CULTURE",
      limit: 1_500_000,
      spent: 1_500_000,
      remaining: 0,
      percentage: 100,
    },
    {
      walletType: "UNEXPECTED",
      limit: 1_000_000,
      spent: 1_000_000,
      remaining: 0,
      percentage: 100,
    },
  ],
  recentTransactions: demoTransactions
    .slice()
    .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))
    .reverse()
    .slice(0, 6),
  topExpenseCategories: [
    {
      categoryId: 202,
      categoryName: "Tiền thuê nhà",
      totalAmount: 3_500_000,
    },
    {
      categoryId: 203,
      categoryName: "Mua sắm",
      totalAmount: 1_800_000,
    },
    {
      categoryId: 201,
      categoryName: "Tiền ăn",
      totalAmount: 1_900_000,
    },
    {
      categoryId: 204,
      categoryName: "Giải trí",
      totalAmount: 1_500_000,
    },
    {
      categoryId: 205,
      categoryName: "Đi lại",
      totalAmount: 800_000,
    },
  ],
};
