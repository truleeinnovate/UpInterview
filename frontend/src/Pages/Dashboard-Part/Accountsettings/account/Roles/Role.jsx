import { useEffect, useState } from 'react';
import { CheckIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import { EditButton } from './Buttons';
import RoleFormPopup from './RoleFormPopup';
import { Outlet, useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';
import { getOrganizationRoles } from '../../../../../apiHooks/useRoles.js';

const Role = () => {
  const [editingRole, setEditingRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const organizationRoles = await getOrganizationRoles();
        // Fetch RoleOverrides for each role
        const rolesWithOverrides = await Promise.all(
          organizationRoles.map(async (role) => {
            try {
              const overrideResponse = await axios.get(
                `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
              );
              const override = overrideResponse.data;

              if (override) {
                // Merge objects: prioritize RoleOverrides.objects, include RolesPermissionObject.objects for non-overridden objects
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
                  permissions,
                }));

                return {
                  ...role,
                  level: override.level ?? role.level,
                  objects: mergedObjects,
                  inherits: override.inherits || role.inherits || [],
                };
              }
              return role;
            } catch (error) {
              console.error(`Error fetching override for role ${role.roleName}:`, error);
              return role;
            }
          })
        );
        setRoles(rolesWithOverrides);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };

    fetchRoles();
  }, [tenantId]);

  const handleCreateRole = (newRole) => {
    console.log('Create new role:', newRole);
    setIsCreating(false);
  };

  const handleEditRole = (updatedRole) => {
    console.log('Update role:', updatedRole);
    setEditingRole(null);
  };

  const renderRoleCard = (role) => {
    return (
      <div key={role._id} className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{role.label}</h3>
              <p className="text-gray-600">{role.description || 'No description available'}</p>
              <p className="text-sm text-gray-500 mt-1">Level: {role.level}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-custom-blue/10 text-custom-blue rounded-full text-sm">
                {role.inherits?.length || 0} Inherited Roles
              </span>
              <EditButton
                onClick={() => {
                  navigate(`/account-settings/roles/role-edit/${role._id}`);
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              {role.objects && role.objects.map((obj) => (
                <div key={obj.objectName} className="space-y-2">
                  <h5 className="font-medium capitalize">{obj.objectName}</h5>
                  <div className="space-y-1">
                    {Object.entries(obj.permissions).map(([permissionName, value], index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        {value ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="capitalize">{permissionName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {role.inherits && role.inherits.length > 0 && (
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

          {role.canAssign && role.canAssign.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Can Assign</h4>
              <div className="flex flex-wrap gap-2">
                {role.canAssign.map((assignableRole) => {
                  const assignableRoleId = typeof assignableRole === 'string' ? assignableRole : assignableRole._id;
                  const foundRole = roles.find((r) => r._id === assignableRoleId);
                  const label = foundRole ? foundRole.label : assignableRoleId;
                  return (
                    <span key={assignableRoleId} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {role.inherits && role.inherits.length > 0 && (
          <div className="flex justify-center my-4">
            <ArrowDownIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 mb-4">
        <div className="flex justify-between items-center mt-3 px-3">
          <h2 className="text-lg text-custom-blue font-semibold">Roles & Permissions</h2>
        </div>

        {/* Role Hierarchy */}
        <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
          <h3 className="text-lg font-medium mb-4">Role Hierarchy</h3>
          <div className="space-y-2">
            {roles
              .sort((a, b) => a.level - b.level)
              .map(role => renderRoleCard(role))}
          </div>
        </div>
      </div>
      {/* Role Form Popup */}
      {(editingRole || isCreating) && (
        <RoleFormPopup
          role={editingRole}
          onSave={editingRole ? handleEditRole : handleCreateRole}
          onClose={() => {
            setEditingRole(null);
            setIsCreating(false);
          }}
        />
      )}

      <Outlet />
    </>
  );
};

export default Role;