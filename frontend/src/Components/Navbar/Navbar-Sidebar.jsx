import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Navbar-Sidebar.scss";
import Cookies from 'js-cookie';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
import NotificationPanel from '../../Pages/Push-Notification/NotificationPanel.jsx';
import {
  ChevronUp, ChevronDown, Calendar, Wallet, Bell, ArrowRight, User,
  CreditCard, Home, Info, Search, Settings, List, ArrowUp, ArrowDown
} from 'lucide-react';

const Navbar = () => {
  const userId = Cookies.get("userId");
  const userName = Cookies.get("userName");
  const { logout } = useAuth0();
  const [assessmentDropdown, setAssessmentDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [interviewDropdown, setInterviewDropdown] = useState(false);
  const [isDetailDropdownOpen, setIsDetailDropdownOpen] = useState(false);
  const [isGettingDropdownOpen, setIsGettingDropdownOpen] = useState(false);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);
  const [isFunctionDropdownOpen, setIsFunctionDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isAdditionalDropdownOpen, setIsAdditionalDropdownOpen] = useState(false);
  const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const assessmentRef = useRef(null);
  const moreRef = useRef(null);
  const interviewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/contacts/${userId}`);
        const contact = response.data;
        if (contact.ImageData && contact.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${contact.ImageData.path.replace(/\\/g, '/')}`;
          console.log('Image URL:', imageUrl);
          setProfileImage(imageUrl);
        } else {
          console.warn('No image data found for userId:', userId);
        }

      } catch (error) {
        // console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, []);

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


  const notifications = () => {
    navigate("/notifications");
  };

  const handleSettingsClick = () => {
    // if (organization) {
    //   navigate('/user_details');
    // } else {
    navigate('/account-settings');
    // }
  };
  const [outlineDropdown, setOutlineDropdown] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
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
      setNotificationDropdown(false);
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
    setNotificationDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdown(prev => !prev);
    setOutlineDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdown(prev => !prev);
    setOutlineDropdown(false);
    setNotificationDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleInterviewDropdown = () => {
    setInterviewDropdown(prev => !prev);
    setOutlineDropdown(false);
    setNotificationDropdown(false);
    setProfileDropdown(false);
    setAssessmentDropdown(false);
    setMoreDropdown(false);
  };

  const toggleAssessmentDropdown = () => {
    setAssessmentDropdown(prev => !prev);
    setOutlineDropdown(false);
    setNotificationDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setMoreDropdown(false);
  };

  const toggleMoreDropdown = () => {
    setMoreDropdown(prev => !prev);
    setOutlineDropdown(false);
    setNotificationDropdown(false);
    setProfileDropdown(false);
    setInterviewDropdown(false);
    setAssessmentDropdown(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
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
                <span className="ml-3 text-custom-blue"> Getting Started</span>
              </label>
            </div>
            <div className="cursor-pointer ml-30" onClick={handleGettingToggle}>
              {isGettingDropdownOpen ? (
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
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
                <ChevronUp className="ml-10 text-custom-blue" />
              ) : (
                <ChevronDown className="ml-10 text-custom-blue" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const notificationDropdownContent = (
    <div className="absolute top-12 w-80 text-sm rounded-md bg-white border border-custom-blue right-0 z-50 -mr-10">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-start font-medium text-custom-blue">Notifications</h2>
        <button className="text-custom-blue hover:text-blue-500" onClick={toggleNotificationDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.293 4.293a1 1 0 1 1 1.414 1.414L11.414 10l5.293 5.293a1 1 0 1 1-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 1 1-1.414-1.414L8.586 10 3.293 4.707a1 1 0 1 1 1.414-1.414L10 8.586l5.293-5.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex text-sm border-b w-full justify-between bg-gray-100">
            <div className="flex item-center mt-2">
              <div className={`w-10 ml-3 mt-1 ${i === 2 ? "w-14 mr-5" : ""}`}>
                {i === 2 ? <Calendar className="text-xl text-custom-blue" /> : <Bell className="text-xl text-custom-blue" />}
              </div>
              <div>
                <p className="font-bold text-custom-blue">{i === 2 ? "Interview Scheduled" : "New Interview Requests"}</p>
                <p className="text-custom-blue">Skill: Apex, AURA, LWC</p>
                <p className="mb-2 text-custom-blue">15 May 2024, 05:40 PM</p>
              </div>
            </div>
            <div className={`text-xl mt-12 mr-2 ${i === 2 ? "mt-28" : ""}`}>
              <ArrowRight className="text-custom-blue" />
            </div>
          </div>
        ))}
        <div>
          <p onClick={notifications}
            style={{ cursor: "pointer" }} className="float-right text-sm mr-2 p-2 text-custom-blue">View More</p>
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
            <User className="text-custom-blue text-xl" />
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
          { to: "/billing", label: "Billing", icon: <CreditCard /> },
          {
            to: "/wallet-transcations", label: "My Wallet", icon: <Wallet />
          },
          { to: "/connected_apps", label: "App Settings", icon: <Settings /> },
        ].map(({ to, label, icon }, index) => (
          <NavLink
            key={index}
            className="flex items-center py-2 hover:bg-gray-200 hover:text-custom-blue rounded-md"
            activeclassname="bg-gray-200 text-gray-800"
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
            {/* Navbar icons for small and medium screens */}
            <div className="flex-col hidden sm:flex md:flex lg:hidden xl:hidden 2xl:hidden">
              <div className="flex items-center justify-between w-full">
                <button className="sidebar-icon12" onClick={toggleSidebar}>
                  <List />
                </button>
                <div className="flex-1 flex justify-center -mr-20">
                  <img src={logo} alt="Logo" className="w-20 md:w-24 hidden sm:block md:block" />
                </div>
                <div className="flex space-x-2">
                  <div className="icon-container border">
                    <NavLink to="/home" className="text-custom-blue">
                      <Home />
                    </NavLink>
                  </div>
                  <div className="icon-container border" ref={outlineRef}>
                    <div className="relative">
                      <p className="font-medium text-custom-blue " onClick={toggleOutlineDropdown}>
                        <Info />
                      </p>
                      {outlineDropdown && outlineDropdownContent}
                    </div>
                  </div>
                  <div className="icon-container border" ref={notificationRef}>
                    <div className="relative">
                      <p className="font-medium text-custom-blue" onClick={toggleNotificationDropdown}>
                        <Bell />
                      </p>
                      {notificationDropdown && notificationDropdownContent}
                    </div>
                  </div>
                  <div className="icon-container border" ref={profileRef}>
                    <div className="relative">
                      <p className="font-medium" onClick={toggleProfileDropdown}>
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-12 h-7 rounded-full" />
                        ) : (
                          <User className="text-custom-blue" />
                        )}
                      </p>
                      {profileDropdown && profileDropdownContent}
                    </div>
                  </div>
                </div>
              </div>
              <div className="search search-small-width mx-auto mt-2">
                <input type="text" placeholder="Search" className="rounded-full border h-7" />
                <button type="submit" className="text-custom-blue"><Search /></button>
              </div>
            </div>

            <nav className="flex justify-center items-center lg:flex xl:flex 2xl:flex lg:space-x-10 xl:space-x-10 2xl:space-x-10">
              <div className="relative hidden lg:block xl:block 2xl:block" ref={interviewRef} >
                <button className="font-medium flex items-center" onClick={toggleInterviewDropdown} >
                  Interviews &nbsp; {interviewDropdown ? <ArrowUp /> : <ArrowDown />}
                </button>
                {interviewDropdown && (
                  <div className="absolute mt-2 z-50 w-48 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/interviewList" onClick={() => { setInterviewDropdown(false); }} >
                        Interviews
                      </NavLink>
                      {/* <NavLink className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/outsource-interviewers" onClick={() => { setInterviewDropdown(false); }} >
                        Outsource Interviewers - admin
                      </NavLink>
                      <NavLink className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/outsourceinterviewrequest" onClick={() => { setInterviewDropdown(false); }} >
                        Interview Request
                      </NavLink> */}
                      <NavLink className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/mockinterview" onClick={() => { setInterviewDropdown(false); }} >
                        Mock Interviews
                      </NavLink>
                      {/* <NavLink className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/videocallbutton" onClick={() => { setInterviewDropdown(false); }} >
                        Start Interview
                      </NavLink> */}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative hidden lg:block xl:block 2xl:block" ref={assessmentRef}>
                <button className="font-medium flex items-center" onClick={toggleAssessmentDropdown}>
                  Assessments&nbsp;
                  {assessmentDropdown ? <ArrowUp /> : <ArrowDown />}
                </button>
                {assessmentDropdown && (
                  <div className="absolute mt-2 z-10 w-44 rounded-md shadow-lg bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" onClick={() => { setAssessmentDropdown(false); }} activeclassname="bg-gray-200 text-gray-800" to="/assessments" >
                        Assessments
                      </NavLink>
                      <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/questionBank" onClick={() => { setAssessmentDropdown(false); }} >
                        Question Bank
                      </NavLink>
                      {/* <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/assessmenttest" onClick={() => { setAssessmentDropdown(false); }} >
                        Assessment Test
                      </NavLink> */}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-base font-medium hidden lg:block xl:block 2xl:block">
                <NavLink activeclassname="bg-gray-200 text-custom-blue" to="/analytics" >
                  Analytics
                </NavLink>
              </p>
              <div className="relative hidden lg:block xl:block 2xl:block" ref={moreRef}>
                <button className="font-medium flex items-center" onClick={toggleMoreDropdown}>
                  More&nbsp;
                  {moreDropdown ? <ArrowUp /> : <ArrowDown />}
                </button>
                {moreDropdown && (
                  <div className="absolute p-2 z-10 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 border">
                    <div className="space-y-1">
                      <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/candidate" onClick={() => { setMoreDropdown(false); }} >
                        Candidates
                      </NavLink>
                      <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/position" onClick={() => { setMoreDropdown(false); }} >
                        Positions
                      </NavLink>
                      <NavLink className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md" activeclassname="bg-gray-200 text-gray-800" to="/team" onClick={() => { setMoreDropdown(false); }} >
                        Teams
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            </nav>
            {/* Navbar icons for big screens */}
            <div className="flex space-x-2  sm:hidden md:hidden">
              <div className="search w-60">
                <input type="text" placeholder="Search" className="rounded-full border h-8" />
                <button type="submit" className="text-custom-blue"><Search /></button>
              </div>
              <div className="text-xl border rounded-md p-2 text-custom-blue">
                <NavLink to="/home">
                  <Home />
                </NavLink>
              </div>
              <div className="text-xl border rounded-md p-2" ref={outlineRef} >
                <div className="relative">
                  <p className="font-medium text-custom-blue" onClick={toggleOutlineDropdown}>
                    <Info />
                  </p>
                  {outlineDropdown && outlineDropdownContent}
                </div>
              </div>
              <div className="text-xl border rounded-md" ref={notificationRef}>
                <div className="relative">
                  <p className="">
                    <NotificationPanel />
                  </p>
                  {/* {notificationDropdown && notificationDropdownContent} */}
                </div>
              </div>
              <div className="text-xl border rounded-md px-1 py-1 flex items-center" ref={profileRef}>
                <div className="relative">
                  <p className="font-medium" onClick={toggleProfileDropdown}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User className="text-custom-blue" />
                    )}
                  </p>
                  {profileDropdown && profileDropdownContent}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* Sidebar for tab and mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 top-[70px] bg-gray-800 bg-opacity-75 z-40 block lg:hidden xl:hidden 2xl:hidden">
          <div className="fixed mt-4 left-0 w-64 bg-white h-full z-50">
            <div className="relative p-4" ref={interviewRef}>
              <button
                className="font-medium flex items-center mb-2"
                onClick={toggleInterviewDropdown}>
                Interviews &nbsp; {interviewDropdown ? <ArrowUp /> : <ArrowDown />}
              </button>
              {interviewDropdown && (
                <div className="mt-2 w-full rounded-md bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                  <div className="space-y-1">
                    <NavLink
                      className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/interviewList"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Interviews
                    </NavLink>
                    {/* <NavLink
                      className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/outsourceinterview"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Outsource Interviews
                    </NavLink> */}
                    <NavLink
                      className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/mockinterview"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Mock Interviews
                    </NavLink>
                    {/* <NavLink
                      className="block px-3 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/videocallbutton"
                      onClick={() => {
                        setInterviewDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Start Interview
                    </NavLink> */}
                  </div>
                </div>
              )}
            </div>

            <div className="relative p-4" ref={assessmentRef}>
              <button
                className="font-medium flex items-center mb-2"
                onClick={toggleAssessmentDropdown}>
                Assessments&nbsp;
                {assessmentDropdown ? <ArrowUp /> : <ArrowDown />}
              </button>
              {assessmentDropdown && (
                <div className="mt-2 w-full rounded-md bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                  <div className="space-y-1">
                    <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      onClick={() => {
                        setAssessmentDropdown(false);
                        toggleSidebar();
                      }}
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/assessment"
                    >
                      Assessments
                    </NavLink>
                    <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/questionBank"
                      onClick={() => {
                        setAssessmentDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Question Bank
                    </NavLink>
                    {/* <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/assessmenttest"
                      onClick={() => {
                        setAssessmentDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Assessment Test
                    </NavLink> */}
                  </div>
                </div>
              )}
            </div>

            <p className="text-base font-medium p-4">
              <NavLink
                activeclassname="bg-gray-200"
                to="/analytics"
                onClick={() => {
                  toggleSidebar();
                }}
              >
                Analytics
              </NavLink>
            </p>

            <div className="relative p-4" ref={moreRef}>
              <button
                className="font-medium flex items-center mb-2"
                onClick={toggleMoreDropdown}>
                More&nbsp;
                {moreDropdown ? <ArrowUp /> : <ArrowDown />}
              </button>
              {moreDropdown && (
                <div className="mt-2 w-full rounded-md bg-white ring-1 p-2 ring-black ring-opacity-5 border">
                  <div className="space-y-1">
                    <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/candidate"
                      onClick={() => {
                        setMoreDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Candidates
                    </NavLink>
                    <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/position"
                      onClick={() => {
                        setMoreDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Positions
                    </NavLink>
                    <NavLink
                      className="block px-4 py-1 hover:bg-gray-200 hover:text-custom-blue rounded-md"
                      activeclassname="bg-gray-200 text-gray-800"
                      to="/team"
                      onClick={() => {
                        setMoreDropdown(false);
                        toggleSidebar();
                      }}
                    >
                      Teams
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;