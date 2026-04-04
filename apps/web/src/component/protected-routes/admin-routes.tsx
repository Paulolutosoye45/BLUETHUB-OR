import { useAuthContext } from "@/contexts/auth-context";
import { type ReactNode } from "react"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
}

const AdminProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, user, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return (
     <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

 if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
}

  if (user.roleName !== "SuperAdministrator" && user.roleName !== "Administrator") {
    return <Navigate to="/auth" replace />; // ✅ back to /auth, not /unauthorized
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
