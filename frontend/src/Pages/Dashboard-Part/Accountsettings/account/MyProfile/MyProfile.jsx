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

const MyProfile = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { singlecontact } = useCustomContext();
  console.log("singlecontact", singlecontact);
  
  const { effectivePermissions, superAdminPermissions } = usePermissions();

  // Select permissions based on type
  let permissions = type === 'superAdmin' ? superAdminPermissions : effectivePermissions;
  const permissionKey = type === 'superAdmin' ? 'SuperAdminMyProfile' : 'MyProfile';
  
  // Fallback for super admin when superAdminPermissions is null
  if (type === 'superAdmin' && !superAdminPermissions) {
    console.log('🔍 Super admin permissions not loaded, using fallback permissions');
    permissions = {
      SuperAdminMyProfile: {
        Basic: true,
        Advanced: true,
        Interview: false,
        Availability: false,
        Documents: false,
        ViewTab: true
      },
      SuperAdminRole: {
        ViewTab: true
      },
      SuperAdminUser: {
        ViewTab: true
      }
    };
  }
  
  console.log('🔍 Permission Key Debug:', {
    type,
    permissionKey,
    hasSuperAdminPermissions: !!superAdminPermissions,
    superAdminPermissionKeys: superAdminPermissions ? Object.keys(superAdminPermissions) : [],
    hasEffectivePermissions: !!effectivePermissions,
    effectivePermissionKeys: effectivePermissions ? Object.keys(effectivePermissions) : []
  });

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
  const basePath = type === 'superAdmin' ? '/super-admin-account-settings' : '/account-settings';

  const handleSubTabChange = (tab) => {
    
    navigate(`${basePath}/my-profile/${tab}`);
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
      basic: <BasicDetailsTab type={type} basePath={basePath} />,
      advanced: <AdvancedDetails type={type} basePath={basePath} />,
      interview: <InterviewUserDetails type={type} basePath={basePath} />,
      availability: <AvailabilityUser type={type} basePath={basePath} />,
      documents: <DocumentsSection documents={documents} onUpdate={setDocuments} type={type} basePath={basePath} />,
    };
    return subTabComponents[activeTab] || subTabComponents['basic'];
  };

  // Build a list of tabs that the current user is allowed to see
  console.log('🔍 MyProfile Debug:', {
    type,
    permissionKey,
    permissions,
    superAdminPermissions,
    effectivePermissions,
    permissionObject: permissions?.[permissionKey],
    allPermissionKeys: Object.keys(permissions || {})
  });
  
  // Fallback: if the permission key doesn't exist, try alternative keys
  let permissionObject = permissions?.[permissionKey];
  if (!permissionObject && type === 'superAdmin') {
    // Try alternative keys for super admin
    const alternativeKeys = ['MyProfile', 'Profile', 'SuperAdminProfile'];
    for (const key of alternativeKeys) {
      if (permissions?.[key]) {
        console.log(`🔍 Using alternative permission key: ${key}`);
        permissionObject = permissions[key];
        break;
      }
    }
  }
  
  // If still no permission object found, use default permissions for super admin
  if (!permissionObject && type === 'superAdmin') {
    console.log('🔍 No permission object found, using default super admin permissions');
    permissionObject = {
      Basic: true,
      Advanced: true,
      Interview: false,
      Availability: false,
      Documents: false
    };
  }
  
  const tabsToShow = [
    permissionObject?.Basic && 'basic',
    permissionObject?.Advance && 'advanced',
    permissionObject?.Interview && 'interview',
    permissionObject?.Availability && 'availability',
    permissionObject?.Documents && 'documents',
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