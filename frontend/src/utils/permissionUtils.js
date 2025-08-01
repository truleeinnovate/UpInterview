import { usePermissions } from '../Context/PermissionsContext';

/**
 * Custom hook for optimized permission checking
 * This hook provides cached permission checking to prevent unnecessary re-renders
 * and better UX during loading states
 */
export const usePermissionCheck = () => {
    const { hasPermission, isInitialized, loading, effectivePermissions, superAdminPermissions } = usePermissions();

    const checkPermission = (objectName, permissionType = "ViewTab") => {
        // If we have any permissions data available, use it immediately
        const hasAnyPermissions = effectivePermissions && Object.keys(effectivePermissions).length > 0;
        const hasAnySuperAdminPermissions = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
        
        if (hasAnyPermissions || hasAnySuperAdminPermissions) {
            // Use available permissions even if still loading
            return hasPermission(objectName, permissionType);
        }
        
        // Only return false if we have no permissions data at all
        if (!isInitialized && !loading) {
            return false;
        }
        
        // During initial loading with no cached data, return false
        return false;
    };

    const checkMultiplePermissions = (permissions) => {
        // If we have any permissions data available, use it immediately
        const hasAnyPermissions = effectivePermissions && Object.keys(effectivePermissions).length > 0;
        const hasAnySuperAdminPermissions = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
        
        if (hasAnyPermissions || hasAnySuperAdminPermissions) {
            return permissions.every(({ objectName, permissionType = "ViewTab" }) =>
                hasPermission(objectName, permissionType)
            );
        }

        // Only return false if we have no permissions data at all
        if (!isInitialized && !loading) {
            return false;
        }
        
        return false;
    };

    const checkAnyPermission = (permissions) => {
        // If we have any permissions data available, use it immediately
        const hasAnyPermissions = effectivePermissions && Object.keys(effectivePermissions).length > 0;
        const hasAnySuperAdminPermissions = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
        
        if (hasAnyPermissions || hasAnySuperAdminPermissions) {
            return permissions.some(({ objectName, permissionType = "ViewTab" }) =>
                hasPermission(objectName, permissionType)
            );
        }

        // Only return false if we have no permissions data at all
        if (!isInitialized && !loading) {
            return false;
        }
        
        return false;
    };

    return {
        checkPermission,
        checkMultiplePermissions,
        checkAnyPermission,
        isInitialized,
        loading
    };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = (WrappedComponent, requiredPermissions) => {
    return (props) => {
        const { checkPermission, isInitialized } = usePermissionCheck();

        if (!isInitialized) {
            return null; // Don't render until permissions are loaded
        }

        // Check if user has required permissions
        const hasRequiredPermissions = Array.isArray(requiredPermissions)
            ? requiredPermissions.every(({ objectName, permissionType }) =>
                checkPermission(objectName, permissionType)
            )
            : checkPermission(requiredPermissions.objectName, requiredPermissions.permissionType);

        if (!hasRequiredPermissions) {
            return null; // Don't render if user doesn't have permissions
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
    requireAll = true
}) => {
    const { checkPermission, checkMultiplePermissions, checkAnyPermission, isInitialized } = usePermissionCheck();

    if (!isInitialized) {
        return fallback;
    }

    let hasPermission = false;

    if (Array.isArray(requiredPermissions)) {
        hasPermission = requireAll
            ? checkMultiplePermissions(requiredPermissions)
            : checkAnyPermission(requiredPermissions);
    } else {
        hasPermission = checkPermission(
            requiredPermissions.objectName,
            requiredPermissions.permissionType
        );
    }

    return hasPermission ? children : fallback;
}; 