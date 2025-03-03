import React, { useState, useRef, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreateTeams from "./CreateTeams";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import { parse, isValid } from 'date-fns';
import { format } from "date-fns";
import Cookies from "js-cookie";
import Availability from '../CommonCode-AllTabs/Availability';

import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
import { ReactComponent as IoIosArrowUp } from '../../../../icons/IoIosArrowUp.svg';
import { ReactComponent as IoIosArrowDown } from '../../../../icons/IoIosArrowDown.svg';
import { ReactComponent as HiArrowsUpDown } from '../../../../icons/HiArrowsUpDown.svg';
import { ReactComponent as AiTwotoneSchedule } from '../../../../icons/AiTwotoneSchedule.svg';
import { ReactComponent as PiNotificationBold } from '../../../../icons/PiNotificationBold.svg';
import { ReactComponent as FaArrowRight } from '../../../../icons/FaArrowRight.svg';

const TeamDetails = ({ candidate, onCloseprofile }) => {
  const [showMainContent, setShowMainContent] = useState(true);
  // const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [showDropdownuser, setShowDropdownuser] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [selectedCandidate, setSelectedCandidate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const candidateRef = useRef(null);
  const [errors, setErrors] = useState({});

  // const handleEditClick = (candidate) => {
  //   setShowNewCandidateContent({
  //     state: { candidate, availability: candidate.availability },
  //   });
  // };

  // const handleclose = () => {
  //   setShowMainContent(true);
  //   setShowNewCandidateContent(false);
  // };

  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleEditClick = (candidate) => {
    setSelectedCandidate(candidate); // Pass the candidate data
    setShowNewCandidateContent(true); // Show the edit form
  };

  const handleclose = () => {
    setShowNewCandidateContent(false);
    setSelectedCandidate(null); // Reset the selected candidate
  };

  const [activeTab, setActiveTab] = useState("teammember");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [preferredDurationError, setPreferredDurationError] = useState("");

  useEffect(() => {
    if (candidate.contactId?.preferredDuration) {
      setSelectedOption(candidate.contactId.preferredDuration);
    }
  }, [candidate.contactId?.preferredDuration]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setPreferredDurationError("");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const candidateData = [];

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleFilterIconClick = () => {
    setIsFilterActive(!isFilterActive);
  };

  const [openPopup, setOpenPopup] = useState("");
  const filteredNotifications = [];

  const handleNotificationFilterChange = (filter) => {
    console.log(`Filter changed to: ${filter}`);
  };

  const [isArrowUp2, setIsArrowUp2] = useState(false);
  const toggleArrow2 = () => {
    setIsArrowUp2(!isArrowUp2);
  };

  const positionData = {
    skills: [
      { skill: "JavaScript", experience: "3 years", expertise: "Advanced" },
    ],
  };

  const togglePopup = () => {
    setShowDropdownuser(!showDropdownuser);
  };

  const [userData, setUserData] = useState([]);
  const organizationId = Cookies.get("organizationId");

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/organization/${organizationId}`
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [organizationId]);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [candidate.ownerId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const matchedUser = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/${candidate.ownerId}`);
      setUserProfile(matchedUser.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
    setLoading(false);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const handleChangeOwner = async () => {
    try {
      console.log("Updating owner with ID:", selectedCandidate);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/team/${candidate._id}`,
        { ownerId: selectedCandidate }
      );
      console.log("Owner updated successfully:", response.data);
      fetchUserData();
      setShowDropdownuser(false);
    } catch (error) {
      console.error("Error updating owner:", error);
      console.error("Error response data:", error.response?.data);
    }
  };

  const handleCancel = () => {
    setSearchTerm("");
    setShowDropdownuser(false);
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };
  const handleAddNewCandidateClick = () => {
    console.log("Add new candidate clicked");
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate._id);
    console.log(candidate._id);
    setSearchTerm(candidate.Name);
    setShowDropdown(false);
  };

  const [times, setTimes] = useState({
    Sunday: [{ startTime: null, endTime: null }],
    Monday: [{ startTime: null, endTime: null }],
    Tuesday: [{ startTime: null, endTime: null }],
    Wednesday: [{ startTime: null, endTime: null }],
    Thursday: [{ startTime: null, endTime: null }],
    Friday: [{ startTime: null, endTime: null }],
    Saturday: [{ startTime: null, endTime: null }]
  });

  const [availabilityError, setAvailabilityError] = useState('');

  return (
    <>
      <div>
        {showMainContent && (
          <div className="container mx-auto">
            <div className="grid grid-cols-4 mx-5 mt-10">

              <div className="col-span-1">
                <div className="mx-3 border rounded-lg h-full mb-5">
                  <div className="flex justify-center text-center mt-8">
                    <div>
                      {candidate.imageUrl ? (
                        <img
                          src={candidate.imageUrl}
                          alt="Candidate"
                          className="w-32 h-32 rounded"
                        />
                      ) : candidate.Gender === "Male" ? (
                        <img
                          src={maleImage}
                          alt="Male Avatar"
                          className="w-32 h-32 rounded"
                        />
                      ) : candidate.Gender === "Female" ? (
                        <img
                          src={femaleImage}
                          alt="Female Avatar"
                          className="w-32 h-32 rounded"
                        />
                      ) : (
                        <img
                          src={genderlessImage}
                          alt="Other Avatar"
                          className="w-32 h-32 rounded"
                        />
                      )}
                      <div className="mt-4 mb-5">
                        <p className="text-lg font-semibold text-custom-blue">
                          {candidate.contactId?.firstname}
                        </p>
                        <p className="text-base font-medium text-black">
                          {candidate.contactId?.CompanyName}
                        </p>
                        <p className="text-base font-medium text-black">
                          Fullstack Developer
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative ml-8 mb-2">
                    <p className="text-xl font-medium text-black">Schedules</p>
                  </div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="md:mx-3 lg:mx-3 xl:mx-3 sm:mx-1 flex justify-between sm:justify-start items-center">
                  <button
                    className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                    onClick={onCloseprofile}
                  >
                    <IoArrowBack className="text-2xl" />
                  </button>
                  <p className="text-xl">
                    <span
                      className="text-custom-blue font-semibold cursor-pointer"
                      onClick={onCloseprofile}
                    >
                      Teams
                    </span>{" "}
                    / {candidate.contactId?.name}
                  </p>
                </div>

                <div>
                  <div className="mx-3 pt-3 mb-7 sm:hidden md:hidden">
                    <p className="text-md space-x-10">
                      <span
                        className={`cursor-pointer ${activeTab === "teammember"
                          ? "pb-3 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("teammember")}
                      >
                        Team Member
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "availability"
                          ? "pb-3 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("availability")}
                      >
                        Availability
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "schedules"
                          ? "pb-3 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("schedules")}
                      >
                        Schedules
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "notifications"
                          ? "pb-3 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("notifications")}
                      >
                        Notifications
                      </span>
                    </p>
                  </div>
                  <div>
                    <select
                      className="w-52 p-2 text-custom-blue border border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
                      onChange={(e) => handleTabClick(e.target.value)}
                      value={activeTab}
                    >
                      <option value="teammember">Team Member</option>
                      <option value="schedulehistory">Schedule History</option>
                    </select>
                  </div>
                </div>

                {activeTab === "teammember" && (
                  <>
                    <div className="flex float-end -mt-7">
                      <button
                        className="bg-custom-blue text-white px-3 py-1 rounded-md mr-3 -mt-7"
                        onClick={() => handleEditClick(candidate)}
                      >
                        Edit
                      </button>
                    </div>

                    <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg ">
                      <div className="p-3">
                        <p className="font-bold text-lg mb-5">
                          Personal Details:
                        </p>
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">First Name</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.firstname || "N/A"}
                              </span>
                            </p>
                          </div>

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Owner</div>
                          </div>
                          <div className="sm:w-1/2 w-1/4 flex items-center relative">
                            <p>
                              <span className="font-normal text-gray-500 w-1/3 sm:w-1/2">
                                {userProfile ? userProfile.Firstname : "Loading..."}
                              </span>
                            </p>
                            <button
                              className="ml-14"
                              type="button"
                              onClick={togglePopup}
                            >
                              <HiArrowsUpDown className="text-custom-blue" />
                            </button>
                            {showDropdownuser && (
                              <>
                                <div className="border border-gray-300 w-72 rounded-md absolute top-10 shadow bg-white right-1 z-50">
                                  <p className="p-2 font-medium border-b">Owner</p>
                                  < div className="flex items-center relative p-2" ref={candidateRef}>
                                    <label
                                      htmlFor="Candidate"
                                      className="block font-medium text-gray-900 dark:text-black w-16"
                                    >
                                      Users
                                    </label>
                                    <div className="relative flex-grow">
                                      <input
                                        type="text"
                                        className={`border-b focus:outline-none w-full ${errors.Candidate ? "border-red-500" : "border-gray-300"}`}
                                        value={searchTerm}
                                        onChange={handleInputChange}
                                        onClick={handleInputClick}
                                        autoComplete="off"
                                      />

                                      <MdArrowDropDown
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="absolute top-0 text-gray-500 text-lg mt-1 mr-2 cursor-pointer right-0"
                                      />
                                      {showDropdown && (
                                        <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow">
                                          <p className="p-1 font-medium text-sm border-b"> Recent Users</p>
                                          <ul>
                                            {userData
                                              .filter(candidate => candidate.Name && candidate.Name.toLowerCase().includes(searchTerm.toLowerCase()))
                                              .slice(0, 4)
                                              .map((candidate) => (
                                                <li
                                                  key={userData._id}
                                                  className="bg-white border-b cursor-pointer p-2 hover:bg-gray-100"
                                                  onClick={() => {
                                                    handleCandidateSelect(candidate);
                                                  }}
                                                >
                                                  {candidate.Name}
                                                </li>
                                              ))}
                                            <li
                                              className="flex cursor-pointer shadow-md border-b p-1 rounded text-sm"
                                              onClick={handleAddNewCandidateClick}
                                            >
                                              <IoIosAddCircle className="text-xl" />
                                              <span>Add New User</span>
                                            </li>
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="border-t mt-10">
                                    <div className="flex p-1 gap-2 float-end">
                                      <button className="p-1 border text-xs text-black border-custom-blue rounded-md" onClick={handleCancel}>Cancel</button>
                                      <button className="p-1 border text-xs text-white bg-custom-blue rounded-md" onClick={handleChangeOwner}>Change</button>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <p className="font-medium">LastName</p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p className="font-normal text-gray-500">
                              {candidate.contactId?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        <p className="font-bold text-lg mb-5">
                          Contact Details:
                        </p>

                        <div className="flex mb-5">
                          <div className="w-1/3 sm:w-1/2">
                            <div className="font-medium">Email</div>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.email}
                              </span>
                            </p>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <div className="font-medium">Phone</div>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.phone}
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="font-bold text-lg mb-5">Job Details:</p>
                        {/* higher qualification */}

                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Company</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.CompanyName}
                              </span>
                            </p>
                          </div>

                          {/* university/college */}

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Technology</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.technology}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Role</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.currentRole}
                              </span>
                            </p>
                          </div>

                          {/* university/college */}

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Location</div>
                          </div>
                          <div className="w-1/4  sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.contactId?.location}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg mb-5">
                          System Details:
                        </p>
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Created By</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.created_at}
                              </span>
                            </p>
                          </div>

                          {/* university/college */}

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Modified By</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.updated_at}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="mt-4 mx-3 sm:mx-5">
                        <div className="font-bold text-xl mb-5">
                          Skills Details:
                        </div>
                        {/* Skills */}
                        <div className="mb-5 text-sm rounded-lg border border-gray-300">
                          <div className="sm:mx-0">
                            {/* Header */}
                            <div className="grid grid-cols-3 p-4">
                              <div className="block font-medium leading-6 text-gray-900">Skills</div>
                              <div className="block font-medium leading-6 text-gray-900">Experience</div>
                              <div className="block font-medium leading-6 text-gray-900">Expertise</div>
                            </div>
                            {/* Table */}
                            <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                              <table className="min-w-full divide-y divide-gray-200">
                                <tbody>
                                  {positionData.skills.map((skillEntry, index) => (
                                    <tr key={index} className="grid grid-cols-3 gap-4">
                                      <td className="py-4 font-medium text-gray-500 uppercase tracking-wider">
                                        {skillEntry.skill}
                                      </td>
                                      <td className="py-4 font-medium text-gray-500 uppercase tracking-wider">
                                        {skillEntry.experience}
                                      </td>
                                      <td className="py-4 font-medium text-gray-500 uppercase tracking-wider">
                                        {skillEntry.expertise}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "availability" && (
                  <>
                    <div className="rounded-lg border border-gray-300 mx-3">
                      <div className="font-bold text-xl mb-5 my-3 mx-3">
                        Time Details:
                      </div>
                      <div className="flex my-5 mx-3">
                        <div className="w-1/4 sm:w-1/2">
                          <div className="font-medium">Time zone </div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                          <p className="font-normal text-gray-500">
                            {candidate.contactId?.timeZone}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="border border-gray-300 text-gray-900 text-sm p-4 rounded-lg mb-5 mr-4 ml-3">
                          <p className="font-medium">Preferred Interview Duration</p>
                          <ul className="flex mt-3 text-xs font-medium">
                            {["30", "60", "90", "120"].map((duration) => (
                              <li
                                key={duration}
                                className={`option hover:bg-gray-500 cursor-pointer inline-block py-1 px-4 border rounded-lg mr-10 ${selectedOption === duration
                                  ? "bg-gray-700 text-white"
                                  : "bg-gray-300"
                                  }`}
                                onClick={() => handleOptionClick(duration)}
                              >
                                {duration === "30"
                                  ? "30 mins"
                                  : duration === "60"
                                    ? "1 Hour"
                                    : duration === "90"
                                      ? "1:30 mins"
                                      : "2 Hours"}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {preferredDurationError && (
                          <p className="text-red-500 text-sm">
                            {preferredDurationError}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Availability */}
                    <div className="rounded-lg border border-gray-300 mx-3 my-5">
                      <div className="ml-4 mb-10 md:mt-10 ">
                        <p className="mt-2 text-lg font-medium">Availability</p>
                        <Availability
                          times={times}
                          onTimesChange={setTimes}
                          availabilityError={availabilityError}
                          onAvailabilityErrorChange={setAvailabilityError}
                          from={'teamProfileDetails'}
                          availabilityData={candidate.contactId?.availability}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* schedules */}
                {activeTab === "schedules" && (
                  <div>
                    <div className="mt-7">
                      <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl mx-3">
                        <p className="pr-4 ml-2 w-1/4">Developer</p>
                        <p className="rounded px-2 ml-4 text-center">
                          IBM
                        </p>
                        <div
                          className="flex items-center text-3xl ml-3 mr-3"
                          onClick={toggleArrow2}
                        >
                          {isArrowUp2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </div>
                      </div>

                      <div
                        className="p-4 bg-gray-100 mx-3"
                        style={{ display: isArrowUp2 ? "block" : "none" }}
                      >
                        <div className="mb-5">
                          <div className="mt-4">
                            <div className="font-medium text-xl mb-5">
                              Schedules Details:
                            </div>
                            {/* Skills */}
                            <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                              <div className="sm:mx-0">
                                <div className="grid grid-cols-6 p-4">
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Round Title
                                  </div>
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Interview Mode
                                  </div>
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Date&Time
                                  </div>
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Duration
                                  </div>
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Interviewer
                                  </div>
                                  <div className="block font-medium leading-6 text-gray-900">
                                    Status
                                  </div>
                                </div>
                                <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <tbody>
                                      {positionData.skills.map(
                                        (skillEntry, index) => (
                                          <tr
                                            key={index}
                                            className="grid grid-cols-6 gap-4"
                                          >
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                              {skillEntry.skill}
                                            </td>
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                              {skillEntry.experience}
                                            </td>
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                              {skillEntry.expertise}
                                            </td>
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider"> </td>
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider"> </td>
                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider"> </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "notifications" && (
                  <div>
                    <div className="mt-7">
                      <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl mx-3">
                        <p className="pr-4 ml-2 w-1/4">Developer</p>
                        <p className="rounded px-2 ml-4 text-center">IBM</p>
                        <div
                          className="flex items-center text-3xl ml-3 mr-3"
                          onClick={toggleArrow2}
                        >
                          {isArrowUp2 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </div>
                      </div>

                      <div
                        className="p-4 bg-gray-100 mx-3"
                        style={{ display: isArrowUp2 ? "block" : "none" }}
                      >
                        <div className="mb-5">
                          <div className="flex justify-between">
                            <div className=" font-medium text-xl">
                              Notification
                            </div>
                            <div className="flex items-center">
                              <div className="relative">
                                <div className="searchintabs border rounded-md relative py-[2px]">
                                  <div className="absolute inset-y-0 left-0 flex items-center">
                                    <button type="submit" className="p-2">
                                      <IoMdSearch className="text-custom-blue" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    className="rounded-full h-8"
                                  />
                                </div>
                              </div>

                              <div>
                                <span className="p-2 text-xl sm:text-sm md:text-sm">
                                  {currentPage + 1}/{totalPages}
                                </span>
                              </div>
                              <div className="flex">
                                <Tooltip
                                  title="Previous"
                                  enterDelay={300}
                                  leaveDelay={100}
                                  arrow
                                >
                                  <span
                                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0
                                      ? " cursor-not-allowed"
                                      : ""
                                      }`}
                                    onClick={prevPage}
                                  >
                                    <IoIosArrowBack className="text-custom-blue" />
                                  </span>
                                </Tooltip>

                                <Tooltip
                                  title="Next"
                                  enterDelay={300}
                                  leaveDelay={100}
                                  arrow
                                >
                                  <span
                                    className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1
                                      ? " cursor-not-allowed"
                                      : ""
                                      }`}
                                    onClick={nextPage}
                                  >
                                    <IoIosArrowForward className="text-custom-blue" />
                                  </span>
                                </Tooltip>
                              </div>
                              <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                                <Tooltip
                                  title="Filter"
                                  enterDelay={300}
                                  leaveDelay={100}
                                  arrow
                                >
                                  <span
                                    onClick={handleFilterIconClick}
                                    style={{
                                      opacity:
                                        candidateData.length === 0 ? 0.2 : 1,
                                      pointerEvents:
                                        candidateData.length === 0
                                          ? "none"
                                          : "auto",
                                    }}
                                  >
                                    {isFilterActive ? (
                                      <LuFilterX className="text-custom-blue" />
                                    ) : (
                                      <FiFilter className="text-custom-blue" />
                                    )}
                                  </span>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Notification Popup */}
                    {openPopup === "notification" && (
                      <div className="absolute right-80 mt-48 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() =>
                            handleNotificationFilterChange("thisWeek")
                          }
                        >
                          This Week
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() =>
                            handleNotificationFilterChange("nextWeek")
                          }
                        >
                          Next Week
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() =>
                            handleNotificationFilterChange("thisMonth")
                          }
                        >
                          This Month
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() =>
                            handleNotificationFilterChange("all")
                          }
                        >
                          All
                        </button>
                      </div>
                    )}
                    {filteredNotifications.length === 0 ? (
                      <p className="text-center p-3">No data found.</p>
                    ) : (
                      filteredNotifications
                        .slice(0, 3)
                        .map((notification, i) => (
                          <div
                            key={i}
                            className="flex text-sm border-b w-full justify-between"
                          >
                            <div className="flex item-center mt-2">
                              <div className="w-14 ml-3 mt-1">
                                {notification.Status === "Scheduled" ? (
                                  <AiTwotoneSchedule className="text-xl" />
                                ) : (
                                  <PiNotificationBold className="text-xl" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold">
                                  {notification.Status === "Scheduled"
                                    ? "Interview Scheduled"
                                    : "New Interview Requests"}
                                </p>
                                <p>{notification.Body}</p>
                                <p className="mb-2">
                                  {notification.CreatedDate}
                                </p>
                              </div>
                            </div>
                            <div className="text-xl mt-12 mr-2">
                              <FaArrowRight />
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                )}
              </div>
            </div>
          </div>
        )}

        {showNewCandidateContent && (
          <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
            <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-500 transform">
              <CreateTeams onClose={handleclose} candidate={selectedCandidate} fromEditTeam={true} />
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default TeamDetails;