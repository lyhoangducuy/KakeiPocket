import api from "./axios";

import type {
  AdminUser,
  AdminUserDetail,
  AdminUserListParams,
  AdminUserPage,
  UpdateAdminUserStatusRequest,
} from "../types/adminUser";

export const getAdminUsers = async (
  params: AdminUserListParams = {}
): Promise<AdminUserPage> => {
  const query: Record<string, unknown> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  };

  if (params.keyword && params.keyword.trim()) {
    query.keyword = params.keyword.trim();
  }
  if (
    params.role &&
    params.role !== "ALL" &&
    (params.role as string) !== ""
  ) {
    query.role = params.role;
  }
  if (
    params.status &&
    params.status !== "ALL" &&
    (params.status as string) !== ""
  ) {
    query.status = params.status;
  }
  if (params.sortBy) {
    query.sortBy = params.sortBy;
  }
  if (params.sortDirection) {
    query.sortDirection = params.sortDirection;
  }

  const response = await api.get<{ result: AdminUserPage }>(
    "/admin/users",
    { params: query }
  );
  return response.data.result;
};

export const getAdminUserDetail = async (
  id: number
): Promise<AdminUserDetail> => {
  const response = await api.get<{ result: AdminUserDetail }>(
    `/admin/users/${id}`
  );
  return response.data.result;
};

export const updateAdminUserStatus = async (
  id: number,
  payload: UpdateAdminUserStatusRequest
): Promise<AdminUser> => {
  const response = await api.patch<{ result: AdminUser }>(
    `/admin/users/${id}/status`,
    payload
  );
  return response.data.result;
};
