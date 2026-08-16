import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      const state = location.state as
        | { from?: string }
        | null;
      const from = state?.from;

      if (
        from &&
        from !== "/login" &&
        from !== "/register" &&
        from !== "/"
      ) {
        navigate(from, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
        "Email hoặc mật khẩu không đúng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>KakeiPocket</h1>

        <h2>Đăng nhập</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />
          <div className="forgot-password-link">
            <Link to="/forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>
        </form>

        <p>
          Chưa có tài khoản?{" "}
          <Link to="/register">
            Đăng ký
          </Link>
        </p>

      </div>
    </div>
  );
}