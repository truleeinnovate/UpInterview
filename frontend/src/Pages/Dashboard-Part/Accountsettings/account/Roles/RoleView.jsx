// v1.0.0  -  Ashraf  -  displaying label.level UI changed
// v1.0.1  -  Ashok   -  fixed expanded view
// v1.0.2 - Ashok - Removed border left and set outline as none
// v1.0.3 - Ashok - Improved responsiveness and added common to popup

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
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";

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

  return (
    // v1.0.3 <-------------------------------------------------------------------------
    <SidebarPopup
      title={`${role.label}`}
      titleRight={
        <span className="text-xs bg-custom-blue text-white px-2 py-1 rounded-full">
          Level {role.level ?? 0}
        </span>
      }
      subTitle={role.description || "No description available"}
      onClose={() => navigate("/account-settings/roles")}
      setIsFullscreen={setIsFullScreen}
      showEdit={userType === "superAdmin"}
      id={role._id} // required for onEdit to receive it
      onEdit={() => navigate(`/account-settings/roles/role-edit/${role._id}`)}
    >
      <div className="px-6 sm:px-3 pt-2 pb-20">
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
                    const label = foundRole ? foundRole.label : inheritedRoleId;
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
                  ? "grid grid-cols-3 gap-6"
                  : "grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4"
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
    </SidebarPopup>
    // v1.0.3 ------------------------------------------------------------------------->
  );
};

export default RoleView;
