import { useEffect, useState } from 'react'
import { CheckIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie'
import { EditButton } from './Buttons'
import { RoleFormPopup } from './RoleFormPopup';
import { Outlet, useNavigate } from 'react-router-dom';

export function Role() {
  const [editingRole, setEditingRole] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [roles, setRoles] = useState([])
   const navigate = useNavigate();
  const tenantId = Cookies.get("organizationId");//67f8af5e82a3a5a4c3866105 import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/rolesdata?tenantId=${tenantId}`
        );
        setRoles(response.data);
        console.log('Fetched roles:', response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, [tenantId]);

  const handleCreateRole = (newRole) => {
    console.log('Create new role:', newRole)
    setIsCreating(false)
    // Refresh roles after creating
    // fetchRoles();
  }

  const handleEditRole = (updatedRole) => {
    console.log('Update role:', updatedRole)
    setEditingRole(null)
    // Refresh roles after updating
    // fetchRoles();
  }

  // const fetchRoles = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${import.meta.env.REACT_APP_API_URL}/rolesdata?organizationId=67f8af5e82a3a5a4c3866105`
  //     );
  //     setRoles(response.data);
  //   } catch (error) {
  //     console.error('Error fetching roles:', error);
  //   }
  // };

  const renderRoleCard = (role) => {
    return (
      <div key={role._id} className="mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{role.label}</h3>
              <p className="text-gray-600">{role.description}</p>
              <p className="text-sm text-gray-500 mt-1">Level: {role.level}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {role.canAssign?.length || 0} Assignable Roles
              </span>
              <EditButton 
               onClick={() =>{
                navigate(`/account-settings/roles/role-edit/${role._id}`)}
          
   }
              // onClick={() => setEditingRole(role)} 
              
              />
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              {role.permissions && Object.entries(role.permissions).map(([category, permissions]) => (
                <div key={category} className="space-y-2">
                  <h5 className="font-medium capitalize">{category}</h5>
                  <div className="space-y-1">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="capitalize">{permission.name || permission.id}</span>
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
                {role.inherits.map(inheritedRole => {
                  // Handle both ID strings and object references
                  const inheritedRoleId = typeof inheritedRole === 'string' ? inheritedRole : inheritedRole._id;
                  let label;
                  
                  if (typeof inheritedRole === 'object' && inheritedRole.label) {
                    // If it's an object with label, use that directly
                    label = inheritedRole.label;
                  } else {
                    // Otherwise look up the role by ID
                    const foundRole = roles.find(r => r._id === inheritedRoleId);
                    label = foundRole ? foundRole.label : inheritedRoleId;
                  }
                  
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
                {role.canAssign.map(assignableRole => {
                  // Handle both ID strings and object references
                  const assignableRoleId = typeof assignableRole === 'string' ? assignableRole : assignableRole._id;
                  let label;
                  
                  if (typeof assignableRole === 'object' && assignableRole.label) {
                    // If it's an object with label, use that directly
                    label = assignableRole.label;
                  } else {
                    // Otherwise look up the role by ID
                    const foundRole = roles.find(r => r._id === assignableRoleId);
                    label = foundRole ? foundRole.label : assignableRoleId;
                  }
                  
                  return (
                    <span key={assignableRoleId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Show inheritance arrows */}
        {role.inherits && role.inherits.length > 0 && (
          <div className="flex justify-center my-4">
            <ArrowDownIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6 mb-4">
      <div className="flex justify-between items-center mt-3 px-3">
        <h2 className="text-lg text-custom-blue font-semibold">Roles & Permissions</h2>
        {/* <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
        >
          Create New Role
        </button> */}
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
     {/* {(editingRole || isCreating) && (
        <RoleFormPopup
          role={editingRole}
          onSave={editingRole ? handleEditRole : handleCreateRole}
          onClose={() => {
            setEditingRole(null)
            setIsCreating(false)
          }}
        />
      )} */}

<Outlet />
    </>
  )
}