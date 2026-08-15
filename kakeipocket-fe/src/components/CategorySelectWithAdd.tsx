import { useState } from "react";

import QuickAddCategoryModal from "./QuickAddCategoryModal";

import type {
  Category,
  CategoryType,
} from "../types/category";

import "./CategorySelectWithAdd.css";

interface CategorySelectWithAddProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  type: CategoryType;
  disabled?: boolean;
  onCategoryCreated?: (category: Category) => void;
  placeholder?: string;
}

export default function CategorySelectWithAdd({
  categories,
  value,
  onChange,
  type,
  disabled = false,
  onCategoryCreated,
  placeholder = "-- Chọn danh mục --",
}: CategorySelectWithAddProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = categories.filter((c) => c.type === type);

  const handleAddClick = () => {
    if (disabled) return;
    setModalOpen(true);
  };

  const handleCreated = (category: Category) => {
    setModalOpen(false);
    if (category.type !== type) {
      console.warn(
        `[CategorySelectWithAdd] created category type (${category.type}) mismatch with parent type (${type}). ` +
          `The category was created but won't appear in this dropdown.`
      );
      onCategoryCreated?.(category);
      return;
    }
    onChange(String(category.id));
    onCategoryCreated?.(category);
  };

  return (
    <>
      <div className="cswa-row">
        <select
          className="cswa-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {filtered.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.isDefault ? "⭐ " : ""}
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="cswa-add-btn"
          onClick={handleAddClick}
          disabled={disabled}
          title="Thêm danh mục"
          aria-label="Thêm danh mục"
        >
          +
        </button>
      </div>

      <QuickAddCategoryModal
        open={modalOpen}
        defaultType={type}
        onCancel={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
