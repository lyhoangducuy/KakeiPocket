export function ForbiddenPage() {
  return (
    <div className="error-page">
      <h1>403</h1>

      <h2>
        Không có quyền truy cập
      </h2>

      <p>
        Bạn không có quyền truy cập
        trang này.
      </p>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <div className="error-page">
      <h1>404</h1>

      <h2>
        Không tìm thấy trang
      </h2>
    </div>
  );
}