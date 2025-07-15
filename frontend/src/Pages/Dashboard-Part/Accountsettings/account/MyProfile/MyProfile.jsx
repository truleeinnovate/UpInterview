import { useEffect, useMemo, useState } from 'react';
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BasicDetailsTab from './BasicDetails/BasicDetails';
import AdvancedDetails from './AdvancedDetails/AdvacedDetails';
import InterviewUserDetails from './InterviewDetails/InterviewDetails';
import AvailabilityUser from './AvailabilityDetailsUser/AvailabilityUser';
import { DocumentsSection } from './DocumentsDetails/DocumentsSection';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { usePermissions } from '../../../../../Context/PermissionsContext';
import { usePermissionCheck } from '../../../../../utils/permissionUtils';
import AuthCookieManager from '../../../../../utils/AuthCookieManager/AuthCookieManager';

const MyProfile = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const userType = AuthCookieManager.getUserType();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { singlecontact } = useCustomContext();
  console.log("singlecontact", singlecontact);
  
  const { effectivePermissions, superAdminPermissions } = usePermissions();

  // Select permissions based on user type
  const permissions = userType === 'superAdmin' ? superAdminPermissions : effectivePermissions;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload.userId;

  const isEditMode = location.pathname.includes('-edit');
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [roleName, setRoleName] = useState("");

  // Extract path segments from URL
  const pathSegments = location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  const secondLastSegment = pathSegments[pathSegments.length - 2];

  const [documents, setDocuments] = useState({
    resume: null,
    coverLetter: null,
  });

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
        const contact = singlecontact[0]; 

        if (contact) {
          const role = contact?.ownerId?.roleId?.roleName || "";
          setRoleName(role);
          const freelancerStatus = contact?.ownerId?.isFreelancer === "true";
          setIsFreelancer(freelancerStatus);
        } else {
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
  }, [userId, singlecontact]);

  const activeTab = subtab || 'basic';

  const handleSubTabChange = (tab) => {
    navigate(`/account-settings/my-profile/${tab}`);
  };

  // Redirect to basic if subtab is invalid
  useEffect(() => {
    const validSubtabs = ['basic', 'advanced', 'interview', 'availability', 'documents'];
    if (!validSubtabs.includes(subtab)) {
      navigate('/account-settings/my-profile/basic', { replace: true });
    }
  }, [subtab, navigate, isFreelancer, roleName]);

  // Render subtab content
  const renderSubTabContent = () => {
    const subTabComponents = {
      basic: <BasicDetailsTab />,
      advanced: <AdvancedDetails />,
      interview: <InterviewUserDetails />,
      availability: <AvailabilityUser />,
      documents: <DocumentsSection documents={documents} onUpdate={setDocuments} />,
    };
    return subTabComponents[activeTab] || subTabComponents['basic'];
  };

  // Build a list of tabs that the current user is allowed to see based on user type
  console.log('🔍 MyProfile Debug:', {
    userType,
    isInitialized,
    permissions,
    hasMyProfilePermission: permissions?.MyProfile?.ViewTab
  });
  
  const tabsToShow = [
    permissions?.MyProfile?.Basic && 'basic',
    permissions?.MyProfile?.Advance && 'advanced',
    permissions?.MyProfile?.Interview && 'interview',
    permissions?.MyProfile?.Availability && 'availability',
    permissions?.MyProfile?.Documents && 'documents',
  ].filter(Boolean);
  
  console.log('📋 Tabs to show:', tabsToShow);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Tabs */}
      <div className="flex-1">
        <div className="flex flex-col w-full sm:mt-10 md:mt-20">
          <div className="border-b ml-6 mr-6">
            <nav className="flex space-x-8">
              {tabsToShow.map(tabKey => (
                <button
                  key={tabKey}
                  onClick={() => handleSubTabChange(tabKey)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tabKey
                      ? 'border-custom-blue text-custom-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} Details
                </button>
              ))}
            </nav>
          </div>
          <div className="ml-6 mr-6">
            {!isEditMode && renderSubTabContent()}
            {isEditMode && <><Outlet /> {renderSubTabContent()}</>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;