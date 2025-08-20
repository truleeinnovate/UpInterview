// v1.0.0 - Mansoor - adjust the height of navbar (superadmin and normal user) for removing the gap below the navbar and home content and account settings
// v1.0.1  -  Ashraf  -  Assessment_Template permission name changed to AssessmentTemplates
// v1.0.2  -  Ashraf  -  effectivePermissions_RoleName added to smartLogout
// v1.0.3  -  Ashraf  -  updated loading tabs issue
// v1.0.4  -  Ashok   -  changed tab name from "Integrations" to "Integration Logs" in super admin navbar
// v1.0.5  -  Ashraf  -  using authcookie manager to get current tokein 
/* v1.0.6  -  Ashok   -  Added new Tab names "Interviewer Rates" and "Interviewers" under More at Super Admin
                         and improved active name borders under tab names in both nav bars */

import React, { useState, useEffect, useRef } from "react";
import { FaCaretDown, FaCaretUp, FaBars } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import {
  IoMdInformationCircleOutline,
  IoIosArrowDown,
  IoIosArrowUp,
} from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { LiaWalletSolid } from "react-icons/lia";
import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import NotificationPanel from "../../Pages/Push-Notification/NotificationPanel.jsx";
import { smartLogout } from "../../utils/AuthCookieManager/AuthCookieManager";
import { useCustomContext } from "../../Context/Contextfetch.js";
import { usePermissions } from "../../Context/PermissionsContext";
import { usePermissionCheck } from "../../utils/permissionUtils";
import AuthCookieManager from "../../utils/AuthCookieManager/AuthCookieManager";
import { useSingleContact } from "../../apiHooks/useUsers";
import Loading from "../Loading.js";
// <---------------------- v1.0.5
import { getAuthToken, getImpersonationToken } from "../../utils/AuthCookieManager/AuthCookieManager";
// ---------------------- v1.0.5 >

