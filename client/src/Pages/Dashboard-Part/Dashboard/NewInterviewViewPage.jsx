import { useState, useRef, useEffect, useCallback } from "react";
import "../../../index.css";
import "../Tabs/styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
// import Sidebar from "../Dashboard/NewInterviewRequest";

import { ReactComponent as FaArrowRight } from '../../../icons/FaArrowRight.svg';
import { ReactComponent as FaFilter } from '../../../icons/FiFilter.svg';
import { ReactComponent as IoIosArrowForward } from '../../../icons/IoIosArrowForward.svg';
import { ReactComponent as IoIosArrowBack } from '../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoMdSearch } from '../../../icons/IoMdSearch.svg';
import { ReactComponent as FaCaretDown } from '../../../icons/FaCaretDown.svg';
import { ReactComponent as FaCaretUp } from '../../../icons/FaCaretUp.svg';

import axios from "axios";
const interviewData = [
  { title: "Salesforce Developer", date: "15/5/2024 3:00 pm", skills: "Apex, AURA, LWC" },
  { title: "Fullstack Developer", date: "15/5/2024 6:00 pm", skills: "HTML, CSS" },
  { title: "Java Developer", date: "15/5/2024 7:00 pm", skills: "Apex, AURA, LWC" },
  { title: "Salesforce Developer", date: "15/5/2024 3:00 pm", skills: "Apex, AURA, LWC" },
  { title: "Fullstack Developer", date: "15/5/2024 6:00 pm", skills: "HTML, CSS" },
  { title: "Java Developer", date: "15/5/2024 7:00 pm", skills: "Apex, AURA, LWC" },
];
const NewInterviewViewPage = () => {
  return (
    <div>
      <Viewpage1 />
      <Viewpage2 />
    </div>
  );
};

const OffcanvasMenu = ({ isOpen }) => {
  // const [isStatusChecked, setStatusChecked] = useState(false);
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  // const [selectedOptions, setSelectedOptions] = useState([]);
  // const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  // const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  // const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);

  const handleStatusToggle = () => {
    setStatusDropdownOpen(!isStatusDropdownOpen);
  };

  // const handleStatusSelect = (option) => {
  //   if (selectedOptions.includes(option)) {
  //     setSelectedOptions(selectedOptions.filter((item) => item !== option));
  //   } else {
  //     setSelectedOptions([...selectedOptions, option]);
  //   }
  // };

  // const handleTechToggle = () => {
  //   setTechDropdownOpen(!isTechDropdownOpen);
  // };

  // const handleTechSelect = (option) => {
  //   if (selectedTechOptions.includes(option)) {
  //     setSelectedTechOptions(
  //       selectedTechOptions.filter((item) => item !== option)
  //     );
  //   } else {
  //     setSelectedTechOptions([...selectedTechOptions, option]);
  //   }
  // };

  // Define the handleExperienceToggle function
  // const handleExperienceToggle = () => {
  //   setIsExperienceDropdownOpen(!isExperienceDropdownOpen);
  // };

  return (
    <div
      className="absolute top-12 w-72  text-sm bg-white border right-0 z-30 overflow-y-scroll"
      style={{
        top: "40.3%",
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
        height: isOpen ? "calc(100vh - 30%)" : "auto",
        // It's best to remove commented-out styles for clarity
      }}
    >
      <div className="p-2">
        <h2 className="text-lg shadow-sm font-bold p-2 mb-4">Filter</h2>
        {/* Status checkbox */}
        <div className="flex">
          <div className="cursor-pointer">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-5 w-5 " />
              <span className="ml-3">Skills</span>
            </label>
          </div>
          {/* Dropdown icon */}
          <div className="cursor-pointer" onClick={handleStatusToggle}>
            {isStatusDropdownOpen ? (
              <FaCaretUp className="ml-10" />
            ) : (
              <FaCaretDown className="ml-10" />
            )}
          </div>
        </div>

        {/* Dropdown menu */}
        {isStatusDropdownOpen && (
          <div className="bg-white border border-gray-200 shadow-lg py-2 px-3 mt-1">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-5 w-5 " />
              <span className="ml-2">HTML/CSS</span>
            </label>{" "}
            <br />
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-5 w-5 " />
              <span className="ml-2">JavaScript</span>
            </label>{" "}
            <br />
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox h-5 w-5 " />
              <span className="ml-2">React</span>
            </label>{" "}
            <br />
          </div>
        )}
      </div>
    </div>
  );
};
const Viewpage1 = () => {
  // const Navigate = useNavigate();

  // const handleShowCandidates = () => {
  // 	Navigate("/createCandidate");
  // };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, [closeSidebar, sidebarRef]);

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

  return (
    <div className="flex justify-between mt-5">
      {/*Candidates */}
      <div>
        <span className="p-3 w-fit text-lg font-semibold">
          My Interview Requests
        </span>
      </div>
    </div>
  );
};

