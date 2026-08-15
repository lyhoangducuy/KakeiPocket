import { useEffect, useState } from "react";

import {
  getAdminSystemConfig,
  updateAdminSystemConfig,
} from "../../api/systemConfigApi";

import "./AdminSystemConfigPage.css";

interface FormState {
  warningThreshold: string;
  dangerThreshold: string;
}

const DEFAULT_FORM: FormState = {
  warningThreshold: "80",
  dangerThreshold: "100",
};

const parseInput = (s: string): number | null => {
  if (s.trim() === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
};

export default function AdminSystemConfigPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getAdminSystemConfig();
        if (cancelled) return;
        setForm({
          warningThreshold: String(data.warningThreshold),
          dangerThreshold: String(data.dangerThreshold),
        });
      } catch (err: any) {
        if (cancelled) return;
        const sc = err?.response?.status;
        if (sc === 403) {
          setLoadError("Bạn không có quyền truy cập.");
        } else if (sc === 401) {
          setLoadError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          setLoadError(
            err?.response?.data?.message ||
              "Không thể tải cấu hình hệ thống."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const warningParsed = parseInput(form.warningThreshold);
  const dangerParsed = parseInput(form.dangerThreshold);

  const validation = (() => {
    if (warningParsed === null || dangerParsed === null) {
      return { valid: false, message: "Vui lòng nhập số hợp lệ." };
    }
    if (!Number.isInteger(warningParsed) || !Number.isInteger(dangerParsed)) {
      return {
        valid: false,
        message: "Ngưỡng phải là số nguyên.",
      };
    }
    if (warningParsed < 1 || warningParsed > 99) {
      return {
        valid: false,
        message: "Ngưỡng cảnh báo phải nằm trong khoảng 1 – 99.",
      };
    }
    if (dangerParsed < 1 || dangerParsed > 100) {
      return {
        valid: false,
        message: "Ngưỡng vượt hạn mức phải nằm trong khoảng 1 – 100.",
      };
    }
    if (warningParsed >= dangerParsed) {
      return {
        valid: false,
        message:
          "Ngưỡng cảnh báo phải nhỏ hơn ngưỡng vượt hạn mức.",
      };
    }
    return { valid: true, message: "" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSaveError("");
    setSuccessMsg("");

    if (!validation.valid || warningParsed === null || dangerParsed === null) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAdminSystemConfig({
        warningThreshold: warningParsed,
        dangerThreshold: dangerParsed,
      });
      setForm({
        warningThreshold: String(updated.warningThreshold),
        dangerThreshold: String(updated.dangerThreshold),
      });
      setSuccessMsg("Cập nhật cấu hình thành công.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      const sc = err?.response?.status;
      setSaveError(
        err?.response?.data?.message ||
          (sc === 400
            ? "Giá trị ngưỡng không hợp lệ."
            : sc === 403
              ? "Bạn không có quyền cập nhật cấu hình."
              : "Đã xảy ra lỗi. Vui lòng thử lại.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setTouched(false);
    setSaveError("");
    setSuccessMsg("");
  };

  const previewWarning = warningParsed ?? 0;
  const previewDanger = dangerParsed ?? 0;

  return (
    <div className="admin-sys-page">
      <div className="admin-sys-header">
        <div>
          <h2 className="admin-sys-title">Cấu hình hệ thống</h2>
          <p className="admin-sys-subtitle">
            Ngưỡng % hạn mức cảnh báo áp dụng cho tất cả người dùng.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-sys-loading">
          <div className="admin-sys-spinner"></div>
          <span>Đang tải cấu hình...</span>
        </div>
      ) : loadError ? (
        <div className="admin-sys-state admin-sys-error">
          <span>{loadError}</span>
          <button
            className="admin-sys-btn-primary"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <form className="admin-sys-card" onSubmit={handleSubmit}>
          <h3 className="admin-sys-card-title">
            Ngưỡng ngân sách
          </h3>

          <div className="admin-sys-grid">
            <div className="admin-sys-field">
              <label className="admin-sys-label">
                Ngưỡng cảnh báo (%)
              </label>
              <input
                type="number"
                className="admin-sys-input"
                value={form.warningThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    warningThreshold: e.target.value,
                  })
                }
                min={1}
                max={99}
                step={1}
                disabled={saving}
              />
              <span className="admin-sys-hint">
                Trạng thái bình thường sẽ chuyển sang cảnh báo khi đạt
                ngưỡng này.
              </span>
            </div>

            <div className="admin-sys-field">
              <label className="admin-sys-label">
                Ngưỡng vượt hạn mức (%)
              </label>
              <input
                type="number"
                className="admin-sys-input"
                value={form.dangerThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dangerThreshold: e.target.value,
                  })
                }
                min={1}
                max={100}
                step={1}
                disabled={saving}
              />
              <span className="admin-sys-hint">
                Trạng thái cảnh báo chuyển sang vượt hạn mức khi đạt
                ngưỡng này.
              </span>
            </div>
          </div>

          {touched && !validation.valid && (
            <div className="admin-sys-validation-error">
              {validation.message}
            </div>
          )}

          {saveError && (
            <div className="admin-sys-validation-error">
              {saveError}
            </div>
          )}

          {successMsg && (
            <div className="admin-sys-success">{successMsg}</div>
          )}

          <h3 className="admin-sys-card-title admin-sys-card-title-spaced">
            Xem trước trạng thái
          </h3>

          <div className="admin-sys-preview">
            <div className="admin-sys-preview-item admin-sys-preview-normal">
              <span className="admin-sys-preview-icon">🟢</span>
              <div className="admin-sys-preview-text">
                <strong>Bình thường</strong>
                <span>
                  dưới {previewWarning || "?"}% ngân sách
                </span>
              </div>
            </div>
            <div className="admin-sys-preview-item admin-sys-preview-warning">
              <span className="admin-sys-preview-icon">🟡</span>
              <div className="admin-sys-preview-text">
                <strong>Cảnh báo</strong>
                <span>
                  {previewWarning || "?"}% – dưới {previewDanger || "?"}%
                </span>
              </div>
            </div>
            <div className="admin-sys-preview-item admin-sys-preview-danger">
              <span className="admin-sys-preview-icon">🔴</span>
              <div className="admin-sys-preview-text">
                <strong>Vượt hạn mức</strong>
                <span>từ {previewDanger || "?"}% trở lên</span>
              </div>
            </div>
          </div>

          <div className="admin-sys-actions">
            <button
              type="button"
              className="admin-sys-btn-secondary"
              onClick={handleReset}
              disabled={saving}
            >
              Đặt lại mặc định
            </button>
            <button
              type="submit"
              className="admin-sys-btn-primary"
              disabled={saving || !validation.valid}
            >
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
