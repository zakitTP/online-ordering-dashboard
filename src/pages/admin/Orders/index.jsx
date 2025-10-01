
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiTrash2, FiSearch } from "react-icons/fi";
import apiClient from "../../../apiClient";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await apiClient.delete(`/api//orders/${id}`);
      toast.success("Order deleted successfully");
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      toast.error("Failed to delete order");
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

        {/* Filters (non-functional yet) */}
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
            <table className="min-w-full text-sm responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">Order ID</th>
                  <th className="text-left font-medium px-3 py-2">Form ID</th>
                  <th className="text-right font-medium px-3 py-2">Total</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                  <th className="text-left font-medium px-3 py-2">Date</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-3 py-2 font-medium" data-label="Order ID">
                      #{order.id}
                    </td>
                    <td className="px-3 py-2" data-label="Form ID">
                      {order.form_id}
                    </td>
                    <td className="px-3 py-2 text-right" data-label="Total">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-3 py-2" data-label="Status">
                      <span className="inline-flex px-3 py-0.5 rounded-full border border-[#bbb] bg-[#dcdcdc] order-status-badge">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2" data-label="Date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className="px-3 py-2 text-center"
                      data-label="Actions"
                      data-actions
                    >
                      <div className="mobile-action-btns flex justify-center gap-2">
                        <button
                          className="px-2 py-1 rounded bg-black text-white text-xs flex items-center gap-1"
                          title="View"
                        >
                          <FiEye />
                       
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center gap-1"
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
    </div>
  );
}

