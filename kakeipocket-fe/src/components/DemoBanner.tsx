import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

import "./DemoBanner.css";

export default function DemoBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate("/login", {
      state: { from: location.pathname + (location.search || "") },
    });
  };

  return (
    <div className="demo-banner" role="status">
      <div className="demo-banner-text">
        <span className="demo-banner-icon" aria-hidden="true">
          ℹ️
        </span>
        <div>
          <strong>Bạn đang xem dữ liệu demo.</strong>{" "}
          <span className="demo-banner-sub">
            Đăng nhập để quản lý tài chính cá nhân của bạn.
          </span>
        </div>
      </div>
      <button
        type="button"
        className="demo-banner-btn"
        onClick={handleLogin}
      >
        Đăng nhập
      </button>
    </div>
  );
}
