
// (a
import { useState, useRef, useEffect, useCallback } from "react";
// import "../../../../index.css";
// import "../styles/tabs.scss";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaList } from "react-icons/fa6";
import { TbLayoutGridRemove } from "react-icons/tb";
import { IoMdSearch } from "react-icons/io";
import Tooltip from "@mui/material/Tooltip";
import ProfilePopup from './ProfilePopup.jsx';
import { FaFilter } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import axios from "axios";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import ProfileForm from "./ProfileForm.jsx";
import Profile_Edit_Form from "./Profile_form_edit.jsx";
import { CgInfo } from "react-icons/cg";
import Cookies from 'js-cookie';
import { LuFilterX } from "react-icons/lu";
import { fetchMasterData } from '../../../utils/fetchMasterData.js';
import { FiFilter } from "react-icons/fi";

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected = selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedStatusOptions([]);
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    setMinExperience('');
    setMaxExperience('');
    onFilterChange({ status: [], tech: [], experience: { min: '', max: '' } });
  };
  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);
  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.QualificationName) : [];
    setSelectedStatusOptions(newSelectedStatus);

  };
  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked ? skills.map(s => s.SkillName) : [];
    setSelectedTechOptions(newSelectedTech);

  };
  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedStatusOptions, option]
      : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

    setSelectedStatusOptions(updatedOptions);
  };
  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedTechOptions, option]
      : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };
  const [skills, setSkills] = useState([]);
  const [qualification, setQualification] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
        const qualificationData = await fetchMasterData('qualification');
        setQualification(qualificationData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchData();
  }, []);

  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, e.target.value));
    if (type === 'min') {
      setMinExperience(value);
    } else {
      setMaxExperience(value);
    }

  };
  const Apply = () => {
    onFilterChange({
      status: selectedStatusOptions,
      tech: selectedTechOptions,
      experience: { min: minExperience, max: maxExperience },
    });
    if (window.innerWidth < 1023) {
      closeOffcanvas();
    }
  }
  return (
    <div
      className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-200px)]"
      style={{
        visibility: isOpen ? "visible" : "hidden",
        transform: isOpen ? "" : "translateX(50%)",
      }}
    >
      <div className="relative h-full flex flex-col">
        <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
          <div>
            <h2 className="text-lg font-bold ">Filters</h2>
          </div>
          {/* Unselect All Option */}
          <div>
            {(isAnyOptionSelected || minExperience || maxExperience) && (
              <div>
                <button onClick={handleUnselectAll} className="font-bold text-md">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          {/* Higher Qualification */}
          <div className="flex justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  checked={isStatusMainChecked}
                  onChange={handleStatusMainToggle}
                />
                <span className="ml-3 font-bold">Higher Qualification</span>
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
              {qualification.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedStatusOptions.includes(option.QualificationName)}
                    onChange={() => handleStatusOptionToggle(option.QualificationName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.QualificationName}</span>
                </label>
              ))}
            </div>
          )}
          {/* Skill/Technology */}
          <div className="flex mt-2 justify-between">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
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
              {skills.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    checked={selectedTechOptions.includes(option.SkillName)}
                    onChange={() => handleTechOptionToggle(option.SkillName)}
                  />
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.SkillName}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-2 ml-5">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <span className="ml-3 font-bold">Experience</span>
              </label>
            </div>
          </div>
          <div className="bg-white py-2 mt-1">
            <div className="flex items-center ml-10">
              <input
                type="number"
                placeholder="Min"
                value={minExperience}
                min="0"
                max="15"
                onChange={(e) => handleExperienceChange(e, 'min')}
                className="border-b form-input w-20"
              />
              <span className="mx-3">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxExperience}
                min="1"
                max="15"
                onChange={(e) => handleExperienceChange(e, 'max')}
                className="border-b form-input w-20"
              />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="fixed bottom-0 w-72 sm:w-full md:w-full bg-white space-x-3 flex justify-end border-t p-2">
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={closeOffcanvas}
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-custom-blue p-2 rounded-md text-white"
            onClick={Apply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {

  useEffect(() => {
    document.title = "Profile Tab";
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [profiles, setProfiles] = useState([])

  const [error, setError] = useState(null);
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
  }, []);

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
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };
  const handleCloseProfile = () => {
    setSelectedCandidate(null);
  };

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  const userId = localStorage.getItem("userId");


  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const organizationId = Cookies.get('organizationId');
        if (!organizationId) {
          throw new Error('Organization ID is not available');
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/organization/${organizationId}`);
        setProfiles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setLoading(false);
      }
    };
  
    fetchProfiles();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");


  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const FilteredData = () => {
    if (!Array.isArray(profiles)) return [];
    return profiles.filter((user) => {
      const fieldsToSearch = [
        user.label,
        user.Name,
        user.Description,
      ].filter(field => field !== null && field !== undefined);

      // const matchesStatus = selectedFilters.status.length === 0 || selectedFilters.status.includes(user.HigherQualification);
      // const matchesTech = selectedFilters.tech.length === 0 || user.skills.some(skill => selectedFilters.tech.includes(skill.skill));
      // const matchesExperience = (selectedFilters.experience.min === '' || user.CurrentExperience >= selectedFilters.experience.min) &&
      //   (selectedFilters.experience.max === '' || user.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some(
        (field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery 
      // && matchesStatus && matchesTech && matchesExperience;
    });
  };


  useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilters]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;





  const [activeArrow, setActiveArrow] = useState(null);



  const nextPage = () => {
    console.log("Next button clicked");
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => {
        console.log("Current page before increment:", prevPage);
        return prevPage + 1;
      });
    }
  };

  const prevPage = () => {
    console.log("Previous button clicked");
    if (currentPage > 0) {
      setCurrentPage((prevPage) => {
        console.log("Current page before decrement:", prevPage);
        return prevPage - 1;
      });
    }
  };


  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  console.log("Total pages:", totalPages);

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);

  const currentFilteredRows = FilteredData()
    .slice(startIndex, endIndex)
    .reverse();



  const noResults = currentFilteredRows.length === 0 && searchQuery !== "";

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

  const [selectedcandidate, setSelectedcandidate] = useState(null);
  const handleEditClick = (candidate) => {
    setSelectedcandidate(candidate);
  };



  const handleCloseProfileForm = () => {
    setSidebarOpen(false);
  };


  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleViewClick = (profile) => {
    setSelectedProfile(profile);
    setActionViewMore(null);
  };

  const handleClosePopup = () => {
    setSelectedProfile(null);
    setSelectedcandidate(null);
  };
  const ClosePopupedit = () => {
    setSelectedcandidate(null);
  };

  const [isFilterActive, setIsFilterActive] = useState(false);

  const handleFilterIconClick = () => {
    if (profiles.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };
  return (
    <>
      <div className="fixed top-24 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="text-lg font-semibold">Profile</span>
          </div>

          <div>
            {notification && (
              <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                {notification}
              </div>
            )}
          </div>

          <div onClick={toggleSidebar} className="mr-6">
            <span className="p-2 text-md font-semibold border shadow rounded-3xl">
              Add Profile
            </span>
          </div>
        </div>
      </div>

      <div className="fixed top-36 left-0 right-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
              <span onClick={handleListViewClick}>
                <FaList
                  className={`text-2xl mr-4 ${viewMode === "list" ? "text-blue-500" : ""}`}
                />
              </span>
            </Tooltip>
            <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
              <span onClick={handleKanbanViewClick}>
                <TbLayoutGridRemove
                  className={`text-2xl ${viewMode === "kanban" ? "text-blue-500" : ""}`}
                />
              </span>
            </Tooltip>
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
                  placeholder="Search by Candidate, Email, Phone."
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
              <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                <span
                  className={`border-2 p-2 mr-2 text-2xl ${currentPage === 0 ? " cursor-not-allowed" : ""} ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                  onClick={prevPage}
                >
                  <IoIosArrowBack />
                </span>
              </Tooltip>

              <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                <span
                  className={`border-2 p-2 text-2xl ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""} ${activeArrow === "next" ? "text-blue-500" : ""}`}
                  onClick={nextPage}
                >
                  <IoIosArrowForward />
                </span>
              </Tooltip>
            </div>
              <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    onClick={handleFilterIconClick}
                    style={{
                      opacity: profiles.length === 0 ? 0.2 : 1,
                      pointerEvents: profiles.length === 0 ? "none" : "auto",
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

      <div className="fixed left-0 right-0 mx-auto top-56 z-10">
        {tableVisible && (
          <div>
            {viewMode === "list" ? (
              <div className="flex">
                <div
                  className="flex-grow"
                  style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                >
                  <div className="relative">
                    <div className="overflow-y-auto min-h-80 max-h-96">
                      <table className="text-left w-full border-collapse border-gray-300 mb-14">
                        <thead className="bg-gray-300 sticky top-0 z-10 text-xs">
                          <tr>
                            <th scope="col" className="py-3 px-6">Label</th>
                            <th scope="col" className="py-3 px-6">Name</th>
                            <th scope="col" className="py-3 px-6">Description</th>
                            <th scope="col" className="py-3 px-6">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
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
                          ) : profiles.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center p-5">
                                  <p className="text-9xl rotate-180 text-blue-500"><CgInfo /></p>
                                  <p className="text-center text-lg font-normal">You don't have Connected Apps yet. Create new Connected Apps.</p>
                                  <p onClick={toggleSidebar} className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md">Add Apps</p>
                                </div>
                              </td>
                            </tr>
                          ) : currentFilteredRows.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-10 text-center">
                                <p className="text-lg font-normal">No data found.</p>
                              </td>
                            </tr>
                          ) : (
                            currentFilteredRows.map((candidate) => (
                              <tr key={candidate._id} className="bg-white border-b cursor-pointer text-xs">
                                <td className="py-2 px-6 text-blue-400">
                                  <div
                                    className="flex items-center gap-3"
                                    onClick={() => handleViewClick(candidate)}
                                  >

                                    {candidate.label}
                                  </div>
                                </td>
                                <td className="py-2 px-6">{candidate.Name}</td>
                                <td className="py-2 px-6">{candidate.Description}</td>

                                <td className="py-2 px-6 relative">
                                  <button onClick={() => toggleAction(candidate._id)}>
                                    <MdMoreHoriz className="text-3xl" />
                                  </button>
                                  {actionViewMore === candidate._id && (
                                    <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                      <div className="space-y-1">
                                        <p
                                          className="hover:bg-gray-200 p-1 rounded pl-3"
                                          onClick={() => handleViewClick(candidate)}
                                        >
                                          View

                                        </p>
                                        <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleEditClick(candidate)}>Edit</p>

                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={handleFilterIconClick} onFilterChange={handleFilterChange} />
              </div>
            ) : (
              // kanban view
              <div className="mx-3">
                <div className="flex">
                  <div
                    className="flex-grow"
                    style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                  >
                    <div className="overflow-y-auto min-h-80 max-h-96">
                      {loading ? (
                        <div className="py-10 text-center">
                          <div className="wrapper12">
                            <div className="circle12"></div>
                            <div className="circle12"></div>
                            <div className="circle12"></div>
                            <div className="shadow12"></div>
                            <div className="shadow12"></div>
                            <div className="shadow12"></div>
                          </div>
                        </div>
                      ) : profiles.length === 0 ? (
                        <div className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center p-5">
                            <p className="text-9xl rotate-180 text-blue-500"><CgInfo /></p>
                            <p className="text-center text-lg font-normal">You don't have Connected Apps yet. Create new Connected Apps.</p>
                            <p onClick={toggleSidebar} className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md">Add Apps</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4 p-4">
                          {currentFilteredRows.length === 0 ? (
                            <div className="col-span-3 py-10 text-center">
                              <p className="text-lg font-normal">No data found.</p>
                            </div>
                          ) : (
                            currentFilteredRows.map((candidate) => (
                              <div key={candidate._id} className="bg-white border border-orange-500 p-2 rounded">
                                <div className="relative">
                                  <div className="float-right">
                                    <button onClick={() => toggleAction(candidate._id)}>
                                      <IoMdMore className="text-3xl mt-1" />
                                    </button>
                                    {actionViewMore === candidate._id && (
                                      <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                        <div className="space-y-1">
                                          <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleViewClick(candidate)}>View</p>
                                          <p className="hover:bg-gray-200 p-1 rounded pl-3" onClick={() => handleEditClick(candidate)}>Edit</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex">
                                  <div className="flex flex-col">
                                    <div className="text-blue-400 text-lg cursor-pointer break-words" onClick={() => handleViewClick(candidate)}>
                                      {candidate.label}
                                    </div>
                                    <div className="text-xs grid grid-cols-2 gap-1 items-start">
                                      <div className="text-gray-400">Name</div>
                                      <div>{candidate.Name}</div>
                                      <div className="text-gray-400">Description</div>
                                      <div>{candidate.Description}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={handleFilterIconClick} onFilterChange={handleFilterChange} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {sidebarOpen && (
        <>

          <ProfileForm onClose={handleCloseProfileForm} />

        </>)}
      {selectedProfile && (
        <ProfilePopup profile={selectedProfile} onClose={handleClosePopup} />
      )}

      {selectedcandidate && (
        <Profile_Edit_Form profileData={selectedcandidate} onClose={ClosePopupedit} />
      )}
    </>
  );
};

export default Profile;

// a)