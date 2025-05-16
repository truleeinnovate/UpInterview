import { useCallback, useEffect, useMemo, useState } from 'react'
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import BasicDetailsTab from './BasicDetails/BasicDetails'
import AdvancedDetails from './AdvancedDetails/AdvacedDetails';
import InterviewUserDetails from './InterviewDetails/InterviewDetails'
import AvailabilityUser from './AvailabilityDetailsUser/AvailabilityUser'
import SidebarProfile from '../Sidebar';
import { navigation } from '../../mockData/navigationData';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';

export function MyProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {contacts} = useCustomContext();
  // const subtab = location.pathname.split('/').pop();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isEditMode = location.pathname.includes('-edit');
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [roleName, setRoleName] = useState("");

   // Extract path segments from URL
   const pathSegments = location.pathname.split('/');
   const lastSegment = pathSegments[pathSegments.length - 1];
   const secondLastSegment = pathSegments[pathSegments.length - 2];
  
  

   // Determine subtab based on whether we're in edit mode
   const subtab = useMemo(() => {
    if (isEditMode) {
      return secondLastSegment?.split('-edit')[0]; // e.g. "basic" from "basic-edit"
    } else {
      return lastSegment;
    }
  }, [isEditMode, lastSegment, secondLastSegment]);

  useEffect(() => {
    const fetchData = () => {
      try {
        const user = contacts.find(user => user.ownerId === userId);

        // console.log("user subtab ",user);

        if (user) {
          const role = user?.ownerId?.roleId?.roleName || "";
          
          setRoleName(role);
          const freelancerStatus = user.isFreelancer === "true";
          setIsFreelancer(freelancerStatus);
        } else {
          // console.warn('User not found in contacts');
          setIsFreelancer(false); // Default value if user not found
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsFreelancer(false); // Default value on error
      }
    };
  
    if (userId) {
      fetchData();
    }
  }, [userId, contacts]); // Added contacts to dependencies

  // console.log("location.pathname", location.pathname, "subtab",subtab)

  // const activeTab = location.pathname.split('/').pop() || 'basic';
  const activeTab = subtab || 'basic'
  // || 'basic';

  // console.log('MyProfile activeTab:', activeTab, 'isEditMode:', isEditMode);


  const handleSubTabChange = (tab) => {
    navigate(`/account-settings/my-profile/${tab}`);
    // navigate(tab);
  };



  // Redirect to basic if subtab is invalid
  useEffect(() => {
    const validSubtabs = isFreelancer || roleName === "Internal_Interviewer"
    ? ['basic', 'advanced', 'interview', 'availability'] 
    : ['basic', 'advanced',];
    // const validSubtabs = ['basic', 'advanced', 'interview', 'availability'];
    if (!validSubtabs.includes(subtab)) {
      navigate('/account-settings/my-profile/basic', { replace: true });
    }
  }, [subtab, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);




  // Updated renderSubTabContent with correct component mapping
  const renderSubTabContent = () => {
    // if (isEditMode) {
    //   return <Outlet />;
    // }
    const subTabComponents = {
      basic: 
      <BasicDetailsTab />
      ,
      advanced: <AdvancedDetails />,
      interview: <InterviewUserDetails />,
      availability: <AvailabilityUser />,
    };
    // console.log('Current active tab:', activeTab);
    return subTabComponents[activeTab] || subTabComponents['basic'];
  };

  const tabsToShow = isFreelancer || roleName === "Internal_Interviewer"
    ? ['basic', 'advanced', 'interview', 'availability'] 
    : ['basic', 'advanced'];



  return (
    <div className="flex flex-col h-full  bg-gray-50 " >

      {/* Tabs */}
      <div className="flex-1 ">
      <div className='flex flex-col w-full sm:mt-10 md:mt-20'>
        <div className="border-b ml-6 mr-6">
          <nav className="flex space-x-8">
            {tabsToShow.map(tabKey => (
              <button
                key={tabKey}
                onClick={() => handleSubTabChange(tabKey)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabKey
                    ? 'border-custom-blue text-custom-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} Details
              </button>
            ))}

          </nav>
        </div>
        <div className=" ml-6 mr-6 ">
         
         {/* {renderSubTabContent()} */}
         {!isEditMode && renderSubTabContent()}
            {/* Render Outlet for edit mode */}
            {isEditMode && <> <Outlet /> {renderSubTabContent()} </>}

         {/* <Outlet /> */}
       
       </div>
       
      </div>
      </div>

          {/* Content Area - takes 40% width */}

          
          
        {/* <div className="hidden lg:block lg:w-[40%] border-l pl-4 overflow-y-auto"> */}
          {/* <Outlet /> */}
        {/* </div> */}
      


      {/* Overlay */}
      {/* {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden xl:hidden 2xl:hidden"
          onClick={toggleSidebar}
        />
      )} */}




    </div>
  )
}