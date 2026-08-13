import {
  useState,
  useEffect,
  type FormEvent,
} from "react";

import {
  createMonthlyPlan,
  getCurrentMonthlyPlan,
  updateMonthlyPlan,
} from "../../api/monthlyPlanApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoMonthlyPlan } from "../../demo/monthlyPlanDemo";

import type {
  MonthlyPlan,
  CreateMonthlyPlanRequest,
} from "../../types/monthlyPlan";

import "./MonthlyPlanPage.css";

const MONTHS = [
  { value: 1, label: "Tháng 1" },
  { value: 2, label: "Tháng 2" },
  { value: 3, label: "Tháng 3" },
  { value: 4, label: "Tháng 4" },
  { value: 5, label: "Tháng 5" },
  { value: 6, label: "Tháng 6" },
  { value: 7, label: "Tháng 7" },
  { value: 8, label: "Tháng 8" },
  { value: 9, label: "Tháng 9" },
  { value: 10, label: "Tháng 10" },
  { value: 11, label: "Tháng 11" },
  { value: 12, label: "Tháng 12" },
];

const getCurrentYear = () => new Date().getFullYear();

const generateYears = () => {
  const currentYear = getCurrentYear();
  const years: number[] = [];

  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y);
  }

  return years;
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
};

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
};

