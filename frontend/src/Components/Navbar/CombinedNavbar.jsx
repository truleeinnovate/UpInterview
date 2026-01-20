// v1.0.0 - Mansoor - adjust the height of navbar (superadmin and normal user) for removing the gap below the navbar and home content and account settings
// v1.0.1  -  Ashraf  -  Assessment_Template permission name changed to AssessmentTemplates
// v1.0.2  -  Ashraf  -  effectivePermissions_RoleName added to smartLogout
// v1.0.3  -  Ashraf  -  updated loading tabs issue
// v1.0.4  -  Ashok   -  changed tab name from "Integrations" to "Integration Logs" in super admin navbar
// v1.0.5  -  Ashraf  -  using authcookie manager to get current tokein
/* v1.0.6  -  Ashok   -  Added new Tab names "Interviewer Rates" and "Interviewers" under More at Super Admin
                         and improved active name borders under tab names in both nav bars */
// v1.0.7  -  Ashok   -  Tab name changed from "Interviewers" to "Interviews"
// V1.0.8  -  Ashok   -  Changed Logo from local to cloud url and added new tab name Master Data
// v1.0.9  -  Ashok   -  Added Master Data tab in more
// v2.0.0  -  Ashok   -  fixed icons vertically expanding issue
// v2.0.1  -  Ashok   -  kept Interviews, QuestionBank, Internal Logs out side
// v2.0.2  -  Ashok   -  fixed interviews path in mobile navbar
// v2.0.3  -  Ashok   -  Added new Tab Companies

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  X,
  Menu,
  Info,
  ChevronDown,
  ChevronUp,
  UserCircle,
  Home,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import NotificationPanel from "../../Pages/Push-Notification/NotificationPanel.jsx";
import { smartLogout } from "../../utils/AuthCookieManager/AuthCookieManager";
import { usePermissions } from "../../Context/PermissionsContext";
import { usePermissionCheck } from "../../utils/permissionUtils";
import AuthCookieManager from "../../utils/AuthCookieManager/AuthCookieManager";
import { useSingleContact } from "../../apiHooks/useUsers";
import Loading from "../Loading.js";
// <---------------------- v1.0.5
import {
  getAuthToken,
  getImpersonationToken,
} from "../../utils/AuthCookieManager/AuthCookieManager";
// ---------------------- v1.0.5 >
import { getCachedPermissions } from "../../Context/PermissionsContext";

