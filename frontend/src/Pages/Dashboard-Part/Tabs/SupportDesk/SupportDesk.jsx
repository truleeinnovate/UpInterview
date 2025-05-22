/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaSearch, FaList } from 'react-icons/fa';
import { TbLayoutGridRemove } from 'react-icons/tb';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { FiFilter } from 'react-icons/fi';
import { LuFilterX } from 'react-icons/lu';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import TableView from './TableView';
import KanbanView from './KanbanView';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';

const OffcanvasMenu = ({ userRole, isOpen, onFilterChange, closeOffcanvas, currentUserId }) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [isIssueTypeDropdownOpen, setIssueTypeDropdownOpen] = useState(false);
  const [isStatusMainChecked, setStatusMainChecked] = useState(false);
  const [isPriorityMainChecked, setPriorityMainChecked] = useState(false);
  const [isIssueTypeMainChecked, setIssueTypeMainChecked] = useState(false);
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [selectedPriorityOptions, setSelectedPriorityOptions] = useState([]);
  const [isAssignmentDropdownOpen, setAssignmentDropdownOpen] = useState(false);
  const [isAssignmentMainChecked, setAssignmentMainChecked] = useState(false);
  const [selectedAssignmentOptions, setSelectedAssignmentOptions] = useState(['all']);
  const [selectedIssueTypeOptions, setSelectedIssueTypeOptions] = useState([]);

  const isAnyOptionSelected =
    selectedStatusOptions.length > 0 ||
    selectedPriorityOptions.length > 0 ||
    selectedIssueTypeOptions.length > 0 ||
    selectedAssignmentOptions.length > 0;

  const statusOptions = ['New', 'Assigned', 'Inprogress', 'Resolved', 'Close'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const issueTypeOptions = ['Payment', 'Technical', 'Account', 'Other'];

  const handleUnselectAll = () => {
    setSelectedStatusOptions([]);
    setSelectedPriorityOptions([]);
    setSelectedIssueTypeOptions([]);
    setSelectedAssignmentOptions([]);
    setStatusMainChecked(false);
    setPriorityMainChecked(false);
    setIssueTypeMainChecked(false);
    setAssignmentMainChecked(false);
    onFilterChange({ status: [], priority: [], issueType: [], selectedAssignmentOptions: [] });
  };

  useEffect(() => {
    if (!isStatusMainChecked) setSelectedStatusOptions([]);
    if (!isPriorityMainChecked) setSelectedPriorityOptions([]);
    if (!isAssignmentMainChecked) setSelectedAssignmentOptions([]);
    if (!isIssueTypeMainChecked) setSelectedIssueTypeOptions([]);
  }, [isStatusMainChecked, isPriorityMainChecked, isAssignmentMainChecked, isIssueTypeMainChecked]);

  const handleStatusMainToggle = () => {
    const newStatusMainChecked = !isStatusMainChecked;
    setStatusMainChecked(newStatusMainChecked);
    const newSelectedStatus = newStatusMainChecked ? statusOptions : [];
    setSelectedStatusOptions(newSelectedStatus);
  };

  const handlePriorityMainToggle = () => {
    const newPriorityMainChecked = !isPriorityMainChecked;
    setPriorityMainChecked(newPriorityMainChecked);
    const newSelectedPriority = newPriorityMainChecked ? priorityOptions : [];
    setSelectedPriorityOptions(newSelectedPriority);
  };

  const handleIssueTypeMainToggle = () => {
    const newIssueTypeMainChecked = !isIssueTypeMainChecked;
    setIssueTypeMainChecked(newIssueTypeMainChecked);
    const newSelectedIssueType = newIssueTypeMainChecked ? issueTypeOptions : [];
    setSelectedIssueTypeOptions(newSelectedIssueType);
  };

  const handleStatusOptionToggle = (option) => {
    const selectedIndex = selectedStatusOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedStatusOptions, option]
        : selectedStatusOptions.filter((_, index) => index !== selectedIndex);
    setSelectedStatusOptions(updatedOptions);
  };

  const handlePriorityOptionToggle = (option) => {
    const selectedIndex = selectedPriorityOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedPriorityOptions, option]
        : selectedPriorityOptions.filter((_, index) => index !== selectedIndex);
    setSelectedPriorityOptions(updatedOptions);
  };

  const handleIssueTypeOptionToggle = (option) => {
    const selectedIndex = selectedIssueTypeOptions.indexOf(option);
    const updatedOptions =
      selectedIndex === -1
        ? [...selectedIssueTypeOptions, option]
        : selectedIssueTypeOptions.filter((_, index) => index !== selectedIndex);
    setSelectedIssueTypeOptions(updatedOptions);
  };

  const handleAssignmentMainToggle = () => {
    const newAssignmentMainChecked = !isAssignmentMainChecked;
    setAssignmentMainChecked(newAssignmentMainChecked);
    if (newAssignmentMainChecked) {
      setSelectedAssignmentOptions(['all', currentUserId]);
    } else {
      setSelectedAssignmentOptions([]);
    }
  };

  const handleAssignmentOptionToggle = (option) => {
    let updatedOptions;
    if (option === 'all') {
      if (selectedAssignmentOptions.includes('all')) {
        updatedOptions = selectedAssignmentOptions.filter((item) => item !== 'all');
        if (selectedAssignmentOptions.includes(currentUserId)) {
          updatedOptions.push(currentUserId);
        }
      } else {
        updatedOptions = ['all'];
      }
    } else if (option === currentUserId) {
      if (selectedAssignmentOptions.includes(currentUserId)) {
        updatedOptions = selectedAssignmentOptions.filter((item) => item !== currentUserId);
        if (selectedAssignmentOptions.includes('all')) {
          updatedOptions.push('all');
        }
      } else {
        updatedOptions = [currentUserId];
      }
    } else {
      updatedOptions = [...selectedAssignmentOptions];
    }
    setSelectedAssignmentOptions(updatedOptions);
  };

  const Apply = () => {
    const filters = {
      status: selectedStatusOptions,
      priority: selectedPriorityOptions,
      issueType: selectedIssueTypeOptions,
      selectedAssignmentOptions: selectedAssignmentOptions,
    };
    onFilterChange(filters);
    if (window.innerWidth < 1023) {
      closeOffcanvas();
    }
  };

  return (
    <div
      className="absolute w-72 sm:mt-5 md:w-full sm:w-full text-sm bg-white border right-0 z-30 h-[calc(100vh-9rem)]"
      style={{
        visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen ? '' : 'translateX(50%)',
      }}
    >
      <div className="relative h-full flex flex-col">
        <div className="absolute w-72 sm:w-full md:w-full border-b flex justify-between p-2 items-center bg-white z-10">
          <div>
            <h2 className="text-lg font-bold">Filters</h2>
          </div>
          {isAnyOptionSelected && (
            <div>
              <button onClick={handleUnselectAll} className="font-bold text-md">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex-grow overflow-y-auto mb-20 mt-10">
          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isStatusMainChecked}
                  onChange={handleStatusMainToggle}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-3 font-bold">Status</span>
              </div>
              <div>
                {isStatusDropdownOpen ? (
                  <MdKeyboardArrowUp className="text-xl" />
                ) : (
                  <MdKeyboardArrowDown className="text-xl" />
                )}
              </div>
            </div>
            {isStatusDropdownOpen && (
              <div className="ml-6 mt-2">
                {statusOptions.map((option) => (
                  <div key={option} className="flex items-center mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        checked={selectedStatusOptions.includes(option)}
                        onChange={() => handleStatusOptionToggle(option)}
                      />
                      <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(userRole === 'SuperAdmin' || userRole === 'Support Team') && (
            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPriorityDropdownOpen(!isPriorityDropdownOpen)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPriorityMainChecked}
                    onChange={handlePriorityMainToggle}
                    className="form-checkbox h-4 w-4"
                  />
                  <span className="ml-3 font-bold">Priority</span>
                </div>
                <div>
                  {isPriorityDropdownOpen ? (
                    <MdKeyboardArrowUp className="text-xl" />
                  ) : (
                    <MdKeyboardArrowDown className="text-xl" />
                  )}
                </div>
              </div>
              {isPriorityDropdownOpen && (
                <div className="ml-6 mt-2">
                  {priorityOptions.map((option) => (
                    <div key={option} className="flex items-center mb-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4"
                          checked={selectedPriorityOptions.includes(option)}
                          onChange={() => handlePriorityOptionToggle(option)}
                        />
                        <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(userRole === 'SuperAdmin' || userRole === 'Support Team') && (
            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setAssignmentDropdownOpen(!isAssignmentDropdownOpen)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="assignment-main"
                    checked={isAssignmentMainChecked}
                    onChange={handleAssignmentMainToggle}
                    className="form-checkbox h-4 w-4"
                  />
                  <span className="ml-3 font-bold">Assigned To</span>
                </div>
                <div>
                  {isAssignmentDropdownOpen ? (
                    <MdKeyboardArrowUp className="text-xl" />
                  ) : (
                    <MdKeyboardArrowDown className="text-xl" />
                  )}
                </div>
              </div>
              {isAssignmentDropdownOpen && (
                <div className="ml-6 mt-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="assigned-all"
                      checked={selectedAssignmentOptions.includes('all')}
                      onChange={() => handleAssignmentOptionToggle('all')}
                      className="form-checkbox h-4 w-4"
                    />
                    <label htmlFor="assigned-all" className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                      Assigned To All
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="assigned-me"
                      checked={selectedAssignmentOptions.includes(currentUserId)}
                      onChange={() => handleAssignmentOptionToggle(currentUserId)}
                      className="form-checkbox h-4 w-4"
                    />
                    <label htmlFor="assigned-me" className="ml-3 w-56 md:w-72 sm:w-72 text-xs">
                      Assigned To Me
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIssueTypeDropdownOpen(!isIssueTypeDropdownOpen)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isIssueTypeMainChecked}
                  onChange={handleIssueTypeMainToggle}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-3 font-bold">Issue Type</span>
              </div>
              <div>
                {isIssueTypeDropdownOpen ? (
                  <MdKeyboardArrowUp className="text-xl" />
                ) : (
                  <MdKeyboardArrowDown className="text-xl" />
                )}
              </div>
            </div>
            {isIssueTypeDropdownOpen && (
              <div className="ml-6 mt-2">
                {issueTypeOptions.map((option) => (
                  <div key={option} className="flex items-center mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        checked={selectedIssueTypeOptions.includes(option)}
                        onChange={() => handleIssueTypeOptionToggle(option)}
                      />
                      <span className="ml-3 w-56 md:w-72 sm:w-72 text-xs">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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

function SupportDesk() {
    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const currentUserId = tokenPayload?.userId;
    const currentOrganizationId = tokenPayload?.tenantId;

  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    issueType: [],
    status: [],
    priority: [],
    selectedAssignmentOptions: ['all'],
  });
  const [viewMode, setViewMode] = useState('list');
  const [actionViewMore, setActionViewMore] = useState(null);
  const [activeArrow, setActiveArrow] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState('Admin');//SuperAdmin

  const handleMoreClick = useCallback((ticketId) => {
    setActionViewMore((prev) => (prev === ticketId ? null : ticketId));
  }, []);

  const getTickets = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/get-tickets`;
      const response = await axios.get(url);

      if (userRole === 'SuperAdmin' || userRole === 'Support Team') {
        setTickets(response.data.tickets);
      } else if (userRole === 'Admin' && currentOrganizationId) {
        const filteredTickets = response.data.tickets.filter((ticket) => ticket.owner === currentOrganizationId);
        setTickets(filteredTickets);
      } else if (currentUserId) {
        const filteredTickets = response.data.tickets.filter((ticket) => ticket.assignedToId === currentUserId);
        setTickets(filteredTickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, userRole, currentOrganizationId]);

  useEffect(() => {
    getTickets();
  }, [getTickets]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('kanban');
      } else {
        setViewMode('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => !prev);
    setIsFilterActive((prev) => !prev);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleListViewClick = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleKanbanViewClick = useCallback(() => {
    setViewMode('kanban');
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketId = ticket._id?.slice(-5, -1)?.toLowerCase() || '';
      const searchMatch =
        searchTerm === '' ||
        ticketId.includes(searchTerm.toLowerCase()) ||
        (ticket.contact?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const issueTypeMatch = filters.issueType.length === 0 || filters.issueType.includes(ticket.issueType);
      const statusMatch = filters.status.length === 0 || filters.status.includes(ticket.status);
      const priorityMatch = filters.priority.length === 0 || filters.priority.includes(ticket.priority);

      let assignmentMatch = true;
      if (userRole === 'SuperAdmin' || userRole === 'Support Team') {
        if (filters.selectedAssignmentOptions.length === 0 || filters.selectedAssignmentOptions.includes('all')) {
          assignmentMatch = true;
        } else if (filters.selectedAssignmentOptions.includes(currentUserId)) {
          assignmentMatch = ticket.assignedToId === currentUserId;
        }
      }
      return searchMatch && issueTypeMatch && statusMatch && priorityMatch && assignmentMatch;
    });
  }, [tickets, searchTerm, filters, userRole, currentUserId]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredTickets.length / itemsPerPage), [filteredTickets.length, itemsPerPage]);

  const onClickLeftArrow = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setActiveArrow('prev');
      setTimeout(() => setActiveArrow(null), 300);
    }
  }, [currentPage]);

  const onClickRightArrow = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      setActiveArrow('next');
      setTimeout(() => setActiveArrow(null), 300);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed top-16 left-0 right-0 bg-background z-10">
        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-8 2xl:px-8">
          <div className="sm:px-0">
            <motion.div
              className="flex justify-between items-center py-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-semibold text-custom-blue">Support Desk</h1>
              {userRole === 'Admin' && (
                <button
                  onClick={() => navigate('/support-desk/new-ticket')}
                  className="flex items-center justify-center bg-custom-blue hover:bg-custom-blue/90 text-white text-sm font-medium rounded-md px-3 py-2"
                >
                  <span className="mr-2">Create Ticket</span>
                </button>
              )}
            </motion.div>
            <motion.div
              className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleListViewClick}>
                    <FaList className={`text-xl mr-4 ${viewMode === 'list' ? 'text-custom-blue' : ''}`} />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={handleKanbanViewClick}>
                    <TbLayoutGridRemove className={`text-xl ${viewMode === 'kanban' ? 'text-custom-blue' : ''}`} />
                  </span>
                </Tooltip>
              </div>
              <div className="flex items-center">
                <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
                  <div className="max-w-lg w-full">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search by ID or Contact..."
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="p-2 text-xl sm:text-sm md:text-sm">
                    {currentPage}/{totalPages || 1}
                  </span>
                </div>
                <div className="flex">
                  <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${
                        currentPage === 1 ? 'cursor-not-allowed' : ''
                      } ${activeArrow === 'prev' ? 'text-custom-blue' : ''}`}
                      onClick={onClickLeftArrow}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>
                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${
                        currentPage === totalPages ? 'cursor-not-allowed' : ''
                      } ${activeArrow === 'next' ? 'text-custom-blue' : ''}`}
                      onClick={onClickRightArrow}
                    >
                      <IoIosArrowForward className="text-custom-blue" />
                    </span>
                  </Tooltip>
                </div>
                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                  <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      onClick={toggleFilter}
                      style={{
                        opacity: tickets.length === 0 ? 0.2 : 1,
                        pointerEvents: tickets.length === 0 ? 'none' : 'auto',
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
            </motion.div>
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {loading ? (
                <div className="flex justify-center items-center h-[calc(100vh-9rem)]">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-blue"></div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-9rem)]">
                  <p className="text-9xl rotate-180 text-custom-blue">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </p>
                  <p className="text-center py-10 text-gray-500 text-lg">
                    {userRole === 'Admin' ? "You don't have any tickets yet. Create a new ticket." : "You don't have any tickets yet."}
                  </p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-lg">
                  <p className="text-lg font-normal">No tickets found matching your search criteria.</p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="flex relative w-full overflow-hidden">
                  <div
                    className={`transition-all duration-300 ${
                      showFilter
                        ? 'mr-1 md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
                        : 'w-full'
                    }`}
                  >
                    <TableView
                      currentTickets={paginatedTickets}
                      tickets={tickets}
                      toggleAction={handleMoreClick}
                      actionViewMore={actionViewMore}
                      userRole={userRole}
                      currentUserId={currentUserId}
                      currentOrganizationId={currentOrganizationId}
                    />
                  </div>
                  {showFilter && (
                    <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-36 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={showFilter}
                        closeOffcanvas={toggleFilter}
                        onFilterChange={handleFilterChange}
                        userRole={userRole}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex relative w-full overflow-hidden">
                  <div
                    className={`transition-all duration-300 ${
                      showFilter
                        ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]'
                        : 'w-full'
                    }`}
                  >
                    <KanbanView
                      currentTickets={paginatedTickets}
                      tickets={tickets}
                      userRole={userRole}
                      currentUserId={currentUserId}
                    />
                  </div>
                  {showFilter && (
                    <div className="h-full sm:w-[50%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] right-0 top-36 bg-white border-l border-gray-200 shadow-lg z-30">
                      <OffcanvasMenu
                        isOpen={showFilter}
                        closeOffcanvas={toggleFilter}
                        onFilterChange={handleFilterChange}
                        userRole={userRole}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
        </div>
      </main>
    </div>
  );
}

export default SupportDesk;