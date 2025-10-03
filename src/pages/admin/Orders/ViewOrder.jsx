import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../apiClient";
import "react-toastify/dist/ReactToastify.css";
import { FaPhone, FaEnvelope, FaReceipt, FaUndoAlt, FaTimes } from "react-icons/fa";

export default function ViewOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/orders/${id}`);
      setOrder(res.data);
      console.log("Fetched order:", res.data); // debug
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );

  if (!order) return <p className="text-center py-6">Order not found</p>;

  const { order_detail, transaction_detail, status, total_amount } = order;
  const { formData, clientData, taxes, adminFees, insurance, labourCharge, deliveryPickup, equipmentTotal, consumablesTotal, mountLabour } = order_detail;
  const { products, event_info, company_name, contact_name, contact_email, contact_phone, company_logo } = formData;
  const { companyInfo } = clientData;

  return (
    <div className="md:p-4 p-0 space-y-6">
      <Link to="/dashboard/orders" className="px-4 py-2 mb-4 inline-block rounded bg-black text-white font-semibold">
        ← Back to Orders
      </Link>

      <div className="view !mt-0">
        {/* Order Header */}
        <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">Order Details</h2>
            <p className="text-black mt-1">Order #{order.id}</p>
            <p className="text-black mt-1">{event_info.showName}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center">
              <FaUndoAlt className="mr-2" /> Process Refund
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-3 md:mb-6">
          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
            <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Order ID:</span><span className="font-medium">#{order.id}</span></div>
              <div className="flex justify-between"><span>Date:</span><span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Status:</span><span className={`status-badge status-${status}`}>{status}</span></div>
              <div className="flex justify-between"><span>Payment Method:</span><span className="font-medium">{order.payment_method || "N/A"}</span></div>
              <div className="flex justify-between"><span>Amount:</span><span className="font-medium">${total_amount}</span></div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
            <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium">{companyInfo.companyName}</p>
                <p className="text-black">Ordered by {companyInfo.contactName}</p>
              </div>
              <div>
                <p className="text-black">{companyInfo.address1}</p>
                <p className="text-black">{companyInfo.city}, {companyInfo.state} {companyInfo.zipCode}</p>
                <p className="text-black">{companyInfo.country}</p>
              </div>
              <div className="pt-2">
                <p className="text-black font-medium flex items-center"><FaPhone className="text-[#C81A1F] mr-2" /> {companyInfo.contactPhone}</p>
                <p className="text-black font-medium flex items-center"><FaEnvelope className="text-[#C81A1F] mr-2" /> {companyInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Event Info */}

          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
                <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">Event Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium">{event_info.showName}</p>
                    <p className="text-black">{event_info.facility}</p>
                  </div>
                  <div>
                    <p className="text-black hidden"><span className="font-medium">Booth:</span> {event_info.room}</p>
                    <p className="text-black"><span className="font-medium">Room:</span> {event_info.room}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-black"><span className="font-medium">Load In:</span> {event_info.loadInDate} at {event_info.loadInTime}</p>
                    <p className="text-black"><span className="font-medium">Event:</span> {event_info.startDate} at {event_info.startTime} - {event_info.finishDate} at {event_info.finishTime}</p>
                  </div>
                </div>
              </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-6 border">
          <h3 className="text-2xl font-bold text-black mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full db-back-table responsive">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white main-card-box-row ">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-semibold" data-label="Item">{p.title}</td>
                    <td className="px-4 py-3" data-label="Category">{p.category_name}</td>
                    <td className="px-4 py-3" data-label="Qty">{order_detail.clientData.equipmentSelection.quantities[p.id] || 1}</td>
                    <td className="px-4 py-3" data-label="Price">${p.prepaid_price}</td>
                    <td className="px-4 py-3" data-label="Total">${(p.prepaid_price * (order_detail.clientData.equipmentSelection.quantities[p.id] || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Equipment Total</span><span>${equipmentTotal}</span></div>
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Labour Charge</span><span>${labourCharge}</span></div>
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Admin Fees</span><span>${adminFees}</span></div>
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Insurance</span><span>${insurance}</span></div>
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Taxes</span><span>${taxes}</span></div>
            <div className="flex justify-between mb-2"><span className="text-black font-medium">Delivery/Pickup</span><span>${deliveryPickup}</span></div>
            <div className="flex justify-between text-xl font-bold mt-3 pt-3 border-t"><span>Total Payment</span><span>${total_amount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
