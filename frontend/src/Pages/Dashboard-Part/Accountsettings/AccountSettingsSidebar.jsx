// // // import { useCallback, useEffect, useState } from 'react'
// // // import { navigation } from './mockData/navigationData'

// // // import Cookies from "js-cookie";
// // // import { Outlet, useLocation, useNavigate } from 'react-router-dom'
// // // import SidebarProfile from './account/Sidebar'
// // // import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';

// // // const AccountSettingsSidebar = () => {
// // //   // const location = useLocation();
// // //   const navigate = useNavigate();
// // //   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
// // //   const location = useLocation();
// // //   const pathParts = location.pathname.split('/');
// // //   const activeTab = pathParts.includes('my-profile') ? 'my-profile' : (pathParts[2] || 'profile');

// // //   // const activeTab = tab || 'profile'

// // //   const authToken = Cookies.get("authToken");
// // //   const tokenPayload = decodeJwt(authToken);
// // //   const organization = tokenPayload?.organization;


// // //   const toggleSidebar = useCallback(() => {
// // //     setIsSidebarOpen((prev) => !prev);
// // //   }, []);

// // //   const handleTabChange = (tabId) => {
// // //     // If navigating to my-profile, default to basic subtab
// // //     if (tabId === 'my-profile') {
// // //       navigate(`/account-settings/my-profile/basic`);
// // //       setIsSidebarOpen(true); // Keep sidebar open for my-profile
// // //     } else if (tabId === 'profile' && organization) {
// // //       navigate(`/account-settings/profile`);
// // //     } else {

// // //       navigate(`/account-settings/${tabId}`);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (location.pathname === '/account-settings') {
// // //       if (organization) {
// // //         navigate('/account-settings/profile', { replace: true });
// // //       } else {
// // //         navigate('/account-settings/my-profile/basic', { replace: true });
// // //       }
// // //     }

// // //     // For my-profile, ensure it goes to basic by default
// // //     if (location.pathname === '/account-settings/my-profile') {
// // //       navigate('/account-settings/my-profile/basic', { replace: true });
// // //     }

// // //   }, [location.pathname, navigate, organization]);
// // //   const filteredNavigation = navigation.map(section => ({
// // //     ...section,
// // //     items: section.items.filter(item => {
// // //       if (item.id === 'profile' || item.id === 'users' || item.id === 'sub-domain' || item.id === 'roles' || item.id === 'interviewer-groups'
// // //         || item.id === 'sharing' || item.id === 'webhooks' || item.id === 'hrms-ats') return organization;
// // //       // if (item.id === 'my-profile') return !organization;
// // //       return true;
// // //     })
// // //   }));


// // //   return (
// // //     <div className="h-screen fixed w-full pb-14  bg-gray-50 flex mt-1"
// // //     >


// // //       <SidebarProfile
// // //         isSidebarOpen={isSidebarOpen}
// // //         toggleSidebar={toggleSidebar}
// // //         handleTabChange={handleTabChange}
// // //         activeTab={activeTab}
// // //         filteredNavigation={filteredNavigation}
// // //       />


// // //       {/* Main Content */}
// // //       <div
// // //         className="flex-1 flex flex-col ml-0 h-full overflow-y-auto z-50" >
// // //         <div className="flex-grow  ">
// // //           <div className="p-4 sm:p-8 mt-1 lg:mt-0 xl:mt-0  2xl:mt-0 ">
// // //             {/* {renderContent()} */}
// // //             <Outlet />
// // //           </div>
// // //         </div>
// // //       </div>


// // //       {/* Overlay */}
// // //       {isSidebarOpen && (
// // //         <div
// // //           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
// // //           onClick={toggleSidebar}
// // //         />
// // //       )}
// // //     </div>
// // //   )
// // // }

// // // // Export as default to ensure compatibility with lazy loading
// // // export default AccountSettingsSidebar;

// // import { useCallback, useEffect, useState } from 'react';
// // import Cookies from "js-cookie";
// // import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// // import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';
// // import SidebarProfile from './account/Sidebar';

