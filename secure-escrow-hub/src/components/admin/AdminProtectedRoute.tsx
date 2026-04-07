import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminAuth } from "@/lib/adminAuth";

const AdminProtectedRoute = () => {
  const location = useLocation();

  if (!adminAuth.isLoggedIn()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
