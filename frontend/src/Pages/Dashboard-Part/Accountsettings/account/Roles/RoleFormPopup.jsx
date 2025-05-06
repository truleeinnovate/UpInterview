/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { SidePopup } from './SidePopup'
import classNames from 'classnames';
import Modal from 'react-modal';
import { FaExpand, FaCompress, } from 'react-icons/fa';
import { ReactComponent as FaTimes } from '../../../../../icons/FaTimes.svg';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';

export function RoleFormPopup({ onSave, onClose }) {
  const navigate = useNavigate();
   const { id } = useParams();
  const editMode = !!id;
  const [formData, setFormData] = useState({
    _id:  '',
    label: '',
    roleName:  '',
    description:  '',
    permissions:  {},
    isDefault: false,
    level:  5,
    inherits: [],
    canAssign:  [],
    // organizationId: role?.organizationId || '',
    // reportsToRoleId: role?.reportsToRoleId?._id || role?.reportsToRoleId || ''
  })
  const [permissionCategories, setPermissionCategories] = useState([])
  const [roles, setRoles] = useState([])
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const tenantId = tokenPayload.tenantId;
console.log("tenantId in roleformpopup", tenantId);
 const [isFullScreen, setIsFullScreen] = useState(false);
    
    // useEffect(() => {
    //   const fetchRoles = async () => {
    //     try {
    //       const response = await axios.get(
    //         `${process.env.REACT_APP_API_URL}/rolesdata?organizationId=${organizationId}`
    //       );
    //       const role_data = response.data
    //       const role = role_data.find(role => role._id === id);
    //       setFormData(role);
    //       console.log('Fetched roles:', response.data);
    //     } catch (error) {
    //       console.error('Error fetching roles:', error);
    //     }
    //   };
    //   fetchRoles();
    // }, [organizationId]);

  useEffect(() => {
    const fetchPermissionCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/permissions`)
        const data = response.data
        setPermissionCategories(data)
        
        // If in edit mode, transform the permissions data to match the expected format
        if (editMode && formData?.permissions) {
          const transformedPermissions = {};
          
          // For each permission category in the fetched data
          data.forEach(category => {
            // Check if the role has permissions for this category
            const categoryPermissions = formData.permissions[category.name];
            
            if (categoryPermissions && categoryPermissions.length > 0) {
              // Map permission names/ids to permission _ids for the checkboxes
              const permissionIds = [];
              
              categoryPermissions.forEach(perm => {
                // Find the matching permission in the category
                const matchingPerm = category.permissions.find(p => 
                  p.name === perm.name || p.name === perm.id
                );
                
                if (matchingPerm) {
                  permissionIds.push(matchingPerm._id);
                }
              });
              
              // Store the permission _ids for this category
              if (permissionIds.length > 0) {
                transformedPermissions[category._id] = permissionIds;
              }
            }
          });
          
          // Update the formData with the transformed permissions
          setFormData(prev => ({
            ...prev,
            permissions: transformedPermissions
          }));
          
          console.log('Transformed permissions for edit mode:', transformedPermissions);
        }
      } catch (error) {
        console.error('Failed to fetch permission categories:', error)
      }
    }


    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/rolesdata?tenantId=${tenantId}`
        )
        const role_data = response.data
        setRoles(role_data)


        const role = role_data.find(role => role._id === id);
        setFormData(role);

      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }

    fetchPermissionCategories()
    fetchRoles()
  }, [editMode, tenantId])

  // Handle label change and update name
  const handleLabelChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "");
    setFormData({
      ...formData,
      label: sanitizedValue,
      roleName: sanitizedValue.replace(/\s+/g, "_")
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the data being sent to help debug
    console.log('Submitting form data:', formData);
    
    try {
      // Transform permissions to store only name, not _id (for both create and edit modes)
      const transformedPermissions = {};
      if (formData.permissions && typeof formData.permissions === 'object') {
      Object.entries(formData.permissions).forEach(([catId, permIds]) => {
        // Find the category object
        const category = permissionCategories.find(cat => cat._id === catId);
        if (!category) return;
        // Use category.name as the key
        transformedPermissions[category.name] = permIds.map(permId => {
          const perm = category.permissions.find(p => p._id === permId || p.id === permId);
          return perm ? { name: perm.name } : null;
        }).filter(Boolean);
      });
    }
      
      // Create the data object to send
      const dataToSend = {
        ...formData,
        permissions: transformedPermissions
      };
      
      // Remove _id field when creating a new role to avoid MongoDB validation error
      if (!editMode) {
        delete dataToSend._id;
      }
      
      console.log('Sending transformed data:', dataToSend);
      
      // Handle edit or create based on mode
      if (editMode) {
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/rolesdata/${formData._id}`, dataToSend);
        console.log('Server response (edit):', response.data);
        if (response.data) {
          // onSave(response.data);
          // navigate('/roles');
          navigate('/account-settings/roles')
        }
        return;
      }
      
      // These fields are already set in the dataToSend object above
      // Just ensure they have default values if not already set
      // if (!dataToSend.reportsToRoleId) {
      //   dataToSend.reportsToRoleId = '67f8af5f82a3a5a4c386611d';
      // }
      if (!dataToSend.tenantId) {
        dataToSend.tenantId = tenantId;
      }
      // Convert inherits and canAssign to empty arrays if they're null/undefined
      dataToSend.inherits = dataToSend.inherits || [];
      dataToSend.canAssign = dataToSend.canAssign || [];
      
      console.log('Sending data to API:', dataToSend);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/rolesdata`, dataToSend);
      
      console.log('Server response:', response.data);
      if (response.data) {
        // onSave(response.data);
        // navigate('/roles');
        navigate('/account-settings/roles')
      }
    } catch (error) {
      console.error("Error saving role:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  }

  const handlePermissionChange = (category, permission) => {
    const currentPerms = formData.permissions[category] || []
    const updatedPerms = currentPerms.includes(permission)
      ? currentPerms.filter(p => p !== permission)
      : [...currentPerms, permission]

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: updatedPerms
      }
    }))
  }

  const handleInheritChange = (roleId) => {
    const updatedInherits = formData.inherits.includes(roleId)
      ? formData.inherits.filter(id => id !== roleId)
      : [...formData.inherits, roleId]

    setFormData(prev => ({
      ...prev,
      inherits: updatedInherits
    }))
  }

  // const handleAssignableChange = (roleId) => {
  //   const updatedAssignable = formData.canAssign.includes(roleId)
  //     ? formData.canAssign.filter(id => id !== roleId)
  //     : [...formData.canAssign, roleId]

  //   setFormData(prev => ({
  //     ...prev,
  //     canAssign: updatedAssignable
  //   }))
  // }

  const availableForInheritance = roles
    .filter(role => role.level > formData.level)
    .sort((a, b) => a.level - b.level)

  
  // const availableForAssignment = roles
  //   .filter(role => role.level > formData.level)
  //   .sort((a, b) => a.level - b.level)

    const modalClass = classNames(
      'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
      {
        'inset-0': isFullScreen,
        'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
      }
    );

  return (
    // <SidePopup
    //   title={id ? 'Edit Role' : 'Create New Role'}
    //   // onClose={onClose}
    //   position="right"
    //   size="medium"
    // >
        <Modal
        isOpen={true}
        onRequestClose={() => navigate('/account-settings/roles')}
          className={modalClass}
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
        // className={modalClass}
        >
            <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
          
           <div className="p-6">

             <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-custom-blue ">{id ? 'Edit Role' : 'Create New Role'}</h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            // className="p-2  rounded-lg transition-colors"
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {isFullScreen ? (
                              <FaCompress className="w-5 h-5 text-gray-500" />
                            ) : (
                              <FaExpand className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              navigate('/account-settings/roles')
                              // setUserData(formData)
                              // setIsBasicModalOpen(false);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FaTimes className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-base sm:text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={handleLabelChange}
                className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={formData.roleName}
                className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 min-h-[100px] resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hierarchy Level
              </label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
              
                // className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="10"
                required
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Lower numbers have higher authority (1 is highest)</p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Set as default role</span>
              </label>
            </div>
          </div>
        </div>

        {/* Role Hierarchy Section */}
        <div className="mb-8 border-b pb-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">Role Hierarchy</h3>
          
          {/* Inherits From */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Inherits Permissions From</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableForInheritance?.map((role) => (
                <label key={role._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.inherits.includes(role._id)}
                    onChange={() => handleInheritChange(role._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {role.roleName}
                    <span className="text-gray-500 text-xs ml-2">(Level {role.level})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Can Assign Roles */}{/* we can use this in future and functionality is added and selected roles Id's are saved in database */}
          {/* <div>
            <h4 className="font-medium mb-2">Can Assign Roles</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableForAssignment.map((role) => (
                <label key={role._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.canAssign.includes(role._id)}
                    onChange={() => handleAssignableChange(role._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {role.roleName}
                    <span className="text-gray-500 text-xs ml-2">(Level {role.level})</span>
                  </span>
                </label>
              ))}
            </div>
          </div> */}
        </div>

        {/* Permissions Section */}
        <div className="space-y-6">
          <h3 className="text-base sm:text-lg font-medium">Permissions</h3>
          
          {/* General Permissions */}
          <div className="pb-6">
            <h4 className="font-medium mb-4">General Permissions</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {permissionCategories?.map(category => (
                <div key={category._id} className="space-y-2">
                  <h5 className="font-medium">{category.name}</h5>
                  <div className="space-y-2 grid grid-cols-4">
                    {category.permissions?.map(permission => (
                      <label key={permission._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.permissions[category._id] || []).includes(permission._id)}
                          onChange={() => handlePermissionChange(category._id, permission._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex sm:flex-col flex-row justify-end  sticky bottom-0 gap-3 bg-white p-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/account-settings/roles')}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 text-sm font-medium"
          >
            {id ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </form>

      </div>
      </div>
      </Modal>
    // </SidePopup>
  )
}