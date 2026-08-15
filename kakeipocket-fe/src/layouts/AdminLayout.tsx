import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import "./AdminLayout.css";

interface AdminNavItem {
  key: string;
  label: string;
  icon: string;
  to?: string;
  active?: boolean;
  badge?: string;
}

const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "📊",
    to: "/admin/dashboard",
    active: true,
  },
  {
    key: "users",
    label: "Người dùng",
    icon: "👥",
    to: "/admin/users",
    active: true,
  },
  {
    key: "categories",
    label: "Danh mục hệ thống",
    icon: "🏷️",
    to: "/admin/categories",
    active: true,
  },
  {
    key: "config",
    label: "Cấu hình",
    icon: "⚙️",
    badge: "Sắp ra mắt",
  },
  {
    key: "export",
    label: "Xuất báo cáo",
    icon: "📤",
    badge: "Sắp ra mắt",
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}
      >
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-logo">KakeiPocket</span>
          <span className="admin-sidebar-tag">Admin</span>
        </div>

        <nav className="admin-nav">
          {ADMIN_NAV.map((item) =>
            item.active && item.to ? (
              <NavLink
                key={item.key}
                to={item.to}
                end
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "admin-nav-item-active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </NavLink>
            ) : (
              <div
                key={item.key}
                className="admin-nav-item admin-nav-item-disabled"
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {item.badge && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </div>
            )
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {(user?.email ?? "A").charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-email">{user?.email}</span>
              <span className="admin-user-role">{user?.roles}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-burger"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Mở menu"
          >
            ☰
          </button>
          <div className="admin-topbar-title">
            <h1>KakeiPocket Admin</h1>
            <span>Bảng điều khiển hệ thống</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
