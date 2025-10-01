import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../apiClient";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // Loader state
  const [deleteId, setDeleteId] = useState(null); // ID for deletion
  const [deleteLoading, setDeleteLoading] = useState(false); // Loader for delete modal

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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/products/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
    setDeleteLoading(false);
  };

  return (
    <div id="products" className="view !mt-0">
      {/* Delete Modal */}
      {deleteId && (
        <div id="confirmModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded bg-brand-50 text-brand-700 border border-brand-100">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-black font-bold">Delete item?</h3>
                <p className="text-lg text-black mt-1">Are you sure you want to delete this product?</p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center ${
                  deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? "Deleting..." : "OK"}
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium px-3 py-2">ID</th>
                    <th className="text-left font-medium px-3 py-2">Image</th>
                    <th className="text-left font-medium px-3 py-2">Product</th>
                    <th className="text-left font-medium px-3 py-2">Category</th>
                    <th className="text-right font-medium px-3 py-2">Prepaid Price</th>
                    <th className="text-right font-medium px-3 py-2">Standard Price</th>
                    <th className="text-right font-medium px-3 py-2">Extra Labour</th>
                    <th className="text-center font-medium px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.id}</td>
                      <td className="px-3 py-2">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.title}
                            className="thumb grid place-items-center text-xs text-slate-500 product-card-img"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{p.title}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex justify-center border border-[#bbb] px-4 py-0.5 rounded-full bg-[#dcdcdc] category-card-title">
                          {p.category?.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">${p.prepaid_price}</td>
                      <td className="px-3 py-2 text-right">${p.standard_price}</td>
                      <td className="px-3 py-2 text-right">{p.labour_price > 0 ? `$${p.labour_price}` : "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/products/edit/${p.id}`)}
                            className="px-2 py-1 rounded bg-black text-white text-xs"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="px-2 py-1 rounded bg-brand-600 text-white text-xs"
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
            <div className="flex items-center justify-between mt-4 text-base md:text-lg">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="md:px-3 px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                Reset Filters
              </button>
              <div className="flex items-center gap-3 pl-1">
                <p className="text-slate-600">
                  {Math.min((page - 1) * perPage + 1, products.length)}–{Math.min(page * perPage, totalPages * perPage)} of {totalPages * perPage}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="px-2.5 py-1.5 rounded-lg border bg-brand-600 text-white border-brand-600">{page}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
