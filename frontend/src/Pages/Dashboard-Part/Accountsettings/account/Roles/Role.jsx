// import { useEffect, useState } from 'react';
// import { CheckIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { EditButton } from './Buttons';
// import { Outlet, useNavigate } from 'react-router-dom';
// import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
// import { config } from '../../../../../config';
// import { getOrganizationRoles } from '../../../../../apiHooks/useRoles.js';
// import { usePermissions } from '../../../../../Context/PermissionsContext.js';

// const formatWithSpaces = (str) => {
//   if (!str) return '';
//   const formatted = str
//     .replace(/_/g, ' ')
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
//   return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
// };

// const Role = () => {
//   const { effectivePermissions_RoleName } = usePermissions();
//   const [editingRole, setEditingRole] = useState(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [roles, setRoles] = useState([]);
//   const navigate = useNavigate();
//   const authToken = Cookies.get('authToken');
//   const tokenPayload = decodeJwt(authToken);
//   const tenantId = tokenPayload.tenantId;

//   // Sort permissions: ViewTab, Create, Edit, Delete first, then others alphabetically
//   const sortPermissions = (permissions) => {
//     const priorityOrder = ['ViewTab', 'Create', 'Edit', 'Delete'];
//     const sortedKeys = Object.keys(permissions).sort((a, b) => {
//       const aIndex = priorityOrder.indexOf(a);
//       const bIndex = priorityOrder.indexOf(b);
//       if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
//       if (aIndex !== -1) return -1;
//       if (bIndex !== -1) return 1;
//       return a.localeCompare(b);
//     });
//     return sortedKeys.reduce((acc, key) => {
//       acc[key] = permissions[key];
//       return acc;
//     }, {});
//   };

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const organizationRoles = await getOrganizationRoles();
//         const rolesWithOverrides = await Promise.all(
//           organizationRoles.map(async (role) => {
//             try {
//               const overrideResponse = await axios.get(
//                 `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
//               );
//               const override = overrideResponse.data;

//               if (override) {
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
//                 }));

//                 return {
//                   ...role,
//                   level: override.level ?? role.level,
//                   objects: mergedObjects,
//                   inherits: override.inherits || role.inherits || [],
//                 };
//               }
//               return {
//                 ...role,
//                 objects: role.objects.map((obj) => ({
//                   ...obj,
//                   permissions: sortPermissions(obj.permissions),
//                 })),
//               };
//             } catch (error) {
//               console.error(`Error fetching override for role ${role.roleName}:`, error);
//               return {
//                 ...role,
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
//         console.error('Error fetching roles:', err);
//       }
//     };

//     fetchRoles();
//   }, [tenantId]);

//   const handleCreateRole = (newRole) => {
//     console.log('Create new role:', newRole);
//     setIsCreating(false);
//   };

//   const handleEditRole = (updatedRole) => {
//     console.log('Update role:', updatedRole);
//     setEditingRole(null);
//   };

//   const renderRoleCard = (role) => {
//     const isAdmin = effectivePermissions_RoleName === 'Admin' && role.roleName === 'Admin';
//     const maxRows = 2;
//     // Filter objects to show only those with visibility: 'view_all'
//     const visibleObjects = role.objects
//       ? role.objects
//           .filter((obj) => obj.visibility === 'view_all')
//           .slice(0, maxRows)
//       : [];

//     return (
//       <div key={role._id} className="mb-6">
//         <div className="bg-white p-5 rounded-lg shadow">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <h3 className="text-lg font-medium">{role.label}</h3>
//               <p className="text-gray-600 text-sm">{role.description || 'No description available'}</p>
//               <p className="text-sm text-gray-500 mt-1">Level: {role.level}</p>
//             </div>
//             {!isAdmin && (
//               <EditButton
//                 onClick={() => {
//                   navigate(`/account-settings/roles/role-edit/${role._id}`);
//                 }}
//               />
//             )}
//           </div>

//           <div className="mt-4">
//             <h4 className="font-medium mb-2">Permissions</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
//               {visibleObjects.map((obj) => (
//                 <div key={obj.objectName} className="space-y-2">
//                   <h5 className="font-medium">{formatWithSpaces(obj.objectName)}</h5>
//                   <div className="space-y-1">
//                     {Object.entries(obj.permissions).map(([permissionName, value], index) => (
//                       <div key={index} className="flex items-center text-sm text-gray-600">
//                         {value ? (
//                           <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
//                         ) : (
//                           <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
//                         )}
//                         <span>{formatWithSpaces(permissionName)}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {role.objects && role.objects.filter((obj) => obj.visibility === 'view_all').length > maxRows && (
//               <button
//                 onClick={() => navigate(`/account-settings/roles/view/${role._id}`, { state: { role, roles } })}
//                 className="mt-4 text-custom-blue hover:underline text-sm"
//               >
//                 View More
//               </button>
//             )}
//           </div>

//           {role.inherits && role.inherits.length > 0 && !isAdmin && (
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

//         {role.inherits && role.inherits.length > 0 && !isAdmin && (
//           <div className="flex justify-center my-4">
//             <ArrowDownIcon className="h-6 w-6 text-gray-400" />
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="space-y-6 mb-4">
//         <div className="flex justify-between items-center mt-3 px-3">
//           <h2 className="text-lg text-custom-blue font-semibold">Roles & Permissions</h2>
//         </div>

