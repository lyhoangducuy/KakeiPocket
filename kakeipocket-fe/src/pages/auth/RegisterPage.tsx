import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
  } = useAuth();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      password !== confirmPassword
    ) {
      setError(
        "Mật khẩu xác nhận không khớp"
      );

      return;
    }

    try {
      await register({
        fullName,
        email,
        password,
        confirmPassword,
      });

      setSuccess(
        "Đăng ký thành công!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Đăng ký thất bại"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>KakeiPocket</h1>

        <h2>Đăng ký</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <input
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
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

          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
          />

          <button type="submit">
            Đăng ký
          </button>
        </form>

        <p>
          Đã có tài khoản?{" "}
          <Link to="/login">
            Đăng nhập
          </Link>
        </p>

      </div>
    </div>
  );
}