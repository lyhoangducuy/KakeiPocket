import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../api/axios";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {

  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================
  // STEP 1 - SEND OTP
  // =========================

  const handleSendOtp = async (
    e: FormEvent
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setSuccess(
        "Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra email."
      );

      setStep(2);

    } catch (error: any) {

      setError(
        error?.response?.data?.message ||
        "Không thể gửi mã OTP. Vui lòng thử lại."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // STEP 2 - VERIFY OTP
  // =========================

  const handleVerifyOtp = async (
    e: FormEvent
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      await api.post(
        "/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      setSuccess(
        "Xác nhận OTP thành công."
      );

      setStep(3);

    } catch (error: any) {

      setError(
        error?.response?.data?.message ||
        "Mã OTP không hợp lệ hoặc đã hết hạn."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // STEP 3 - RESET PASSWORD
  // =========================

  const handleResetPassword = async (
    e: FormEvent
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {

      setError(
        "Mật khẩu xác nhận không khớp."
      );

      return;
    }

    setLoading(true);

    try {

      await api.post(
        "/auth/reset-password",
        {
          email,
          newPassword,
          confirmPassword,
        }
      );

      setSuccess(
        "Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);

    } catch (error: any) {

      setError(
        error?.response?.data?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // BACK
  // =========================

  const handleBack = () => {

    setError("");
    setSuccess("");

    if (step === 2) {
      setStep(1);
      setOtp("");
      return;
    }

    if (step === 3) {
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
    }
  };


  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>KakeiPocket</h1>

        <h2>
          Quên mật khẩu
        </h2>


        {/* ========================= */}
        {/* PROGRESS */}
        {/* ========================= */}

        
        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* ========================= */}
        {/* SUCCESS */}
        {/* ========================= */}

        {success && (
          <div className="success">
            {success}
          </div>
        )}


        {/* ========================= */}
        {/* STEP 1 */}
        {/* ========================= */}

        {step === 1 && (

          <form
            onSubmit={handleSendOtp}
          >

            <p>
              Nhập email đã đăng ký để nhận
              mã OTP khôi phục mật khẩu.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Đang gửi OTP..."
                : "Gửi mã OTP"}
            </button>

          </form>
        )}


        {/* ========================= */}
        {/* STEP 2 */}
        {/* ========================= */}

        {step === 2 && (

          <form
            onSubmit={handleVerifyOtp}
          >

            <p>
              Mã OTP đã được gửi đến:
            </p>

            <strong>
              {email}
            </strong>

            <input
              type="text"
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChange={(e) => {

                const value =
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);

              }}
              maxLength={6}
              inputMode="numeric"
              required
            />

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
            >
              {loading
                ? "Đang xác nhận..."
                : "Xác nhận OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
            >
              Quay lại
            </button>

          </form>
        )}


        {/* ========================= */}
        {/* STEP 3 */}
        {/* ========================= */}

        {step === 3 && (

          <form
            onSubmit={handleResetPassword}
          >

            <p>
              Tạo mật khẩu mới cho tài khoản:
            </p>

            <strong>
              {email}
            </strong>

            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              minLength={6}
              required
            />

            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              minLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Đang cập nhật..."
                : "Đặt lại mật khẩu"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
            >
              Quay lại
            </button>

          </form>
        )}


        {/* ========================= */}
        {/* LOGIN */}
        {/* ========================= */}

        <p>
          Nhớ mật khẩu rồi?{" "}

          <Link to="/login">
            Đăng nhập
          </Link>
        </p>

      </div>

    </div>
  );
}