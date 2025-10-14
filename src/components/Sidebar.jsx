import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  FiHome,
  FiFile,
  FiBox,
  FiTag,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiX,
} from "react-icons/fi";
import Logo from "../assets/logo.png";

export default function Sidebar() {
  const { pathname } = useLocation();

  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const btnOpenSidebar = document.getElementById("btnOpenSidebar");
    const btnCloseSidebar = document.getElementById("btnCloseSidebar");

    const openSidebar = () => {
      sidebar.classList.remove("-translate-x-full");
      overlay.classList.remove("hidden");
    };

    const closeSidebar = () => {
      sidebar.classList.add("-translate-x-full");
      overlay.classList.add("hidden");
    };

    btnOpenSidebar?.addEventListener("click", openSidebar);
    btnCloseSidebar?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);

    return () => {
      btnOpenSidebar?.removeEventListener("click", openSidebar);
      btnCloseSidebar?.removeEventListener("click", closeSidebar);
      overlay?.removeEventListener("click", closeSidebar);
    };
  }, []);

  // Close sidebar on mobile when any menu item is clicked
  const handleNavClick = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("overlay");
      sidebar?.classList.add("-translate-x-full");
      overlay?.classList.add("hidden");
    }
  };

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
    { name: "Forms", path: "/dashboard/forms", icon: <FiFile size={18} /> },
    { name: "Products", path: "/dashboard/products", icon: <FiBox size={18} /> },
    { name: "Categories", path: "/dashboard/categories", icon: <FiTag size={18} /> },
    { name: "Orders", path: "/dashboard/orders", icon: <FiClipboard size={18} /> },
    { name: "Users", path: "/dashboard/users", icon: <FiUsers size={18} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FiSettings size={18} /> },
  ];

  return (
    <>
      <aside
        id="sidebar"
        className="dashboard-sidebar fixed md:static inset-y-0 left-0 z-99 w-72 md:w-64 bg-black text-white border-r border-slate-200 shadow-md md:shadow-none transform -translate-x-full md:translate-x-0 transition-transform duration-300 "
        style={{ zIndex: "999999" }}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center md:justify-center justify-between px-4 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="logo" className="w-44 mx-auto" />
            </div>
            <button
              id="btnCloseSidebar"
              className="md:hidden inline-flex items-center gap-2 px-2 py-2 rounded-lg border border-white hover:bg-white hover:text-black text-white"
              aria-label="Close sidebar"
            >
              <FiX size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-3">
              {links.map(({ name, path, icon }) => {
                const active = pathname === path;
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      onClick={handleNavClick}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded font-medium transition-colors ${
                        active ? "bg-[#C81A1F] text-white" : "hover:bg-[#C81A1F]"
                      }`}
                    >
                      {icon}
                      <span>{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        id="overlay"
        className="fixed inset-0 bg-black/30 z-30 hidden md:hidden transition-opacity duration-300"
      ></div>
    </>
  );
}
