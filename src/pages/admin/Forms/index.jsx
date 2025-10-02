import { useState, useEffect } from "react";
import { 
  FiPlus, FiCopy, FiTrash2, FiEdit, FiClipboard, FiSearch, 
  FiChevronLeft, FiChevronRight, FiLoader 
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    formId: null, 
    formTitle: "", 
    loading: false 
  });
  const [duplicateModal, setDuplicateModal] = useState({ 
    isOpen: false, 
    formId: null, 
    formTitle: "", 
    newTitle: "",
    loading: false 
  });
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();
  const site_url = window.location.origin;

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/forms`, { withCredentials: true })
      .then(res => setForms(res.data))
      .catch(err => toast.error("Failed to load forms"))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id, title) => setDeleteModal({ 
    isOpen: true, 
    formId: id, 
    formTitle: title, 
    loading: false 
  });

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await axios.delete(`${API_BASE_URL}/api/forms/${deleteModal.formId}`, { 
        withCredentials: true 
      });
      setForms(forms.filter(f => f.id !== deleteModal.formId));
      toast.success("Form deleted successfully");
    } catch (error) {
      toast.error("Failed to delete form");
    } finally {
      setDeleteModal({ isOpen: false, formId: null, formTitle: "", loading: false });
    }
  };

  const handleDuplicate = (id, title) => setDuplicateModal({ 
    isOpen: true, 
    formId: id, 
    formTitle: title, 
    newTitle: `${title} (Copy)`,
    loading: false 
  });

  const confirmDuplicate = async () => {
    setDuplicateModal(prev => ({ ...prev, loading: true }));
    
    try {
      const originalForm = forms.find(f => f.id === duplicateModal.formId);
      if (originalForm) {
        // Create new form data without problematic fields
        const newFormData = {
          user_id: originalForm.user_id,
          form_title: duplicateModal.newTitle,
          contact_name: originalForm.contact_name,
          contact_email: originalForm.contact_email,
          contact_phone: originalForm.contact_phone,
          company_name: originalForm.company_name,
          // Exclude company_logo as it's a file path string, not an actual file
          event_info: originalForm.event_info,
          product_select: originalForm.product_select,
          other_settings: originalForm.other_settings,
          status: 'draft' // Default to draft when duplicating
        };

        const res = await axios.post(`${API_BASE_URL}/api/forms`, newFormData, { 
          withCredentials: true 
        });
        setForms([...forms, res.data]);
        toast.success("Form duplicated successfully");
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error("Failed to duplicate form");
    } finally {
      setDuplicateModal({ isOpen: false, formId: null, formTitle: "", newTitle: "", loading: false });
    }
  };

  const handleEdit = async (id) => {
    setActionLoading(id);
    try {
      navigate(`/dashboard/editform/${id}`);
    } catch (error) {
      toast.error("Failed to navigate to edit page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyAccessCode = async (accessCode, formId) => {
    if (!accessCode) return;
    
    setActionLoading(`copy-code-${formId}`);
    try {
      await navigator.clipboard.writeText(accessCode);
      toast.success("Access code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy access code");
    } finally {
      setTimeout(() => setActionLoading(null), 500);
    }
  };

  const handleCopyUrl = async (id) => {
    const url = `${site_url}/orderform/${id}`;
    setActionLoading(`copy-url-${id}`);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    } finally {
      setTimeout(() => setActionLoading(null), 500);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'active' || status === 'publish'
      ? "bg-[#067d06] text-white" 
      : "bg-[#dcdcdc]";
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full justify-center border border-[#bbb] form-status ${statusClass}`}>
        {status === 'publish' ? 'Publish' : ( "Draft")}
      </span>
    );
  };

  const filteredForms = forms.filter(form => 
    form.form_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActionLoading = (actionId) => actionLoading === actionId;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
    );
  }

  return (
    <section id="formsListSection" className="p-2 md:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-bold text-black text-3xl">Forms</h3>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-1 md:gap-2 px-3 py-2 rounded border border-slate-300 w-[62%] md:w-auto">
            <FiSearch className="text-slate-500" />
            <input 
              placeholder="Search forms…" 
              className="w-full outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/dashboard/addform"
            className="md:px-4 px-2 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center"
            title="Create New Form"
          >
            <FiPlus className="mr-1" />
            New Form
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm responsive">
          <thead>
            <tr>
              <th className="text-left font-medium px-3 py-2">Form Title</th>
              <th className="text-left font-medium px-3 py-2">Company Name</th>
              <th className="text-left font-medium px-3 py-2">Date</th>
              <th className="text-left font-medium px-3 py-2">Access Code</th>
              <th className="text-left font-medium px-3 py-2">Status</th>
              <th className="text-center font-medium px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="main-card-box-row">
            {filteredForms.map(form => (
              <tr key={form.id} className="border-t">
                <td className="px-3 py-2 font-medium" data-label="Form Title">{form.form_title}</td>
                <td className="px-3 py-2" data-label="Company Name">{form.company_name || "-"}</td>
                <td className="px-3 py-2" data-label="Date">{formatDate(form.created_at)}</td>
                <td className="px-3 py-2" data-label="Access Code">
                  <div className="inline-flex items-center gap-2">
                    <span className="font-mono bg-white border border-slate-300 rounded px-2 py-1">
                      {form.access_code || "-"}
                    </span>
                    {form.access_code && (
                      <button 
                        className="p-2 rounded border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 flex items-center justify-center min-w-[32px]"
                        title="Copy Access Code"
                        onClick={() => handleCopyAccessCode(form.access_code, form.id)}
                        disabled={isActionLoading(`copy-code-${form.id}`)}
                      >
                        {isActionLoading(`copy-code-${form.id}`) ? (
                          <FiLoader className="animate-spin" size={14} />
                        ) : (
                          <FiCopy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2" data-label="Status">
                  {getStatusBadge(form.status)}
                </td>
                <td className="px-3 py-2 text-center" data-label="Actions" data-actions>
                  <div className="mobile-action-btns flex justify-center gap-1">
                    <button
                      className="px-2 py-1 rounded bg-black text-white text-lg hover:bg-gray-800 flex items-center justify-center"
                      onClick={() => handleEdit(form.id)}
                      title="Edit Form"
                      disabled={isActionLoading(form.id)}
                    >
                      {isActionLoading(form.id) ? (
                        <FiLoader className="animate-spin" size={12} />
                      ) : (
                        <FiEdit size={14} />
                      )}
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 flex items-center justify-center"
                      onClick={() => handleDelete(form.id, form.form_title)}
                      title="Delete Form"
                      disabled={deleteModal.loading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-slate-700 text-white text-xs hover:bg-slate-800 flex items-center justify-center "
                      onClick={() => handleDuplicate(form.id, form.form_title)}
                      title="Duplicate Form"
                      disabled={duplicateModal.loading}
                    >
                      <FiCopy size={14} />
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-black text-white text-xs hover:bg-gray-800 flex items-center justify-center"
                      onClick={() => handleCopyUrl(form.id)}
                      title="Copy Form URL"
                      disabled={isActionLoading(`copy-url-${form.id}`)}
                    >
                      {isActionLoading(`copy-url-${form.id}`) ? (
                        <FiLoader className="animate-spin" size={14} />
                      ) : (
                        <FiClipboard size={12} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-slate-600">
          Showing {filteredForms.length} of {forms.length} form{forms.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            <FiChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 rounded-lg border bg-brand-600 text-white border-brand-600">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl text-black font-bold">Confirm Deletion</h3>
            <p className="text-base text-black my-3">
              Are you sure you want to delete the form "{deleteModal.formTitle}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-1">
              <button
                onClick={() => setDeleteModal({ isOpen: false, formId: null, formTitle: "", loading: false })}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white  text-xl w-32 text-center"
                disabled={deleteModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 md:px-5 py-3 rounded bg-black text-white  text-xl w-32 text-center"
                disabled={deleteModal.loading}
              >
                {deleteModal.loading ? (
                  <FiLoader className="animate-spin mr-2" size={16} />
                ) : null}
                {deleteModal.loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl text-black font-bold">Duplicate Form</h3>
            <p className="text-base text-black my-2">Create a copy of "{duplicateModal.formTitle}"</p>
            <div className="mb-4">
              <label htmlFor="newTitle" className="block  mb-1 text-lg text-black font-medium">New Form Title</label>
              <input
                type="text"
                id="newTitle"
                value={duplicateModal.newTitle}
                onChange={(e) => setDuplicateModal({...duplicateModal, newTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={duplicateModal.loading}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDuplicateModal({ isOpen: false, formId: null, formTitle: "", newTitle: "", loading: false })}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl"
                disabled={duplicateModal.loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDuplicate}
                className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl"
                disabled={duplicateModal.loading}
              >
                {duplicateModal.loading ? (
                  <FiLoader className="animate-spin mr-2" size={16} />
                ) : null}
                {duplicateModal.loading ? "Duplicating..." : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}