import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../../apiClient";

export default function AddProduct() {
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    image: null,
    category: "",
    prepaidPrice: "",
    standardPrice: "",
    hasExtraLabour: false,
    extraLabourCost: "",
    excludeConsumable: false,
  });

  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        toast.error("Failed to fetch categories!");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field, value) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return toast.error("Select an image file!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed!");
    setNewProduct({ ...newProduct, image: file });
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setNewProduct({
      title: "",
      description: "",
      image: null,
      category: "",
      prepaidPrice: "",
      standardPrice: "",
      hasExtraLabour: false,
      extraLabourCost: "",
      excludeConsumable: false,
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.image) return toast.error("Please upload an image!");

    const formData = new FormData();
    formData.append("title", newProduct.title);
    formData.append("category_id", newProduct.category);
    formData.append("prepaid_price", newProduct.prepaidPrice || 0);
    formData.append("standard_price", newProduct.standardPrice || 0);
    formData.append("has_labour_price", newProduct.hasExtraLabour ? 1 : 0);
    formData.append("labour_price", newProduct.hasExtraLabour ? newProduct.extraLabourCost || 0 : 0);
    formData.append("exclude_consumables", newProduct.excludeConsumable ? 1 : 0);
    formData.append("image", newProduct.image);

    setLoading(true);
    try {
      await apiClient.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product added successfully!");
      resetForm(); // reset instead of navigate
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product!");
    }
    setLoading(false);
  };

  return (
    <div id="product-add" className="view">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm max-w-4xl mx-auto">
        <h3 className="font-bold text-black text-3xl mb-2">Add Product</h3>
        <p className="text-black text-lg mb-6">Fill in the product details below.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Product Title */}
          <div>
            <label className="text-lg text-black font-medium">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Monitor"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={newProduct.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-lg text-black font-medium">Category</label>
            <select
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={newProduct.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-lg text-black font-medium">Prepaid Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={newProduct.prepaidPrice}
                onChange={(e) => handleChange("prepaidPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-lg text-black font-medium">Standard Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={newProduct.standardPrice}
                onChange={(e) => handleChange("standardPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Extra Labour Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.hasExtraLabour}
              onChange={(e) => handleChange("hasExtraLabour", e.target.checked)}
              className="h-4 w-4 accent-[#C81A1F] border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Requires Extra Labour?</label>
          </div>

          {/* Extra Labour Cost */}
          {newProduct.hasExtraLabour && (
            <div>
              <label className="text-lg text-black font-medium">Extra Labour ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={newProduct.extraLabourCost}
                onChange={(e) => handleChange("extraLabourCost", e.target.value)}
              />
            </div>
          )}

          {/* Exclude Consumable */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.excludeConsumable}
              onChange={(e) => handleChange("excludeConsumable", e.target.checked)}
              className="h-4 w-4 accent-[#C81A1F] border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Exclude Consumable</label>
          </div>

          {/* Product Image */}
          <div>
            <label className="text-lg text-black font-medium">Product Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
              onChange={handleImageUpload}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-40 object-contain w-full rounded" />
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
