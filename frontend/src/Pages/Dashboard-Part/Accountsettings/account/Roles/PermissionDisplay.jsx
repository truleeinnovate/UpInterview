// components/PermissionDisplay.js
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatWithSpaces } from '../../../../../utils/RoleUtils';

const PermissionDisplay = ({ objectName, permissions, isExpanded }) => {
  // Map specific permission names to user-friendly labels
  const permissionLabels = {
    ViewTab: 'Tab View',
    Create: 'Create',
    Edit: 'Edit',
    Delete: 'Delete',
    // Add other mappings as needed
  };

  return (
    <div className="space-y-2">
      <h5 className="font-medium">{formatWithSpaces(objectName)}</h5>
      <div className="space-y-1">
        {Object.entries(permissions).map(([permissionName, value], index) => (
          <div key={index} className="flex items-center text-sm text-gray-600">
            {value ? (
              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span>{permissionLabels[permissionName] || formatWithSpaces(permissionName)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionDisplay;