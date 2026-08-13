import api from "./axios";

import type {
  AiFinancialAnalysis,
  AiFinancialRequest,
} from "../types/aiFinancial";

export const analyzeFinancial = async (
  payload: AiFinancialRequest
): Promise<AiFinancialAnalysis> => {
  const params: Record<string, number> = {};
  if (payload.year !== undefined) params.year = payload.year;
  if (payload.month !== undefined) params.month = payload.month;

  const body = {
    question: payload.question ?? null,
  };

  const response = await api.post<{
    result: AiFinancialAnalysis;
  }>(
    "/ai/financial-analysis",
    body,
    { params }
  );

  return response.data.result;
};