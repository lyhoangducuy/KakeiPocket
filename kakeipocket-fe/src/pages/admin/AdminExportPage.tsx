import { useMemo, useState } from "react";

import {
  exportAdminReport,
  triggerBlobDownload,
} from "../../api/adminExportApi";

import type {
  AdminExportReportType,
} from "../../types/adminExport";

import "./AdminExportPage.css";

interface ReportOption {
  value: AdminExportReportType;
  label: string;
  description: string;
  hasDateRange: boolean;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    value: "USERS",
    label: "Người dùng",
    description:
      "Danh sách toàn bộ người dùng trong hệ thống (không bao gồm mật khẩu).",
    hasDateRange: false,
  },
  {
    value: "TRANSACTIONS",
    label: "Giao dịch",
    description:
      "Danh sách giao dịch thu chi theo khoảng thời gian và bộ lọc.",
    hasDateRange: true,
  },
  {
    value: "STATISTICS",
    label: "Thống kê hệ thống",
    description:
      "Số liệu tổng quan: tổng user, giao dịch, thu nhập, chi tiêu, monthly plan.",
    hasDateRange: false,
  },
  {
    value: "MONTHLY_PLANS",
    label: "Monthly Plans",
    description:
      "Danh sách các kế hoạch tài chính hàng tháng của người dùng.",
    hasDateRange: false,
  },
  {
    value: "CATEGORIES",
    label: "Danh mục hệ thống",
    description:
      "Danh sách các danh mục mặc định do Admin quản lý.",
    hasDateRange: false,
  },
];

const FILENAME_BASE: Record<AdminExportReportType, string> = {
  USERS: "kakeipocket-users",
  TRANSACTIONS: "kakeipocket-transactions",
  STATISTICS: "kakeipocket-statistics",
  MONTHLY_PLANS: "kakeipocket-monthly-plans",
  CATEGORIES: "kakeipocket-categories",
};

const todayIso = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthAgoIso = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatErrorMessage = (
  err: any
): string => {
  const sc = err?.response?.status;
  if (sc === 403) {
    return "Bạn không có quyền xuất báo cáo.";
  }
  if (sc === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (sc === 400) {
    return err?.response?.data?.message ||
      "Khoảng thời gian không hợp lệ.";
  }
  return err?.response?.data?.message ||
    "Không thể xuất báo cáo. Vui lòng thử lại.";
};

export default function AdminExportPage() {
  const [reportType, setReportType] =
    useState<AdminExportReportType>("TRANSACTIONS");
  const [fromDate, setFromDate] = useState<string>(monthAgoIso());
  const [toDate, setToDate] = useState<string>(todayIso());
  const [txType, setTxType] = useState<"" | "INCOME" | "EXPENSE">("");

  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const option = useMemo(
    () =>
      REPORT_OPTIONS.find((o) => o.value === reportType) ??
      REPORT_OPTIONS[0],
    [reportType]
  );

  const dateRangeError = useMemo(() => {
    if (!option.hasDateRange) return "";
    if (fromDate && toDate && fromDate > toDate) {
      return "Ngày bắt đầu không được lớn hơn ngày kết thúc.";
    }
    return "";
  }, [option.hasDateRange, fromDate, toDate]);

  const handleExport = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (option.hasDateRange && dateRangeError) {
      setErrorMsg(dateRangeError);
      return;
    }

    setExporting(true);
    try {
      const blob = await exportAdminReport({
        reportType,
        fromDate: option.hasDateRange ? fromDate : undefined,
        toDate: option.hasDateRange ? toDate : undefined,
        type: txType || undefined,
      });

      const filename = `${FILENAME_BASE[reportType]}-${todayIso()}.xlsx`;
      triggerBlobDownload(blob, filename);
      setSuccessMsg(`Đã xuất báo cáo: ${filename}`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(formatErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-export-page">
      <div className="admin-export-header">
        <div>
          <h2 className="admin-export-title">Export báo cáo</h2>
          <p className="admin-export-subtitle">
            Xuất dữ liệu hệ thống ra file Excel (.xlsx).
          </p>
        </div>
      </div>

      <div className="admin-export-card">
        <div className="admin-export-field">
          <label className="admin-export-label">Loại báo cáo</label>
          <select
            className="admin-export-select"
            value={reportType}
            onChange={(e) =>
              setReportType(
                e.target.value as AdminExportReportType
              )
            }
            disabled={exporting}
          >
            {REPORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="admin-export-hint">{option.description}</p>
        </div>

        {option.hasDateRange && (
          <>
            <div className="admin-export-grid">
              <div className="admin-export-field">
                <label className="admin-export-label">
                  Từ ngày
                </label>
                <input
                  type="date"
                  className="admin-export-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled={exporting}
                />
              </div>
              <div className="admin-export-field">
                <label className="admin-export-label">
                  Đến ngày
                </label>
                <input
                  type="date"
                  className="admin-export-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled={exporting}
                />
              </div>
            </div>

            <div className="admin-export-field">
              <label className="admin-export-label">
                Loại giao dịch (tùy chọn)
              </label>
              <select
                className="admin-export-select"
                value={txType}
                onChange={(e) =>
                  setTxType(
                    e.target.value as "" | "INCOME" | "EXPENSE"
                  )
                }
                disabled={exporting}
              >
                <option value="">Tất cả</option>
                <option value="INCOME">Thu nhập</option>
                <option value="EXPENSE">Chi tiêu</option>
              </select>
            </div>
          </>
        )}

        {dateRangeError && (
          <div className="admin-export-validation-error">
            {dateRangeError}
          </div>
        )}

        {errorMsg && (
          <div className="admin-export-validation-error">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="admin-export-success">{successMsg}</div>
        )}

        <div className="admin-export-actions">
          <button
            type="button"
            className="admin-export-btn-primary"
            onClick={handleExport}
            disabled={exporting || !!dateRangeError}
          >
            {exporting ? "Đang xuất Excel..." : "Xuất Excel"}
          </button>
        </div>
      </div>

      <div className="admin-export-info">
        <h3 className="admin-export-info-title">Lưu ý</h3>
        <ul className="admin-export-info-list">
          <li>
            File xuất ra là định dạng .xlsx, có thể mở bằng Microsoft
            Excel hoặc LibreOffice.
          </li>
          <li>
            Mật khẩu và thông tin bảo mật KHÔNG được bao gồm trong
            báo cáo.
          </li>
          <li>
            Số liệu thống kê đồng nhất với Dashboard quản trị.
          </li>
          <li>
            Khoảng thời gian chỉ áp dụng cho báo cáo Giao dịch.
          </li>
        </ul>
      </div>
    </div>
  );
}