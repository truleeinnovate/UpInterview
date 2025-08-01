import { useCallback, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';
import SidebarProfile from './account/Sidebar';
import { usePermissions } from "../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../utils/permissionUtils";
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
  const { checkPermission, isInitialized, loading } = usePermissionCheck();
  const { effectivePermissions, superAdminPermissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get user type from AuthCookieManager
  const userType = AuthCookieManager.getUserType();

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
  

  // Filter navigation based on user type and permissions using direct checkPermission
  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (userType === 'superAdmin') {
        // For super admin, only show specific items that they have permissions for
        const superAdminItems = ['my-profile', 'roles', 'users'];
        
        if (!superAdminItems.includes(item.id)) {
          // console.log(`🔍 SuperAdmin filtering out ${item.id}: not in super admin items list`);
          return false;
        }
        
        const permissionKey = permissionMap[item.id];
        const hasPermission = checkPermission(permissionKey);
        
        // console.log(`🔍 SuperAdmin ${item.id}:`, {
        //   permissionKey: permissionMap[item.id],
        //   hasPermission
        // });
        return hasPermission;
      }
      
      // For non-super admin users
      const permissionKey = permissionMap[item.id];
      if (!permissionKey) {
        // console.log(`🔍 Non-super admin filtering out ${item.id}: no permission key`);
        return false;
      }
      
      const hasPermission = checkPermission(permissionKey);
      
      if (['profile', 'users', 'sub-domain', 'roles', 'interviewer-groups', 'sharing', 'webhooks', 'hrms-ats'].includes(item.id)) {
        return organization && hasPermission;
      }
      return hasPermission;
    })
  })).filter(section => section.items.length > 0);
  
  // console.log('📋 Filtered Navigation:', filteredNavigation);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === 'my-profile') {
      navigate('/account-settings/my-profile/basic');
      setIsSidebarOpen(true);
    } else if (tabId === 'profile' && organization && userType !== 'superAdmin') {
      navigate('/account-settings/profile');
    } else {
      navigate(`/account-settings/${tabId}`);
    }
  };

  useEffect(() => {
    if (location.pathname === '/account-settings') {
      if (organization && userType !== 'superAdmin') {
        navigate('/account-settings/profile', { replace: true });
      } else {
        navigate('/account-settings/my-profile/basic', { replace: true });
      }
    }

    if (location.pathname === '/account-settings/my-profile') {
      navigate('/account-settings/my-profile/basic', { replace: true });
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
        permissions={userType === 'superAdmin' ? superAdminPermissions : effectivePermissions}
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