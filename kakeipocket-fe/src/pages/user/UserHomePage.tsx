import { useAuth } from "../../context/AuthContext";

export default function UserHomePage() {
  const { user } =
    useAuth();

  return (
    <div>
      <h1>
        Xin chào 👋
      </h1>

      <p>
        Email: {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>

      <h2>
        KakeiPocket
      </h2>

      <p>
        Đây là trang dành cho người dùng.
      </p>
    </div>
  );
}