const Viewpage2 = () => {
  // const navigate = useNavigate();
  // const [selectedAssessment, setSelectedAssessment] = useState(null);
  // const [showPopup, setShowPopup] = useState(false);

  // const handleAssessmentClick = (assessment) => {
  //   // setShowPopup(true);
  //   navigate("/assessmentpopup", { state: { assessment } });
  // };

  // const closeModal = () => {
  //   setShowPopup(false);
  // };

  const [searchQuery, setSearchQuery] = useState("");

  const [AssessmentData] = useState(() => {
    const storeAssessmentData = localStorage.getItem("AssessmentData");
    return storeAssessmentData ? JSON.parse(storeAssessmentData) : [];
  });

  // const FilteredData = () => {
  //   const lowerCaseSearchQuery = searchQuery.toLowerCase();

  //   return AssessmentData.filter(
  //     (user) =>
  //       (user.assessmentName &&
  //         user.assessmentName.toLowerCase().includes(lowerCaseSearchQuery)) ||
  //       (user.assessmentType &&
  //         user.assessmentType.toLowerCase().includes(lowerCaseSearchQuery)) ||
  //       (user.passscore &&
  //         user.passscore.toLowerCase().includes(lowerCaseSearchQuery)) ||
  //       (user.skills && user.skills.includes(lowerCaseSearchQuery))
  //   );
  // };

  // const currentFilteredRows = FilteredData();

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // styles
  // const trFontstyle = {
  //   fontSize: "13px",
  // };

  // const Navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  }, [closeSidebar, sidebarRef]);

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


  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(AssessmentData.length / rowsPerPage);

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
  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, AssessmentData.length);
  // const currentRows = currentFilteredRows.slice(startIndex, endIndex).reverse();





  //   const [questionData, setQuestionData] = useState([]);
  // const [basicData] = useState(
  //   JSON.parse(localStorage.getItem("basicData")) || []
  // );

  // const [actionViewMore, setActionViewMore] = useState(false);
  // const [actionViewMore, setActionViewMore] = useState(
  //   Array(basicData.length).fill(false)
  // ); // State to manage popup visibility for action buttons

  // const toggleAction = (index) => {
  //   setActionViewMore((prevState) => {
  //     const newState = [...prevState];
  //     newState[index] = !newState[index];
  //     return newState;
  //   });
  // };

  // useEffect(() => {
  //   const storedData = JSON.parse(localStorage.getItem("basicData")) || [];
  //   // setBasicData(storedData);
  // }, []);

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };


  const [candidateData, setCandidateData] = useState([]);
  console.log("candidateData", candidateData)

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

  return (
    <>
      {/* component1 */}
      <div className="container mx-auto mb-5 mt-5">
        <div className="mx-3">
          <div className="flex items-center justify-end">


            <div className="flex items-center">
              {/* Search */}
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
              {/* navigation */}
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
                    <FaFilter
                      className={`${isMenuOpen ? "text-blue-500" : ""}`}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5">
        <div className="grid grid-cols-3 gap-3">
          {interviewData.map((interview, index) => (
            <div key={index} className="p-1 rounded-md shadow-md border">
              <div className="flex mb-2 text-sm">
                <div className="w-28 font-medium">Title</div>
                <div>{interview.title}</div>
              </div>
              <div className="flex mb-2 text-sm">
                <div className="w-28 font-medium">Date & Time</div>
                <div>{interview.date}</div>
              </div>
              <div className="flex mb-2 text-sm">
                <div className="w-28 font-medium">Skills</div>
                <div>{interview.skills}</div>
              </div>
              <div className="text-lg mr-3 -mt-5 float-end">
                <FaArrowRight onClick={toggleSidebar} />
              </div>
            </div>
          ))}
        </div>
        <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={toggleMenu} />
      </div>
    </>
  );
};

export default NewInterviewViewPage;
