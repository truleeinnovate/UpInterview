import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineDown } from "react-icons/ai";
import { CiCreditCard1 } from "react-icons/ci";
import { LiaWalletSolid } from "react-icons/lia";
import { FaBars, FaCaretDown, FaCaretUp } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoMdInformationCircleOutline, IoIosArrowUp } from "react-icons/io";
import { IoHome } from "react-icons/io5";

import NavbarSidebar from "../Navbar-Sidebar";
import Sidebar from "./Sidebar";
import NotificationPanel from "../../../Pages/Push-Notification/NotificationPanel.jsx";

import logo from "../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import { X } from "lucide-react";
import { config } from "../../../config.js";
import axios from "axios";
import { useCustomContext } from "../../../Context/Contextfetch.js";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { clearAllCookies } from "../../../utils/AuthCookieManager/AuthCookieManager.jsx";
import { usePermissions } from "../../../Context/PermissionsContext";

function Header() {
  const { superAdminPermissions } = usePermissions();
  // const { user, hasRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  // const [userType, setUserType] = useState("SuperAdmin");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile, superAdminProfile } = useCustomContext();

  const authToken = Cookies.get("authToken");
  const impersonatedUserId = Cookies.get("impersonatedUserId");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;

  const [profileImage, setProfileImage] = useState(null);

  // Format name to capitalize first letter of first and last names
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // const capitalizeFirstLetter = (str) =>
  //   str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const firstName = formatName(userProfile?.firstName);
  const lastName = formatName(userProfile?.lastName);

  // Refs for dropdowns
  const moreRef = useRef(null);
  const outlineRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch profile image
  // useEffect(() => {
  //   const fetchProfileImage = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/contacts/${userId}`
  //       );
  //       const contact = response.data;
  //       if (contact.ImageData && contact.ImageData.path) {
  //         const imageUrl = `${
  //           config.REACT_APP_API_URL
  //         }/${contact.ImageData.path.replace(/\\/g, "/")}`;
  //         setProfileImage(imageUrl);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching profile image:", error);
  //     }
  //   };
  //   fetchProfileImage();
  // }, [userId]);

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

  const mainNavItems = [
    { path: "/tenants", label: "Tenants", permissionKey: "Tenants.ViewTab" },
    {
      path: "/interviewer-requests",
      label: "Interviewer Requests",
      permissionKey: "InterviewRequest.ViewTab",
      // role: "super_admin",
    },
    {
      path: "/outsource-interviewers",
      label: "Outsource Interviewers",
      permissionKey: "OutsourceInterviewerRequest.ViewTab",
      // role: "super_admin",
    },
    {
      path: "/support-tickets",
      label: "Support Desk",
      permissionKey: "SupportDesk.ViewTab",
      // role: "super_admin",
    },
    {
      path: "/admin-billing",
      label: "Billing",
      permissionKey: "Billing.ViewTab",
      // role: "super_admin",
    },
  ];

  // const moreNavItems = [
  //   {
  //     path: "/settings",
  //     label: "Settings",
  //     permissionKey: "Settings.ViewTab",
  //     // role: "super_admin",
  //   },
  //   {
  //     path: "/internal-logs",
  //     label: "Internal Logs",
  //     permissionKey: "InternalLogs.ViewTab",
  //     // role: "super_admin",
  //   },
  //   {
  //     path: "/integrations",
  //     label: "Integrations",
  //     permissionKey: "IntegrationLogs.ViewTab",
  //     // role: "super_admin",
  //   },
  // ];

  // Utility function to close all dropdowns
  
  const closeAllDropdowns = React.useCallback((openDropdown = null) => {
    setDropdownState((prevState) => ({
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

  // Toggle functions
  const toggleMoreDropdown = () =>
    closeAllDropdowns(dropdownState.moreDropdown ? null : "moreDropdown");
  const toggleOutlineDropdown = () =>
    closeAllDropdowns(dropdownState.outlineDropdown ? null : "outlineDropdown");
  const toggleProfileDropdown = () =>
    closeAllDropdowns(dropdownState.profileDropdown ? null : "profileDropdown");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        [moreRef, outlineRef, notificationRef, profileRef].every(
          (ref) => ref.current && !ref.current.contains(event.target)
        )
      ) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeAllDropdowns]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Utility function for checking active path
  const isActive = (path) => {
    return path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);
  };

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
          <div className="mt-2 mb-2 ml-8 flex items-center">
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
                <label className="inline-flex items-center ml-5">
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
          {superAdminProfile[0]?.imageData ? (
            <img
              src={superAdminProfile[0]?.imageData?.path}
              alt="Profile"
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <CgProfile className="text-custom-blue text-xl" />
          )}
        </p>
        <span className="font-medium ml-1">
          {formatName(superAdminProfile[0]?.firstName)}{" "}
          {formatName(superAdminProfile[0]?.lastName)}
        </span>
      </div>
      <div className="flex justify-between px-3 py-1 border-b text-xs">
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

            // logout(organization);
            clearAllCookies();
            navigate("/organization-login");
          }}
        >
          Log Out
        </button>
      </div>
      {/* <div className="px-2 py-1">
        {[
          { to: "/billing", label: "Billing", icon: <CiCreditCard1 /> },
          {
            to: "/wallet-transcations",
            label: "My Wallet",
            icon: <LiaWalletSolid />,
          },
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
      </div> */}
    </div>
  );

  const handleSettingsClick = () => {
    closeAllDropdowns();
    navigate("/account-settings");
  };

  // Icon configuration for Home, Information, Bell, and Profile
  const icons = [
    {
      key: "home",
      ref: null,
      content: (
        <NavLink
          to="/admin-dashboard"
          className="text-black"
          onClick={() => closeAllDropdowns()}
        >
          <IoHome
            className={
              isActive("/admin-dashboard") ? "text-custom-blue" : "text-black"
            }
          />
        </NavLink>
      ),
      className: "text-xl border rounded-md p-2",
      isActive: isActive("/admin-dashboard"),
    },
    // {
    //   key: "info",
    //   ref: outlineRef,
    //   content: (
    //     <div className="relative">
    //       <p
    //         className="font-medium cursor-pointer"
    //         onClick={toggleOutlineDropdown}
    //       >
    //         <IoMdInformationCircleOutline
    //           className={
    //             dropdownState.outlineDropdown
    //               ? "text-custom-blue"
    //               : "text-black"
    //           }
    //         />
    //         {dropdownState.outlineDropdown && (
    //           <IoIosArrowUp className="absolute top-10 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
    //         )}
    //       </p>
    //       {dropdownState.outlineDropdown && outlineDropdownContent}
    //     </div>
    //   ),
    //   className: "text-xl border rounded-md p-2",
    //   isActive: dropdownState.outlineDropdown,
    // },
    {
      key: "notification",
      ref: notificationRef,
      content: (
        <div className="relative">
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
          {dropdownState.isNotificationOpen && (
            <IoIosArrowUp className="absolute top-12 left-[50%] -translate-x-1/2 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
          )}
        </div>
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
            {profileImage ? (
              <img
                src={profileImage}
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
      className: "text-xl border rounded-md p-2",
      isActive: dropdownState.profileDropdown,
    },
  ];

  return (
    <div className="fixed top-0 z-50 left-0 w-full flex items-center justify-between px-4 sm:px-4 md:px-4 lg:px-4 xl:px-4 2xl:px-4 h-16 bg-white border border-b-gray-200">
      <div className="flex items-center flex-1">
        <div className="flex items-center flex-shrink-0 gap-2">
          <button
            className="lg:hidden xl:hidden 2xl:hidden"
            onClick={handleSidebarToggle}
          >
            <FaBars className="size-5 md:size-6" />
          </button>
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-24" />
          </div>
        </div>

        <nav className="hidden lg:flex xl:flex s2xl:flex ml-16 gap-x-1">
          {mainNavItems.map(
            (item) =>
              !item.role &&
              (!item.permissionKey ||
                item.permissionKey
                  .split(".")
                  .reduce((acc, key) => acc?.[key], superAdminPermissions)) && (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`h-16 flex items-center relative mx-4 first:ml-0 last:mr-0 ${
                    isActive(item.path)
                      ? "text-custom-blue border-b-2 border-custom-blue font-bold"
                      : "text-gray-600 hover:text-custom-blue"
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-custom-blue"></div>
                  )}
                </NavLink>
              )
          )}

          {/* More Dropdown */}
          {/* <div className="relative flex items-center" ref={moreRef}>
            <button
              className={`flex items-center h-16 relative px-1 transition-colors duration-300 ${
                moreNavItems.some(
                  (item) =>
                    isActive(item.path) &&
                    (!item.permissionKey ||
                      item.permissionKey
                        .split(".")
                        .reduce(
                          (acc, key) => acc?.[key],
                          superAdminPermissions
                        ))
                )
                  ? "text-custom-blue font-bold border-b-2 border-custom-blue"
                  : "text-gray-600 hover:text-custom-blue"
              }`}
              onClick={toggleMoreDropdown}
            >
              More
              <AiOutlineDown
                className={`ml-1 transition-transform duration-300 ease-in-out ${
                  dropdownState.moreDropdown ? "rotate-180" : ""
                }`}
              />
              {moreNavItems.some((item) => isActive(item.path)) && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-custom-blue"></div>
              )}
            </button>

            <div
              className={`absolute left-0 top-12 z-50 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 border p-2 transform transition-all duration-300 ease-in-out origin-top ${
                dropdownState.moreDropdown
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="space-y-1">
                {moreNavItems
                  .filter(
                    (item) =>
                      !item.role &&
                      (!item.permissionKey ||
                        item.permissionKey
                          .split(".")
                          .reduce(
                            (acc, key) => acc?.[key],
                            superAdminPermissions
                          ))
                  )
                  .map(({ path: to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={`block px-3 py-2 rounded-md hover:bg-gray-100 hover:text-custom-blue transition-colors duration-200 ${
                        isActive(to)
                          ? "bg-gray-100 text-custom-blue font-semibold"
                          : "text-gray-700"
                      }`}
                      onClick={() => closeAllDropdowns()}
                    >
                      {label}
                    </NavLink>
                  ))}
              </div>
            </div>
          </div> */}
        </nav>

        <div className="xl:hidden">
          {isSidebarOpen && (
            <Sidebar open={isSidebarOpen} onClose={handleSidebarToggle} />
          )}
        </div>

        {/* Search bar */}
        <div className="ml-8 flex-1 max-w-lg">
          {/* <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search..."
            />
          </div> */}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* <NavLink to="/admin-dashboard">
          <button
            type="button"
            className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <AiOutlineHome className="h-6 w-6" />
          </button>
        </NavLink>

        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none hidden sm:block"
        >
          <AiOutlineQuestionCircle className="h-6 w-6" />
        </button>

        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <AiOutlineBell className="h-6 w-6" />
        </button>

        <div className="relative">
          <button
            type="button"
            className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              className="h-8 w-8 rounded-full"
              src={user?.avatar || "https://i.pravatar.cc/150?img=68"}
              alt=""
            />
          </button>

          {showDropdown && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Your Profile
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Settings
                </a>
                <a
                  href="#logout"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDropdown(false);
                  }}
                >
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div> */}

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
  );
}

export default Header;
