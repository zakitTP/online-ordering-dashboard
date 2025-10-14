import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiTrash2, FiSearch,FiChevronLeft,FiChevronRight } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch orders with filters and pagination
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/orders", {
        params: { page, search, status },
      });
     setOrders(res.data.data || []);
      setTotalPages(res.data.last_page);

    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await apiClient.delete(`/api/orders/${deleteId}`);
      toast.success("Order deleted successfully");
      setOrders((prev) => prev.filter((o) => o.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete order");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch whenever filters or page change
  useEffect(() => {
    fetchOrders();
  }, [page, search, status]);

  return (
    <div id="orders" className="view !mt-0">
      <ToastContainer />
      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-bold text-black text-3xl">Orders</h3>
        </div>

        {/* Filters */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-slate-300">
            <FiSearch className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // reset to page 1 when searching
              }}
              placeholder="Search with form title, Order ID, Customer name…"
              className="w-full outline-none text-lg"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded text-lg border border-slate-300"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>Refunded</option>
            <option>Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center py-6">No orders found</p>
          ) : (
            <>
              <table className="min-w-full text-sm db-back-table responsive">
                <thead>
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Order ID</th>
                    <th className="text-left font-medium px-3 py-2">Form Title</th>
                    <th className="text-left font-medium px-3 py-2">Company Name</th>
                    <th className="text-left font-medium px-3 py-2">Total</th>
                    <th className="text-left font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Date</th>
                    <th className="text-center font-medium px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="main-card-box-row">
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-3 py-2 font-medium" data-label="Order ID">#{order.id}</td>
                      <td className="px-3 py-2" data-label="Form Title">{order?.form?.form_title} (ID:#{order?.form?.id})</td>
                      <td className="px-3 py-2" data-label="Company Name">{order?.form?.company_name}</td>
                      <td className="px-3 py-2 text-left" data-label="Total">₹{order.total_amount}</td>
                      <td className="px-3 py-2" data-label="Status">
                       
  {(() => {
    let colorClasses = "border-gray-400 bg-gray-200 text-gray-800"; // default

    switch (order.status?.toLowerCase()) {
      case "completed":
        colorClasses = "border-green-600 bg-green-100 text-green-700";
        break;
      case "failed":
        colorClasses = "border-red-600 bg-red-100 text-red-700";
        break;
      case "refunded":
        colorClasses = "border-orange-500 bg-orange-100 text-orange-700";
        break;
      case "pending":
        colorClasses = "border-yellow-500 bg-yellow-100 text-yellow-700";
        break;
    }

    return (
      <span
        className={`inline-flex max-w-fit px-3 py-0.5 rounded-full border capitalize text-sm font-medium ${colorClasses}`}
      style={{ maxWidth: "fit-content" }}>
        {order.status}
      </span>
    );
  })()}
</td>

                     
                      <td className="px-3 py-2" data-label="Date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-center" data-label="Actions">
                        <div className="flex xl:justify-center justify-start gap-2">
                          <Link
                            to={`/dashboard/orders/${order.id}`}
                            className="px-2 py-1 rounded bg-black text-white text-sm flex items-center gap-1"
                          >
                            <FiEye />
                          </Link>
                          <button
                            onClick={() => setDeleteId(order.id)}
                            className="px-2 py-1 rounded bg-red-600 text-white text-sm flex items-center gap-1"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {/* Improved Pagination */}
<div className="flex items-center justify-between gap-3 mt-6">
  <p className="text-slate-600">
    {Math.min((page - 1) * orders.length + 1, orders.length)}–
    {Math.min(page * orders.length, totalPages * orders.length)} of{" "}
    {totalPages * orders.length}
  </p>
  <div className="flex items-center gap-1">
    <button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
    >
      <FiChevronLeft />
    </button>
    <span className="px-3 py-1 rounded-lg border bg-brand-600 text-white border-brand-600">
      {page}
    </span>
    <button
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
    >
      <FiChevronRight />
    </button>
  </div>
</div>

            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white shadow-xl p-6">
            <h3 className="text-2xl text-black font-bold">Delete order?</h3>
            <p className="text-base text-black my-3">
              Are you sure you want to delete this order?
            </p>
            <div className="mt-1 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded bg-black text-white ${
                  deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {deleteLoading ? "Deleting..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
