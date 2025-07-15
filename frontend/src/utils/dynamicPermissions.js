/**
 * Dynamic permission utilities for flexible permission checking
 * 
 * This module provides utilities for working with permissions without hardcoding
 * permission names or assuming uniform permission structures across objects.
 */

import { usePermissions } from '../Context/PermissionsContext';

/**
 * Custom hook for dynamic permission checking
 * Works with any permission structure without hardcoding
 */
export const useDynamicPermissionCheck = () => {
    const { effectivePermissions, superAdminPermissions, isInitialized, loading } = usePermissions();

    /**
     * Check if user has permission for a specific object and permission type
     * @param {string} objectName - The permission object name
     * @param {string} permissionType - The permission type (optional, defaults to checking if object exists)
     * @returns {boolean} - Whether the user has the permission
     */
    const checkPermission = (objectName, permissionType = null) => {
        if (!isInitialized || loading) return false;

        // Get current permissions based on user type
        const currentPermissions = superAdminPermissions || effectivePermissions;
        
        if (!currentPermissions || !currentPermissions[objectName]) {
            return false;
        }

        const objectPermissions = currentPermissions[objectName];

        // If no permission type specified, check if object exists and has any permissions
        if (!permissionType) {
            return typeof objectPermissions === 'boolean' 
                ? objectPermissions 
                : Object.keys(objectPermissions).length > 0;
        }

        // Check specific permission type
        if (typeof objectPermissions === 'boolean') {
            return objectPermissions;
        }

        return objectPermissions[permissionType] ?? false;
    };

    /**
     * Get all available permission objects for the current user
     * @returns {Array} - Array of object names the user has access to
     */
    const getAvailableObjects = () => {
        if (!isInitialized || loading) return [];

        const currentPermissions = superAdminPermissions || effectivePermissions;
        return currentPermissions ? Object.keys(currentPermissions) : [];
    };

    /**
     * Get all permission types for a specific object
     * @param {string} objectName - The permission object name
     * @returns {Array} - Array of permission types available for the object
     */
    const getObjectPermissionTypes = (objectName) => {
        if (!isInitialized || loading) return [];

        const currentPermissions = superAdminPermissions || effectivePermissions;
        const objectPermissions = currentPermissions?.[objectName];

        if (!objectPermissions) return [];

        if (typeof objectPermissions === 'boolean') {
            return ['access'];
        }

        return Object.keys(objectPermissions);
    };

    /**
     * Check if user has any of the specified permissions
     * @param {Array} permissions - Array of permission objects
     * @returns {boolean} - Whether user has any of the permissions
     */
    const checkAnyPermission = (permissions) => {
        if (!isInitialized || loading) return false;

        return permissions.some(({ objectName, permissionType }) =>
            checkPermission(objectName, permissionType)
        );
    };

    /**
     * Check if user has all of the specified permissions
     * @param {Array} permissions - Array of permission objects
     * @returns {boolean} - Whether user has all permissions
     */
    const checkAllPermissions = (permissions) => {
        if (!isInitialized || loading) return false;

        return permissions.every(({ objectName, permissionType }) =>
            checkPermission(objectName, permissionType)
        );
    };

    /**
     * Get the complete permission structure for debugging/development
     * @returns {Object} - Complete permission structure
     */
    const getPermissionStructure = () => {
        if (!isInitialized || loading) return {};

        const currentPermissions = superAdminPermissions || effectivePermissions;
        return currentPermissions || {};
    };

    return {
        checkPermission,
        getAvailableObjects,
        getObjectPermissionTypes,
        checkAnyPermission,
        checkAllPermissions,
        getPermissionStructure,
        isInitialized,
        loading
    };
};

/**
 * Higher-order component for dynamic permission-based rendering
 */
