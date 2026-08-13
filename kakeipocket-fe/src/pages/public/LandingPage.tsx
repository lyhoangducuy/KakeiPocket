import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const handleDemo = () => {
    navigate("/dashboard");
  };

  return (
    <div className="lp-page">
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <span className="lp-eyebrow">📒 KakeiPocket</span>
          <h1 className="lp-title">
            Quản lý tài chính cá nhân theo
            <br />
            <span className="lp-title-accent">phương pháp Kakeibo</span>
          </h1>
          <p className="lp-subtitle">
            Ghi chép thu chi, lập kế hoạch tháng, phân bổ 4 ví và nhận
            phân tích từ Kakeibo AI — tất cả trong một ứng dụng đơn giản,
            trực quan.
          </p>
          <div className="lp-hero-cta">
            <button
              type="button"
              className="lp-btn-primary"
              onClick={handleStart}
            >
              {isAuthenticated ? "Vào Dashboard" : "Bắt đầu ngay"}
            </button>
            <button
              type="button"
              className="lp-btn-secondary"
              onClick={handleDemo}
            >
              Xem demo
            </button>
          </div>
          <p className="lp-hero-meta">
            Miễn phí · Không cần thẻ tín dụng · Dữ liệu bảo mật
          </p>
        </div>
      </section>

      <section className="lp-section lp-section-concept">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Kakeibo</span>
          <h2 className="lp-section-title">
            Tài chính cá nhân — đơn giản và ý thức
          </h2>
          <p className="lp-section-lead">
            Kakeibo là phương pháp quản lý tài chính truyền thống của Nhật
            Bản: ghi chép thu nhập, chi tiêu, đặt mục tiêu tiết kiệm và
            nhìn lại mỗi tháng. KakeiPocket đưa phương pháp này vào ứng
            dụng web hiện đại.
          </p>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-inner">
          <h2 className="lp-section-title">
            Tính năng nổi bật
          </h2>
          <div className="lp-features-grid">
            <FeatureCard
              icon="🗓️"
              title="Monthly Plan"
              desc="Đặt mục tiêu thu nhập và tiết kiệm cho từng tháng, theo dõi tiến độ."
            />
            <FeatureCard
              icon="👛"
              title="4 ví"
              desc="Phân bổ chi tiêu theo 4 nhóm: Thiết yếu, Mong muốn, Tinh thần, Phát sinh."
            />
            <FeatureCard
              icon="💸"
              title="Income / Expense"
              desc="Ghi lại thu chi hàng ngày, phân loại theo danh mục và ví."
            />
            <FeatureCard
              icon="📊"
              title="Statistics"
              desc="Biểu đồ trực quan: xu hướng thu chi, cơ cấu chi tiêu, top danh mục."
            />
            <FeatureCard
              icon="📅"
              title="Monthly Summary"
              desc="Tổng kết tháng, so sánh với kế hoạch, cảnh báo ví vượt ngân sách."
            />
            <FeatureCard
              icon="🤖"
              title="Kakeibo AI"
              desc="Phân tích tài chính bằng AI, gợi ý tiết kiệm và mục tiêu tháng tới."
            />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-preview">
        <div className="lp-section-inner">
          <h2 className="lp-section-title">Xem trước Dashboard</h2>
          <p className="lp-section-lead">
            Trải nghiệm giao diện với dữ liệu mẫu — không cần đăng ký.
          </p>
          <div className="lp-preview-grid">
            <PreviewCard
              icon="💰"
              label="Tổng thu nhập"
              value="15.000.000 ₫"
            />
            <PreviewCard
              icon="💸"
              label="Tổng chi tiêu"
              value="9.500.000 ₫"
            />
            <PreviewCard
              icon="🎯"
              label="Tiết kiệm"
              value="5.500.000 ₫"
            />
            <PreviewCard
              icon="📈"
              label="Tỷ lệ tiết kiệm"
              value="36.67%"
            />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-wallet">
        <div className="lp-section-inner">
          <h2 className="lp-section-title">Phân bổ 4 ví</h2>
          <div className="lp-wallet-grid">
            <WalletCard icon="🏠" label="Thiết yếu" value="5.000.000 ₫" />
            <WalletCard icon="🛒" label="Mong muốn" value="3.000.000 ₫" />
            <WalletCard icon="📚" label="Tinh thần" value="1.500.000 ₫" />
            <WalletCard icon="⚠️" label="Phát sinh" value="1.000.000 ₫" />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-ai">
        <div className="lp-section-inner">
          <h2 className="lp-section-title">
            🤖 Kakeibo AI
          </h2>
          <p className="lp-section-lead">
            Phân tích tài chính cá nhân bằng AI, gợi ý cải thiện và đặt
            mục tiêu tháng tới.
          </p>
          <div className="lp-ai-card">
            <div className="lp-ai-badge">Health: GOOD</div>
            <p className="lp-ai-summary">
              "Tháng này bạn đã tiết kiệm tốt với tỷ lệ 36.67%. Tuy nhiên,
              3/4 ví đã sử dụng hết ngân sách…"
            </p>
            <ul className="lp-ai-list">
              <li>💡 Tiền thuê nhà và tiền ăn chiếm hơn 56% tổng chi.</li>
              <li>⚠️ Ví NECESSARY, CULTURE, UNEXPECTED đã hết ngân sách.</li>
              <li>📝 Nấu ăn tại nhà thêm 3 bữa/tuần để giảm chi phí ăn uống.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-cta">
        <div className="lp-section-inner lp-cta-inner">
          <h2 className="lp-cta-title">Sẵn sàng quản lý tài chính của bạn?</h2>
          <p className="lp-cta-lead">
            Tạo tài khoản miễn phí và bắt đầu ghi chép chỉ trong 1 phút.
          </p>
          <div className="lp-cta-actions">
            <button
              type="button"
              className="lp-btn-primary"
              onClick={handleStart}
            >
              {isAuthenticated ? "Vào Dashboard" : "Bắt đầu ngay"}
            </button>
            <Link
              to="/login"
              className="lp-btn-link"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-footer-logo">KakeiPocket</span>
          <span className="lp-footer-meta">
            Quản lý tài chính cá nhân · © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="lp-feature-card">
      <span className="lp-feature-icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{desc}</p>
    </div>
  );
}

function PreviewCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="lp-preview-card">
      <span className="lp-preview-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="lp-preview-label">{label}</span>
      <span className="lp-preview-value">{value}</span>
    </div>
  );
}

function WalletCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="lp-wallet-card">
      <span className="lp-wallet-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="lp-wallet-label">{label}</span>
      <span className="lp-wallet-value">{value}</span>
    </div>
  );
}
