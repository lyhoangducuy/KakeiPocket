import api from "./axios";

import type {
  SystemConfig,
  UpdateSystemConfigRequest,
} from "../types/systemConfig";

export const getAdminSystemConfig =
    async (): Promise<SystemConfig> => {
  const response = await api.get<{ result: SystemConfig }>(
    "/admin/system-config"
  );
  return response.data.result;
};

export const updateAdminSystemConfig = async (
  payload: UpdateSystemConfigRequest
): Promise<SystemConfig> => {
  const response = await api.put<{ result: SystemConfig }>(
    "/admin/system-config",
    payload
  );
  return response.data.result;
};

// Public endpoint -- for any authenticated or guest user reading
// the threshold values used for UI hint labels.
export const getBudgetThresholds =
    async (): Promise<SystemConfig> => {
  const response = await api.get<{ result: SystemConfig }>(
    "/system-config/budget-thresholds"
  );
  return response.data.result;
};
