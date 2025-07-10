/**
 * Migration script to help convert old permission checks to the new optimized system
 * 
 * This script provides functions to help migrate existing components from the old
 * permission system to the new optimized one.
 */

/**
 * Converts old permission check to new format
 * @param {string} oldCheck - The old permission check string
 * @returns {string} - The new permission check format
 */
export const convertPermissionCheck = (oldCheck) => {
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
 * Generates migration suggestions for a component
 * @param {string} componentCode - The component code to analyze
 * @returns {Array} - Array of migration suggestions
 */
export const generateMigrationSuggestions = (componentCode) => {
    const suggestions = [];

    // Find old permission patterns
    const oldPatterns = [
        /effectivePermissions\.\w+\.\w+/g,
        /superAdminPermissions\.\w+\.\w+/g
    ];

    oldPatterns.forEach(pattern => {
        const matches = componentCode.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const converted = convertPermissionCheck(match);
                suggestions.push({
                    old: match,
                    new: converted,
                    description: `Replace "${match}" with "${converted}"`
                });
            });
        }
    });

    return suggestions;
};

/**
 * Example migration for a component
 */
export const migrationExample = `
// OLD CODE:
import { usePermissions } from '../../Context/PermissionsContext';

const MyComponent = () => {
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  
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

// NEW CODE:
import { usePermissionCheck } from '../../utils/permissionUtils';

const MyComponent = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  
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