export const withDynamicPermission = (WrappedComponent, requiredPermissions) => {
    return (props) => {
        const { checkPermission, checkAllPermissions, isInitialized } = useDynamicPermissionCheck();

        if (!isInitialized) {
            return null;
        }

        const hasRequiredPermissions = Array.isArray(requiredPermissions)
            ? checkAllPermissions(requiredPermissions)
            : checkPermission(requiredPermissions.objectName, requiredPermissions.permissionType);

        if (!hasRequiredPermissions) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};

/**
 * Dynamic permission-based conditional rendering component
 */
export const DynamicPermissionGate = ({
    children,
    requiredPermissions,
    fallback = null,
    requireAll = true
}) => {
    const { 
        checkPermission, 
        checkAllPermissions, 
        checkAnyPermission, 
        isInitialized 
    } = useDynamicPermissionCheck();

    if (!isInitialized) {
        return fallback;
    }

    let hasPermission = false;

    if (Array.isArray(requiredPermissions)) {
        hasPermission = requireAll
            ? checkAllPermissions(requiredPermissions)
            : checkAnyPermission(requiredPermissions);
    } else {
        hasPermission = checkPermission(
            requiredPermissions.objectName,
            requiredPermissions.permissionType
        );
    }

    return hasPermission ? children : fallback;
};

/**
 * Utility to convert old permission checks to new dynamic format
 * This is for backward compatibility only
 */
export const convertOldPermissionCheck = (oldCheck) => {
    // Common patterns to convert
    const patterns = [
        // effectivePermissions.ObjectName?.ViewTab
        {
            regex: /effectivePermissions\.(\w+)\.ViewTab/,
            replacement: 'checkPermission("$1")'
        },
        // effectivePermissions.ObjectName?.Create
        {
            regex: /effectivePermissions\.(\w+)\.Create/,
            replacement: 'checkPermission("$1", "Create")'
        },
        // effectivePermissions.ObjectName?.Edit
        {
            regex: /effectivePermissions\.(\w+)\.Edit/,
            replacement: 'checkPermission("$1", "Edit")'
        },
        // effectivePermissions.ObjectName?.Delete
        {
            regex: /effectivePermissions\.(\w+)\.Delete/,
            replacement: 'checkPermission("$1", "Delete")'
        },
        // superAdminPermissions.ObjectName?.ViewTab
        {
            regex: /superAdminPermissions\.(\w+)\.ViewTab/,
            replacement: 'checkPermission("$1")'
        },
        // superAdminPermissions.ObjectName?.Create
        {
            regex: /superAdminPermissions\.(\w+)\.Create/,
            replacement: 'checkPermission("$1", "Create")'
        }
    ];

    let converted = oldCheck;
    patterns.forEach(pattern => {
        converted = converted.replace(pattern.regex, pattern.replacement);
    });

    return converted;
};

/**
 * Example usage of the dynamic permission system
 */
export const usageExample = `
// OLD APPROACH (hardcoded):
import { usePermissions } from '../../Context/PermissionsContext';

const MyComponent = () => {
  const { effectivePermissions } = usePermissions();
  
  return (
    <div>
      {effectivePermissions.Candidates?.ViewTab && (
        <div>Candidates Tab</div>
      )}
      {effectivePermissions.Positions?.Create && (
        <button>Create Position</button>
      )}
    </div>
  );
};

// NEW APPROACH (dynamic):
import { useDynamicPermissionCheck } from '../../utils/migratePermissions';

const MyComponent = () => {
  const { checkPermission, isInitialized } = useDynamicPermissionCheck();
  
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {checkPermission("Candidates") && (
        <div>Candidates Tab</div>
      )}
      {checkPermission("Positions", "Create") && (
        <button>Create Position</button>
      )}
    </div>
  );
};

// Using PermissionGate:
import { DynamicPermissionGate } from '../../utils/migratePermissions';

const MyComponent = () => {
  return (
    <DynamicPermissionGate requiredPermissions={[
      { objectName: "Candidates", permissionType: "ViewTab" },
      { objectName: "Positions", permissionType: "Create" }
    ]}>
      <div>Protected content</div>
    </DynamicPermissionGate>
  );
};
`;

/**
 * Common permission mappings
 */
export const permissionMappings = {
    // Object names
    'Candidates': 'Candidates',
    'Positions': 'Positions',
    'Interviews': 'Interviews',
    'MockInterviews': 'MockInterviews',
    'InterviewTemplates': 'InterviewTemplates',
    'Assessments': 'Assessments',
    'Assessment_Template': 'Assessment_Template',
    'QuestionBank': 'QuestionBank',
    'Analytics': 'Analytics',
    'SupportDesk': 'SupportDesk',
    'Billing': 'Billing',
    'Wallet': 'Wallet',

    // Permission types
    'ViewTab': 'ViewTab',
    'Create': 'Create',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'View': 'View'
};

/**
 * Validates permission object name and type
 * @param {string} objectName - The permission object name
 * @param {string} permissionType - The permission type
 * @returns {boolean} - Whether the permission is valid
 */
export const validatePermission = (objectName, permissionType = 'ViewTab') => {
    const validObjectNames = Object.keys(permissionMappings);
    const validPermissionTypes = ['ViewTab', 'Create', 'Edit', 'Delete', 'View'];

    return validObjectNames.includes(objectName) && validPermissionTypes.includes(permissionType);
};

/**
 * Gets all valid permission combinations
 * @returns {Array} - Array of valid permission combinations
 */
export const getValidPermissions = () => {
    const validObjectNames = Object.keys(permissionMappings);
    const validPermissionTypes = ['ViewTab', 'Create', 'Edit', 'Delete', 'View'];

    const combinations = [];
    validObjectNames.forEach(objectName => {
        validPermissionTypes.forEach(permissionType => {
            combinations.push({
                objectName,
                permissionType,
                description: `${objectName} - ${permissionType}`
            });
        });
    });

    return combinations;
}; 