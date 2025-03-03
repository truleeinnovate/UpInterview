import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie';
import { usePermissions } from '../../../../Context/PermissionsContext.js';
import Tooltip from "@mui/material/Tooltip";
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { fetchMasterData } from '../../../../utils/fetchMasterData.js';
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';

import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as LuFilterX } from '../../../../icons/LuFilterX.svg';
import axios from 'axios';

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
        onFilterChange({ status: [], tech: [] });
    };
    useEffect(() => {
        if (!isStatusMainChecked) setSelectedStatusOptions([]);
        if (!isTechMainChecked) setSelectedTechOptions([]);
    }, [isStatusMainChecked, isTechMainChecked]);
    const handleStatusMainToggle = () => {
        const newStatusMainChecked = !isStatusMainChecked;
        setStatusMainChecked(newStatusMainChecked);
        const newSelectedStatus = newStatusMainChecked ? qualification.map(q => q.TechnologyMasterName) : [];
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
                const technologyData = await fetchMasterData('technology');
                setQualification(technologyData);
            } catch (error) {
                console.error('Error fetching master data:', error);
            }
        };
        fetchData();
    }, []);

    const Apply = () => {
        onFilterChange({
            status: selectedStatusOptions,
            tech: selectedTechOptions,
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
                        {(isAnyOptionSelected) && (
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
                                <span className="ml-3 font-bold">Technology</span>
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
                                        checked={selectedStatusOptions.includes(option.TechnologyMasterName)}
                                        onChange={() => handleStatusOptionToggle(option.TechnologyMasterName)}
                                    />
                                    <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.TechnologyMasterName}</span>
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
                                    <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option.SkillName}</span>
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

const InternalRequest = () => {
    const { objectPermissionscontext } = usePermissions();
    const objectPermissions = useMemo(() => objectPermissionscontext.team || {}, [objectPermissionscontext]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const toggleLookup = () => {
    //     setSidebarOpen(true);
    // };

    const [teamsData, setTeamsData] = useState('');

    console.log('teamsDatafdgjf :', teamsData)
    const [loading, setLoading] = useState('');

    const fetchInterviewRequests = useCallback(async () => {
        const ownerId = Cookies.get("userId");
        const tenantId = Cookies.get("organizationId");
        const OrgId = Cookies.get("organization");

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviewrequest`);
            let filteredRequests = [];

            if (OrgId === "true") {
                filteredRequests = response.data.filter(request =>
                    request.ownerId === ownerId && request.tenantId === tenantId
                );
            } else {
                filteredRequests = response.data.filter(request =>
                    request.interviewerIds.includes(ownerId)
                );
            }

            setTeamsData(filteredRequests);
            console.log("Filtered Interview Requests:", filteredRequests);
        } catch (error) {
            console.error("Error fetching interview requests:", error);
        }
    }, []);

    useEffect(() => {
        fetchInterviewRequests();
    }, [fetchInterviewRequests]);

    const [viewMode, setViewMode] = useState("list");
    const handleListViewClick = () => {
        setViewMode("list");
    };

    const handleKanbanViewClick = () => {
        setViewMode("kanban");
    };

    const [selectedFilters, setSelectedFilters] = useState({
        status: [],
        tech: [],
    });

    const handleFilterChange = (filters) => {
        setSelectedFilters(filters);
    };

    const FilteredData = () => {
        if (!Array.isArray(teamsData)) {
            return [];
        }

        const filteredData = teamsData.filter((user) => {
            const fieldsToSearch = [
                user.contactId?.name,
                user.contactId?.email,
                user.contactId?.phone,
            ].filter(field => field !== null && field !== undefined);

            const matchesSearchQuery = fieldsToSearch.some(
                (field) =>
                    field &&
                    field.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );

            const matchesStatus =
                selectedFilters.status.length === 0 ||
                selectedFilters.status.includes(user.contactId?.technology?.[0]);

            const matchesTech =
                selectedFilters.tech.length === 0 ||
                user.contactId?.skills?.some(skill =>
                    selectedFilters.tech.includes(skill.skill)
                );

            return matchesSearchQuery && matchesStatus && matchesTech;
        });

        return filteredData;
    };
    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            setActiveArrow("next");
        }
    };
    const rowsPerPage = 10;

    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    const [isFilterActive, setIsFilterActive] = useState(false);

    const handleFilterIconClick = () => {
        if (teamsData.length !== 0) {
            setIsFilterActive((prev) => !prev);
            toggleMenu();
        }
    };
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

    useEffect(() => {
        setCurrentPage(0);
    }, [selectedFilters]);

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

    const [activeArrow, setActiveArrow] = useState(null);

    const [tableVisible] = useState(true);

    const Organization = Cookies.get('organization');

    const [actionViewMore, setActionViewMore] = useState(null);

    const handleStatusUpdate = async (id, newStatus, currentStatus) => {
        if (currentStatus !== 'inprogress') {
            console.log("Status can only be updated if it's 'inprogress'");
            return;
        }

        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/interviewrequest/${id}`, { status: newStatus });
            console.log(`Request ${newStatus} successfully!`);
            window.location.reload();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const toggleActionMenu = (id) => {
        setActionViewMore(prevId => (prevId === id ? null : id));
    };

    return (
        <React.Fragment>
            <div className="fixed top-16 sm:top-20 md:top-24 left-0 right-0">
                <div className="flex justify-between p-4">
                    <div>
                        <span className="text-lg font-semibold">Interview Requests</span>
                    </div>
                </div>
            </div>
            <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0">
                <div className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between md:float-end sm:float-end p-4 ">
                    <div className="flex items-center sm:hidden md:hidden">
                        <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                            <span onClick={handleListViewClick}>
                                <FaList className={`text-xl mr-4 ${viewMode === "list" ? "text-custom-blue" : ""}`} />
                            </span>
                        </Tooltip>
                        <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                            <span onClick={handleKanbanViewClick}>
                                <TbLayoutGridRemove className={`text-xl ${viewMode === "kanban" ? "text-custom-blue" : ""}`} />
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
                                    placeholder="Search by Name, Email, Phone."
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
                                    className={`border p-2 mr-2 text-xl sm:text-md md:text-md ${currentPage === 0 ? "cursor-not-allowed" : ""} ${activeArrow === "prev" ? "text-custom-blue" : ""}`}
                                    onClick={prevPage}
                                    disabled={currentPage === 0}
                                >
                                    <IoIosArrowBack className="text-custom-blue" />
                                </span>
                            </Tooltip>

                            <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                                <span
                                    className={`border p-2 text-xl sm:text-md md:text-md ${currentPage === totalPages - 1 ? "cursor-not-allowed" : ""} ${activeArrow === "next" ? "text-custom-blue" : ""}`}
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages - 1}
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
                                        opacity: teamsData.length === 0 ? 0.2 : 1,
                                        pointerEvents: teamsData.length === 0 ? "none" : "auto",
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
                            <div className="sm:hidden md:hidden lg:flex xl:flex 2xl:flex">
                                <div
                                    className="flex-grow"
                                    style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                                >
                                    <div className="relative h-[calc(100vh-200px)] flex flex-col">
                                        <div className="flex-grow overflow-y-auto pb-4">
                                            <table className="text-left w-full border-collapse border-gray-300 mb-14">
                                                <thead className="bg-custom-bg  sticky top-0 z-10 text-xs">
                                                    <tr>
                                                        {Organization === 'false' ? (
                                                            <>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Position
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Skill set
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Date & Time
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Duration
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Status
                                                                </th>
                                                                <th scope="col" className="py-3 pl-10">
                                                                    Actions
                                                                </th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Interview Id
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Interviewer Type
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Interviewer Name
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Position
                                                                </th>
                                                                <th scope="col" className="py-3 px-6">
                                                                    Status
                                                                </th>
                                                                <th scope="col" className="py-3 pl-10">
                                                                    Requested At
                                                                </th>
                                                                <th scope="col" className="py-3 pl-10">
                                                                    Responded At
                                                                </th>
                                                                <th scope="col" className="py-3 pl-10">
                                                                    Action
                                                                </th>
                                                            </>
                                                        )}
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
                                                    ) : teamsData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="py-10 text-center">
                                                                <div className="flex flex-col items-center justify-center p-5">
                                                                    <p className="text-9xl rotate-180 text-custom-blue"></p>
                                                                    <p className="text-center text-lg font-normal">
                                                                        You don't have team yet. Create new team.
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        teamsData.map((teams) => (
                                                            <tr key={teams._id} className="bg-white border-b cursor-pointer text-xs">

                                                                {Organization === 'false' ? (
                                                                    <>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.positionId?.title}
                                                                            {/* {teams.positionId} */}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.candidateId.skills.map(eachSkill=> eachSkill.skill).join(" ")}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.dateTime}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.duration}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.status}
                                                                        </td>
                                                                        <td className="py-2 px-6 relative">
                                                                            <button onClick={() => toggleActionMenu(teams._id)}>
                                                                                <FiMoreHorizontal className="text-3xl" />
                                                                            </button>

                                                                            {actionViewMore === teams._id && (
                                                                                <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                                                                    <p
                                                                                        className="hover:bg-green-200 p-1 rounded pl-3 cursor-pointer"
                                                                                        onClick={() => handleStatusUpdate(teams._id, 'accepted', teams.status)}
                                                                                    >
                                                                                        Accept
                                                                                    </p>
                                                                                    <p
                                                                                        className="hover:bg-red-200 p-1 rounded pl-3 cursor-pointer"
                                                                                        onClick={() => handleStatusUpdate(teams._id, 'declined', teams.status)}
                                                                                    >
                                                                                        Decline
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="py-2 px-6">{teams.scheduledInterviewId}</td>
                                                                        <td className="py-2 px-6">{teams.interviewerType}</td>
                                                                        <td className="py-2 px-6">
                                                                            {teams.interviewerIds.map((interviewer) => (
                                                                                <div key={interviewer._id}>
                                                                                    {interviewer.name}
                                                                                </div>
                                                                            ))}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.positionId?.title}
                                                                        </td>
                                                                        <td className='py-2 px-6'>
                                                                            {teams.status}
                                                                        </td>
                                                                        <td className="py-2 px-6">
                                                                            {new Date(teams.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                            {' '}
                                                                            {new Date(teams.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                        </td>
                                                                        <td className='py-2 px-6'>

                                                                        </td>
                                                                        <td className="py-2 px-6">
                                                                            <div>
                                                                                <button
                                                                                //   onClick={() =>
                                                                                //     toggleAction(interview._id)
                                                                                //   }
                                                                                >
                                                                                    <FiMoreHorizontal className="text-3xl" />
                                                                                </button>
                                                                                {/* {actionViewMore === interview._id && (
                                          <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                                            <div className="space-y-1">
                                              {objectPermissions.View && (
                                                <p
                                                  className="hover:bg-gray-200 p-1 rounded pl-3"
                                                  onClick={() =>
                                                    handleInterviewClick(
                                                      interview._id
                                                    )
                                                  }
                                                >
                                                  View
                                                </p>
                                              )}

                                              {interview.ScheduleType !==
                                                "instantinterview" && (
                                                  <>
                                                    {objectPermissions.Edit && (
                                                      <p
                                                        className="hover:bg-gray-200 p-1 rounded pl-3"
                                                        onClick={() =>
                                                          handleEditClick(interview)
                                                        }
                                                      >
                                                        Reschedule
                                                      </p>
                                                    )}
                                                    <p
                                                      className="hover:bg-gray-200 p-1 rounded pl-3"
                                                      onClick={() =>
                                                        handleUpdate(
                                                          interview._id,
                                                          interview.ScheduleType
                                                        )
                                                      }
                                                    >
                                                      Cancel
                                                    </p>
                                                  </>
                                                )}
                                            </div>
                                          </div>
                                        )} */}
                                                                            </div>
                                                                        </td>
                                                                    </>
                                                                )}

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
                                    onFilterChange={handleFilterChange}
                                />
                            </div>
                        ) : (
                            <div className="flex">
                                <div
                                    className="flex-grow"
                                    style={{ marginRight: isMenuOpen ? "290px" : "0" }}
                                >
                                    <div className="flex-grow h-[calc(100vh-200px)] overflow-y-auto pb-10 right-0 sm:mt-10 md:mt-10">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 px-4">
                                        </div>
                                    </div>
                                </div>
                                <OffcanvasMenu
                                    isOpen={isMenuOpen}
                                    closeOffcanvas={handleFilterIconClick}
                                    onFilterChange={handleFilterChange}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </React.Fragment>
        
    )
}

export default InternalRequest