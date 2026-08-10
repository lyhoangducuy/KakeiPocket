import { useAuth } from "../../context/AuthContext";

export default function AdminDashboardPage() {
  const { user } =
    useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <p>
        Xin chào Admin:
        {" "}
        {user?.email}
      </p>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Users</h3>
          <p>Quản lý người dùng</p>
        </div>

        <div className="dashboard-card">
          <h3>Statistics</h3>
          <p>Thống kê hệ thống</p>
        </div>

        <div className="dashboard-card">
          <h3>Settings</h3>
          <p>Cấu hình hệ thống</p>
        </div>

      </div>
    </div>
  );
}