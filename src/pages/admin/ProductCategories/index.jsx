import React, { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiEdit } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [includeMounting, setIncludeMounting] = useState(false);
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("api/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name is required");

    try {
      setActionLoading(true);
      await apiClient.post("api/categories", {
        name: newCategory,
        includeMounting,
        includeAccessories,
      });

      toast.success("Category added successfully");
      resetForm();
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.errors?.name?.[0] || "Failed to add category");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit category (API call)
  const handleEditCategory = async () => {
    if (!selectedCategory || !newCategory.trim())
      return toast.error("Category name is required");

    try {
      setActionLoading(true);
      await apiClient.put(`api/categories/${selectedCategory.id}`, {
        name: newCategory,
        includeMounting,
        includeAccessories,
      });

      toast.success("Category updated successfully");
      resetForm();
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      setActionLoading(true);
      await apiClient.delete(`api/categories/${selectedCategory.id}`);
      toast.success("Category deleted successfully");
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setActionLoading(false);
      setSelectedCategory(null);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setNewCategory("");
    setIncludeMounting(false);
    setIncludeAccessories(false);
    setSelectedCategory(null);
  };

  return (
    <div id="categories" className="view !mt-0">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 justify-between mb-4">
          <h3 className="font-bold text-black text-3xl">Categories</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1"
          >
            <FiPlus className="mr-1 text-white" /> Add Category
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
            </div>
          ) : (
            <table className="min-w-full text-sm db-back-table responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">ID</th>
                  <th className="text-left font-medium px-3 py-2">Category</th>
                  <th className="text-center font-medium px-3 py-2">Mounting</th>
                  <th className="text-center font-medium px-3 py-2">Accessories</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="main-card-box-row">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 py-6 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{cat.id}</td>
                      <td className="px-3 py-2 font-medium">{cat.name}</td>
                      <td className="px-3 py-2 text-center">
                        {cat.includeMounting ? "✅" : "❌"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {cat.includeAccessories ? "✅" : "❌"}
                      </td>
                      <td className="px-3 py-2 text-center flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setNewCategory(cat.name);
                            setIncludeMounting(cat.includeMounting);
                            setIncludeAccessories(cat.includeAccessories);
                            setShowEditModal(true);
                          }}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-xs"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowDeleteModal(true);
                          }}
                          className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <CategoryModal
          title="Add Category"
          confirmText="Add"
          loading={actionLoading}
          name={newCategory}
          setName={setNewCategory}
          includeMounting={includeMounting}
          setIncludeMounting={setIncludeMounting}
          includeAccessories={includeAccessories}
          setIncludeAccessories={setIncludeAccessories}
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddCategory}
        />
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <CategoryModal
          title="Edit Category"
          confirmText="Update"
          loading={actionLoading}
          name={newCategory}
          setName={setNewCategory}
          includeMounting={includeMounting}
          setIncludeMounting={setIncludeMounting}
          includeAccessories={includeAccessories}
          setIncludeAccessories={setIncludeAccessories}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEditCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow w-96">
            <h2 className="text-2xl text-black font-bold">Are you sure?</h2>
            <p className="text-base text-black my-3">
              Do you really want to delete{" "}
              <strong>{selectedCategory.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center"
                disabled={actionLoading}
              >
                {actionLoading && (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Reusable Modal Component (for Add / Edit)
function CategoryModal({
  title,
  confirmText,
  loading,
  name,
  setName,
  includeMounting,
  setIncludeMounting,
  includeAccessories,
  setIncludeAccessories,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-6 z-10">
        <h3 className="text-2xl text-black font-bold">{title}</h3>

        <form
          className="mt-3 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <div>
            <label className="text-lg text-black font-medium">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="e.g., Logistics"
              disabled={loading}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeMounting}
                onChange={(e) => setIncludeMounting(e.target.checked)}
                disabled={loading}
              />
              <span className="text-black text-base">Include in Mounting</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeAccessories}
                onChange={(e) => setIncludeAccessories(e.target.checked)}
                disabled={loading}
              />
              <span className="text-black text-base">Include in Accessories</span>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl flex items-center gap-2"
              disabled={loading}
            >
              {loading && (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              )}
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
