import type { MonthlySummaryResponse } from "../types/monthlySummary";

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

export const demoMonthlySummary: MonthlySummaryResponse = {
  period: {
    year,
    month,
    from,
    to,
  },
  overview: {
    totalIncome: DEMO_INCOME_TOTAL,
    totalExpense: DEMO_EXPENSE_TOTAL,
    balance: DEMO_BALANCE,
    savingRate: (DEMO_SAVING_TOTAL / DEMO_INCOME_TOTAL) * 100,
  },
  transactionSummary: {
    totalTransactions: 8,
    incomeTransactions: 1,
    expenseTransactions: 7,
  },
  planComparison: {
    hasPlan: true,
    incomeTarget: DEMO_INCOME_TARGET,
    actualIncome: DEMO_INCOME_TOTAL,
    incomeAchievement: (DEMO_INCOME_TOTAL / DEMO_INCOME_TARGET) * 100,
    incomeDifference: 0,
    savingTarget: DEMO_SAVING_TARGET,
    actualSaving: DEMO_SAVING_TOTAL,
    savingAchievement: (DEMO_SAVING_TOTAL / DEMO_SAVING_TARGET) * 100,
    savingDifference: 0,
  },
  topExpenseCategory: {
    categoryId: 202,
    categoryName: "Tiền thuê nhà",
    categoryIcon: "🏠",
    amount: 3_500_000,
    percentage: 36.84,
  },
  topExpenseWallet: {
    walletType: "NECESSARY",
    amount: 5_000_000,
    percentage: 52.63,
  },
  largestExpense: {
    transactionId: 2,
    amount: 3_500_000,
    categoryId: 202,
    categoryName: "Tiền thuê nhà",
    categoryIcon: "🏠",
    walletType: "NECESSARY",
    date: from,
    note: "Tiền thuê phòng",
  },
  peakSpendingDay: {
    date: from,
    amount: 3_500_000,
  },
  walletSummary: {
    totalWarningWallets: 1,
    totalExceededWallets: 3,
    hasBudgetAlert: true,
  },
  financialStatus: {
    status: "WARNING",
    message:
      "Bạn đã sử dụng hết ngân sách 3 trên 4 ví. Cần điều chỉnh chi tiêu trong các ngày còn lại của tháng.",
  },
};
