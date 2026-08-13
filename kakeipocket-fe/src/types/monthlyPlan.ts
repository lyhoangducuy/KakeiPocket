export interface MonthlyPlan {
  id: number;
  month: number;
  year: number;
  incomeTarget: number | null;
  savingTarget: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyPlanRequest {
  month: number;
  year: number;
  incomeTarget: number | null;
  savingTarget: number | null;
  note: string;
}

export interface UpdateMonthlyPlanRequest {
  month?: number;
  year?: number;
  incomeTarget?: number | null;
  savingTarget?: number | null;
  note?: string;
}
