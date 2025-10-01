import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
