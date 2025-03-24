import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import maleImage from "../../../Dashboard-Part/Images/man.png";
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import Tooltip from "@mui/material/Tooltip";
import InterviewerDetails from '../Outsource-Interviewer-Admin/InterviewerDetails.jsx'
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { ReactComponent as CgInfo } from '../../../../icons/CgInfo.svg';

const OffcanvasMenu = ({ isOpen, onFilterChange, closeOffcanvas }) => {
  const {
    skills,
  } = useCustomContext();
  const [isTechDropdownOpen, setTechDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isTechMainChecked, setTechMainChecked] = useState(false);
  const [selectedTechOptions, setSelectedTechOptions] = useState([]);
  const isAnyOptionSelected = selectedTechOptions.length > 0;
  const handleUnselectAll = () => {
    setSelectedTechOptions([]);
    setStatusMainChecked(false);
    setTechMainChecked(false);
    setMinExperience('');
    setMaxExperience('');
    onFilterChange({ tech: [], experience: { min: '', max: '' } });
  };
  useEffect(() => {
    if (!isTechMainChecked) setSelectedTechOptions([]);
  }, [isStatusMainChecked, isTechMainChecked]);

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

const OutsourceInterviewers = () => {
  const {
    interviewers,
    loading,
  } = useCustomContext();

  console.log('interviewers data :', interviewers)

  const [searchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const [activeArrow, setActiveArrow] = useState(null);

  const [filters] = useState({
    skills: [],
    experience: [],
    'Price/Hour': [],
    status: []
  });

  const [selectedInterviewer, setSelectedInterviewer] = useState(null);

  const handleNameClick = (interviewer) => {
    setSelectedInterviewer(interviewer);
  };

  const filteredInterviewers = interviewers.filter(interviewer => {
    const matchesSearch = (interviewer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Apply filters
    const matchesSkills = filters.skills.length === 0 ||
      filters.skills.includes(interviewer?.skills || '');

    const experience = interviewer?.experience || '0 Year';
    const matchesExperience = filters.experience.length === 0 ||
      filters.experience.some(range => {
        const years = parseInt(experience.split(' ')[0], 10) || 0;
        if (range === '0 Year') return years === 0;
        if (range === '10+ Years') return years >= 10;
        const rangeYears = parseInt(range.split(' ')[0], 10);
        return years === rangeYears;
      });

    // Price per hour filter
    const price = parseInt(interviewer?.pricePerHour?.replace(/\D/g, '') || 0);
    const matchesPricePerHour = filters['Price/Hour'].length === 0 ||
      filters['Price/Hour'].some(range => {
        if (range === '$0-$20') return price <= 20;
        if (range === '$21-$40') return price > 20 && price <= 40;
        if (range === '$41-$60') return price > 40 && price <= 60;
        if (range === '$61-$80') return price > 60 && price <= 80;
        if (range === '$81-$100') return price > 80 && price <= 100;
        return price > 100;
      });

    // Status filter
    const matchesStatus = filters.status.length === 0 ||
      filters.status.includes(interviewer?.statusText || '');

    return matchesSearch && matchesSkills && matchesExperience && matchesPricePerHour && matchesStatus;
  });

  const [tableVisible] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const FilteredData = () => {
    if (!Array.isArray(interviewers)) {
      console.log("Interviewers is not an array", interviewers);
      return [];
    }
    return interviewers.filter((user) => {
      const contact = user.contactId || {};
      const fieldsToSearch = [
        contact.Name,
      ].filter((field) => field !== null && field !== undefined);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesSearchQuery;
    });
  };
  const totalPages = Math.ceil(filteredInterviewers.length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);
  const handleListViewClick = () => {
    setViewMode("list");
  };
  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setActiveArrow("prev");
    }
  };
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setActiveArrow("next");
    }
  };
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  const handleFilterIconClick = () => {
    if (interviewers.length !== 0) {
      setIsFilterActive((prev) => !prev);
      toggleMenu();
    }
  };

  return (
    <>
      {!selectedInterviewer ? (
        <section>
          <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">Outsource Interviewers</span>
              </div>
            </div>
          </div>
          <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
            <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList
                      className={`text-xl mr-4 ${viewMode === "list" ? "text-custom-blue" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleKanbanViewClick}>
                    <TbLayoutGridRemove
                      className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""
                        }`}
                    />
                  </span>
                </Tooltip>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <div className="searchintabs border rounded-md relative">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button type="submit" className="p-2">
                        <IoMdSearch className="text-custom-blue" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Title, Company Name."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="rounded-full border h-8"
                    />
                  </div>
                </div>
                <div>
                  <span className="p-2 text-xl sm:text-sm md:text-sm">
                    {currentPage + 1}/{totalPages}
                  </span>
                </div>
                <div className="flex">
                  <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md  rounded-md ${currentPage === 0 ? " cursor-not-allowed" : ""
                        } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                      onClick={prevPage}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>

                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md  rounded-md ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""
                        } ${activeArrow === "next" ? "text-blue-500" : ""}`}
                      onClick={nextPage}
                    >
                      <IoIosArrowForward className="text-custom-blue" />

                    </span>
                  </Tooltip>
                </div>
                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                  <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      onClick={handleFilterIconClick}
                      style={{
                        opacity: interviewers.length === 0 ? 0.2 : 1,
                        pointerEvents: interviewers.length === 0 ? "none" : "auto",
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
          <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
            {tableVisible && (
              <div>
                {viewMode === "list" ? (
                  // list view
                  <div className="sm:hidden md:hidden lg:flex xl:flex 2xl:flex">
                    <div
                      className="flex-grow"
                      style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                    >
                      <div className="relative h-[calc(100vh-200px)] flex flex-col">
                        <div className="flex-grow overflow-y-auto pb-4">
                          <table className="text-left w-full border-collapse border-gray-300 mb-14">
                            <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
                              <tr>
                                <th scope="col" className="py-3 px-6">
                                  Name
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Skills
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Experience
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Rating
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Price/Hour
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Status
                                </th>
                                <th scope="col" className="py-3 px-6">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
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
                              ) : interviewers.length === 0 ? (
                                <tr>
                                  <td colSpan="8" className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center p-5">
                                      <p className="text-9xl rotate-180 text-blue-500">
                                        <CgInfo />
                                      </p>
                                      <p className="text-center text-lg font-normal">
                                        You don't have interviewer yet. Create new
                                        interviewer.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ) : currentFilteredRows.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-10 text-center">
                                    <p className="text-lg font-normal">
                                      No data found.
                                    </p>
                                  </td>
                                </tr>
                              ) : (
                                currentFilteredRows.map((interviewer) => (
                                  <tr key={interviewer._id} className="bg-white border-b cursor-pointer text-xs">
                                    <td className="py-2 px-6">
                                      <div className="flex items-center gap-3" onClick={() => handleNameClick(interviewer)}>
                                        <img
                                          src={interviewer.image || maleImage}
                                          alt={interviewer.Name}
                                          className="w-7 h-7 rounded-full"
                                          onError={(e) => {
                                            e.target.src = maleImage;
                                          }}
                                        />
                                        <span className="text-custom-blue">
                                          {interviewer?.contactId?.Name}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Skills */}
                                    <td className="py-2 px-6">
                                      {interviewer?.contactId?.Skills?.length ? interviewer?.contactId?.Skills.join(", ") : "N/A"}
                                    </td>
                                    <td className="py-2 px-6">{interviewer?.contactId?.Experience}</td>
                                    <td className="py-2 px-6">{interviewer.rating}</td>
                                    <td className="py-2 px-6">{interviewer.pricePerHour}</td>
                                    <td className="py-2 px-6">{interviewer.status}</td>
                                    <td className="py-2 px-6">
                                      <button className="text-gray-700 hover:text-gray-600">
                                        <BsThreeDotsVertical />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}

                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <OffcanvasMenu
                      isOpen={isMenuOpen}
                      closeOffcanvas={handleFilterIconClick}
                    />
                  </div>
                ) : (
                  // kanban view
                  <div className="flex">
                    <div className={`flex-grow transition-all duration-300 ${isMenuOpen ? 'lg:mr-[18rem]' : 'mr-0'}`}>
                      <div className="h-[calc(100vh-200px)] overflow-y-auto pb-10">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 px-4">
                          {loading ? (
                            <div className="py-10 text-center">Loading...</div>
                          ) : currentFilteredRows.length === 0 ? (
                            <div className="col-span-3 py-10 text-center">No data found.</div>
                          ) : (
                            currentFilteredRows.map((interviewer) => (
                              <div key={interviewer._id} className="bg-white border shadow-md p-2 rounded">
                                <div className="relative">
                                  <div className="float-right">
                                    <button className="text-gray-700 hover:text-gray-600">
                                      <BsThreeDotsVertical />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex">
                                  <img
                                    src={interviewer.image || maleImage}
                                    alt="Interviewer"
                                    className="w-16 h-16 rounded-full object-cover"
                                  />
                                  <div className="flex flex-col ml-3">
                                    <div className="text-custom-blue text-lg">
                                      {interviewer?.contactId?.Name}
                                    </div>
                                    <div className="text-xs grid grid-cols-2 gap-2">
                                      <div className="text-gray-400">Skills</div>
                                      <div className='ml-5'>{interviewer?.contactId?.Skills?.join(", ") || "N/A"}</div>
                                      <div className="text-gray-400">Experience</div>
                                      <div className='ml-5'>{interviewer?.contactId?.Experience}</div>
                                      <div className="text-gray-400">Rating</div>
                                      <div className='ml-5'>{interviewer.rating}</div>
                                      <div className="text-gray-400">Price/Hour</div>
                                      <div className='ml-5'>{interviewer.pricePerHour}</div>
                                      <div className="text-gray-400">Status</div>
                                      <div className='ml-5'>{interviewer.status}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <OffcanvasMenu isOpen={isMenuOpen} closeOffcanvas={handleFilterIconClick} />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <InterviewerDetails
            selectedInterviewersData={selectedInterviewer}
            onClose={() => setSelectedInterviewer(null)}
          />
        </>
      )}
    </>
  );
};

export default OutsourceInterviewers;