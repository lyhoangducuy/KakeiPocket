import {
  useState,
  useEffect,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { getCurrentMonthlyPlan } from "../../api/monthlyPlanApi";
import {
  getWalletLimits,
  saveWalletLimits,
} from "../../api/walletApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoMonthlyPlan } from "../../demo/monthlyPlanDemo";
import { demoWalletLimits } from "../../demo/walletLimitsDemo";

import type { MonthlyPlan } from "../../types/monthlyPlan";
import type { WalletLimitsRequest } from "../../types/walletLimit";
import {
  WALLET_CONFIGS,
  type WalletConfig,
} from "../../types/walletLimit";

import "./WalletConfigurationPage.css";

const formatCurrency = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined || value === 0) {
    return "";
  }

  return value.toLocaleString("vi-VN");
};

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
};

export default function WalletConfigurationPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [plan, setPlan] = useState<MonthlyPlan | null>(null);

  const [necessary, setNecessary] = useState("");
  const [wants, setWants] = useState("");
  const [culture, setCulture] = useState("");
  const [unexpected, setUnexpected] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    if (isGuest) {
      setPlan(demoMonthlyPlan);
      setNecessary(formatCurrency(demoWalletLimits.necessary));
      setWants(formatCurrency(demoWalletLimits.wants));
      setCulture(formatCurrency(demoWalletLimits.culture));
      setUnexpected(formatCurrency(demoWalletLimits.unexpected));
      setLoading(false);
      return;
    }

    try {
      const currentPlan = await getCurrentMonthlyPlan();
      setPlan(currentPlan);

      if (!currentPlan) {
        setError(
          "Bạn chưa có kế hoạch tháng. Vui lòng tạo kế hoạch tháng trước."
        );
        setLoading(false);
        return;
      }

      const limits = await getWalletLimits(currentPlan.id);
      setNecessary(formatCurrency(limits.necessary));
      setWants(formatCurrency(limits.wants));
      setCulture(formatCurrency(limits.culture));
      setUnexpected(formatCurrency(limits.unexpected));
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
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const values = [
      parseCurrency(necessary),
      parseCurrency(wants),
      parseCurrency(culture),
      parseCurrency(unexpected),
    ];

    for (const value of values) {
      if (value < 0) {
        setError("Hạn mức không thể nhỏ hơn 0.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      requireAuth("Đăng nhập để lưu hạn mức 4 ví.");
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!plan) {
      setError(
        "Bạn chưa có kế hoạch tháng. Vui lòng tạo kế hoạch tháng trước."
      );
      return;
    }

    setSubmitting(true);

    try {
      const requestData: WalletLimitsRequest = {
        necessary: parseCurrency(necessary),
        wants: parseCurrency(wants),
        culture: parseCurrency(culture),
        unexpected: parseCurrency(unexpected),
      };

      await saveWalletLimits(plan.id, requestData);

      setSuccess("Lưu hạn mức thành công!");

      setNecessary(
        formatCurrency(parseCurrency(necessary))
      );
      setWants(formatCurrency(parseCurrency(wants)));
      setCulture(formatCurrency(parseCurrency(culture)));
      setUnexpected(
        formatCurrency(parseCurrency(unexpected))
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

  const handleChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>
    ) =>
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const raw = e.target.value.replace(/[^\d]/g, "");
      setter(formatCurrency(parseInt(raw, 10) || 0));
    };

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-loading-spinner"></div>
      </div>
    );
  }

  const totalLimit =
    parseCurrency(necessary) +
    parseCurrency(wants) +
    parseCurrency(culture) +
    parseCurrency(unexpected);

  const hasPlan = plan !== null;

  return (
    <div className="wc-page">
      <div className="wc-header">
        <h1 className="wc-title">
          Cấu hình 4 ví
          {isGuest && (
            <span className="wc-demo-badge">DEMO</span>
          )}
        </h1>

        <p className="wc-subtitle">
          Thiết lập hạn mức chi tiêu cho từng nhóm ví trong tháng.
        </p>

        {plan && (
          <div className="wc-period">
            <span className="wc-period-label">
              Kỳ kế hoạch
            </span>
            <span className="wc-period-value">
              Tháng {plan.month} {plan.year}
            </span>
          </div>
        )}
      </div>

      {error && <div className="wc-error">{error}</div>}

      {success && (
        <div className="wc-success">{success}</div>
      )}

      {!hasPlan ? (
        <div className="wc-no-plan">
          <p>Bạn chưa có kế hoạch tháng.</p>
          <button
            className="wc-button-secondary"
            onClick={() => {
              if (isGuest) {
                requireAuth("Đăng nhập để tạo kế hoạch tháng.");
                return;
              }
              navigate("/monthly-plan");
            }}
          >
            Tạo kế hoạch tháng
          </button>
        </div>
      ) : (
        <form
          className="wc-form"
          onSubmit={handleSubmit}
        >
          <div className="wc-grid">
            {WALLET_CONFIGS.map(
              (config: WalletConfig) => (
                <div
                  key={config.type}
                  className="wc-card"
                >
                  <div className="wc-card-header">
                    <span className="wc-card-icon">
                      {config.icon}
                    </span>
                    <div>
                      <h3 className="wc-card-title">
                        {config.label}
                      </h3>
                      <p className="wc-card-desc">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="wc-card-body">
                    <label className="wc-card-label">
                      Hạn mức
                    </label>

                    <div className="wc-input-wrapper">
                      <input
                        type="text"
                        className="wc-input"
                        placeholder="0"
                        value={
                          config.key === "necessary"
                            ? necessary
                            : config.key === "wants"
                              ? wants
                              : config.key === "culture"
                                ? culture
                                : unexpected
                        }
                        onChange={handleChange(
                          config.key === "necessary"
                            ? setNecessary
                            : config.key === "wants"
                              ? setWants
                              : config.key === "culture"
                                ? setCulture
                                : setUnexpected
                        )}
                      />

                      <span className="wc-input-suffix">
                        ₫
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="wc-summary">
            <div className="wc-summary-row">
              <span className="wc-summary-label">
                Tổng hạn mức tháng
              </span>
              <span className="wc-summary-value">
                {totalLimit > 0
                  ? `${formatCurrency(totalLimit)} ₫`
                  : "—"}
              </span>
            </div>

            {plan.incomeTarget && plan.incomeTarget > 0 && (
              <>
                <div className="wc-summary-row">
                  <span className="wc-summary-label">
                    Thu nhập mục tiêu
                  </span>
                  <span className="wc-summary-value">
                    {formatCurrency(plan.incomeTarget)} ₫
                  </span>
                </div>

                <div className="wc-summary-row wc-summary-warning">
                  <span className="wc-summary-label">
                    Còn lại sau chi tiêu
                  </span>
                  <span
                    className={`wc-summary-value ${
                      plan.incomeTarget - totalLimit < 0
                        ? "wc-warning"
                        : ""
                    }`}
                  >
                    {formatCurrency(
                      plan.incomeTarget - totalLimit
                    )}{" "}
                    ₫
                  </span>
                </div>
              </>
            )}
          </div>

          {plan.incomeTarget &&
            plan.incomeTarget > 0 &&
            totalLimit > plan.incomeTarget && (
              <div className="wc-warning-box">
                Tổng hạn mức các ví đang cao hơn thu nhập mục tiêu.
              </div>
            )}

          <button
            type="submit"
            className="wc-button"
            disabled={submitting}
          >
            {isGuest
              ? "Đăng nhập để lưu hạn mức"
              : submitting
                ? "Đang lưu..."
                : "Lưu hạn mức"}
          </button>
        </form>
      )}
    </div>
  );
}