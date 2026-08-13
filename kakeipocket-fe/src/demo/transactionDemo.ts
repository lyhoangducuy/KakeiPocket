import type { ExpenseTransaction } from "../types/transaction";

import { demoCategories } from "./categoryDemo";
import {
  DEMO_EXPENSE_TOTAL,
  DEMO_INCOME_TOTAL,
} from "./demoConstants";

const catName = (id: number): string =>
  demoCategories.find((c) => c.id === id)?.name ?? "Khác";

const today = new Date();
const dateStr = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

export const demoTransactions: ExpenseTransaction[] = [
  // INCOME
  {
    id: 1,
    type: "INCOME",
    categoryId: 101,
    categoryName: catName(101),
    walletType: null,
    amount: 15_000_000,
    transactionDate: dateStr(0),
    note: "Lương tháng này",
  },
  // EXPENSE
  {
    id: 2,
    type: "EXPENSE",
    categoryId: 202,
    categoryName: catName(202),
    walletType: "NECESSARY",
    amount: 3_500_000,
    transactionDate: dateStr(1),
    note: "Tiền thuê phòng",
  },
  {
    id: 3,
    type: "EXPENSE",
    categoryId: 201,
    categoryName: catName(201),
    walletType: "NECESSARY",
    amount: 1_500_000,
    transactionDate: dateStr(2),
    note: "Ăn uống cả tuần",
  },
  {
    id: 4,
    type: "EXPENSE",
    categoryId: 203,
    categoryName: catName(203),
    walletType: "WANTS",
    amount: 1_800_000,
    transactionDate: dateStr(3),
    note: "Mua áo mới",
  },
  {
    id: 5,
    type: "EXPENSE",
    categoryId: 204,
    categoryName: catName(204),
    walletType: "CULTURE",
    amount: 1_200_000,
    transactionDate: dateStr(4),
    note: "Xem phim + cafe",
  },
  {
    id: 6,
    type: "EXPENSE",
    categoryId: 205,
    categoryName: catName(205),
    walletType: "UNEXPECTED",
    amount: 800_000,
    transactionDate: dateStr(5),
    note: "Xăng xe + gửi xe",
  },
  {
    id: 7,
    type: "EXPENSE",
    categoryId: 201,
    categoryName: catName(201),
    walletType: "NECESSARY",
    amount: 400_000,
    transactionDate: dateStr(6),
    note: "Ăn sáng",
  },
  {
    id: 8,
    type: "EXPENSE",
    categoryId: 204,
    categoryName: catName(204),
    walletType: "CULTURE",
    amount: 300_000,
    transactionDate: dateStr(7),
    note: "Sách",
  },
];

// Sanity check totals match the documented demo numbers
const sumIncome = demoTransactions
  .filter((t) => t.type === "INCOME")
  .reduce((s, t) => s + t.amount, 0);
const sumExpense = demoTransactions
  .filter((t) => t.type === "EXPENSE")
  .reduce((s, t) => s + t.amount, 0);

if (sumIncome !== DEMO_INCOME_TOTAL) {
  console.warn(
    `[demo] demoTransactions income total ${sumIncome} != ${DEMO_INCOME_TOTAL}`
  );
}
if (sumExpense !== DEMO_EXPENSE_TOTAL) {
  console.warn(
    `[demo] demoTransactions expense total ${sumExpense} != ${DEMO_EXPENSE_TOTAL}`
  );
}
