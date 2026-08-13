export type FinancialHealth =
  | "GOOD"
  | "FAIR"
  | "WARNING"
  | "CRITICAL";

export interface AiFinancialAnalysis {
  year: number;
  month: number;
  summary: string;
  financialHealth: FinancialHealth;
  keyInsights: string[];
  warnings: string[];
  recommendations: string[];
  savingSuggestions: string[];
  nextMonthGoals: string[];
  generatedForQuestion: boolean;
  question: string | null;
}

export interface AiFinancialRequest {
  year?: number;
  month?: number;
  question?: string;
}