// v1.0.0  -  Ashraf  -  edit is not working
// v1.0.1  -  Ashraf  -  super admin and non super admin edit and create role issues fixed
// v1.0.2  -  Ashok   -  border b removed
// v1.0.3 - Ashok - Removed border left and set outline as none
// v1.0.4 - Ashok - Improved responsiveness and added common code to popup

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import classNames from "classnames";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../../config";
import { useRolesQuery } from "../../../../../apiHooks/useRoles.js";
import { usePermissions } from "../../../../../Context/PermissionsContext.js";
import {
  formatWithSpaces,
  sortPermissions,
} from "../../../../../utils/RoleUtils.js";
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import Loading from "../../../../../Components/Loading";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";

// Set app element for accessibility
Modal.setAppElement("#root");

const RoleFormPopup = ({ onSave, onClose }) => {
  const {
    data: organizationRoles,
    isLoading,
    isError,
    error,
  } = useRolesQuery();
  const userType = AuthCookieManager.getUserType();

  const {
    effectivePermissions,
    superAdminPermissions,
    isInitialized,
    loading: permissionsLoading,
  } = usePermissions();
  const permissions =
    userType === "superAdmin" ? superAdminPermissions : effectivePermissions;
  const permissionKey = "Roles";
  const navigate = useNavigate();
  const { id } = useParams();
  // Support both '/role-edit/:id' and '/create' paths
  // <-------------------------------v1.0.1
  const editMode = !!id && id !== "create";
  // ------------------------------v1.0.1 >
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;
  const [isFullScreen, setIsFullScreen] = useState(false);

  // v1.0.4 <----------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  // v1.0.4 ---------------------------------------------------------------->

  const [formData, setFormData] = useState({
    _id: "",
    label: "",
    roleName: "",
    description: "",
    objects: [],
    level: 0,
    inherits: [],
    tenantId: tenantId,
    roleType: userType === "superAdmin" ? "internal" : "organization",
  });

  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [newObjectName, setNewObjectName] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionValue, setNewPermissionValue] = useState(true);
  const [newObjectPermissions, setNewObjectPermissions] = useState([]);
  const [newObjectVisibility, setNewObjectVisibility] =
    useState("super_admin_only");
  const [newObjectType, setNewObjectType] = useState("internal");
  const initialFormDataRef = useRef(null);

  // Memoize dependencies to prevent unnecessary re-renders
  const memoizedTenantId = useMemo(() => tenantId, [tenantId]);
  const memoizedId = useMemo(() => id, [id]);
  const memoizedEditMode = useMemo(() => editMode, [editMode]);
  const memoizedUserType = useMemo(() => userType, [userType]);
  const memoizedPermissionKey = useMemo(() => permissionKey, [permissionKey]);

  // Memoize permissions check to prevent unnecessary re-renders
  const hasEditPermission = useMemo(
    () => permissions?.[permissionKey]?.Edit,
    [permissions, permissionKey]
  );
  const hasCreatePermission = useMemo(
    () => permissions?.[permissionKey]?.Create,
    [permissions, permissionKey]
  );

  // useEffect(() => {
  //   // <-------------------------------v1.0.1
  //   // Wait until permissions are loaded and initialized
  //   if (permissionsLoading || !isInitialized) return;
  //   // ------------------------------v1.0.1 >
  //   if (editMode && !hasEditPermission) {
  //     navigate('/account-settings/roles');
  //     return;
  //   }
  //   if (!editMode && !hasCreatePermission) {
  //     navigate('/account-settings/roles');
  //     return;
  //   }

  //   const fetchData = async () => {
  //     try {
  //       // ------------------------------ v1.0.0 >
  //       if (!organizationRoles) {
  //         setRoles([]);
  //         return;
  //       }
  //       setRoles(organizationRoles);

  //       // Build available permissions from all roles
  //       // ------------------------------ v1.0.0 >
  //       const permissionsMap = {};
  //       (organizationRoles || []).forEach((role) => {
  //         // ------------------------------ v1.0.0 >
  //         role.objects.forEach((obj) => {
  //           if (!permissionsMap[obj.objectName]) {
  //             permissionsMap[obj.objectName] = {
  //               permissions: Object.keys(obj.permissions).sort((a, b) => {
  //                 const priorityOrder = ['ViewTab', 'Create', 'Edit', 'Delete'];
  //                 const aIndex = priorityOrder.indexOf(a);
  //                 const bIndex = priorityOrder.indexOf(b);
  //                 if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  //                 if (aIndex !== -1) return -1;
  //                 if (bIndex !== -1) return 1;
  //                 return a.localeCompare(b);
  //               }),
  //               visibility: obj.visibility || 'view_all',
  //               type: role.roleType || 'organization',
  //             };
  //           } else {
  //             const existingPerms = permissionsMap[obj.objectName].permissions;
  //             const newPerms = Object.keys(obj.permissions).filter(
  //               (perm) => !existingPerms.includes(perm)
  //             );
  //             permissionsMap[obj.objectName].permissions = [...existingPerms, ...newPerms].sort((a, b) => {
  //               const priorityOrder = ['ViewTab', 'Create', 'Edit', 'Delete'];
  //               const aIndex = priorityOrder.indexOf(a);
  //               const bIndex = priorityOrder.indexOf(b);
  //               if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  //               if (aIndex !== -1) return -1;
  //               if (bIndex !== -1) return 1;
  //               return a.localeCompare(b);
  //             });
  //           }
  //         });
  //       });

  //       if (editMode) {
  //         const role = organizationRoles.find((r) => r._id === id);
  //         if (!role) {
  //           throw new Error('Role not found');
  //         }
  //         // ------------------------------v1.0.1 >

  //         let mergedObjects;
  //         // <-------------------------------v1.0.1
  //         let inherits = role.inherits || [];
  //         let level = role.level ?? 0;

  //         if (userType !== 'superAdmin') {
  //           const overrideResponse = await axios.get(
  //             `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
  //           );
  //           const override = overrideResponse.data;

  //           if (override) {
  //             // <-------------------------------v1.0.1
  //             // Only use objects present in the base role
  //             mergedObjects = role.objects.map((baseObj) => {
  //               const overrideObj = override.objects?.find((o) => o.objectName === baseObj.objectName);
  //               const mergedPermissions = { ...baseObj.permissions };
  //               if (overrideObj) {
  //                 Object.keys(overrideObj.permissions).forEach((perm) => {
  //                   mergedPermissions[perm] = overrideObj.permissions[perm];
  //                 });
  //               }
  //               return {
  //                 objectName: baseObj.objectName,
  //                 permissions: mergedPermissions,
  //                 visibility: baseObj.visibility || 'view_all',
  //                 type: baseObj.type || role.roleType,
  //               };
  //             });
  //             // Do NOT add objects from override that are not in the base role
  //             inherits = override.inherits || role.inherits || [];
  //             level = override.level ?? role.level ?? 0;
  //           } else {
  //             mergedObjects = role.objects;
  //           }
  //         } else {
  //           mergedObjects = role.objects;
  //         }
  //         // ------------------------------v1.0.1 >

  //         setAvailablePermissions(permissionsMap);

  //         const formData = {
  //           _id: role._id,
  //           label: role.label,
  //           roleName: role.roleName,
  //           description: role.description || '',
  //           objects: mergedObjects.map((obj) => ({
  //             objectName: obj.objectName,
  //             permissions: Object.entries(obj.permissions)
  //               .filter(([_, value]) => value === true)
  //               .map(([key]) => key),
  //             visibility: obj.visibility,
  //             type: obj.type || role.roleType,
  //           })),
  //           level,
  //           inherits,
  //           tenantId: tenantId,
  //           roleType: role.roleType || 'organization',
  //         };
  //         setFormData(formData);
  //         initialFormDataRef.current = JSON.parse(JSON.stringify(formData));
  //       } else {
  //         // For new roles, include all objects as suggestions for super admins
  //         if (userType === 'superAdmin') {
  //           setFormData((prev) => ({
  //             ...prev,
  //             objects: Object.entries(permissionsMap).map(([objectName, data]) => ({
  //               objectName,
  //               permissions: [],
  //               visibility: data.visibility,
  //               type: data.type,
  //             })),
  //           }));
  //         }
  //         setAvailablePermissions(permissionsMap);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   // <-------------------------------v1.0.1
  //   fetchData();
  // }, [memoizedTenantId, memoizedId, memoizedEditMode, memoizedUserType, hasEditPermission, hasCreatePermission, organizationRoles, permissionsLoading, isInitialized]);
  // ------------------------------v1.0.1 >

  useEffect(() => {
    if (permissionsLoading || !isInitialized) return;
    if (editMode && !hasEditPermission) {
      navigate("/account-settings/roles");
      return;
    }
    if (!editMode && !hasCreatePermission) {
      navigate("/account-settings/roles");
      return;
    }

    const fetchData = async () => {
      try {
        if (!organizationRoles) {
          setRoles([]);
          return;
        }
        setRoles(organizationRoles);

        const permissionsMap = {};
        if (editMode) {
          // In edit mode, only include objects from the role being edited
          const role = organizationRoles.find((r) => r._id === id);
          if (!role) {
            throw new Error("Role not found");
          }

          let mergedObjects = role.objects;
          let inherits = role.inherits || [];
          let level = role.level ?? 0;

          if (userType !== "superAdmin") {
            const overrideResponse = await axios.get(
              `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`
            );
            const override = overrideResponse.data;

            if (override) {
              mergedObjects = role.objects
                .filter((baseObj) => {
                  const overrideObj = override.objects?.find(
                    (o) => o.objectName === baseObj.objectName
                  );
                  return (
                    baseObj.visibility !== "super_admin_only" || overrideObj
                  );
                })
                .map((baseObj) => {
                  const overrideObj = override.objects?.find(
                    (o) => o.objectName === baseObj.objectName
                  );
                  const mergedPermissions = { ...baseObj.permissions };
                  if (overrideObj) {
                    Object.keys(overrideObj.permissions).forEach((perm) => {
                      mergedPermissions[perm] = overrideObj.permissions[perm];
                    });
                  }
                  return {
                    objectName: baseObj.objectName,
                    permissions: mergedPermissions,
                    visibility:
                      overrideObj?.visibility ||
                      baseObj.visibility ||
                      "view_all",
                    type: baseObj.type || role.roleType,
                  };
                });
              inherits = override.inherits || role.inherits || [];
              level = override.level ?? role.level ?? 0;
            } else {
              mergedObjects = role.objects.filter(
                (baseObj) => baseObj.visibility !== "super_admin_only"
              );
            }
          }

          // Populate permissionsMap only with objects from the current role
          mergedObjects.forEach((obj) => {
            permissionsMap[obj.objectName] = {
              permissions: Object.keys(obj.permissions).sort((a, b) => {
                const priorityOrder = ["ViewTab", "Create", "Edit", "Delete"];
                const aIndex = priorityOrder.indexOf(a);
                const bIndex = priorityOrder.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
              }),
              visibility: obj.visibility || "view_all",
              type: obj.type || role.roleType,
            };
          });

          setAvailablePermissions(permissionsMap);

          const formData = {
            _id: role._id,
            label: role.label,
            roleName: role.roleName,
            description: role.description || "",
            objects: mergedObjects.map((obj) => ({
              objectName: obj.objectName,
              permissions: Object.entries(obj.permissions)
                .filter(([_, value]) => value === true)
                .map(([key]) => key),
              visibility: obj.visibility,
              type: obj.type || role.roleType,
            })),
            level,
            inherits,
            tenantId: tenantId,
            roleType: role.roleType || "organization",
          };
          setFormData(formData);
          initialFormDataRef.current = JSON.parse(JSON.stringify(formData));
        } else {
          // In create mode, include all objects from all roles for super admins
          (organizationRoles || []).forEach((role) => {
            role.objects.forEach((obj) => {
              if (!permissionsMap[obj.objectName]) {
                permissionsMap[obj.objectName] = {
                  permissions: Object.keys(obj.permissions).sort((a, b) => {
                    const priorityOrder = [
                      "ViewTab",
                      "Create",
                      "Edit",
                      "Delete",
                    ];
                    const aIndex = priorityOrder.indexOf(a);
                    const bIndex = priorityOrder.indexOf(b);
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return a.localeCompare(b);
                  }),
                  visibility: obj.visibility || "view_all",
                  type: role.roleType || "organization",
                };
              } else {
                const existingPerms =
                  permissionsMap[obj.objectName].permissions;
                const newPerms = Object.keys(obj.permissions).filter(
                  (perm) => !existingPerms.includes(perm)
                );
                permissionsMap[obj.objectName].permissions = [
                  ...existingPerms,
                  ...newPerms,
                ].sort((a, b) => {
                  const priorityOrder = ["ViewTab", "Create", "Edit", "Delete"];
                  const aIndex = priorityOrder.indexOf(a);
                  const bIndex = priorityOrder.indexOf(b);
                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                  if (aIndex !== -1) return -1;
                  if (bIndex !== -1) return 1;
                  return a.localeCompare(b);
                });
              }
            });
          });

          if (userType === "superAdmin") {
            setFormData((prev) => ({
              ...prev,
              objects: Object.entries(permissionsMap).map(
                ([objectName, data]) => ({
                  objectName,
                  permissions: [],
                  visibility: data.visibility,
                  type: data.type,
                })
              ),
            }));
          }
          setAvailablePermissions(permissionsMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    memoizedTenantId,
    memoizedId,
    memoizedEditMode,
    memoizedUserType,
    hasEditPermission,
    hasCreatePermission,
    organizationRoles,
    permissionsLoading,
    isInitialized,
  ]);
  const handleLabelChange = useCallback(
    (e) => {
      if (userType !== "superAdmin") return; // Only super admins can edit label
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "");
      setFormData((prev) => ({
        ...prev,
        label: sanitizedValue,
      }));
    },
    [userType]
  );

  const handleRoleNameChange = useCallback(
    (e) => {
      if (userType !== "superAdmin") return; // Only super admins can edit roleName
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
      setFormData((prev) => ({
        ...prev,
        roleName: sanitizedValue,
      }));
    },
    [userType]
  );

  const handlePermissionChange = useCallback(
    (objectName, permission, value) => {
      setFormData((prev) => {
        const updatedObjects = prev.objects.map((obj) => {
          if (obj.objectName === objectName) {
            const currentPerms = obj.permissions || [];
            let updatedPerms = currentPerms;
            if (value === true && !currentPerms.includes(permission)) {
              updatedPerms = [...currentPerms, permission];
            } else if (value === false) {
              updatedPerms = currentPerms.filter((p) => p !== permission);
            }
            return { ...obj, permissions: updatedPerms };
          }
          return obj;
        });

        if (!updatedObjects.some((obj) => obj.objectName === objectName)) {
          updatedObjects.push({
            objectName,
            permissions: value === true ? [permission] : [],
            visibility:
              userType === "superAdmin" ? "super_admin_only" : "view_all",
            type: userType === "superAdmin" ? "internal" : "organization",
          });
        }

        return { ...prev, objects: updatedObjects };
      });
    },
    [userType]
  );

  const handleDeletePermission = useCallback(
    (objectName, permission) => {
      if (userType !== "superAdmin") return; // Only super admins can delete permissions
      setFormData((prev) => ({
        ...prev,
        objects: prev.objects.map((obj) =>
          obj.objectName === objectName
            ? {
                ...obj,
                permissions: obj.permissions.filter((p) => p !== permission),
              }
            : obj
        ),
      }));
      setAvailablePermissions((prev) => ({
        ...prev,
        [objectName]: {
          ...prev[objectName],
          permissions: prev[objectName].permissions.filter(
            (p) => p !== permission
          ),
        },
      }));
    },
    [userType]
  );

  const handleInheritChange = useCallback((roleId) => {
    setFormData((prev) => {
      const updatedInherits = prev.inherits.includes(roleId)
        ? prev.inherits.filter((id) => id !== roleId)
        : [...prev.inherits, roleId];
      return { ...prev, inherits: updatedInherits };
    });
  }, []);

  const handleAddNewObject = () => {
    if (!newObjectName || newObjectName.trim() === "") return;

    const sanitizedObjectName = newObjectName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    if (sanitizedObjectName && !availablePermissions[sanitizedObjectName]) {
      setAvailablePermissions((prev) => ({
        ...prev,
        [sanitizedObjectName]: {
          permissions: newObjectPermissions
            .map((perm) => perm.name)
            .sort((a, b) => {
              const priorityOrder = ["ViewTab", "Create", "Edit", "Delete"];
              const aIndex = priorityOrder.indexOf(a);
              const bIndex = priorityOrder.indexOf(b);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              return a.localeCompare(b);
            }),
          visibility: newObjectVisibility,
          type: newObjectType,
        },
      }));
      setFormData((prev) => ({
        ...prev,
        objects: [
          ...prev.objects,
          {
            objectName: sanitizedObjectName,
            permissions: newObjectPermissions
              .filter((perm) => perm.value)
              .map((perm) => perm.name),
            visibility: newObjectVisibility,
            type: newObjectType,
          },
        ],
      }));
      setNewObjectName("");
      setNewObjectPermissions([]);
      setNewObjectVisibility("super_admin_only");
      setNewObjectType("internal");
    }
  };

  const handleAddNewPermission = () => {
    if (!newPermissionName || newPermissionName.trim() === "") return;

    const sanitizedPermission = newPermissionName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    if (
      sanitizedPermission &&
      !newObjectPermissions.some((perm) => perm.name === sanitizedPermission)
    ) {
      setNewObjectPermissions((prev) => [
        ...prev,
        { name: sanitizedPermission, value: newPermissionValue },
      ]);
      setNewPermissionName("");
      setNewPermissionValue(true);
    }
  };

  const handleToggleNewPermissionValue = (permName) => {
    setNewObjectPermissions((prev) =>
      prev.map((perm) =>
        perm.name === permName ? { ...perm, value: !perm.value } : perm
      )
    );
  };

  const handleDeleteObject = (objectName) => {
    if (userType !== "superAdmin") return; // Only super admins can delete objects
    setFormData((prev) => ({
      ...prev,
      objects: prev.objects.filter((obj) => obj.objectName !== objectName),
    }));
    setAvailablePermissions((prev) => {
      // ------------------------------ v1.0.0 >
      const updated = { ...prev };
      if (
        !(roles || []).some((role) =>
          role.objects.some((obj) => obj.objectName === objectName)
        )
      ) {
        delete updated[objectName];
      }
      return updated;
    });
    // ------------------------------ v1.0.0 >
  };

  const handleUpdateObject = (objectName, field, value) => {
    if (userType !== "superAdmin") return; // Only super admins can edit object fields
    setFormData((prev) => ({
      ...prev,
      objects: prev.objects.map((obj) =>
        obj.objectName === objectName ? { ...obj, [field]: value } : obj
      ),
    }));
    setAvailablePermissions((prev) => ({
      ...prev,
      [objectName]: {
        ...prev[objectName],
        [field]: value,
      },
    }));
  };

  // Show loading state if permissions or roles are still loading
  if (permissionsLoading || isLoading || !isInitialized) {
    return (
      <Modal
        isOpen={true}
        onRequestClose={() => navigate("/account-settings/roles")}
        className="fixed inset-0 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <div className="h-full flex items-center justify-center">
          <Loading
            message={permissionsLoading ? "Loading..." : "Loading roles..."}
            size="large"
          />
        </div>
      </Modal>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    setLoading(true);

    try {
      if (userType === "superAdmin") {
        const roleData = {
          label: formData.label,
          roleName: formData.roleName,
          description: formData.description,
          level: formData.level,
          tenantId: tenantId,
          roleType: formData.roleType || "internal",
          objects: formData.objects.map((obj) => ({
            objectName: obj.objectName,
            permissions: Object.fromEntries(
              (availablePermissions[obj.objectName]?.permissions || []).map(
                (perm) => [perm, obj.permissions.includes(perm)]
              )
            ),
            visibility: obj.visibility,
          })),
          inherits: formData.inherits,
        };

        if (editMode) {
          // PATCH the main roles collection
          const response = await axios.patch(
            `${config.REACT_APP_API_URL}/roles/${formData._id}`,
            roleData
          );
          console.log("Server response (update):", response.data);
          if (response.data && onSave) {
            onSave(response.data);
          }
        } else {
          // POST to the main roles collection
          const response = await axios.post(
            `${config.REACT_APP_API_URL}/roles`,
            roleData
          );
          console.log("Server response (create):", response.data);
          if (response.data && onSave) {
            onSave(response.data);
          }
        }
      } else {
        // <-------------------------------v1.0.1
        // Only include changed objects in overrideData for non-superAdmin
        const changedObjects = formData.objects.filter((obj) => {
          const initialObj = initialFormDataRef.current.objects.find(
            (o) => o.objectName === obj.objectName
          );
          if (!initialObj) return true; // new object
          // Compare permissions (as sets)
          const permsA = new Set(obj.permissions);
          const permsB = new Set(initialObj.permissions);
          if (
            permsA.size !== permsB.size ||
            [...permsA].some((p) => !permsB.has(p))
          )
            return true;
          // Compare visibility
          if (obj.visibility !== initialObj.visibility) return true;
          return false;
        });

        const overrideData = {
          tenantId: tenantId,
          roleName: formData.roleName,
          level: formData.level,
          inherits: formData.inherits,
        };
        if (changedObjects.length > 0) {
          overrideData.objects = changedObjects.map((obj) => {
            const permissions = {};
            const availablePerms =
              availablePermissions[obj.objectName]?.permissions || [];
            availablePerms.forEach((perm) => {
              permissions[perm] = obj.permissions.includes(perm);
            });
            return {
              objectName: obj.objectName,
              permissions,
              visibility: obj.visibility,
            };
          });
        }
        // ------------------------------v1.0.1 >

        if (editMode) {
          const overrideResponse = await axios.get(
            `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${formData.roleName}`
          );
          const existingOverride = overrideResponse.data;

          if (existingOverride) {
            const response = await axios.patch(
              `${config.REACT_APP_API_URL}/role-overrides/${existingOverride._id}`,
              overrideData
            );
            console.log("Server response (update):", response.data);
            if (response.data && onSave) {
              onSave(response.data);
            }
          } else {
            const response = await axios.post(
              `${config.REACT_APP_API_URL}/role-overrides`,
              overrideData
            );
            console.log("Server response (create):", response.data);
            if (response.data && onSave) {
              onSave(response.data);
            }
          }
        } else {
          const response = await axios.post(
            `${config.REACT_APP_API_URL}/role-overrides`,
            overrideData
          );
          console.log("Server response (create):", response.data);
          if (response.data && onSave) {
            onSave(response.data);
          }
        }
      }

      navigate("/account-settings/roles");
    } catch (error) {
      console.error("Error saving role:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // <-------------------------------v1.0.1
  const visibleObjects =
    userType === "superAdmin"
      ? Object.keys(availablePermissions)
      : formData.objects.map((obj) => obj.objectName);

  return (
    // v1.0.4 <---------------------------------------------------------------------------
    <SidebarPopup
      title={editMode ? "Edit Role" : "Create Role"}
      onClose={() => navigate("/account-settings/roles")}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
        </div>
      )}
      <div className="sm:px-2 px-4 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
          <div className="mb-8">
            <h3 className="sm:text-md md:text-md lg:text-lg xl:text-xl 2xl:text-xl font-medium mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              {userType === "superAdmin" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={handleLabelChange}
                      className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.roleName}
                      onChange={handleRoleNameChange}
                      className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      required
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200 min-h-[100px] resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}
              {userType !== "superAdmin" && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium">{formData.label}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {formData.description || "No description available"}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hierarchy Level
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                  min="0"
                  max="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers have higher authority (0 is highest)
                </p>
              </div>
            </div>
          </div>

          {userType !== "superAdmin" && (
            // v1.0.2 <------------------------------------------------------------------------------------------------------------------
            <div className="mb-8 pb-6">
              {/* v1.0.2 -------------------------------------------------------------------------------------------------------> */}
              <h3 className="text-base sm:text-lg font-medium mb-4">
                Role Hierarchy
              </h3>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Inherits Permissions From</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {(roles || [])
                    .filter((role) => role.level > formData.level)
                    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
                    .map((role) => (
                      <label
                        key={role._id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={formData.inherits.includes(role._id)}
                          onChange={() => handleInheritChange(role._id)}
                          className="rounded border-gray-300 accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm text-gray-700">
                          {role.label}
                          <span className="text-gray-500 text-xs ml-2">
                            (Level {role.level})
                          </span>
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          )}

          {userType === "superAdmin" && (
            <div className="mb-8 border-b pb-6">
              <h3 className="text-base sm:text-lg font-medium mb-4">
                Add New Object
              </h3>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Object Name
                    </label>
                    <input
                      type="text"
                      value={newObjectName}
                      onChange={(e) => setNewObjectName(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      placeholder="Enter new object name"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility
                      </label>
                      <select
                        value={newObjectVisibility}
                        onChange={(e) => setNewObjectVisibility(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      >
                        <option value="super_admin_only">
                          Super Admin Only
                        </option>
                        <option value="view_all">View All</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={newObjectType}
                        onChange={(e) => setNewObjectType(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      >
                        <option value="internal">Internal</option>
                        <option value="organization">Organization</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Permission
                  </label>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        value={newPermissionName}
                        onChange={(e) => setNewPermissionName(e.target.value)}
                        className="border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                        placeholder="Enter new permission name"
                      />
                      <select
                        value={newPermissionValue}
                        onChange={(e) =>
                          setNewPermissionValue(e.target.value === "true")
                        }
                        className="border rounded-md px-3 py-2 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      >
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewPermission}
                      className="ml-auto px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200"
                      disabled={!newPermissionName.trim()}
                    >
                      Add Permission
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {newObjectPermissions.map((perm, index) => (
                      <div
                        key={index}
                        className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 gap-1"
                      >
                        <span>
                          {perm.name}: {perm.value.toString()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleNewPermissionValue(perm.name)
                          }
                          className="ml-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                          title="Toggle value"
                        >
                          ↔
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNewObjectPermissions((prev) =>
                              prev.filter((p) => p.name !== perm.name)
                            )
                          }
                          className="ml-1 text-red-500 hover:text-red-700 text-lg"
                          title="Delete permission"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddNewObject}
                    className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200"
                    disabled={
                      !newObjectName.trim() || newObjectPermissions.length === 0
                    }
                  >
                    Add Object
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-medium">Permissions</h3>
            <div className="pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {visibleObjects.map((objectName) => (
                  <div
                    key={objectName}
                    className="space-y-2 bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-gray-800">
                          {formatWithSpaces(objectName)}
                        </h5>
                        {userType === "superAdmin" && (
                          <div className="space-y-2 mt-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600">
                                Visibility
                              </label>
                              <select
                                value={
                                  formData.objects.find(
                                    (o) => o.objectName === objectName
                                  )?.visibility ||
                                  availablePermissions[objectName]?.visibility
                                }
                                onChange={(e) =>
                                  handleUpdateObject(
                                    objectName,
                                    "visibility",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-md px-3 py-1 text-sm border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                              >
                                <option value="super_admin_only">
                                  Super Admin Only
                                </option>
                                <option value="view_all">View All</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">
                                Type
                              </label>
                              <select
                                value={
                                  formData.objects.find(
                                    (o) => o.objectName === objectName
                                  )?.type ||
                                  availablePermissions[objectName]?.type
                                }
                                onChange={(e) =>
                                  handleUpdateObject(
                                    objectName,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-md px-3 py-1 text-sm border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                              >
                                <option value="internal">Internal</option>
                                <option value="organization">
                                  Organization
                                </option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Only allow delete for super admin in create mode */}
                      {userType === "superAdmin" && !editMode && (
                        <button
                          type="button"
                          onClick={() => handleDeleteObject(objectName)}
                          className="text-red-500 hover:bg-red-100 rounded-full p-2 ml-2"
                          title="Delete Object"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 grid grid-cols-2 gap-2">
                      {(
                        availablePermissions[objectName]?.permissions || []
                      ).map((perm) => (
                        <div key={perm} className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(
                                formData.objects.find(
                                  (o) => o.objectName === objectName
                                )?.permissions || []
                              ).includes(perm)}
                              onChange={(e) =>
                                handlePermissionChange(
                                  objectName,
                                  perm,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm text-gray-700">
                              {formatWithSpaces(perm)}
                            </span>
                          </label>
                          {userType === "superAdmin" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePermission(objectName, perm)
                              }
                              className="text-red-500 hover:bg-red-100 rounded-full p-1 text-xs"
                              title="Delete Permission"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end py-2 mt-10">
            <button
              type="button"
              onClick={() => navigate("/account-settings/roles")}
              className="text-sm px-4 py-2 border border-custom-blue rounded-lg hover:bg-custom-blue/90 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`text-sm ml-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200${
                userType === "superAdmin" ? " font-semibold" : ""
              }`}
            >
              {editMode ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </SidebarPopup>
    // v1.0.4 --------------------------------------------------------------------------->
  );
};

export default RoleFormPopup;
