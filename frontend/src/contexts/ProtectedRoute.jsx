import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BrandLoader } from "../Pages/Components/Loaders/BrandLoader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing or a loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BrandLoader variant="shaker" size={120} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if authenticated
  return children;
}
