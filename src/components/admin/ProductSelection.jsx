import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../apiClient";
import dayjs from "dayjs";

const ProductSelection = ({
  formData,
  setFormData,
  selectedProducts,
  setSelectedProducts,
  eventStart,
  eventEnd,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const res = await apiClient.get(
            `/api/products?search=${encodeURIComponent(searchTerm)}`
          );
           console.log("🔍 API Response Data:", res.data); // 👈 log full response
          if (!cancelled) setSearchResults(res.data.data || []);
        } catch (e) {
          if (!cancelled) setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [searchTerm]);
function calculateRentalDays(startDate, startTime, endDate, endTime) {
  if (startDate && endDate) {
    const startDateTime = dayjs(`${startDate} ${startTime}`);
    const endDateTime = dayjs(`${endDate} ${endTime}`);

    // Total hours difference
    const hoursDiff = endDateTime.diff(startDateTime, "hour");

    // Convert to days (always round up)
    let rentalDays = Math.ceil(hoursDiff / 24);

    // Ensure minimum 1 day
    if (rentalDays < 1) {
      rentalDays = 1;
    }

    return rentalDays;
  }
  return 1; // default if no dates
}

  const handleAddProduct = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) return;
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, product.id],
    }));
    setSelectedProducts((prev) => [...prev, product]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveProduct = (id) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((pid) => pid !== id),
    }));
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };
  return (
    <>
      {/* Search */}
      <div className="flex items-center gap-2 mb-4 relative">
        <i className="fa-solid fa-magnifying-glass text-slate-500"></i>
        <input
          placeholder="Please start by search product e.g. monitor, mount, cable"
          className="w-full rounded border border-slate-300 px-3 py-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Search dropdown */}
        {searchResults.length > 0 && (
          <ul className="absolute top-full left-6 right-0 z-20 bg-white border border-slate-200 mt-1 rounded max-h-80 overflow-auto shadow">
            {searchResults.map((p) => (
              <li
                key={p.id}
                className="p-3 cursor-pointer hover:bg-slate-50 flex gap-3"
                onClick={() => handleAddProduct(p)}
              >
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-12 w-12 object-contain border rounded"
                  />
                )}
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-slate-500">{p.description}</p>
                  <p className="text-sm">
                    Prepaid: ${p.prepaid_price} | Standard: ${p.standard_price}{" "}
                    {p.has_labour_price ? `| Labour: $${p.labour_price}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
        {selectedProducts.length === 0 && (
          <div className="text-slate-600">No products selected yet.</div>
        )}

        {selectedProducts.map((p) => (
          <article
            key={p.id}
            className="relative w-full rounded border border-[#D3D1D1] bg-white text-white shadow-sm p-3 md:p-3 lg:p-4 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center gap-3">
                  <div className="flex flex-col w-3/5 md:w-auto">
              <h3 className="text-black text-base  xl:text-lg font-semibold">
                {p.title}
              </h3>
              
              {/* { <input
                type="text"
                value="$125.00"
                readOnly
                className="mt-1 h-8  text-[14px] rounded border border-slate-300 px-2 text-black text-center bg-gray-100"
              /> } */}
              {p.labour_price > 0 && (
  <>
    <span className="block text-[14px] text-slate-500">
      (*Extra labour req'd per day)
    </span>
    <span className="mt-2 text-[14px] rounded border border-slate-300 py-1 px-3 text-black text-center bg-gray-100 w-max">
      ${p.labour_price}
    </span>
  </>
)}

            
            </div>
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-24 h-18 md:w-40 md:h-24 object-cover rounded ring-1 ring-white/10 product-select-img"
                />
              )}
            </div>


            <div className="mt-1 text-black rounded ring-1 ring-slate-200 p-2 bg-[#F6F6F6]">
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-between">
                <div>
                  <div className="text-[14px] text-black font-semibold">
                    Prepaid Rate
                  </div>
                  <div className="mt-1 text-[14px] font-semibold">
                    ${p.prepaid_price}
                  </div>
                </div>
                <div>
                  <div className="text-[14px]  text-black font-semibold">
                    Standard Rate
                  </div>
                  <div className="mt-1 text-[14px]  font-semibold">
                    ${p.standard_price}
                    <span className="text-slate-500 text-[14px]">/day</span>
                  </div>
                </div>
                <div>
                  <div className="text-[14px]  text-black font-semibold">
                    X Days
                  </div>
                  <input
                    type="number"
                    value={calculateRentalDays(formData?.startDate,formData?.startTime,formData?.finishDate,formData?.finishTime)}
                    min="1"
                    readOnly
                    className="mt-1 w-14 rounded border border-slate-300 px-2 py-1 text-center text-base bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleRemoveProduct(p.id)}
                className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default ProductSelection;
