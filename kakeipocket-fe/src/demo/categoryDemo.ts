import type { Category } from "../types/category";

export const demoCategories: Category[] = [
  // INCOME
  { id: 101, name: "Lương", type: "INCOME", icon: "💰", color: "#16a34a" },
  { id: 102, name: "Thưởng", type: "INCOME", icon: "🎁", color: "#16a34a" },
  { id: 103, name: "Freelance", type: "INCOME", icon: "💻", color: "#16a34a" },
  // EXPENSE
  { id: 201, name: "Tiền ăn", type: "EXPENSE", icon: "🍜", color: "#dc2626" },
  { id: 202, name: "Tiền thuê nhà", type: "EXPENSE", icon: "🏠", color: "#dc2626" },
  { id: 203, name: "Mua sắm", type: "EXPENSE", icon: "🛒", color: "#dc2626" },
  { id: 204, name: "Giải trí", type: "EXPENSE", icon: "🎮", color: "#dc2626" },
  { id: 205, name: "Đi lại", type: "EXPENSE", icon: "🚗", color: "#dc2626" },
];
