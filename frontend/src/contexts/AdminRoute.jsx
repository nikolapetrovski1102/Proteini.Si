import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { BrandLoader } from "../Pages/Components/Loaders/BrandLoader";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
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

  // Check if user has SuperAdmin = true
  if (!user?.superAdmin) {
    // Redirect to profile page with error message
    return <Navigate to="/profile" replace />;
  }

  // Render admin panel if user is SuperAdmin
  return children;
}
