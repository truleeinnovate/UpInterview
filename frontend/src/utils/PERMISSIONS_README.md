# Optimized Permission System

This document explains the optimized permission system that eliminates loading delays when clicking tabs and provides efficient permission checking.

## Key Improvements

### 1. **Caching System**
- Permissions are cached in localStorage for 5 minutes
- Prevents unnecessary API calls on every tab click
- Automatically refreshes when tokens change

### 2. **Non-Blocking Loading**
- Removed the blocking loading screen
- App renders immediately with cached permissions
- Permissions load in the background

### 3. **Optimized Permission Checking**
- Single `hasPermission` function for all permission checks
- Memoized context value to prevent unnecessary re-renders
- Efficient permission lookup

## Usage

### Basic Permission Checking

```jsx
import { usePermissionCheck } from '../utils/permissionUtils';

const MyComponent = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {checkPermission("Candidates") && (
        <div>User can view candidates</div>
      )}
      
      {checkPermission("Positions", "Create") && (
        <div>User can create positions</div>
      )}
    </div>
  );
};
```

### Using PermissionGate Component

```jsx
import { PermissionGate } from '../utils/permissionUtils';

const MyComponent = () => {
  return (
    <div>
      {/* Single permission */}
      <PermissionGate 
        requiredPermissions={{ objectName: "Candidates", permissionType: "ViewTab" }}
        fallback={<div>No permission</div>}
      >
        <div>User has Candidates permission</div>
      </PermissionGate>

      {/* Multiple permissions (require all) */}
      <PermissionGate 
        requiredPermissions={[
          { objectName: "Candidates", permissionType: "ViewTab" },
          { objectName: "Positions", permissionType: "ViewTab" }
        ]}
        requireAll={true}
      >
        <div>User has both permissions</div>
      </PermissionGate>

      {/* Multiple permissions (require any) */}
      <PermissionGate 
        requiredPermissions={[
          { objectName: "Interviews", permissionType: "ViewTab" },
          { objectName: "MockInterviews", permissionType: "ViewTab" }
        ]}
        requireAll={false}
      >
        <div>User has at least one interview permission</div>
      </PermissionGate>
    </div>
  );
};
```

### Using Higher-Order Component

```jsx
import { withPermission } from '../utils/permissionUtils';

const MyComponent = ({ data }) => {
  return <div>Protected content: {data}</div>;
};

// Wrap component with permission check
const ProtectedComponent = withPermission(MyComponent, {
  objectName: "Candidates",
  permissionType: "ViewTab"
});

// Usage
<ProtectedComponent data="some data" />
```

## Permission Types

Common permission types:
- `ViewTab` - Can view the tab/page
- `Create` - Can create new items
- `Edit` - Can edit existing items
- `Delete` - Can delete items
- `View` - Can view specific items

## Object Names

Common object names:
- `Candidates` - Candidate management
- `Positions` - Position management
- `Interviews` - Interview management
- `MockInterviews` - Mock interview management
- `InterviewTemplates` - Interview templates
- `Assessments` - Assessment management
- `QuestionBank` - Question bank
- `Analytics` - Analytics and reports
- `SupportDesk` - Support desk
- `Billing` - Billing management
- `Wallet` - Wallet management

## Migration Guide

### From Old System

**Before:**
```jsx
const { effectivePermissions, superAdminPermissions } = usePermissions();

// Check permission
if (effectivePermissions.Candidates?.ViewTab) {
  // render content
}
```

**After:**
```jsx
const { checkPermission } = usePermissionCheck();

// Check permission
if (checkPermission("Candidates")) {
  // render content
}
```

### Benefits

1. **No Loading Delays**: Permissions are cached and load instantly
2. **Better Performance**: No unnecessary re-renders
3. **Cleaner Code**: Single function for all permission checks
4. **Type Safety**: Consistent permission checking pattern
5. **Automatic Cache Management**: Handles cache invalidation automatically

## Cache Management

The system automatically:
- Caches permissions for 5 minutes
- Clears cache when auth tokens change
- Refreshes cache when needed
- Handles cache errors gracefully

## Error Handling

The system handles:
- Network errors gracefully
- Invalid cached data
- Missing permissions
- Token expiration

## Performance Tips

1. Use `checkPermission` instead of accessing `effectivePermissions` directly
2. Use `PermissionGate` for conditional rendering
3. Check `isInitialized` before rendering permission-dependent content
4. Use `withPermission` HOC for reusable protected components 