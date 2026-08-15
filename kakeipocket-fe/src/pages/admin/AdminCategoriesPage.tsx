import { useEffect, useMemo, useState } from "react";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "../../api/adminCategoryApi";

import CategoryFormModal from "../../components/admin/CategoryFormModal";
import ConfirmModal from "../../components/ConfirmModal";

import type {
  AdminCategory,
  AdminCategoryType,
  CreateAdminCategoryRequest,
  UpdateAdminCategoryRequest,
} from "../../types/adminCategory";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";

import "./AdminCategoriesPage.css";

type TypeFilter = "ALL" | AdminCategoryType;

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState("");
  const [type, setType] = useState<TypeFilter>("ALL");

  const debouncedKeyword = useDebouncedValue(keywordInput, 400);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formCategory, setFormCategory] = useState<AdminCategory | null>(
    null
  );
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<AdminCategory | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminCategories({
        page,
        size: PAGE_SIZE,
        keyword: debouncedKeyword,
        type: type === "ALL" ? "" : type,
      });
      setCategories(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const sc = err?.response?.status;
      if (sc === 403) {
        setError("Bạn không có quyền truy cập.");
      } else if (sc === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Không thể tải danh sách danh mục."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedKeyword, type]);

  const openCreate = () => {
    setFormMode("create");
    setFormCategory(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setFormMode("edit");
    setFormCategory(category);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formBusy) return;
    setFormOpen(false);
    setFormError("");
  };

  const handleFormSubmit = async (
    payload: CreateAdminCategoryRequest | UpdateAdminCategoryRequest
  ) => {
    setFormBusy(true);
    setFormError("");
    try {
      if (formMode === "create") {
        const created = await createAdminCategory(payload);
        setCategories((prev) => [created, ...prev]);
        setTotalElements((prev) => prev + 1);
      } else if (formCategory) {
        const updated = await updateAdminCategory(
          formCategory.id,
          payload as UpdateAdminCategoryRequest
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      }
      setFormOpen(false);
    } catch (err: any) {
      const sc = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        (sc === 400
          ? "Dữ liệu không hợp lệ hoặc danh mục đã tồn tại."
          : sc === 403
            ? "Bạn không có quyền thực hiện thao tác này."
            : "Đã xảy ra lỗi. Vui lòng thử lại.");
      setFormError(message);
    } finally {
      setFormBusy(false);
    }
  };

  const openDelete = (category: AdminCategory) => {
    setDeleteTarget(category);
    setDeleteError("");
  };

  const closeDelete = () => {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await deleteAdminCategory(deleteTarget.id);
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );
      setTotalElements((prev) => Math.max(prev - 1, 0));
      setDeleteTarget(null);
    } catch (err: any) {
      const sc = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        (sc === 400
          ? "Danh mục đang được sử dụng hoặc không thể xóa."
          : sc === 403
            ? "Bạn không có quyền xóa danh mục này."
            : "Đã xảy ra lỗi. Vui lòng thử lại.");
      setDeleteError(message);
    } finally {
      setDeleteBusy(false);
    }
  };

  const showingFrom = useMemo(() => {
    if (categories.length === 0) return 0;
    return page * PAGE_SIZE + 1;
  }, [categories.length, page]);

  const showingTo = useMemo(
    () => page * PAGE_SIZE + categories.length,
    [categories.length, page]
  );

  return (
    <div className="admin-cat-page">
      <div className="admin-cat-header">
        <div>
          <h2 className="admin-cat-title">Quản lý danh mục mặc định</h2>
          <p className="admin-cat-subtitle">
            Danh mục hệ thống dùng làm gợi ý cho tất cả người dùng.
          </p>
        </div>
        <div className="admin-cat-header-actions">
          <button
            className="admin-cat-btn-secondary"
            onClick={load}
          >
            ↻ Làm mới
          </button>
          <button
            className="admin-cat-btn-primary"
            onClick={openCreate}
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-cat-filters">
        <form
          className="admin-cat-search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
          }}
        >
          <span className="admin-cat-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
        </form>

        <select
          className="admin-cat-select"
          value={type}
          onChange={(e) => {
            setType(e.target.value as TypeFilter);
            setPage(0);
          }}
        >
          <option value="ALL">Tất cả loại</option>
          <option value="EXPENSE">Chi tiêu</option>
          <option value="INCOME">Thu nhập</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-cat-table-wrapper">
        <table className="admin-cat-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên</th>
              <th style={{ width: 110 }}>Loại</th>
              <th style={{ width: 110 }}>Sử dụng</th>
              <th style={{ width: 140 }}>Ngày tạo</th>
              <th style={{ width: 170 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-cat-state">
                  <div className="admin-cat-spinner"></div>
                  Đang tải...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="admin-cat-state admin-cat-error">
                  <span>{error}</span>
                  <button className="admin-cat-retry" onClick={load}>
                    Thử lại
                  </button>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-cat-state">
                  <p>Chưa có danh mục mặc định nào.</p>
                  <button
                    className="admin-cat-btn-primary"
                    onClick={openCreate}
                  >
                    + Thêm danh mục đầu tiên
                  </button>
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    <div className="admin-cat-cell-name">
                      <span
                        className="admin-cat-icon"
                        style={{
                          background:
                            c.color ?? "#3b82f6",
                        }}
                      >
                        {c.icon ?? "📦"}
                      </span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-cat-type-badge admin-cat-type-${c.type.toLowerCase()}`}
                    >
                      {c.type === "EXPENSE" ? "Chi tiêu" : "Thu nhập"}
                    </span>
                  </td>
                  <td>
                    <span className="admin-cat-usage">
                      {c.usageCount > 0
                        ? `${c.usageCount} giao dịch`
                        : "—"}
                    </span>
                  </td>
                  <td>{formatDateTime(c.createdAt)}</td>
                  <td>
                    <div className="admin-cat-actions">
                      <button
                        className="admin-cat-action-btn admin-cat-action-edit"
                        onClick={() => openEdit(c)}
                      >
                        Sửa
                      </button>
                      <button
                        className="admin-cat-action-btn admin-cat-action-delete"
                        onClick={() => openDelete(c)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin-cat-pagination">
        <span className="admin-cat-total">
          Tổng cộng <strong>{totalElements.toLocaleString("vi-VN")}</strong>{" "}
          danh mục
          {categories.length > 0 && (
            <>
              {" "}— Hiển thị {showingFrom}-{showingTo}
            </>
          )}
        </span>
        <div className="admin-cat-pager">
          <button
            className="admin-cat-pager-btn"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            ← Trước
          </button>
          <span className="admin-cat-pager-info">
            Trang {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            className="admin-cat-pager-btn"
            disabled={page >= totalPages - 1 || loading}
            onClick={() =>
              setPage((p) =>
                totalPages > 0 ? Math.min(p + 1, totalPages - 1) : p
              )
            }
          >
            Sau →
          </button>
        </div>
      </div>

      <CategoryFormModal
        open={formOpen}
        mode={formMode}
        category={formCategory}
        busy={formBusy}
        errorMessage={formError}
        onSubmit={handleFormSubmit}
        onCancel={closeForm}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Xóa danh mục mặc định"
        message={
          deleteError
            ? deleteError
            : "Bạn có chắc muốn xóa danh mục này? Hành động không thể hoàn tác."
        }
        details={
          deleteTarget
            ? [
                { label: "Tên", value: deleteTarget.name },
                {
                  label: "Loại",
                  value:
                    deleteTarget.type === "EXPENSE"
                      ? "Chi tiêu"
                      : "Thu nhập",
                },
                {
                  label: "Đang được sử dụng",
                  value:
                    deleteTarget.usageCount > 0
                      ? `${deleteTarget.usageCount} giao dịch`
                      : "Không",
                },
              ]
            : undefined
        }
        confirmLabel="Xóa danh mục"
        variant="danger"
        busy={deleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
