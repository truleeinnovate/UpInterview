import { useState, useRef, useEffect, useCallback } from "react";
// import "../../../../index.css";
// import "../styles/tabs.scss";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
// import CandidateProfileDetails from "./CandidateProfileDetails";
// import Sidebar from "../Candidate-Tab/CreateCandidate";
import axios from "axios";
// import Editcandidate from "./EditCandidate";
// import Savenextpopup from "./Save_&_next_popup";

import { ReactComponent as IoIosArrowBack } from '../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../icons/IoIosArrowForward.svg';
import { ReactComponent as LuFilter } from '../../../icons/LuFilter.svg';
import { ReactComponent as MdKeyboardArrowUp } from '../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../icons/MdKeyboardArrowDown.svg';
import { ReactComponent as CgInfo } from '../../../icons/CgInfo.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as FaList } from '../../../icons/FaList.svg';
import { ReactComponent as IoMdSearch } from '../../../icons/IoMdSearch.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as MdMoreVert } from '../../../icons/MdMoreVert.svg';

const OffcanvasMenu = ({ isOpen }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [isExperienceMainChecked, setIsExperienceMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const [selectedExperienceOptions, setSelectedExperienceOptions] = useState([]);

  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
    if (!isExperienceMainChecked) setSelectedExperienceOptions([]);
  }, [isStatusMainChecked, isTechMainChecked, isExperienceMainChecked]);

  const handleStatusMainToggle = () => {
    setStatusMainChecked(!isStatusMainChecked);
    setSelectedStatusOptions(isStatusMainChecked ? [] : [...statusOptions]);
  };

  // const handleTechMainToggle = () => {
  //   setTechMainChecked(!isTechMainChecked);
  //   setSelectedTechOptions(isTechMainChecked ? [] : [...techOptions]);
  // };

  const handleExperienceMainToggle = () => {
    setIsExperienceMainChecked(!isExperienceMainChecked);
    setSelectedExperienceOptions(
      isExperienceMainChecked ? [] : [...experienceOptions]
    );
  };

  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    if (selectedIndex === -1) {
      setSelectedStatusOptions([...selectedStatusOptions, option]);
    } else {
      const updatedOptions = [...selectedStatusOptions];
      updatedOptions.splice(selectedIndex, 1);
      setSelectedStatusOptions(updatedOptions);
    }
  };

  // const handleTechOptionToggle = (option) => {
  //   const selectedIndex = selectedTechOptions.indexOf(option);
  //   if (selectedIndex === -1) {
  //     setSelectedTechOptions([...selectedTechOptions, option]);
  //   } else {
  //     const updatedOptions = [...selectedTechOptions];
  //     updatedOptions.splice(selectedIndex, 1);
  //     setSelectedTechOptions(updatedOptions);
  //   }
  // };

  const handleExperienceOptionToggle = (option) => {
    const selectedIndex = selectedExperienceOptions.indexOf(option);
    if (selectedIndex === -1) {
      setSelectedExperienceOptions([...selectedExperienceOptions, option]);
    } else {
      const updatedOptions = [...selectedExperienceOptions];
      updatedOptions.splice(selectedIndex, 1);
      setSelectedExperienceOptions(updatedOptions);
    }
  };

  const statusOptions = [
    "Bachelor of Arts (BA)",
    "Bachelor of Science (BSc)",
    "Bachelor of Commerce (BCom)",
    "Bachelor of Engineering (BE/BTech)",
    "Bachelor of Technology (B.Tech)",
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Computer Applications (BCA)",
    "Bachelor of Architecture (BArch)",
    "Master of Arts (MA)",
    "Master of Science (MSc)",
    "Master of Commerce (MCom)",
    "Master of Engineering (ME/MTech)",
    "Master of Technology (M.Tech)",
    "Master of Business Administration (MBA)",
    "Master of Computer Applications (MCA)",
    "Diploma in Engineering",
    "Diploma in Computer Applications (DCA)",
    "Diploma in Business Administration",
  ];

  const experienceOptions = [
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-6 years",
    "6-7 years",
    "7-8 years",
    "8-9 years",
    "9-10 years",
    "10+ years",
  ];

  // const techOptions = [
  //   "Python",
  //   "Java",
  //   "SQL",
  //   "Artificial Intelligence (AI)",
  //   "Machine Learning (ML)",
  //   "Internet of Things (IoT)",
  //   "Blockchain",
  //   "Augmented Reality (AR)",
  //   "Virtual Reality (VR)",
  //   "Cybersecurity",
  //   "Cloud Computing",
  //   "Big Data Analytics",
  //   "Quantum Computing",
  //   "Natural Language Processing (NLP)",
  //   "Data Science",
  //   "DevOps (Development and Operations)",
  //   "Software-defined Networking (SDN)",
  //   "Predictive Analytics",
  //   "Robotic Process Automation (RPA)",
  //   "Edge Computing",
  //   "5G Technology",
  //   "Autonomous Vehicles",
  //   "Biometric Authentication Technology",
  // ];

  return (
    <div
      className="absolute top-12 w-72 text-sm bg-white border right-0 z-30 overflow-y-scroll"
      style={{
        top: "40.3%",
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
        height: isOpen ? "calc(100vh - 30%)" : "auto",
      }}
    >
      <div className="p-2">
        <h2 className="text-lg shadow font-bold p-2 mb-4">Filter</h2>
        <div className="flex justify-between">
          <div className="cursor-pointer">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                checked={isStatusMainChecked}
                onChange={handleStatusMainToggle}
              />
              <span className="ml-3 font-bold">Inquiry Type</span>
            </label>
          </div>
          <div
            className="cursor-pointer mr-3 text-2xl"
            onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
          >
            {isStatusDropdownOpen ? (
              <MdKeyboardArrowUp />
            ) : (
              <MdKeyboardArrowDown />
            )}
          </div>
        </div>
        {isStatusDropdownOpen && (
          <div className="bg-white py-2 mt-1">
            {statusOptions.map((option, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5"
                  checked={selectedStatusOptions.includes(option)}
                  onChange={() => handleStatusOptionToggle(option)}
                />
                <span className="ml-2 w-56">{option}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex mt-2 justify-between">
          <div className="cursor-pointer">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                checked={isExperienceMainChecked}
                onChange={handleExperienceMainToggle}
              />
              <span className="ml-3 font-bold">Date</span>
            </label>
          </div>
          <div
            className="cursor-pointer mr-3 text-2xl"
            onClick={() =>
              setIsExperienceDropdownOpen(!isExperienceDropdownOpen)
            }
          >
            {isExperienceDropdownOpen ? (
              <MdKeyboardArrowUp />
            ) : (
              <MdKeyboardArrowDown />
            )}
          </div>
        </div>

        {isExperienceDropdownOpen && (
          <div className="bg-white py-2 mt-1">
            {experienceOptions.map((option, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5"
                  checked={selectedExperienceOptions.includes(option)}
                  onChange={() => handleExperienceOptionToggle(option)}
                />
                <span className="ml-2 w-56">{option}</span>
              </label>
            ))}
          </div>
        )}
        {/* <div className="flex mt-2 justify-between">
          <div className="cursor-pointer">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                checked={isTechMainChecked}
                onChange={handleTechMainToggle}
              />
              <span className="ml-3 font-bold">Skill/Technology</span>
            </label>
          </div>
          <div
            className="cursor-pointer mr-3 text-2xl"
            onClick={() => setTechDropdownOpen(!isTechDropdownOpen)}
          >
            {isTechDropdownOpen ? (
              <MdKeyboardArrowUp />
            ) : (
              <MdKeyboardArrowDown />
            )}
          </div>
        </div>

        {isTechDropdownOpen && (
          <div className="bg-white py-2 mt-1">
            {techOptions.map((option, index) => (
              <label key={index} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5"
                  checked={selectedTechOptions.includes(option)}
                  onChange={() => handleTechOptionToggle(option)}
                />
                <span className="ml-2 w-56">{option}</span>
              </label>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
};

const Inquirydesk = () => {
  useEffect(() => {
    document.title = "Candidate Tab";
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  },[]);

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen, handleOutsideClick]);

  const navigate = useNavigate();
  // const [selectedCandidate] = useState(null);

  const handleCandidateClick = (candidate) => {
    navigate("/candidate-profiledetails", { state: { candidate } });
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}`);

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCandidateData(data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    const fetchCandidateData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate`);
        if (Array.isArray(response.data)) {
          setCandidateData(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching candidate data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();

    return () => {
      ws.close();
    };

  }, []);

  const [candidateData, setCandidateData] = useState([]);
  console.log("candidateData", candidateData)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate`);
        if (Array.isArray(response.data)) {
          setCandidateData(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
      }
    };
    fetchCandidateData();
  }, []);

  const FilteredData = () => {
    if (!Array.isArray(candidateData)) return [];
    return candidateData.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.FirstName,
        user.Email,
        user.Phone,
        user.HigherQualification,
        user.CurrentExperience,
        user.Skill
      ];

      return fieldsToSearch.some(
        (field) =>
          field !== undefined &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    console.log("Search query:", event.target.value);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

  const [activeArrow, setActiveArrow] = useState(null);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setActiveArrow("next");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setActiveArrow("prev");
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, candidateData.length);

  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();

  const [tableVisible] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  // const [selectedcandidate, setSelectedcandidate] = useState(null);
  const handleEditClick = (candidate) => {
    // setSelectedcandidate(candidate);
  };

  // const [popupLastName, setPopupLastName] = useState("");
  // const [showPopup, setShowPopup] = useState(false);

  const handlePopupClick = (lastName) => {
    // setPopupLastName(lastName);
    // setShowPopup(true);
  };

  return (
    <>
      <div className="flex justify-between mt-5">
        <div>
          <span className="p-3 w-fit text-lg font-semibold">Inquiry Desk</span>
        </div>
        <div onClick={toggleSidebar} className="mr-6">
          <span className="px-3 py-1 w-fit text-md font-semibold border shadow rounded-xl">
            Add
          </span>
        </div>
      </div>

      <div className="container mx-auto mb-5 mt-5">
        <div className="mx-3">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="flex">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList
                      className={`text-2xl mr-4 ${viewMode === "list" ? "text-blue-500" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleKanbanViewClick}>
                    <TbLayoutGridRemove
                      className={`text-2xl ${viewMode === "kanban" ? "text-blue-500" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <div className="searchintabs mr-5 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <button type="submit" className="p-2">
                      <IoMdSearch />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-10 pr-12"
                  />
                </div>
              </div>
              <div>
                <span className="p-2 text-xl mr-2">
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
                    className={`border-2 p-2 mr-2 text-2xl ${currentPage === 0 ? " cursor-not-allowed" : ""
                      } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                    onClick={prevPage}
                    disabled={currentPage === 0}
                  >
                    <IoIosArrowBack />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border-2 p-2 text-2xl ${currentPage === totalPages - 1
                      ? " cursor-not-allowed"
                      : ""
                      } ${activeArrow === "next" ? "text-blue-500" : ""}`}
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    <IoIosArrowForward />
                  </span>
                </Tooltip>
              </div>
              <div className="ml-4 text-2xl border-2 rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    onClick={candidateData.length === 0 ? null : toggleMenu}
                    style={{
                      opacity: candidateData.length === 0 ? 0.2 : 1,
                      pointerEvents:
                        candidateData.length === 0 ? "none" : "auto",
                    }}
                  >
                    <LuFilter
                      className={`${isMenuOpen ? "text-blue-500" : ""}`}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {tableVisible && (
          <div>
            {viewMode === "list" ? (
              <div className="flex">
                <div
                  className="flex-grow"
                  style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                >
                  <div className="relative">
                    <table className="text-left w-full border-collapse border-gray-400">
                      <thead className="text-xs border-t border-b bg-gray-300">
                        <tr>
                          <th scope="col" className="py-3 px-6">
                          Inquiry ID
                          </th>
                          <th scope="col" className="py-3 px-6">
                          Inquiry Type
                          </th>
                          <th scope="col" className="py-3 px-6">
                          Inquiry Owner
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Customer Name
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Date & Time
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Subject
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Status
                          </th>
                          <th scope="col" className="py-3 px-6">
                            Action
                          </th>
                        </tr>
                      </thead>
                      {loading ? (

                        <tbody>
                          <tr>
                            <td colSpan="7" className="py-28 text-center">
                              <div className="wrapper12">
                                <div className="circle12"></div>
                                <div className="circle12"></div>
                                <div className="circle12"></div>
                                <div className="shadow12"></div>
                                <div className="shadow12"></div>
                                <div className="shadow12"></div>
                              </div>
                            </td>
                          </tr>
                        </tbody>

                      ) : candidateData.length === 0 ? (
                        <tbody>
                          <tr>
                            <td colSpan="7" className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center p-5">
                                <p className="text-9xl rotate-180 text-blue-500"><CgInfo /></p>
                                <p className="text-center text-lg font-normal">You don't have candidates yet. Create new candidate.</p>
                                <p onClick={toggleSidebar} className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md">Add Candidate</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        <tbody>
                          {currentFilteredRows.map((candidate) => (
                            <tr key={candidate._id} className="bg-white border-b cursor-pointer text-xs">
                              <td className="py-2 px-6 text-blue-400">
                                <div
                                  className="flex items-center gap-3"
                                  onClick={() => handleCandidateClick(candidate)}
                                >
                                  <img
                                    src="https://images.pexels.com/photos/36487/above-adventure-aerial-air.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                    className="w-7 h-7 rounded"
                                    alt=""
                                  />
                                  {candidate.LastName}
                                </div>
                              </td>
                              <td className="py-2 px-6">{candidate.Email}</td>
                              <td className="py-2 px-6">{candidate.Phone}</td>
                              <td className="py-2 px-6">{candidate.HigherQualification}</td>
                              <td className="py-2 px-6">{candidate.CurrentExperience}</td>
                              <td className="py-2 px-6">
                                {/* {candidate.Skill.join(', ')} */}
                                </td>
                              <td className="py-2 px-6">
                                {/* {candidate.Skill.join(', ')} */}
                                </td>
                              <td className="py-2 px-6 relative">
                                <button onClick={() => toggleAction(candidate._id)}>
                                  <FiMoreHorizontal className="text-3xl" />
                                </button>
                                {actionViewMore === candidate._id && (
                                  <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                    <div className="space-y-1">
                                      <p
                                        className="hover:bg-gray-200 p-1 rounded pl-3"
                                        onClick={() => handleCandidateClick(candidate)}
                                      >
                                        View
                                      </p>
                                      <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleEditClick(candidate)}>Edit</p>
                                      <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handlePopupClick(candidate.LastName)}>
                                        Schedule
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
                <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={toggleMenu} />
              </div>
            ) : (
              <div className="mx-3">
                <div className="flex">
                  <div
                    className="flex-grow"
                    style={{ marginRight: isMenuOpen ? "162px" : "0" }}
                  >
                    <div>
                      {candidateData.length === 0 ? (
                        <>
                          <div colSpan="7" className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center p-5">
                              <p className="text-9xl rotate-180 text-blue-500">
                                <CgInfo />
                              </p>
                              <p className="text-center text-lg font-normal">
                                You don't have candidates yet. Create new
                                candidate.
                              </p>
                              <p
                                onClick={toggleSidebar}
                                className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
                              >
                                Add Candidate
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-4 p-4">
                            {currentFilteredRows.map((candidate) => (
                              <div key={candidate._id}>
                                <div className="relative">
                                  <div className="float-right">
                                    <button
                                      onClick={() =>
                                        toggleAction(candidate._id)
                                      }
                                    >
                                      <MdMoreVert className="text-3xl mt-1" />
                                    </button>
                                    {actionViewMore === candidate._id && (
                                      <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                        <div className="space-y-1">
                                          <p
                                            className="hover:bg-gray-200 p-1 rounded pl-3"
                                            onClick={() =>
                                              handleCandidateClick(candidate)
                                            }
                                          >
                                            View
                                          </p>
                                          <p
                                            className="hover:bg-gray-200 p-1 rounded pl-3"
                                            onClick={() =>
                                              handleEditClick(candidate)
                                            }
                                          >
                                            Edit
                                          </p>
                                          <p
                                            className="hover:bg-gray-200 p-1 rounded pl-3"
                                            onClick={() =>
                                              handlePopupClick(
                                                candidate.LastName
                                              )
                                            }
                                          >
                                            Schedule
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-white border border-orange-500 cursor-pointer p-2 rounded">
                                  <div className="flex">
                                    <div
                                      onClick={() =>
                                        handleCandidateClick(candidate)
                                      }
                                      className="w-16 h-14 mt-3 ml-1 mr-3 overflow-hidden cursor-pointer rounded"
                                    >
                                      {candidate.image ? (
                                        <img
                                          src={candidate.image}
                                          alt="Candidate"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <img
                                          src="https://images.pexels.com/photos/36487/above-adventure-aerial-air.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                          className="w-full h-full"
                                          alt="Default"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <div
                                        className="text-blue-400 text-lg cursor-pointer break-words"
                                        onClick={() =>
                                          handleCandidateClick(candidate)
                                        }
                                      >
                                        {candidate.LastName}
                                      </div>
                                      <div className="text-xs grid grid-cols-2 gap-1 items-start">
                                        <div className="text-gray-400">
                                          Email
                                        </div>
                                        <div>{candidate.Email}</div>
                                        <div className="text-gray-400">
                                          Phone
                                        </div>
                                        <div>{candidate.Phone}</div>
                                        <div className="text-gray-400">
                                          Higher Qualification
                                        </div>
                                        <div>
                                          {candidate.HigherQualification}
                                        </div>
                                        <div className="text-gray-400">
                                          Current Experience
                                        </div>
                                        <div>{candidate.CurrentExperience}</div>
                                        <div className="text-gray-400">
                                          Skills/Technology
                                        </div>
                                        <div>
                                          {/* {candidate.Skill.join(", ")} */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <OffcanvasMenu
                    isOpen={isMenuOpen}
                    closeOffcanvas={toggleMenu}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onOutsideClick={handleOutsideClick}
        ref={sidebarRef}
      />
      {selectedCandidate && (
        <CandidateProfileDetails candidate={selectedCandidate} />
      )}
      {selectedcandidate && (
        <Editcandidate onClose={handleclose} candidate1={selectedcandidate} />
      )}
      {showPopup && (
        <Savenextpopup onClosepopup={onClosepopup} lastName={popupLastName} />
      )} */}
    </>
  );
};

export default Inquirydesk;
