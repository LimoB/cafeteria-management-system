import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { UserRole } from '../types/auth.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 1. Handle Loading (Matches your Red/Black theme)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-red-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-black rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">
          Authenticating Session
        </p>
      </div>
    );
  }

  // 2. Redirect to specific login if not authenticated
  if (!user) {
    const isTryingAdmin = location.pathname.startsWith('/admin');
    const loginPath = isTryingAdmin ? '/auth/admin-login' : '/auth/login';
    
    // Pass the current location in state so we can return here after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 3. Role-Based Access Control (RBAC)
  if (allowedRoles && role) {
    const hasAccess = allowedRoles.includes(role);

    if (!hasAccess) {
      // If a 'user' (student) tries to access /admin, bounce them to home
      if (role === 'user' && location.pathname.startsWith('/admin')) {
        return <Navigate to="/home" replace />;
      }

      // General unauthorized fallback (e.g., if we add 'super-admin' later)
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
          <ShieldAlert size={64} className="text-red-600 mb-4" />
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Access Denied</h2>
          <p className="text-gray-500 max-w-xs mt-2 font-medium">
            Your account role ({role}) does not have permission to view this section.
          </p>
          <Navigate to="/home" replace />
        </div>
      );
    }
  }

  // 4. Authorized - Render requested component
  return <Outlet />;
};

export default ProtectedRoute;