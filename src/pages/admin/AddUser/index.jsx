import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiX, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function AddUser() {
  const [newUser, setNewUser] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // ✅ hook to navigate

  const fields = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: ["super admin","admin", "manager"],
      required: true
    }
  ];

  const handleChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return toast.error("Select an image file!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed!");

    setNewUser({ ...newUser, image: file });

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setNewUser({ ...newUser, image: null });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const field of fields) {
      if (field.required && !newUser[field.name]) {
        return toast.error(`${field.label} is required!`);
      }
    }

    const formData = new FormData();
    fields.forEach((f) => {
      if (newUser[f.name]) formData.append(f.name, newUser[f.name]);
    });
    if (newUser.image) formData.append("image", newUser.image);

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/users`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("User added successfully!");
      navigate("/dashboard/users"); // ✅ navigate after success
    } catch (err) {
      const message =
        err.response?.data?.message || err.response?.data || err.message || "Failed to add user!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm max-w-4xl mx-auto">

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-lg text-black font-medium">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    required={f.required}
                    value={newUser[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select {f.label}</option>
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    required={f.required}
                    value={newUser[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-lg text-black font-medium mb-1 flex items-center">
              <FiUpload className="mr-2 text-blue-500" /> User Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {!imagePreview ? (
              <div
                className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-blue-400"
                onClick={triggerFileInput}
              >
                <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload or drag image (PNG/JPG/GIF)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  className="h-40 w-full object-contain rounded"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/users")} // ✅ navigate on cancel
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
