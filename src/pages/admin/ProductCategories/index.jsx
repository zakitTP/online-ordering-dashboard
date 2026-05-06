import React, { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiEdit } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setCategories } from "../../../lib/categoriesSlice";

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [includeMounting, setIncludeMounting] = useState(false);
  const [includeAccessories, setIncludeAccessories] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [transferCategoryId, setTransferCategoryId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("api/categories");
      dispatch(setCategories(res.data));
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

  // Edit category
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

      await apiClient.delete(`api/categories/${selectedCategory.id}`, {
        data: {
          transfer_to:
            selectedCategory.products_count > 0 ? transferCategoryId : null,
        },
      });

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

  const resetForm = () => {
    setNewCategory("");
    setIncludeMounting(false);
    setIncludeAccessories(false);
    setSelectedCategory(null);
    setTransferCategoryId(null);
  };

  return (
    <div id="categories" className="view !mt-0">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 justify-between mb-4">
          <h3 className="font-bold text-black text-3xl">Categories</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1"
          >
            <FiPlus className="mr-1 text-white" /> Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
            </div>
          ) : (
            <table className="min-w-full text-sm db-back-table responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">Sr.No</th>
                  <th className="text-left font-medium px-3 py-2">Category</th>
                  <th className="text-center font-medium px-3 py-2">Type</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-3 py-6 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2 font-medium">{cat.name}</td>
                      <td className="px-3 py-2 text-center">
                        {cat.includeMounting && cat.includeAccessories
                          ? "Mounting + Accessories"
                          : cat.includeMounting
                          ? "Mounting"
                          : cat.includeAccessories
                          ? "Accessories"
                          : "Product"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedCategory(cat);
                              setNewCategory(cat.name);
                              setIncludeMounting(cat.includeMounting);
                              setIncludeAccessories(cat.includeAccessories);
                              setShowEditModal(true);
                            }}
                            className="px-2 py-1 rounded bg-black text-white text-sm"
                          >
                            <FiEdit size={14} />
                          </button>

                      {categories.length > 1 && (
  <button
    onClick={() => {
      setSelectedCategory(cat);

      const otherCats = categories.filter((c) => c.id !== cat.id);

      // If cat has products but no other place to transfer → block deletion
      if (cat.products_count > 0 && otherCats.length === 0) {
        toast.error("Cannot delete this category because no other category exists to transfer products.");
        return;
      }

      if (cat.products_count > 0) {
        setTransferCategoryId(otherCats[0].id);
      }

      setShowDeleteModal(true);
    }}
    className="px-2 py-1 rounded bg-red-600 text-white text-xs"
  >
    <FiTrash2 size={14} />
  </button>
)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
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

      {/* Edit Modal */}
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

      {/* DELETE MODAL */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">

            <h2 className="text-2xl font-bold text-black">Delete Category</h2>

            {selectedCategory.products_count > 0 ? (
              <>
                <p className="mt-3 text-black">
                  <strong>{selectedCategory.name}</strong> has{" "}
                  <strong>{selectedCategory.products_count}</strong> product(s).  
                  Please transfer them before deleting.
                </p>

                <label className="block mt-3 text-black font-medium">
                  Transfer Products To
                </label>
                <select
                  className="mt-1 w-full border px-3 py-2 rounded"
                  value={transferCategoryId}
                  onChange={(e) => setTransferCategoryId(e.target.value)}
                >
                  {categories
                    .filter((c) => c.id !== selectedCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </>
            ) : (
              <p className="mt-3 text-black">
                Do you really want to delete{" "}
                <strong>{selectedCategory.name}</strong>?
              </p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCategory}
                disabled={actionLoading}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
              >
                {actionLoading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h3 className="text-2xl font-bold text-black">{title}</h3>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <div>
            <label className="text-black font-medium">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="e.g., Logistics"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={includeMounting}
                onChange={(e) => setIncludeMounting(e.target.checked)}
                disabled={loading}
              />
              <span className="text-black">Include in Mounting</span>
            </label>

            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={includeAccessories}
                onChange={(e) => setIncludeAccessories(e.target.checked)}
                disabled={loading}
              />
              <span className="text-black">Include in Accessories</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
