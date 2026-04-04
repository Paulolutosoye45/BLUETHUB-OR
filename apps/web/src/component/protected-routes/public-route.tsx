import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth-context';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) return (
   <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
  );


  if (isAuthenticated && user) {
    switch (user?.roleName) {
      case "Student":
        return <Navigate to="/student" replace />;       // ✅ goes to student guard
      case "HeadTeacher":
      case "SubjectTeacher":
        return <Navigate to="/teacher" replace />;       // ✅ goes to teacher guard
      case "SuperAdministrator":
      case "Administrator":
        return <Navigate to="/admin" replace />;         // ✅ goes to admin guard
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
