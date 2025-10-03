import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FormDetail from "../../../components/admin/FormDetail";
import EventInfo from "../../../components/admin/EventInfo";
import ProductSelection from "../../../components/admin/ProductSelection";
import Taxes from "../../../components/admin/Taxinfo";
import apiClient from "../../../apiClient";

import {
  FaCircleInfo,
  FaCalendarDays,
  FaBagShopping,
  FaScissors,
  FaFloppyDisk,
  FaPaperPlane,
  FaCopy,
} from "react-icons/fa6";

const AddForm = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    formTitle: "",
    tradeshowName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyName: "",
    companyLogo: null,
    showName: "",
    facility: "",
    room: "",
    loadInDate: "",
    loadInTime: "",
    startDate: "",
    startTime: "",
    finishDate: "",
    finishTime: "",
    products: [],
    status: "",
    accessCode: "",
    otherSettings: { tax: {} },
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    accessCode: "",
    formUrl: "",
  });

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (status) => {
    if (status === "draft") {
      if (!formData.formTitle) {
        toast.error("Form title is required for draft");
        return false;
      }
      return true;
    }

    const requiredFields = [
      "formTitle",
      "contactName",
      "contactEmail",
      "contactPhone",
      "companyName",
      "companyLogo",
      "showName",
      "facility",
      "room",
      "loadInDate",
      "loadInTime",
      "startDate",
      "startTime",
      "finishDate",
      "finishTime",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill ${field}`);
        return false;
      }
    }

    if (formData.products.length === 0) {
      toast.error("Please select at least one product");
      return false;
    }

    return true;
  };

  const saveForm = async (status) => {
    if (!validateForm(status)) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("user_id", user.id);
      payload.append("form_title", formData.formTitle);
      payload.append("contact_name", formData.contactName);
      payload.append("contact_email", formData.contactEmail);
      payload.append("contact_phone", formData.contactPhone);
      payload.append("company_name", formData.companyName);

      if (formData.companyLogo instanceof File) {
        payload.append("company_logo", formData.companyLogo);
      }

      payload.append(
        "event_info",
        JSON.stringify({
          showName: formData.showName,
          facility: formData.facility,
          room: formData.room,
          loadInDate: formData.loadInDate,
          loadInTime: formData.loadInTime,
          startDate: formData.startDate,
          startTime: formData.startTime,
          finishDate: formData.finishDate,
          finishTime: formData.finishTime,
        })
      );

      payload.append("product_select", JSON.stringify(formData.products));
      payload.append("other_settings", JSON.stringify(formData.otherSettings));
      payload.append("status", status);

      const res = await apiClient.post("/api/forms", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const savedForm = res.data;

      setFormData((prev) => ({
        ...prev,
        status: savedForm.status,
        accessCode: savedForm.access_code || "",
      }));

      toast.success(
        `Form ${status === "draft" ? "saved as draft" : "published"} successfully!`
      );

      const formUrl = `${window.location.origin}/orderform/${savedForm.id}`;
      setModalContent({
        accessCode: savedForm.access_code || "",
        formUrl,
      });
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save form!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    saveForm("draft");
  };

  const handlePublish = (e) => {
    e.preventDefault();
    saveForm("publish");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const handleModalOk = () => {
    setModalVisible(false);
    navigate("/dashboard/forms");
  };

  const stepBtnBase =
    "step-tab w-full inline-flex items-center justify-center md:gap-3 gap-2 rounded px-1 md:px-3 py-2 text-base md:text-lg font-medium md:font-bold border border-slate-300";
  const activeTab = "bg-brand-600 text-white";
  const inactiveTab = "bg-white";

  return (
    <section id="wizardSection" className="border rounded-lg overflow-visible shadow-md">
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="fixed inset-0 bg-black/30 z-50 grid place-items-center">
          <div className="h-16 w-16 rounded-full border-8 border-t-8 border-white animate-spin"></div>
        </div>
      )}

      {/* Tabs */}
      <nav
        id="wizardTabs"
        className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-2 p-3 sm:p-4 bg-slate-50 border-b"
      >
        <button
          data-step="1"
          className={`${stepBtnBase} ${
            activeStep === 1 ? activeTab : inactiveTab
          }`}
          onClick={() => setActiveStep(1)}
          type="button"
        >
          <FaCircleInfo /> Form Detail
        </button>

        <button
          data-step="2"
          className={`${stepBtnBase} ${
            activeStep === 2 ? activeTab : inactiveTab
          }`}
          onClick={() => setActiveStep(2)}
          type="button"
        >
          <FaCalendarDays /> Event Info
        </button>

        <button
          data-step="3"
          className={`${stepBtnBase} ${
            activeStep === 3 ? activeTab : inactiveTab
          }`}
          onClick={() => setActiveStep(3)}
          type="button"
        >
          <FaBagShopping /> Product Selection
        </button>

        <button
          data-step="4"
          className={`${stepBtnBase} ${
            activeStep === 4 ? activeTab : inactiveTab
          }`}
          onClick={() => setActiveStep(4)}
          type="button"
        >
          <FaScissors /> Taxes
        </button>
      </nav>

      {/* Steps */}
      <form className="p-4 md:p-4 lg:p-6 space-y-10">
        {/* Step 1 */}
        <section
          data-step="1"
          className={`${activeStep === 1 ? "" : "screen-hidden hidden !mt-0"}`}
        >
          <h3 className="font-bold text-2xl mb-4">Form Details</h3>
          <FormDetail formData={formData} onInputChange={handleInputChange} />

          <div className="flex items-center justify-end gap-3 mt-8 text-xl">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white flex items-center"
            >
              <FaFloppyDisk className="mr-2" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-3 md:px-5 py-3 rounded bg-black text-white flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Publish
            </button>
          </div>
        </section>

        {/* Step 2 */}
        <section
          data-step="2"
          className={`${activeStep === 2 ? "!mt-0" : "screen-hidden hidden !mt-0"}`}
        >
          <EventInfo formData={formData} onInputChange={handleInputChange} />

          <div className="flex items-center justify-end gap-3 mt-8 text-xl">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white flex items-center"
            >
              <FaFloppyDisk className="mr-2" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-3 md:px-5 py-3 rounded bg-black text-white flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Publish
            </button>
          </div>
        </section>

        {/* Step 3 */}
        <section
          data-step="3"
          className={`${activeStep === 3 ? "!mt-0" : "screen-hidden hidden !mt-0"}`}
        >
          <h3 className="font-bold text-2xl mb-4">Product Selection</h3>

          <ProductSelection
            formData={formData}
            setFormData={setFormData}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            eventStart={formData.startDate}
            eventEnd={formData.finishDate}
          />

          <div className="flex items-center justify-end gap-3 mt-8 text-xl">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white flex items-center"
            >
              <FaFloppyDisk className="mr-2" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-3 md:px-5 py-3 rounded bg-black text-white flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Publish
            </button>
          </div>
        </section>

        {/* Step 4 */}
        <section
          data-step="4"
          className={`${activeStep === 4 ? "!mt-0" : "screen-hidden hidden !mt-0"}`}
        >
          <Taxes formData={formData} setFormData={setFormData} />

          <div className="flex items-center justify-end gap-3 mt-8 text-xl">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white flex items-center"
            >
              <FaFloppyDisk className="mr-2" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-3 md:px-5 py-3 rounded bg-black text-white flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Publish
            </button>
          </div>
        </section>
      </form>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            {formData.status === "publish" && (
              <>
                <h2 className="text-2xl text-black font-bold mb-2">Access Code</h2>
                <div className="flex justify-center gap-2 mb-4">
                  <p className="break-words">{modalContent.accessCode}</p>
                  <button
                    onClick={() => handleCopy(modalContent.accessCode)}
                    className="bg-black text-white px-2 py-1 rounded flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
              </>
            )}
            <h2 className="text-2xl text-black font-bold mb-2">Form URL</h2>
            <div className="flex justify-center gap-2 mb-4">
              <p className="break-words w-[85%]">{modalContent.formUrl}</p>
              <button
                onClick={() => handleCopy(modalContent.formUrl)}
                className="bg-black text-white px-2 py-1 rounded flex items-center gap-1"
              >
                <FaCopy /> Copy
              </button>
            </div>
            <button
              onClick={handleModalOk}
              className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddForm;