// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - fixed style issues

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BasicDetailsTab from "./BasicDetails/BasicDetails";
import AdvancedDetails from "./AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "./InterviewDetails/InterviewDetails";
import AvailabilityUser from "./AvailabilityDetailsUser/AvailabilityUser";
import { DocumentsSection } from "./DocumentsDetails/DocumentsSection";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { usePermissions } from "../../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../../utils/permissionUtils";
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import {
  useUserProfile,
  useSingleContact,
} from "../../../../../apiHooks/useUsers";

// Loading Skeleton for Basic Details
const BasicDetailsSkeleton = () => {
  return (
    <div className="mt-2 mx-2">
      <div>
        {/* Header buttons skeleton */}
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 my-4 transition-colors">
            Edit
          </button>
        </div>

        {/* Content skeleton */}
        <div className="skeleton-animation bg-white rounded-lg px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Advanced Details
const AdvancedDetailsSkeleton = () => {
  return (
    <div className="mt-2 mx-2">
      <div>
        {/* Header buttons skeleton */}
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 my-4 transition-colors">
            Edit
          </button>
        </div>

        {/* Content skeleton */}
        <div className="skeleton-animation bg-white rounded-lg px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-36"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Interview Details
const InterviewDetailsSkeleton = () => {
  return (
    <div className="mt-2 mx-2">
      <div>
        {/* Header buttons skeleton */}
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 my-4 transition-colors">
            Edit
          </button>
        </div>

        {/* Content skeleton */}
        <div className="skeleton-animation space-y-6 bg-white rounded-lg p-4 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          {[1, 2, 3].map((section) => (
            <div key={section}>
              <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item}>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Availability Details
const AvailabilityDetailsSkeleton = () => {
  return (
    <div className="mt-2 mx-2">
      <div>
        {/* Header buttons skeleton */}
        <div className="flex items-center justify-end mb-4">
          <button className="px-4 py-2 text-sm bg-custom-blue text-white rounded-lg ml-2 my-4 transition-colors">
            Edit
          </button>
        </div>

        {/* Content skeleton */}
        <div className="skeleton-animation space-y-6 bg-white rounded-lg p-4 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="border-b pb-4">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((time) => (
                  <div key={time}>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-28"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Documents Section
const DocumentsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="skeleton-animation">
        {/* Header buttons skeleton */}
        <div className="flex items-center justify-end py-2 mb-4">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {[1, 2].map((doc) => (
            <div key={doc} className="border rounded-lg p-4">
              <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MyProfile = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const userType = AuthCookieManager.getUserType();
  const location = useLocation();
  const navigate = useNavigate();

  const { singleContact, isLoading: singleContactLoading } = useSingleContact();
  const { userProfile, isLoading: userProfileLoading } = useUserProfile();

  // console.log("singleContact", singleContact);

  const { effectivePermissions, superAdminPermissions } = usePermissions();

  // Select permissions based on user type
  const permissions =
    userType === "superAdmin" ? superAdminPermissions : effectivePermissions;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload.userId;

  const isEditMode = location.pathname.includes("-edit");
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [roleName, setRoleName] = useState("");

  // Extract path segments from URL
  const pathSegments = location.pathname.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  const secondLastSegment = pathSegments[pathSegments.length - 2];

  const [documents, setDocuments] = useState({
    resume: null,
    coverLetter: null,
  });

  // Determine subtab based on whether we're in edit mode
  const subtab = useMemo(() => {
    if (isEditMode) {
      return secondLastSegment?.split("-edit")[0]; // e.g. "basic" from "basic-edit"
    } else {
      return lastSegment;
    }
  }, [isEditMode, lastSegment, secondLastSegment]);

  useEffect(() => {
    const fetchData = () => {
      try {
        // singleContact is now a single object, not an array
        const contact = singleContact;

        if (contact) {
          const role = contact?.ownerId?.roleId?.roleName || "";
          setRoleName(role);
          const freelancerStatus = contact?.ownerId?.isFreelancer === "true";
          setIsFreelancer(freelancerStatus);
        } else {
          setIsFreelancer(false); // Default value if user not found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsFreelancer(false); // Default value on error
      }
    };

    if (userId && singleContact !== null) {
      fetchData();
    }
  }, [userId, singleContact]);

  const activeTab = subtab || "basic";

  const handleSubTabChange = (tab) => {
    navigate(`/account-settings/my-profile/${tab}`);
  };

  // Redirect to basic if subtab is invalid
  useEffect(() => {
    const validSubtabs = [
      "basic",
      "advanced",
      "interview",
      "availability",
      "documents",
    ];
    if (!validSubtabs.includes(subtab)) {
      navigate("/account-settings/my-profile/basic", { replace: true });
    }
  }, [subtab, navigate, isFreelancer, roleName]);

  // Render subtab content with loading states
  const renderSubTabContent = () => {
    // Show skeleton if loading
    if (userProfileLoading) {
      const skeletonComponents = {
        basic: <BasicDetailsSkeleton />,
        advanced: <AdvancedDetailsSkeleton />,
        interview: <InterviewDetailsSkeleton />,
        availability: <AvailabilityDetailsSkeleton />,
        documents: <DocumentsSkeleton />,
      };
      return skeletonComponents[activeTab] || skeletonComponents["basic"];
    }

    // Show actual content when not loading
    const subTabComponents = {
      basic: <BasicDetailsTab mode="profile" usersId={userId} />,
      advanced: <AdvancedDetails mode="profile" usersId={userId} />,
      interview: <InterviewUserDetails mode="profile" usersId={userId} />,
      availability: <AvailabilityUser mode="profile" usersId={userId} />,
      documents: (
        <DocumentsSection documents={documents} onUpdate={setDocuments} />
      ),
    };
    return subTabComponents[activeTab] || subTabComponents["basic"];
  };

  // Build a list of tabs that the current user is allowed to see based on user type
  // console.log('🔍 MyProfile Debug:', {
  //   userType,
  //   isInitialized,
  //   permissions,
  //   hasMyProfilePermission: permissions?.MyProfile?.ViewTab
  // });

  const tabsToShow = [
    permissions?.MyProfile?.Basic && "basic",
    permissions?.MyProfile?.Advance && "advanced",
    permissions?.MyProfile?.Interview && "interview",
    permissions?.MyProfile?.Availability && "availability",
    permissions?.MyProfile?.Documents && "documents",
  ].filter(Boolean);

  // console.log('📋 Tabs to show:', tabsToShow);

  return (
    // v1.0.0 <------------------------------------------------------------------------------------
    // <div className="flex flex-col h-full">
    //   {/* Tabs */}
    //   <div className="flex-1">
    //     <div className="flex flex-col w-full">
    //       <div className="border-b sm:mx-0 md:mx-0 lg:mx-6 xl:mx-6 2xl:mx-6 sm:mt-4 md:mt-4 mt-0">
    //         <nav className="flex space-x-8 sm:space-x-4 overflow-x-auto lg:overflow-x-hidden">
    //           {tabsToShow.map((tabKey) => (
    //             <button
    //               key={tabKey}
    //               onClick={() => handleSubTabChange(tabKey)}
    //               className={`py-4 px-1 border-b-2 font-medium text-sm ${
    //                 activeTab === tabKey
    //                   ? "border-custom-blue text-custom-blue"
    //                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    //               }`}
    //             >
    //               {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}{" "}
    //               <span className="sm:hidden md:hidden lg:hidden inline">
    //                 Details
    //               </span>
    //             </button>
    //           ))}
    //         </nav>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="sm:mx-0 mx-6">
    //     {!isEditMode && renderSubTabContent()}
    //     {isEditMode && (
    //       <>
    //         <Outlet /> {renderSubTabContent()}
    //       </>
    //     )}
    //   </div>
    // </div>
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex-1">
        <div className="flex flex-col w-full">
          <div className="border-b sm:mx-0 md:mx-0  sm:mt-6 md:mt-6 mt-0">
            <nav className="flex overflow-x-auto lg:overflow-x-hidden scrollbar-hide sm:gap-0 gap-8">
              {tabsToShow.map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => handleSubTabChange(tabKey)}
                  className={`
                    flex-shrink-0 
                    w-1/2 sm:w-1/3 md:w-auto
                    lg:w-auto xl:w-auto 2xl:w-auto
                    text-center py-4 sm:px-0 px-2 border-b-2 font-medium text-sm
                    ${
                      activeTab === tabKey
                        ? "border-custom-blue text-custom-blue"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}{" "}
                  <span className="sm:hidden md:hidden lg:hidden inline">
                    Details
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:mx-0">
        {!isEditMode && renderSubTabContent()}
        {isEditMode && (
          <>
            <Outlet /> {renderSubTabContent()}
          </>
        )}
      </div>
    </div>

    // v1.0.0 ------------------------------------------------------------------------------------>
  );
};

export default MyProfile;
