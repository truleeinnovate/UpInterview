// // v1.0.0  -  mansoor  -  added skeleton structure loading
// // v1.0.1  -  Ashraf  -  create new role path fixed
// // v1.0.2  -  Ashok   -  added font semibold for view more button
// // v1.0.3  -  Ashraf  -  optimized to prevent main page reload on edit/view navigation

// import { useEffect, useState, useMemo } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { EditButton } from './Buttons';
// import { Outlet, useNavigate } from 'react-router-dom';
// import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
// import { config } from '../../../../../config';
// import { useRolesQuery } from '../../../../../apiHooks/useRoles.js';
// import { usePermissions } from '../../../../../Context/PermissionsContext.js';
// import PermissionDisplay from './PermissionDisplay';
// import { formatWithSpaces, sortPermissions } from '../../../../../utils/RoleUtils';
// import AuthCookieManager from '../../../../../utils/AuthCookieManager/AuthCookieManager';
// import ErrorState from '../../../../../Components/LoadingStates/ErrorState';
// import EmptyState from '../../../../../Components/LoadingStates/EmptyState';

// const Role = () => {
//   const authToken = Cookies.get('authToken');
//   const tokenPayload = decodeJwt(authToken);
//   const tenantId = useMemo(() => tokenPayload.tenantId, [authToken]);
//   const userType = useMemo(() => AuthCookieManager.getUserType(), [authToken]);

//   const { effectivePermissions, superAdminPermissions } = usePermissions();
//   const permissions = userType === 'superAdmin' ? superAdminPermissions : effectivePermissions;
//   const permissionKey = 'Roles';

//   const { data: filteredRoles, isLoading, isError, error } = useRolesQuery({
//     fetchAllRoles: true,
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//     refetchOnWindowFocus: false, // Prevent refetch on focus
//     refetchOnMount: false, // Prevent refetch on mount if cached
//   });

//   const [roles, setRoles] = useState([]);
//   const [isProcessingOverrides, setIsProcessingOverrides] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!filteredRoles) return;

//     const fetchRoleOverrides = async () => {
//       setIsProcessingOverrides(true);
//       try {
//         const rolesWithOverrides = await Promise.all(
//           filteredRoles.map(async (role) => {
//             if (userType === 'superAdmin') {
//               return {
//                 ...role,
//                 level: role.level ?? 0,
//                 objects: role.objects.map((obj) => ({
//                   ...obj,
//                   permissions: sortPermissions(obj.permissions),
//                 })),
//               };
//             }
//             try {
//               const overrideResponse = await axios.get(
//                 `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`,
//                 { validateStatus: (status) => status < 500 } // Handle 404 gracefully
//               );
//               const override = overrideResponse.data;

//               if (override && overrideResponse.status !== 404) {
//                 const overrideObjectsMap = new Map(
//                   override.objects?.map((obj) => [obj.objectName, obj.permissions]) || []
//                 );
//                 const roleObjectsMap = new Map(
//                   role.objects.map((obj) => [obj.objectName, obj.permissions])
//                 );

//                 const mergedObjects = Array.from(
//                   new Map([...roleObjectsMap, ...overrideObjectsMap]).entries()
//                 ).map(([objectName, permissions]) => ({
//                   objectName,
//                   permissions: sortPermissions(permissions),
//                   visibility: role.objects.find((o) => o.objectName === objectName)?.visibility || 'view_all',
//                   type: role.roleType,
//                 }));

//                 return {
//                   ...role,
//                   level: override.level ?? role.level ?? 0,
//                   objects: mergedObjects,
//                   inherits: override.inherits || role.inherits || [],
//                 };
//               }
//               return {
//                 ...role,
//                 level: role.level ?? 0,
//                 objects: role.objects.map((obj) => ({
//                   ...obj,
//                   permissions: sortPermissions(obj.permissions),
//                 })),
//               };
//             } catch (error) {
//               console.error(`Error fetching override for role ${role.roleName}:`, error);
//               return {
//                 ...role,
//                 level: role.level ?? 0,
//                 objects: role.objects.map((obj) => ({
//                   ...obj,
//                   permissions: sortPermissions(obj.permissions),
//                 })),
//               };
//             }
//           })
//         );
//         setRoles(rolesWithOverrides);
//       } catch (err) {
//         console.error('Error processing role overrides:', err);
//       } finally {
//         setIsProcessingOverrides(false);
//       }
//     };

//     fetchRoleOverrides();
//   }, [filteredRoles, tenantId, userType]);

//   // Skeleton Loading Component for Roles
//   const RoleSkeleton = () => {
//     return (
//       <div className="space-y-6 mb-4">
//         <div className="flex justify-between items-center mt-3 px-3">
//           <div className="h-6 bg-gray-200 skeleton-animation rounded w-48"></div>
//           <div className="h-8 bg-gray-200 skeleton-animation rounded w-24"></div>
//         </div>
//         <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
//           <div className="flex justify-between items-center mb-4">
//             <div className="h-6 bg-gray-200 skeleton-animation rounded w-32"></div>
//             <div className="h-4 bg-gray-200 skeleton-animation rounded w-24"></div>
//           </div>
//           <div className="space-y-6">
//             {[1, 2, 3].map((index) => (
//               <div key={index} className="bg-white p-5 rounded-lg shadow">
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <div className="h-5 bg-gray-200 skeleton-animation rounded w-32"></div>
//                       <div className="h-4 bg-gray-200 skeleton-animation rounded w-16"></div>
//                     </div>
//                     <div className="h-4 bg-gray-200 skeleton-animation rounded w-64 mb-2"></div>
//                   </div>
//                   <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
//                 </div>
//                 <div className="mt-4">
//                   <div className="h-5 bg-gray-200 skeleton-animation rounded w-24 mb-3"></div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {[1, 2, 3].map((permIndex) => (
//                       <div key={permIndex} className="space-y-2">
//                         <div className="h-4 bg-gray-200 skeleton-animation rounded w-20"></div>
//                         <div className="space-y-1">
//                           {[1, 2, 3].map((itemIndex) => (
//                             <div key={itemIndex} className="flex items-center">
//                               <div className="h-3 w-3 bg-gray-200 skeleton-animation rounded mr-2"></div>
//                               <div className="h-3 bg-gray-200 skeleton-animation rounded w-16"></div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return <RoleSkeleton />;
//   }

//   if (isError) {
//     return (
//       <ErrorState
//         title="Failed to load roles"
//         message={error?.message || 'Something went wrong while loading roles'}
//         onRetry={() => window.location.reload()}
//         retryText="Try Again"
//       />
//     );
//   }

//   if (isProcessingOverrides) {
//     return <RoleSkeleton />;
//   }

//   if (!roles || roles.length === 0) {
//     return (
//       <EmptyState
//         title="No roles found"
//         message="There are no roles configured for your organization."
//         actionText={permissions?.Roles?.Create ? "Create First Role" : undefined}
//         onAction={permissions?.Roles?.Create ? () => navigate('/account-settings/roles/create') : undefined}
//         icon="📋"
//       />
//     );
//   }

//   const renderRoleCard = (role) => {
//     const isAdmin = permissions?.[permissionKey]?.RoleName === 'Admin' && role.roleName === 'Admin';
//     const isAdminRole = role.roleName === 'Admin';
//     const maxRows = 2;
//     const visibleObjects = role.objects
//       ? role.objects.filter((obj) =>
//           userType === 'superAdmin' ? true : obj.visibility === 'view_all'
//         ).slice(0, maxRows)
//       : [];

//     return (
//       <div key={role._id} className="mb-6">
//         <div className="bg-white p-5 rounded-lg shadow">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <h3 className="text-lg font-medium">{role.label}</h3>
//                 <span className="text-xs bg-custom-blue text-white px-2 py-1 rounded-full">
//                   Level {role.level ?? 0}
//                 </span>
//               </div>
//               <p className="text-gray-600 text-sm">{role.description || 'No description available'}</p>
//             </div>
//             {(userType === 'superAdmin' ? permissions?.Roles?.Edit : permissions?.Roles?.Edit && !isAdminRole) && !isAdmin && (
//               <EditButton
//                 onClick={() => {
//                   navigate(`/account-settings/roles/role-edit/${role._id}`, { state: { role, roles } });
//                 }}
//               />
//             )}
//           </div>