// // import {
// //   Cog6ToothIcon,
// //   BuildingOfficeIcon,
// //   CreditCardIcon,
// //   KeyIcon,
// //   BellIcon,
// //   ChartBarIcon,
// //   WalletIcon,
// //   UserGroupIcon,
// //   UserIcon,
// //   ShareIcon,
// //   UsersIcon,
// //   GlobeAltIcon,
// //   CodeBracketIcon,
// //   ArrowsRightLeftIcon
// // } from '@heroicons/react/24/outline';

// // const mainNavigation = [
// //   { name: 'Company Profile', icon: BuildingOfficeIcon, id: 'profile' },
// //   { name: 'My Profile', icon: UserIcon, id: 'my-profile' },
// //   { name: 'Billing', icon: CreditCardIcon, id: 'billing-details' },
// //   { name: 'Subscription', icon: Cog6ToothIcon, id: 'subscription' },
// //   { name: 'Wallet', icon: WalletIcon, id: 'wallet' },
// //   { name: 'Security', icon: KeyIcon, id: 'security' },
// //   { name: 'Usage', icon: ChartBarIcon, id: 'usage' },
// //   { name: 'Users', icon: UsersIcon, id: 'users' },
// //   { name: 'Interviewer Groups', icon: UserGroupIcon, id: 'interviewer-groups' },
// //   { name: 'Roles', icon: UserIcon, id: 'roles' },
// //   { name: 'Sharing Settings', icon: ShareIcon, id: 'sharing' },
// //   { name: 'Subdomain Management', icon: GlobeAltIcon, id: 'sub-domain' },
// //   { name: 'Notifications', icon: BellIcon, id: 'email-settings' },
// //   { name: 'Notification Settings', icon: BellIcon, id: 'notifications' },
// // ];

// // const integrationNavigation = [
// //   { name: 'Webhooks', icon: CodeBracketIcon, id: 'webhooks' },
// //   { name: 'HRMS/ATS API', icon: ArrowsRightLeftIcon, id: 'hrms-ats' }
// // ];

// // const AccountSettingsSidebar = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// //   const pathParts = location.pathname.split('/');
// //   const activeTab = pathParts.includes('my-profile') ? 'my-profile' : (pathParts[2] || 'profile');

// //   const authToken = Cookies.get("authToken");
// //   const tokenPayload = decodeJwt(authToken);
// //   const organization = tokenPayload?.organization;

// //   const toggleSidebar = useCallback(() => {
// //     setIsSidebarOpen((prev) => !prev);
// //   }, []);

// //   const handleTabChange = (tabId) => {
// //     if (tabId === 'my-profile') {
// //       navigate(`/account-settings/my-profile/basic`);
// //       setIsSidebarOpen(true);
// //     } else if (tabId === 'profile' && organization) {
// //       navigate(`/account-settings/profile`);
// //     } else {
// //       navigate(`/account-settings/${tabId}`);
// //     }
// //   };

// //   useEffect(() => {
// //     if (location.pathname === '/account-settings') {
// //       if (organization) {
// //         navigate('/account-settings/profile', { replace: true });
// //       } else {
// //         navigate('/account-settings/my-profile/basic', { replace: true });
// //       }
// //     }

// //     if (location.pathname === '/account-settings/my-profile') {
// //       navigate('/account-settings/my-profile/basic', { replace: true });
// //     }
// //   }, [location.pathname, navigate, organization]);

// //   const navigation = [
// //     {
// //       category: 'Account',
// //       items: mainNavigation
// //     },
// //     {
// //       category: 'Integrations',
// //       items: integrationNavigation
// //     }
// //   ];

// //   const filteredNavigation = navigation.map(section => ({
// //     ...section,
// //     items: section.items.filter(item => {
// //       if ([
// //         'profile',
// //         'users',
// //         'sub-domain',
// //         'roles',
// //         'interviewer-groups',
// //         'sharing',
// //         'webhooks',
// //         'hrms-ats'
// //       ].includes(item.id)) {
// //         return organization;
// //       }
// //       return true;
// //     })
// //   }));

// //   return (
// //     <div className="h-screen fixed w-full pb-14 bg-gray-50 flex mt-1">
// //       <SidebarProfile
// //         isSidebarOpen={isSidebarOpen}
// //         toggleSidebar={toggleSidebar}
// //         handleTabChange={handleTabChange}
// //         activeTab={activeTab}
// //         filteredNavigation={filteredNavigation}
// //       />

