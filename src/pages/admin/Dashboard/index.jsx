import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import apiClient from "../../../apiClient";
import { useSelector } from "react-redux";
import {
  FaFileAlt,
  FaBoxOpen,
  FaTags,
  FaShoppingCart,
  FaUsers,
  FaCogs,
  FaArrowRight,
} from "react-icons/fa";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    forms: 0,
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user); // ✅ get logged-in user
  const role = user?.role?.toLowerCase() || "guest";

  useEffect(() => {
    apiClient
      .get("/api/counts")
      .then((res) => {
        setCounts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching counts:", err);
        setLoading(false);
      });
  }, []);

  // ✅ define cards normally
  const cards = [
    { label: "Forms", value: counts.forms, icon: FaFileAlt, link: "/dashboard/forms" },
    { label: "Products", value: counts.products, icon: FaBoxOpen, link: "/dashboard/products" },
    { label: "Categories", value: counts.categories, icon: FaTags, link: "/dashboard/categories" },
    { label: "Orders", value: counts.orders, icon: FaShoppingCart, link: "/dashboard/orders" },
    { label: "Users", value: counts.users, icon: FaUsers, link: "/dashboard/users" },
    { label: "Settings", value: <FaArrowRight />, icon: FaCogs, link: "/dashboard/settings" },
  ];

  // ✅ if manager — only "Orders" is clickable
  const allowedLinks =
  role === "super admin"
    ? cards.map((c) => c.label) // full access
    : role === "admin"
    ? cards.map((c) => c.label).filter((label) => label !== "Users") // all except Users
    : role === "manager"
    ? cards.map((c) => c.label).filter((label) => label === "Orders") // only Orders
    : [];

  return (
    <div id="home" className="view">
  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
    {cards
      .filter((card) => allowedLinks.includes(card.label)) // ✅ show only allowed cards
      .map((card, idx) => {
        const Icon = card.icon;

        return (
          <NavLink key={idx} to={card.link}>
            <div className="bg-white hover:bg-[#C81A1F] text-black hover:text-white rounded-xl border border-slate-200 md:p-6 p-2 shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center group relative overflow-hidden">
              <div className="bg-[#f1f5f9] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="text-2xl text-[#C81A1F]" />
              </div>
              <p className="text-xl font-bold">{card.label}</p>
              <p className="text-3xl font-bold mt-2 flex justify-center">
                {loading ? "..." : card.label === "Settings" ? <FaArrowRight className="mt-1" /> : card.value}
              </p>
            </div>
          </NavLink>
        );
      })}
  </div>
</div>

  );
}
