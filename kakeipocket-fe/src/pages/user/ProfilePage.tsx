import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } =
    useAuth();

  return (
    <div>
      <h1>Thông tin tài khoản</h1>

      <div>
        <p>
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.roles}
        </p>
      </div>
    </div>
  );
}