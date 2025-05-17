import React, { useState, useEffect, useRef } from "react";
import { PiNotificationBold } from "react-icons/pi";
import { FaArrowRight } from "react-icons/fa";
import { AiTwotoneSchedule } from "react-icons/ai";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FaBell } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { NavLink, useLocation } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Navbar-Sidebar.scss";
import Cookies from 'js-cookie';
import { FaBars } from "react-icons/fa";
import { CiCreditCard1 } from "react-icons/ci";
import { LiaWalletSolid } from "react-icons/lia";
import { MdAppSettingsAlt } from "react-icons/md";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode';
import NotificationPanel from '../../Pages/Push-Notification/NotificationPanel.jsx';

const Navbar = () => {

  const location = useLocation();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const userName = tokenPayload?.userName;
  const { logout } = useAuth0();
  const [assessmentDropdown, setAssessmentDropdown] = useState(false);
  const [interviewDropdown, setInterviewDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);
  const [isGettingDropdownOpen, setIsGettingDropdownOpen] = useState(false);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);
  const [isFunctionDropdownOpen, setIsFunctionDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isAdditionalDropdownOpen, setIsAdditionalDropdownOpen] = useState(false);
  const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const assessmentRef = useRef(null);
  const interviewRef = useRef(null);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts/${userId}`);
        const contact = response.data;
        if (contact.ImageData && contact.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${contact.ImageData.path.replace(/\\/g, '/')}`;
          setProfileImage(imageUrl);
        }
      } catch (error) {
        // console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [userId]);

  // Helper functions for dropdown toggles
  const handleGettingToggle = () => {
    setIsGettingDropdownOpen(!isGettingDropdownOpen);
  };
  const handleDetailToggle = () => {
    setIsDetailDropdownOpen(!isDetailDropdownOpen);
  };
  const handleQuestionToggle = () => {
    setIsQuestionDropdownOpen(!isQuestionDropdownOpen);
  };
  const handleFunctionToggle = () => {
    setIsFunctionDropdownOpen(!isFunctionDropdownOpen);
  };
  const handleContactToggle = () => {
    setIsContactDropdownOpen(!isContactDropdownOpen);
  };
  const handleAdditionalToggle = () => {
    setIsAdditionalDropdownOpen(!isAdditionalDropdownOpen);
  };
  const handleLegalToggle = () => {
    setIsLegalDropdownOpen(!isLegalDropdownOpen);
  };


  const handleSettingsClick = () => {
    navigate('/account-settings');
  };

  const [outlineDropdown, setOutlineDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const outlineRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      outlineRef.current && !outlineRef.current.contains(event.target) &&
      notificationRef.current && !notificationRef.current.contains(event.target) &&
      profileRef.current && !profileRef.current.contains(event.target) &&
      interviewRef.current && !interviewRef.current.contains(event.target) &&
      assessmentRef.current && !assessmentRef.current.contains(event.target) &&
      moreRef.current && !moreRef.current.contains(event.target)
    ) {
      setOutlineDropdown(false);
      setProfileDropdown(false);
      setInterviewDropdown(false);
      setAssessmentDropdown(false);
      setMoreDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOutlineDropdown = () => {
    setOutlineDropdown(prev => !prev);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };


  const toggleProfileDropdown = () => {
    setProfileDropdown(prev => !prev);
    setOutlineDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleInterviewDropdown = () => {
    setInterviewDropdown(prev => !prev);
    setOutlineDropdown(false);
    setProfileDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleAssessmentDropdown = () => {
    setAssessmentDropdown(prev => !prev);
    setOutlineDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setMoreDropdown(false);
  };

  const toggleMoreDropdown = () => {
    setMoreDropdown(prev => !prev);
    setOutlineDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const outlineDropdownContent = (
    <div className="absolute top-12 w-80 text-sm rounded-md bg-white border border-custom-blue right-0 z-50 -mr-20">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-start font-medium text-custom-blue">Help & Training</h2>
        <button className="text-custom-blue hover:text-blue-500" onClick={toggleOutlineDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.293 4.293a1 1 0 1 1 1.414 1.414L11.414 10l5.293 5.293a1 1 0 1 1-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 1 1-1.414-1.414L8.586 10 3.293 4.707a1 1 0 1 1 1.414-1.414L10 8.586l5.293-5.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div>
        <div className="text-sm border-b w-full">
          <div className="mt-2 mb-2 ml-8 flex items-center">
            <p className="text-custom-blue">Introduction</p>
          </div>
          <div className="flex justify-between mr-4 mt-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Getting Started</span>
              </label>
            </div>
            <div className="cursor-pointer ml-30" onClick={handleGettingToggle}>
              {isGettingDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex mt-2 justify-between mr-4">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Detailed Instructions</span>
              </label>
            </div>
            <div className="cursor-pointer ml-[88px]" onClick={handleDetailToggle}>
              {isDetailDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex justify-between mr-4 mt-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">FAQs (Frequently Asked Questions) </span>
              </label>
            </div>
            <div className="cursor-pointer" onClick={handleQuestionToggle}>
              {isQuestionDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex justify-between mr-4 mt-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Search Functionalilty</span>
              </label>
            </div>
            <div className="cursor-pointer ml-[88px]" onClick={handleFunctionToggle}>
              {isFunctionDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex justify-between mr-4 mt-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Contact Support</span>
              </label>
            </div>
            <div className="cursor-pointer ml-[114px]" onClick={handleContactToggle}>
              {isContactDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex justify-between mr-4 mt-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Additional Resources</span>
              </label>
            </div>
            <div className="cursor-pointer ml-[85px]" onClick={handleAdditionalToggle}>
              {isAdditionalDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
          <div className="flex justify-between mr-4 mt-2 mb-2">
            <div className="cursor-pointer">
              <label className="inline-flex items-center ml-5">
                <span className="ml-3 text-custom-blue">Legal and Privacy Information</span>
              </label>
            </div>
            <div className="cursor-pointer ml-[30px]" onClick={handleLegalToggle}>
              {isLegalDropdownOpen ? (
                <FaCaretUp className="ml-10 text-custom-blue" />
              ) : (
                <FaCaretDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const profileDropdownContent = (
    <div className="absolute top-10 border border-custom-blue w-40 text-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 -mr-2 z-10">
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
            setProfileDropdown(false);
            handleSettingsClick();
          }}
        >
          Settings
        </button>
        <button
          className="text-custom-blue hover:text-blue-500"
          onClick={() => {
            setProfileDropdown(false);
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
          { to: "/connected_apps", label: "App Settings", icon: <MdAppSettingsAlt /> },
        ].map(({ to, label, icon }, index) => (
          <NavLink
            key={index}
            className="flex items-center py-2 hover:bg-gray-200 hover:text-custom-blue rounded-md"
            activeClassName="bg-gray-200 text-gray-800"
            to={to}
            onClick={() => setProfileDropdown(false)}
          >
            <span className="mr-2 text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <div className="bg-white fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto relative">
          <div className="xl:flex lg:flex 2xl:flex justify-between items-center border-b-2 border-gray-100 xl:p-2 2xl:p-2 lg:p-2 sm:px-5 md:px-5 sm:py-3 md:py-3">
            <div>
              <img src={logo} alt="Logo" className="w-24 hidden lg:block xl:block 2xl:block ml-3" />
            </div>
            <div className="flex-col hidden sm:flex md:flex lg:hidden xl:hidden 2xl:hidden">
              <div className="flex items-center justify-between w-full">
                <button className="sidebar-icon12" onClick={toggleSidebar}>
                  <FaBars />
                </button>
                <div className="flex-1 flex justify-center -mr-20">
                  <img src={logo} alt="Logo" className="w-20 md:w-24 hidden sm:block md:block" />
                </div>
                <div className="flex space-x-2">
                  <div className="icon-container border">
                    <NavLink to="/home" className="text-custom-blue">
                      <IoHome />
                    </NavLink>
                  </div>
                  <div className="icon-container border" ref={outlineRef}>
                    <div className="relative">
                      <p className="font-medium text-custom-blue" onClick={toggleOutlineDropdown}>
                        <IoMdInformationCircleOutline />
                      </p>
                      {outlineDropdown && outlineDropdownContent}
                    </div>
                  </div>
                  <div className=" hover:bg-gray-100 cursor-pointer" ref={notificationRef}>
                    <div className="relative">
                      <NotificationPanel />
                    </div>
                  </div>
                  <div className="icon-container border" ref={profileRef}>
                    <div className="relative">
                      <p className="font-medium" onClick={toggleProfileDropdown}>
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-12 h-7 rounded-full" />
                        ) : (
                          <CgProfile className="text-custom-blue" />
                        )}
                      </p>
                      {profileDropdown && profileDropdownContent}
                    </div>
                  </div>
                </div>
              </div>
              <div className="search search-small-width mx-auto mt-2">
                <input type="text" placeholder="Search" className="rounded-full border h-7" />
                <button type="submit" className="text-custom-blue"><IoMdSearch /></button>
              </div>
            </div>

            {/* <nav className="flex justify-center items-center lg:flex xl:flex 2xl:flex lg:space-x-10 xl:space-x-10 2xl:space-x-10">
              <p className="text-base font-medium hidden lg:block xl:block 2xl:block">
                <NavLink activeClassName="bg-gray-200 text-custom-blue" to="/candidate">
                  Candidates
                </NavLink>
              </p>
              <p className="text-base font-medium hidden lg:block xl:block 2xl:block">
                <NavLink activeClassName="bg-gray-200 text-custom-blue" to="/position">
                  Positions
                </NavLink>
              </p>
              <div className="relative hidden lg:block xl:block 2xl:block" ref={interviewRef}>
                <button className="font-medium flex items-center" onClick={toggleInterviewDropdown}>
                  Interviews&nbsp;
                  {interviewDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {interviewDropdown && (
                  <div className="absolute mt-2 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink
                        className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                        activeClassName="bg-gray-200 text-gray-800"
                        to="/interviewList"
                        onClick={() => setInterviewDropdown(false)}
                      >
                        Interviews
                      </NavLink>
                      <NavLink
                        className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                        activeClassName="bg-gray-200 text-gray-800"
                        to="/mockinterview"
                        onClick={() => setInterviewDropdown(false)}
                      >
                        Mock Interviews
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative hidden lg:block xl:block 2xl:block" ref={assessmentRef}>
                <button className="font-medium flex items-center" onClick={toggleAssessmentDropdown}>
                  Assessments&nbsp;
                  {assessmentDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {assessmentDropdown && (
                  <div className="absolute mt-2 z-10 w-44 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink
                        className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                        activeClassName="bg-gray-200 text-gray-800"
                        to="/assessments"
                        onClick={() => setAssessmentDropdown(false)}
                      >
                        Assessments
                      </NavLink>
                      <NavLink
                        className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                        activeClassName="bg-gray-200 text-gray-800"
                        to="/questionBank"
                        onClick={() => setAssessmentDropdown(false)}
                      >
                        Question Bank
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-base font-medium hidden lg:block xl:block 2xl:block">
                <NavLink activeClassName="bg-gray-200 text-custom-blue" to="/analytics">
                  Analytics
                </NavLink>
              </p>
            </nav> */}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex xl:flex 2xl:flex h-full items-center space-x-8">
              <NavLink
                to="/candidate"
                className={`h-full flex items-center relative px-1 ${isActive('/candidate') ? 'text-custom-blue font-bold' : 'text-gray-600 hover:text-custom-blue'}`}
              >
                Candidates
                {isActive('/candidate') && (
                  <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>
                )}
              </NavLink>

              <NavLink
                to="/position"
                className={`h-full flex items-center relative px-1 ${isActive('/position') ? 'text-custom-blue font-bold' : 'text-gray-600 hover:text-custom-blue'}`}
              >
                Positions
                {isActive('/position') && <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>}
              </NavLink>

              <div className="relative h-full flex items-center" ref={interviewRef}>
                <button
                  className={`flex items-center h-full relative px-1 ${isActive('/interviewList') || isActive('/mockinterview') ? 'text-custom-blue font-bold' : 'text-gray-600 hover:text-custom-blue'}`}
                  onClick={toggleInterviewDropdown}
                >
                  Interviews&nbsp;
                  {interviewDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  {(isActive('/interviewList') || isActive('/mockinterview')) && <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>}
                </button>
                {interviewDropdown && (
                  <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/interviewList') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/interviewList"
                        onClick={() => setInterviewDropdown(false)}
                      >
                        Interviews
                      </NavLink>
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/mockinterview') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/mockinterview"
                        onClick={() => setInterviewDropdown(false)}
                      >
                        Mock Interviews
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative h-full flex items-center" ref={assessmentRef}>
                <button
                  className={`flex items-center h-full relative px-1 ${isActive('/assessments') || isActive('/questionBank') ? 'text-custom-blue font-bold' : 'text-gray-600 hover:text-custom-blue'}`}
                  onClick={toggleAssessmentDropdown}
                >
                  Assessments&nbsp;
                  {assessmentDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  {(isActive('/assessments') || isActive('/questionBank')) && <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>}
                </button>
                {assessmentDropdown && (
                  <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/assessments') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/assessments"
                        onClick={() => setAssessmentDropdown(false)}
                      >
                        Assessments
                      </NavLink>
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/questionBank') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/questionBank"
                        onClick={() => setAssessmentDropdown(false)}
                      >
                        Question Bank
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative h-full flex items-center" ref={moreRef}>
                <button
                  className={`flex items-center h-full relative px-1 ${isActive('/analytics') || isActive('/interview-templates') ? 'text-custom-blue font-bold' : 'text-gray-600 hover:text-custom-blue'}`}
                  onClick={toggleMoreDropdown}
                >
                  More&nbsp;
                  {moreDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  {(isActive('/analytics') || isActive('/interview-templates')) && <div className="absolute bottom-[-17px] left-0 right-0 h-[3px] bg-custom-blue"></div>}
                </button>
                {moreDropdown && (
                  <div className="absolute top-full left-0 mt-0 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/analytics') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/analytics"
                        onClick={() => setMoreDropdown(false)}
                      >
                        Analytics
                      </NavLink>
                      <NavLink
                        className={`block px-3 py-2 hover:bg-gray-100 hover:text-custom-blue rounded-md ${isActive('/interview-templates') ? 'bg-gray-100 text-custom-blue' : ''}`}
                        to="/interview-templates"
                        onClick={() => setMoreDropdown(false)}
                      >
                        Interview Templates
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="flex space-x-2 sm:hidden md:hidden">
              <div className="search w-60">
                <input type="text" placeholder="Search" className="rounded-full border h-8" />
                <button type="submit" className="text-custom-blue"><IoMdSearch /></button>
              </div>
              <div className="text-xl border rounded-md p-2 text-custom-blue">
                <NavLink to="/home">
                  <IoHome />
                </NavLink>
              </div>
              <div className="text-xl border rounded-md p-2" ref={outlineRef}>
                <div className="relative">
                  <p className="font-medium text-custom-blue" onClick={toggleOutlineDropdown}>
                    <IoMdInformationCircleOutline />
                  </p>
                  {outlineDropdown && outlineDropdownContent}
                </div>
              </div>
              <div className="text-xl border rounded-md" ref={notificationRef}>
                <div className="relative">
                  <p>
                    <NotificationPanel />
                  </p>
                </div>
              </div>
              <div className="text-xl border rounded-md px-1 py-1 flex items-center" ref={profileRef}>
                <div className="relative">
                  <p className="font-medium" onClick={toggleProfileDropdown}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <CgProfile className="text-custom-blue" />
                    )}
                  </p>
                  {profileDropdown && profileDropdownContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 top-16 bg-gray-800 bg-opacity-75 z-40 lg:hidden xl:hidden 2xl:hidden">
          <div className="fixed left-0 w-64 bg-white h-full z-50 overflow-y-auto">
            <div className="p-4 space-y-1">
              <NavLink
                to="/candidate"
                className={`block px-4 py-3 rounded-md ${isActive('/candidate') ? 'bg-gray-100 text-custom-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={toggleSidebar}
              >
                Candidates
              </NavLink>

              <NavLink
                to="/position"
                className={`block px-4 py-3 rounded-md ${isActive('/position') ? 'bg-gray-100 text-custom-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={toggleSidebar}
              >
                Positions
              </NavLink>

              <div className="relative" ref={interviewRef}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive('/interviewList') || isActive('/mockinterview') ? 'bg-gray-100 text-custom-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={toggleInterviewDropdown}
                >
                  <span>Interviews</span>
                  {interviewDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {interviewDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/interviewList') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/interviewList"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Interviews
                    </NavLink>
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/mockinterview') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/mockinterview"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Mock Interviews
                    </NavLink>
                  </div>
                )}
              </div>

              <div className="relative" ref={assessmentRef}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive('/assessments') || isActive('/questionBank') ? 'bg-gray-100 text-custom-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={toggleAssessmentDropdown}
                >
                  <span>Assessments</span>
                  {assessmentDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {assessmentDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/assessments') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/assessments"
                      onClick={() => {
                        setAssessmentDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Assessments
                    </NavLink>
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/questionBank') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/questionBank"
                      onClick={() => {
                        setAssessmentDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Question Bank
                    </NavLink>
                  </div>
                )}
              </div>

              <div className="relative" ref={moreRef}>
                <button
                  className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center ${isActive('/analytics') || isActive('/interview-templates') ? 'bg-gray-100 text-custom-blue font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={toggleMoreDropdown}
                >
                  <span>More</span>
                  {moreDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
                {moreDropdown && (
                  <div className="mt-1 ml-4 space-y-1">
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/analytics') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/analytics"
                      onClick={() => {
                        setMoreDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Analytics
                    </NavLink>
                    <NavLink
                      className={`block px-4 py-2 rounded-md ${isActive('/interview-templates') ? 'bg-gray-200 text-custom-blue' : 'hover:bg-gray-100'}`}
                      to="/interview-templates"
                      onClick={() => {
                        setMoreDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Interview Templates
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-16"></div>
    </>
  );
};

export default Navbar;