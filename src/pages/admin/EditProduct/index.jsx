import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../../apiClient";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [product, setProduct] = useState({
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

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          apiClient.get(`/api/products/${id}`),
          apiClient.get("/api/categories")
        ]);

        const data = prodRes.data;
        setProduct({
          title: data.title,
          description: data.description,
          image: null,
          category: data.category_id,
          prepaidPrice: data.prepaid_price,
          standardPrice: data.standard_price,
          hasExtraLabour: !!data.has_labour_price,
          extraLabourCost: data.labour_price,
          excludeConsumable: !!data.exclude_consumables,
        });
        setImagePreview(data.image_url);
        setCategories(catRes.data);
      } catch (err) {
        toast.error("Failed to fetch product data");
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleChange = (field, value) => setProduct({ ...product, [field]: value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return toast.error("Select an image file!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed!");
    setProduct({ ...product, image: file });
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProduct({ ...product, image: null });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    navigate("/dashboard/products"); // Cancel: navigate back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", product.title);
    formData.append("description", product.description || "");
    formData.append("category_id", product.category);
    formData.append("prepaid_price", product.prepaidPrice || 0);
    formData.append("standard_price", product.standardPrice || 0);
    formData.append("has_labour_price", product.hasExtraLabour ? 1 : 0);
    formData.append("labour_price", product.hasExtraLabour ? product.extraLabourCost || 0 : 0);
    formData.append("exclude_consumables", product.excludeConsumable ? 1 : 0);
    if (product.image) formData.append("image", product.image);

    setSubmitLoading(true);
    try {
      await apiClient.post(`/api/products/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Product updated successfully!");
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product!");
    }
    setSubmitLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm max-w-4xl mx-auto">
        <h3 className="font-bold text-black text-3xl mb-2">Edit Product</h3>
        <p className="text-black text-lg mb-6">Update product details below.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Product Title */}
          <div>
            <label className="text-lg text-black font-medium">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Monitor"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={product.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-lg text-black font-medium">Category</label>
            <select
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={product.category}
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
                value={product.prepaidPrice}
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
                value={product.standardPrice}
                onChange={(e) => handleChange("standardPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Extra Labour */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.hasExtraLabour}
              onChange={(e) => handleChange("hasExtraLabour", e.target.checked)}
              className="h-4 w-4 accent-[#C81A1F] border-gray-300 rounded"
            />
            <label className="text-gray-700 font-medium">Requires Extra Labour?</label>
          </div>
          {product.hasExtraLabour && (
            <div>
              <label className="text-lg text-black font-medium">Extra Labour ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={product.extraLabourCost}
                onChange={(e) => handleChange("extraLabourCost", e.target.value)}
              />
            </div>
          )}

          {/* Exclude Consumable */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.excludeConsumable}
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
              <div className="relative mt-2">
                <img src={imagePreview} alt="Preview" className="h-40 object-contain w-full rounded" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 h-8 w-8"
                >
                  X
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitLoading}
              className={`px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitLoading ? "Updating..." : "Update"}
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
