import React, { useState, useEffect, useCallback } from "react";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import "../../Tabs/styles/tabs.scss";
import Tooltip from "@mui/material/Tooltip";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';
import Availability from '../CommonCode-AllTabs/Availability';
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { fetchFilterData } from '../../../../utils/dataUtils.js';

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const isAnyOptionSelected = selectedTechOptions.length > 0;

  const handleUnselectAll = () => {
    setSelectedTechOptions([]);
    setTechMainChecked(false);
    setMinExperience('');
    setMaxExperience('');
    onFilterChange({ status: [], tech: [], experience: { min: '', max: '' } });
  };
  useEffect(() => {
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isTechMainChecked]);

  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked ? skills.map(s => s.SkillName) : [];
    setSelectedTechOptions(newSelectedTech);
  };

  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions = selectedIndex === -1
      ? [...selectedTechOptions, option]
      : selectedTechOptions.filter((_, index) => index !== selectedIndex);
    setSelectedTechOptions(updatedOptions);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData('skills');
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchData();
  }, []);

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

const InternalInterviews = ({ onClose, onSelectCandidates, currentRoundIndex }) => {
  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.team || {}, [sharingPermissionscontext]);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);
  const [candidateData, setCandidateData] = useState([]);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("interviewer");
  const [selectedOption, setSelectedOption] = useState("");
  const [preferredDurationError, setPreferredDurationError] = useState("");
  const [availabilityError, setAvailabilityError] = useState('');
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showContent, setShowContent] = useState(true);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
  });

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const rawTeams = await fetchFilterData("team", sharingPermissions);
      const teamsWithImages = rawTeams.map((team, index) => {
        if (team.ImageData && team.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${team.ImageData.path.replace(/\\/g, "/")}`;
          return { ...team, imageUrl };
        }
        return team;
      });
      setTeamData(teamsWithImages);
    } catch (error) {
      console.error("Error fetching or processing team data:", error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions, searchQuery, selectedFilters]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const FilteredData = useMemo(() => {
    if (!Array.isArray(teamData)) {
      return [];
    }
    return teamData.filter((team, index) => {
      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(team.technology);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        (team.skills && team.skills.some((skill) => selectedFilters.tech.includes(skill.skill)));
      const matchesSearchQuery = [team.contactId?.name, team.contactId?.email, team.contactId?.phone].some(
        (field) =>
          field && field.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesAllFilters = matchesSearchQuery && matchesStatus && matchesTech;
      return matchesAllFilters;
    });
  }, [teamData, selectedFilters, searchQuery]);

  useEffect(() => {
    setFilteredData(FilteredData);
  }, [FilteredData]);

  const handleSearchInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = filteredData.filter((interviewer) => {
      return (
        interviewer.name.toLowerCase().includes(query) ||
        interviewer.role.toLowerCase().includes(query)
      );
    });
    setFilteredData(filtered);
  };

  const handleViewClick = (interviewer) => {
    setSelectedInterviewer(interviewer);
  };

  const handleFilterIconClick = () => {
    if (candidateData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const handleSelectClick = (interviewer) => {
    setSelectedInterviewerIds((prev) => {
      const newSelectedIds = [...prev, interviewer._id];
      return newSelectedIds;
    });
  };

  const handleScheduleClick = () => {
    const selectedInterviewers = filteredData.filter((interviewer) =>
      selectedInterviewerIds.includes(interviewer._id)
    );
    onSelectCandidates(selectedInterviewers, currentRoundIndex);
    onClose();
  };

  const isInterviewerSelected = (interviewer) => {
    const isSelected = selectedInterviewerIds.includes(interviewer._id);
    return isSelected;
  };

  const fetchCandidateData = useCallback(async () => {
    setLoading(true);
    try {
      const filteredCandidates = await fetchFilterData('candidate', sharingPermissions);
      const candidatesWithImages = filteredCandidates.map((candidate) => {
        if (candidate.ImageData && candidate.ImageData.filename) {
          const imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
          return { ...candidate, imageUrl };
        }
        return candidate;
      });
      setCandidateData(candidatesWithImages);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setLoading(false);
    }
  }, [sharingPermissions]);

  useEffect(() => {
    fetchCandidateData();
  }, [fetchCandidateData]);

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (selectedInterviewer?.contactId?.preferredDuration) {
      setSelectedOption(selectedInterviewer.contactId.preferredDuration);
    }
  }, [selectedInterviewer?.contactId?.preferredDuration]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setPreferredDurationError("");
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

  const onCloseview = () => {
    setSelectedInterviewer(false);
  };

  return (
    <>
      {showContent && (
        <>
          <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {/* header */}
              <div className="sticky top-0 flex justify-between p-4 border border-b bg-custom-blue text-white z-10">
                <h2 className="text-lg font-bold">
                  Internal Interviewers
                </h2>
                <button
                  onClick={onClose}
                  className="focus:outline-none sm:hidden"
                >
                  <svg
                    className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>
                  {` .hide-scrollbar::-webkit-scrollbar { display: none;  } `}
                </style>

                {/* filter and search */}
                <div className="flex items-center mb-4 mt-2 justify-between">
                  {/* Search Input */}
                  <div className="relative w-[200px] ml-10">
                    <div className="searchintabs border rounded-md relative py-[2px]">
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <button type="submit" className="p-2">
                          <IoMdSearch className="text-custom-blue" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Search Interviewer"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="rounded-full h-8 focus:outline-none border-gray-800"
                      />
                    </div>
                  </div>

                  {/* Filter Icon */}
                  <div className="mr-10 text-xl sm:text-md md:text-md border rounded-md p-2">
                    <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                      <span
                        onClick={handleFilterIconClick}
                        style={{
                          opacity: candidateData.length === 0 ? 0.2 : 1,
                          pointerEvents: candidateData.length === 0 ? "none" : "auto",
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

                {/* cards code */}
                <div className="flex flex-wrap justify-between gap-6 p-4">
                  {FilteredData.map((interviewer, index) => (
                    <div
                      key={index}
                      className="w-[48%] border border-custom-blue rounded-md shadow-md bg-[#F5F9FA]"
                    >
                      <div className="p-2">
                        <div className="flex gap-6 items-start">
                          {/* Left Section: Image */}
                          <div className="flex flex-col items-center">
                            <img
                              src={
                                interviewer.imageUrl ||
                                (interviewer.Gender === "Male"
                                  ? maleImage
                                  : interviewer.Gender === "Female"
                                    ? femaleImage
                                    : genderlessImage)
                              }
                              alt="interviewerImage"
                              className="w-16 h-16 rounded-full"
                            />
                          </div>

                          {/* Right Section: Info and Skills Content */}
                          <div className="flex-1 text-xs">
                            <p className="font-bold text-blue-400 mb-1 relative group">
                              {interviewer.contactId?.name || "N/A"}
                              <span className="absolute left-16 ml-2 px-2 py-1 text-xs font-normal bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Name
                              </span>
                            </p>

                            <p className="mb-1 relative group">
                              {interviewer.contactId?.technology || "N/A"}
                              <span className="absolute left-28 ml-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Technology
                              </span>
                            </p>

                            <p className="mb-1 relative group">
                              {interviewer.contactId?.email || "N/A"}
                              <span className="absolute left-16 ml-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Experience
                              </span>
                            </p>

                            <div className="mb-1">
                              <p>
                                {interviewer.contactId?.skills?.length > 0
                                  ? interviewer.contactId.skills
                                    .map((skill) => skill.skill || skill)
                                    .join(", ")
                                  : "No skills available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-end gap-4 p-2">
                        <button
                          className="border border-custom-blue py-1 px-2 rounded text-sm font-semibold hover:bg-blue-50 bg-white"
                          onClick={() => handleViewClick(interviewer)}
                        >
                          View
                        </button>
                        <button
                          className="border border-custom-blue py-1 px-2 rounded text-sm font-semibold hover:bg-blue-50 bg-white"
                          onClick={() => handleSelectClick(interviewer)}
                        >
                          {isInterviewerSelected(interviewer) ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  )) || (
                      <p className="text-gray-500">No interviewers found.</p>
                    )}
                </div>

              </div>

              <div className="footer-buttons flex justify-end">
                <button onClick={handleScheduleClick} className="bg-custom-blue p-2 rounded-md text-white">
                  Schedule
                </button>
              </div>
            </div>
            <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={handleFilterIconClick} onFilterChange={handleFilterChange} />

          </div>

          {/* Detailed View */}
          {selectedInterviewer && (
            <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
              <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-lg transition-transform duration-5000 transform overflow-y-scroll hide-scrollbar">
                <div className="container mx-auto">
                  <div className="grid grid-cols-4 mx-5 mt-10">
                    {/* Left side */}
                    <div className="col-span-1">
                      <div className="mx-3 border rounded-lg h-full mb-5">
                        <div className="flex justify-center text-center mt-8">
                          <div className="flex flex-col items-center">
                            {selectedInterviewer.image ? (
                              <img
                                src={selectedInterviewer.image}
                                alt="Candidate"
                                className="w-32 h-32 rounded"
                              />
                            ) : selectedInterviewer.gender === "Male" ? (
                              <img
                                src={maleImage}
                                alt="Male Avatar"
                                className="w-32 h-32 rounded"
                              />
                            ) : selectedInterviewer.gender === "Female" ? (
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
                                {selectedInterviewer.contactId?.firstname}
                              </p>
                              <p className="text-base font-medium text-black">
                                {selectedInterviewer.contactId?.CompanyName}
                              </p>
                              <p className="text-base font-medium text-black">
                                {selectedInterviewer.contactId?.technology}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="col-span-3">
                      <div className="md:mx-3 lg:mx-3 xl:mx-3 sm:mx-1 flex justify-between sm:justify-start items-center">
                        <button
                          className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden"
                          onClick={onClose}
                        >
                          <IoArrowBack className="text-2xl" />
                        </button>
                        <p className="text-xl">
                          <span
                            className="text-custom-blue font-semibold cursor-pointer"
                            onClick={onCloseview}
                          >
                            {selectedInterviewer.contactId?.name}
                          </span>
                        </p>
                      </div>

                      <div className="mx-3 pt-3 mb-7 sm:hidden md:hidden">
                        <p className="text-md space-x-10">
                          <span
                            className={`cursor-pointer ${activeTab === "interviewer"
                              ? "pb-3 border-b-2 border-custom-blue"
                              : "text-black"
                              }`}
                            onClick={() => handleTabClick("interviewer")}
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
                        </p>
                      </div>
                      {activeTab === "interviewer" && (
                        <>
                          <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg">
                            <div className="p-3">
                              <p className="font-bold text-lg mb-5">Personal Details:</p>
                              <div className="flex mb-5">
                                <div className="w-1/4 sm:w-1/2">
                                  <div className="font-medium">First Name</div>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.firstname || "N/A"}
                                    </span>
                                  </p>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p className="font-medium">Last Name</p>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p className="font-normal text-gray-500">
                                    {selectedInterviewer.contactId?.name || "N/A"}
                                  </p>
                                </div>
                              </div>

                              <p className="font-bold text-lg mb-5">Contact Details:</p>

                              <div className="flex mb-5">
                                <div className="w-1/3 sm:w-1/2">
                                  <div className="font-medium">Email</div>
                                </div>
                                <div className="w-1/3 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.email}
                                    </span>
                                  </p>
                                </div>
                                <div className="w-1/3 sm:w-1/2">
                                  <div className="font-medium">Phone</div>
                                </div>
                                <div className="w-1/3 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.phone}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <p className="font-bold text-lg mb-5">Job Details:</p>

                              <div className="flex mb-5">
                                <div className="w-1/4 sm:w-1/2">
                                  <div className="font-medium">Company</div>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.CompanyName}
                                    </span>
                                  </p>
                                </div>

                                <div className="w-1/4 sm:w-1/2">
                                  <div className="font-medium">Technology</div>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.technology}
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
                                      {selectedInterviewer.contactId?.currentRole}
                                    </span>
                                  </p>
                                </div>

                                <div className="w-1/4 sm:w-1/2">
                                  <div className="font-medium">Location</div>
                                </div>
                                <div className="w-1/4 sm:w-1/2">
                                  <p>
                                    <span className="font-normal text-gray-500">
                                      {selectedInterviewer.contactId?.location}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-5">
                            <div className="mt-4 mx-3 sm:mx-5">
                              <div className="font-bold text-xl mb-5">Skills Details:</div>
                              <div className="mb-5 text-sm rounded-lg border border-gray-300">
                                <div className="sm:mx-0">
                                  <div className="grid grid-cols-3 p-4">
                                    <div className="block font-medium leading-6 text-gray-900">Skills</div>
                                    <div className="block font-medium leading-6 text-gray-900">Experience</div>
                                    <div className="block font-medium leading-6 text-gray-900">Expertise</div>
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <tbody>
                                        {selectedInterviewer.contactId?.skills?.map((skillEntry, index) => (
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
                                        )) || (
                                            <tr>
                                              <td colSpan="3" className="py-4 text-center text-gray-500">
                                                No skills available
                                              </td>
                                            </tr>
                                          )}
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
                                  {selectedInterviewer.contactId?.timeZone}
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
                                from={'ScheduleLaterInternalInterview'}
                                availabilityData={selectedInterviewer.contactId?.availability}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </>
  );
};

export default InternalInterviews;