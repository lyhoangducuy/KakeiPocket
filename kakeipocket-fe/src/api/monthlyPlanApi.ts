import api from "./axios";

import type {
  MonthlyPlan,
  CreateMonthlyPlanRequest,
  UpdateMonthlyPlanRequest,
} from "../types/monthlyPlan";

export const createMonthlyPlan = async (
  data: CreateMonthlyPlanRequest
): Promise<MonthlyPlan> => {
  const response = await api.post<{ result: MonthlyPlan }>(
    "/monthly-plans",
    data
  );

  return response.data.result;
};

export const getCurrentMonthlyPlan =
  async (): Promise<MonthlyPlan | null> => {
    try {
      const response = await api.get<{ result: MonthlyPlan }>(
        "/monthly-plans/current"
      );

      return response.data.result;
    } catch (error: any) {
      if (
        error.response?.status === 404 ||
        error.response?.data?.code === 1104
      ) {
        return null;
      }

      throw error;
    }
  };

export const updateMonthlyPlan = async (
  id: number,
  data: UpdateMonthlyPlanRequest
): Promise<MonthlyPlan> => {
  const response = await api.put<{ result: MonthlyPlan }>(
    `/monthly-plans/${id}`,
    data
  );

  return response.data.result;
};
