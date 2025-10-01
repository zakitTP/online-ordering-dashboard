import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./utils/auth";

import NotFound from "./pages/404";

//Admin
import AdminLayout from "./layouts/AdminLayout";
import Forms from "./pages/admin/Forms";
import AddForm from "./pages/admin/AddForm";
import EditForm from "./pages/admin/EditForm";
import ProductList from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import CategoriesPage from "./pages/admin/ProductCategories";
import UserList from "./pages/admin/Users";
import AddUser from "./pages/admin/AddUser";
import EditUser from "./pages/admin/EditUser";
import EditProduct from "./pages/admin/EditProduct";
import Login from "./pages/admin/Login";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import CompanySettings from "./pages/admin/Setting";
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/admin/Profile";
import Orders from "./pages/admin/Orders";



function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    fetchCurrentUser(dispatch);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
             <ProtectedAdminRoute>
              <AdminLayout />
             </ProtectedAdminRoute>
          }
        >
           <Route index element={<Dashboard />} />
           <Route path="profile" element={<Profile />} /> 
          <Route path="forms" element={<Forms />} />
          <Route path="addform" element={<AddForm />} />
          <Route path="editform/:id" element={<EditForm />} />
          <Route path="products" element={<ProductList />} />
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UserList />} />
          <Route path="adduser" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="settings" element={<CompanySettings />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
