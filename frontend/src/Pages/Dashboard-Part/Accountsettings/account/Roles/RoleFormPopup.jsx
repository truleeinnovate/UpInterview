/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import classNames from 'classnames';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { X } from 'lucide-react';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';
import { getOrganizationRoles } from '../../../../../apiHooks/useRoles.js';

const formatWithSpaces = (str) => {
  if (!str) return '';
  const formatted = str
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
};

const RoleFormPopup = ({ onSave, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editMode = !!id;
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [formData, setFormData] = useState({
    _id: '',
    label: '',
    roleName: '',
    description: '',
    objects: [],
    level: 5,
    inherits: [],
    tenantId: tenantId,
  });

  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const initialFormDataRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedRoles = await getOrganizationRoles();
        setRoles(fetchedRoles);

        if (editMode) {
          const role = fetchedRoles.find((r) => r._id === id);
          if (!role) {
            throw new Error('Role not found');
          }

          const overrideResponse = await axios.get(
            `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
          );
          const override = overrideResponse.data;

          const overrideObjectsMap = new Map(
            override?.objects?.map((obj) => [obj.objectName, obj.permissions]) || []
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

          const permissionsMap = {};
          mergedObjects.forEach((obj) => {
            permissionsMap[obj.objectName] = Object.keys(obj.permissions);
          });
          setAvailablePermissions(permissionsMap);

          const formData = {
            _id: role._id,
            label: role.label,
            roleName: role.roleName,
            description: role.description || '',
            objects: mergedObjects.map((obj) => ({
              objectName: obj.objectName,
              permissions: Object.entries(obj.permissions)
                .filter(([_, value]) => value === true)
                .map(([key]) => key),
            })),
            level: override?.level ?? role.level,
            inherits: override?.inherits || role.inherits || [],
            tenantId: tenantId,
          };
          setFormData(formData);
          initialFormDataRef.current = JSON.parse(JSON.stringify(formData));
        } else {
          const permissionsMap = {};
          fetchedRoles.forEach((role) => {
            role.objects.forEach((obj) => {
              if (!permissionsMap[obj.objectName]) {
                permissionsMap[obj.objectName] = Object.keys(obj.permissions);
              } else {
                const existingPerms = permissionsMap[obj.objectName];
                const newPerms = Object.keys(obj.permissions).filter(
                  (perm) => !existingPerms.includes(perm)
                );
                permissionsMap[obj.objectName] = [...existingPerms, ...newPerms];
              }
            });
          });
          setAvailablePermissions(permissionsMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [tenantId, id, editMode]);

  const handleLabelChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, '');
    setFormData({
      ...formData,
      label: sanitizedValue,
      roleName: sanitizedValue.replace(/\s+/g, '_'),
    });
  };

  const handlePermissionChange = (objectName, permission) => {
    setFormData((prev) => {
      const updatedObjects = prev.objects.map((obj) => {
        if (obj.objectName === objectName) {
          const currentPerms = obj.permissions || [];
          const updatedPerms = currentPerms.includes(permission)
            ? currentPerms.filter((p) => p !== permission)
            : [...currentPerms, permission];
          return { ...obj, permissions: updatedPerms };
        }
        return obj;
      });

      if (!updatedObjects.some((obj) => obj.objectName === objectName)) {
        updatedObjects.push({ objectName, permissions: [permission] });
      }

      return { ...prev, objects: updatedObjects };
    });
  };

  const handleInheritChange = (roleId) => {
    setFormData((prev) => {
      const updatedInherits = prev.inherits.includes(roleId)
        ? prev.inherits.filter((id) => id !== roleId)
        : [...prev.inherits, roleId];
      return { ...prev, inherits: updatedInherits };
    });
  };

  const availableForInheritance = roles
    .filter((role) => role.level > formData.level)
    .sort((a, b) => a.level - b.level);

  const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);

    try {
      const overrideData = {};
      if (editMode) {
        if (!arraysEqual(formData.inherits, initialFormDataRef.current.inherits)) {
          overrideData.inherits = formData.inherits;
        }

        if (formData.level !== initialFormDataRef.current.level) {
          overrideData.level = formData.level;
        }

        const modifiedObjects = formData.objects.filter((obj) => {
          const initialObj = initialFormDataRef.current.objects.find(
            (o) => o.objectName === obj.objectName
          );
          if (!initialObj) return true;
          return !arraysEqual(obj.permissions, initialObj.permissions);
        });

        if (modifiedObjects.length > 0) {
          overrideData.objects = modifiedObjects.map((obj) => {
            const permissions = {};
            const availablePerms = availablePermissions[obj.objectName] || [];
            availablePerms.forEach((perm) => {
              permissions[perm] = obj.permissions.includes(perm);
            });
            return {
              objectName: obj.objectName,
              permissions,
            };
          });
        }

        if (Object.keys(overrideData).length > 0) {
          overrideData.tenantId = tenantId;
          overrideData.roleName = formData.roleName;

          const overrideResponse = await axios.get(
            `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${formData.roleName}`
          );
          const existingOverride = overrideResponse.data;

          if (existingOverride) {
            const response = await axios.patch(
              `${config.REACT_APP_API_URL}/role-overrides/${existingOverride._id}`,
              overrideData
            );
            console.log('Server response (update):', response.data);
            if (response.data && onSave) {
              onSave(response.data);
            }
          } else {
            const response = await axios.post(
              `${config.REACT_APP_API_URL}/role-overrides`,
              overrideData
            );
            console.log('Server response (create):', response.data);
            if (response.data && onSave) {
              onSave(response.data);
            }
          }
        }
      } else {
        overrideData.tenantId = tenantId;
        overrideData.roleName = formData.roleName;
        overrideData.level = formData.level;
        overrideData.objects = formData.objects.map((obj) => {
          const permissions = {};
          const availablePerms = availablePermissions[obj.objectName] || [];
          availablePerms.forEach((perm) => {
            permissions[perm] = obj.permissions.includes(perm);
          });
          return {
            objectName: obj.objectName,
            permissions,
          };
        });
        overrideData.inherits = formData.inherits;

        const response = await axios.post(
          `${config.REACT_APP_API_URL}/role-overrides`,
          overrideData
        );
        console.log('Server response (create):', response.data);
        if (response.data && onSave) {
          onSave(response.data);
        }
      }

      const roleData = {};
      if (editMode) {
        if (formData.level !== initialFormDataRef.current.level) {
          roleData.level = formData.level;
        }
        if (formData.label !== initialFormDataRef.current.label) {
          roleData.label = formData.label;
        }
        if (formData.description !== initialFormDataRef.current.description) {
          roleData.description = formData.description;
        }
        if (formData.roleName !== initialFormDataRef.current.roleName) {
          roleData.roleName = formData.roleName;
        }

        if (Object.keys(roleData).length > 0) {
          await axios.patch(
            `${config.REACT_APP_API_URL}/roles/${formData._id}`,
            roleData
          );
        }
      } else {
        roleData.label = formData.label;
        roleData.roleName = formData.roleName;
        roleData.description = formData.description;
        roleData.level = formData.level;
        roleData.tenantId = tenantId;
        roleData.objects = formData.objects.map((obj) => {
          const permissions = {};
          const availablePerms = availablePermissions[obj.objectName] || [];
          availablePerms.forEach((perm) => {
            permissions[perm] = obj.permissions.includes(perm);
          });
          return {
            objectName: obj.objectName,
            permissions,
          };
        });
        roleData.roleType = 'organization';

        await axios.post(
          `${config.REACT_APP_API_URL}/roles`,
          roleData
        );
      }

      navigate('/account-settings/roles');
    } catch (error) {
      console.error('Error saving role:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen,
    }
  );

  const toggleFullWidth = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate('/account-settings/roles')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('h-full', {
        'max-w-6xl mx-auto px-6': isFullScreen,
      })}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">
              {editMode ? 'Edit Role' : 'Create New Role'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullWidth}
                className="p-1 rounded-full hover:bg-white/10"
              >
                {isFullScreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              <button onClick={() => navigate('/account-settings/roles')} className="sm:hidden">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-1">
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, level: parseInt(e.target.value) }))
                    }
                    className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    min="1"
                    max="10"
                    required
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Lower numbers have higher authority (1 is highest)
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b pb-6">
              <h3 className="text-base sm:text-lg font-medium mb-4">Role Hierarchy</h3>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Inherits Permissions From</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {availableForInheritance.length > 0 ? (
                    availableForInheritance.map((role) => (
                      <label key={role._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.inherits.includes(role._id)}
                          onChange={() => handleInheritChange(role._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {role.label}
                          <span className="text-gray-500 text-xs ml-2">(Level {role.level})</span>
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No roles with lower authority available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-medium">Permissions</h3>
              <div className="pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.keys(availablePermissions).map((objectName) => (
                    <div key={objectName} className="space-y-2">
                      <h5 className="font-medium">{formatWithSpaces(objectName)}</h5>
                      <div className="space-y-2 grid grid-cols-4">
                        {availablePermissions[objectName].map((perm) => (
                          <label key={perm} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={
                                (formData.objects.find((o) => o.objectName === objectName)
                                  ?.permissions || []).includes(perm)
                              }
                              onChange={() => handlePermissionChange(objectName, perm)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{formatWithSpaces(perm)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end py-2 mt-10 px-4">
              <button
                type="button"
                onClick={() => navigate('/account-settings/roles')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="mx-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200"
              >
                {editMode ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default RoleFormPopup;