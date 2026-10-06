import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'rescue' | 'volunteer' | 'ngo')[];
}

export const getNormalizedUserRole = (user: any): 'admin' | 'rescue' | 'volunteer' | 'ngo' | 'citizen' => {
  if (!user) return 'citizen';
  const roleStr = (user.roleName || (typeof user.role === 'string' ? user.role : user.role?.name) || '').toLowerCase();
  if (roleStr.includes('admin')) return 'admin';
  if (roleStr.includes('rescue')) return 'rescue';
  if (roleStr.includes('ngo')) return 'ngo';
  if (roleStr.includes('volunteer')) return 'volunteer';
  return 'citizen';
};

export const getRoleHomeDashboard = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'rescue':
      return '/rescue/dashboard';
    case 'volunteer':
      return '/volunteer/dashboard';
    case 'ngo':
      return '/ngo/dashboard';
    default:
      return '/';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check account lifecycle status
  if (user.status === 'pending') {
    return <Navigate to="/login" state={{ error: 'Your account is awaiting administrator approval.' }} replace />;
  }

  if (user.status === 'suspended') {
    return <Navigate to="/login" state={{ error: 'Your account has been suspended. Please contact the administrator.' }} replace />;
  }

  const normalizedRole = getNormalizedUserRole(user);
  const hasAccess = allowedRoles.includes(normalizedRole as any);

  useEffect(() => {
    if (!hasAccess) {
      if (normalizedRole === 'citizen') {
        toast.error('Access denied: Operational command portals require verified staff credentials.', {
          id: 'role-restricted-toast'
        });
      } else {
        toast.error(`Access restricted: You do not have permission to access that section. Redirected to your authorized ${normalizedRole.toUpperCase()} command dashboard.`, {
          id: 'role-restricted-toast'
        });
      }
    }
  }, [hasAccess, normalizedRole]);

  if (!hasAccess) {
    const targetDashboard = getRoleHomeDashboard(normalizedRole);
    return <Navigate to={targetDashboard} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
