import { useCallback, useEffect, useState } from 'react'
import { navigation } from './mockData/navigationData'

import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import SidebarProfile from './account/Sidebar'
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode';

const AccountSettingsSidebar = () => {
  // const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.includes('my-profile') ? 'my-profile' : (pathParts[2] || 'profile');

  // const activeTab = tab || 'profile'

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload.organization;

  console.log("organization in accountsettings", organization);
  
  // const isInMyProfile = location.pathname.includes('/my-profile');


// console.log('tab tab tab:', activeTab, );


const toggleSidebar = useCallback(() => {
  setIsSidebarOpen((prev) => !prev);
}, []);

const handleTabChange = (tabId) => {
  // If navigating to my-profile, default to basic subtab
  if (tabId === 'my-profile') {
    navigate(`/account-settings/my-profile/basic`);
    setIsSidebarOpen(true); // Keep sidebar open for my-profile
  } else if (tabId === 'profile' && organization) {
    navigate(`/account-settings/profile`);
  } else {
 
    navigate(`/account-settings/${tabId}`);
  }
};

useEffect(() => {
  if (location.pathname === '/account-settings') {
    if (organization) {
      navigate('/account-settings/profile', { replace: true });
    } else {
      navigate('/account-settings/my-profile/basic', { replace: true });
    }
  }

   // For my-profile, ensure it goes to basic by default
   if (location.pathname === '/account-settings/my-profile') {
    navigate('/account-settings/my-profile/basic', { replace: true });
  }
  // if (location.pathname === '/account-settings/my-profile') {
  //   navigate('/account-settings/my-profile/basic', { replace: true });
  // }
}, [location.pathname, navigate,organization]);

    // Filter navigation to exclude "Company Profile" when organization is false
    // const filteredNavigation = navigation.map(section => ({
    //   ...section,
    //   items: section.items.filter(item => organization || item.id !== 'profile')
    // }));
    const filteredNavigation = navigation.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.id === 'profile') return organization;
        // if (item.id === 'my-profile') return !organization;
        return true;
      })
    }));

 // Main content renderer based on active tab
//  const renderContent = () => {
//   if (activeTab === 'my-profile') {
//     return <Outlet />;
//   }

//   const tabComponents = {
//     'profile': <CompanyProfile />,
    
//     'billing': <BillingDetails />,
//     'subscription': <Subscription />,
//     'wallet': <Wallet />,
//     'security': <Security />,
//     'notifications': <NotificationsDetails />,
//     'usage': <Usage />,
//     // 'users': navigate('users'),
//     'users':
//     // navigate('/account-settings/users'),
//      (
//       <>
//         <UsersLayout />
//         {/* <Outlet />  */}
       
//              </>
//     ),
//     'my-team': <MyTeam />,
//     'interviewer-groups': <InterviewerGroups />,
//     'roles': <Role />,
//     'sharing': <Sharing />,
//     'webhooks': <Webhooks />,
//     'hrms-ats': <HrmsAtsApi />
//   };

//   return tabComponents[activeTab] || (
//     <div className="text-center py-10">
//       <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
//       <p className="text-gray-500 mt-2">This section is under development</p>
//     </div>
//   );
// };

  return (
    <div className="min-h-screen bg-gray-50 flex">

        {/* Sidebar */}

        <SidebarProfile 
        isSidebarOpen = {isSidebarOpen}
        toggleSidebar={toggleSidebar}
        handleTabChange ={handleTabChange} 
        activeTab ={activeTab} 
        filteredNavigation={filteredNavigation}/>
      

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
        <div className="flex-grow overflow-y-auto h-screen">
          <div className="p-4 sm:p-8 mt-12 lg:mt-0 xl:mt-0  2xl:mt-0">
            {/* {renderContent()} */}
            <Outlet />
          </div>
          </div>
        </div>
      

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

// Export as default to ensure compatibility with lazy loading
export default AccountSettingsSidebar;