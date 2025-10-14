import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import apiClient from "../../../apiClient";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPhone,
  FaEnvelope,
  FaUndoAlt,
  FaTimes,
  FaSpinner,
  FaReceipt,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";

export default function ViewOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState(false);
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundType, setRefundType] = useState("full");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundNote, setRefundNote] = useState("");
  console.log(order);
  // Fetch order
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/orders/${id}`);
      setOrder(res.data);
      setRefundAmount(res.data?.total_amount || 0);
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

  // Handle refund type change
  const handleRefundTypeChange = (e) => {
    const type = e.target.value;
    setRefundType(type);
    if (type === "full") setRefundAmount(order?.total_amount || 0);
    if (type === "partial") setRefundAmount(0);
  };

  // Handle refund submission
  const handleRefundSubmit = async (e) => {
    e.preventDefault();

    if (refundAmount <= 0) {
      toast.error("Refund amount must be greater than zero");
      return;
    }

    if (order?.total_amount > order?.total_amount) {
      toast.error("Refund amount cannot exceed order total");
      return;
    }

    setRefundLoading(true);

    try {
      const response = await apiClient.post("/api/orders/refund", {
        order_id: order.id,
        refund_amount: parseFloat(refundAmount),
        refund_note: refundNote,
      });

      if (response.status === 200) {
        toast.success(
          response.data.message || "Refund processed successfully!"
        );

        // Update local order state with refund details
        setOrder((prevOrder) => ({
          ...prevOrder,
          status: "refunded",
          refund_detail: response.data.refund,
        }));

        setShowRefundPopup(false);
        setRefundNote("");

        // Refresh order data to get latest status
        setTimeout(() => {
          fetchOrder();
        }, 1000);
      } else {
        throw new Error(response.data.error || "Refund failed");
      }
    } catch (error) {
      console.error("Refund error:", error);

      let errorMessage = "Refund processing failed";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // If we have refund details in error response, update the order
      if (error.response?.data?.refund) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          refund_detail: error.response.data.refund,
        }));
      }
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );

  if (!order) return <p className="text-center py-6">Order not found</p>;

  // Destructure order safely
  const order_detail = order?.order_detail || {};
  const formData = order_detail?.formData || {};
  const clientData = order_detail?.clientData || {};
  const products = formData?.products || [];
  const event_info = formData?.event_info || {};
  const companyInfo = clientData?.companyInfo || {};
  const status = order?.status || "N/A";
  const total_amount = order?.total_amount || 0;
  const refund_detail = order?.refund_detail || {};

  const equipmentTotal = order_detail?.equipmentTotal || 0;
  const labourCharge = order_detail?.labourCharge || 0;
  const adminFees = order_detail?.adminFees || 0;
  const insurance = order_detail?.insurance || 0;
  const taxes = order_detail?.taxes || 0;
  const deliveryPickup = order_detail?.deliveryPickup || 0;
  const quantities = clientData?.equipmentSelection?.quantities || {};
  const combinedLabour = order_detail?.combinedLabour || 0;
  const subtotal = order_detail?.subtotal || 0;
  const consumablesTotal = order_detail?.consumablesTotal || 0;
  const tax_breakdown = order_detail?.tax_breakdown || '';

  // Check if order is already refunded
  const isRefunded = "refunded";

  // Get refund transaction ID from refund response
  const refundTransactionId =
    refund_detail?.refund_response?.gatewayResponse
      ?.transactionProcessingDetails?.transactionId;

  // Get refund date
  const refundDate = refund_detail?.refunded_at;

  // Get refund amount
  const refundAmountValue = refund_detail?.refund_amount;

  return (
    <div className="md:p-4 p-0 space-y-6">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="pb-4">
        <Link
          to="/dashboard/orders"
          className="px-4 py-2 inline-block rounded bg-black text-white font-semibold"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="view !mt-0">
        {/* Order Header */}
        <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 mb-3 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">Order Details</h2>
            <p className="text-black mt-1">Order #{order.id}</p>
            <p className="text-black mt-1">{event_info.showName}</p>
          </div>
          {status == 'completed' &&
          <div className="mt-4 md:mt-0 flex space-x-3">
            {!isRefunded && (
              <button
                onClick={() => setShowRefundPopup(true)}
                disabled={refundLoading}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refundLoading ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : (
                  <FaUndoAlt className="mr-2" />
                )}
                {refundLoading ? "Processing..." : "Process Refund"}
              </button>
            )}
          </div>
}
        </div>

        {/* Order Summary, Customer Info, Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-3 md:mb-6">
          {/* Order Summary */}
          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
            <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`capitalize font-medium status-badge status-${status}`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {order.payment_method || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">${total_amount}</span>
              </div>

              
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
            <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium">{companyInfo.companyName}</p>
                <p className="text-black">
                  Ordered by {companyInfo.contactName}
                </p>
              </div>
              <div>
                <p className="text-black">{companyInfo.address1}</p>
                <p className="text-black">
                  {companyInfo.city}, {companyInfo.state} {companyInfo.zipCode}
                </p>
                <p className="text-black">{companyInfo.country}</p>
              </div>
              <div className="pt-2">
                <p className="text-black font-medium flex items-center">
                  <FaPhone className="text-[#C81A1F] mr-2" />{" "}
                  {companyInfo.contactPhone}
                </p>
                <p className="text-black font-medium flex items-center">
                  <FaEnvelope className="text-[#C81A1F] mr-2" />{" "}
                  {companyInfo.email}
                </p>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-[#eeeeee] rounded-lg shadow-sm p-6 text-black">
            <h3 className="text-[22px] font-bold text-black mb-4 pb-2 border-b">
              Event Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium">{event_info.showName}</p>
                <p className="text-black">{event_info.facility}</p>
              </div>
              <div>
                <p className="text-black">
                  <span className="font-medium">Room:</span> {event_info.room}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-black">
                  <span className="font-medium">Load In:</span>{" "}
                  {event_info.loadInDate} at {event_info.loadInTime}
                </p>
                <p className="text-black">
                  <span className="font-medium">Event:</span>{" "}
                  {event_info.startDate} at {event_info.startTime} -{" "}
                  {event_info.finishDate} at {event_info.finishTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- FIXED: Mobile-responsive refund detail cards ---- */}
        <div className="py-3">
          <h3 className="text-2xl font-bold text-black mb-4">Refund Details</h3>

          {/* Stack vertically on small screens, row on md+; make cards fluid on mobile */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-start">
            {/* Refund Amount */}
            <div className="flex flex-col border border-gray-200 p-5 rounded-lg bg-white shadow-sm w-full md:w-60">
              <label className="mb-2 text-lg font-medium text-black text-center">Refund Amount</label>
              <div className="flex justify-center items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200 text-center">
                <span className="font-semibold">$27,106</span>
              </div>
            </div>

            {/* Refund Date */}
            <div className="flex flex-col border border-gray-200 p-5 rounded-lg bg-white shadow-sm w-full md:w-60">
              <label className="mb-2 text-lg font-medium text-black text-center">Refund Date</label>
              <div className="flex justify-center items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">14 Oct 2025</span>
              </div>
            </div>

            {/* Refund Transaction ID */}
            <div className="flex flex-col border border-gray-200 p-5 rounded-lg bg-white shadow-sm w-full md:w-60">
              <label className="mb-2 text-lg font-medium text-black text-center">Refund Transaction ID</label>
              <div className="flex justify-center items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 text-center">
                <span className="font-medium break-all">REF1234567890</span>
              </div>
            </div>
          </div>
        </div>
        {/* ---- /FIXED ---- */}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-6 border">
          <h3 className="text-2xl font-bold text-black mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full db-back-table responsive">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white main-card-box-row">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-semibold" data-label="Item">
                      <p>
                        {p.title}
                        {p.labour_price > 0 && (
                          <span className="text-[12px] md:text-[14px] text-slate-500">
                            (*Extra labour req'd per day) ({p.labour_price})
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3" data-label="Category">
                      {p.category_name}
                    </td>
                    <td className="px-4 py-3" data-label="Qty">
                      {quantities[p.id] || 1}
                    </td>
                    <td className="px-4 py-3" data-label="Price">
                      ${p.prepaid_price}
                    </td>
                    <td className="px-4 py-3" data-label="Total">
                      ${(p.prepaid_price * (quantities[p.id] || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-black font-medium">Equipment Total</span>
              <span>${equipmentTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">Labour Charge</span>
              <span>${labourCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">
                Additional Large Monitor / Kiosk / Wall Mount + Screen Labour
              </span>
              <span>${combinedLabour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">Insurance</span>
              <span>${insurance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">Consumables</span>
              <span>${consumablesTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">Admin Fees</span>
              <span>${adminFees}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-black font-medium">Delivery/Pickup</span>
              <span>${deliveryPickup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black font-medium">
                Taxes {Object.keys(tax_breakdown).join(", ")}
              </span>
              <span>${taxes}</span>
            </div>

            <div className="flex justify-between text-xl font-bold mt-3 pt-3 border-t">
              <span>Total Payment</span>
              <span>${total_amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Popup */}
      {showRefundPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-black">
                  Process Refund
                </h3>
                <button
                  onClick={() => !refundLoading && setShowRefundPopup(false)}
                  disabled={refundLoading}
                  className="text-brand-600 text-xl hover:text-gray-700 disabled:opacity-50"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleRefundSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-base lg:text-lg text-black font-medium">
                      Refund Type
                    </label>
                    <select
                      value={refundType}
                      onChange={handleRefundTypeChange}
                      disabled={refundLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                      <option value="full">Full Refund</option>
                      <option value="partial">Partial Refund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-base lg:text-lg text-black font-medium">
                      Refund Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        max={total_amount}
                        value={refundAmount}
                        onChange={(e) => {
                          let val = e.target.value;

                          // Allow clearing the field
                          if (val === "") {
                            setRefundAmount("");
                            return;
                          }

                          // Remove leading zeros except for "0." (like 0.5)
                          if (/^0+[0-9]/.test(val)) {
                            val = val.replace(/^0+/, "");
                          }

                          // Convert to float for validation
                          let numVal = parseFloat(val);
                          if (isNaN(numVal) || numVal < 0) numVal = 0;
                          if (numVal > total_amount) numVal = total_amount;

                          setRefundAmount(val);
                        }}
                        disabled={refundLoading || refundType === "full"}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-base lg:text-lg text-black font-medium">
                    Refund Note (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    disabled={refundLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    placeholder="Internal notes about this refund..."
                  ></textarea>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 rounded-md text-black border">
                  <h4 className="font-bold text-xl text-black mb-2">
                    Refund Summary
                  </h4>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span>Original Amount:</span>
                      <span>${total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund Amount:</span>
                      <span className="font-medium">${refundAmount}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span>Remaining Balance:</span>
                      <span className="font-medium text-black">
                        ${(total_amount - refundAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      disabled={refundLoading}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
                    />
                    <label className="ml-2 text-black">
                      Send notification to customer
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowRefundPopup(false)}
                      disabled={refundLoading}
                      className="px-4 py-2 rounded bg-black text-white font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={refundLoading}
                      className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {refundLoading ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Process Refund"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
