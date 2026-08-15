import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface Props {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles,
}: Props) {
  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // Có giới hạn role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.roles)
  ) {
    return (
      <Navigate
        to="/403"
        replace
      />
    );
  }

  return <Outlet />;
}