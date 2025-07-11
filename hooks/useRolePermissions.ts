import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * useRolePermissions - React hook to check user/staff permissions throughout the app
 *
 * Usage:
 *   const hasPermission = useRolePermissions();
 *   if (hasPermission('view_reports')) { ... }
 */
export function useRolePermissions() {
  const { user } = useContext(AuthContext) as any;

  return (perm: string) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'staff' && user?.staff?.permissions) {
      return user.staff.permissions.includes(perm);
    }
    return false;
  };
}