const CombinedNavbar = () => {
  const { checkPermission, isInitialized, loading } = usePermissionCheck();
  // <---------------------- v1.0.2
  const { effectivePermissions_RoleName } = usePermissions();
  // ---------------------- v1.0.2 >
  // <---------------------- v1.0.5
  const location = useLocation();
  const authToken = getAuthToken();
  // ---------------------- v1.0.5 >
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const { userProfile } = useCustomContext();
  const { singleContact, isLoading: singleContactLoading } = useSingleContact();
  const navigate = useNavigate();

  // Get user type
  const userType = AuthCookieManager.getUserType();

  // // Debug permission checks
  // const debugPermissions = () => {
  //   const permissions = [
  //     'Candidates', 'Positions', 'Interviews', 'MockInterviews',
  //     'InterviewTemplates', 'Assessments', 'Analytics', 'SupportDesk',
  //     'QuestionBank', 'Billing', 'Wallet'
  //   ];

  //   console.log('🔍 Permission check results:');
  //   permissions.forEach(permission => {
  //     const hasPermission = checkPermission(permission);
  //     console.log(`  ${permission}: ${hasPermission ? '✅' : '❌'}`);
  //   });
  // };

  // // Debug permissions on mount and when permissions change
  // useEffect(() => {
  //   console.log('🔄 CombinedNavbar permissions changed, debugging...');
  //   debugPermissions();
  // }, [isInitialized, loading]);

  // Format name to capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = formatName(singleContact?.firstName);
  const lastName = formatName(singleContact?.lastName);
  const organization = tokenPayload?.organization;

  // State for dropdowns and sidebar
  const [dropdownState, setDropdownState] = useState({
    assessmentDropdown: false,
    interviewDropdown: false,
    moreDropdown: false,
    outlineDropdown: false,
    profileDropdown: false,
    isNotificationOpen: false,
    isDetailDropdownOpen: false,
    isGettingDropdownOpen: false,
    isQuestionDropdownOpen: false,
    isFunctionDropdownOpen: false,
    isContactDropdownOpen: false,
    isAdditionalDropdownOpen: false,
    isLegalDropdownOpen: false,
    isSidebarOpen: false,
  });

  const [profileImage, setProfileImage] = useState(null);

  // Refs for dropdowns
  const assessmentRef = useRef(null);
  const interviewRef = useRef(null);
  const moreRef = useRef(null);
  const outlineRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Enhanced permission check - use dynamic permissions only
  const enhancedCheckPermission = (permissionKey) => {
 // <-------------------------------v1.0.3
    // If permissions are still loading, show all tabs (do not hide anything)
    if (loading || !isInitialized) return true;
    // ------------------------------v1.0.3 >
    return checkPermission(permissionKey);
  };

  // Utility function to close all dropdowns
  const closeAllDropdowns = React.useCallback((openDropdown = null) => {
    setDropdownState((prevState) => ({
      assessmentDropdown: openDropdown === "assessmentDropdown",
      interviewDropdown: openDropdown === "interviewDropdown",
      moreDropdown: openDropdown === "moreDropdown",
      outlineDropdown: openDropdown === "outlineDropdown",
      profileDropdown: openDropdown === "profileDropdown",
      isNotificationOpen: openDropdown === "isNotificationOpen",
      isDetailDropdownOpen: false,
      isGettingDropdownOpen: false,
      isQuestionDropdownOpen: false,
      isFunctionDropdownOpen: false,
      isContactDropdownOpen: false,
      isAdditionalDropdownOpen: false,
      isLegalDropdownOpen: false,
      isSidebarOpen: prevState.isSidebarOpen,
    }));
  }, []);

  // Toggle functions
  const toggleAssessmentDropdown = () =>
    closeAllDropdowns(
      dropdownState.assessmentDropdown ? null : "assessmentDropdown"
    );
  const toggleInterviewDropdown = () =>
    closeAllDropdowns(
      dropdownState.interviewDropdown ? null : "interviewDropdown"
    );
  const toggleMoreDropdown = () =>
    closeAllDropdowns(dropdownState.moreDropdown ? null : "moreDropdown");
  const toggleOutlineDropdown = () =>
    closeAllDropdowns(dropdownState.outlineDropdown ? null : "outlineDropdown");
  const toggleProfileDropdown = () =>
    closeAllDropdowns(dropdownState.profileDropdown ? null : "profileDropdown");
  const toggleSidebar = () =>
    setDropdownState((prev) => ({
      ...prev,
      isSidebarOpen: !prev.isSidebarOpen,
    }));

  // Help & training sub-dropdown toggles
  const handleGettingToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isGettingDropdownOpen: !prev.isGettingDropdownOpen,
    }));
  const handleDetailToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isDetailDropdownOpen: !prev.isDetailDropdownOpen,
    }));
  const handleQuestionToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isQuestionDropdownOpen: !prev.isQuestionDropdownOpen,
    }));
  const handleFunctionToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isFunctionDropdownOpen: !prev.isFunctionDropdownOpen,
    }));
  const handleContactToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isContactDropdownOpen: !prev.isContactDropdownOpen,
    }));
  const handleAdditionalToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isAdditionalDropdownOpen: !prev.isAdditionalDropdownOpen,
    }));
  const handleLegalToggle = () =>
    setDropdownState((prev) => ({
      ...prev,
      isLegalDropdownOpen: !prev.isLegalDropdownOpen,
    }));

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For super admin users, only check the refs that are actually used
      const refsToCheck = userType === 'superAdmin'
        ? [moreRef, outlineRef, notificationRef, profileRef]
        : [assessmentRef, interviewRef, moreRef, outlineRef, notificationRef, profileRef];

      if (refsToCheck.every((ref) => ref.current && !ref.current.contains(event.target))) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllDropdowns, userType]);

  const handleSettingsClick = () => {
    closeAllDropdowns();
    navigate("/account-settings");
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    closeAllDropdowns();
    // <---------------------- v1.0.2
    await smartLogout(navigate, setIsLoading, effectivePermissions_RoleName);
    // ---------------------- v1.0.2 >
  };

  // Check if a nav item or icon is active
  const isActive = (path) => location.pathname === path;

  // Define navigation items based on user type
  const getNavigationItems = () => {
    if (userType === 'superAdmin') {
      // Super Admin navigation items
      return [
        {
          path: "/tenants",
          label: "Tenants",
          permissionKey: "Tenants.ViewTab",
        },
        {
          path: "/interviewer-requests",
          label: "Interviewer Requests",
          permissionKey: "InterviewRequest.ViewTab",
        },
        {
          path: "/outsource-interviewers",
          label: "Outsource Interviewers",
          permissionKey: "OutsourceInterviewerRequest.ViewTab",
        },
        {
          path: "/support-desk",
          label: "Support Desk",
          permissionKey: "SupportDesk.ViewTab",
        },
        {
          path: "/admin-billing",
          label: "Billing",
          permissionKey: "Billing.ViewTab",
        },
      ];
    } else {
      // Effective user navigation items - only direct links
      return [
        {
          path: "/candidate",
          label: "Candidates",
          permissionKey: "Candidates.ViewTab",
        },
        {
          path: "/position",
          label: "Positions",
          permissionKey: "Positions.ViewTab",
        },
      ];
    }
  };

  // Define interview dropdown items
  const getInterviewDropdownItems = () => {
    if (userType === 'superAdmin') {
      return [];
    } else {
      return [
        {
          path: "/interview-templates",
          label: "Interview Templates",
          permissionKey: "InterviewTemplates.ViewTab",
        },
        {
          path: "/interviewList",
          label: "Interviews",
          permissionKey: "Interviews.ViewTab",
        },
        {
          path: "/mockinterview",
          label: "Mock Interviews",
          permissionKey: "MockInterviews.ViewTab",
        },
      ];
    }
  };

  // Define assessment dropdown items
  const getAssessmentDropdownItems = () => {
    if (userType === 'superAdmin') {
      return [];
    } else {
      return [
        {
          path: "/assessments-template",
          label: "Assessment Templates",
          // <---------------------- v1.0.1
          permissionKey: "AssessmentTemplates.ViewTab",
          // ---------------------- v1.0.1 >
        },
        {
          path: "/assessments",
          label: "Assessments",
          permissionKey: "Assessments.ViewTab",
        },
      ];
    }
  };

  // Define more dropdown items based on user type
  const getMoreDropdownItems = () => {
    if (userType === 'superAdmin') {
      return [
        {
          path: "/internal-logs",
          label: "Internal Logs",
          permissionKey: "InternalLogs.ViewTab",
        },
        // v1.0.4 <-----------------------------------------------------
        {
          path: "/integrations",
          label: "Integration Logs",
          permissionKey: "IntegrationLogs.ViewTab",
        },
        // v1.0.4 ----------------------------------------------------->
        // v1.0.6 <---------------------------------------------------------
        {
          path: "/interviewer-rates",
          label: "Interviewer Rates",
          // permissionKey: "InterviewerRates.ViewTab",
        },
        {
          path: "/interviewers",
          label: "Interviewers",
          // permissionKey: "Interviewers.ViewTab",
        },
        // v1.0.6 --------------------------------------------------------->
      ];
    } else {
      return [
        {
          path: "/analytics",
          label: "Analytics",
          permissionKey: "Analytics.ViewTab",
        },
        {
          path: "/questionBank",
          label: "Question Bank",
          permissionKey: "QuestionBank.ViewTab",
        },
        {
          path: "/feedback",
          label: "Feedback",
          permissionKey: "Feedback.ViewTab",
        },
        {
          path: "/support-desk",
          label: "Support Desk",
          permissionKey: "SupportDesk.ViewTab",
        },
      ];
    }
  };

  // // Debug specific permission checks
  // const candidatesPermission = checkPermission("Candidates");
  // const positionsPermission = checkPermission("Positions");
  // const interviewsPermission = checkPermission("Interviews");
  // const mockInterviewsPermission = checkPermission("MockInterviews");
  // const interviewTemplatesPermission = checkPermission("InterviewTemplates");

  // console.log('🎯 Specific permission checks:', {
  //   candidatesPermission,
  //   positionsPermission,
  //   interviewsPermission,
  //   mockInterviewsPermission,
  //   interviewTemplatesPermission
  // });

  const outlineDropdownContent = (
    <div className="absolute top-12 w-80 text-sm rounded-md bg-white border right-7 z-30 -mr-20">
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-start font-medium text-custom-blue">
          Help & Training
        </h2>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={toggleOutlineDropdown}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div>
        <div className="text-sm border-b w-full pb-5">
          <div className="mt-1 mb-2 ml-4 flex items-center">
            <p className="text-black">Introduction</p>
          </div>
          {[
            {
              label: "Getting Started",
              toggle: handleGettingToggle,
              isOpen: dropdownState.isGettingDropdownOpen,
            },
            {
              label: "Detailed Instructions",
              toggle: handleDetailToggle,
              isOpen: dropdownState.isDetailDropdownOpen,
            },
            {
              label: "FAQs (Frequently Asked Questions)",
              toggle: handleQuestionToggle,
              isOpen: dropdownState.isQuestionDropdownOpen,
            },
            {
              label: "Search Functionality",
              toggle: handleFunctionToggle,
              isOpen: dropdownState.isFunctionDropdownOpen,
            },
            {
              label: "Contact Support",
              toggle: handleContactToggle,
              isOpen: dropdownState.isContactDropdownOpen,
            },
            {
              label: "Additional Resources",
              toggle: handleAdditionalToggle,
              isOpen: dropdownState.isAdditionalDropdownOpen,
            },
            {
              label: "Legal and Privacy Information",
              toggle: handleLegalToggle,
              isOpen: dropdownState.isLegalDropdownOpen,
            },
          ].map(({ label, toggle, isOpen }, index) => (
            <div key={index} className="flex justify-between mr-4 mt-2">
              <div className="cursor-pointer">
                <label className="inline-flex items-center ml-3">
                  <span className="ml-3 text-gray-500">{label}</span>
                </label>
              </div>
              <div className="cursor-pointer" onClick={toggle}>
                {isOpen ? (
                  <FaCaretUp className="ml-10 text-black" />
                ) : (
                  <FaCaretDown className="ml-10 text-black" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const profileDropdownContent = (
    <div className="absolute top-12 border w-48 text-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 -mr-2 z-30">
      <div className="p-2 flex items-center">
        <p
          className="font-medium text-custom-blue"
          onClick={toggleProfileDropdown}
        >
          {singleContactLoading ? (
            <div className="w-7 h-7 rounded-full bg-gray-200 skeleton-animation"></div>
          ) : singleContact?.imageData?.path ? (
            <img
              src={singleContact.imageData.path}
              alt="Profile"
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <CgProfile className="text-custom-blue text-xl" />
          )}
        </p>
        <span className="font-medium ml-1">
          {singleContactLoading ? (
            <div className="h-4 w-20 bg-gray-200 skeleton-animation rounded"></div>
          ) : (
            `${firstName} ${lastName}`
          )}
        </span>
      </div>
      <div className="flex justify-between px-3 py-1 text-xs">
        <button
          className="text-custom-blue hover:text-blue-500 ml-6"
          onClick={() => {
            closeAllDropdowns();
            handleSettingsClick();
          }}
        >
          Settings
        </button>
        <button
          className="text-custom-blue hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            closeAllDropdowns();
            handleLogout();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loading size="small" />
              <span className="ml-2">Logging out...</span>
            </div>
          ) : (
            "Log Out"
          )}
        </button>
      </div>
      <div
        className="px-2 py-2 border-t"

      >
        {[
          ...(checkPermission("Billing")
            ? [
              {
                to: "/billing-details",
                label: "Billing",
                icon: <CiCreditCard1 />,
              },
            ]
            : []),
          ...(checkPermission("Wallet")
            ? [
              {
                to: "/wallet",
                label: "My Wallet",
                icon: <LiaWalletSolid />,
              },
            ]
            : []),
        ].map(({ to, label, icon }, index) => (
          <NavLink
            key={index}
            className="flex items-center py-2 px-1 text-black hover:bg-gray-200 hover:text-custom-blue rounded-md"
            to={to}
            onClick={() => closeAllDropdowns()}
          >
            <span className="mr-2 text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );

  // Icon configuration for Home, Information, Bell, and Profile
  const icons = [
    {
      key: "home",
      ref: null,
      content: (
        <NavLink
          to={userType === 'superAdmin' ? "/admin-dashboard" : "/home"}
          className="text-black"
          onClick={() => closeAllDropdowns()}
        >
          <IoHome
            className={isActive((userType === 'superAdmin' ? "/admin-dashboard" : "/home")) ? "text-custom-blue" : "text-black"}
          />
        </NavLink>
      ),
      className: "text-xl border rounded-md p-2",
      isActive: isActive("/home"),
    },
    {
      key: "info",
      ref: outlineRef,
      content: (
        <div className="relative">
          <p
            className="font-medium cursor-pointer"
            onClick={toggleOutlineDropdown}
          >
            <IoMdInformationCircleOutline
              className={
                dropdownState.outlineDropdown
                  ? "text-custom-blue"
                  : "text-black"
              }
            />
            {dropdownState.outlineDropdown && (
              <IoIosArrowUp className="absolute top-10 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
            )}
          </p>
          {dropdownState.outlineDropdown && outlineDropdownContent}
        </div>
      ),
      className: "text-xl border rounded-md p-2",
      isActive: dropdownState.outlineDropdown,
    },
    {
      key: "notification",
      ref: notificationRef,
      content: (
        <NotificationPanel
          isOpen={dropdownState.isNotificationOpen}
          setIsOpen={(value) =>
            setDropdownState((prev) => ({
              ...prev,
              isNotificationOpen: value,
            }))
          }
          closeOtherDropdowns={() => closeAllDropdowns("isNotificationOpen")}
        />
      ),
      className: "text-xl border rounded-md",
      isActive: dropdownState.isNotificationOpen,
    },
    {
      key: "profile",
      ref: profileRef,
      content: (
        <div className="relative">
          <p
            className="font-medium cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            {singleContactLoading ? (
              <div className="w-7 h-7 rounded-full bg-gray-200 skeleton-animation"></div>
            ) : singleContact?.imageData?.path ? (
              <img
                src={singleContact?.imageData?.path}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <CgProfile
                className={`cursor-pointer ${dropdownState.profileDropdown
                  ? "text-custom-blue"
                  : "text-black"
                  }`}
              />
            )}
            {dropdownState.profileDropdown && (
              <IoIosArrowUp className="absolute top-10 left-0 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
            )}
          </p>
          {dropdownState.profileDropdown && profileDropdownContent}
        </div>
      ),
      className: `text-xl border rounded-md ${singleContact?.imageData?.path ? "p-1" : "p-2"
        }`,
      isActive: dropdownState.profileDropdown,
    },
  ];

  return (
    <>
      {/* <------------------------------- v1.0.0 */}
      <div className={`bg-white fixed top-0 left-0 right-0 z-50 shadow-sm ${userType === 'superAdmin' ? 'border-b border-gray-200' : ''}`}>
        <div className='mx-auto relative'>
          <div className={`flex justify-between items-center ${userType === 'superAdmin' ? 'px-2 py-1' : 'border-gray-100 p-3 sm:px-4'}`}>
            {/* v1.0.0  ----------------------> */}
            {/* Mobile menu button and logo */}
            <div className="flex items-center">
              <button
                className={`${userType === 'superAdmin' ? 'lg:hidden xl:hidden 2xl:hidden' : 'sidebar-icon12 mr-2 lg:hidden xl:hidden 2xl:hidden'}`}
                onClick={userType === 'superAdmin' ? toggleSidebar : toggleSidebar}
              >
                <FaBars className={userType === 'superAdmin' ? 'w-5 h-5 mr-3' : ''} />
              </button>
              <img src={logo} alt="Logo" className="w-24" />
            </div>

            {/* Desktop navigation */}
            <nav className={`hidden lg:flex xl:flex 2xl:flex ${userType === 'superAdmin' ? 'justify-center flex-1' : 'items-center justify-center flex-1'}`}>
              <div className={`flex items-center ${userType === 'superAdmin' ? 'gap-x-6 max-w-5xl h-full' : 'space-x-8 max-w-3xl'}`}>
                {/* Super Admin Navigation */}
                {userType === 'superAdmin' && (
                  <>
                    {enhancedCheckPermission("Tenants") && (
                      <NavLink
                        to="/tenants"
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative' : 'h-full flex items-center relative px-1'} ${isActive("/tenants")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Tenants
                        {isActive("/tenants") && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("InterviewRequest") && (
                      <NavLink
                        to="/interviewer-requests"
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative' : 'h-full flex items-center relative px-1'} ${isActive("/interviewer-requests")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Interviewer Requests
                        {isActive("/interviewer-requests") && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("OutsourceInterviewerRequest") && (
                      <NavLink
                        to="/outsource-interviewers"
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative' : 'h-full flex items-center relative px-1'} ${isActive("/outsource-interviewers")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Outsource Interviewers
                        {isActive("/outsource-interviewers") && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("SupportDesk") && (
                      <NavLink
                        to="/support-desk"
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative' : 'h-full flex items-center relative px-1'} ${isActive("support-desk")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Support Desk
                        {isActive("/support-desk") && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Billing") && (
                      <NavLink
                        to="/admin-billing"
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative' : 'h-full flex items-center relative px-1'} ${isActive("/admin-billing")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Billing
                        {isActive("/admin-billing") && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {/* Super Admin More Dropdown */}
                    <div className="relative flex items-center ml-6" ref={moreRef}>
                      <button
                        className={`${userType === 'superAdmin' ? 'h-[52px] flex items-center relative transition-colors duration-300' : ''} ${getMoreDropdownItems().some((item) => isActive(item.path))
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={toggleMoreDropdown}
                      >
                        More
                        {userType === 'superAdmin' ? (
                          <IoIosArrowDown
                            className={`ml-1 transition-transform duration-300 ease-in-out ${dropdownState.moreDropdown ? "rotate-180" : ""
                              }`}
                          />
                        ) : (
                          dropdownState.moreDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />
                        )}
                        {getMoreDropdownItems().some((item) => isActive(item.path)) && (
                          // v1.0.6 <---------------------------------------------------------------------------------------------------------
                          <div className={`absolute ${userType === 'superAdmin' ? 'bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue' : 'bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue'}`}></div>
                          // v1.0.6 --------------------------------------------------------------------------------------------------------->
                        )}
                      </button>

                      {dropdownState.moreDropdown && (
                        // v1.0.6 <-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                        <div className={`absolute ${userType === 'superAdmin' ? 'left-0 top-10 z-50 w-52 bg-white rounded-md shadow-lg border ring-black transform transition-all duration-300 ease-in-out origin-top p-2 pr-6' : 'top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border'}`}> 
                        {/* // v1.0.6 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------> */}
                          <div className={userType === 'superAdmin' ? 'flex flex-col min-w-[150px]' : 'space-y-1'}>
                            {getMoreDropdownItems().map(({ path, label }) => (
                              <NavLink
                                key={path}
                                to={path}
                                className={`${userType === 'superAdmin' ? 'h-[42px] flex items-center px-4 relative' : 'block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md'} ${isActive(path)
                                  ? userType === 'superAdmin' ? "text-custom-blue font-bold" : "bg-gray-100 text-custom-blue"
                                  : userType === 'superAdmin' ? "text-gray-700 hover:text-custom-blue" : ""
                                  }`}
                                onClick={closeAllDropdowns}
                              >
                                {label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Effective User Navigation */}
                {userType === 'effective' && (
                  <>
                    {enhancedCheckPermission("Candidates") && (
                      <NavLink
                        to="/candidate"
                        className={`h-full flex items-center relative px-1 ${isActive("/candidate")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Candidates
                        {isActive("/candidate") && (
                          // v1.0.6 <----------------------------------------------------------------------------
                          <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                          // v1.0.6 ---------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Positions") && (
                      <NavLink
                        to="/position"
                        className={`h-full flex items-center relative px-1 ${isActive("/position")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                          }`}
                        onClick={() => closeAllDropdowns()}
                      >
                        Positions
                        {isActive("/position") && (
                          // v1.0.6 <----------------------------------------------------------------------------
                          <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                          // v1.0.6 ---------------------------------------------------------------------------->
                        )}
                      </NavLink>
                    )}

                    {(enhancedCheckPermission("Interviews") ||
                      enhancedCheckPermission("MockInterviews") ||
                      enhancedCheckPermission("InterviewTemplates")) && (
                        <div
                          className="relative h-full flex items-center"
                          ref={interviewRef}
                        >
                          <button
                            className={`flex items-center h-full relative px-1 ${isActive("/interviewList") ||
                              isActive("/mockinterview") ||
                              isActive("/interview-templates")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                              }`}
                            onClick={toggleInterviewDropdown}
                          >
                            Interviews
                            {dropdownState.interviewDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                            {(isActive("/interviewList") ||
                              isActive("/mockinterview") ||
                              isActive("/interview-templates")) && (
                              // v1.0.6 <----------------------------------------------------------------------------
                                <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                              // v1.0.6 ---------------------------------------------------------------------------->
                              )}
                          </button>
                          {dropdownState.interviewDropdown && (
                            <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                              <div className="space-y-1">
                                {[
                                  ...(enhancedCheckPermission("InterviewTemplates")
                                    ? [
                                      {
                                        to: "/interview-templates",
                                        label: "Interview Templates",
                                      },
                                    ]
                                    : []),
                                  ...(enhancedCheckPermission("Interviews")
                                    ? [{ to: "/interviewList", label: "Interviews" }]
                                    : []),
                                  ...(enhancedCheckPermission("MockInterviews")
                                    ? [
                                      {
                                        to: "/mockinterview",
                                        label: "Mock Interviews",
                                      },
                                    ]
                                    : []),
                                ].map(({ to, label }) => (
                                  <NavLink
                                    key={to}
                                    className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                      }`}
                                    to={to}
                                    onClick={() => closeAllDropdowns()}
                                  >
                                    {label}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    {/* // <---------------------- v1.0.1 */}
                    {(enhancedCheckPermission("AssessmentTemplates") ||
                      enhancedCheckPermission("Assessments")) && (
                        // v1.0.1---------------------- >
                        <div
                          className="relative h-full flex items-center"
                          ref={assessmentRef}
                        >
                          <button
                            className={`flex items-center h-full relative px-1 ${isActive("/assessments") || isActive("/assessments-template")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                              }`}
                            onClick={toggleAssessmentDropdown}
                          >
                            Assessments
                            {dropdownState.assessmentDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                            {(isActive("/assessments") ||
                              isActive("/assessments-template")) && (
                              // v1.0.6 <----------------------------------------------------------------------------
                                <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                              // v1.0.6 <----------------------------------------------------------------------------
                              )}
                          </button>
                          {dropdownState.assessmentDropdown && (
                            <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                              <div className="space-y-1">
                                {/* // <---------------------- v1.0.1 */}
                                {[
                                  ...(enhancedCheckPermission("AssessmentTemplates")
                                    // v1.0.1---------------------- >

                                    ? [{ to: "/assessments-template", label: "Assessment Templates" }]
                                    : []),
                                  ...(enhancedCheckPermission("Assessments")
                                    ? [{ to: "/assessments", label: "Assessments" }]
                                    : []),
                                ].map(({ to, label }) => (
                                  <NavLink
                                    key={to}
                                    className={`block px-3 py-2 whitespace-nowrap hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                      }`}
                                    to={to}
                                    onClick={() => closeAllDropdowns()}
                                  >
                                    {label}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {(enhancedCheckPermission("Analytics") ||
                      enhancedCheckPermission("SupportDesk") ||
                      enhancedCheckPermission("QuestionBank")) && (
                        <div
                          className="relative h-full flex items-center"
                          ref={moreRef}
                        >
                          <button
                            className={`flex items-center h-full relative px-1 ${isActive("/analytics") || isActive("/support-desk") || isActive("/questionBank")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                              }`}
                            onClick={toggleMoreDropdown}
                          >
                            More
                            {dropdownState.moreDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                            {(isActive("/analytics") ||
                              isActive("/support-desk") ||
                              isActive("/feedback") ||
                              isActive("/questionBank")) && (
                                // v1.0.6 <----------------------------------------------------------------------------
                                <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                                // v1.0.6 <----------------------------------------------------------------------------
                              )}
                          </button>
                          {dropdownState.moreDropdown && (
                            <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                              <div className="space-y-1">
                                {[
                                  ...(enhancedCheckPermission("Analytics")
                                    ? [{ to: "/analytics", label: "Analytics" }]
                                    : []),
                                  ...(enhancedCheckPermission("QuestionBank")
                                    ? [
                                      {
                                        to: "/questionBank",
                                        label: "Question Bank",
                                      },
                                    ]
                                    : []),
                                  ...(enhancedCheckPermission("Feedback")
                                    ? [{ to: "/feedback", label: "Feedback" }]
                                    : []),
                                  ...(enhancedCheckPermission("SupportDesk")
                                    ? [{ to: "/support-desk", label: "Support Desk" }]
                                    : []),
                                ].map(({ to, label }) => (
                                  <NavLink
                                    key={to}
                                    className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                      }`}
                                    to={to}
                                    onClick={() => closeAllDropdowns()}
                                  >
                                    {label}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </>
                )}
              </div>
            </nav>

            {/* Icons (both mobile and desktop) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {icons.map(({ key, ref, content, className, isActive }) => (
                <div
                  key={key}
                  className={`${className} ${isActive ? "text-custom-blue" : "text-black"
                    }`}
                  ref={ref}
                >
                  {content}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {dropdownState.isSidebarOpen && (
          <div className="fixed inset-0 top-16 bg-gray-800 bg-opacity-75 z-40 lg:hidden">
            <div className="fixed left-0 w-64 bg-white h-full z-50 overflow-y-auto">
              <div className="p-4 space-y-1">
                {/* Super Admin Mobile Navigation */}
                {userType === 'superAdmin' && (
                  <>
                    {enhancedCheckPermission("Tenants") && (
                      <NavLink
                        to="/tenants"
                        className={`block px-4 py-3 rounded-md ${isActive("/tenants")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Tenants
                      </NavLink>
                    )}

                    {enhancedCheckPermission("InterviewRequest") && (
                      <NavLink
                        to="/interviewer-requests"
                        className={`block px-4 py-3 rounded-md ${isActive("/interviewer-requests")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Interviewer Requests
                      </NavLink>
                    )}

                    {enhancedCheckPermission("OutsourceInterviewerRequest") && (
                      <NavLink
                        to="/outsource-interviewers"
                        className={`block px-4 py-3 rounded-md ${isActive("/outsource-interviewers")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Outsource Interviewers
                      </NavLink>
                    )}

                    {enhancedCheckPermission("SupportDesk") && (
                      <NavLink
                        to="/support-desk"
                        className={`block px-4 py-3 rounded-md ${isActive("/support-desk")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Support Desk
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Billing") && (
                      <NavLink
                        to="/admin-billing"
                        className={`block px-4 py-3 rounded-md ${isActive("/admin-billing")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Billing
                      </NavLink>
                    )}
                  </>
                )}

                {/* Effective User Mobile Navigation */}
                {userType === 'effective' && (
                  <>
                    {enhancedCheckPermission("Candidates") && (
                      <NavLink
                        to="/candidate"
                        className={`block px-4 py-3 rounded-md ${isActive("/candidate")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Candidates
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Positions") && (
                      <NavLink
                        to="/position"
                        className={`block px-4 py-3 rounded-md ${isActive("/position")
                          ? "bg-gray-100 text-custom-blue font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        Positions
                      </NavLink>
                    )}

                    {(enhancedCheckPermission("Interviews") ||
                      enhancedCheckPermission("MockInterviews") ||
                      enhancedCheckPermission("InterviewTemplates")) && (
                        <div className="relative" ref={interviewRef}>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive("/interviewList") ||
                              isActive("/mockinterview") ||
                              isActive("/interview-templates")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={toggleInterviewDropdown}
                          >
                            <span>Interviews</span>
                            {dropdownState.interviewDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                          </button>
                          {dropdownState.interviewDropdown && (
                            <div className="mt-1 ml-4 space-y-1">
                              {[
                                ...(enhancedCheckPermission("InterviewTemplates")
                                  ? [
                                    {
                                      to: "/interview-templates",
                                      label: "Interview Templates",
                                    },
                                  ]
                                  : []),
                                ...(enhancedCheckPermission("Interviews")
                                  ? [{ to: "/interviewList", label: "Interviews" }]
                                  : []),
                                ...(enhancedCheckPermission("MockInterviews")
                                  ? [
                                    {
                                      to: "/mockinterview",
                                      label: "Mock Interviews",
                                    },
                                  ]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-4 py-2 rounded-md ${isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  to={to}
                                  onClick={() => {
                                    closeAllDropdowns();
                                    toggleSidebar();
                                  }}
                                >
                                  {label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    {/* // <---------------------- v1.0.1 */}
                    {(enhancedCheckPermission("AssessmentTemplates") ||
                      enhancedCheckPermission
                        // v1.0.1---------------------- >
                        ("Assessments")) && (
                        <div className="relative" ref={assessmentRef}>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive("/assessments") ||
                              isActive("/assessments-template")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={toggleAssessmentDropdown}
                          >
                            <span>Assessments</span>
                            {dropdownState.assessmentDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                          </button>
                          {dropdownState.assessmentDropdown && (
                            <div className="mt-1 ml-4 space-y-1">
                              {/* // <---------------------- v1.0.1 */}
                              {[
                                ...(enhancedCheckPermission("AssessmentTemplates")
                                  // v1.0.1---------------------- >
                                  ? [
                                    {
                                      to: "/assessments-template",
                                      label: "Assessment Templates",
                                    },
                                  ]
                                  : []),
                                ...(enhancedCheckPermission("Assessments")
                                  ? [{ to: "/assessments", label: "Assessments" }]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-4 py-2 rounded-md ${isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  to={to}
                                  onClick={() => {
                                    closeAllDropdowns();
                                    toggleSidebar();
                                  }}
                                >
                                  {label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    {(enhancedCheckPermission("Analytics") ||
                      enhancedCheckPermission("SupportDesk") ||
                      enhancedCheckPermission("Feedback") ||
                      enhancedCheckPermission("QuestionBank")) && (
                        <div className="relative" ref={moreRef}>
                          <button
                            className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive("/analytics") ||
                              isActive("/support-desk") ||
                              isActive("/feedback") ||
                              isActive("/questionBank")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={toggleMoreDropdown}
                          >
                            <span>More</span>
                            {dropdownState.moreDropdown ? (
                              <IoIosArrowUp />
                            ) : (
                              <IoIosArrowDown />
                            )}
                          </button>
                          {dropdownState.moreDropdown && (
                            <div className="mt-1 ml-4 space-y-1">
                              {[
                                ...(enhancedCheckPermission("Analytics")
                                  ? [{ to: "/analytics", label: "Analytics" }]
                                  : []),
                                ...(enhancedCheckPermission("QuestionBank")
                                  ? [
                                    {
                                      to: "/questionBank",
                                      label: "Question Bank",
                                    },
                                  ]
                                  : []),
                                ...(enhancedCheckPermission("Feedback")
                                  ? [{ to: "/feedback", label: "Feedback" }]
                                  : []),
                                ...(enhancedCheckPermission("SupportDesk")
                                  ? [{ to: "/support-desk", label: "Support Desk" }]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-4 py-2 rounded-md ${isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                  to={to}
                                  onClick={() => {
                                    closeAllDropdowns();
                                    toggleSidebar();
                                  }}
                                >
                                  {label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for super admin fixed header */}
      <div className="h-14" />
    </>
  );
};

export default CombinedNavbar; 