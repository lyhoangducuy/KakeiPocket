import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const logoTo = isAuthenticated ? "/dashboard" : "/";

  return (
    <nav className="navbar">
      <Link to={logoTo} className="logo">
        KakeiPocket
      </Link>

      <div className="nav-links">
        {!isAuthenticated && (
          <>
            <Link to="/">Trang chủ</Link>
            <a href="#features">Tính năng</a>
            <a href="#about">Giới thiệu</a>
            <Link to="/login" className="nav-btn-secondary">
              Đăng nhập
            </Link>
            <Link to="/register" className="nav-btn-primary">
              Đăng ký
            </Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/monthly-plan">Kế hoạch</Link>
            <Link to="/wallet-configuration">4 ví</Link>
            <Link to="/categories">Danh mục</Link>
            <Link to="/expenses">Chi tiêu</Link>
            <Link to="/incomes">Thu nhập</Link>
            <Link to="/transactions">Lịch sử</Link>
            <Link to="/statistics">Thống kê</Link>
            <Link to="/wallet-alerts">Cảnh báo</Link>
            <Link to="/monthly-summary">Tổng kết</Link>
            <Link to="/ai-financial">Kakeibo AI</Link>
            <Link to="/profile">Profile</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}

            <span className="nav-user">
              {user?.email} ({user?.role})
            </span>

            <button
              type="button"
              className="nav-btn-secondary"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
