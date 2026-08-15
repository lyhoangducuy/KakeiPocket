import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useState, useEffect, useRef } from "react";

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
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const logoTo = isAuthenticated ? "/dashboard" : "/";
  const initials =
    (user?.email ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <nav className="navbar">
      <Link to={logoTo} className="logo">
        KakeiPocket
      </Link>

      {/* MOBILE TOGGLE */}
      <button
        type="button"
        className="nav-burger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Mở menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
      >
        {!isAuthenticated && (
          <>
            <div className="nav-links-group">
              <Link to="/">Trang chủ</Link>
              <a href="#features">Tính năng</a>
              <a href="#about">Giới thiệu</a>
            </div>
            <div className="nav-actions">
              <Link
                to="/login"
                className="nav-btn-secondary"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="nav-btn-primary"
              >
                Đăng ký
              </Link>
            </div>
          </>
        )}

        {isAuthenticated && (
          <>
            <div className="nav-links-group">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/transactions">Giao dịch</Link>
              <Link to="/monthly-plan">Kế hoạch</Link>
              <Link to="/statistics">Thống kê</Link>
              <Link to="/wallet-configuration">Ví</Link>
            </div>

            <div className="nav-actions">
              <button
                type="button"
                className="nav-icon-btn"
                aria-label="Thông báo"
                title="Thông báo (xem trong Dashboard)"
              >
                <span className="nav-icon">🔔</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="nav-admin-link"
                >
                  Admin
                </Link>
              )}

              <div
                className="nav-user-menu"
                ref={userMenuRef}
              >
                <button
                  type="button"
                  className="nav-avatar"
                  onClick={() =>
                    setUserMenuOpen((o) => !o)
                  }
                  aria-label="Tài khoản"
                  aria-expanded={userMenuOpen}
                >
                  <span>{initials}</span>
                </button>

                {userMenuOpen && (
                  <div className="nav-user-dropdown">
                    <div className="nav-user-dropdown-info">
                      <span className="nav-user-dropdown-name">
                        {user?.email}
                      </span>
                      <span className="nav-user-dropdown-email">
                        Tài khoản đã đăng nhập
                      </span>
                      {user?.roles && (
                        <span className="nav-user-dropdown-role">
                          {user.roles}
                        </span>
                      )}
                    </div>

                    <div className="nav-user-dropdown-divider" />

                    <Link
                      to="/profile"
                      className="nav-user-dropdown-item"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/categories"
                      className="nav-user-dropdown-item"
                    >
                      Danh mục
                    </Link>

                    <div className="nav-user-dropdown-divider" />

                    <button
                      type="button"
                      className="nav-user-dropdown-item nav-user-dropdown-logout"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}