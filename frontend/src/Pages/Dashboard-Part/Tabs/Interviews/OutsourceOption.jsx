import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import StarRating from "../../../Dashboard-Part/Images/stars.png";
import "../../Tabs/styles/tabs.scss";
import Slider from "@mui/material/Slider";
import { blue, deepOrange } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";

import { ReactComponent as IoArrowBack } from "../../../../icons/IoArrowBack.svg";
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected =
    selectedStatusOptions.length > 0 || selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedStatusOptions([]);
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    setMinExperience("");
    setMaxExperience("");
    onFilterChange({ status: [], tech: [], experience: { min: "", max: "" } });
  };
  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);
  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked
      ? qualification.map((q) => q.QualificationName)
      : [];
    setSelectedStatusOptions(newSelectedStatus);
  };
  const handleTechMainToggle = () => {
    const newTechMainChecked = !isTechMainChecked;
    setTechMainChecked(newTechMainChecked);
    const newSelectedTech = newTechMainChecked
      ? skills.map((s) => s.SkillName)
      : [];
    setSelectedTechOptions(newSelectedTech);
  };
  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedStatusOptions, option]
        : selectedStatusOptions.filter((_, index) => index !== selectedIndex);

    setSelectedStatusOptions(updatedOptions);
  };
  const handleTechOptionToggle = (option) => {
    const selectedIndex = selectedTechOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedTechOptions, option]
        : selectedTechOptions.filter((_, index) => index !== selectedIndex);

    setSelectedTechOptions(updatedOptions);
  };
  const [skills, setSkills] = useState([]);
  const [qualification, setQualification] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await fetchMasterData("skills");
        setSkills(skillsData);
        const qualificationData = await fetchMasterData("qualification");
        setQualification(qualificationData);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchData();
  }, []);

  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, e.target.value));
    if (type === "min") {
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
  };
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
                <button
                  onClick={handleUnselectAll}
                  className="font-bold text-md"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          <div className="flex justify-between mt-2 ml-5">
            <div className="cursor-pointer">
              <label className="inline-flex items-center">
                <span className="ml-3 font-bold">Experiences</span>
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
                onChange={(e) => handleExperienceChange(e, "min")}
                className="border-b form-input w-20"
              />
              <span className="mx-3">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxExperience}
                min="1"
                max="15"
                onChange={(e) => handleExperienceChange(e, "max")}
                className="border-b form-input w-20"
              />
            </div>
          </div>
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
                <span className="ml-3 font-bold">Skill</span>
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
                  <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                    {option.SkillName}
                  </span>
                </label>
              ))}
            </div>
          )}
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

