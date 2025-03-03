import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import femaleImage from "../../../Dashboard-Part/Images/woman.png";
import StarRating from "../../../Dashboard-Part/Images/stars.png";
import "../../Tabs/styles/tabs.scss";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import maleImage from "../../../Dashboard-Part/Images/man.png";
import genderlessImage from "../../../Dashboard-Part/Images/transgender.png";
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import { useMemo } from 'react';
import Cookies from 'js-cookie';
import { ReactComponent as IoMdSearch } from "../../../../icons/IoMdSearch.svg";
import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
import { ReactComponent as LuFilterX } from "../../../../icons/LuFilterX.svg";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { fetchFilterData } from '../../../../utils/dataUtils.js';

// const OutsourceOption = ({ onClose, dateTime, candidateData1, onProceed }) => {
const OutsourceOption = ({
  onClose,
  dateTime,
  candidateData1,
  onProceed,
  selectedInterviewerIds
}) => {

  const minValue = 5;
  const maxValue = 100;
  const minDistance = 10;
  const { sharingPermissionscontext } = usePermissions();
  const sharingPermissions = useMemo(() => sharingPermissionscontext.candidate || {}, [sharingPermissionscontext]);
  const [interviewers, setInterviewers] = useState([]);
  const [candidateData, setCandidateData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [value1, setValue1] = useState([5, 10]);
  const [showContent, setShowContent] = useState(true);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    tech: [],
    experience: { min: '', max: '' },
    price: { min: 1, max: 2 }
  });

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const onCloseview = () => {
    setSelectedInterviewer(false);
  };
  const handleChange1 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    let newMin = Math.max(minValue, newValue[0]);
    let newMax = Math.min(maxValue, newValue[1]);
    if (newMax - newMin < minDistance) {
      if (activeThumb === 0) {
        newMin = newMax - minDistance;
      } else {
        newMax = newMin + minDistance;
      }
    }
    setValue1([newMin, newMax]);
    setSelectedFilters((prev) => ({
      ...prev,
      price: { min: newMin, max: newMax },
    }));
    setIsPriceFilterActive(true);
    filterInterviewersByPrice([newMin, newMax]);
  };

  const filterInterviewersByPrice = (priceRange) => {
    const [minPrice, maxPrice] = priceRange;
    const filtered = interviewers.filter(interviewer => {
      return interviewer.price >= minPrice && interviewer.price <= maxPrice;
    });
    setFilteredInterviewers(filtered);
  };

  const marks = [5, 10, ...Array.from({ length: 9 }, (_, i) => (i + 2) * 10)].map((value) => ({
    value,
    label: `${value}`,
  }));

  const toggleIntroduction = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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

  const formatTo12Hour = (isoDate) => {
    const date = new Date(isoDate);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const fetchInterviewers = useCallback(async (candidateSkills, candidateExperience) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts/outsource`);

      const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = (hours % 12) * 60 + minutes;
        if (period === 'PM') totalMinutes += 720;
        return totalMinutes;
      };

      // Split dateTime into date and time
      const [datePart, ...timeParts] = dateTime.split(' ');
      const timeRange = timeParts.join(' ');
      const [startTimeStr, endTimeStr] = timeRange.split('-').map(t => t.trim());

      const startTimeMinutes = timeToMinutes(startTimeStr);
      const endTimeMinutes = timeToMinutes(endTimeStr);

      const [day, month, year] = datePart.split('-');
      const interviewDate = new Date(`${year}-${month}-${day}`);
      const interviewDay = interviewDate.toLocaleDateString('en-US', { weekday: 'long' });

      const availableInterviewers = response.data.filter(interviewer => {
        return interviewer.availability.some(availability => {
          return availability.days.some(day => {
            if (day.day !== interviewDay) return false;
            return day.timeSlots.some(timeSlot => {
              const availabilityStartMinutes = timeToMinutes(formatTo12Hour(timeSlot.startTime));
              const availabilityEndMinutes = timeToMinutes(formatTo12Hour(timeSlot.endTime));
              const isWithinAvailability = (startTimeMinutes >= availabilityStartMinutes) && (endTimeMinutes <= availabilityEndMinutes);
              return isWithinAvailability;

            });
          });
        });
      });


      //  Then filter based on skills
      const skillFilteredInterviewers = availableInterviewers.filter(interviewer => {
        const matchingSkills = interviewer.skills.filter(interviewerSkill => {
          return candidateSkills.some(candidateSkill => {
            const isMatch = interviewerSkill.skill === candidateSkill.skill;
            return isMatch;
          });
        });

        if (matchingSkills.length === 0) {
          return false;
        }

        return true;
      });


      // Finally, filter based on experience
      const experienceFilteredInterviewers = skillFilteredInterviewers.filter(interviewer => {

        if (!(interviewer.minexperience && interviewer.maxexperience)) {
          return false;
        }

        const isMatch = (
          candidateExperience >= parseInt(interviewer.minexperience) &&
          candidateExperience <= parseInt(interviewer.maxexperience)
        );

        if (!isMatch) {
          return false;
        }

        return true;
      });

      setInterviewers(experienceFilteredInterviewers);
    } catch (error) {
      console.error("Error fetching interviewers:", error);
    }
  }, [dateTime]);

  const requestSentRef = useRef(false);

  useEffect(() => {
    if (candidateData1 && !requestSentRef.current) {
      fetchInterviewers(candidateData1.skills, candidateData1.CurrentExperience);
    }
  }, [candidateData1, fetchInterviewers]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  const FilteredData = () => {
    if (!Array.isArray(interviewers)) return [];
    return interviewers.filter((user) => {
      const fieldsToSearch = [user.name, user.company, user.role];
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills.some((skill) => selectedFilters.tech.includes(skill.skill));
      return (
        fieldsToSearch.some((field) =>
          field && field.toLowerCase().includes(searchQuery.toLowerCase())
        ) && matchesTech
      );
    });
  };

  const currentFilteredRows = FilteredData();

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);

  const [selectedInterviewerIdsLocal, setSelectedInterviewerIdsLocal] = useState(selectedInterviewerIds || []);

  // const handleSelectClick = (interviewer) => {
  //   setSelectedInterviewerIds((prev) => {
  //     if (prev.includes(interviewer._id)) {
  //       return prev.filter(id => id !== interviewer._id);
  //     } else {
  //       return [...prev, interviewer._id];
  //     }
  //   });
  // };

  const handleSelectClick = (interviewer) => {
    setSelectedInterviewerIdsLocal((prev) => {
      if (prev.includes(interviewer._id)) {
        return prev.filter(id => id !== interviewer._id);
      } else {
        return [...prev, interviewer._id];
      }
    });
  };

  const handleProceed = () => {
    onProceed(currentFilteredRows.filter(interviewer => selectedInterviewerIdsLocal.includes(interviewer._id)).map(i => ({ id: i._id, name: i.name })));
    onClose();
  };

  return (
    <>
      {showContent && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {/* header */}
              <div className="top-0 flex justify-between p-4 border border-b bg-custom-blue text-white z-10">
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

              <div >
                {/* filter and search */}
                <div className="flex items-center mb-4 mt-2">
                  <div className="relative ">
                    <div className="ml-4 searchintabs border rounded-md relative py-[2px] w-[200px]">
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

                  <div className="w-96 mt-7">
                    <div className="text-center justify-center flex">
                      <Box sx={{ width: 330 }}>
                        <Slider
                          getAriaLabel={() => "Minimum distance"}
                          value={value1}
                          onChange={handleChange1}
                          valueLabelDisplay="on"
                          valueLabelFormat={(value) => `$${value}`}
                          getAriaValueText={(value) => `$${value}`}
                          step={null}
                          marks={marks}
                          min={minValue}
                          max={maxValue}
                          sx={{
                            "& .MuiSlider-thumb": {
                              backgroundColor: "#217989",
                            },
                            "& .MuiSlider-rail": {
                              backgroundColor: "#217989",
                            },
                            "& .MuiSlider-track": {
                              backgroundColor: "#217989",
                              border: `1px solid ${"#217989"}`,
                            },
                          }}
                          disableSwap
                        />
                      </Box>
                    </div>
                  </div>

                  <div className="-ml-4 text-xl border rounded-md p-2 relative">
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

                    {/* OffcanvasMenu positioned below the filter icon*/}
                    {isMenuOpen && (
                      <div className="absolute top-full mt-2" style={{ left: '-660%' }}>
                        {/* <OffcanvasMenu
                          isOpen={isMenuOpen}
                          closeOffcanvas={handleFilterIconClick}
                          onFilterChange={handleFilterChange}
                          showExperience={true}
                        /> */}
                      </div>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 230px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {/* Cards Code */}
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {currentFilteredRows.length === 0 ? (
                      <div className="w-full text-center text-gray-500">
                        No data matches the applied filters.
                      </div>
                    ) : (
                      currentFilteredRows.map((interviewer, index) => (
                        <div
                          key={index}
                          className={`relative border border-custom-blue rounded-md shadow-md bg-[#F5F9FA] transition-all duration-300 ${expandedIndex === index ? 'row-span-2' : ''
                            }`}
                          style={{
                            height: expandedIndex === index ? 'auto' : '160px',
                            overflowY: expandedIndex === index ? 'auto' : 'hidden',
                          }}
                        >
                          <div className="p-2 pb-14">
                            <div className="flex gap-4 items-start">
                              {/* Left Section: Image, Rating, Price, Skills Label */}
                              <div className="flex flex-col items-center mb-2">
                                {/* <img
                                  src={interviewer.image}
                                  alt="interviewerImage"
                                  className="w-10 h-10 rounded-full"
                                />
                                <img
                                  src={interviewer.ratingImage}
                                  alt="Rating"
                                  className="w-10 h-5"
                                /> */}
                                {interviewer.image ? (
                                  <img
                                    src={interviewer.image}
                                    alt="Candidate"
                                    className="w-10 h-10 rounded"
                                  />
                                ) : interviewer.gender === "Male" ? (
                                  <img
                                    src={maleImage}
                                    alt="Male Avatar"
                                    className="w-10 h-10 rounded"
                                  />
                                ) : interviewer.gender === "Female" ? (
                                  <img
                                    src={femaleImage}
                                    alt="Female Avatar"
                                    className="w-10 h-10 rounded"
                                  />
                                ) : (
                                  <img
                                    src={genderlessImage}
                                    alt="Other Avatar"
                                    className="w-10 h-10 rounded"
                                  />
                                )}

                                <p className="bg-blue-400 text-white text-xs rounded px-2 mb-1">
                                  USD ${interviewer.price}
                                </p>
                                <p className="text-gray-400 mr-9 text-xs ">Skills</p>
                              </div>

                              {/* Right Section: Info and Skills Content */}
                              <div className="flex-1 text-xs mb-2">
                                <p className="font-bold text-blue-400 mb-1 relative group">
                                  {interviewer.name}
                                </p>

                                <p className="mb-1 relative group">
                                  {interviewer.CompanyName}
                                  <span className="absolute left-16 ml-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Company
                                  </span>
                                </p>

                                <p className="mb-1 relative group">
                                  {interviewer.currentRole}
                                  <span className="absolute left-28 ml-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Role
                                  </span>
                                </p>
                                <div className="mb-1">
                                  {interviewer.skills.map(skill => skill.skill).join(', ')}
                                </div>

                              </div>

                              {/* Toggle Arrow */}
                              <div
                                className="flex items-center text-2xl cursor-pointer"
                                onClick={() => toggleIntroduction(index)}
                              >
                                {expandedIndex === index ? <IoIosArrowUp /> : <IoIosArrowDown />}
                              </div>
                            </div>
                            <div className="text-xs">
                              {expandedIndex === index && (
                                <p className="text-gray-400">Introduction:</p>
                              )}
                              <p>
                                {expandedIndex === index && interviewer.introduction
                                  ? `${interviewer.introduction.substring(0, 350)}${interviewer.introduction.length > 350 ? '...' : ''}`
                                  : ''}
                              </p>
                            </div>
                          </div>

                          {/* Fixed Footer */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-end gap-4 p-2 bg-white ">
                            <button
                              className="border border-custom-blue py-1 px-2 bg-white rounded text-sm font-semibold hover:bg-blue-50"
                              onClick={() => handleViewClick(interviewer)}
                            >
                              View
                            </button>
                            {/* <button
                              onClick={() => handleSelectClick(interviewer)}
                              className={`border border-custom-blue py-1 px-2 bg-white rounded text-sm font-semibold ${selectedInterviewerIds.includes(interviewer._id)
                                ? "bg-red-50"
                                : "hover:bg-blue-50"
                                }`}
                            >
                              {selectedInterviewerIds.includes(interviewer._id) ? "Remove" : "Select"}
                            </button> */}

                            <button
                              onClick={() => handleSelectClick(interviewer)}
                               className={`border border-custom-blue py-1 px-2 bg-white rounded text-sm font-semibold ${selectedInterviewerIds.includes(interviewer._id)
                                ? "bg-red-50"
                                : "hover:bg-blue-50"
                                }`}
                            >
                              {selectedInterviewerIdsLocal.includes(interviewer._id) ? "Remove" : "Select"}
                            </button>

                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="footer-buttons flex justify-end gap-6">
                <button
                  type="button"
                  // onClick={() => {
                  //   const selectedInterviewers = currentFilteredRows
                  //     .filter(interviewer => selectedInterviewerIds.includes(interviewer._id))
                  //     .map(interviewer => ({ id: interviewer._id, name: interviewer.name }));

                  //   onProceed(selectedInterviewers);
                  //   onClose();
                  // }}
                  onClick={handleProceed}
                  className="footer-button bg-white text-black border border-custom-blue hover:bg-custom-blue hover:text-white"
                >
                  Proceed
                </button>

              </div>
            </div>
          </div>

          {/* Detailed View */}
          {selectedInterviewer && (
            <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
              <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-lg transition-transform duration-5000 transform overflow-y-auto">
                <div className="container mx-auto">
                  <div className="grid grid-cols-4 mx-5">
                    {/* Left side */}
                    <div className="col-span-1 my-5">
                      <div className="mx-3 border rounded-lg h-[525px] mb-5 flex flex-col items-center">
                        <div className="mt-16">
                          {/* <img
                            src={selectedInterviewer.image}
                            alt="Candidate"
                            className="w-32 h-32 rounded"
                          /> */}
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
                        </div>
                        <div className="text-center mt-3">
                          <h2 className="text-lg font-bold">{selectedInterviewer.name}</h2>
                          <img
                            src={StarRating}
                            alt="5 stars"
                            className="w-24 h-10 -mt-1 mx-auto"
                          />
                          <p className="bg-blue-400 text-white py-1 px-2 w-[82px] rounded mx-auto">
                            USD ${selectedInterviewer.price}
                          </p>
                          <p>{selectedInterviewer.company}</p>
                          <p>{selectedInterviewer.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="col-span-3 my-5">
                      <div className="flex justify-between sm:justify-start items-center">
                        <p className="text-2xl">
                          <span
                            className="text-custom-blue font-semibold cursor-pointer"
                            onClick={onCloseview}
                          >
                            {selectedInterviewer.name}
                          </span>
                        </p>
                        <button
                          type="submit"
                          className="footer-button bg-custom-blue mb-2"
                        >
                          Send Request
                        </button>
                      </div>
                      <div className="border p-4 rounded-md">
                        <h3 className="text-lg font-bold mb-2">Interviewer Details:</h3>
                        <div className="flex mb-5">
                          <div className="flex w-1/4">
                            <p className="font-medium text-gray-600">Name</p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p className="text-gray-500">{selectedInterviewer.name}</p>
                          </div>
                          <div className="flex w-1/4">
                            <p className="font-medium text-gray-600">Company Name</p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p className="text-gray-500">{selectedInterviewer.CompanyName}</p>
                          </div>
                        </div>
                        <div className="flex mb-5">
                          <div className="flex w-1/4">
                            <p className="font-medium text-gray-600">Role</p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p className="text-gray-500">{selectedInterviewer.currentRole}</p>
                          </div>
                        </div>
                        <div className="flex mb-5">
                          <div className="flex w-1/4">
                            <p className="font-medium text-gray-600">Skills</p>
                          </div>
                          <div className="w-1/4 sm:w-1/2">
                            <p className="text-gray-500">{selectedInterviewer.skills.map(skill => skill.skill).join(', ')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border p-4 rounded-md mt-4">
                        <h3 className="text-lg font-bold mb-2 ">Introduction:</h3>
                        <p className="text-gray-500">
                          {selectedInterviewer.introduction}
                        </p>
                      </div>
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

export default OutsourceOption;
