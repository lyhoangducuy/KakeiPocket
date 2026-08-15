import type { Category } from "../types/category";
import type {
  ExpenseTransaction,
  TransactionType,
} from "../types/transaction";

const FALLBACK_ICON: Record<TransactionType, string> = {
  EXPENSE: "💸",
  INCOME: "💰",
};

export function getCategoryIcon(
  tx:
    | ExpenseTransaction
    | {
        type: TransactionType;
        categoryId: number | null;
        categoryIcon?: string | null;
      },
  categories: Category[]
): string {
  if (tx.categoryIcon) return tx.categoryIcon;
  if (tx.categoryId != null) {
    const cat = categories.find((c) => c.id === tx.categoryId);
    if (cat?.icon) return cat.icon;
  }
  return FALLBACK_ICON[tx.type] ?? "💼";
}