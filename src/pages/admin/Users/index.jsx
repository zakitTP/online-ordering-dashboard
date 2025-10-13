import { useState, useEffect } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiUserPlus, FiTrash2, FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function UserList() {
  const {user} = useSelector((state) => state.user)
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const params = {
      search: searchTerm,
      role: roleFilter !== "All Roles" ? roleFilter : "",
      page,
      per_page: perPage,
    };

    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        params,
        withCredentials: true,
      });
      setUsers(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, page, perPage]);

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        withCredentials: true,
      });
      toast.success("User deleted successfully!");
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to delete user");
      console.error(err);
    } finally {
      setDeleting(false);
      setSelectedUser(null);
    }
  };



  return (
    <div id="users" className="view !mt-0">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white border border-slate-200 rounded-2xl p-2 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 justify-between mb-4">
          <h3 className="font-bold text-black text-3xl">Users</h3>
          <Link
            to="/dashboard/adduser"
            className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1"
          >
            <FiUserPlus /> Add User
          </Link>
        </div>

        {/* Search & Role Filter */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-slate-300">
            <FiSearch className="text-slate-500" />
            <input
              placeholder="Search name, email or ID…"
              className="w-full outline-none text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading  ?  
           <div className="flex items-center justify-center min-h-screen">

       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>

      </div>
        
        :

        <div className="overflow-x-auto">
    
            <table className="min-w-full text-sm db-back-table responsive">
              <thead>
                <tr>
                  <th className="text-left font-medium px-3 py-2">ID</th>
                  <th className="text-left font-medium px-3 py-2">Name</th>
                  <th className="text-left font-medium px-3 py-2">Email</th>
                  <th className="text-left font-medium px-3 py-2">Phone</th>
                  <th className="text-left font-medium px-3 py-2">Role</th>
                  <th className="text-center font-medium px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="main-card-box-row new ">
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2 capitalize" data-label="ID">{u.id}</td>
                    <td className="px-3 py-2 font-medium capitalize" data-label="Name">{u.name}</td>
                    <td className="px-3 py-2 break-all capitalize" data-label="Email">{u.email}</td>
                    <td className="px-3 py-2 capitalize" data-label="Phone">{u.phone || "-"}</td>
                    <td className="px-3 py-2 capitalize" data-label="Role">{u.role}</td>
                    <td className="px-3 py-2 text-center capitalize" data-label="Action">
                      {user.id !== u.id && 
                      <div className="mobile-action-btns flex xl:justify-center gap-1">
                        <Link
                          to={`/dashboard/users/edit/${u.id}`}
                          className="px-2 py-1 rounded bg-black text-white text-sm flex items-center justify-center"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => confirmDelete(u)}
                          className="px-2 py-1 rounded bg-brand-600 text-white text-sm flex items-center justify-center"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
}   

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-base">
          <p className="text-slate-600">
            Showing {users.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, users.length)} of {users.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <FiChevronLeft />
            </button>
            <span className="px-2.5 py-1 rounded-lg border bg-brand-600 text-white border-brand-600">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl p-6">
            <div className="flex items-start gap-3">
              {/* <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded bg-brand-50 text-brand-700 border border-brand-100">
                <FiTrash2 className="text-xl" />
              </div> */}
              <div className="flex-1">
                <h3 className="text-2xl text-black font-bold">Delete user?</h3>
                <p className="text-base text-black my-3">Are you sure you want to delete <strong>{selectedUser?.name}</strong>?</p>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 md:px-5 py-3 rounded bg-[#C81A1F] text-white text-xl w-32 text-center"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 md:px-5 py-3 rounded bg-black text-white text-xl w-32 text-center"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
