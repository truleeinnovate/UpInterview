// v1.0.0  -  Ashraf  -  displaying label.level UI changed
// v1.0.1  -  Ashok   -  fixed expanded view
// v1.0.2 - Ashok - Removed border left and set outline as none

import { useState, useEffect } from "react";
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
import AuthCookieManager from '../../../../../utils/AuthCookieManager/AuthCookieManager';

const RoleView = () => {
  const userType = AuthCookieManager.getUserType();
  
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const permissions =
    userType === "superAdmin" ? superAdminPermissions : effectivePermissions;
  const permissionKey = "Roles";
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const roles = location.state?.roles || [];

  // Move navigation to useEffect to avoid rendering-phase state updates
  useEffect(() => {
    if (!role) {
      console.log("No role found, navigating to /account-settings/roles");
      navigate("/account-settings/roles", { replace: true });
    }
  }, [role, navigate]);

  // Prevent rendering until navigation occurs
  if (!role) {
    return null;
  }

  // Explicitly filter objects for superAdmin to include all objects
  const visibleObjects =
    role.objects?.filter((obj) => {
      if (userType === "superAdmin") {
        return true; // Super admins see all objects
      }
      return obj.visibility === "view_all"; // Non-super admins see only view_all
    }) || [];

  const modalClass = classNames(
    "fixed bg-white shadow-2xl overflow-y-auto outline-none",
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
          {/* Top right action icons */}
          <div className="flex justify-end items-center gap-2 mb-2">
            {(userType === "superAdmin"
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
              onClick={toggleFullWidth}
              className="p-1 rounded-full hover:bg-white/10"
            >
              {isFullScreen ? (
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
          <div className="space-y-6">
            {userType !== "superAdmin" &&
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
                    />
                    {userType === "superAdmin" && (
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