//           <div className="mt-4">
//             <h4 className="font-medium mb-2">Permissions</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
//               {visibleObjects.map((obj) => (
//                 <div key={obj.objectName}>
//                   <PermissionDisplay
//                     objectName={obj.objectName}
//                     permissions={obj.permissions}
//                     isExpanded={false}
//                   />
//                 </div>
//               ))}
//             </div>
//             {role.objects &&
//               role.objects.filter((obj) =>
//                 userType === 'superAdmin' ? true : obj.visibility === 'view_all'
//               ).length > maxRows && (
//                 <button
//                   onClick={() =>
//                     navigate(
//                       `/account-settings/roles/view/${role._id}`,
//                       { state: { role, roles } }
//                     )
//                   }
//                   className="mt-4 font-semibold text-custom-blue hover:underline text-sm"
//                 >
//                   View More
//                 </button>
//               )}
//           </div>

//           {userType !== 'superAdmin' && role.inherits && role.inherits.length > 0 && !isAdmin && (
//             <div className="mt-4">
//               <h4 className="font-medium mb-2">Inherits From</h4>
//               <div className="flex flex-wrap gap-2">
//                 {role.inherits.map((inheritedRole) => {
//                   const inheritedRoleId = typeof inheritedRole === 'string' ? inheritedRole : inheritedRole._id;
//                   const foundRole = roles.find((r) => r._id === inheritedRoleId);
//                   const label = foundRole ? foundRole.label : inheritedRoleId;
//                   return (
//                     <span key={inheritedRoleId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
//                       {label}
//                     </span>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="space-y-6 mb-4">
//         <div className="flex justify-between items-center mt-3 px-3">
//           <h2 className="text-lg text-custom-blue font-semibold">Roles & Permissions</h2>
//           {(userType === 'superAdmin' && permissions?.Roles?.Create) && (
//             <button
//               onClick={() => navigate('/account-settings/roles/create')}
//               className="px-4 py-1 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
//             >
//               Create Role
//             </button>
//           )}
//         </div>

//         <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium">Role Hierarchy</h3>
//             <div className="text-sm text-gray-600">
//               {roles.length} roles • Levels {Math.min(...roles.map(r => r.level ?? 0))} - {Math.max(...roles.map(r => r.level ?? 0))}
//             </div>
//           </div>
//           <div className="space-y-2">
//             {roles
//               .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
//               .map((role) => (
//                 <div key={role._id} className="relative">
//                   {renderRoleCard(role)}
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>
//       <Outlet />
//     </>
//   );
// };

// export default Role;

// v1.0.0  -  mansoor  -  added skeleton structure loading
// v1.0.1  -  Ashraf  -  create new role path fixed
// v1.0.2  -  Ashok   -  added font semibold for view more button
// v1.0.3  -  [Your Name]  -  moved override fetching to useRolesQuery, removed unnecessary reloads

import { useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import { EditButton } from './Buttons';
import { Outlet, useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { useRolesQuery } from '../../../../../apiHooks/useRoles.js';
import { usePermissions } from '../../../../../Context/PermissionsContext.js';
import PermissionDisplay from './PermissionDisplay';
import { formatWithSpaces } from '../../../../../utils/RoleUtils';
import AuthCookieManager from '../../../../../utils/AuthCookieManager/AuthCookieManager';
import ErrorState from '../../../../../Components/LoadingStates/ErrorState';
import EmptyState from '../../../../../Components/LoadingStates/EmptyState';

const Role = () => {
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const tenantId = useMemo(() => tokenPayload.tenantId, [authToken]);
  const userType = useMemo(() => AuthCookieManager.getUserType(), [authToken]);

  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const permissions = userType === 'superAdmin' ? superAdminPermissions : effectivePermissions;
  const permissionKey = 'Roles';

  const { data: roles, isLoading, isError, error } = useRolesQuery({
    fetchAllRoles: true,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const navigate = useNavigate();

  // Skeleton Loading Component for Roles
  const RoleSkeleton = () => {
    return (
      <div className="space-y-6 mb-4">
        <div className="flex justify-between items-center mt-3 px-3">
          <div className="h-6 bg-gray-200 skeleton-animation rounded w-48"></div>
          <div className="h-8 bg-gray-200 skeleton-animation rounded w-24"></div>
        </div>
        <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 skeleton-animation rounded w-32"></div>
            <div className="h-4 bg-gray-200 skeleton-animation rounded w-24"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-5 bg-gray-200 skeleton-animation rounded w-32"></div>
                      <div className="h-4 bg-gray-200 skeleton-animation rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 skeleton-animation rounded w-64 mb-2"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
                </div>
                <div className="mt-4">
                  <div className="h-5 bg-gray-200 skeleton-animation rounded w-24 mb-3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((permIndex) => (
                      <div key={permIndex} className="space-y-2">
                        <div className="h-4 bg-gray-200 skeleton-animation rounded w-20"></div>
                        <div className="space-y-1">
                          {[1, 2, 3].map((itemIndex) => (
                            <div key={itemIndex} className="flex items-center">
                              <div className="h-3 w-3 bg-gray-200 skeleton-animation rounded mr-2"></div>
                              <div className="h-3 bg-gray-200 skeleton-animation rounded w-16"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <RoleSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load roles"
        message={error?.message || 'Something went wrong while loading roles'}
        onRetry={() => window.location.reload()}
        retryText="Try Again"
      />
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <EmptyState
        title="No roles found"
        message="There are no roles configured for your organization."
        actionText={permissions?.Roles?.Create ? "Create First Role" : undefined}
        onAction={permissions?.Roles?.Create ? () => navigate('/account-settings/roles/create') : undefined}
        icon="📋"
      />
    );
  }

  const renderRoleCard = (role) => {
    const isAdmin = permissions?.[permissionKey]?.RoleName === 'Admin' && role.roleName === 'Admin';
    const isAdminRole = role.roleName === 'Admin';
    const maxRows = 2;
    const visibleObjects = role.objects
      ? role.objects.filter((obj) =>
          userType === 'superAdmin' ? true : obj.visibility === 'view_all'
        ).slice(0, maxRows)
      : [];

    return (
      <div key={role._id} className="mb-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium">{role.label}</h3>
                <span className="text-xs bg-custom-blue text-white px-2 py-1 rounded-full">
                  Level {role.level ?? 0}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{role.description || 'No description available'}</p>
            </div>
            {(userType === 'superAdmin' ? permissions?.Roles?.Edit : permissions?.Roles?.Edit && !isAdminRole) && !isAdmin && (
              <EditButton
                onClick={() => {
                  navigate(`/account-settings/roles/role-edit/${role._id}`, { state: { role, roles } });
                }}
              />
            )}
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              {visibleObjects.map((obj) => (
                <div key={obj.objectName}>
                  <PermissionDisplay
                    objectName={obj.objectName}
                    permissions={obj.permissions}
                    isExpanded={false}
                  />
                </div>
              ))}
            </div>
            {role.objects &&
              role.objects.filter((obj) =>
                userType === 'superAdmin' ? true : obj.visibility === 'view_all'
              ).length > maxRows && (
                <button
                  onClick={() =>
                    navigate(
                      `/account-settings/roles/view/${role._id}`,
                      { state: { role, roles } }
                    )
                  }
                  className="mt-4 font-semibold text-custom-blue hover:underline text-sm"
                >
                  View More
                </button>
              )}
          </div>

          {userType !== 'superAdmin' && role.inherits && role.inherits.length > 0 && !isAdmin && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Inherits From</h4>
              <div className="flex flex-wrap gap-2">
                {role.inherits.map((inheritedRole) => {
                  const inheritedRoleId = typeof inheritedRole === 'string' ? inheritedRole : inheritedRole._id;
                  const foundRole = roles.find((r) => r._id === inheritedRoleId);
                  const label = foundRole ? foundRole.label : inheritedRoleId;
                  return (
                    <span key={inheritedRoleId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 mb-4">
        <div className="flex justify-between items-center mt-3 px-3">
          <h2 className="text-lg text-custom-blue font-semibold">Roles & Permissions</h2>
          {(userType === 'superAdmin' && permissions?.Roles?.Create) && (
            <button
              onClick={() => navigate('/account-settings/roles/create')}
              className="px-4 py-1 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
            >
              Create Role
            </button>
          )}
        </div>

        <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Role Hierarchy</h3>
            <div className="text-sm text-gray-600">
              {roles.length} roles • Levels {Math.min(...roles.map(r => r.level ?? 0))} - {Math.max(...roles.map(r => r.level ?? 0))}
            </div>
          </div>
          <div className="space-y-2">
            {roles
              .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
              .map((role) => (
                <div key={role._id} className="relative">
                  {renderRoleCard(role)}
                </div>
              ))}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Role;