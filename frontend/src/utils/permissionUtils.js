import { usePermissions } from '../Context/PermissionsContext';

/**
 * Custom hook for optimized permission checking
 * This hook provides cached permission checking to prevent unnecessary re-renders
 */
export const usePermissionCheck = () => {
    const { hasPermission, isInitialized, loading } = usePermissions();

    const checkPermission = (objectName, permissionType = "ViewTab") => {
        if (!isInitialized || loading) return false;
        return hasPermission(objectName, permissionType);
    };

    const checkMultiplePermissions = (permissions) => {
        if (!isInitialized || loading) return false;

        return permissions.every(({ objectName, permissionType = "ViewTab" }) =>
            hasPermission(objectName, permissionType)
        );
    };

    const checkAnyPermission = (permissions) => {
        if (!isInitialized || loading) return false;

        return permissions.some(({ objectName, permissionType = "ViewTab" }) =>
            hasPermission(objectName, permissionType)
        );
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