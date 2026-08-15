import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import MonthlyPlanPage from "./pages/MonthlyPlan/MonthlyPlanPage";
import WalletConfigurationPage
  from "./pages/WalletConfiguration/WalletConfigurationPage";
import CategoryPage from "./pages/Category/CategoryPage";
import ExpensePage from "./pages/Expense/ExpensePage";
import IncomePage from "./pages/Income/IncomePage";
import TransactionHistoryPage
  from "./pages/TransactionHistory/TransactionHistoryPage";
import StatisticsPage from "./pages/Statistics/StatisticsPage";
import WalletAlertsPage from "./pages/WalletAlerts/WalletAlertsPage";
import MonthlySummaryPage from "./pages/MonthlySummary/MonthlySummaryPage";
import AiFinancialPage from "./pages/AiFinancial/AiFinancialPage";
import ProfilePage from "./pages/user/ProfilePage";
import UserHomePage from "./pages/user/UserHomePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import LandingPage from "./pages/public/LandingPage";

import NotFoundPage, { ForbiddenPage } from "./pages/NotFoundPage";

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

function AuthOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + (location.search || "") }}
      />
    );
  }

  return <Outlet />;
}

function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* LANDING / HOME */}
        <Route path="/" element={<HomeRoute />} />

        {/* AUTH ONLY */}
        <Route element={<AuthOnlyRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user" element={<UserHomePage />} />
          </Route>
        </Route>

        {/* DEMO + AUTH */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/monthly-plan" element={<MonthlyPlanPage />} />
          <Route
            path="/wallet-configuration"
            element={<WalletConfigurationPage />}
          />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/incomes" element={<IncomePage />} />
          <Route
            path="/transactions"
            element={<TransactionHistoryPage />}
          />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/wallet-alerts" element={<WalletAlertsPage />} />
          <Route
            path="/monthly-summary"
            element={<MonthlySummaryPage />}
          />
          <Route path="/ai-financial" element={<AiFinancialPage />} />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />
            <Route
              path="/admin/users"
              element={<AdminUsersPage />}
            />
          </Route>
        </Route>

        {/* ERRORS */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
