import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import UserHomePage from "./pages/user/UserHomePage";
import ProfilePage from "./pages/user/ProfilePage";

import AdminDashboardPage
  from "./pages/admin/AdminDashboardPage";

import NotFoundPage, {
  ForbiddenPage,
} from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ===================== */}
          {/* PUBLIC */}
          {/* ===================== */}

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />


          {/* ===================== */}
          {/* USER */}
          {/* ===================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              element={<MainLayout />}
            >

              <Route
                path="/"
                element={
                  <UserHomePage />
                }
              />

              <Route
                path="/profile"
                element={
                  <ProfilePage />
                }
              />

            </Route>

          </Route>


          {/* ===================== */}
          {/* ADMIN */}
          {/* ===================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                ]}
              />
            }
          >

            <Route
              element={<MainLayout />}
            >

              <Route
                path="/admin"
                element={
                  <AdminDashboardPage />
                }
              />

            </Route>

          </Route>


          {/* ===================== */}
          {/* ERROR */}
          {/* ===================== */}

          <Route
            path="/403"
            element={<ForbiddenPage />}
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;