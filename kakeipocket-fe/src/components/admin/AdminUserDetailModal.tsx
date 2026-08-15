import { useEffect, useState } from "react";

import { getAdminUserDetail } from "../../api/adminUserApi";

import type { AdminUserDetail } from "../../types/adminUser";

import "./AdminUserDetailModal.css";

interface AdminUserDetailModalProps {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
};

const formatDateTime = (dateStr: string | null): string => {
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
};

export default function AdminUserDetailModal({
  userId,
  open,
  onClose,
}: AdminUserDetailModalProps) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || userId === null) return;
    let cancelled = false;

    setLoading(true);
    setError("");
    setDetail(null);

    (async () => {
      try {
        const data = await getAdminUserDetail(userId);
        if (!cancelled) setDetail(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          setError("Người dùng không tồn tại.");
        } else if (status === 403) {
          setError("Bạn không có quyền xem chi tiết người dùng.");
        } else {
          setError(
            err?.response?.data?.message ||
              "Không thể tải thông tin người dùng."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-modal-header">
          <h3>Thông tin người dùng</h3>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="admin-modal-loading">
            <div className="admin-modal-spinner"></div>
            <span>Đang tải...</span>
          </div>
        )}

        {error && !loading && (
          <div className="admin-modal-error">{error}</div>
        )}

        {detail && !loading && !error && (
          <div className="admin-modal-body">
            <div className="admin-modal-section">
              <div className="admin-modal-info-grid">
                <InfoRow
                  label="ID"
                  value={`#${detail.id}`}
                />
                <InfoRow
                  label="Họ tên"
                  value={detail.fullName || "—"}
                />
                <InfoRow
                  label="Email"
                  value={detail.email}
                />
                <InfoRow
                  label="Role"
                  value={
                    <span
                      className={`admin-role-badge admin-role-${detail.role}`}
                    >
                      {detail.role || "—"}
                    </span>
                  }
                />
                <InfoRow
                  label="Trạng thái"
                  value={
                    <span
                      className={`admin-status-badge admin-status-${detail.status}`}
                    >
                      {statusIcon(detail.status)} {detail.status || "—"}
                    </span>
                  }
                />
                <InfoRow
                  label="Ngày đăng ký"
                  value={formatDateTime(detail.createdAt)}
                />
                <InfoRow
                  label="Cập nhật"
                  value={formatDateTime(detail.updatedAt)}
                />
              </div>
            </div>

            <div className="admin-modal-section">
              <h4 className="admin-modal-section-title">
                Thống kê người dùng
              </h4>
              <div className="admin-modal-stat-grid">
                <StatTile
                  label="Tổng giao dịch"
                  value={detail.statistics.totalTransactions.toLocaleString(
                    "vi-VN"
                  )}
                />
                <StatTile
                  label="Tổng thu nhập"
                  value={`${formatCurrency(
                    detail.statistics.totalIncome
                  )} ₫`}
                />
                <StatTile
                  label="Tổng chi tiêu"
                  value={`${formatCurrency(
                    detail.statistics.totalExpense
                  )} ₫`}
                />
                <StatTile
                  label="Monthly Plans"
                  value={detail.statistics.totalMonthlyPlans.toLocaleString(
                    "vi-VN"
                  )}
                />
              </div>
            </div>
          </div>
        )}

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-modal-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="admin-info-row">
      <span className="admin-info-label">{label}</span>
      <span className="admin-info-value">{value}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="admin-stat-tile">
      <span className="admin-stat-tile-label">{label}</span>
      <span className="admin-stat-tile-value">{value}</span>
    </div>
  );
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
