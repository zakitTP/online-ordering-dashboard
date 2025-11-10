import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUpload, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import apiClient from "../../../apiClient"; // ✅ centralized axios instance

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: ["super admin", "admin", "manager"],
      required: true,
    },
  ];

  // 🔹 Fetch existing user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/api/users/${id}`);
        setUser(res.data);
        if (res.data.image) {
          setImagePreview(`${API_BASE_URL}/storage/${res.data.image}`);
        }
      } catch (err) {
        toast.error("Failed to fetch user data");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return toast.error("Select an image file!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed!");

    setUser({ ...user, image: file });

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUser({ ...user, image: null });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const field of fields) {
      if (field.required && !user[field.name]) {
        return toast.error(`${field.label} is required!`);
      }
    }

    const formData = new FormData();
    fields.forEach((f) => formData.append(f.name, user[f.name]));
    if (user.image instanceof File) formData.append("image", user.image);

    try {
      setLoading(true);
      await apiClient.post(`/api/users/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("User updated successfully!");
      navigate("/dashboard/users");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to update user!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-8 shadow-sm max-w-4xl mx-auto">

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-lg text-black font-medium">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    required={f.required}
                    value={user[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select {f.label}</option>
                    {f.options.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    required={f.required}
                    value={user[f.name] || ""}
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
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
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
                <img src={imagePreview} className="h-40 w-full object-contain rounded" alt="Preview" />
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
              className={`px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/users")}
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