//         <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
//           <h3 className="text-lg font-medium mb-4">Role Hierarchy</h3>
//           <div className="space-y-2">
//             {roles
//               .sort((a, b) => a.level - b.level)
//               .map((role) => renderRoleCard(role))}
//           </div>
//         </div>
//       </div>
//       <Outlet />
//     </>
//   );
// };

// export default Role;

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { EditButton } from './Buttons';
import { Outlet, useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';
import { getOrganizationRoles } from '../../../../../apiHooks/useRoles.js';
import { usePermissions } from '../../../../../Context/PermissionsContext.js';
import PermissionDisplay from './PermissionDisplay';
import { formatWithSpaces, sortPermissions } from '../../../../../utils/RoleUtils';

const Role = ({ type }) => {
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const permissions = type === 'superAdmin' ? superAdminPermissions : effectivePermissions;
  const permissionKey = type === 'superAdmin' ? 'SuperAdminRole' : 'Roles';
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const organizationRoles = await getOrganizationRoles(type);
        const rolesWithOverrides = await Promise.all(
          organizationRoles.map(async (role) => {
            if (type === 'superAdmin') {
              return {
                ...role,
                level: role.level ?? 0,
                objects: role.objects.map((obj) => ({
                  ...obj,
                  permissions: sortPermissions(obj.permissions),
                })),
              };
            }
            try {
              const overrideResponse = await axios.get(
                `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
              );
              const override = overrideResponse.data;

              if (override) {
                const overrideObjectsMap = new Map(
                  override.objects?.map((obj) => [obj.objectName, obj.permissions]) || []
                );
                const roleObjectsMap = new Map(
                  role.objects.map((obj) => [obj.objectName, obj.permissions])
                );

                const mergedObjects = Array.from(
                  new Map([...roleObjectsMap, ...overrideObjectsMap]).entries()
                ).map(([objectName, permissions]) => ({
                  objectName,
                  permissions: sortPermissions(permissions),
                  visibility: role.objects.find((o) => o.objectName === objectName)?.visibility || 'view_all',
                  type: role.roleType,
                }));

                return {
                  ...role,
                  level: override.level ?? role.level ?? 0,
                  objects: mergedObjects,
                  inherits: override.inherits || role.inherits || [],
                };
              }
              return {
                ...role,
                level: role.level ?? 0,
                objects: role.objects.map((obj) => ({
                  ...obj,
                  permissions: sortPermissions(obj.permissions),
                })),
              };
            } catch (error) {
              console.error(`Error fetching override for role ${role.roleName}:`, error);
              return {
                ...role,
                level: role.level ?? 0,
                objects: role.objects.map((obj) => ({
                  ...obj,
                  permissions: sortPermissions(obj.permissions),
                })),
              };
            }
          })
        );
        setRoles(rolesWithOverrides);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };

    fetchRoles();
  }, [tenantId, type]);

  const renderRoleCard = (role) => {
    const isAdmin = permissions[permissionKey].RoleName === 'Admin' && role.roleName === 'Admin';
    const isAdminRole = role.roleName === 'Admin';
    const maxRows = 2;
    const visibleObjects = role.objects
      ? role.objects.filter((obj) =>
          type === 'superAdmin' ? true : obj.visibility === 'view_all'
        ).slice(0, maxRows)
      : [];

    return (
      <div key={role._id} className="mb-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">{role.label}</h3>
              <p className="text-gray-600 text-sm">{role.description || 'No description available'}</p>
              <p className="text-sm text-gray-500 mt-1">Level: {role.level}</p>
            </div>
            {(type === 'superAdmin' ? permissions.SuperAdminRole?.Edit : permissions.Roles?.Edit && !isAdminRole) && !isAdmin && (
              <EditButton
                onClick={() => {
                  navigate(
                    type === 'superAdmin'
                      ? `/super-admin-account-settings/roles/role-edit/${role._id}`
                      : `/account-settings/roles/role-edit/${role._id}`
                  );
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
                  {type === 'superAdmin' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Visibility: {obj.visibility} | Type: {obj.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {role.objects &&
              role.objects.filter((obj) =>
                type === 'superAdmin' ? true : obj.visibility === 'view_all'
              ).length > maxRows && (
                <button
                  onClick={() =>
                    navigate(
                      type === 'superAdmin'
                        ? `/super-admin-account-settings/roles/view/${role._id}`
                        : `/account-settings/roles/view/${role._id}`,
                      { state: { role, roles } }
                    )
                  }
                  className="mt-4 text-custom-blue hover:underline text-sm"
                >
                  View More
                </button>
              )}
          </div>

          {type !== 'superAdmin' && role.inherits && role.inherits.length > 0 && !isAdmin && (
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
          {(type === 'superAdmin' ? permissions.SuperAdminRole?.Create : permissions.Roles?.Create) && (
            <button
              onClick={() =>
                navigate(
                  type === 'superAdmin'
                    ? '/super-admin-account-settings/roles/role-edit/new'
                    : '/account-settings/roles/role-edit/new'
                )
              }
              className="px-4 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
            >
              Create Role
            </button>
          )}
        </div>

        <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
          <h3 className="text-lg font-medium mb-4">Role Hierarchy</h3>
          <div className="space-y-2">
            {roles
              .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
              .map((role) => renderRoleCard(role))}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Role;