import { useState, useRef, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../../../apiClient";

export default function CompanySettings({ onCancel }) {
  const [settings, setSettings] = useState({
    companyName: "",
    logo: null,
    address1: "",
    address2: "",
    telephone: "",
    tollFree: "",
    siteUrl: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/api/settings");
        if (res.data) {
          setSettings({
            companyName: res.data.company_name || "",
            logo: null,
            address1: res.data.address1 || "",
            address2: res.data.address2 || "",
            telephone: res.data.telephone || "",
            tollFree: res.data.toll_free || "",
            siteUrl: res.data.site_url || "",
          });
          if (res.data.logo_url) setLogoPreview(res.data.logo_url);
        }
      } catch (err) {
        toast.error("Failed to load settings!");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) return toast.error("Select an image file!");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed!");

    setSettings({ ...settings, logo: file });
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setSettings({ ...settings, logo: null });
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!settings.companyName) return toast.error("Company name is required!");

    const formData = new FormData();
    formData.append("company_name", settings.companyName);
    if (settings.logo) formData.append("logo", settings.logo);
    formData.append("address1", settings.address1);
    formData.append("address2", settings.address2);
    formData.append("telephone", settings.telephone);
    formData.append("toll_free", settings.tollFree);
    formData.append("site_url", settings.siteUrl);

    try {
      setSaving(true);
      await apiClient.post("/api/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
    );
  }

  return (
    <div id="settings" className="view !mt-0 min-h-screen ">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded p-3 md:p-6 shadow-sm max-w-3xl mx-auto">
        <h3 className="font-bold text-black text-3xl mb-2">Company Settings</h3>
        <p className="text-black text-lg mb-6">Update your company information below.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Company Name */}
          <div>
            <label className="text-lg text-black font-medium">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Acme Pvt. Ltd."
            />
          </div>

          {/* Company Logo */}
          <div>
            <label className="text-lg text-black font-medium">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleLogoUpload}
            />
            {!logoPreview ? (
              <div
                className="border-2 border-dashed border-slate-300 p-6 text-center cursor-pointer hover:border-blue-400"
                onClick={triggerFileInput}
              >
                <FiUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag image (PNG/JPG)</p>
              </div>
            ) : (
              <div className="relative">
                <img src={logoPreview} alt="Logo Preview" className="h-32 w-full object-contain" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600"
                >
                  <FiX />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">PNG/JPG recommended.</p>
          </div>

          {/* Address 1 */}
          <div>
            <label className="text-lg text-black font-medium">Address</label>
            <input
              type="text"
              value={settings.address1}
              onChange={(e) => handleChange("address1", e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Street, Area"
            />
          </div>

          {/* Address 2 */}
          <div>
            <label className="text-lg text-black font-medium">Address 2</label>
            <input
              type="text"
              value={settings.address2}
              onChange={(e) => handleChange("address2", e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="City, State, ZIP"
            />
          </div>

          {/* Telephone & Toll Free */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-lg text-black font-medium">Telephone</label>
              <input
                type="text"
                value={settings.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder="+91 22 1234 5678"
              />
            </div>
            <div>
              <label className="text-lg text-black font-medium">Toll Free</label>
              <input
                type="text"
                value={settings.tollFree}
                onChange={(e) => handleChange("tollFree", e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                placeholder="1800-XXX-XXXX"
              />
            </div>
          </div>

          {/* Site URL */}
          <div>
            <label className="text-lg text-black font-medium">Site URL</label>
            <input
              type="text"
              value={settings.siteUrl}
              onChange={(e) => handleChange("siteUrl", e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="https://example.com"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">

            <button
              type="submit"
              disabled={saving}
              className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center flex items-center justify-center"
            >
              {saving && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