const CombinedNavbar = React.memo(() => {
  const { checkPermission, isInitialized, loading } = usePermissionCheck();
  const { effectivePermissions_RoleName } = usePermissions();
  const location = useLocation();
  const authToken = getAuthToken();
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const { singleContact, isLoading: singleContactLoading } = useSingleContact();
  const navigate = useNavigate();
  const userType = AuthCookieManager.getUserType();

  const [dropdownState, setDropdownState] = useState({
    assessmentDropdown: false,
    interviewDropdown: false,
    moreDropdown: false,
    outlineDropdown: false,
    profileDropdown: false,
    requestsDropdown: false,
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
  const [isLoading, setIsLoading] = useState(false);

  const assessmentRef = useRef(null);
  const interviewRef = useRef(null);
  const moreRef = useRef(null);
  const outlineRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const requestsRef = useRef(null);

  const closeAllDropdowns = React.useCallback((openDropdown = null) => {
    setDropdownState((prevState) => ({
      assessmentDropdown: openDropdown === "assessmentDropdown",
      interviewDropdown: openDropdown === "interviewDropdown",
      moreDropdown: openDropdown === "moreDropdown",
      outlineDropdown: openDropdown === "outlineDropdown",
      profileDropdown: openDropdown === "profileDropdown",
      requestsDropdown: openDropdown === "requestsDropdown",
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const refsToCheck =
        userType === "superAdmin"
          ? [moreRef, outlineRef, notificationRef, profileRef, requestsRef] // Make sure requestsRef is included
          : [
              assessmentRef,
              interviewRef,
              moreRef,
              outlineRef,
              notificationRef,
              profileRef,
            ];

      if (
        refsToCheck.every(
          (ref) => ref.current && !ref.current.contains(event.target),
        )
      ) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllDropdowns, userType]);

  // Show loading state while permissions are being fetched
  if (isLoading || loading) {
    return (
      <div className="bg-white fixed top-0 left-0 right-0 z-50 shadow-sm h-14 flex items-center justify-center">
        <Loading
          size="medium"
          message={isLoading ? "Logging out..." : "Loading..."}
        />
      </div>
    );
  }

  // Skip rendering if no permissions are available
  const shouldSkipRender = !isInitialized && !getCachedPermissions();

  const enhancedCheckPermission = (permissionKey) => {
    if (!isInitialized && !getCachedPermissions()) {
      return false;
    }
    if (loading) {
      const cachedPermissions = getCachedPermissions();
      if (!cachedPermissions || !cachedPermissions[permissionKey]) {
        return false;
      }
      return cachedPermissions[permissionKey]?.ViewTab || false;
    }
    return checkPermission(permissionKey);
  };

  if (shouldSkipRender) {
    return <div className="h-14" />;
  }

  // Format name to capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = formatName(singleContact?.firstName);
  const lastName = formatName(singleContact?.lastName);
  const organization = tokenPayload?.organization;

  // Toggle functions
  const toggleAssessmentDropdown = () =>
    closeAllDropdowns(
      dropdownState.assessmentDropdown ? null : "assessmentDropdown",
    );
  const toggleInterviewDropdown = () =>
    closeAllDropdowns(
      dropdownState.interviewDropdown ? null : "interviewDropdown",
    );
  const toggleMoreDropdown = () =>
    closeAllDropdowns(dropdownState.moreDropdown ? null : "moreDropdown");
  const toggleRequestsDropdown = () => {
    setDropdownState((prevState) => ({
      ...prevState,
      requestsDropdown: !prevState.requestsDropdown,
      // Close other dropdowns
      assessmentDropdown: false,
      interviewDropdown: false,
      moreDropdown: false,
      outlineDropdown: false,
      profileDropdown: false,
      isNotificationOpen: false,
    }));
  };
  const toggleOutlineDropdown = () =>
    closeAllDropdowns(dropdownState.outlineDropdown ? null : "outlineDropdown");
  const toggleProfileDropdown = () =>
    closeAllDropdowns(dropdownState.profileDropdown ? null : "profileDropdown");
  const toggleNotification = () =>
    closeAllDropdowns(
      dropdownState.isNotificationOpen ? null : "isNotificationOpen",
    );
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

  const handleSettingsClick = () => {
    closeAllDropdowns();
    navigate("/account-settings");
  };

  const handleLogout = async () => {
    // closeAllDropdowns();
    // Show loading immediately
    setIsLoading(true);
    // <---------------------- v1.0.2
    await smartLogout(navigate, setIsLoading, effectivePermissions_RoleName);
    // ---------------------- v1.0.2 >
  };

  // Check if a nav item or icon is active
  const isActive = (path) => location.pathname === path;

  // Define navigation items based on user type
  const getNavigationItems = () => {
    if (userType === "superAdmin") {
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
    if (userType === "superAdmin") {
      return [];
    } else {
      return [
        {
          path: "/interview-templates",
          label: "Interview Templates",
          permissionKey: "InterviewTemplates.ViewTab",
        },
        {
          path: "/interviews",
          label: "Interviews",
          permissionKey: "Interviews.ViewTab",
        },
        {
          path: "/interviewers",
          label: "Interviewers",
          permissionKey: "Interviewers.ViewTab",
        },
        {
          path: "/mock-interview",
          label: "Mock Interviews",
          permissionKey: "MockInterviews.ViewTab",
        },
      ];
    }
  };

  // Define assessment dropdown items
  const getAssessmentDropdownItems = () => {
    if (userType === "superAdmin") {
      return [];
    } else {
      return [
        {
          path: "/assessment-templates",
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
    if (userType === "superAdmin") {
      return [
        {
          path: "/enterprise-contact-sale",
          label: "Enterprise Contact Sale",
          permissionKey: "EnterpriseContactSale.ViewTab",
        },
        {
          path: "/contact-us",
          label: "Contact Us",
          permissionKey: "ContactUs.ViewTab",
        },
        // {
        //   path: "/internal-logs",
        //   label: "Internal Logs",
        //   permissionKey: "InternalLogs.ViewTab",
        // },
        {
          path: "/integrations",
          label: "Integration Logs",
          permissionKey: "IntegrationLogs.ViewTab",
        },
        {
          path: "/interviewer-rates",
          label: "Interviewer Rates",
          permissionKey: "InterviewerRates.ViewTab",
        },
        // {
        //   path: "/interviews",
        //   label: "Interviews",
        //   permissionKey: "Interviews.ViewTab",
        // },
        {
          path: "/master-data",
          label: "Master Data",
          permissionKey: "MasterData.ViewTab",
        },
        // {
        //   path: "/question-bank-manager",
        //   label: "Question Bank",
        //   permissionKey: "QuestionBank.ViewTab",
        // },
        {
          path: "/sub-plans",
          label: "Subscription Plans",
          permissionKey: "SubscriptionPlans.ViewTab",
        },
        {
          path: "/interview-policy",
          label: "Interview Policy",
          permissionKey: "InterviewPolicy.ViewTab",
        },
        {
          path: "/regional-tax",
          label: "Regional Tax",
          permissionKey: "RegionalTax.ViewTab",
        },
      ];
    } else {
      return [
        {
          path: "/analytics",
          label: "Analytics",
          permissionKey: "Analytics.ViewTab",
        },
        {
          path: "/question-bank",
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
        {
          path: "/companies",
          label: "Companies",
          permissionKey: "Companies.ViewTab",
        },
        {
          path: "/my-teams",
          label: "My Teams",
          permissionKey: "Companies.MyTeams",
        },
        {
          path: "/interviewer-tag",
          label: "Interviewer Tag",
          permissionKey: "Companies.InterviewerTag",
        },
      ];
    }
  };

  const outlineDropdownContent = (
    <div className="absolute top-12 w-60 text-sm rounded-md bg-white border right-7 z-30 -mr-20">
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
          {/* <div className="mt-1 mb-2 ml-4 flex items-center">
                        <p className="text-black">Introduction</p>
                    </div> */}
          {/* {[
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
          ))} */}
          {[
            {
              label: "Privacy Policy",
              link: "https://upinterview.io/privacy-policy",
            },
            {
              label: "Terms and Conditions",
              link: "https://upinterview.io/terms-conditions",
            },
            {
              label: "Return and Refund Policy",
              link: "https://upinterview.io/return-refund-policy",
            },
          ].map(({ label, link }, index) => (
            <div
              key={index}
              className="flex justify-between mr-4 mt-2 cursor-pointer"
              onClick={() => window.open(link, "_blank")}
            >
              <label className="inline-flex items-center ml-3">
                <span className="ml-3 text-gray-500 hover:text-custom-blue hover:underline hover:decoration-custom-blue transition-colors duration-200">
                  {label}
                </span>
              </label>
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
            <UserCircle className="text-custom-blue text-xl h-5 w-5" />
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
          className="text-custom-blue hover:text-custom-blue/80 ml-6"
          onClick={() => {
            closeAllDropdowns();
            handleSettingsClick();
          }}
        >
          Settings
        </button>
        <button
          className="text-custom-blue hover:text-custom-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            closeAllDropdowns();
            handleLogout();
          }}
          disabled={isLoading}
        >
          Log Out
        </button>
      </div>
      <div className="px-2 py-2 border-t">
        {[
          ...(checkPermission("Billing")
            ? [
                {
                  // For pure super admin, go to the admin billing page.
                  // For all effective / normal users, go to the user billing tab.
                  to:
                    userType === "superAdmin"
                      ? "/admin-billing"
                      : "/billing-details",
                  label: "Billing",
                  icon: <CreditCard className="h-5 w-5" />,
                },
              ]
            : []),
          ...(checkPermission("Wallet")
            ? [
                {
                  // For super admin, show platform wallet; for others, regular wallet
                  to: userType === "superAdmin" ? "/admin-wallet" : "/wallet",
                  label: userType === "superAdmin" ? "Wallet" : "My Wallet",
                  icon: <Wallet className="h-5 w-5" />,
                },
              ]
            : []),
        ].map(({ to, label, icon }, index) => (
          <NavLink
            key={index}
            className="flex items-center py-2 px-1 text-black hover:bg-gray-200 hover:text-custom-blue rounded-md"
            to={to}
            onClick={(e) => {
              e.preventDefault();
              closeAllDropdowns();
              navigate(to);
            }}
          >
            <span className="mr-2 text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );

  // Icon configuration for Home, Information, Bell, and Profile
  // v2.0.0 <-----------------------------------------------------------------------------------
  const icons = [
    {
      key: "home",
      ref: null,
      content: (
        <NavLink
          to={userType === "superAdmin" ? "/admin-dashboard" : "/home"}
          className="text-black"
          onClick={(e) => {
            e.preventDefault();
            closeAllDropdowns();
            navigate(userType === "superAdmin" ? "/admin-dashboard" : "/home");
          }}
        >
          <Home
            className={
              isActive(userType === "superAdmin" ? "/admin-dashboard" : "/home")
                ? "text-custom-blue h-5 w-5"
                : "text-black h-5 w-5"
            }
          />
        </NavLink>
      ),
      className: "text-xl border rounded-md p-2 h-10 w-10",
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
            <Info
              className={
                dropdownState.outlineDropdown
                  ? "text-custom-blue h-5 w-5"
                  : "text-black h-5 w-5"
              }
            />
            {dropdownState.outlineDropdown && (
              <ChevronUp className="absolute top-10 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
            )}
          </p>
          {dropdownState.outlineDropdown && outlineDropdownContent}
        </div>
      ),
      className: "text-xl border rounded-md p-2 h-10 w-10",
      isActive: dropdownState.outlineDropdown,
    },
    {
      key: "notification",
      ref: notificationRef,
      content: (
        <NotificationPanel
          isOpen={dropdownState.isNotificationOpen}
          setIsOpen={toggleNotification}
          closeOtherDropdowns={() => closeAllDropdowns("isNotificationOpen")}
        />
      ),
      className: "text-xl border rounded-md h-10 w-10",
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
              <div className="h-10 w-10 rounded-full bg-gray-200 skeleton-animation"></div>
            ) : singleContact?.imageData?.path ? (
              <img
                src={singleContact?.imageData?.path}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <UserCircle
                className={`cursor-pointer ${
                  dropdownState.profileDropdown
                    ? "text-custom-blue h-5 w-5"
                    : "text-black h-5 w-5"
                }`}
              />
            )}
            {dropdownState.profileDropdown && (
              <ChevronUp className="absolute top-10 left-0 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
            )}
          </p>
          {dropdownState.profileDropdown && profileDropdownContent}
        </div>
      ),
      className: `text-xl border rounded-md h-10 w-10 ${
        singleContact?.imageData?.path ? "p-1" : "p-2"
      }`,
      isActive: dropdownState.profileDropdown,
    },
  ];
  // v2.0.0 ----------------------------------------------------------------------------------->

  const getRequestsDropdownItems = () => {
    if (userType === "superAdmin") {
      const items = [
        {
          path: "/interviewer-requests",
          label: "Interviewer Requests",
          permissionKey: "InterviewRequest", // Remove .ViewTab
        },
        {
          path: "/outsource-interviewers",
          label: "Outsource Interviewers",
          permissionKey: "OutsourceInterviewerRequest", // Remove .ViewTab
        },
        {
          path: "/organization-request",
          label: "Organization Request",
          permissionKey: "OrganizationRequest", // Remove .ViewTab
        },
        {
          path: "/withdrawal-request",
          label: "Withdrawal Request",
          permissionKey: "WithdrawalRequest", // Remove .ViewTab
        },
      ];

      return items;
    }
    return [];
  };

  return (
    <>
      {/* <------------------------------- v1.0.0 */}
      <div
        className={`bg-white fixed top-0 left-0 right-0 z-50 shadow-sm ${
          userType === "superAdmin" ? "border-b border-gray-200" : ""
        }`}
      >
        <div className="mx-auto relative">
          <div
            className={`flex justify-between items-center ${
              userType === "superAdmin"
                ? "px-2 py-1"
                : "border-gray-100 p-3 sm:px-4"
            }`}
          >
            {/* v1.0.0  ----------------------> */}
            {/* Mobile menu button and logo */}
            <div className="flex items-center">
              <button
                className={`${
                  userType === "superAdmin"
                    ? "lg:hidden xl:hidden 2xl:hidden"
                    : "sidebar-icon12 mr-2 lg:hidden xl:hidden 2xl:hidden"
                }`}
                onClick={
                  userType === "superAdmin" ? toggleSidebar : toggleSidebar
                }
              >
                <Menu
                  className={userType === "superAdmin" ? "w-5 h-5 mr-3" : ""}
                />
              </button>
              {/* v1.0.8 <----------------------------------------------------------------------- */}
              {/* <img src={logo} alt="Logo" className="w-24" /> */}
              <img
                src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                alt="Logo"
                className="w-24"
              />
              {/* v1.0.8 -----------------------------------------------------------------------> */}
            </div>

            {/* Desktop navigation */}
            <nav
              className={`hidden lg:flex xl:flex 2xl:flex ${
                userType === "superAdmin"
                  ? "justify-center flex-1"
                  : "items-center justify-center flex-1"
              }`}
            >
              <div
                className={`flex items-center ${
                  userType === "superAdmin"
                    ? "gap-x-6 max-w-5xl h-full"
                    : "space-x-8 max-w-3xl"
                }`}
              >
                {/* Super Admin Navigation */}
                {userType === "superAdmin" && (
                  <>
                    {enhancedCheckPermission("Tenants") && (
                      <NavLink
                        to="/tenants"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/tenants")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/tenants");
                        }}
                      >
                        Tenants
                        {isActive("/tenants") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("OutsourceInterviewerRequest") && (
                      <div
                        className="relative flex items-center"
                        ref={requestsRef}
                      >
                        <button
                          className={`h-[52px] flex items-center relative transition-colors duration-300 ${
                            getRequestsDropdownItems().some((item) =>
                              isActive(item.path),
                            )
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                          }`}
                          onClick={toggleRequestsDropdown}
                        >
                          Requests
                          <ChevronDown
                            className={`h-5 w-5 ml-1 transition-transform duration-300 ease-in-out ${
                              dropdownState.requestsDropdown ? "rotate-180" : ""
                            }`}
                          />
                          {getRequestsDropdownItems().some((item) =>
                            isActive(item.path),
                          ) && (
                            <div className="absolute bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                          )}
                        </button>

                        {dropdownState.requestsDropdown && (
                          <div className="absolute left-0 top-10 z-50 w-64 bg-white rounded-md shadow-lg border ring-black transform transition-all duration-300 ease-in-out origin-top p-2 pr-6">
                            <div className="flex flex-col min-w-[150px]">
                              {getRequestsDropdownItems().map(
                                ({ path, label, permissionKey }) =>
                                  enhancedCheckPermission(permissionKey) && (
                                    <NavLink
                                      key={path}
                                      to={path}
                                      className={`h-[42px] flex items-center px-4 relative ${
                                        isActive(path)
                                          ? "text-custom-blue font-bold"
                                          : "text-gray-700 hover:text-custom-blue"
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        closeAllDropdowns();
                                        navigate(path);
                                      }}
                                    >
                                      {label}
                                    </NavLink>
                                  ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {enhancedCheckPermission("SupportDesk") && (
                      <NavLink
                        to="/support-desk"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/support-desk")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/support-desk");
                        }}
                      >
                        Support Desk
                        {isActive("/support-desk") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Billing") && (
                      <NavLink
                        to="/admin-billing"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/admin-billing")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/admin-billing");
                        }}
                      >
                        Billing
                        {isActive("/admin-billing") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}
                    {enhancedCheckPermission("InternalLogs") && (
                      <NavLink
                        to="/internal-logs"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/internal-logs")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/internal-logs");
                        }}
                      >
                        Internal Logs
                        {isActive("/internal-logs") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}
                    {enhancedCheckPermission("Interviews") && (
                      <NavLink
                        to="/admin-interviews"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/admin-interviews")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/admin-interviews");
                        }}
                      >
                        Interviews
                        {isActive("/admin-interviews") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}
                    {enhancedCheckPermission("QuestionBankManager") && (
                      <NavLink
                        to="/question-bank-manager"
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative"
                            : "h-full flex items-center relative px-1"
                        } ${
                          isActive("/question-bank-manager")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/question-bank-manager");
                        }}
                      >
                        Question Bank
                        {isActive("/question-bank-manager") && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </NavLink>
                    )}

                    {/* Super Admin More Dropdown */}
                    <div
                      className="relative flex items-center ml-6"
                      ref={moreRef}
                    >
                      <button
                        className={`${
                          userType === "superAdmin"
                            ? "h-[52px] flex items-center relative transition-colors duration-300"
                            : ""
                        } ${
                          getMoreDropdownItems().some((item) =>
                            isActive(item.path),
                          )
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={toggleMoreDropdown}
                      >
                        More
                        {userType === "superAdmin" ? (
                          <ChevronDown
                            className={`h-5 w-5 ml-1 transition-transform duration-300 ease-in-out ${
                              dropdownState.moreDropdown ? "rotate-180" : ""
                            }`}
                          />
                        ) : dropdownState.moreDropdown ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                        {getMoreDropdownItems().some((item) =>
                          isActive(item.path),
                        ) && (
                          <div
                            className={`absolute ${
                              userType === "superAdmin"
                                ? "bottom-[-4px] left-0 right-0 h-[3px] bg-custom-blue"
                                : "bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"
                            }`}
                          ></div>
                        )}
                      </button>
                      {dropdownState.moreDropdown && (
                        <div
                          className={`absolute ${
                            userType === "superAdmin"
                              ? "left-0 top-10 z-50 w-60 bg-white rounded-md shadow-lg border ring-black transform transition-all duration-300 ease-in-out origin-top p-2 pr-6"
                              : "top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border"
                          }`}
                        >
                          <div
                            className={
                              userType === "superAdmin"
                                ? "flex flex-col min-w-[150px]"
                                : "space-y-1"
                            }
                          >
                            {getMoreDropdownItems().map(({ path, label }) => (
                              <NavLink
                                key={path}
                                to={path}
                                className={`${
                                  userType === "superAdmin"
                                    ? "h-[42px] flex items-center px-4 relative"
                                    : "block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md"
                                } ${
                                  isActive(path)
                                    ? userType === "superAdmin"
                                      ? "text-custom-blue font-bold"
                                      : "bg-gray-100 text-custom-blue"
                                    : userType === "superAdmin"
                                      ? "text-gray-700 hover:text-custom-blue"
                                      : ""
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeAllDropdowns();
                                  navigate(path);
                                }}
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
                {userType === "effective" && (
                  <>
                    {enhancedCheckPermission("Candidates") && (
                      <NavLink
                        to="/candidate"
                        className={`h-full flex items-center relative px-1 ${
                          isActive("/candidate")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/candidate");
                        }}
                      >
                        Candidates
                        {isActive("/candidate") && (
                          <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                        )}
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Positions") && (
                      <NavLink
                        to="/position"
                        className={`h-full flex items-center relative px-1 ${
                          isActive("/position")
                            ? "text-custom-blue font-bold"
                            : "text-gray-600 hover:text-custom-blue"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          navigate("/position");
                        }}
                      >
                        Positions
                        {isActive("/position") && (
                          <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                        )}
                      </NavLink>
                    )}

                    {(enhancedCheckPermission("Interviews") ||
                      enhancedCheckPermission("MockInterviews") ||
                      enhancedCheckPermission("Interviewers") ||
                      enhancedCheckPermission("InterviewTemplates")) && (
                      <div
                        className="relative h-full flex items-center"
                        ref={interviewRef}
                      >
                        <button
                          className={`flex items-center h-full relative px-1 ${
                            isActive("/interviews") ||
                            isActive("/mock-interview") ||
                            isActive("/interviewers") ||
                            isActive("/interview-templates")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                          }`}
                          onClick={toggleInterviewDropdown}
                        >
                          Interviews
                          {dropdownState.interviewDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                          {(isActive("/interviews") ||
                            isActive("/mock-interview") ||
                            isActive("/interviewers") ||
                            isActive("/interview-templates")) && (
                            <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                          )}
                        </button>
                        {dropdownState.interviewDropdown && (
                          <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                            <div className="space-y-1">
                              {[
                                ...(enhancedCheckPermission(
                                  "InterviewTemplates",
                                )
                                  ? [
                                      {
                                        to: "/interview-templates",
                                        label: "Interview Templates",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("Interviews")
                                  ? [
                                      {
                                        to: "/interviews",
                                        label: "Interviews",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("MockInterviews")
                                  ? [
                                      {
                                        to: "/mock-interview",
                                        label: "Mock Interviews",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("Interviewers")
                                  ? [
                                      {
                                        to: "/interviewers",
                                        label: "Interviewers",
                                      },
                                    ]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                    isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                  }`}
                                  to={to}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    closeAllDropdowns();
                                    navigate(to);
                                  }}
                                >
                                  {label}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(enhancedCheckPermission("AssessmentTemplates") ||
                      enhancedCheckPermission("Assessments")) && (
                      <div
                        className="relative h-full flex items-center"
                        ref={assessmentRef}
                      >
                        <button
                          className={`flex items-center h-full relative px-1 ${
                            isActive("/assessments") ||
                            isActive("/assessment-templates")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                          }`}
                          onClick={toggleAssessmentDropdown}
                        >
                          Assessments
                          {dropdownState.assessmentDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                          {(isActive("/assessments") ||
                            isActive("/assessment-templates")) && (
                            <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                          )}
                        </button>
                        {dropdownState.assessmentDropdown && (
                          <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                            <div className="space-y-1">
                              {[
                                ...(enhancedCheckPermission(
                                  "AssessmentTemplates",
                                )
                                  ? [
                                      {
                                        to: "/assessment-templates",
                                        label: "Assessment Templates",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("Assessments")
                                  ? [
                                      {
                                        to: "/assessments",
                                        label: "Assessments",
                                      },
                                    ]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-3 py-2 whitespace-nowrap hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                    isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                  }`}
                                  to={to}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    closeAllDropdowns();
                                    navigate(to);
                                  }}
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
                      enhancedCheckPermission("QuestionBank") ||
                      enhancedCheckPermission("Companies")) && (
                      <div
                        className="relative h-full flex items-center"
                        ref={moreRef}
                      >
                        <button
                          className={`flex items-center h-full relative px-1 ${
                            isActive("/analytics") ||
                            isActive("/support-desk") ||
                            isActive("/question-bank")
                              ? "text-custom-blue font-bold"
                              : "text-gray-600 hover:text-custom-blue"
                          }`}
                          onClick={toggleMoreDropdown}
                        >
                          More
                          {dropdownState.moreDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                          {(isActive("/analytics") ||
                            isActive("/support-desk") ||
                            isActive("/feedback") ||
                            isActive("/question-bank") ||
                            isActive("/companies") || 
                            isActive("/my-teams") || 
                            isActive("/interviewer-tags")) && (
                            <div className="absolute bottom-[-19px] left-0 right-0 h-[3px] bg-custom-blue"></div>
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
                                        to: "/question-bank",
                                        label: "Question Bank",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("Feedback")
                                  ? [{ to: "/feedback", label: "Feedback" }]
                                  : []),
                                ...(enhancedCheckPermission("SupportDesk")
                                  ? [
                                      {
                                        to: "/support-desk",
                                        label: "Support Desk",
                                      },
                                    ]
                                  : []),
                                ...(enhancedCheckPermission("Companies")
                                  ? [{ to: "/companies", label: "Companies" }]
                                  : []),
                                ...(enhancedCheckPermission("MyTeams")
                                  ? [{ to: "/my-teams", label: "My Teams" }]
                                  : []),
                                ...(enhancedCheckPermission("InterviewerTags")
                                  ? [{ to: "/interviewer-tags", label: "Interviewer Tags" }]
                                  : []),
                              ].map(({ to, label }) => (
                                <NavLink
                                  key={to}
                                  className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                    isActive(to)
                                      ? "bg-gray-100 text-custom-blue"
                                      : ""
                                  }`}
                                  to={to}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    closeAllDropdowns();
                                    navigate(to);
                                  }}
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
                  className={`${className} ${
                    isActive ? "text-custom-blue" : "text-black"
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
          <div className="fixed inset-0 top-12 bg-gray-800 bg-opacity-75 z-40 lg:hidden">
            <div className="fixed left-0 top-12 w-64 h-[calc(100vh-3rem)] bg-white z-50 overflow-y-auto pb-20">
              <div className="p-4 space-y-1">
                {/* Super Admin Mobile Navigation */}
                {userType === "superAdmin" && (
                  <>
                    {enhancedCheckPermission("Tenants") && (
                      <NavLink
                        to="/tenants"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/tenants")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/tenants");
                        }}
                      >
                        Tenants
                      </NavLink>
                    )}

                    {getRequestsDropdownItems().filter((item) =>
                      enhancedCheckPermission(item.permissionKey),
                    ).length > 0 && (
                      <div className="relative" ref={requestsRef}>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                            getRequestsDropdownItems().some((item) =>
                              isActive(item.path),
                            )
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={toggleRequestsDropdown}
                        >
                          <span>Requests</span>
                          {dropdownState.requestsDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {dropdownState.requestsDropdown && (
                          <div className="mt-1 ml-4 space-y-1">
                            {getRequestsDropdownItems().map(
                              ({ path, label, permissionKey }) =>
                                enhancedCheckPermission(permissionKey) && (
                                  <NavLink
                                    key={path}
                                    to={path}
                                    className={`block px-4 py-2 rounded-md ${
                                      isActive(path)
                                        ? "bg-gray-100 text-custom-blue"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      closeAllDropdowns();
                                      toggleSidebar();
                                      navigate(path);
                                    }}
                                  >
                                    {label}
                                  </NavLink>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {enhancedCheckPermission("InterviewRequest") && (
                      <NavLink
                        to="/interviewer-requests"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/interviewer-requests")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/interviewer-requests");
                        }}
                      >
                        Interviewer Requests
                      </NavLink>
                    )}

                    {enhancedCheckPermission("OutsourceInterviewerRequest") && (
                      <NavLink
                        to="/outsource-interviewers"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/outsource-interviewers")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/outsource-interviewers");
                        }}
                      >
                        Outsource Interviewers
                      </NavLink>
                    )}

                    {enhancedCheckPermission("SupportDesk") && (
                      <NavLink
                        to="/support-desk"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/support-desk")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/support-desk");
                        }}
                      >
                        Support Desk
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Billing") && (
                      <NavLink
                        to="/admin-billing"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/admin-billing")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/admin-billing");
                        }}
                      >
                        Billing
                      </NavLink>
                    )}
                    {enhancedCheckPermission("InternalLogs") && (
                      <NavLink
                        to="/internal-logs"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/internal-logs")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/internal-logs");
                        }}
                      >
                        Internal Logs
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Interviews") && (
                      <NavLink
                        to="/admin-interviews"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/admin-interviews")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/admin-interviews");
                        }}
                      >
                        Interviews
                      </NavLink>
                    )}

                    {enhancedCheckPermission("QuestionBankManager") && (
                      <NavLink
                        to="/question-bank-manager"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/question-bank-manager")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/question-bank-manager");
                        }}
                      >
                        Question Bank
                      </NavLink>
                    )}
                    {getMoreDropdownItems().length > 0 && (
                      <div className="relative" ref={moreRef}>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                            getMoreDropdownItems().some((item) =>
                              isActive(item.path),
                            )
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={toggleMoreDropdown}
                        >
                          <span>More</span>
                          {dropdownState.moreDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {dropdownState.moreDropdown && (
                          <div className="mt-1 ml-4 space-y-1">
                            {getMoreDropdownItems().map(({ path, label }) => (
                              <NavLink
                                key={path}
                                to={path}
                                className={`block px-4 py-2 rounded-md ${
                                  isActive(path)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeAllDropdowns();
                                  toggleSidebar();
                                  navigate(path);
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

                {/* Effective User Mobile Navigation */}
                {userType === "effective" && (
                  <>
                    {enhancedCheckPermission("Candidates") && (
                      <NavLink
                        to="/candidate"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/candidate")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/candidate");
                        }}
                      >
                        Candidates
                      </NavLink>
                    )}

                    {enhancedCheckPermission("Positions") && (
                      <NavLink
                        to="/position"
                        className={`block px-4 py-3 rounded-md ${
                          isActive("/position")
                            ? "bg-gray-100 text-custom-blue font-bold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          closeAllDropdowns();
                          toggleSidebar();
                          navigate("/position");
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
                          className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                            isActive("/interviews") ||
                            isActive("/mock-interview") ||
                            isActive("/interview-templates")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={toggleInterviewDropdown}
                        >
                          <span>Interviews</span>
                          {dropdownState.interviewDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
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
                                ? [
                                    {
                                      to: "/interviews",
                                      label: "Interviews",
                                    },
                                  ]
                                : []),
                              ...(enhancedCheckPermission("MockInterviews")
                                ? [
                                    {
                                      to: "/mock-interview",
                                      label: "Mock Interviews",
                                    },
                                  ]
                                : []),
                            ].map(({ to, label }) => (
                              <NavLink
                                key={to}
                                className={`block px-4 py-2 rounded-md ${
                                  isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                                to={to}
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeAllDropdowns();
                                  toggleSidebar();
                                  navigate(to);
                                }}
                              >
                                {label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(enhancedCheckPermission("AssessmentTemplates") ||
                      enhancedCheckPermission("Assessments")) && (
                      <div className="relative" ref={assessmentRef}>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                            isActive("/assessments") ||
                            isActive("/assessment-templates")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={toggleAssessmentDropdown}
                        >
                          <span>Assessments</span>
                          {dropdownState.assessmentDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        {dropdownState.assessmentDropdown && (
                          <div className="mt-1 ml-4 space-y-1">
                            {[
                              ...(enhancedCheckPermission("AssessmentTemplates")
                                ? [
                                    {
                                      to: "/assessment-templates",
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
                                className={`block px-4 py-2 rounded-md ${
                                  isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                                to={to}
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeAllDropdowns();
                                  toggleSidebar();
                                  navigate(to);
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
                          className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                            isActive("/analytics") ||
                            isActive("/support-desk") ||
                            isActive("/feedback") ||
                            isActive("/question-bank")
                              ? "bg-gray-100 text-custom-blue font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={toggleMoreDropdown}
                        >
                          <span>More</span>
                          {dropdownState.moreDropdown ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
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
                                      to: "/question-bank",
                                      label: "Question Bank",
                                    },
                                  ]
                                : []),
                              ...(enhancedCheckPermission("Feedback")
                                ? [{ to: "/feedback", label: "Feedback" }]
                                : []),
                              ...(enhancedCheckPermission("SupportDesk")
                                ? [
                                    {
                                      to: "/support-desk",
                                      label: "Support Desk",
                                    },
                                  ]
                                : []),
                            ].map(({ to, label }) => (
                              <NavLink
                                key={to}
                                className={`block px-4 py-2 rounded-md ${
                                  isActive(to)
                                    ? "bg-gray-100 text-custom-blue"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                                to={to}
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeAllDropdowns();
                                  toggleSidebar();
                                  navigate(to);
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
});

export default CombinedNavbar;
