// Invoice.jsx
import React, { forwardRef, useImperativeHandle } from 'react';
import html2pdf from "html2pdf.js";
import './style.css';
import OrderSummary from './OrderSummary'
import {
  FaCalendarDays,
  FaClock,
  FaPhone,
  FaEnvelope
} from "react-icons/fa6";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Invoice = forwardRef(({ order }, ref) => {
  // Check if order is empty or invalid
  const isEmptyOrder = !order || typeof order !== 'object' || Object.keys(order).length === 0;
  

  // If order is empty, show error message
  if (isEmptyOrder) {
    return (
      <div id="invoice-pdf" className="invoice-content">
        <div className="container container-pad">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="text-red-600 text-2xl mb-4">No Order Data Available</div>
              <p className="text-gray-600">The order information is not available or is empty.</p>
              <p className="text-gray-600 mt-2">Please check the order details and try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) ? "$0.00" : numericAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTransactionDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  const formatTransactionTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Extract data with proper fallbacks (same as ThankYou page)
  const {
    id,
    status,
    total_amount,
    created_at,
    order_detail = {},
    transaction_detail = {},
    clientData = {},
  } = order;

  const {
    taxes = 0,
    adminFees = 0,
    insurance = 0,
    mountLabour = 0,
    labourCharge = 0,
    deliveryPickup = 0,
    equipmentTotal = 0,
    consumablesTotal = 0,
    formData = {},
    clientData: orderClientData = {},
    setting = {},
  } = order_detail;

  const {
    products = [],
    event_info = {},
    contact_name = "N/A",
    contact_email = "N/A",
    contact_phone = "N/A",
    is_prepaid = false,
    rental_days = 3,
    company_name = "N/A",
    company_logo = "",
  } = formData;

  const {
    room = "N/A",
    facility = "N/A",
    showName = "N/A",
    startDate,
    finishDate,
    loadInDate,
    startTime = "N/A",
    finishTime = "N/A",
    loadInTime = "N/A",
  } = event_info;

  // Client info with fallbacks (same as ThankYou page)
  const clientInfo = orderClientData?.companyInfo || clientData?.companyInfo || {};
  const {
    companyName = company_name,
    orderedBy = contact_name,
    email = contact_email,
    tel = contact_phone,
    address1 = "N/A",
    address2 = "N/A",
    city = "N/A",
    state = "N/A",
    zipCode = "N/A",
    country = "N/A",
    northBooth = "N/A",
    southBooth = "N/A",
    contactName = "N/A",
    contactPhone = "N/A",
    rooms=[]
  } = clientInfo;

  // Equipment selection (same as ThankYou page)
 const equipmentSelection =
    orderClientData?.equipmentSelection || clientData?.equipmentSelection || {};
  const quantities = equipmentSelection.quantities || {};
  const ownLaptop = equipmentSelection.hasOwnProperty("ownLaptop")
    ? equipmentSelection.ownLaptop
      ? true
      : false
    : true;
  // Categorize products
  const categories = {
    main: [],
    mounting: [],
    accessories: [],
  };

  products.forEach((product) => {
    const category = product.category || {};
    const qty = quantities[product.id] || 0;

    if (qty > 0) {
      if (category.includeMounting) {
        categories.mounting.push(product);
      }
      
      else if (category.includeAccessories) {
        categories.accessories.push(product);
      }
     
      else {
        categories.main.push(product);
      }
    }
  });

  // Transaction details (same as ThankYou page)
  const transactionDetails = transaction_detail || {};
  const sourceCard = transactionDetails?.payment_method_details || {};

  // Calculate amounts (same as ThankYou page)
  const subtotal = [
    equipmentTotal, labourCharge, mountLabour, insurance, 
    consumablesTotal, adminFees, deliveryPickup
  ].reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

  const totalAmount = parseFloat(total_amount) || subtotal + parseFloat(taxes || 0);

  // Helper functions for products
  const getProductQuantity = (productId) => quantities[productId] || 0;

  const getProductTotal = (product) => {
    const qty = getProductQuantity(product.id);
    const price = parseFloat(product.prepaid_price || 0);
    const days = rental_days || 1;
    return qty * price * days;
  };

  const generatePDF = () => {
    const element = document.getElementById("invoice-pdf");
    if (!element) return;

    html2pdf()
      .set({
        margin: 0,
        filename: `invoice_${id || Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a1", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  // Expose the function to parent
  useImperativeHandle(ref, () => ({
    generatePDF,
  }));

  // Table rendering function with categories check
  const renderCategoryTable = (categoryProducts, title) => {
    // Check if categoryProducts is valid
    if (!categoryProducts || !Array.isArray(categoryProducts)) {
      return (
        <div className="card mb-6">
          <div className="card-head">{title}</div>
          <div className="card-body">
            <div className="text-center text-gray-500 py-4">
              No products available in this category
            </div>
          </div>
        </div>
      );
    }

    const hasProducts = categoryProducts.some(
      (product) => product && product.id && getProductQuantity(product.id) > 0
    );

    if (!hasProducts) return null;

    return (
      <div className="card mb-6">
        <div className="card-head">{title}</div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="pdf-table-th">
                <tr className="text-white">
                  <th className="bg-[#C81A1F] text-left px-2 md:px-4 text-[18px] md:text-xl text-white w-6/12">
                    Item
                  </th>
                  <th className="bg-[#C81A1F] text-center px-2 md:px-4 text-[18px] md:text-xl text-white w-2/12">
                    QTY
                  </th>
                  <th className="bg-[#C81A1F] text-center px-2 md:px-4 text-[18px] md:text-xl text-white w-2/12">
                    Rate
                  </th>
                  <th className="bg-[#C81A1F] text-center px-2 md:px-4 text-[18px] md:text-xl text-white w-1/12">
                    Days
                  </th>
                  <th className="bg-[#C81A1F] text-center px-2 md:px-4 text-[18px] md:text-xl text-white w-2/12">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-[#F6F6F6] text-black">
                {categoryProducts.map((product, index) => {
                  if (!product || !product.id) return null;
                  
                  const qty = getProductQuantity(product.id);
                  if (qty === 0) return null;

                  const rate = parseFloat(is_prepaid ? product.prepaid_price : product.standard_price) || 0;
                  const days = rental_days || 1;
                  const total = rate * qty * days;

                  return (
                    <tr key={index}>
                      <td className="px-2 md:px-4 py-2 text-[16px] w-6/12">
                        {product.title || "Unnamed Product"}
                        {product.has_labour_price === 1 && (
                          <span className="block text-[14px] text-slate-500">
                            (*Extra labour req'd per screen) (${product?.labour_price})
                          </span>
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-[16px] text-center w-2/12">
                        {qty}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-[16px] text-center tabular-nums w-2/12">
                        {formatCurrency(rate)}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-[16px] text-center w-1/12">
                        {days}
                      </td>
                      <td className="px-2 md:px-4 py-2 text-[16px] text-center tabular-nums w-2/12">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render equipment tables with categories check
  const renderEquipmentTables = () => {
    return (
      <div className="invoice-table-design">
        {categories.main && renderCategoryTable(categories.main, "Equipment Details")}
        {categories.mounting && renderCategoryTable(categories.mounting, "Mounting Details")}
        {categories.accessories && renderCategoryTable(categories.accessories, "Accessories Details")}
      </div>
    );
  };

  return (
    <div id="invoice-pdf" className="invoice-content">
      {/* Header */}
      <header className="site-header pt-1  pb-6 max-h-[20vh]">
        <div className="container container-pad">
          <div className="main-header-element">
            <div className="logo-col pdf-invoice-head-img">
              <img 
                 src={`${API_BASE_URL}/api/${setting?.logo_path}`} 
                alt="Logo" 
                className="brand-logo" 
                crossOrigin="anonymous"
              />
            </div>

            <div className="header-contact">
              <div className="header-contact-col">
                {setting?.address1 || "N/A"}<br />
                {setting?.address2 || "N/A"}<br />
                Tel: {setting?.telephone || "N/A"}<br/>
                Toll free: {setting?.toll_free || "N/A"}<br/>
                {setting?.site_url || "N/A"}
              </div>
            </div>

            <div className="fei-logo">
              <div className="fei-logo-img pdf-invoice-head-img-2">
                <img 
                  src={company_logo} 
                  alt="Company Logo"  
                  crossOrigin="anonymous" 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container container-pad">
        <section className="page-block">
          <div className="section-shell">
            <div className="main-grid">
              
              {/* Left Column */}
              <div className="main-col">
                {/* Order Details */}
                <div className="card">
                  <div className="card-head">Order Details</div>
                  <div className="card-body">
                    <div className="deflist">
                      <div className="defrow">
                        <div className="defterm">Order ID :</div>
                        <div className="defval">#{id}</div>
                      </div>
                      <div className="defrow">
                        <div className="defterm">Amount Paid :</div>
                        <div className="defval tnum">{formatCurrency(totalAmount)}</div>
                      </div>
                      <div className="defrow">
                        <div className="defterm">Payment Method :</div>
                        <div className="defval">Card</div>
                      </div>
                      <div className="defrow">
                        <div className="defterm">Date :</div>
                        <div className="defval">{formatDate(created_at)}</div>
                      </div>
                      <div className="defrow">
                        <div className="defterm">Status :</div>
                        <div className="defval capitalize">{status}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                {Object.keys(transactionDetails).length > 0 && (
                  <div className="card">
                    <div className="card-head">Transaction Details</div>
                    <div className="card-body">
                      <div className="deflist">
                        {transactionDetails?.balance_transaction_id && (
                          <div className="defrow">
                            <div className="defterm">Transaction ID :</div>
                            <div className="defval">{transactionDetails?.balance_transaction_id}</div>
                          </div>
                        )}
                        <div className="defrow">
                          <div className="defterm">Payment Gateway :</div>
                          <div className="defval">Stripe</div>
                        </div>
                        {status && (
                          <div className="defrow">
                            <div className="defterm">Payment Status :</div>
                            <div className="defval capitalize">{status}</div>
                          </div>
                        )}
                        {transactionDetails.created && (
                          <div className="defrow">
                            <div className="defterm">Payment Date :</div>
                            <div className="defval">{formatDate(transactionDetails?.created)}</div>
                          </div>
                        )}
                        {sourceCard?.card?.brand && (
                          <div className="defrow">
                            <div className="defterm">Card Type :</div>
                            <div className="defval capitalize">{sourceCard?.card?.brand}</div>
                          </div>
                        )}
                        {sourceCard?.card?.last4 && (
                          <div className="defrow">
                            <div className="defterm">Card Last Four :</div>
                            <div className="defval">**** {sourceCard?.card?.last4}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Info */}
                <div className="card">
                  <div className="card-head flex justify-start items-center">Company Info</div>
                  <div className="card-body">
                    <div className="info-split">
                      <div className="info-left">
                        {[
                          ["Company Name", companyName],
                          ["Ordered By", orderedBy],
                          ["Address 1", address1],
                          ["Address 2", address2],
                          ["City", city],
                          ["Province/State", state],
                          ["Postal/Zip Code", zipCode],
                          ["Tel", tel],
                          ["Country", country],
                          ["Email", email]
                        ].map(([label, value]) => (
                          <div key={label} className="row">
                            <span className="term">{label} :</span>
                            <span className="val">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="info-right">
                        <div className="block-title">Contact Details</div>
                                  {rooms.length > 0 && (
              rooms.map((room, index) => (
                 <div className="flex gap-2 company-info-details"><span className="font-semibold w-48">{room?.label} – Booth # :</span><span>{room?.value}</span></div> 
              )))}

                        <div className="mt-2 pb-4 md:pb-0">
                          <div className="font-bold text-xl text-black my-4">Onsite Contact</div>
                          {contactName && (
                            <div className="flex gap-2 mb-2">
                              <span className="font-semibold w-20">Name :</span>
                              <span>{contactName}</span>
                            </div>
                          )}
                          {contactPhone  && (
                            <div className="flex gap-2">
                              <span className="font-semibold w-20">Phone :</span>
                              <span>{contactPhone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="help-box">
                          <div className="help-title">NEED HELP ?</div>
                          <p style={{margin: '0 0 12px'}}>Quick support for all your needs.</p>
                          <div className="help-item mt-6">
                            <FaPhone className="text-red-600" />
                           <span className="-mt-4">{contact_phone}</span>
                          </div>
                          <div className="help-item mt-4">
                            <FaEnvelope className="text-red-600" />
                            <span className="-mt-4">{contact_email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Schedule */}
                <div className="card">
                  <div className="card-head">Event Schedule</div>
                  <div className="card-body">
                    <div className="event-split">
                      <div className="event-panel">
                        <h4 className="event-h">EVENT DETAILS</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xl font-semibold text-black">Show Name</p>
                            <p className="text-[16px] text-black">{showName}</p>
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-black">Facility</p>
                            <p className="text-[16px] text-black">{facility}</p>
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-black">Room</p>
                            <p className="text-[16px] text-black">{room}</p>
                          </div>
                        </div>
                      </div>

                      <div className="event-panel">
                        <h4 className="event-h">EVENT DATES & TIMES</h4>
                        <div className="flex gap-4 md:gap-6 lg:gap-4 xl:gap-16 text-sm">
                          <div className="space-y-4 pb-4">
                            {[
                              ["Load in Date", loadInDate],
                              ["Start Date", startDate],
                              ["Finish Date", finishDate]
                            ].map(([label, date]) => (
                              <div key={label} className="event-field">
                                <div className="event-label">{label}</div>
                                <div className="event-row mt-5">
                                  <FaCalendarDays style={{color: '#C81A1F', fontSize: '1.25rem'}} />
                                  <span className='-mt-4'>{formatDate(date)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4 pb-4">
                            {[
                              ["Load in Time", loadInTime],
                              ["Start Time", startTime],
                              ["Finish Time", finishTime]
                            ].map(([label, time]) => (
                              <div key={label} className="event-field">
                                <div className="event-label">{label}</div>
                                <div className="event-row flex  mt-5">
                                  <FaClock style={{color: '#C81A1F', fontSize: '1.25rem'}} />
                                  <span className="-mt-4">{time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Tables */}
                {renderEquipmentTables()}

                {/* Laptop Question */}
                <div className="card">
                  <div className="card-head">Laptop</div>
                  <div className="card-body">
                    <div className="row" style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                      <span className="term" style={{ fontWeight: 700 }}>Are you supplying your own laptop?</span>
                      {ownLaptop === true && (
                        <span style={{
                          display:'inline-block', borderRadius:'9999px',
                          background:'#d1fae5', color:'#065f46',
                          padding:'6px 30px 20px', fontSize:'15px', fontWeight:600
                        }}>Yes</span>
                      )}
                      {ownLaptop === false && (
                        <span style={{
                          display:'inline-block', borderRadius:'9999px',
                          background:'#ffe4e6', color:'#9f1239',
                          padding:'6px 30px 20px', fontSize:'15px', fontWeight:600
                        }}>No</span>
                      )}
                      {ownLaptop === null && (
                        <span style={{
                          display:'inline-block', borderRadius:'9999px',
                          background:'#f1f5f9', color:'#475569',
                          padding:'6px 30px 20px', fontSize:'15px', fontWeight:600
                        }}>Not specified</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <aside className="side-col sticky-lg">
                <div className="side-card">
                  <div className=" pb-0 pdf-design-summary ">
                    <OrderSummary
                      page={"payment"}
                      clientData={orderClientData}
                      formData={formData}
                    />
                  </div>
                  
                  {/* Transaction Receipt */}
                  <div className="receipt p-6 !pt-0 ">
                    <div className="receipt-box">
                      <h3 className="receipt-title">TRANSACTION RECEIPT</h3>

                      <div className="receipt-head">
                        {sourceCard?.card?.last4 && (
                          <div className="receipt-chip">
                            {sourceCard?.card?.brand ? sourceCard.card.brand.toUpperCase() : 'CARD'}
                          </div>
                        )}
                        {sourceCard?.card?.last4 && (
                          <div style={{fontWeight: '600'}}>**** {sourceCard.card.last4}</div>
                        )}
                      </div>

                      <div className="kv">
                        <span>Entry Method:</span>
                        <span>Online</span>
                      </div>
                      {transactionDetails.created && (
                        <>
                          <div className="kv">
                            <span>Date:</span>
                            <span>{formatTransactionDate(transactionDetails.created)}</span>
                          </div>
                          <div className="kv">
                            <span>Time:</span>
                            <span>{formatTransactionTime(transactionDetails.created)}</span>
                          </div>
                        </>
                      )}
                      {transactionDetails?.charge_id && (
                        <div className="kv">
                          <span>Ref#:</span>
                          <span>{transactionDetails?.charge_id}</span>
                        </div>
                      )}
                      <div className="kv kv-total">
                        <strong>Total (CAD) :</strong>
                        <strong> {formatCurrency(totalAmount)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
});

export default Invoice;