import { useState, useEffect } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../apiClient";
const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount);

  return isNaN(numericAmount)
    ? "CAD 0.00"
    : numericAmount.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        currencyDisplay: "code", // shows CAD instead of $
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category_id: selectedCategory !== "all" ? selectedCategory : undefined,
        page,
        per_page: perPage,
      };
      const res = await apiClient.get("/api/products", { params });
      setProducts(res.data.data);
      setTotalPages(res.data.last_page);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, page, perPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDeleteModal = (product) => {
    setDeleteId(product.id);
    setProductToDelete(product);
    setDeleteConfirmation("");
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setProductToDelete(null);
    setDeleteConfirmation("");
  };

const handleDelete = async () => {
  if (!deleteId) return;

  if (
    productToDelete?.forms_count > 0 &&
    deleteConfirmation.toLowerCase() !== "delete"
  ) {
    return;
  }
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/products/${deleteId}`);
      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
    setDeleteLoading(false);
  };

  const isDeleteDisabled =
    deleteLoading || deleteConfirmation.toLowerCase() !== "delete";

  return (
    <div id="products" className="view !mt-0">
      {/* Delete Modal */}
      {deleteId && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white shadow-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-2xl text-black font-bold">Delete item?</h3>

                {productToDelete.forms_count > 0 ? (
                  <div className="my-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-base text-yellow-800 font-medium">
                      ⚠️ This product has {productToDelete.forms_count} form
                      {productToDelete.forms_count !== 1 ? "s" : ""} associated
                      with it.
                    </p>
                     {productToDelete.form_ids && productToDelete.form_ids.length > 0 && (
    <p className="text-sm text-yellow-900 font-semibold mt-1">
      IDs are: {productToDelete.form_ids.join(", ")}
    </p>
  )}
                    <p className="text-sm text-yellow-700 mt-1">
                      Deleting this product will affect these forms.
                    </p>
                    <div className="mt-4">
                      <label
                        htmlFor="deleteConfirm"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Type "delete" to confirm:
                      </label>
                      <input
                        id="deleteConfirm"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                        placeholder="Type 'delete' here..."
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-black my-3">
                    Are you sure you want to delete{" "}
                    <strong>"{productToDelete.title}"</strong>?
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center hover:bg-[#a01519] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={
                  productToDelete.forms_count > 0
                    ? isDeleteDisabled
                    : deleteLoading
                }
                className={`px-3 md:px-5 py-3 rounded text-white text-xl w-32 text-center transition-colors ${
                  (
                    productToDelete.forms_count > 0
                      ? isDeleteDisabled
                      : deleteLoading
                  )
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 justify-between mb-4">
          <h3 className="font-bold text-black text-3xl">Products</h3>
          <Link
            to="/dashboard/addproduct"
            className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1"
          >
            <FiPlus /> Add Product
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-slate-300">
            <FiSearch className="text-slate-500" />
            <input
              placeholder="Search product…"
              className="w-full outline-none text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full px-3 py-2 rounded text-lg border border-slate-300"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm db-back-table responsive">
                <thead>
                  <tr>
                    <th className="text-left font-medium px-3 py-2">ID</th>
                    <th className="text-left font-medium px-3 py-2">Image</th>
                    <th className="text-left font-medium px-3 py-2">Product</th>
                    <th className="text-left font-medium px-3 py-2">
                      Category
                    </th>
                    <th className="text-right font-medium px-3 py-2">
                      Prepaid Price
                    </th>
                    <th className="text-right font-medium px-3 py-2">
                      Standard Price
                    </th>
                    <th className="text-right font-medium px-3 py-2">
                      Extra Labour
                    </th>
                    <th className="text-center font-medium px-3 py-2">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="main-card-box-row">
                  {products.map((p) => (
                    <tr key={p.id} className="border-t md:!mb-0">
                      <td className="px-3 py-2" data-label="ID">
                        {p.id}
                      </td>
                      <td className="px-3 py-2" data-label="Image">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="thumb grid place-items-center text-xs text-slate-500 product-card-img"
                          />
                        )}
                      </td>
                      <td
                        className="px-3 py-2 font-medium"
                        data-label="Product"
                      >
                        {p.title}
                        {p.form_count > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {p.form_count} form{p.form_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2" data-label="Category">
                        {p?.category && (
                          <span className="inline-flex justify-center border border-[#bbb] text-center px-2 py-0.5 rounded-full bg-[#dcdcdc] category-card-title text-sm !max-w-[fit-content]">
                            {p?.category?.name}
                          </span>
                        )}
                      </td>
                      <td
                        className="px-3 py-2 text-right"
                        data-label="Prepaid Price"
                      >
                        {formatCurrency(p.prepaid_price)}
                      </td>
                      <td
                        className="px-3 py-2 text-right"
                        data-label="Standard Price"
                      >
                        {formatCurrency(p.standard_price)}
                      </td>
                      <td
                        className="px-3 py-2 text-right"
                        data-label="Extra Labour"
                      >
                        {p.labour_price > 0 ? `${formatCurrency(p.labour_price)}` : "-"}
                      </td>
                      <td
                        className="px-3 py-2 text-center"
                        data-label="Actions"
                      >
                        <div className="flex justify-start gap-1">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/products/edit/${p.id}`)
                            }
                            className="px-2 py-1 rounded bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)}
                            className="px-2 py-1 rounded bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-base gap-3">
                <p className="text-slate-600">
                  Showing{" "}
                  {products.length
                    ? `${(page - 1) * perPage + 1}–${Math.min(
                        page * perPage,
                        totalItems
                      )}`
                    : "0"}{" "}
                  of {totalItems} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: totalPages })
                    .map((_, i) => i + 1)
                    .filter((pNum) => {
                      if (totalPages <= 5) return true;
                      if (page <= 3) return pNum <= 5;
                      if (page >= totalPages - 2) return pNum >= totalPages - 4;
                      return pNum >= page - 2 && pNum <= page + 2;
                    })
                    .map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                          pNum === page
                            ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                            : "border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
