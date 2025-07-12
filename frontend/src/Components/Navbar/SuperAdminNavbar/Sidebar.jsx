import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../../Context/AuthContext";

import {
  AiOutlineHome,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineFileText,
  AiOutlineCalendar,
  AiOutlineCheckSquare,
  AiOutlineDollar,
  AiOutlineCustomerService,
  AiOutlineSetting,
  AiOutlineClose,
  AiOutlineUp,
} from "react-icons/ai";
import { CgDetailsMore } from "react-icons/cg";
import logo from "../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import { usePermissions } from "../../../Context/PermissionsContext";
import { clearAllAuth, logout } from "../../../utils/AuthCookieManager/AuthCookieManager.jsx";

function Sidebar({ open, onClose }) {
  const { superAdminPermissions, effectivePermissions, isImpersonating } = usePermissions();
  const navigate = useNavigate();
  // const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const navigation = [
    { href: "/tenants", name: "Tenants", icon: AiOutlineTeam, permissionKey: "Tenants.ViewTab" },
    {
      href: "/interviewer-requests",
      name: "Interviewer Requests",
      icon: AiOutlineCalendar,
      permissionKey: "InterviewRequest.ViewTab",
    },
    {
      href: "/outsource-interviewers",
      name: "Outsource Interviewers",
      icon: AiOutlineCalendar,
      permissionKey: "OutsourceInterviewerRequest.ViewTab",
    },
    {
      name: "Support Desk",
      href: "/super-admin-desk",
      icon: AiOutlineCustomerService,
      permissionKey: "SuperAdminSupportDesk.ViewTab",
    },
    { href: "/admin-billing", name: "Billing", icon: AiOutlineDollar, permissionKey: "SuperAdminBilling.ViewTab" },
  ];

  const moreNavItems = [
    { href: "/settings", name: "Settings", icon: AiOutlineSetting },
    {
      href: "/internal-logs",
      name: "Internal Logs",
      icon: AiOutlineFileText,
      permissionKey: "InternalLogs.ViewTab",
    },
    {
      href: "/integrations",
      name: "Integrations",
      icon: AiOutlineCheckSquare,
      permissionKey: "IntegrationLogs.ViewTab",
    },
  ];

  // Helper function to check permissions
  const hasPermission = (permissionKey) => {
    if (!permissionKey) return true;

    // Check super admin permissions first
    if (superAdminPermissions && superAdminPermissions[permissionKey]) {
      return superAdminPermissions[permissionKey];
    }

    // Check effective permissions
    if (effectivePermissions && effectivePermissions[permissionKey]) {
      return effectivePermissions[permissionKey];
    }

    return false;
  };

  const handleLogout = () => {
    onClose();

    if (isImpersonating) {
      // If impersonating, clear only the effective user cookies and redirect to admin dashboard
      clearAllAuth({ preserveSuperAdmin: true });
      navigate("/admin-dashboard");
    } else {
      // If not impersonating, clear all cookies and redirect to login
      logout(true); // true for organization login
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[300px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-24" />
          </div>
          <button
            type="button"
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* User info */}

        {/* //we need to do it later */}
        {/* {user && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === "super_admin" ? "Super Admin" : "Support Team"}
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              // Check if user has permission for this item
              const hasItemPermission = hasPermission(item.permissionKey);

              if (!hasItemPermission) return null;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={onClose}
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Show More */}
          <div className="relative">
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="flex items-center">
                <CgDetailsMore className="mr-3 h-5 w-5 text-gray-400" />
                More
              </span>
              <AiOutlineUp
                className={`h-4 w-4 transform transition-transform ${showMore ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>

            {showMore && (
              <div className="mt-1 ml-6 space-y-1">
                {moreNavItems.map((item) => {
                  const hasItemPermission = hasPermission(item.permissionKey);

                  if (!hasItemPermission) return null;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                      onClick={onClose}
                    >
                      <item.icon
                        className="mr-3 flex-shrink-0 h-5 w-5"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 px-4 py-4 border-t border-gray-200 w-full">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isImpersonating ? "Exit Impersonation" : "Log out"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
