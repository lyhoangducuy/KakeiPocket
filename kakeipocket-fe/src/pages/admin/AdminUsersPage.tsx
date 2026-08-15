import { useEffect, useMemo, useState } from "react";

import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../../api/adminUserApi";

import { useAuth } from "../../context/AuthContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

import ConfirmModal from "../../components/ConfirmModal";
import AdminUserDetailModal from "../../components/admin/AdminUserDetailModal";

import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from "../../types/adminUser";

import "./AdminUsersPage.css";

type RoleFilter = "ALL" | AdminUserRole;
type StatusFilter = "ALL" | AdminUserStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "🟢 Active" },
  { value: "BLOCKED", label: "🔴 Blocked" },
  { value: "INACTIVE", label: "⚪ Inactive" },
  { value: "PENDING", label: "🟡 Pending" },
];

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả role" },
  { value: "USER", label: "USER" },
  { value: "ADMIN", label: "ADMIN" },
];

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { } = useAuth();

  const [page, setPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const debouncedKeyword = useDebouncedValue(keywordInput, 400);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const [confirmTarget, setConfirmTarget] =
    useState<AdminUser | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({
        page,
        size: PAGE_SIZE,
        keyword: debouncedKeyword,
        role: role === "ALL" ? "" : role,
        status: status === "ALL" ? "" : status,
        sortBy: "createdAt",
        sortDirection: "desc",
      });
      setUsers(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (statusCode === 403) {
        setError("Bạn không có quyền truy cập.");
      } else if (statusCode === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Không thể tải danh sách người dùng."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedKeyword, role, status]);

  const handleRoleChange = (next: RoleFilter) => {
    setPage(0);
    setRole(next);
  };

  const handleStatusChange = (next: StatusFilter) => {
    setPage(0);
    setStatus(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handleStatusToggle = (user: AdminUser) => {
    setActionError("");
    setConfirmTarget(user);
  };

  const handleConfirmStatus = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    const nextStatus: AdminUserStatus =
      target.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    setConfirmBusy(true);
    try {
      const updated = await updateAdminUserStatus(target.id, {
        status: nextStatus,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      setConfirmTarget(null);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (statusCode === 400) {
        setActionError(
          err?.response?.data?.message ||
            "Không thể thay đổi trạng thái tài khoản này."
        );
      } else {
        setActionError(
          err?.response?.data?.message ||
            "Đã xảy ra lỗi. Vui lòng thử lại."
        );
      }
    } finally {
      setConfirmBusy(false);
    }
  };

  const showingFrom = useMemo(() => {
    if (users.length === 0) return 0;
    return page * PAGE_SIZE + 1;
  }, [users.length, page]);

  const showingTo = useMemo(
    () => page * PAGE_SIZE + users.length,
    [users.length, page]
  );

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <h2 className="admin-users-title">Quản lý người dùng</h2>
          <p className="admin-users-subtitle">
            Danh sách tất cả người dùng trong hệ thống KakeiPocket.
          </p>
        </div>
        <button
          type="button"
          className="admin-users-refresh"
          onClick={loadUsers}
        >
          ↻ Làm mới
        </button>
      </div>

      {/* FILTERS */}
      <div className="admin-users-filters">
        <form
          className="admin-users-search"
          onSubmit={handleSearchSubmit}
        >
          <span className="admin-users-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
        </form>

        <select
          className="admin-users-select"
          value={role}
          onChange={(e) =>
            handleRoleChange(e.target.value as RoleFilter)
          }
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="admin-users-select"
          value={status}
          onChange={(e) =>
            handleStatusChange(e.target.value as StatusFilter)
          }
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th style={{ width: 100 }}>Role</th>
              <th style={{ width: 130 }}>Trạng thái</th>
              <th style={{ width: 160 }}>Ngày đăng ký</th>
              <th style={{ width: 200 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-users-state">
                  <div className="admin-users-spinner"></div>
                  Đang tải...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="admin-users-state admin-users-error">
                  <span>{error}</span>
                  <button
                    className="admin-users-retry"
                    onClick={loadUsers}
                  >
                    Thử lại
                  </button>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-users-state">
                  Không tìm thấy người dùng.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isBlocked = u.status === "BLOCKED";
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.fullName || "—"}</td>
                    <td className="admin-users-email">{u.email}</td>
                    <td>
                      <span
                        className={`admin-role-badge admin-role-${u.role}`}
                      >
                        {u.role || "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge admin-status-${u.status}`}
                      >
                        {statusIcon(u.status)} {u.status || "—"}
                      </span>
                    </td>
                    <td>{formatDateTime(u.createdAt)}</td>
                    <td>
                      <div className="admin-users-actions">
                        <button
                          type="button"
                          className="admin-action-btn admin-action-view"
                          onClick={() => setDetailUserId(u.id)}
                        >
                          Xem
                        </button>
                        <button
                          type="button"
                          className={`admin-action-btn ${
                            isBlocked
                              ? "admin-action-unlock"
                              : "admin-action-lock"
                          }`}
                          onClick={() => handleStatusToggle(u)}
                          title={
                            isBlocked
                              ? "Mở khóa tài khoản"
                              : "Khóa tài khoản"
                          }
                        >
                          {isBlocked ? "Mở khóa" : "Khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="admin-users-pagination">
        <span className="admin-users-total">
          Tổng cộng{" "}
          <strong>{totalElements.toLocaleString("vi-VN")}</strong> người
          dùng
          {users.length > 0 && (
            <>
              {" "}— Hiển thị {showingFrom}-{showingTo}
            </>
          )}
        </span>

        <div className="admin-users-pager">
          <button
            type="button"
            className="admin-pager-btn"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            ← Trước
          </button>
          <span className="admin-pager-info">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            className="admin-pager-btn"
            disabled={page >= totalPages - 1 || loading}
            onClick={() =>
              setPage((p) =>
                totalPages > 0 ? Math.min(p + 1, totalPages - 1) : p
              )
            }
          >
            Sau →
          </button>
        </div>
      </div>

      {actionError && (
        <div className="admin-users-action-error">{actionError}</div>
      )}

      {/* DETAIL MODAL */}
      <AdminUserDetailModal
        open={detailUserId !== null}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmTarget !== null}
        title={
          confirmTarget?.status === "BLOCKED"
            ? "Mở khóa tài khoản"
            : "Khóa tài khoản"
        }
        message={
          confirmTarget?.status === "BLOCKED"
            ? "Bạn có chắc muốn mở khóa tài khoản này? Người dùng sẽ có thể đăng nhập trở lại."
            : "Bạn có chắc muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập."
        }
        details={
          confirmTarget
            ? [
                { label: "Họ tên", value: confirmTarget.fullName || "—" },
                { label: "Email", value: confirmTarget.email },
              ]
            : undefined
        }
        confirmLabel={
          confirmTarget?.status === "BLOCKED"
            ? "Mở khóa tài khoản"
            : "Khóa tài khoản"
        }
        variant={
          confirmTarget?.status === "BLOCKED" ? "primary" : "danger"
        }
        busy={confirmBusy}
        onConfirm={handleConfirmStatus}
        onCancel={() => {
          if (!confirmBusy) {
            setConfirmTarget(null);
            setActionError("");
          }
        }}
      />
    </div>
  );
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusIcon(status: string | null): string {
  switch (status) {
    case "ACTIVE":
      return "🟢";
    case "BLOCKED":
      return "🔴";
    case "INACTIVE":
      return "⚪";
    case "PENDING":
      return "🟡";
    default:
      return "⚪";
  }
}