// //       {/* Main Content */}
// //       <div className="flex-1 flex flex-col ml-0 h-full overflow-y-auto z-50">
// //         <div className="flex-grow">
// //           <div className="p-4 sm:p-8 mt-1 lg:mt-0 xl:mt-0 2xl:mt-0">
// //             <Outlet />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Overlay */}
// //       {isSidebarOpen && (
// //         <div
// //           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
// //           onClick={toggleSidebar}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default AccountSettingsSidebar;

// import { useCallback, useEffect, useState } from 'react';
// import Cookies from "js-cookie";
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import SidebarProfile from './account/Sidebar';
// import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';
// import { usePermissions } from "../../../Context/PermissionsContext"; // Adjust path if needed
// import {
//   Cog6ToothIcon,
//   BuildingOfficeIcon,
//   CreditCardIcon,
//   KeyIcon,
//   BellIcon,
//   ChartBarIcon,
//   WalletIcon,
//   UserGroupIcon,
//   UserIcon,
//   ShareIcon,
//   UsersIcon,
//   GlobeAltIcon,
//   CodeBracketIcon,
//   ArrowsRightLeftIcon
// } from '@heroicons/react/24/outline';

// const AccountSettingsSidebar = () => {
//   const { effectivePermissions, superAdminPermissions } = usePermissions();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const location = useLocation();
//   const pathParts = location.pathname.split('/');
//   const activeTab = pathParts.includes('my-profile') ? 'my-profile' : (pathParts[2] || 'profile');

//   const authToken = Cookies.get("authToken");
//   const tokenPayload = decodeJwt(authToken);
//   const organization = tokenPayload?.organization;

//   // Define navigation data
//   const mainNavigation = [
//     { name: 'Company Profile', icon: BuildingOfficeIcon, id: 'profile' },
//     { name: 'My Profile', icon: UserIcon, id: 'my-profile' },
//     { name: 'Billing', icon: CreditCardIcon, id: 'billing-details' },
//     { name: 'Subscription', icon: Cog6ToothIcon, id: 'subscription' },
//     { name: 'Wallet', icon: WalletIcon, id: 'wallet' },
//     { name: 'Security', icon: KeyIcon, id: 'security' },
//     { name: 'Usage', icon: ChartBarIcon, id: 'usage' },
//     { name: 'Users', icon: UsersIcon, id: 'users' },
//     { name: 'Interviewer Groups', icon: UserGroupIcon, id: 'interviewer-groups' },
//     { name: 'Roles', icon: UserIcon, id: 'roles' },
//     { name: 'Sharing Settings', icon: ShareIcon, id: 'sharing' },
//     { name: 'Subdomain Management', icon: GlobeAltIcon, id: 'sub-domain' },
//     { name: 'Notifications', icon: BellIcon, id: 'email-settings' },
//     { name: 'Notification Settings', icon: BellIcon, id: 'notifications' },
//   ];

//   const integrationNavigation = [
//     { name: 'Webhooks', icon: CodeBracketIcon, id: 'webhooks' },
//     { name: 'HRMS/ATS API', icon: ArrowsRightLeftIcon, id: 'hrms-ats' }
//   ];

//   const navigation = [
//     {
//       category: 'Account',
//       items: mainNavigation
//     },
//     {
//       category: 'Integrations',
//       items: integrationNavigation
//     }
//   ];

//   const filteredNavigation = navigation.map(section => ({
//     ...section,
//     items: section.items.filter(item => {
//       if ([
//         'profile',
//         'users',
//         'sub-domain',
//         'roles',
//         'interviewer-groups',
//         'sharing',
//         'webhooks',
//         'hrms-ats'
//       ].includes(item.id)) {
//         return organization;
//       }
//       return true;
//     })
//   }));

//   return (
//     <div className="h-screen fixed w-full pb-14 bg-gray-50 flex mt-1">
//       <SidebarProfile
//         isSidebarOpen={isSidebarOpen}
//         toggleSidebar={toggleSidebar}
//         handleTabChange={handleTabChange}
//         activeTab={activeTab}
//         filteredNavigation={filteredNavigation}
//       />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col ml-0 h-full overflow-y-auto z-50">
//         <div className="flex-grow">
//           <div className="p-4 sm:p-8 mt-1 lg:mt-0 xl:mt-0 2xl:mt-0">
//             <Outlet />
//           </div>
//         </div>
//       </div>

