import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiTrash2, FiSearch } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/orders");
      setOrders(res.data);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div id="orders" className="view !mt-0">
      <ToastContainer />
      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-bold text-black text-3xl">Orders</h3>
        </div>

        {/* Filters */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-slate-300">
            <FiSearch className="text-slate-500" />
            <input
              placeholder="Search order ID, customer…"
              className="w-full outline-none text-lg"
            />
          </div>
          <select className="w-full px-3 py-2 rounded text-lg border border-slate-300">
            <option>Status: All</option>
            <option>Pending</option>
            <option>Paid</option>
            <option>Shipped</option>
            <option>Cancelled</option>
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
            <table className="min-w-full text-sm db-back-table responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">Order ID</th>
                  <th className="text-left font-medium px-3 py-2">Form ID</th>
                  <th className="text-left font-medium px-3 py-2">Total</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                  <th className="text-left font-medium px-3 py-2">Date</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="main-card-box-row new">
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-3 py-2 font-medium" data-label="Order ID">
                      #{order.id}
                    </td>
                    <td className="px-3 py-2" data-label="Form ID">
                      {order.form_id}
                    </td>
                    <td className="px-3 py-2 text-left" data-label="Total">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-3 py-2" data-label="Status">
                      <span className="inline-flex px-3 py-0.5 rounded-full border border-[#bbb] bg-[#dcdcdc] order-status-badge capitalize text-sm">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2" data-label="Date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-center" data-label="Actions">
                      <div className="mobile-action-btns flex justify-center gap-2">
                        <Link
                          to={`/dashboard/orders/${order.id}`}
                          className="px-2 py-1 rounded bg-black text-white text-sm flex items-center gap-1"
                          title="View"
                        >
                          <FiEye />
                        </Link>
                        <button
                          onClick={() => setDeleteId(order.id)}
                          className="px-2 py-1 rounded bg-red-600 text-white text-sm flex items-center gap-1"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white shadow-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-2xl text-black font-bold">Delete order?</h3>
                <p className="text-base text-black my-3">
                  Are you sure you want to delete this order?
                </p>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-end gap-2">
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
    </div>
  );
}
