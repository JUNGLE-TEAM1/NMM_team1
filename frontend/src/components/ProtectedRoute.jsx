import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requireAdmin = false, requireEtlAccess = false, requireQueryAccess = false }) {
  const { sessionId, user, isAuthReady } = useAuth();

  // Wait for auth to be restored from sessionStorage before checking
  if (!isAuthReady) {
    return null; // or a loading spinner
  }

  if (!sessionId) {
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const hasEtlAccess =
    user?.etl_access || user?.role_dataset_etl_access || user?.is_admin;

  // Check ETL requirement
  if (requireEtlAccess && !hasEtlAccess) {
    return <Navigate to="/catalog" replace />;
  }

  // Check query_ai_access requirement
  if (requireQueryAccess && !user?.role_query_ai_access && !user?.is_admin) {
    return <Navigate to="/catalog" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
