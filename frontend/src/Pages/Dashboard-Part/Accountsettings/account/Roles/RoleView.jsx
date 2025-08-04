// import { useState } from 'react';
// import { CheckIcon, XMarkIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, PencilIcon } from '@heroicons/react/24/outline';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Modal from 'react-modal';
// import classNames from 'classnames';

// const formatWithSpaces = (str) => {
//   if (!str) return '';
//   const formatted = str
//     .replace(/_/g, ' ')
//     .replace(/([a-z])([A-Z])/g, '$1 $2')
//     .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
//   return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
// };

// const RoleView = () => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const role = location.state?.role;
//   const roles = location.state?.roles || [];

//   // If no role is found in state, redirect back to roles list
//   if (!role) {
//     navigate('/account-settings/roles');
//     return null;
//   }

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

//   // Filter objects to show only those with visibility: 'view_all'
//   const visibleObjects = role.objects?.filter((obj) => obj.visibility === 'view_all') || [];

//   const modalClass = classNames(
//     'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
//     {
//       'inset-0': isFullScreen,
//       'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen,
//     }
//   );

//   const toggleFullWidth = () => {
//     setIsFullScreen((prev) => !prev);
//   };

//   const handleEdit = () => {
//     navigate(`/account-settings/roles/role-edit/${role._id}`);
//   };

//   return (
//     <Modal
//       isOpen={true}
//       onRequestClose={() => navigate('/account-settings/roles')}
//       className={modalClass}
//       overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
//     >
//       <div className={classNames('h-full', {
//         'max-w-6xl mx-auto px-6': isFullScreen,
//         'px-6': !isFullScreen,
//       })}>
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-custom-blue">{role.label}</h2>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleEdit}
//                 className="p-1 rounded-full hover:bg-white/10"
//               >
//                 <PencilIcon className="h-5 w-5 text-gray-500" />
//               </button>
//               <button
//                 onClick={() => setIsExpanded(!isExpanded)}
//                 className="p-1 rounded-full hover:bg-white/10"
//               >
//                 {isExpanded ? (
//                   <ArrowsPointingInIcon className="h-5 w-5 text-gray-500" />
//                 ) : (
//                   <ArrowsPointingOutIcon className="h-5 w-5 text-gray-500" />
//                 )}
//               </button>
//               <button
//                 onClick={() => navigate('/account-settings/roles')}
//                 className="p-1 rounded-full hover:bg-white/10"
//               >
//                 <XMarkIcon className="h-5 w-5 text-gray-500" />
//               </button>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-medium mb-4">Basic Information</h3>
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-1">Label</p>
//                   <p className="text-sm text-gray-600">{role.label}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
//                   <p className="text-sm text-gray-600">{role.description || 'No description available'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-1">Hierarchy Level</p>
//                   <p className="text-sm text-gray-600">Level: {role.level}</p>
//                 </div>
//               </div>
//             </div>

//             {role.inherits && role.inherits.length > 0 && (
//               <div>
//                 <h3 className="text-lg font-medium mb-4">Inherits From</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {role.inherits.map((inheritedRole) => {
//                     const inheritedRoleId = typeof inheritedRole === 'string' ? inheritedRole : inheritedRole._id;
//                     const foundRole = roles.find((r) => r._id === inheritedRoleId);
//                     const label = foundRole ? foundRole.label : inheritedRoleId;
//                     return (
//                       <span key={inheritedRoleId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
//                         {label}
//                       </span>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             <div>
//               <h3 className="text-lg font-medium mb-4">Permissions</h3>
//               <div className={isExpanded ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"}>
//                 {visibleObjects.map((obj) => (
//                   <div key={obj.objectName} className="space-y-2">
//                     <h5 className="font-medium">{formatWithSpaces(obj.objectName)}</h5>
//                     <div className="space-y-1">
//                       {Object.entries(sortPermissions(obj.permissions)).map(([permissionName, value], index) => (
//                         <div key={index} className="flex items-center text-sm text-gray-600">
//                           {value ? (
//                             <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
//                           ) : (
//                             <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
//                           )}
//                           <span>{formatWithSpaces(permissionName)}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default RoleView;

