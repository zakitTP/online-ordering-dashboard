import { useState, useEffect } from "react";
import { FiMenu, FiUser, FiLogOut, FiCreditCard, FiPower } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../lib/userSlice.js";
import apiClient from "../apiClient.js";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png"

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = async () => {
    setLoading(true); // start loader
    try {
      await apiClient.post("/api/logout", null, { withCredentials: true });
      dispatch(clearUser()); // clear Redux user
      setShowLogoutModal(false); // close modal
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false); // stop loader
    }
  };

  const renderProfileDropdown = () => (
    <details className="dropdown relative">
      <summary
        className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white md:border-slate-300 hover:text-black bg-black hover:bg-[#C81A1F] cursor-pointer text-white md:text-black"
        aria-haspopup="menu"
      >
        <FiUser size={20} className="text-white" />
      </summary>
      <div className="menu absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-md shadow-lg py-1 z-50">
        {user && (
          <div className="px-3 py-2 text-xs text-slate-500">
            Signed in as <span className="font-medium text-slate-700">{user.email}</span>
          </div>
        )}
        <div className="my-1 h-px bg-slate-200"></div>
      <Link
  to="/dashboard/profile"
  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-black"
>
  <FiCreditCard size={18} /> Profile
</Link>
        <div className="my-1 h-px bg-slate-200"></div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-black w-full text-left"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </details>
  );

  const LogoutModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <a
        href="#"
        onClick={() => !loading && setShowLogoutModal(false)}
        className="fixed inset-0 bg-black/40"
        aria-label="Close logout modal"
      ></a>
      <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white shadow-xl p-6 z-50">
        <div className="flex items-start gap-3">
          {/* <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded bg-red-50 text-red-700 border border-red-100">
            <FiPower size={20} />
          </div> */}
          <div className="flex-1">
            <h3 className="text-2xl text-black font-bold">Log out?</h3>
            <p className="text-base text-black my-3">
              Are you sure you want to logout?
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => !loading && setShowLogoutModal(false)}
            disabled={loading}
            className={`px-3 md:px-5 py-3 rounded text-xl w-32 text-center ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#C81A1F] text-white"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`px-3 md:px-5 py-3 rounded text-xl w-32 text-center ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white"
            }`}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile Header
  if (isMobile) {
    return (
      <>
        <header className="md:hidden sticky top-0 z-40 bg-black border-b border-slate-200">
          <div className="flex items-center justify-between md:px-4 md:py-3 py-2 px-2 bg-black">
            <button
              id="btnOpenSidebar"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white hover:bg-white hover:text-black text-white"
              onClick={() =>
                document.getElementById("sidebar")?.classList.remove("-translate-x-full")
              }
            >
              <FiMenu size={20} />
            </button>
            <div className="mobile-logo">
              <img src={Logo} alt="mobile-logo" className="w-40 mx-auto" />
            </div>
            <div className="relative flex items-center gap-2">{renderProfileDropdown()}</div>
          </div>
        </header>

        {showLogoutModal && <LogoutModal />}
      </>
    );
  }

  // Desktop Header
  return (
    <>
      <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#eeeeee] sticky top-0 z-30">
        <h2 id="viewTitle" className="text-lg font-semibold">
          Dashboard
        </h2>
        <div className="flex items-center gap-3">{renderProfileDropdown()}</div>
      </div>

      {showLogoutModal && <LogoutModal />}
    </>
  );
}
