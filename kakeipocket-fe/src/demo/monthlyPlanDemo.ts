import type { MonthlyPlan } from "../types/monthlyPlan";

import { DEMO_INCOME_TARGET, DEMO_SAVING_TARGET } from "./demoConstants";

export const demoMonthlyPlan: MonthlyPlan = {
  id: 999,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  incomeTarget: DEMO_INCOME_TARGET,
  savingTarget: DEMO_SAVING_TARGET,
  note:
    "Tháng này muốn hạn chế mua sắm và tiết kiệm cho chuyến đi Nhật vào mùa thu.",
  createdAt: "2026-08-01T09:00:00",
  updatedAt: "2026-08-01T09:00:00",
};
