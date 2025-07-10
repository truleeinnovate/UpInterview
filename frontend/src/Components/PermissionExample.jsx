import React from 'react';
import { usePermissionCheck, PermissionGate } from '../utils/permissionUtils';

/**
 * Example component showing different ways to use the optimized permission system
 */
const PermissionExample = () => {
    const { checkPermission, isInitialized, loading } = usePermissionCheck();

    // Don't render anything until permissions are loaded
    if (!isInitialized) {
        return <div>Loading permissions...</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Permission Examples</h2>

            {/* Method 1: Direct permission checking */}
            {checkPermission("Candidates") && (
                <div className="mb-2 p-2 bg-green-100 rounded">
                    ✅ User has Candidates permission
                </div>
            )}

            {/* Method 2: Using PermissionGate component */}
            <PermissionGate
                requiredPermissions={{ objectName: "Positions", permissionType: "ViewTab" }}
                fallback={<div className="mb-2 p-2 bg-red-100 rounded">❌ No Positions permission</div>}
            >
                <div className="mb-2 p-2 bg-green-100 rounded">
                    ✅ User has Positions permission
                </div>
            </PermissionGate>

            {/* Method 3: Multiple permissions (require all) */}
            <PermissionGate
                requiredPermissions={[
                    { objectName: "Candidates", permissionType: "ViewTab" },
                    { objectName: "Positions", permissionType: "ViewTab" }
                ]}
                requireAll={true}
                fallback={<div className="mb-2 p-2 bg-red-100 rounded">❌ Missing some permissions</div>}
            >
                <div className="mb-2 p-2 bg-green-100 rounded">
                    ✅ User has both Candidates and Positions permissions
                </div>
            </PermissionGate>

            {/* Method 4: Multiple permissions (require any) */}
            <PermissionGate
                requiredPermissions={[
                    { objectName: "Interviews", permissionType: "ViewTab" },
                    { objectName: "MockInterviews", permissionType: "ViewTab" },
                    { objectName: "InterviewTemplates", permissionType: "ViewTab" }
                ]}
                requireAll={false}
                fallback={<div className="mb-2 p-2 bg-red-100 rounded">❌ No interview-related permissions</div>}
            >
                <div className="mb-2 p-2 bg-green-100 rounded">
                    ✅ User has at least one interview-related permission
                </div>
            </PermissionGate>

            {/* Method 5: Create permission */}
            {checkPermission("Candidates", "Create") && (
                <div className="mb-2 p-2 bg-blue-100 rounded">
                    ✅ User can create candidates
                </div>
            )}

            {/* Method 6: Edit permission */}
            {checkPermission("Positions", "Edit") && (
                <div className="mb-2 p-2 bg-blue-100 rounded">
                    ✅ User can edit positions
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="mb-2 p-2 bg-yellow-100 rounded">
                    🔄 Loading permissions...
                </div>
            )}
        </div>
    );
};

export default PermissionExample; 