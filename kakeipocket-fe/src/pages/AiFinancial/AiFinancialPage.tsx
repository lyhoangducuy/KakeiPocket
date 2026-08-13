import { useState, useEffect } from "react";

import { analyzeFinancial } from "../../api/aiFinancialApi";

import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../components/LoginRequiredProvider";

import { demoAiAnalysis } from "../../demo/aiFinancialDemo";

import type {
  AiFinancialAnalysis,
  FinancialHealth,
} from "../../types/aiFinancial";

import "./AiFinancialPage.css";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const getCurrentMonth = () => {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  };
};

const getHealthInfo = (health: FinancialHealth) => {
  switch (health) {
    case "GOOD":
      return {
        label: "Tốt",
        icon: "🟢",
        className: "ai-status-good",
      };
    case "WARNING":
      return {
        label: "Cảnh báo",
        icon: "⚠️",
        className: "ai-status-warning",
      };
    case "CRITICAL":
      return {
        label: "Nghiêm trọng",
        icon: "🚨",
        className: "ai-status-critical",
      };
    default:
      return {
        label: "Trung bình",
        icon: "🟡",
        className: "ai-status-fair",
      };
  }
};

export default function AiFinancialPage() {
  const { isGuest } = useAuth();
  const requireAuth = useRequireAuth();
  const now = getCurrentMonth();
  const [year, setYear] = useState<number>(now.year);
  const [month, setMonth] = useState<number>(now.month);

  const [data, setData] = useState<AiFinancialAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [questionMode, setQuestionMode] = useState(false);

  const loadAnalysis = async (
    targetYear: number,
    targetMonth: number,
    q?: string
  ) => {
    setLoading(true);
    setError("");

    if (isGuest) {
      const demo: AiFinancialAnalysis = {
        ...demoAiAnalysis,
        year: targetYear,
        month: targetMonth,
      };
      if (q && q.trim()) {
        demo.generatedForQuestion = true;
        demo.question = q.trim();
        demo.summary =
          "Đăng nhập để Kakeibo AI phân tích dữ liệu tài chính của bạn. Đây là phân tích mẫu dựa trên dữ liệu demo.";
      }
      setData(demo);
      setLoading(false);
      return;
    }

    try {
      const result = await analyzeFinancial({
        year: targetYear,
        month: targetMonth,
        question: q && q.trim() ? q.trim() : undefined,
      });
      setData(result);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn.");
      } else if (err.response?.status === 1013) {
        setError("Kakeibo AI hiện không khả dụng. Vui lòng thử lại sau.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể kết nối Kakeibo AI lúc này.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis(year, month);
  }, [year, month, isGuest]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleRetry = () => {
    loadAnalysis(
      year,
      month,
      questionMode ? question : undefined
    );
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Vui lòng nhập câu hỏi.");
      return;
    }

    if (isGuest) {
      requireAuth(
        "Đăng nhập để Kakeibo AI phân tích dữ liệu tài chính của bạn."
      );
      return;
    }

    setQuestionMode(true);
    await loadAnalysis(year, month, question.trim());
  };

  const handleClearQuestion = async () => {
    setQuestion("");
    setQuestionMode(false);
    await loadAnalysis(year, month);
  };

  const yearOptions = [now.year - 1, now.year, now.year + 1];

  const healthInfo = data
    ? getHealthInfo(data.financialHealth)
    : null;

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div>
          <h1 className="ai-title">
            <span className="ai-title-icon">🤖</span> Kakeibo AI
            {isGuest && (
              <span className="ai-demo-badge">DEMO</span>
            )}
          </h1>
          <p className="ai-subtitle">
            Phân tích tài chính và gợi ý cải thiện dựa trên dữ liệu
            thực tế của bạn.
          </p>
        </div>

        <div className="ai-month-selector">
          <button
            className="ai-month-btn"
            onClick={handlePrevMonth}
            disabled={loading}
            aria-label="Tháng trước"
          >
            ←
          </button>
          <select
            className="ai-select"
            value={month}
            onChange={(e) =>
              setMonth(parseInt(e.target.value, 10))
            }
            disabled={loading}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="ai-select"
            value={year}
            onChange={(e) =>
              setYear(parseInt(e.target.value, 10))
            }
            disabled={loading}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            className="ai-month-btn"
            onClick={handleNextMonth}
            disabled={loading}
            aria-label="Tháng sau"
          >
            →
          </button>
        </div>
      </div>

      <p className="ai-disclaimer">
        Kakeibo AI cung cấp phân tích và gợi ý dựa trên dữ liệu chi
        tiêu của bạn, không phải tư vấn đầu tư hoặc tài chính chuyên
        nghiệp.
      </p>

      {isGuest && (
        <div className="ai-guest-notice">
          <span className="ai-guest-icon" aria-hidden="true">
            🔒
          </span>
          <div>
            <strong>Đăng nhập để nhận phân tích dựa trên dữ liệu của bạn.</strong>{" "}
            <span>
              Kakeibo AI sẽ sử dụng dữ liệu thu chi và kế hoạch tháng cá
              nhân của bạn.
            </span>
          </div>
        </div>
      )}

      {error && !data && (
        <div className="ai-error-state">
          <p className="ai-error-message">{error}</p>
          <button
            className="ai-btn-primary"
            onClick={handleRetry}
            disabled={loading}
          >
            Thử lại
          </button>
        </div>
      )}

      {error && data && (
        <div className="ai-error-inline">{error}</div>
      )}

      {loading && !data && (
        <div className="ai-loading">
          <div className="ai-loading-spinner"></div>
          <p className="ai-loading-text">
            Đang phân tích dữ liệu tài chính...
          </p>
        </div>
      )}

      {data && healthInfo && !loading && (
        <>
          <div className={`ai-status-banner ${healthInfo.className}`}>
            <span className="ai-status-icon">
              {healthInfo.icon}
            </span>
            <div className="ai-status-content">
              <span className="ai-status-label">
                Đánh giá: {healthInfo.label}
              </span>
              <p className="ai-status-summary">
                {data.summary}
              </p>
            </div>
          </div>

          {data.generatedForQuestion && data.question && (
            <div className="ai-question-tag">
              <span className="ai-question-icon">💬</span>
              <span>
                Đang trả lời: <em>{data.question}</em>
              </span>
              <button
                className="ai-clear-btn"
                onClick={handleClearQuestion}
                disabled={loading}
              >
                Xem phân tích tổng quan
              </button>
            </div>
          )}

          {data.keyInsights.length > 0 && (
            <div className="ai-section">
              <h2 className="ai-section-title">
                <span className="ai-section-icon">💡</span>{" "}
                Điểm đáng chú ý
              </h2>
              <ul className="ai-list">
                {data.keyInsights.map((item, idx) => (
                  <li key={idx} className="ai-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.warnings.length > 0 && (
            <div className="ai-section">
              <h2 className="ai-section-title">
                <span className="ai-section-icon">⚠️</span>{" "}
                Cảnh báo
              </h2>
              <ul className="ai-list ai-list-warning">
                {data.warnings.map((item, idx) => (
                  <li key={idx} className="ai-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.recommendations.length > 0 && (
            <div className="ai-section">
              <h2 className="ai-section-title">
                <span className="ai-section-icon">📝</span>{" "}
                Gợi ý cải thiện
              </h2>
              <ul className="ai-list">
                {data.recommendations.map((item, idx) => (
                  <li key={idx} className="ai-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.savingSuggestions.length > 0 && (
            <div className="ai-section">
              <h2 className="ai-section-title">
                <span className="ai-section-icon">💰</span>{" "}
                Gợi ý tiết kiệm
              </h2>
              <ul className="ai-list ai-list-suggestion">
                {data.savingSuggestions.map((item, idx) => (
                  <li key={idx} className="ai-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.nextMonthGoals.length > 0 && (
            <div className="ai-section">
              <h2 className="ai-section-title">
                <span className="ai-section-icon">🎯</span>{" "}
                Mục tiêu tháng tới
              </h2>
              <ul className="ai-list ai-list-goal">
                {data.nextMonthGoals.map((item, idx) => (
                  <li key={idx} className="ai-list-item">
                    <span className="ai-goal-checkbox">☐</span>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="ai-question-box">
        <h3 className="ai-question-title">
          <span className="ai-section-icon">💬</span> Hỏi Kakeibo AI
        </h3>
        <textarea
          className="ai-question-input"
          placeholder="Ví dụ: Tháng này tôi nên giảm khoản chi nào?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          disabled={loading}
        />
        <button
          className="ai-btn-primary"
          onClick={handleAskQuestion}
          disabled={loading || !question.trim()}
        >
          {isGuest
            ? "Đăng nhập để hỏi AI"
            : loading
              ? "AI đang phân tích..."
              : "Phân tích"}
        </button>
      </div>
    </div>
  );
}
