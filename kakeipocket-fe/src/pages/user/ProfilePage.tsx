import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./ProfilePage.css";

const formatRole = (role: string | undefined): string => {
  if (!role) return "—";
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "USER") return "Người dùng";
  return role;
};

const getRoleBadgeClass = (role: string | undefined): string => {
  if (role === "ADMIN") return "profile-role-badge";
  if (role === "USER") return "profile-role-badge role-user";
  return "profile-role-badge role-user";
};

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleCopyEmail = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available */
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <strong>Chưa đăng nhập</strong>
          Vui lòng đăng nhập để xem thông tin tài khoản.
        </div>
      </div>
    );
  }

  const initials =
    (user.email ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-header-info">
          <h1 className="profile-title">Hồ sơ của bạn</h1>
          <p className="profile-subtitle">
            Quản lý thông tin tài khoản và phiên đăng nhập.
          </p>
          <span className={getRoleBadgeClass(user.roles)}>
            {formatRole(user.roles)}
          </span>
        </div>
      </div>

      <section className="profile-card">
        <h2 className="profile-card-title">
          <span aria-hidden="true">👤</span>
          Thông tin tài khoản
        </h2>

        <div className="profile-list">
          <div className="profile-list-row">
            <span className="profile-list-label">Email</span>
            <span className="profile-list-value">
              <code>{user.email}</code>
              <button
                type="button"
                className={`profile-copy-btn ${
                  copied ? "profile-copy-success" : ""
                }`}
                onClick={handleCopyEmail}
                aria-label="Sao chép email"
                title="Sao chép email"
              >
                {copied ? "✓ Đã sao chép" : "Sao chép"}
              </button>
            </span>
          </div>

          <div className="profile-list-row">
            <span className="profile-list-label">Vai trò</span>
            <span className="profile-list-value">
              {formatRole(user.roles)}
            </span>
          </div>

          <div className="profile-list-row">
            <span className="profile-list-label">
              Trạng thái
            </span>
            <span className="profile-list-value">
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  marginRight: 6,
                }}
                aria-hidden="true"
              />
              Đang hoạt động
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Về Dashboard
          </button>
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={() => navigate("/categories")}
          >
            Quản lý danh mục
          </button>
        </div>
      </section>

      <section className="profile-card">
        <h2 className="profile-card-title">
          <span aria-hidden="true">🔒</span>
          Phiên đăng nhập
        </h2>

        <p
          style={{
            margin: 0,
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Phiên hiện tại đang hoạt động trên trình duyệt này.
          Đăng xuất để kết thúc phiên — bạn sẽ cần đăng nhập
          lại để tiếp tục sử dụng.
        </p>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-btn profile-btn-danger"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>

        <div className="profile-meta-row">
          <span>
            <strong>Bảo mật:</strong> dữ liệu được bảo vệ theo
            phiên trình duyệt.
          </span>
        </div>
      </section>
    </div>
  );
}