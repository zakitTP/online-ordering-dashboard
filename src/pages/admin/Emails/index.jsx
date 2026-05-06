import React, { useEffect, useState } from "react";
import { FiEye, FiX, FiRefreshCw } from "react-icons/fi";
import apiClient from "../../../apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Filters - removed email_type and search
  const [filters, setFilters] = useState({
    status: ""
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  // Fetch email logs
  const fetchEmailLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        ...filters
      });
      
      const res = await apiClient.get(`api/email-logs?${params}`);
      setLogs(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total
      });
    } catch (err) {
      toast.error("Failed to fetch email logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchEmailLogs(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: ""
    });
    fetchEmailLogs(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Resend email function
  const handleResendEmail = async (emailLogId) => {
    try {
      setResendingEmail(true);
      const response = await apiClient.post('/api/orders/resend-email', {
        email_log_id: emailLogId
      });

      if (response.data.success) {
        toast.success('Email resent successfully!');
        // Refresh the logs to get updated status
        
        // Close the modal
        
      } else {
        toast.error(response.data.error || 'Failed to resend email');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend email');
    } finally {
      setResendingEmail(false);
      setShowViewModal(false);
      fetchEmailLogs(1);
    }
  };

  return (
    <div id="email-logs" className="view !mt-0">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 justify-between mb-6">
          <h3 className="font-bold text-black text-3xl">Email Logs</h3>
          <div className="text-sm text-gray-500">
            Total: {pagination.total} logs
          </div>
        </div>

        {/* Filters - Simplified with only status filter */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xl font-semibold text-black mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {/* Filter Actions */}
            <div className="flex items-end gap-2 ">
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white w-full md:w-auto font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
            </div>
          ) : (
            <>
              <table className="min-w-full text-sm db-back-table responsive">
                <thead>
                  <tr>
                    <th className="text-left font-medium px-3 py-2">ID</th>
                    <th className="text-left font-medium px-3 py-2">To Email</th>
                    <th className="text-left font-medium px-3 py-2">Subject</th>
                    <th className="text-center font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Sent At</th>
                    <th className="text-center font-medium px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="main-card-box-row">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-6 text-center text-gray-500">
                        No email logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2" data-label="ID">
                          {log.id}
                        </td>
                        <td className="px-3 py-2" data-label="To Email">
                          <div className="max-w-[200px] truncate" title={log.to_email}>
                            {log.to_email}
                          </div>
                        </td>
                        <td className="px-3 py-2" data-label="Subject">
                          <div className="max-w-[250px] truncate" title={log.subject}>
                            {log.subject}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center" data-label="Status">
                          <span className={`px-2 py-1 rounded-full text-center  text-sm font-medium !max-w-[fit-content] ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-2" data-label="Sent At">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-3 py-2 text-center" data-label="Actions">
                          <div className="mobile-action-btns flex gap-2 xl:justify-center justify-start">
                            <button
                              onClick={() => {
                                setSelectedLog(log);
                                setShowViewModal(true);
                              }}
                              className="px-2 py-1 rounded bg-black text-white text-sm"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {logs.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-3 py-2">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{" "}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                    {pagination.total} entries
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => fetchEmailLogs(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.last_page || 
                        Math.abs(page - pagination.current_page) <= 1
                      )
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-3 py-1">...</span>
                            )}
                            <button
                              onClick={() => fetchEmailLogs(page)}
                              className={`px-3 py-1 rounded border ${
                                pagination.current_page === page
                                  ? "bg-brand-600 text-white border-brand-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    
                    <button
                      onClick={() => fetchEmailLogs(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Email Log Modal */}
      {showViewModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewModal(false)}></div>

          <div className="relative w-full max-w-4xl mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl text-black font-bold">Email Log Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-black bg-[#C81A1F] rounded-full transition-colors"
                title="Close"
              >
                <FiX size={24} className="text-white" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-base font-medium text-black">ID</label>
                <p className="mt-1 text-black">{selectedLog.id}</p>
              </div>
              
              <div>
                <label className="block text-base font-medium text-black">Status</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-base font-medium text-black">From Email</label>
                <p className="mt-1 text-black">{selectedLog.sender_email || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-base font-medium text-black">To Email</label>
                <p className="mt-1 text-black">{selectedLog.to_email}</p>
              </div>
              
              <div>
                <label className="block text-base font-medium text-black">Sent At</label>
                <p className="mt-1 text-black">{formatDate(selectedLog.created_at)}</p>
              </div>

              {selectedLog.email_type && (
                <div>
                  <label className="block text-base font-medium text-black">Email Type</label>
                  <p className="mt-1 text-black capitalize">
                    {selectedLog.email_type.replace(/_/g, ' ')}
                  </p>
                </div>
              )}

              {selectedLog.order && (
                <div>
                  <label className="block text-base font-medium text-black">Order</label>
                  <p className="mt-1 text-black">#{selectedLog.order.id}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-base font-medium text-black mb-2">Subject</label>
              <p className="text-black p-3 bg-gray-50 rounded border">{selectedLog.subject}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-base font-medium text-black mb-2">Email Body</label>
              <div className="p-3 bg-gray-50 rounded border max-h-60 overflow-y-auto">
                {selectedLog.body ? (
                  <div 
                    className="text-black"
                    dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                  />
                ) : (
                  <p className="text-gray-500 italic">No content</p>
                )}
              </div>
            </div>
            
            {selectedLog.error_message && (
              <div className="mb-6">
                <label className="block text-base font-medium text-black mb-2">Error Message</label>
                <p className="text-red-600 p-3 bg-red-50 rounded border">{selectedLog.error_message}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              {/* Resend Email Button - Only show for failed emails or if you want to allow resending any email */}
              {(selectedLog.status === 'failed' || true) && ( // Remove "|| true" if you only want to show for failed emails
                <button
                  onClick={() => handleResendEmail(selectedLog.id)}
                  disabled={resendingEmail}
                  className={`px-4 py-2 rounded font-medium flex items-center gap-2 ${
                    resendingEmail 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {resendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw size={16} />
                      Resend Email
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded bg-black hover:bg-gray-900 text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}