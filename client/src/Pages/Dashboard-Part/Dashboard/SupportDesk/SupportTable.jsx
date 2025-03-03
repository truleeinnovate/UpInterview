/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from "axios";
import { format, isValid, parseISO } from "date-fns";
import SupportForm from "./SupportForm";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import SupportUserActionModal from "./SupportUserActionModal";

const SupportTable = () => {
  const [openSupportForm, setSupportForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    issueType: [],
    status: [],
  });

  // Memoized filter options
  const filterOptions = useMemo(() => ({
    status: ['New', 'Assigned', 'Inprogress', 'Resolved', 'Close'],
  }), []);

  const closeFilterModal = useCallback(() => {
    setShowFilter(false);
    setActiveFilter(null);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], value];
      }
      return updatedFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      issueType: [],
      status: [],
    });
    setActiveFilter(null);
  }, []);

  const getTickets = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/get-tickets`;
      const response = await axios.get(url);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while fetching tickets");
    }
  }, []);

  useEffect(() => {
    getTickets();
  }, [getTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketId = ticket._id.slice(-5, -1).toLowerCase();
      const searchMatch = searchTerm === '' || 
        ticketId.includes(searchTerm.toLowerCase()) ||
        ticket.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const issueTypeMatch = filters.issueType.length === 0 || filters.issueType.includes(ticket.issueType);
      const statusMatch = filters.status.length === 0 || filters.status.includes(ticket.status);
      
      return searchMatch && issueTypeMatch && statusMatch;
    });
  }, [tickets, searchTerm, filters]);

  const onClickLeftArrow = useCallback(() => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : prev);
  }, []);

  const onClickRightArrow = useCallback(() => {
    setCurrentPage(prev => {
      const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
      return prev < totalPages ? prev + 1 : prev;
    });
  }, [filteredTickets.length, itemsPerPage]);

  const handleFormClose = useCallback(() => {
    setSupportForm(false);
    setEditMode(false);
    setSelectedTicket(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleTicketEdit = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setEditMode(true);
    setSupportForm(true);
  }, []);

  const toggleFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  const toggleActiveFilter = useCallback((filterType) => {
    setActiveFilter(prev => prev === filterType ? null : filterType);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd MMM yyyy, hh:mm a") : "Invalid date";
  }, []);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const uniqueIssueTypes = useMemo(() => {
    return [...new Set(tickets.map(ticket => ticket.issueType))];
  }, [tickets]);

  return (
    <>
      <div className="p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-teal-600 font-bold">Support</h2>
          <button
            onClick={() => setSupportForm(true)}
            className="bg-teal-700 text-white font-bold px-6 py-2 rounded-md hover:bg-teal-800 transition-colors"
          >
            Support
          </button>
        </div>
        
        {/* Search and Controls Bar */}
        <div className="flex items-center justify-end mb-0 gap-4">
          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-3 flex items-center h-full pr-3">
                <Search className="w-5 h-5 text-teal-600" />
              </div>
              <input
                type="search"
                placeholder="Search by issue and title ID"
                onChange={handleSearchChange}
                className="w-full pl-14 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="absolute right-0 pr-3 flex items-center h-full border-l border-gray-300 pl-3">
                <ChevronDown className="w-11 h-11 text-teal-600 fill-teal-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pagination */}
            <span className="text-sm text-gray-600">
              {currentPage}-{Math.min(currentPage * itemsPerPage, filteredTickets.length)}/{filteredTickets.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClickLeftArrow}
                disabled={currentPage === 1}
                className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onClickRightArrow}
                disabled={currentPage === Math.ceil(filteredTickets.length / itemsPerPage)}
                className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={toggleFilter}
              className={`p-2 rounded-md border ${showFilter ? 'bg-teal-50 text-white border-teal-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} relative transition-colors`}
            >
              <Filter className="w-5 h-5 text-teal-600 fill-teal-600" strokeWidth={2} />
              {Object.values(filters).some(f => f.length > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {Object.values(filters).flat().length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Responsive Layout */}
      <div className={`flex w-full transition-all duration-300 ease-in-out ${showFilter ? 'space-x-4' : ''}`}>
        {/* Table Container */}
        <div className={`${showFilter ? 'w-3/4' : 'w-full'} transition-all duration-300`}>
          <div className="overflow-x-auto border border-gray-300">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Ticket ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Issue Type</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Created Date & Time</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length > 0 ? (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket._id} >
                      <td className="md:px-6 text-sm text-teal-500 px-4 py-2">{ticket._id.slice(-5, -1)}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.issueType}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.status}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                        <SupportUserActionModal
                          ticketId={ticket._id}
                          handleEdit={() => handleTicketEdit(ticket)}
                          setEditMode={setEditMode}
                          setSupportForm={setSupportForm}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filter by</h3>
                <button onClick={closeFilterModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* Issue Type Dropdown */}
                <div>
                  <div
                    className="flex items-center justify-between font-medium cursor-pointer hover:text-teal-600"
                    onClick={() => toggleActiveFilter('issueType')}
                  >
                    <h4>Issue Type</h4>
                    {activeFilter === 'issueType' ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {activeFilter === 'issueType' && (
                    <div className="ml-8 mt-2">
                      {uniqueIssueTypes.map((type) => (
                        <label key={type} className="flex items-center mb-2 cursor-pointer hover:text-teal-600">
                          <input
                            type="checkbox"
                            checked={filters.issueType.includes(type)}
                            onChange={() => handleFilterChange('issueType', type)}
                            className="mr-2 accent-teal-600"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div>
                  <div
                    className="flex items-center justify-between font-medium cursor-pointer hover:text-teal-600"
                    onClick={() => toggleActiveFilter('status')}
                  >
                    <h4>Status</h4>
                    {activeFilter === 'status' ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {activeFilter === 'status' && (
                    <div className="ml-8 mt-2">
                      {filterOptions.status.map((status) => (
                        <label key={status} className="flex items-center mb-2 cursor-pointer hover:text-teal-600">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => handleFilterChange('status', status)}
                            className="mr-2 accent-teal-600"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="bg-teal-600 w-full text-white mt-6 py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {openSupportForm && (
        <SupportForm
          reOpen={editMode}
          getTickets={getTickets}
          setSupportForm={handleFormClose}
          ticketFromView={selectedTicket}
          setOpenForm={handleFormClose}
        />
      )}
    </>
  );
};

export default SupportTable;
