// v1.0.0 - Ashok - Improved responsiveness and fixed sliding sidebar

import React from "react";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { usePermissionCheck } from "../../../../utils/permissionUtils";
import AuthCookieManager from "../../../../utils/AuthCookieManager/AuthCookieManager";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SidebarProfile = ({
  isSidebarOpen,
  toggleSidebar,
  handleTabChange,
  activeTab,
  filteredNavigation,
  userType,
  permissions: originalPermissions,
}) => {
  const { checkPermission, isInitialized } = usePermissionCheck();

  // Get user type from AuthCookieManager if not provided
  const currentUserType = userType || AuthCookieManager.getUserType();

  // Define tabs for super admin explicitly
  const superAdminTabs = [
    {
      name: "My Profile",
      icon: UserIcon,
      id: "my-profile",
      permissionKey: "MyProfile",
    },
    { name: "Roles", icon: UserIcon, id: "roles", permissionKey: "Roles" },
    { name: "Users", icon: UsersIcon, id: "users", permissionKey: "Users" },
  ];

  return (
    <>
      {/* v1.0.0 <--------------------------------------------------------------------------- */}
      {/* Mobile menu button */}
      {/* <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white transform 
        lg:relative xl:relative 2xl:relative lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0 
        lg:shadow-lg sm:mt-8 md:mt-8 pb-1
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}> */}
      <div
        className={`
          absolute inset-y-0 left-0 sm:w-62 md:w-62 lg:w-72 xl:w-72 2xl:w-72 bg-white transform transition-transform duration-300 ease-in-out
          z-30 lg:relative xl:relative 2xl:relative lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0 lg:z-10 shadow-lg
          ${
            isSidebarOpen
              ? "translate-x-0 w-60"
              : "-translate-x-full lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* <div className="sm:p-0 sm:px-4 p-6 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0 2xl:mt-0"> */}
          <div className="sm:p-4 md:p-4 lg:p-6 xl:p-6 2xl:p-6">
            <h1 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl font-bold text-gray-800">
              Account Settings
            </h1>
          </div>
          <div className="flex-grow overflow-y-auto">
            <nav className="mt-2 pb-4">
              {currentUserType === "superAdmin" ? (
                // Render only My Profile, Roles, and Users for super admins
                <div className="py-2">
                  <h2 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h2>
                  {superAdminTabs.map((item) => {
                    const hasPermission = checkPermission(item.permissionKey);

                    return hasPermission ? (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (activeTab !== item.id) {
                            handleTabChange(item.id);
                          }
                        }}
                        className={`w-full flex items-center px-6 py-3 text-xs font-medium ${
                          activeTab === item.id
                            ? "bg-blue-50 text-custom-blue border-r-4 border-custom-blue"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              ) : (
                // Render filtered navigation for effective users
                filteredNavigation.map((section) => (
                  <div key={section.category} className="py-2">
                    <h2 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.category}
                    </h2>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (activeTab !== item.id) {
                            handleTabChange(item.id);
                          }
                        }}
                        className={`w-full flex items-center px-6 py-3 text-xs font-medium ${
                          activeTab === item.id
                            ? "bg-blue-50 text-custom-blue border-r-4 border-custom-blue"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </nav>
          </div>
        </div>
        {/* <button
          // className="absolute top-6 right-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 w-10 h-10 flex items-center justify-center shadow lg:hidden xl:hidden 2xl:hidden"
          className="absolute cursor-pointer right-0 top-2 sm:translate-x-3/4 md:translate-x-3/4 lg:translate-x-1/2 xl:translate-x-1/2 2xl:translate-x-1/2  rounded-full bg-white/50 w-10 h-10 flex items-center justify-center shadow lg:hidden xl:hidden 2xl:hidden"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <span
              title="Close Sidebar"
              className="flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5 text-custom-blue" />
            </span>
          ) : (
            <span
              title="Open Sidebar"
              className="flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5 text-custom-blue" />
            </span>
          )}
        </button> */}
        <button
          onClick={toggleSidebar}
          className="absolute cursor-pointer right-0 top-2 sm:translate-x-3/4 md:translate-x-3/4 lg:translate-x-1/2 xl:translate-x-1/2 2xl:translate-x-1/2 rounded-full w-10 h-10 flex items-center justify-center shadow lg:hidden xl:hidden 2xl:hidden transition-opacity duration-300 bg-white/70 opacity-90"
        >
          {isSidebarOpen ? (
            <span
              title="Close Sidebar"
              className="flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5 text-custom-blue" />
            </span>
          ) : (
            <span
              title="Open Sidebar"
              className="flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5 text-custom-blue" />
            </span>
          )}
        </button>
      </div>
      {/* v1.0.0 ---------------------------------------------------------------------------> */}
    </>
  );
};
export default SidebarProfile;
