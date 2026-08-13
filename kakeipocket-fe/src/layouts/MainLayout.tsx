import {
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { LoginRequiredProvider } from "../components/LoginRequiredProvider";
import DemoBanner from "../components/DemoBanner";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <LoginRequiredProvider>
      <Navbar />

      <main className="container">
        {!isAuthenticated && !isPublicPage && <DemoBanner />}
        <Outlet />
      </main>
    </LoginRequiredProvider>
  );
}
