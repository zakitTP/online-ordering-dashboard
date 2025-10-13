import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
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

const EditForm = () => {
  const { user } = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [taxSelected, setTaxSelected] = useState(false);

  const [formData, setFormData] = useState({
    formTitle: "",
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

  console.log(formData)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    accessCode: "",
    formUrl: "",
  });

  // Fetch existing form
  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/api/forms/${id}`)
      .then((res) => {
        const data = res.data.form;

        // Parse tax if it's a string
        let taxObj = {};
        try {
          if (data.other_settings?.tax) {
            
            taxObj =
              typeof data.other_settings.tax === "string"
                ? JSON.parse(data.other_settings.tax)
                : data.other_settings.tax;

            if (taxObj && Object.keys(taxObj).length) setTaxSelected(true);
          }
        } catch (e) {
          console.error("Failed to parse tax:", e);
        }

        setFormData({
          formTitle: data.form_title,
          contactName: data.contact_name,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          companyName: data.company_name,
          companyLogo: data.company_logo,
          companyLogoUrl: data.company_logo_url,
          showName: data.event_info?.showName || "",
          facility: data.event_info?.facility || "",
          room: data.event_info?.room || "",
          loadInDate: data.event_info?.loadInDate || "",
          loadInTime: data.event_info?.loadInTime || "",
          startDate: data.event_info?.startDate || "",
          startTime: data.event_info?.startTime || "",
          finishDate: data.event_info?.finishDate || "",
          finishTime: data.event_info?.finishTime || "",
          products: data.product_select || [],
          status: data.status || "",
          accessCode: data.access_code || "",
          otherSettings: { ...data.other_settings, tax: taxObj },
        });

        setSelectedProducts(res.data.products || []);
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setLoading(false));
  }, [id]);
console.log(formData)
  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatFieldName = (fieldName) => {
    const fieldNameMap = {
      formTitle: "Form Title",
      contactName: "Contact Name",
      contactEmail: "Contact Email",
      contactPhone: "Contact Phone",
      companyName: "Company Name",
      companyLogo: "Company Logo",
      showName: "Show Name",
      facility: "Facility",
      room: "Room",
      loadInDate: "Load In Date",
      loadInTime: "Load In Time",
      startDate: "Start Date",
      startTime: "Start Time",
      finishDate: "Finish Date",
      finishTime: "Finish Time",
    };
    return fieldNameMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
      "showName",
      "facility",
      "room",
      "startDate",
      "finishDate",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill ${formatFieldName(field)}`);
        return false;
      }
    }

    if (formData.products.length === 0) {
      toast.error("Please select at least one product");
      return false;
    }

    if (!taxSelected) {
      toast.error("Please select a tax option");
      return false;
    }

    return true;
  };

  const saveForm = async (status) => {
    if (!validateForm(status)) return;

    setSaving(true);
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

      const eventFields = [
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

      eventFields.forEach((key) => {
        payload.append(`event_info[${key}]`, formData[key] || "");
      });

      formData.products.forEach((productId, index) => {
        payload.append(`product_select[${index}]`, productId);
      });

      Object.entries(formData.otherSettings || {}).forEach(([key, value]) => {
        payload.append(
          `other_settings[${key}]`,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      });

      payload.append("status", status);

      const res = await apiClient.post(`/api/forms/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-HTTP-Method-Override": "PUT",
        },
      });

      const updatedForm = res.data;

      setFormData((prev) => ({
        ...prev,
        status: updatedForm.status,
        accessCode: updatedForm.access_code,
      }));

      toast.success(
        `Form ${status === "draft" ? "saved as draft" : "published"} successfully`
      );

      const formUrl = `https://av-canada.com/order/client/orderform/${id}`;
      setModalContent({
        accessCode: updatedForm.access_code,
        formUrl,
      });
      setModalVisible(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save form!");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  return (
    <section id="wizardSection" className="border rounded-lg overflow-hidden shadow-md">
      <ToastContainer position="top-right" autoClose={3000} />
      {saving && (
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
          className={`${stepBtnBase} ${activeStep === 1 ? activeTab : inactiveTab}`}
          onClick={() => setActiveStep(1)}
          type="button"
        >
          <FaCircleInfo /> Form Detail
        </button>

        <button
          data-step="2"
          className={`${stepBtnBase} ${activeStep === 2 ? activeTab : inactiveTab}`}
          onClick={() => setActiveStep(2)}
          type="button"
        >
          <FaCalendarDays /> Event Info
        </button>

        <button
          data-step="3"
          className={`${stepBtnBase} ${activeStep === 3 ? activeTab : inactiveTab}`}
          onClick={() => setActiveStep(3)}
          type="button"
        >
          <FaBagShopping /> Product Selection
        </button>

        <button
          data-step="4"
          className={`${stepBtnBase} ${activeStep === 4 ? activeTab : inactiveTab}`}
          onClick={() => setActiveStep(4)}
          type="button"
        >
          <FaScissors /> Taxes
        </button>
      </nav>

      {/* Steps */}
      <form className="p-4 md:p-4 lg:p-6 space-y-10">
        {activeStep === 1 && (
          <section>
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
        )}

        {activeStep === 2 && (
          <section>
            <EventInfo formData={formData} onInputChange={handleInputChange} setFormData={setFormData} />
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
        )}

        {activeStep === 3 && (
          <section>
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
        )}

        {activeStep === 4 && (
          <section>
            <Taxes formData={formData} setFormData={setFormData} setTaxSelected={setTaxSelected} />
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
        )}
      </form>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            {formData.status === "publish" && (
              <>
                <h2 className="text-2xl text-black font-bold">Access Code</h2>
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
            <h2 className="text-2xl text-black font-bold">Form URL</h2>
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

export default EditForm;
