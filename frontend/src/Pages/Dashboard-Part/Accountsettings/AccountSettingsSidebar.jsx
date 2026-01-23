// v1.0.0 - Ashok - Added new Tab hrms-ats-integrations-hub
// v1.0.1 - Ashok - Improved responsiveness
// v1.1.0 - Ashraf  - Fixed tab rendering after login by ensuring permissions initialization and moving permission checks to useCallback
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";
import SidebarProfile from "./account/Sidebar";
import { usePermissions, getCachedPermissions } from "../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../utils/permissionUtils";
import AuthCookieManager from "../../../utils/AuthCookieManager/AuthCookieManager";
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  ChartBarIcon,
  WalletIcon,
  UserGroupIcon,
  UserIcon,
  ShareIcon,
  UsersIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ArrowsRightLeftIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const AccountSettingsSidebar = () => {
  const { checkPermission, isInitialized, loading } = usePermissionCheck();
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get user type from AuthCookieManager
  const userType = AuthCookieManager.getUserType();

  // Extract active tab from URL
  const pathParts = location.pathname.split("/");
  const activeTab = pathParts.includes("my-profile") ? "my-profile" : pathParts[2] || "profile";

  // Decode auth token to check for organization
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;

  // Define navigation data with better categorization
  const accountNavigation = [
    { name: "Company Profile", icon: BuildingOfficeIcon, id: "profile" },
    { name: "My Profile", icon: UserIcon, id: "my-profile" },
  ];

  const billingNavigation = [
    { name: "Billing", icon: CreditCardIcon, id: "billing-details" },
    { name: "Subscription", icon: Cog6ToothIcon, id: "subscription" },
    { name: "Wallet", icon: WalletIcon, id: "wallet" },
  ];

  const securityNavigation = [
    { name: "Security", icon: KeyIcon, id: "security" },
    { name: "Usage", icon: ChartBarIcon, id: "usage" },

  ];

  const organizationNavigation = [
    { name: "Users", icon: UsersIcon, id: "users" },
    { name: "Interviewer Groups", icon: UserGroupIcon, id: "interviewer-groups" },
    { name: "Roles", icon: UserIcon, id: "roles" },
    { name: "Video Calling", icon: VideoCameraIcon, id: "video-calling-settings" },
  ];

  const settingsNavigation = [
    { name: "Sharing Settings", icon: ShareIcon, id: "sharing" },
    { name: "Subdomain Management", icon: GlobeAltIcon, id: "sub-domain" },
    { name: "Notifications", icon: BellIcon, id: "email-settings" },
    { name: "Notification Settings", icon: BellIcon, id: "notifications" },
  ];

  const integrationNavigation = [
    {
      name: "HRMS/ATS Integration",
      icon: ArrowsRightLeftIcon,
      id: "integration-hub",
    },
  ];

  const navigation = [
    { category: "Account Management", items: accountNavigation },
    { category: "Billing & Payments", items: billingNavigation },
    { category: "Security & Usage", items: securityNavigation },
    { category: "Organization", items: organizationNavigation },
    { category: "Settings", items: settingsNavigation },
    { category: "Integrations", items: integrationNavigation },
  ];

  // Map navigation item IDs to permission objects
  const permissionMap = {
    "my-profile": "MyProfile",
    profile: "CompanyProfile",
    "billing-details": "Billing",
    subscription: "Subscription",
    "video-calling-settings": "VideoCalling",
    wallet: "Wallet",
    security: "Security",
    notifications: "NotificationsSettings",
    "email-settings": "Notification",
    usage: "Usage",
    users: "Users",
    "interviewer-groups": "InterviewerGroups",
    roles: "Roles",
    sharing: "Sharing",
    "sub-domain": "Subdomain",
    "integration-hub": "Integration",
  };

  // Filter navigation based on user type and permissions using useCallback
  const filterNavigation = useCallback(() => {
    if (!isInitialized && !getCachedPermissions()) {
    //   console.log('🎯 Sidebar: No permissions available, returning empty navigation');
      return [];
    }

    const filtered = navigation
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (userType === "superAdmin") {
            const superAdminItems = ["my-profile", "roles", "users"];
            if (!superAdminItems.includes(item.id)) {
            //   console.log(`🎯 SuperAdmin filtering out ${item.id}: not in super admin items list`);
              return false;
            }

            const permissionKey = permissionMap[item.id];
            const hasPermission = checkPermission(permissionKey);
            // console.log(`🎯 SuperAdmin ${item.id}:`, { permissionKey, hasPermission });
            return hasPermission;
          }

          const permissionKey = permissionMap[item.id];
          if (!permissionKey) {
            // console.log(`🎯 Non-super admin filtering out ${item.id}: no permission key`);
            return false;
          }

          const hasPermission = checkPermission(permissionKey);
        //   console.log(`🎯 Non-super admin ${item.id}:`, { permissionKey, hasPermission });

          if (
            ["profile", "users", "sub-domain", "roles", "interviewer-groups", "sharing"].includes(item.id)
          ) {
            return organization && hasPermission;
          }
          return hasPermission;
        }),
      }))
      .filter((section) => section.items.length > 0);

    // console.log('📋 Filtered Sidebar Navigation:', filtered);
    return filtered;
  }, [checkPermission, isInitialized, organization, userType]);

  const filteredNavigation = filterNavigation();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    // console.log('🎯 Sidebar: Navigating to tab:', tabId);
    if (tabId === "my-profile") {
      navigate("/account-settings/my-profile/basic");
      setIsSidebarOpen(true);
    } else if (tabId === "profile" && organization && userType !== "superAdmin") {
      navigate("/account-settings/profile");
    } else {
      navigate(`/account-settings/${tabId}`);
    }
  }, [navigate, organization, userType]);

  // Debug initialization state
//   useEffect(() => {
//     console.log('🎯 Sidebar Initialization:', {
//       authToken: !!authToken,
//       userType,
//       isInitialized,
//       loading,
//       organization,
//       activeTab,
//       location: location.pathname,
//     });
//   }, [authToken, userType, isInitialized, loading, organization, activeTab, location.pathname]);

  // Redirect to appropriate tab on initial load
  useEffect(() => {
    if (location.pathname === "/account-settings") {
      if (organization && userType !== "superAdmin") {
        // console.log('🎯 Sidebar: Redirecting to /account-settings/profile');
        navigate("/account-settings/profile", { replace: true });
      } else {
        // console.log('🎯 Sidebar: Redirecting to /account-settings/my-profile/basic');
        navigate("/account-settings/my-profile/basic", { replace: true });
      }
    }

    if (location.pathname === "/account-settings/my-profile") {
    //   console.log('🎯 Sidebar: Redirecting to /account-settings/my-profile/basic');
      navigate("/account-settings/my-profile/basic", { replace: true });
    }
  }, [location.pathname, navigate, organization, userType]);

  // Early return for loading or uninitialized states
  // if (!authToken) {
  //   // console.log('🎯 Sidebar: No auth token, redirecting to login');
  //   navigate('/login');
  //   return null;
  // }

  if (loading || !isInitialized) {
    // console.log('🎯 Sidebar: Waiting for initialization', { loading, isInitialized });
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div>Loading...</div> {/* Replace with your Loading component */}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden mt-[60px]">
      <SidebarProfile
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleTabChange={handleTabChange}
        activeTab={activeTab}
        filteredNavigation={filteredNavigation}
        userType={userType}
        permissions={userType === "superAdmin" ? superAdminPermissions : effectivePermissions}
      />

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          <div className="sm:p-2 p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden xl:hidden 2xl:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AccountSettingsSidebar;
