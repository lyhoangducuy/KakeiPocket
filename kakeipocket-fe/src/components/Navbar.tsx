import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const {
    user,
    isAdmin,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
      >
        KakeiPocket
      </Link>

      <div className="nav-links">

        {user && (
          <>
            <Link to="/">
              Trang chủ
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            {isAdmin && (
              <Link to="/admin">
                Admin
              </Link>
            )}

            <span>
              {user.email}
              {" "}
              ({user.role})
            </span>

            <button
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