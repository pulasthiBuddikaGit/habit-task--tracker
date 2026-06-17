import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// A component that protects routes that require authentication
function ProtectedRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;