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
import "./Navbar-Sidebar.scss";
import Cookies from "js-cookie";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import NotificationPanel from "../../Pages/Push-Notification/NotificationPanel.jsx";
import { logout } from "../../utils/AuthCookieManager/AuthCookieManager";
import { useCustomContext } from "../../Context/Contextfetch.js";
import { usePermissions } from "../../Context/PermissionsContext";

const Navbar = () => {
  const { effectivePermissions } = usePermissions();
  const location = useLocation();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const { userProfile, singlecontact } = useCustomContext();
  const navigate = useNavigate();

  // Format name to capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = formatName(userProfile?.firstName);
  const lastName = formatName(userProfile?.lastName);
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
      if (
        [
          assessmentRef,
          interviewRef,
          moreRef,
          outlineRef,
          notificationRef,
          profileRef,
        ].every((ref) => ref.current && !ref.current.contains(event.target))
      ) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllDropdowns]);

  const handleSettingsClick = () => {
    closeAllDropdowns();
    navigate("/account-settings");
  };

  // Check if a nav item or icon is active
  const isActive = (path) => location.pathname === path;

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
          {singlecontact?.imageData?.path ? (
            <img
              src={singlecontact.imageData.path}
              alt="Profile"
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <CgProfile className="text-custom-blue text-xl" />
          )}
        </p>
        <span className="font-medium ml-1">
          {firstName} {lastName}
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
          className="text-custom-blue hover:text-blue-500"
          onClick={() => {
            closeAllDropdowns();
            logout(organization);
            navigate("/");
          }}
        >
          Log Out
        </button>
      </div>
      <div
        className={`px-2 py-1 ${
          effectivePermissions.Billing?.ViewTab &&
          effectivePermissions.Wallet?.ViewTab
            ? "border-t"
            : ""
        }`}
      >
        {[
          ...(effectivePermissions.Billing?.ViewTab
            ? [
                {
                  to: "/billing-details",
                  label: "Billing",
                  icon: <CiCreditCard1 />,
                },
              ]
            : []),
          ...(effectivePermissions.Wallet?.ViewTab
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
            className="flex items-center py-2 text-black hover:bg-gray-200 hover:text-custom-blue rounded-md"
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
          to="/home"
          className="text-black"
          onClick={() => closeAllDropdowns()}
        >
          <IoHome
            className={isActive("/home") ? "text-custom-blue" : "text-black"}
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
            {singlecontact?.imageData?.path ? (
              <img
                src={singlecontact?.imageData?.path}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <CgProfile
                className={`cursor-pointer ${
                  dropdownState.profileDropdown
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
      className: `text-xl border rounded-md ${
        singlecontact?.imageData?.path ? "p-1" : "p-2"
      }`,
      isActive: dropdownState.profileDropdown,
    },
  ];

  return (
    <>
      <div className="bg-white fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="mx-auto relative">
          <div className="flex justify-between items-center border-gray-100 p-2 sm:px-4">
            {/* Mobile menu button and logo */}
            <div className="flex items-center">
              <button
                className="sidebar-icon12 mr-2 lg:hidden xl:hidden 2xl:hidden"
                onClick={toggleSidebar}
              >
                <FaBars />
              </button>
              <img src={logo} alt="Logo" className="w-24" />
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex xl:flex 2xl:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8 max-w-3xl">
                {effectivePermissions.Candidates?.ViewTab && (
                  <NavLink
                    to="/candidate"
                    className={`h-full flex items-center relative px-1 ${
                      isActive("/candidate")
                        ? "text-custom-blue font-bold"
                        : "text-gray-600 hover:text-custom-blue"
                    }`}
                    onClick={() => closeAllDropdowns()}
                  >
                    Candidates
                    {isActive("/candidate") && (
                      <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                    )}
                  </NavLink>
                )}

                {effectivePermissions.Positions?.ViewTab && (
                  <NavLink
                    to="/position"
                    className={`h-full flex items-center relative px-1 ${
                      isActive("/position")
                        ? "text-custom-blue font-bold"
                        : "text-gray-600 hover:text-custom-blue"
                    }`}
                    onClick={() => closeAllDropdowns()}
                  >
                    Positions
                    {isActive("/position") && (
                      <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                    )}
                  </NavLink>
                )}

                {(effectivePermissions.Interviews?.ViewTab ||
                  effectivePermissions.MockInterviews?.ViewTab ||
                  effectivePermissions.InterviewTemplates?.ViewTab) && (
                  <div
                    className="relative h-full flex items-center"
                    ref={interviewRef}
                  >
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/interviewList") ||
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
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.interviewDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            ...(effectivePermissions.InterviewTemplates?.ViewTab
                              ? [
                                  {
                                    to: "/interview-templates",
                                    label: "Interview Templates",
                                  },
                                ]
                              : []),
                            ...(effectivePermissions.Interviews?.ViewTab
                              ? [{ to: "/interviewList", label: "Interviews" }]
                              : []),
                            // Only include Mock Interviews if organization is NOT present
                            ...(effectivePermissions.MockInterviews?.ViewTab
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
                              className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                isActive(to)
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

                {(effectivePermissions.Assessment_Template?.ViewTab ||
                  effectivePermissions.Assessments?.ViewTab) && (
                  <div
                    className="relative h-full flex items-center"
                    ref={assessmentRef}
                  >
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/assessments") || isActive("/assessments-template")
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
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.assessmentDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            ...(effectivePermissions.Assessment_Template?.ViewTab
                              ? [{ to: "/assessments-template", label: "Assessments Template" }]
                              : []),
                              ...(effectivePermissions.Assessments?.ViewTab
                                ? [{ to: "/assessments", label: "Assessments" }]
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

                {(effectivePermissions.Analytics?.ViewTab ||
                  effectivePermissions.SupportDesk?.ViewTab ||
                  effectivePermissions.QuestionBank?.ViewTab) && (
                  <div
                    className="relative h-full flex items-center"
                    ref={moreRef}
                  >
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/analytics") || isActive("/support-desk") || isActive("/questionBank")
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
                        isActive("/questionBank"))&& (
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.moreDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            ...(effectivePermissions.Analytics?.ViewTab
                              ? [{ to: "/analytics", label: "Analytics" }]
                              : []),
                            ...(effectivePermissions.SupportDesk?.ViewTab
                              ? [{ to: "/support-desk", label: "Support Desk" }]
                              : []),
                              ...(effectivePermissions.QuestionBank?.ViewTab
                                ? [
                                    {
                                      to: "/questionBank",
                                      label: "Question Bank",
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
          <div className="fixed inset-0 top-16 bg-gray-800 bg-opacity-75 z-40 lg:hidden">
            <div className="fixed left-0 w-64 bg-white h-full z-50 overflow-y-auto">
              <div className="p-4 space-y-1">
                {effectivePermissions.Candidates?.ViewTab && (
                  <NavLink
                    to="/candidate"
                    className={`block px-4 py-3 rounded-md ${
                      isActive("/candidate")
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

                {effectivePermissions.Positions?.ViewTab && (
                  <NavLink
                    to="/position"
                    className={`block px-4 py-3 rounded-md ${
                      isActive("/position")
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

                {(effectivePermissions.Interviews?.ViewTab ||
                  effectivePermissions.MockInterviews?.ViewTab ||
                  effectivePermissions.InterviewTemplates?.ViewTab) && (
                  <div className="relative" ref={interviewRef}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                        isActive("/interviewList") ||
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
                          ...(effectivePermissions.InterviewTemplates?.ViewTab
                            ? [
                                {
                                  to: "/interview-templates",
                                  label: "Interview Templates",
                                },
                              ]
                            : []),
                          ...(effectivePermissions.Interviews?.ViewTab
                            ? [{ to: "/interviewList", label: "Interviews" }]
                            : []),
                          ...(organization
                            ? []
                            : effectivePermissions.MockInterviews?.ViewTab
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
                            className={`block px-4 py-2 rounded-md ${
                              isActive(to)
                                ? "bg-gray-200 text-custom-blue"
                                : "hover:bg-gray-100"
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

                {(effectivePermissions.Assessments?.ViewTab ||
                  effectivePermissions.QuestionBank?.ViewTab) && (
                  <div className="relative" ref={assessmentRef}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                        isActive("/assessments") || isActive("/questionBank")
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
                        {[
                          ...(effectivePermissions.Assessments?.ViewTab
                            ? [{ to: "/assessments", label: "Assessments" }]
                            : []),
                          ...(effectivePermissions.QuestionBank?.ViewTab
                            ? [{ to: "/questionBank", label: "Question Bank" }]
                            : []),
                        ].map(({ to, label }) => (
                          <NavLink
                            key={to}
                            className={`block px-4 py-2 rounded-md ${
                              isActive(to)
                                ? "bg-gray-200 text-custom-blue"
                                : "hover:bg-gray-100"
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

                {(effectivePermissions.Analytics?.ViewTab ||
                  effectivePermissions.SupportDesk?.ViewTab) && (
                  <div className="relative" ref={moreRef}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                        isActive("/analytics") || isActive("/support-desk")
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
                          ...(effectivePermissions.Analytics?.ViewTab
                            ? [{ to: "/analytics", label: "Analytics" }]
                            : []),
                          ...(effectivePermissions.SupportDesk?.ViewTab
                            ? [{ to: "/support-desk", label: "Support Desk" }]
                            : []),
                        ].map(({ to, label }) => (
                          <NavLink
                            key={to}
                            className={`block px-4 py-2 rounded-md ${
                              isActive(to)
                                ? "bg-gray-200 text-custom-blue"
                                : "hover:bg-gray-100"
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
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-12"></div>
    </>
  );
};

export default Navbar;