const OutsourceOption = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cardData, setCardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [value1, setValue1] = useState([1000, 2000]);
  const [showContent, setShowContent] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState(false);
  const [isArrowUp1, setIsArrowUp1] = useState(false);
  const [isArrowUp2, setIsArrowUp2] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/contacts`
        );
        const freelancers = response.data.filter(
          (contact) => contact.isFreelancer === "yes"
        );
        setCardData(freelancers);
        setFilteredData(freelancers);
      } catch (error) {
        console.error("Error fetching contacts data:", error);
      }
    };
    fetchContacts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = cardData.filter((item) => {
      return (
        (item.Name && item.Name.toLowerCase().includes(lowercasedQuery)) ||
        (item.Experience &&
          item.Experience.toLowerCase().includes(lowercasedQuery)) ||
        (item.CurrentRole &&
          item.CurrentRole.toLowerCase().includes(lowercasedQuery)) ||
        (item.company &&
          item.company.toLowerCase().includes(lowercasedQuery)) ||
        (item.Technology &&
          item.Technology.toLowerCase().includes(lowercasedQuery)) ||
        (item.Introduction &&
          item.Introduction.toLowerCase().includes(lowercasedQuery)) ||
        (item.inr && item.inr.toLowerCase().includes(lowercasedQuery))
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, cardData]);

  function valuetext(value) {
    return `${value}°C`;
  }

  const minValue = 1000;
  const maxValue = 10000;
  const minDistance = 1000;

  const handleChange1 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    let newMin = newValue[0];
    let newMax = newValue[1];
    newMin = Math.max(minValue, newMin);
    newMax = Math.min(maxValue, newMax);

    if (newMax - newMin < minDistance) {
      if (activeThumb === 0) {
        newMin = newMax - minDistance;
      } else {
        newMax = newMin + minDistance;
      }
    }

    setValue1([newMin, newMax]);
    const filtered = cardData.filter((card) => {
      const cardInr = parseInt(card.inr, 10);
      return cardInr >= newMin && cardInr <= newMax;
    });
    setFilteredData(filtered);
  };

  const marks = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1) * 1000,
    label: `${i + 1}k`,
  }));

  const toggleContent = (id) => {
    setShowContent(false);
    setSelectedPersonId(cardData.find((card) => card.id === id));
  };

  const toggleAntiContent = () => {
    setShowContent(true);
    setSelectedPersonId(false);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [candidateData, setCandidateData] = useState([]);

  const handleFilterIconClick = () => {
    if (candidateData.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const toggleArrow1 = () => setIsArrowUp1(!isArrowUp1);
  const toggleArrow2 = () => setIsArrowUp2(!isArrowUp2);

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: [],
  });

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
  }, []);

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleCandidateClick = (candidate) => {
    setSelectedPersonId(true);
    setShowContent(true);
  };
  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };
  const handleclose = () => {
    setSelectedCandidate(null);
    setActionViewMore(false);
  };

  // Define an array of interviewers
  const interviewers = [
    {
      name: "Rupha",
      company: "TCS",
      role: "Full Stack Developer",
      experience: "2-3 Years",
      skills: "NodeJS, ReactJS.....",
      image: femaleImage,
      ratingImage: StarRating,
      price: "USD $ 10",
      currency: "USD",
      isArrowUp: isArrowUp1,
      toggleArrow: toggleArrow1,
    },
    {
      name: "Rupha",
      company: "TCS",
      role: "Full Stack Developer",
      experience: "2-3 Years",
      skills: "NodeJS, ReactJS.....",
      image: femaleImage,
      ratingImage: StarRating,
      price: "INR 2000",
      currency: "INR",
      isArrowUp: isArrowUp2,
      toggleArrow: toggleArrow2,
    },
  ];

  return (
    <>
      {showContent && (
        <>
          <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {/* header */}
              <div className="sticky top-0 flex justify-between p-4 border border-b bg-custom-blue text-white z-10">
                <h2 className="text-lg font-bold">
                  Hire an Outsourced Interviewer
                </h2>
                <button
                  onClick={onClose}
                  className="focus:outline-none sm:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* filter and search */}
              <div className="flex items-center mb-4 mt-2">
                <div className="relative">
                  <div className="w-[250px] ml-5 border rounded-md relative">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button type="submit" className="p-2">
                        <IoMdSearch className="text-custom-blue" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search interviewers"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="rounded-full h-8 pl-10 text-left"
                    />
                  </div>
                </div>

                <div className="w-80 mt-7">
                  <div className="text-center justify-center flex">
                    <Box sx={{ width: 250 }}>
                      <Slider
                        getAriaLabel={() => "Minimum distance"}
                        value={value1}
                        onChange={handleChange1}
                        valueLabelDisplay="auto"
                        getAriaValueText={valuetext}
                        step={1000}
                        marks={marks}
                        min={minValue}
                        max={maxValue}
                        sx={{
                          "& .MuiSlider-thumb": {
                            backgroundColor: "custom-blue",
                          },
                          "& .MuiSlider-rail": {
                            backgroundColor: "custom-blue",
                          },
                          "& .MuiSlider-track": {
                            backgroundColor: "custom-blue",
                            border: `1px solid ${"custom-blue"}`,
                          },
                        }}
                        disableSwap
                      />
                    </Box>
                  </div>
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
                          candidateData.length === 0 ? "none" : "auto",
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

              {/* Flex container for interviewer cards */}
              <div className="flex">
                {interviewers.map((interviewer, index) => (
                  <div
                    key={index}
                    className="border border-custom-blue m-4 w-[300px] bg-white rounded-lg overflow-hidden"
                  >
                    <div className="flex items-start gap-4 p-2 bg-[#F5F9FA]">
                      <div className="flex flex-col items-center">
                        <img
                          src={interviewer.image}
                          alt="femaleImage"
                          className="w-10 h-10 mr-4"
                        />

                        <img
                          src={interviewer.ratingImage}
                          alt="Rating"
                          className="w-8 h-4 -mt-1 mr-4"
                        />
                        <p className="bg-blue-400 text-white rounded px-2">
                          {interviewer.price}
                        </p>
                        <p className="text-gray-400 font-semibold mr-4 mt-[1px]">Skills:</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-blue-400">
                          {interviewer.name}
                        </p>
                        <p>{interviewer.company}</p>
                        <p>{interviewer.role}</p>
                        <p>{interviewer.experience}</p>
                        <p>{interviewer.skills}</p>
                      </div>
                      <div
                        className="flex items-center text-2xl"
                        onClick={interviewer.toggleArrow}
                      >
                        {interviewer.isArrowUp ? (
                          <IoIosArrowUp />
                        ) : (
                          <IoIosArrowDown />
                        )}
                        
                      </div>
                      
                    </div>
                    {interviewer.isArrowUp && (
                      <div className="bg-[#F5F9FA]">
                        <p className="font-bold text-gray-400 p-1">Introduction</p>
                        <p className="p-2">Here are more details about the interviewer...</p>
                      </div>
                    )}
                  
                    <div className="flex justify-end gap-2 mx-2 my-2">
                      <button
                        className="border border-custom-blue py-1 px-4 rounded"
                        onClick={() => handleCandidateClick()}
                      >
                        View
                      </button>
                      <button className="border border-custom-blue py-1 px-4 rounded">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="footer-buttons flex justify-end">
                <button type="submit" className="footer-button bg-custom-blue">
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* 
      {selectedPersonId && (
        <>
        
          <div className="border border-b relative flex justify-between items-center">
            <div className="flex items-center p-2">
              <button
                className="text-2xl shadow px-2 ml-4 mr-5 text-black rounded"
                onClick={() => toggleAntiContent()}
              >
                <IoArrowBack />
              </button>
              <p className="text-3xl">{selectedPersonId.Name}</p>
            </div>
            <div className="flex p-2">
              <button className="px-4 py-1 mr-3 bg-blue-500 text-white rounded hover:bg-green-600">
                Schedule
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-12">
                Send Request
              </button>
            </div>
          </div>
          <div>
            <div className="mx-20 mt-10 text-sm">
              <div className="grid grid-cols-4">
            
                <div className="col-span-1">
                  <ul className="space-y-5">
                    <li className="font-bold">Name</li>
                    <li className="font-bold">Role</li>
                    <li className="font-bold">Experience</li>
                    <li className="font-bold">Company Name</li>
                    <li className="font-bold">Technology</li>
                    <li className="font-bold">Skills</li>
                  </ul>
                </div>
               
                <div className="col-span-1">
                  <ul className="space-y-5">
                    <li>{selectedPersonId.Name}</li>
                    <li>{selectedPersonId.CurrentRole}</li>
                    <li>{selectedPersonId.Experience}</li>
                    <li>{selectedPersonId.company}</li>
                    <li>-</li>
                    <li>{selectedPersonId.Technology}</li>
                  </ul>
                </div>
              
                <div className="flex justify-end col-span-2">
                  <div className="text-center space-y-1">
                    <img
                      src={selectedPersonId.imageUrl || femaleImage}
                      alt={`Card ${selectedPersonId._id}`}
                      className="w-32 h-32 rounded"
                    />
                    <img
                      src={StarRating}
                      alt=""
                      width={130}
                      className="bg-white rounded-lg -mt-1"
                    />
                    <p className="bg-blue-800 text-white py-2 w-32 text-md">
                      INR: {selectedPersonId.inr}
                    </p>
                    <p className="bg-green-500 py-2 text-white mt-5 rounded-lg w-32 text-md">
                      Available
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <p className="font-bold">Introduction</p>
                <p>{selectedPersonId.Introduction}</p>
              </div>
            </div>
          </div>
        </>
      )} */}
      <OffcanvasMenu
        isOpen={isMenuOpen}
        closeOffcanvas={handleFilterIconClick}
        onFilterChange={handleFilterChange}
      />

      {selectedPersonId && (
        <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
          <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-lg transition-transform duration-5000 transform">
            <div className="container mx-auto">
              <div className="grid grid-cols-4 mx-5">
                {/* Left side */}
                <div className="col-span-1 my-5">
                  <div className="mx-3 border rounded-lg h-[525px] mb-5 flex flex-col items-center">
                    <div className="mt-16">
                      {selectedPersonId.imageUrl ? (
                        <img
                          src={selectedPersonId.imageUrl}
                          alt="Candidate"
                          className="w-32 h-32 rounded"
                        />
                      ) : selectedPersonId.Gender === "Male" ? (
                        <img
                          src={maleImage}
                          alt="Male Avatar"
                          className="w-32 h-32 rounded"
                        />
                      ) : selectedPersonId.Gender === "Female" ? (
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
                    </div>
                    <div className="text-center mt-3">
                      <h2 className="text-lg font-bold">Rupha</h2>
                      <img
                        src={StarRating}
                        alt="5 stars"
                        className="w-24 h-10 -mt-1 mx-auto"
                      />
                      <p className="bg-blue-400 text-white py-1 px-2 w-[82px] rounded mx-auto">
                        INR 2000
                      </p>{" "}
                      <p>TCS</p>
                      <p>Full stack Developer</p>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="col-span-3 my-5">
                  <div className="flex justify-between sm:justify-start items-center">
                    <p className="text-2xl">
                      <span
                        className="text-custom-blue font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Rupha
                      </span>{" "}
                    </p>
                    <button
                      type="submit"
                      className="footer-button bg-custom-blue mb-2"
                    >
                      Send Request
                    </button>
                  </div>
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-bold mb-2">
                      Interviewer Details:
                    </h3>
                    <div className="flex mb-5">
                      <div className=" flex w-1/4">
                        <p className="font-medium">Name</p>
                      </div>
                      <div className="w-1/4 sm:w-1/2">
                        <p className="text-gray-500">Rupha</p>
                      </div>

                      <div className=" flex w-1/4">
                        <p className="font-medium">Company Name</p>
                      </div>
                      <div className="w-1/4 sm:w-1/2">
                        <p className="text-gray-500">Accenture</p>
                      </div>
                    </div>
                    <div className="flex mb-5">
                      <div className=" flex w-1/4">
                        <p className="font-medium">Role</p>
                      </div>
                      <div className="w-1/4 sm:w-1/2">
                        <p className="text-gray-500">Full stack Developer</p>
                      </div>
                      <div className=" flex w-1/4">
                        <p className="font-medium">Experience</p>
                      </div>
                      <div className="w-1/4 sm:w-1/2">
                        <p className="text-gray-500">2-3 Years</p>
                      </div>
                    </div>
                    <div className="flex mb-5">
                      <div className=" flex w-1/4">
                        <p className="font-medium">Skills</p>
                      </div>
                      <div className="w-1/4 sm:w-1/2">
                        <p className="text-gray-500">
                          Node.js, React.js, HTML, CSS, Java, JavaScript
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border p-4 rounded-md mt-4">
                    <h3 className="text-lg font-bold mb-2">Introduction:</h3>
                    <p className="text-gray-600">
                      Experienced web developer with 5-7 years of hands-on
                      expertise in crafting robust and dynamic web
                      applications...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutsourceOption;
