import api from "./axios";

import type {
  StatisticsParams,
  StatisticsResponse,
} from "../types/statistics";

export const getStatistics = async (
  params: StatisticsParams = {}
): Promise<StatisticsResponse> => {
  const query: Record<string, string | number> = {};
  if (params.year !== undefined) query.year = params.year;
  if (params.month !== undefined) query.month = params.month;
  if (params.from !== undefined) query.from = params.from;
  if (params.to !== undefined) query.to = params.to;

  const response = await api.get<{
    result: StatisticsResponse;
  }>("/statistics", { params: query });

  return response.data.result;
};