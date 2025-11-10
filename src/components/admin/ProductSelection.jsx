import React, { useState, useEffect } from "react";
import apiClient from "../../apiClient";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const ProductSelection = ({
  formData,
  setFormData,
  selectedProducts,
  setSelectedProducts,
  eventStart,
  eventEnd,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { items: categories } = useSelector((state) => state.categories);

  // Fetch all products on mount
  useEffect(() => {
    let cancelled = false;

    const fetchAllProducts = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get("/api/products?all=1");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        // Normalize IDs to strings to prevent type issues
        const normalized = data.map((p) => ({ ...p, id: String(p.id) }));
        if (!cancelled) {
          setAllProducts(normalized);
          setFilteredProducts(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchAllProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter products based on category and search term
  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category?.id === Number(selectedCategory)
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, allProducts]);

  // Calculate rental days
  const calculateRentalDays = (startDate, startTime, endDate, endTime) => {
    if (startDate && endDate) {
      const start = dayjs(startDate, "YYYY-MM-DD");
      const end = dayjs(endDate, "YYYY-MM-DD");
      let days = end.diff(start, "day") + 1;
      return days < 1 ? 1 : days;
    }
    return 1;
  };

  // Add product
  const handleAddProduct = (product) => {
    if (selectedProducts.some((p) => String(p.id) === String(product.id)))
      return;
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, String(product.id)],
    }));
    setSelectedProducts((prev) => [...prev, product]);
  };

  // Remove product
  const handleRemoveProduct = (id) => {
    const idStr = String(id);
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((pid) => pid !== idStr),
    }));
    setSelectedProducts((prev) => prev.filter((p) => String(p.id) !== idStr));
  };

  // Toggle product selection
  const handleProductClick = (product) => {
    if (selectedProducts.some((p) => String(p.id) === String(product.id))) {
      handleRemoveProduct(product.id);
    } else {
      handleAddProduct(product);
    }
  };

  // Check if product is selected
  const isProductSelected = (productId) =>
    selectedProducts.some((p) => String(p.id) === String(productId));

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded px-3 py-3 text-slate-700 w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-2 flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass text-slate-500"></i>
          <input
            placeholder="Search products e.g. monitor, mount, cable"
            className="w-full rounded border border-slate-300 px-3 py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c81a1f]"></div>
            <p className="text-slate-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && (
        <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
          {filteredProducts.length === 0 ? (
            <div className="text-slate-600 col-span-full text-center py-10">
              {searchTerm || selectedCategory
                ? "No products found for your filters."
                : "No products available."}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = isProductSelected(p.id);
              const categoryName = p?.category?.name || "Uncategorized";
              return (
                <article
                  key={p.id}
                  className={`relative w-full rounded border ${
                    isSelected
                      ? "border-[#c81a1f] border-2 ring-2 ring-[#c81a1f]"
                      : "border-[#D3D1D1]"
                  } bg-white text-black shadow-sm p-3 lg:p-4 flex flex-col gap-4 cursor-pointer transition-all`}
                  onClick={() => handleProductClick(p)}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex flex-col">
                      <span className="w-fit bg-[#F6F6F6] rounded-full py-2 px-3 text-[12px] text-black font-bold">
                        {categoryName}
                      </span>
                      <h3 className="text-black text-base xl:text-lg font-semibold mt-1">
                        {p.title}
                      </h3>
                    </div>
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-24 h-18 md:w-40 md:h-24 object-cover rounded ring-1 ring-white/10"
                      />
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="mt-1 text-black rounded ring-1 ring-slate-200 p-2 bg-[#F6F6F6]">
                    <div className="flex flex-wrap gap-3 justify-between">
                      <div>
                        <div className="text-[14px] font-semibold">Prepaid</div>
                        <div>${p.prepaid_price}
                        <span className="text-slate-500 text-[14px]">/day</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold">Standard</div>
                        <div>
                          ${p.standard_price}
                          <span className="text-slate-500 text-[14px]">/day</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold">Days</div>
                        <input
                          type="number"
                          value={calculateRentalDays(
                            formData?.startDate,
                            formData?.startTime,
                            formData?.finishDate,
                            formData?.finishTime
                          )}
                          readOnly
                          className="mt-1 w-14 rounded border border-slate-300 px-2 py-1 text-center text-base bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Select/Remove Button */}
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(p);
                      }}
                      className={`px-4 py-2 rounded border ${
                        isSelected
                          ? "border-[#c81a1f] bg-[#c81a1f] text-white"
                          : "border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? "Remove" : "Select"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Selected Count */}
      {!isLoading && selectedProducts.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
          <p className="text-sm text-slate-700">
            <strong>{selectedProducts.length}</strong> product(s) selected
          </p>
        </div>
      )}
    </>
  );
};

export default ProductSelection;