// v1.0.0  -  Ashraf  -  displaying label.level UI changed
// v1.0.1  -  Ashok   -  fixed expanded view

import { useState } from "react";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import classNames from "classnames";
import PermissionDisplay from "./PermissionDisplay";
import {
  formatWithSpaces,
  sortPermissions,
} from "../../../../../utils/RoleUtils";
import { usePermissions } from "../../../../../Context/PermissionsContext.js";

const RoleView = ({ type }) => {
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const permissions =
    type === "superAdmin" ? superAdminPermissions : effectivePermissions;
  const permissionKey = "Roles";
  // v1.0.1 <-------------------------------------------------------------
  // const [isExpanded, setIsExpanded] = useState(false);
  // v1.0.1 ------------------------------------------------------------->
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const roles = location.state?.roles || [];

  if (!role) {
    navigate("/account-settings/roles");
    return null;
  }

  const visibleObjects =
    role.objects?.filter((obj) =>
      type === "superAdmin" ? true : obj.visibility === "view_all"
    ) || [];

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto",
    {
      "top-0 left-0 right-0 bottom-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  const toggleFullWidth = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handleEdit = () => {
    navigate(`/account-settings/roles/role-edit/${role._id}`);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate("/account-settings/roles")}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        className={classNames("h-full", {
          "max-w-6xl mx-auto px-6": isFullScreen,
          "px-6": !isFullScreen,
        })}
      >
        <div className="p-6">
          {/* // <-------------------------------v1.0.0 */}
          {/* Top right action icons */}
          <div className="flex justify-end items-center gap-2 mb-2">
            {(type === "superAdmin"
              ? permissions.Roles?.Edit
              : permissions.Roles?.Edit && role.roleName !== "Admin") && (
              <button
                onClick={handleEdit}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <PencilIcon className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <button
              // v1.0.1 <-------------------------------------------------------------
              onClick={toggleFullWidth}
              // v1.0.1 ------------------------------------------------------------->
              className="p-1 rounded-full hover:bg-white/10"
            >
              {/* v1.0.1 <---------------------------- */}
              {isFullScreen ? (
                // v1.0.1 ------------------------------>
                <ArrowsPointingInIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            <button
              onClick={() => navigate("/account-settings/roles")}
              className="p-1 rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          {/* Main content starts here */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-medium">{role.label}</h2>
            <span className="text-xs bg-custom-blue text-white px-2 py-1 rounded-full">
              Level {role.level ?? 0}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            {role.description || "No description available"}
          </p>
          {/* // <-------------------------------v1.0.0 > */}
          <div className="space-y-6">
            {type !== "superAdmin" &&
              role.inherits &&
              role.inherits.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Inherits From</h3>
                  <div className="flex flex-wrap gap-2">
                    {role.inherits.map((inheritedRole) => {
                      const inheritedRoleId =
                        typeof inheritedRole === "string"
                          ? inheritedRole
                          : inheritedRole._id;
                      const foundRole = roles.find(
                        (r) => r._id === inheritedRoleId
                      );
                      const label = foundRole
                        ? foundRole.label
                        : inheritedRoleId;
                      return (
                        <span
                          key={inheritedRoleId}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

            <div>
              <h3 className="text-lg font-medium mb-4">Permissions</h3>
              {/* v1.0.1 <----------------------------------------------------------------------- */}
              <div
                className={
                  isFullScreen
                    ? "grid grid-cols-3 gap-4"
                    : "grid grid-cols-2 gap-4"
                }
              >
                {visibleObjects.map((obj) => (
                  <div key={obj.objectName}>
                    <PermissionDisplay
                      objectName={obj.objectName}
                      permissions={sortPermissions(obj.permissions)}
                      isExpanded={isFullScreen}
                      // v1.0.1 ----------------------------------------------------------------------->
                    />
                    {type === "superAdmin" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Visibility: {obj.visibility}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RoleView;