export default function MonthlyPlanPage() {
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [plan, setPlan] = useState<MonthlyPlan | null>(null);

  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(getCurrentYear());

  const [incomeTarget, setIncomeTarget] = useState("");
  const [savingTarget, setSavingTarget] = useState("");

  const [note, setNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setPlan(demoMonthlyPlan);
      setMonth(demoMonthlyPlan.month);
      setYear(demoMonthlyPlan.year);
      setIncomeTarget(formatCurrency(demoMonthlyPlan.incomeTarget));
      setSavingTarget(formatCurrency(demoMonthlyPlan.savingTarget));
      setNote(demoMonthlyPlan.note || "");
      setLoading(false);
      return;
    }

    try {
      const currentPlan = await getCurrentMonthlyPlan();
      setPlan(currentPlan);

      if (currentPlan) {
        setMonth(currentPlan.month);
        setYear(currentPlan.year);
        setIncomeTarget(formatCurrency(currentPlan.incomeTarget));
        setSavingTarget(formatCurrency(currentPlan.savingTarget));
        setNote(currentPlan.note || "");
      } else {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (month < 1 || month > 12) {
      setError("Tháng không hợp lệ.");
      return false;
    }

    const currentYear = getCurrentYear();
    if (year < currentYear - 10 || year > currentYear + 10) {
      setError("Năm không hợp lệ.");
      return false;
    }

    const income = parseCurrency(incomeTarget);
    const saving = parseCurrency(savingTarget);

    if (income < 0) {
      setError("Thu nhập dự kiến không được âm.");
      return false;
    }

    if (saving < 0) {
      setError("Mục tiêu tiết kiệm không được âm.");
      return false;
    }

    if (income > 0 && saving > income) {
      setError("Mục tiêu tiết kiệm không thể lớn hơn thu nhập.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      requireAuth("Đăng nhập để lưu kế hoạch tháng của bạn.");
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const requestData: CreateMonthlyPlanRequest = {
        month,
        year,
        incomeTarget:
          parseCurrency(incomeTarget) || null,
        savingTarget:
          parseCurrency(savingTarget) || null,
        note: note.trim(),
      };

      if (plan) {
        const updated = await updateMonthlyPlan(
          plan.id,
          requestData
        );
        setPlan(updated);
        setSuccess("Cập nhật kế hoạch thành công!");
      } else {
        const created = await createMonthlyPlan(
          requestData
        );
        setPlan(created);
        setSuccess("Lưu kế hoạch thành công!");
      }

      setIncomeTarget(
        formatCurrency(
          parseCurrency(incomeTarget) || null
        )
      );
      setSavingTarget(
        formatCurrency(
          parseCurrency(savingTarget) || null
        )
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng thử lại."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncomeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setIncomeTarget(formatCurrency(parseInt(raw, 10) || 0));
  };

  const handleSavingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setSavingTarget(formatCurrency(parseInt(raw, 10) || 0));
  };

  if (loading) {
    return (
      <div className="mp-loading">
        <div className="mp-loading-spinner"></div>
      </div>
    );
  }

  const incomeValue = parseCurrency(incomeTarget);
  const savingValue = parseCurrency(savingTarget);

  return (
    <div className="mp-page">
      <div className="mp-header">
        <h1 className="mp-title">
          Kế hoạch tháng
          {isGuest && (
            <span className="mp-demo-badge">DEMO</span>
          )}
        </h1>

        <p className="mp-subtitle">
          Thiết lập thu nhập và mục tiêu tiết kiệm cho tháng của bạn.
        </p>
      </div>

      <div className="mp-period">
        <span className="mp-period-label">
          Kỳ kế hoạch
        </span>
        <span className="mp-period-value">
          Tháng {month} {year}
        </span>
      </div>

      {error && <div className="mp-error">{error}</div>}

      {success && (
        <div className="mp-success">{success}</div>
      )}

      <form
        className="mp-form"
        onSubmit={handleSubmit}
      >
        <div className="mp-section">
          <h2 className="mp-section-title">
            Thời gian
          </h2>

          <div className="mp-row">
            <div className="mp-field">
              <label
                htmlFor="month"
                className="mp-label"
              >
                Tháng
              </label>

              <select
                id="month"
                className="mp-select"
                value={month}
                onChange={(e) =>
                  setMonth(
                    parseInt(e.target.value, 10)
                  )
                }
              >
                {MONTHS.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                  >
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mp-field">
              <label
                htmlFor="year"
                className="mp-label"
              >
                Năm
              </label>

              <select
                id="year"
                className="mp-select"
                value={year}
                onChange={(e) =>
                  setYear(parseInt(e.target.value, 10))
                }
              >
                {generateYears().map((y) => (
                  <option
                    key={y}
                    value={y}
                  >
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mp-section">
          <h2 className="mp-section-title">
            Mục tiêu tài chính
          </h2>

          <div className="mp-field">
            <label
              htmlFor="income"
              className="mp-label"
            >
              Thu nhập dự kiến
            </label>

            <div className="mp-input-wrapper">
              <input
                id="income"
                type="text"
                className="mp-input"
                placeholder="0"
                value={incomeTarget}
                onChange={handleIncomeChange}
              />

              <span className="mp-input-suffix">
                ₫
              </span>
            </div>

            <span className="mp-hint">
              Tổng thu nhập dự kiến trong tháng
            </span>
          </div>

          <div className="mp-field">
            <label
              htmlFor="saving"
              className="mp-label"
            >
              Mục tiêu tiết kiệm
            </label>

            <div className="mp-input-wrapper">
              <input
                id="saving"
                type="text"
                className="mp-input"
                placeholder="0"
                value={savingTarget}
                onChange={handleSavingChange}
              />

              <span className="mp-input-suffix">
                ₫
              </span>
            </div>

            <span className="mp-hint">
              Số tiền bạn muốn tiết kiệm trong tháng
            </span>
          </div>
        </div>

        <div className="mp-section">
          <h2 className="mp-section-title">
            Ghi chú
          </h2>

          <div className="mp-field">
            <textarea
              className="mp-textarea"
              placeholder="Ví dụ: Tháng này muốn hạn chế mua sắm và tiết kiệm cho chuyến đi Nhật..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
            />

            <span className="mp-char-count">
              {note.length}/500
            </span>
          </div>
        </div>

        <div className="mp-summary">
          <div className="mp-summary-row">
            <span className="mp-summary-label">
              Thu nhập dự kiến
            </span>

            <span className="mp-summary-value">
              {incomeValue > 0
                ? `${formatCurrency(incomeValue)} ₫`
                : "—"}
            </span>
          </div>

          <div className="mp-summary-row">
            <span className="mp-summary-label">
              Tiết kiệm mục tiêu
            </span>

            <span className="mp-summary-value">
              {savingValue > 0
                ? `${formatCurrency(savingValue)} ₫`
                : "—"}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="mp-button"
          disabled={submitting}
        >
          {isGuest
            ? "Đăng nhập để lưu kế hoạch"
            : submitting
              ? "Đang lưu..."
              : plan
                ? "Cập nhật kế hoạch"
                : "Lưu kế hoạch"}
        </button>
      </form>
    </div>
  );
}
