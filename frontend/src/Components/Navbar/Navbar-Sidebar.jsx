import React, { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaCaretDown, FaCaretUp, FaBars } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import {IoMdInformationCircleOutline, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoHome } from "react-icons/io5";

import { CiCreditCard1 } from "react-icons/ci";
import { LiaWalletSolid } from "react-icons/lia";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Navbar-Sidebar.scss";
import Cookies from "js-cookie";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import NotificationPanel from "../../Pages/Push-Notification/NotificationPanel.jsx";

const Navbar = () => {
  const location = useLocation();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const userName = tokenPayload?.userName;
  const { logout } = useAuth0();
  const navigate = useNavigate();

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
  const closeAllDropdowns = (openDropdown = null) => {
    setDropdownState({
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
      isSidebarOpen: dropdownState.isSidebarOpen,
    });
  };

  // Toggle functions
  const toggleAssessmentDropdown = () => closeAllDropdowns(dropdownState.assessmentDropdown ? null : "assessmentDropdown");
  const toggleInterviewDropdown = () => closeAllDropdowns(dropdownState.interviewDropdown ? null : "interviewDropdown");
  const toggleMoreDropdown = () => closeAllDropdowns(dropdownState.moreDropdown ? null : "moreDropdown");
  const toggleOutlineDropdown = () => closeAllDropdowns(dropdownState.outlineDropdown ? null : "outlineDropdown");
  const toggleProfileDropdown = () => closeAllDropdowns(dropdownState.profileDropdown ? null : "profileDropdown");
  const toggleSidebar = () => setDropdownState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));

  // Help & training sub-dropdown toggles
  const handleGettingToggle = () => setDropdownState((prev) => ({ ...prev, isGettingDropdownOpen: !prev.isGettingDropdownOpen }));
  const handleDetailToggle = () => setDropdownState((prev) => ({ ...prev, isDetailDropdownOpen: !prev.isDetailDropdownOpen }));
  const handleQuestionToggle = () => setDropdownState((prev) => ({ ...prev, isQuestionDropdownOpen: !prev.isQuestionDropdownOpen }));
  const handleFunctionToggle = () => setDropdownState((prev) => ({ ...prev, isFunctionDropdownOpen: !prev.isFunctionDropdownOpen }));
  const handleContactToggle = () => setDropdownState((prev) => ({ ...prev, isContactDropdownOpen: !prev.isContactDropdownOpen }));
  const handleAdditionalToggle = () => setDropdownState((prev) => ({ ...prev, isAdditionalDropdownOpen: !prev.isAdditionalDropdownOpen }));
  const handleLegalToggle = () => setDropdownState((prev) => ({ ...prev, isLegalDropdownOpen: !prev.isLegalDropdownOpen }));

  // Fetch profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts/${userId}`);
        const contact = response.data;
        if (contact.ImageData && contact.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${contact.ImageData.path.replace(/\\/g, "/")}`;
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };
    fetchProfileImage();
  }, [userId]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        [assessmentRef, interviewRef, moreRef, outlineRef, notificationRef, profileRef].every(
          (ref) => ref.current && !ref.current.contains(event.target)
        )
      ) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    closeAllDropdowns();
    navigate("/account-settings");
  };

  // Check if a nav item or icon is active
  const isActive = (path) => location.pathname === path;

  const outlineDropdownContent = (
    <div className="absolute top-12 w-80 text-sm rounded-md bg-white border border-custom-blue right-0 z-50 -mr-20">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-start font-medium text-custom-blue">Help & Training</h2>
        <button className="text-custom-blue hover:text-blue-500" onClick={toggleOutlineDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M15.293 4.293a1 1 0 1 1 1.414 1.414L11.414 10l5.293 5.293a1 1 0 1 1-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 1 1-1.414-1.414L8.586 10 3.293 4.707a1 1 0 1 1 1.414-1.414L10 8.586l5.293-5.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div>
        <div className="text-sm border-b w-full">
          <div className="mt-2 mb-2 ml-8 flex items-center">
            <p className="text-custom-blue">Introduction</p>
          </div>
          {[
            { label: "Getting Started", toggle: handleGettingToggle, isOpen: dropdownState.isGettingDropdownOpen },
            { label: "Detailed Instructions", toggle: handleDetailToggle, isOpen: dropdownState.isDetailDropdownOpen },
            { label: "FAQs (Frequently Asked Questions)", toggle: handleQuestionToggle, isOpen: dropdownState.isQuestionDropdownOpen },
            { label: "Search Functionality", toggle: handleFunctionToggle, isOpen: dropdownState.isFunctionDropdownOpen },
            { label: "Contact Support", toggle: handleContactToggle, isOpen: dropdownState.isContactDropdownOpen },
            { label: "Additional Resources", toggle: handleAdditionalToggle, isOpen: dropdownState.isAdditionalDropdownOpen },
            { label: "Legal and Privacy Information", toggle: handleLegalToggle, isOpen: dropdownState.isLegalDropdownOpen },
          ].map(({ label, toggle, isOpen }, index) => (
            <div key={index} className="flex justify-between mr-4 mt-2">
              <div className="cursor-pointer">
                <label className="inline-flex items-center ml-5">
                  <span className="ml-3 text-custom-blue">{label}</span>
                </label>
              </div>
              <div className="cursor-pointer" onClick={toggle}>
                {isOpen ? <FaCaretUp className="ml-10 text-custom-blue" /> : <FaCaretDown className="ml-10 text-custom-blue" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const profileDropdownContent = (
    <div className="absolute top-10 border border-custom-blue w-40 text-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 -mr-2 z-50">
      <div className="p-2 flex items-center">
        <p className="font-medium text-custom-blue" onClick={toggleProfileDropdown}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-7 h-7 rounded-full" />
          ) : (
            <CgProfile className="text-custom-blue text-xl" />
          )}
        </p>
        <span className="font-medium ml-1">{userName}</span>
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
            logout({ returnTo: window.location.origin });
          }}
        >
          Log Out
        </button>
      </div>
      <div className="px-2 py-1">
        {[
          { to: "/billing", label: "Billing", icon: <CiCreditCard1 /> },
          { to: "/wallet-transcations", label: "My Wallet", icon: <LiaWalletSolid /> },
        ].map(({ to, label, icon }, index) => (
          <NavLink
            key={index}
            className="flex items-center py-2 hover:bg-gray-200 hover:text-custom-blue rounded-md"
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
        <NavLink to="/home" className="text-black" onClick={() => closeAllDropdowns()}>
          <IoHome className={isActive("/home") ? "text-custom-blue" : "text-black"} />
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
          <p className="font-medium" onClick={toggleOutlineDropdown}>
            <IoMdInformationCircleOutline
              className={dropdownState.outlineDropdown ? "text-custom-blue" : "text-black"}
            />
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
          setIsOpen={(value) => setDropdownState((prev) => ({ ...prev, isNotificationOpen: value }))}
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
          <p className="font-medium" onClick={toggleProfileDropdown}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <CgProfile
                className={dropdownState.profileDropdown ? "text-custom-blue" : "text-black"}
              />
            )}
          </p>
          {dropdownState.profileDropdown && profileDropdownContent}
        </div>
      ),
      className: "text-xl border rounded-md px-1 py-1 flex items-center",
      isActive: dropdownState.profileDropdown,
    },
  ];

  return (
    <>
      <div className="bg-white fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto relative">
          <div className="flex justify-between items-center border-b-2 border-gray-100 xl:p-2 2xl:p-2 lg:p-2 sm:px-5 md:px-5 sm:py-3 md:py-3">
            <div>
              <img src={logo} alt="Logo" className="w-24 hidden lg:block xl:block 2xl:block ml-3" />
            </div>
            <div className="flex-col sm:flex md:flex lg:hidden xl:hidden 2xl:hidden">
              <div className="flex items-center justify-between w-full">
                <button className="sidebar-icon12" onClick={toggleSidebar}>
                  <FaBars />
                </button>
                <div className="flex-1 flex justify-center -mr-20">
                  <img src={logo} alt="Logo" className="w-20 md:w-24 hidden sm:block md:block" />
                </div>
                <div className="flex space-x-2">
                  {icons.map(({ key, ref, content, className, isActive }) => (
                    <div
                      key={key}
                      className={`${className} ${isActive ? "text-custom-blue" : "text-black"}`}
                      ref={ref}
                    >
                      {content}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex xl:flex 2xl:flex items-center justify-between w-full">
              <div className="flex items-center">
                <img src={logo} alt="Logo" className="w-24 ml-3" />
              </div>
              <nav className="flex-1 flex justify-center">
                <div className="flex items-center space-x-8 max-w-3xl">
                  <NavLink
                    to="/candidate"
                    className={`h-full flex items-center relative px-1 ${
                      isActive("/candidate") ? "text-custom-blue font-bold" : "text-gray-600 hover:text-custom-blue"
                    }`}
                    onClick={() => closeAllDropdowns()}
                  >
                    Candidates
                    {isActive("/candidate") && (
                      <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                    )}
                  </NavLink>

                  <NavLink
                    to="/position"
                    className={`h-full flex items-center relative px-1 ${
                      isActive("/position") ? "text-custom-blue font-bold" : "text-gray-600 hover:text-custom-blue"
                    }`}
                    onClick={() => closeAllDropdowns()}
                  >
                    Positions
                    {isActive("/position") && (
                      <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                    )}
                  </NavLink>

                  <div className="relative h-full flex items-center" ref={interviewRef}>
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/interviewList") || isActive("/mockinterview") || isActive("/interview-templates")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                      }`}
                      onClick={toggleInterviewDropdown}
                    >
                      Interviews
                      {dropdownState.interviewDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      {(isActive("/interviewList") || isActive("/mockinterview") || isActive("/interview-templates")) && (
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.interviewDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            { to: "/interview-templates", label: "Interview Templates" },
                            { to: "/interviewList", label: "Interviews" },
                            { to: "/mockinterview", label: "Mock Interviews" },
                          ].map(({ to, label }) => (
                            <NavLink
                              key={to}
                              className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                isActive(to) ? "bg-gray-100 text-custom-blue" : ""
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

                  <div className="relative h-full flex items-center" ref={assessmentRef}>
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/assessments") || isActive("/questionBank")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                      }`}
                      onClick={toggleAssessmentDropdown}
                    >
                      Assessments
                      {dropdownState.assessmentDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      {(isActive("/assessments") || isActive("/questionBank")) && (
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.assessmentDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            { to: "/assessments", label: "Assessments" },
                            { to: "/questionBank", label: "Question Bank" },
                          ].map(({ to, label }) => (
                            <NavLink
                              key={to}
                              className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                isActive(to) ? "bg-gray-100 text-custom-blue" : ""
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

                  <div className="relative h-full flex items-center" ref={moreRef}>
                    <button
                      className={`flex items-center h-full relative px-1 ${
                        isActive("/analytics") || isActive("/support-desk")
                          ? "text-custom-blue font-bold"
                          : "text-gray-600 hover:text-custom-blue"
                      }`}
                      onClick={toggleMoreDropdown}
                    >
                      More
                      {dropdownState.moreDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      {(isActive("/analytics") || isActive("/support-desk")) && (
                        <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                      )}
                    </button>
                    {dropdownState.moreDropdown && (
                      <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                        <div className="space-y-1">
                          {[
                            { to: "/analytics", label: "Analytics" },
                            { to: "/support-desk", label: "Support Desk" },
                          ].map(({ to, label }) => (
                            <NavLink
                              key={to}
                              className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${
                                isActive(to) ? "bg-gray-100 text-custom-blue" : ""
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
                </div>
              </nav>
              <div className="flex space-x-3 pr-3">
                {icons.map(({ key, ref, content, className, isActive }) => (
                  <div
                    key={key}
                    className={`${className} ${isActive ? "text-custom-blue" : "text-black"}`}
                    ref={ref}
                  >
                    {content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dropdownState.isSidebarOpen && (
        <div className="fixed inset-0 top-16 bg-gray-800 bg-opacity-75 z-40 lg:hidden xl:hidden 2xl:hidden">
          <div className="fixed left-0 w-64 bg-white h-full z-50 overflow-y-auto">
            <div className="p-4 space-y-1">
              {[
                { to: "/candidate", label: "Candidates" },
                { to: "/position", label: "Positions" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={`block px-4 py-3 rounded-md ${
                    isActive(to) ? "bg-gray-100 text-custom-blue font-bold" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    closeAllDropdowns();
                    toggleSidebar();
                  }}
                >
                  {label}
                </NavLink>
              ))}

              <div className="relative" ref={interviewRef}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${
                    isActive("/interviewList") || isActive("/mockinterview") || isActive("/interview-templates")
                      ? "bg-gray-100 text-custom-blue font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={toggleInterviewDropdown}
                >
                  <span>Interviews</span>
                  {dropdownState.interviewDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {dropdownState.interviewDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    {[
                      { to: "/interview-templates", label: "Interview Templates" },
                      { to: "/interviewList", label: "Interviews" },
                      { to: "/mockinterview", label: "Mock Interviews" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        className={`block px-4 py-2 rounded-md ${
                          isActive(to) ? "bg-gray-200 text-custom-blue" : "hover:bg-gray-100"
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
                  {dropdownState.assessmentDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {dropdownState.assessmentDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    {[
                      { to: "/assessments", label: "Assessments" },
                      { to: "/questionBank", label: "Question Bank" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        className={`block px-4 py-2 rounded-md ${
                          isActive(to) ? "bg-gray-200 text-custom-blue" : "hover:bg-gray-100"
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
                  {dropdownState.moreDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {dropdownState.moreDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    {[
                      { to: "/analytics", label: "Analytics" },
                      { to: "/support-desk", label: "Support Desk" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        className={`block px-4 py-2 rounded-md ${
                          isActive(to) ? "bg-gray-200 text-custom-blue" : "hover:bg-gray-100"
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
            </div>
          </div>
        </div>
      )}

      <div className="mb-12"></div>
    </>
  );
};

export default Navbar;