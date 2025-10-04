import React, { useEffect, useState } from "react";
import { FiTrash2, FiEdit, FiCopy,FiPlus } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
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
      await apiClient.post("api/categories", { name: newCategory });
      toast.success("Category added successfully");
      setNewCategory("");
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.errors?.name?.[0] || "Failed to add category");
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
             <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
          ) : (
            <table className="min-w-full text-sm db-back-table responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">ID</th>
                  <th className="text-left font-medium px-3 py-2">Category</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="main-card-box-row">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-3 py-6 text-center text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="border-t hover:bg-gray-50 md:!mb-0">
                      <td className="px-3 py-2" data-label="ID">{cat.id}</td>
                      <td className="px-3 py-2 font-medium" data-label="Category">{cat.name}</td>
                      <td className="px-3 py-2 text-center" data-label="Actions">
                        <div className="mobile-action-btns flex lg:justify-center gap-1">
                      
                          <button
                            onClick={() => { setSelectedCategory(cat); setShowDeleteModal(true); }}
                            className="px-2 py-1 rounded bg-brand-600 text-white text-xs"
                          >
                            <FiTrash2 size={14} />
                          </button>
                       
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

      {/* Add Category Modal (using your design) */}
     {showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowAddModal(false)}
    ></div>

    <div className="relative w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-6 z-10">
      <div className="flex items-start gap-3">
        {/* <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded bg-brand-50 text-brand-700 border border-brand-100">
          <i className="fa-solid fa-folder-plus"></i>
        </div> */}
        <div className="flex-1">
          <h3 className="text-2xl text-black font-bold">Add Category</h3>
          <p className="text-base text-black my-2">Add a new category to the list.</p>
        </div>
      </div>

      <form
        className="mt-1 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddCategory();
        }}
      >
        <div>
          <label className="text-lg text-black font-medium">Category Name</label>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="e.g., Logistics"
            disabled={actionLoading}
          />
        </div>
      </form>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl"
          disabled={actionLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleAddCategory}
          className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl flex items-center gap-2"
          disabled={actionLoading}
        >
          {actionLoading && (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
          )}
          Add
        </button>
      </div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow w-96">
            <h2 className="text-2xl text-black font-bold">Are you sure?</h2>
            <p className="text-base text-black my-3">
              Do you really want to delete <strong>{selectedCategory.name}</strong>?
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
                className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center "
                disabled={actionLoading}
              >
                {actionLoading && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
