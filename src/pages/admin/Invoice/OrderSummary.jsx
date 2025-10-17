import React from "react";

export default function OrderSummary({ page, nextStep, clientData, formData }) {
  const {rental_days = 4, is_prepaid = true} = formData
  const { equipmentSelection = {} } = clientData;
  const { quantities = {}, mountingRequired = false } = equipmentSelection;

  // ✅ Parse dynamic tax from formData.other_settings
  const rawTax = formData?.other_settings?.tax || "{}";
  let tax = {};
  try {
    tax = JSON.parse(rawTax);
  } catch (e) {
    tax = rawTax;
  }
  console.log(tax)

  const getProductById = (id) =>
    formData.products?.find((p) => p.id === id) || {};

  // ✅ Equipment total
  const equipmentTotal = Object.entries(quantities).reduce((sum, [productId, qty]) => {
    const product = getProductById(parseInt(productId));
    if (!product?.category) return sum;
    if (!mountingRequired && product.category.includeMounting) return sum;

    const price = is_prepaid
      ? parseFloat(product.prepaid_price || 0)
      : parseFloat(product.standard_price || 0);

    return sum + qty * price * rental_days;
  }, 0);

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const noSelection = totalQty === 0;

  // ✅ Labour calculation
  const calculateLabour = (total) => {
    if (total < 2000) return 160;
    const extra = Math.floor((total - 2000) / 1000);
    return 160 + (extra + 1) * 80;
  };
  const labourCharge = noSelection ? 0 : calculateLabour(equipmentTotal);

  const insurance = noSelection ? 0 : equipmentTotal * 0.05;

  // ✅ Consumables (1%)
  const consumablesTotal = noSelection
    ? 0
    : Object.entries(quantities).reduce((sum, [productId, qty]) => {
        const product = getProductById(parseInt(productId));
        if (!product?.category) return sum;
        if (!mountingRequired && product.category.includeMounting) return sum;
        if (product.exclude_consumables) return sum;

        const price = is_prepaid
          ? parseFloat(product.prepaid_price || 0)
          : parseFloat(product.standard_price || 0);

        return sum + price * qty * rental_days * 0.01;
      }, 0);

  // ✅ Combine Mounting + Product-specific Labour
  const extraLabourTotal = noSelection
    ? 0
    : Object.entries(quantities).reduce((sum, [productId, qty]) => {
        const product = getProductById(parseInt(productId));
        if (product?.has_labour_price) {
          return sum + qty * (product.labour_price || 0);
        }
        return sum;
      }, 0);

  const mountLabour = noSelection ? 0 : mountingRequired ? 160 : 0;
  const combinedLabour = mountLabour + extraLabourTotal;

  const deliveryPickup = noSelection ? 0 : 150;

  const adminFees = noSelection
    ? 0
    : (equipmentTotal + labourCharge + deliveryPickup) * 0.03;

  const subtotal =
    equipmentTotal +
    labourCharge +
    combinedLabour +
    insurance +
    consumablesTotal +
    adminFees +
    deliveryPickup;

  // ✅ Calculate tax dynamically from parsed object
  const taxEntries = Object.entries(tax || {});
  const taxes = noSelection
    ? 0
    : taxEntries.reduce(
        (sum, [label, percent]) => sum + subtotal * (Number(percent) / 100),
        0
      );

  const totalPayment = subtotal + taxes;

  return (
    <aside className="lg:col-span-4 space-y-4 sm-screen-sidebar">
      <div className="rounded-2xl bg-white  bg-[#F6F6F6] p-3 md:p-4 xl:p-6 rounded-xl side-bar-box-2 lg:sticky lg:top-4 side-bar-box">
        <div className="bg-[#F6F6F6] p-3 md:p-4 lg:p-3 xl:p-6 rounded-xl side-bar-box-2">
          <h3 className="text-xl lg:text-2xl md:text-[22px] font-bold text-black mb-6">
            ORDER SUMMARY
          </h3>

          <dl className="mt-4 space-y-6 text-base md:text-lg tabular-nums">
            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Equipment Rentals</dt>
              <dd className="text-black">${equipmentTotal.toFixed(2)}</dd>
            </div>

            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Labour</dt>
              <dd className="text-black">${labourCharge.toFixed(2)}</dd>
            </div>

            {combinedLabour > 0 && !noSelection && (
              <div className="flex items-start justify-between">
                <dt className="text-black detail-name-item">
                  Additional Large<br className="hidden md:block" />
                  Monitor / Kiosk / Wall<br className="hidden md:block" />
                  Mount + Screen Labour
                </dt>
                <dd className="text-black">${combinedLabour.toFixed(2)}</dd>
              </div>
            )}

            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Insurance</dt>
              <dd className="text-black">${insurance.toFixed(2)}</dd>
            </div>

            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Consumables</dt>
              <dd className="text-black">${consumablesTotal.toFixed(2)}</dd>
            </div>

            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Admin Fees</dt>
              <dd className="text-black">${adminFees.toFixed(2)}</dd>
            </div>

            <div className="flex items-start justify-between">
              <dt className="text-black detail-name-item">Delivery / Pickup</dt>
              <dd className="text-black">${deliveryPickup.toFixed(2)}</dd>
            </div>

            <div className="flex items-start justify-between font-bold">
              <dt className="text-black detail-name-item">Subtotal :</dt>
              <dd className="text-black">${subtotal.toFixed(2)}</dd>
            </div>

            {/* ✅ Show all dynamic taxes */}
            {taxEntries.map(([label, percent]) => (
              <div key={label} className="flex items-start justify-between">
                <dt className="text-black detail-name-item">
                  {label} 
                </dt>
                <dd className="text-black">
                  ${(subtotal * (Number(percent) / 100)).toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex items-center justify-between text-lg md:text-xl font-extrabold">
            <span className="text-black font-bold text-lg xl:text-[22px] total-text-title">
              Total (CAD) :
            </span>
            <span className="text-black font-bold text-xl xl:text-[22px]">
               ${totalPayment.toFixed(2)}
            </span>
          </div>

          {page === "equipment" && (
            <button
              onClick={nextStep}
              disabled={noSelection}
              className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 xl:px-6 py-3 text-lg font-bold text-white shadow transition payment-sidebar-btn ${
                noSelection
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#C81A1F] hover:bg-red-700"
              }`}
            >
              PROCEED TO CHECKOUT
              <i className="fa-solid fa-arrow-right-long text-sm"></i>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
