import React, { useState, useRef, useEffect } from 'react';
import maleImage from "../../../Dashboard-Part/Images/man.png";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import axios from "axios";
import { format } from "date-fns";
import EditCandidateForm from "./EditCandidate";
import { fetchMultipleData } from "../../../../utils/dataUtils.js";
import Cookies from "js-cookie";
import { parse, isValid } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';

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

const CandidateDetails = ({
  candidate,
  onCloseprofile,
}) => {
  useEffect(() => {
    document.title = "Candidate Profile Details";
  }, []);
  const [activeTab, setActiveTab] = useState("candidate");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [isArrowUp, setIsArrowUp] = useState(false);

  const toggleArrow = () => {
    setIsArrowUp(!isArrowUp);
  };


  const currentRows = [
    {
      id: 1,
      name: "John Doe",
      duration: "45minutes",
      scheduletype: "Face-to-Face",
      roundname: "Technical Interview",
      datetime: "13-3-2024, 11:30",
      Status: "Selected",
    },
    {
      id: 2,
      name: "Jane Smith",
      duration: "60 minutes",
      scheduletype: "Remote",
      roundname: "Data Skills Assessment",
      datetime: "15-3-2024, 09:00",
      Status: "Interviewed",
    },
    {
      id: 3,
      name: "Alice Johnson",
      duration: "30 minutes",
      scheduletype: "Online",
      roundname: "Coding Challenge",
      datetime: "20-3-2024, 14:00",
      Status: "Cancelled",
    },
    {
      id: 4,
      name: "Robert Lee",
      duration: "15 minutes",
      scheduletype: "In-Person",
      roundname: "Management Interview",
      datetime: "18-3-2024, 16:00",
      Status: "Rejected",
    },
  ];
  const [isArrowUp2, setIsArrowUp2] = useState(true);
  const trFontstyle = {
    fontSize: "14px",
  };
  const toggleArrow2 = () => {
    setIsArrowUp2(!isArrowUp2);
  };

  const [isArrowUp3, setIsArrowUp3] = useState(
    Array(currentRows.length).fill(false)
  );
  const toggleArrow3 = (index) => {
    const updatedArrows = [...isArrowUp3];
    updatedArrows[index] = !updatedArrows[index];
    setIsArrowUp3(updatedArrows);
  };

  const [isArrowUp4, setIsArrowUp4] = useState(
    Array(currentRows.length).fill(false)
  );
  const toggleArrow4 = (index) => {
    const updatedArrows = [...isArrowUp4];
    updatedArrows[index] = !updatedArrows[index];
    setIsArrowUp4(updatedArrows);
  };

  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

  const handleEditClick = (candidate) => {
    setShowMainContent(true);
    setShowNewCandidateContent({ state: { candidate } });
  };
  const handleclose = () => {
    setShowNewCandidateContent(false);
  };

  const [positionData, setPositionData] = useState(null);
  const selectedPositionId = candidate.PositionId;

  useEffect(() => {
    if (selectedPositionId) {
      const fetchPositionData = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/position/${selectedPositionId}`
          );
          setPositionData(response.data);
        } catch (error) {
          console.error("Error fetching detailed position data:", error);
        }
      };

      fetchPositionData();
    }
  }, [selectedPositionId]);
  const formattedDateOfBirth = candidate.Date_Of_Birth
    ? format(new Date(candidate.Date_Of_Birth), "dd-MM-yyyy")
    : "";
  const [openPopup, setOpenPopup] = useState(null);

  const handleFilterChange = (filter) => {
    // Implement filter logic here
    console.log(`Filter changed to: ${filter}`);
  };

  // const [candidateData, setCandidateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedCandidateImage, setSelectedCandidateImage] = useState("");
  const [setSelectedPositionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false); // Added state for unsaved changes

  const userName = Cookies.get("userName");
  const orgId = Cookies.get("organizationId");

  // const fetchData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const [filteredCandidates] = await fetchMultipleData([
  //       {
  //         endpoint: "candidate",
  //         sharingPermissions: sharingPermissions.candidate,
  //       },
  //     ]);
  //     setCandidateData(filteredCandidates);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [sharingPermissions]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate._id);
    console.log(candidate._id);
    setSearchTerm(candidate.Name);
    setShowDropdown(false);
  };

  const handleAddNewCandidateClick = () => {
    // Implement logic to add a new candidate
    console.log("Add new candidate clicked");
  };

  const [showDropdownuser, setShowDropdownuser] = useState(false);
  const candidateRef = useRef(null);

  const togglePopup = () => {
    setShowDropdownuser(!showDropdownuser);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const handleInputClick = () => {
    setShowDropdown(true);
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
  }, [candidate.OwnerId]);
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const matchedUser = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/${candidate.OwnerId}`);
      setUserProfile(matchedUser.data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    }
    setLoading(false);
  };

  const handleChangeOwner = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/candidate/${candidate._id}`,
        { OwnerId: selectedCandidate }
      );
      console.log("Owner updated successfully:", response.data);
      fetchUserData();
      setShowDropdownuser(false);

    } catch (error) {
      console.error("Error updating owner:", error);
    }
  };

  const handleChangePositionOwner = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/position/${positionData._id}`,
        { OwnerId: selectedCandidate }
      );
      console.log("Position owner updated successfully:", response.data);
      setShowDropdownuser(false);
    } catch (error) {
      console.error("Error updating position owner:", error);
    }
  };

  const handleCancel = () => {
    setSearchTerm("");
    setShowDropdownuser(false);
  };

  const [interviews, setInterviews] = useState([]);
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviews/candidate/${candidate._id}`);
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
    };

    if (candidate._id) {
      fetchInterviews();
    }
  }, [candidate._id]);

  const [interviewsRounds, setInterviewsRounds] = useState([]);
  useEffect(() => {
    const fetchRounds = async () => {
      try {
        // Assuming updatedCandidate.rounds contains the array of round IDs
        const roundIds = interviews.rounds;
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/fetch-rounds-from-view`,
          { roundIds }
        );
        setInterviewsRounds({ ...interviews, rounds: response.data });
      } catch (error) {
        console.error("Error fetching rounds details:", error);
      }
    };

    if (interviews.rounds && interviews.rounds.length > 0) {
      fetchRounds();
    }
  }, [interviews]);
  function displayDateTime(dateTimeStr) {
    if (!dateTimeStr) {
      return "Invalid Date";
    }

    // Split the date and time
    const [date, timeRange] = dateTimeStr.split(' ');
    const [startTime] = timeRange.split(' - ');

    // Parse the date
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
    const formattedDate = isValid(parsedDate) ? format(parsedDate, 'dd MMM, yyyy') : 'Invalid Date';

    return `${formattedDate} · ${startTime}`;
  }

  let statusTextColor;
  switch (interviews.Status) {
    case 'Reschedule':
      statusTextColor = 'text-violet-500';
      break;
    case 'Scheduled':
      statusTextColor = 'text-yellow-300';
      break;
    case 'ScheduleCancel':
      statusTextColor = 'text-red-500';
      break;
    default:
      statusTextColor = 'text-black';
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterIconClick = () => {
    setIsFilterActive(!isFilterActive);
  };

  const handleNotificationFilterChange = (filter) => {
    // Implement filter logic here
  };

  const [candidateData, setCandidateData] = useState([]);

  return (
    <>
      {showMainContent && (
        <>
          <div className="container mx-auto">
            <div className="grid grid-cols-4 mx-5">
              {/* left side */}
              <div className="col-span-1">
                <div className="mx-3 border rounded-lg h-full mb-5">
                  <div className="mx-3">
                    {/* <div className="relative mt-4">
                      <div className="border rounded-lg relative flex justify-between">
                        <div className="py-2 ml-3">
                          <input type="text" placeholder="Switch candidate" />
                        </div>
                        <div className="mr-3 mt-3">
                          <button type="submit">
                            <HiArrowsUpDown className="text-custom-blue" />
                          </button>
                        </div>
                      </div>
                    </div> */}
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
                            {candidate.LastName}
                          </p>
                          <p className="text-base font-medium text-black">
                            {candidate.FirstName}
                          </p>
                          <p className="text-base font-medium text-black">
                            Fullstack Developer
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative mb-2">
                      <p className="text-xl font-medium text-black">Schedules</p>
                    </div>
                    {interviews.map((interview) => (
                      <div
                        key={interview._id}
                        // key={index}
                        className="border border-[#217989] bg-[#217989] shadow rounded-md bg-opacity-5 mb-2">
                        <div className="border-b border-gray-400 px-2 flex justify-between items-center">
                          <p className="text-sm">
                            {displayDateTime(interviewsRounds.dateTime)}
                          </p>
                          <p
                            className={statusTextColor}
                          >
                            {interviews.Status}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm p-2">
                          <div>
                            {candidate?.imageUrl ? (
                              <img
                                src={candidate.imageUrl}
                                alt="Candidate"
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              candidate?.Gender === "Male" ? (
                                <img src={maleImage} alt="Male Avatar" className="w-12 h-12 rounded-full" />
                              ) : candidate?.Gender === "Female" ? (
                                <img src={femaleImage} alt="Female Avatar" className="w-12 h-12 rounded-full" />
                              ) : (
                                <img src={genderlessImage} alt="Other Avatar" className="w-12 h-12 rounded-full" />
                              )
                            )}
                          </div>
                          <div>
                            <p>{candidate.Position}</p>
                            <p className="cursor-pointer text-custom-blue"
                            // onClick={() => handleInterviewClick(interview)}
                            >{interviewsRounds.interviewers}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* right side */}
              <div className="col-span-3">
                <div className="md:mx-3 lg:mx-3 xl:mx-3 sm:mx-1 flex justify-between sm:justify-start items-center">
                  <button
                    className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                    onClick={onCloseprofile}
                  >
                    <IoArrowBack className="text-2xl" />
                  </button>
                  <p className="text-2xl">
                    <span
                      className="text-custom-blue font-semibold cursor-pointer"
                      onClick={onCloseprofile}
                    >
                      Candidates
                    </span>{" "}
                    / {candidate.LastName}
                  </p>
                </div>
                <div>
                  <div className="mx-3 pt-3 sm:hidden md:hidden">
                    <p className="text-md space-x-10">
                      <span
                        className={`cursor-pointer ${activeTab === "candidate"
                          ? "text-gray-500 font-semibold pb-1 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("candidate")}
                      >
                        Candidate
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "position"
                          ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("position")}
                      >
                        Positions
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "schedules"
                          ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("schedules")}
                      >
                        Schedules
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "feedback"
                          ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
                          : "text-black"
                          }`}
                        onClick={() => handleTabClick("feedback")}
                      >
                        Feedback
                      </span>
                      <span
                        className={`cursor-pointer ${activeTab === "notifications"
                          ? "text-custom-blue font-semibold pb-1 border-b-2 border-custom-blue"
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
                      className="w-40 p-2 text-custom-blue border border-gray-300 rounded-md mt-5 ml-5 lg:hidden xl:hidden 2xl:hidden"
                      onChange={(e) => handleTabClick(e.target.value)}
                      value={activeTab}
                    >
                      <option value="candidate">Candidate</option>
                      <option value="position">Position</option>
                      <option value="schedule">Schedules</option>
                      <option value="schedule">Feedback</option>
                      <option value="schedule">Notifications</option>
                    </select>
                  </div>
                </div>
                {activeTab === "candidate" && (
                  <>
                    <div className="flex float-end -mt-7">
                      <button
                        className="bg-custom-blue text-white px-3 py-1 rounded-md mr-2"
                        onClick={handleEditClick}
                      >
                        Edit
                      </button>
                      <button className="bg-custom-blue text-white px-3 py-1 rounded-md mr-3">Schedule</button>
                    </div>

                    <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg ">
                      {/* candidate image only for mobile */}
                      {/* <div className="col-span-4 md:hidden lg:hidden xl:hidden 2xl:hidden sm:flex sm:justify-center">
                      <div>
                        <div className="flex justify-end text-center">
                          <div>
                            {candidate.imageUrl ? (
                              <img src={candidate.imageUrl} alt="Candidate" className="w-32 h-32 rounded" />
                            ) : (
                              candidate.Gender === "Male" ? (
                                <img src={maleImage} alt="Male Avatar" className="w-32 h-32 rounded" />
                              ) : candidate.Gender === "Female" ? (
                                <img src={femaleImage} alt="Female Avatar" className="w-32 h-32 rounded" />
                              ) : (
                                <img src={genderlessImage} alt="Other Avatar" className="w-32 h-32 rounded" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div> */}

                      <div className="p-3">
                        <p className="font-bold text-lg mb-5">
                          Personal Details:
                        </p>
                        {/* first name */}

                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">First Name</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.FirstName}
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
                              className="ml-14 relative"
                              type="button"
                              onClick={togglePopup}
                            >
                              <HiArrowsUpDown className="text-custom-blue" />
                            </button>

                            {/* Dropdown */}
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

                                      {/* Dropdown */}
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
                                      <button className="p-1 border text-xs text-white bg-gray-300 rounded-md" onClick={handleCancel}>Cancel</button>
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
                              {candidate.LastName}
                            </p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Gender</div>
                          </div>
                          <div>
                            <p className="font-normal text-gray-500">
                              {candidate.Gender}
                            </p>
                          </div>
                        </div>
                        {/* date of birth */}
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Date-of-Birth</div>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <p className="font-normal text-gray-500">
                              {formattedDateOfBirth}
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
                                {candidate.Email}
                              </span>
                            </p>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <div className="font-medium">Phone</div>
                          </div>
                          <div className="w-1/3 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.Phone}
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="font-bold text-lg mb-5">
                          Education Details:
                        </p>
                        {/* higher qualification */}
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                              Higher Qualification
                            </div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.HigherQualification}
                              </span>
                            </p>
                          </div>


                          {/* university/college */}

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                              University/College
                            </div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.UniversityCollege}
                              </span>
                            </p>
                          </div>

                        </div>

                        <p className="font-bold text-lg mb-5">
                          Experience Details:
                        </p>
                        {/* current experience */}
                        <div className="flex mb-5">
                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                              Total Experience
                            </div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.CurrentExperience}
                              </span>
                            </p>
                          </div>


                          {/* position */}

                          <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Relevant Experience</div>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p>
                              <span className="font-normal text-gray-500">
                                {candidate.Position}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-lg mb-5">
                          System Details:
                        </p>
                        <div className="flex mb-5">

                          {/* mansoor, i changed the width of the created by and modified by to 1/2 */}
                          <div className='w-1/2 flex'>
                            <div className="w-1/2 sm:w-1/2">
                              <div className="font-medium">
                                Created By
                              </div>
                            </div>
                            <div className="w-[12rem] sm:w-1/2">
                              <p>
                                <span className="font-normal text-gray-500">
                                  {candidate.CreatedBy}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className='w-1/2 flex'>
                            {/* position */}

                            <div className="w-1/2 sm:w-1/2">
                              <div className="font-medium">Modified By</div>
                            </div>
                            <div className="w-1/2 sm:w-1/2">
                              <p>
                                <span className="font-normal text-gray-500">
                                  {candidate.Position}
                                </span>
                              </p>
                            </div>
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
                            <div className="grid grid-cols-3 p-4">
                              <div className="block font-medium leading-6 text-gray-900">
                                Skills
                              </div>
                              <div className="block font-medium leading-6 text-gray-900">
                                Experience
                              </div>
                              <div className="block font-medium leading-6 text-gray-900">
                                Expertise
                              </div>
                            </div>
                            <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                              <table className="min-w-full divide-y divide-gray-200">
                                <tbody>
                                  {candidate.skills.map((skillEntry, index) => (
                                    <tr
                                      key={index}
                                      className="grid grid-cols-3 gap-4"
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

                {activeTab === "position" && (
                  <>
                    {positionData && (
                      <div className="mt-7">
                        <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300">
                          <p className="pr-4 ml-8 w-1/4 font-medium">
                            {positionData.title}
                          </p>
                          <p className="rounded px-2 ml-4 text-center font-medium">
                            {positionData.companyname}
                          </p>
                          <p
                            className="flex items-center text-3xl ml-3 mr-3"
                            onClick={toggleArrow}
                          >
                            {isArrowUp ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </p>
                        </div>
                        <div
                          className="p-4 bg-gray-100"
                          style={{ display: isArrowUp ? "block" : "none" }}
                        >
                          <div className="border rounded-md border-gray-300 p-3 mb-2 bg-white">
                            <div className="mt-2 mb-2">
                              <div className="flex flex-col mt-1 mb-2">
                                <div className="">
                                  <p className="font-bold text-lg mb-5">
                                    Personal Details:
                                  </p>
                                  {/* first name */}

                                  <div className="flex mb-5">
                                    <div className="w-1/4 sm:w-1/2">
                                      <div className="font-medium">Title:</div>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                      <p>
                                        <span className="font-normal text-gray-500">
                                          {positionData.title}
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
                                        className="ml-14 relative"
                                        type="button"
                                        onClick={togglePopup}
                                      >
                                        <HiArrowsUpDown className="text-custom-blue" />
                                      </button>

                                      {/* Dropdown */}
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

                                                {/* Dropdown */}
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
                                                <button className="p-1 border text-xs text-white bg-gray-300 rounded-md" onClick={handleCancel}>Cancel</button>
                                                <button className="p-1 border text-xs text-white bg-custom-blue rounded-md" onClick={handleChangePositionOwner}>Change</button>
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>



                                  </div>
                                </div>

                                <div className="flex mb-5">
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-medium">Company Name</p>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-normal text-gray-500">
                                      {positionData.companyname}
                                    </p>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <div className="font-medium">Experience</div>
                                  </div>
                                  <div>
                                    <p className="font-normal text-gray-500">
                                      {positionData.minexperience} to{" "}
                                      {positionData.maxexperience} years
                                    </p>
                                  </div>
                                </div>
                                <div className="flex mb-5">
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-medium">Job Description</p>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-normal text-gray-500">
                                      {positionData.jobdescription}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex mb-5">
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-medium">Additional Notes</p>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <p className="font-normal text-gray-500">
                                      {positionData.additionalnotes}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-bold text-lg mb-5">
                                  System Details:
                                </p>
                                <div className="flex mb-5">
                                  <div className="w-1/4 sm:w-1/2">
                                    <div className="font-medium">
                                      Created By
                                    </div>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <p>
                                      <span className="font-normal text-gray-500">
                                        {candidate.CurrentExperience}
                                      </span>
                                    </p>
                                  </div>
                                  {/* position */}

                                  <div className="w-1/4 sm:w-1/2">
                                    <div className="font-medium">Modified By</div>
                                  </div>
                                  <div className="w-1/4 sm:w-1/2">
                                    <p>
                                      <span className="font-normal text-gray-500">
                                        {candidate.Position}
                                      </span>
                                    </p>
                                  </div>
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
                              <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                <div className="sm:mx-0">
                                  <div className="grid grid-cols-3 p-4">
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Skills
                                    </div>
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Experience
                                    </div>
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Expertise
                                    </div>
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <tbody>
                                        {positionData.skills.map(
                                          (skillEntry, index) => (
                                            <tr
                                              key={index}
                                              className="grid grid-cols-3 gap-4"
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
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-5">
                            <div className="mt-4 mx-3 sm:mx-5">
                              <div className="font-bold text-xl mb-5">
                                Rounds Details:
                              </div>
                              {/* Skills */}
                              <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                <div className="sm:mx-0">
                                  <div className="grid grid-cols-4 p-4">
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Round Title
                                    </div>
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Interview Mode
                                    </div>
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Duration
                                    </div>
                                    <div className="block font-medium leading-6 text-gray-900">
                                      Interviewer
                                    </div>

                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <tbody>
                                        {positionData.rounds.map(
                                          (roundEntry, index) => (
                                            <tr
                                              key={index}
                                              className="grid grid-cols-4 gap-4"
                                            >
                                              <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                {roundEntry.round}
                                              </td>
                                              <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                {roundEntry.mode}
                                              </td>
                                              <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                {roundEntry.duration}
                                              </td>
                                              <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                {roundEntry.interviewer}
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
                        </div>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "schedules" && (
                  <div>
                    <div className="mt-7">
                      <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl">
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
                        className="p-4 bg-gray-100"
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
                      <div className="rounded-lg bg-gray-100 border border-gray-300 mx-3">
                        {/* New Developer and IBM Table */}
                        <div className="mb-1">
                          <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300 font-semibold text-xl">
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
                        </div>
                        <div className="mb-1 border-b">
                          <div className="flex justify-between p-2">
                            <h2 className="ml-2 text-md font-medium mt-2">
                              Notifications
                            </h2>
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
                                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
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
                                      opacity: candidateData.length === 0 ? 0.2 : 1,
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
                              onClick={() => handleNotificationFilterChange("all")}
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showNewCandidateContent && (
        <EditCandidateForm onClose={handleclose} candidate1={candidate} />
      )}
    </>
  );
};

export default CandidateDetails;