//       {/* Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
//           onClick={toggleSidebar}
//         />
//       )}
//     </div>
//   );
// };

// export default AccountSettingsSidebar;

import { useCallback, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SidebarProfile from './account/Sidebar';
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';
import { usePermissions } from "../../../Context/PermissionsContext";
import AuthCookieManager from '../../../utils/AuthCookieManager/AuthCookieManager';
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
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const AccountSettingsSidebar = () => {
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get user type from AuthCookieManager
  const userType = AuthCookieManager.getUserType();

  // Select permissions based on user type
  let permissions = userType === 'superAdmin' ? superAdminPermissions : effectivePermissions;
  
  // Fallback for super admin when superAdminPermissions is null
  // if (userType === 'superAdmin' && !superAdminPermissions) {
  //   console.log('🔍 Super admin permissions not loaded, using fallback permissions');
  //   permissions = {
  //     SuperAdminMyProfile: {
  //       ViewTab: true
  //     },
  //     SuperAdminRole: {
  //       ViewTab: true
  //     },
  //     SuperAdminUser: {
  //       ViewTab: true
  //     }
  //   };
  // }

  // Extract active tab from URL
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.includes('my-profile') ? 'my-profile' : (pathParts[2] || 'profile');

  // Decode auth token to check for organization
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;

  // Define navigation data with better categorization
  const accountNavigation = [
    { name: 'Company Profile', icon: BuildingOfficeIcon, id: 'profile' },
    { name: 'My Profile', icon: UserIcon, id: 'my-profile' },
  ];

  const billingNavigation = [
    { name: 'Billing', icon: CreditCardIcon, id: 'billing-details' },
    { name: 'Subscription', icon: Cog6ToothIcon, id: 'subscription' },
    { name: 'Wallet', icon: WalletIcon, id: 'wallet' },
  ];

  const securityNavigation = [
    { name: 'Security', icon: KeyIcon, id: 'security' },
    { name: 'Usage', icon: ChartBarIcon, id: 'usage' },
  ];

  const organizationNavigation = [
    { name: 'Users', icon: UsersIcon, id: 'users' },
    { name: 'Interviewer Groups', icon: UserGroupIcon, id: 'interviewer-groups' },
    { name: 'Roles', icon: UserIcon, id: 'roles' },
  ];

  const settingsNavigation = [
    { name: 'Sharing Settings', icon: ShareIcon, id: 'sharing' },
    { name: 'Subdomain Management', icon: GlobeAltIcon, id: 'sub-domain' },
    { name: 'Notifications', icon: BellIcon, id: 'email-settings' },
    { name: 'Notification Settings', icon: BellIcon, id: 'notifications' },
  ];

  const integrationNavigation = [
    { name: 'Webhooks', icon: CodeBracketIcon, id: 'webhooks' },
    { name: 'HRMS/ATS API', icon: ArrowsRightLeftIcon, id: 'hrms-ats' }
  ];

  const navigation = [
    {
      category: 'Account Management',
      items: accountNavigation
    },
    {
      category: 'Billing & Payments',
      items: billingNavigation
    },
    {
      category: 'Security & Usage',
      items: securityNavigation
    },
    {
      category: 'Organization',
      items: organizationNavigation
    },
    {
      category: 'Settings',
      items: settingsNavigation
    },
    {
      category: 'Integrations',
      items: integrationNavigation
    }
  ];

  // Map navigation item IDs to permission objects
  const permissionMap = {
    'my-profile': 'MyProfile',
    'profile': 'CompanyProfile',
    'billing-details': 'Billing',
    'subscription': 'Subscription',
    'wallet': 'Wallet',
    'security': 'Security',
    'notifications': 'NotificationsSettings',
    'email-settings': 'Notification',
    'usage': 'Usage',
    'users': 'Users',
    'interviewer-groups': 'InterviewerGroups',
    'roles': 'Roles',
    'sharing': 'Sharing',
    'sub-domain': 'Subdomain',
    'webhooks': 'Webhooks',
    'hrms-ats': 'HrmsAts'
  };
  
  console.log('🔍 AccountSettingsSidebar Permission Map Debug:', {
    userType,
    permissionMap,
    availablePermissionKeys: permissions ? Object.keys(permissions) : []
  });

  // Filter navigation based on user type and permissions
  console.log('🔍 AccountSettingsSidebar Debug:', {
    userType,
    permissions,
    superAdminPermissions,
    effectivePermissions,
    organization,
    permissionMap
  });
  
  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (userType === 'superAdmin') {
        // For super admin, only show specific items that they have permissions for
        const superAdminItems = ['my-profile', 'roles', 'users'];
        
        if (!superAdminItems.includes(item.id)) {
          console.log(`🔍 SuperAdmin filtering out ${item.id}: not in super admin items list`);
          return false;
        }
        
        const permissionKey = permissionMap[item.id];
        let permissionObject = permissions?.[permissionKey];
        
        // Fallback: if the permission key doesn't exist, try alternative keys
        // if (!permissionObject) {
        //   const alternativeKeys = {
        //     'my-profile': ['MyProfile', 'Profile', 'SuperAdminProfile'],
        //     'roles': ['Roles', 'Role', 'SuperAdminRole'],
        //     'users': ['Users', 'User', 'SuperAdminUser']
        //   };
          
        //   const keysToTry = alternativeKeys[item.id] || [];
        //   for (const key of keysToTry) {
        //     if (permissions?.[key]) {
        //       console.log(`🔍 Using alternative permission key for ${item.id}: ${key}`);
        //       permissionObject = permissions[key];
        //       break;
        //     }
        //   }
        // }
        
        const hasPermission = permissionObject?.ViewTab ?? true; // Default to true for super admin if permissions not loaded
        console.log(`🔍 SuperAdmin ${item.id}:`, {
          permissionKey: permissionMap[item.id],
          permissionObject,
          hasPermission
        });
        return hasPermission;
      }
      
      // For non-super admin users
      const permissionKey = permissionMap[item.id];
      if (!permissions || !permissionKey) {
        console.log(`🔍 Non-super admin filtering out ${item.id}: no permissions or permission key`);
        return false;
      }
      
      if (['profile', 'users', 'sub-domain', 'roles', 'interviewer-groups', 'sharing', 'webhooks', 'hrms-ats'].includes(item.id)) {
        return organization && permissions[permissionKey]?.ViewTab;
      }
      return permissions[permissionKey]?.ViewTab;
    })
  })).filter(section => section.items.length > 0);
  
  console.log('📋 Filtered Navigation:', filteredNavigation);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleTabChange = (tabId) => {
    const basePath = '/account-settings';
    if (tabId === 'my-profile') {
      navigate(`${basePath}/my-profile/basic`);
      setIsSidebarOpen(true);
    } else if (tabId === 'profile' && organization && userType !== 'superAdmin') {
      navigate(`${basePath}/profile`);
    } else {
      navigate(`${basePath}/${tabId}`);
    }
  };

  useEffect(() => {
    const basePath = '/account-settings';
    if (location.pathname === basePath) {
      if (organization && userType !== 'superAdmin') {
        navigate(`${basePath}/profile`, { replace: true });
      } else {
        navigate(`${basePath}/my-profile/basic`, { replace: true });
      }
    }

    if (location.pathname === `${basePath}/my-profile`) {
      navigate(`${basePath}/my-profile/basic`, { replace: true });
    }
  }, [location.pathname, navigate, organization, userType]);

  return (
    <div className="h-screen fixed w-full pb-14 bg-gray-50 flex mt-1">
      <SidebarProfile
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleTabChange={handleTabChange}
        activeTab={activeTab}
        filteredNavigation={filteredNavigation}
        userType={userType}
        permissions={permissions}
      />

      <div className="flex-1 flex flex-col ml-0 h-full overflow-y-auto z-50">
        <div className="flex-grow">
          <div className="p-4 sm:p-8 mt-1 lg:mt-0 xl:mt-0 2xl:mt-0">
            <Outlet />
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AccountSettingsSidebar;