import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useRequireAuth } from "./LoginRequiredProvider";

import type { DashboardResponse } from "../types/dashboard";

export type SetupStep =
  | "PLAN"
  | "WALLET"
  | "EXPENSE"
  | "INCOME";

export interface SetupState {
  hasPlan: boolean;
  hasWalletLimit: boolean;
  hasExpense: boolean;
  hasIncome: boolean;
  currentStep: SetupStep | null;
  nextPath: string | null;
  nextLabel: string | null;
  nextAuthMessage: string;
  isComplete: boolean;
}

export const computeSetupState = (
  data: DashboardResponse | null
): SetupState => {
  if (!data) {
    return {
      hasPlan: false,
      hasWalletLimit: false,
      hasExpense: false,
      hasIncome: false,
      currentStep: null,
      nextPath: null,
      nextLabel: null,
      nextAuthMessage: "",
      isComplete: false,
    };
  }

  const hasPlan = data.monthlyPlan !== null;
  const hasWalletLimit = data.wallets.some(
    (w) => Number(w.limit) > 0
  );
  const hasExpense =
    data.expense.total > 0 ||
    data.recentTransactions.some(
      (t) => t.type === "EXPENSE"
    ) ||
    data.topExpenseCategories.length > 0;
  const hasIncome = data.recentTransactions.some(
    (t) => t.type === "INCOME"
  );

  let currentStep: SetupStep | null;
  let nextPath: string | null;
  let nextLabel: string | null;
  let nextAuthMessage: string;

  if (!hasPlan) {
    currentStep = "PLAN";
    nextPath = "/monthly-plan";
    nextLabel = "Tạo kế hoạch tháng";
    nextAuthMessage =
      "Đăng nhập để thiết lập kế hoạch tháng.";
  } else if (!hasWalletLimit) {
    currentStep = "WALLET";
    nextPath = "/wallet-configuration";
    nextLabel = "Thiết lập giới hạn ví";
    nextAuthMessage =
      "Đăng nhập để thiết lập giới hạn ví.";
  } else if (!hasExpense) {
    currentStep = "EXPENSE";
    nextPath = "/expenses";
    nextLabel = "Thêm chi tiêu";
    nextAuthMessage = "Đăng nhập để thêm chi tiêu.";
  } else if (!hasIncome) {
    currentStep = "INCOME";
    nextPath = "/incomes";
    nextLabel = "Thêm thu nhập";
    nextAuthMessage = "Đăng nhập để thêm thu nhập.";
  } else {
    currentStep = null;
    nextPath = null;
    nextLabel = null;
    nextAuthMessage = "";
  }

  return {
    hasPlan,
    hasWalletLimit,
    hasExpense,
    hasIncome,
    currentStep,
    nextPath,
    nextLabel,
    nextAuthMessage,
    isComplete: currentStep === null,
  };
};

interface SetupProgressProps {
  state: SetupState;
}

interface StepDef {
  key: SetupStep;
  label: string;
  description: string;
  icon: string;
  path: string;
}

const STEPS: StepDef[] = [
  {
    key: "PLAN",
    label: "Kế hoạch tháng",
    description: "Thu nhập & tiết kiệm mục tiêu",
    icon: "📅",
    path: "/monthly-plan",
  },
  {
    key: "WALLET",
    label: "Giới hạn ví",
    description: "Hạn mức 4 ví trong tháng",
    icon: "👛",
    path: "/wallet-configuration",
  },
  {
    key: "EXPENSE",
    label: "Chi tiêu",
    description: "Ghi nhận khoản chi đầu tiên",
    icon: "➕",
    path: "/expenses",
  },
  {
    key: "INCOME",
    label: "Thu nhập",
    description: "Ghi nhận khoản thu",
    icon: "💰",
    path: "/incomes",
  },
];

const DISMISS_KEY_PREFIX = "kp_setup_complete_dismissed:";

const getDismissKey = (userId: string | undefined) =>
  userId ? `${DISMISS_KEY_PREFIX}${userId}` : DISMISS_KEY_PREFIX;

const readDismissed = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const writeDismissed = (key: string) => {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* ignore quota / privacy mode errors */
  }
};

export default function SetupProgress({
  state,
}: SetupProgressProps) {
  const navigate = useNavigate();
  const { isGuest, user } = useAuth();
  const requireAuth = useRequireAuth();

  const dismissKey = getDismissKey(
    isGuest ? undefined : user?.email
  );

  const [dismissed, setDismissed] = useState<boolean>(
    () => readDismissed(dismissKey)
  );

  useEffect(() => {
    if (state.isComplete && !dismissed) {
      writeDismissed(dismissKey);
      setDismissed(true);
    }
  }, [state.isComplete, dismissed, dismissKey]);

  if (state.isComplete) {
    if (dismissed) return null;

    return (
      <div className="dash-setup-card dash-setup-complete">
        <div className="dash-setup-header">
          <span className="dash-setup-icon">✅</span>
          <div>
            <h2 className="dash-setup-title">
              Thiết lập tài chính hoàn tất
            </h2>
            <p className="dash-setup-hint">
              Bạn đã có kế hoạch, giới hạn ví, chi tiêu và thu
              nhập. Hãy tiếp tục theo dõi dòng tiền của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleStepClick = (step: StepDef) => {
    if (isGuest) {
      requireAuth(
        "Đăng nhập để sử dụng đầy đủ chức năng quản lý tài chính."
      );
      return;
    }
    navigate(step.path);
  };

  const currentStepIndex =
    state.currentStep !== null
      ? STEPS.findIndex((s) => s.key === state.currentStep)
      : STEPS.length;

  const completedCount = STEPS.filter((s) => {
    if (s.key === "PLAN") return state.hasPlan;
    if (s.key === "WALLET") return state.hasWalletLimit;
    if (s.key === "EXPENSE") return state.hasExpense;
    if (s.key === "INCOME") return state.hasIncome;
    return false;
  }).length;

  return (
    <div className="dash-setup-card">
      <div className="dash-setup-header">
        <div>
          <h2 className="dash-setup-title">
            Thiết lập tài chính
          </h2>
          <p className="dash-setup-hint">
            Hoàn thành 4 bước để bắt đầu quản lý tài chính
            cá nhân.{" "}
            <strong>
              {completedCount}/{STEPS.length}
            </strong>{" "}
            bước.
          </p>
        </div>
      </div>

      <ol className="dash-setup-steps">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <li
              key={step.key}
              className={`dash-setup-step ${
                isDone ? "dash-setup-step-done" : ""
              } ${isCurrent ? "dash-setup-step-current" : ""}`}
            >
              <button
                type="button"
                className="dash-setup-step-btn"
                onClick={() => handleStepClick(step)}
                aria-label={step.label}
              >
                <span className="dash-setup-step-marker">
                  {isDone ? "✓" : step.icon}
                </span>
                <span className="dash-setup-step-info">
                  <span className="dash-setup-step-label">
                    {idx + 1}. {step.label}
                  </span>
                  <span className="dash-setup-step-desc">
                    {step.description}
                  </span>
                </span>
                <span className="dash-setup-step-arrow">→</span>
              </button>
            </li>
          );
        })}
      </ol>

      {state.nextPath && state.nextLabel && (
        <div className="dash-setup-cta">
          <button
            type="button"
            className="dash-btn-primary"
            onClick={() => {
              if (isGuest) {
                requireAuth(state.nextAuthMessage);
                return;
              }
              navigate(state.nextPath!);
            }}
          >
            {state.nextLabel}
          </button>
          <p className="dash-setup-cta-hint">
            Bước tiếp theo trong quy trình thiết lập của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
