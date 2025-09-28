import { usePermissions } from '../Context/PermissionsContext';

/**
 * Custom hook for optimized permission checking
 * This hook provides cached permission checking to prevent unnecessary re-renders
 * and better UX during loading states
 */
export const usePermissionCheck = () => {
  const { hasPermission, isInitialized, loading } = usePermissions();

  const checkPermission = (objectName, permissionType = 'ViewTab') => {
    if (!isInitialized && !loading) {
      return false;
    }
    return hasPermission(objectName, permissionType);
  };

  return {
    checkPermission,
    isInitialized,
    loading,
  };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = (WrappedComponent, requiredPermissions) => {
  return (props) => {
    const { checkPermission, isInitialized, loading } = usePermissionCheck();

    if (loading) {
      return <div>Loading permissions...</div>;
    }

    if (!isInitialized) {
      return null;
    }

    const hasRequiredPermissions = Array.isArray(requiredPermissions)
      ? requiredPermissions.every(({ objectName, permissionType }) =>
          checkPermission(objectName, permissionType)
        )
      : checkPermission(
          requiredPermissions.objectName,
          requiredPermissions.permissionType
        );

    if (!hasRequiredPermissions) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * Permission-based conditional rendering component
 */
export const PermissionGate = ({
  children,
  requiredPermissions,
  fallback = null,
  requireAll = true,
}) => {
  const { checkPermission, isInitialized, loading } = usePermissionCheck();

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  if (!isInitialized) {
    return fallback;
  }

  let hasPermission = false;

  if (Array.isArray(requiredPermissions)) {
    hasPermission = requireAll
      ? requiredPermissions.every(({ objectName, permissionType = 'ViewTab' }) =>
          checkPermission(objectName, permissionType)
        )
      : requiredPermissions.some(({ objectName, permissionType = 'ViewTab' }) =>
          checkPermission(objectName, permissionType)
        );
  } else {
    hasPermission = checkPermission(
      requiredPermissions.objectName,
      requiredPermissions.permissionType
    );
  }

  return hasPermission ? children : fallback;
};