import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import SupportActionModal from './SupportActionModel';
import axios from 'axios';
import { Link } from 'react-router-dom';

const filterOptions = {
  status: ['New', 'Assigned', 'Inprogress', 'Resolved', 'Close'],
  priority: ['High', 'Medium', 'Low'],
};

function SupportDesk() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    issueType: [],
    status: [],
    priority: [],
  });

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
      priority: [],
    });
    setActiveFilter(null);
  }, []);

  const getTickets = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/get-tickets`;
      const response = await axios.get(url);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert("Something went wrong");
    }
  }, []);

  useEffect(() => {
    getTickets();
  }, [getTickets]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const toggleFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const toggleActiveFilter = useCallback((filterName) => {
    setActiveFilter(prev => prev === filterName ? null : filterName);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketId = ticket._id.slice(-5, -1).toLowerCase();
      const searchMatch = searchTerm === '' || 
        ticketId.includes(searchTerm.toLowerCase()) ||
        ticket.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const issueTypeMatch = filters.issueType.length === 0 || filters.issueType.includes(ticket.issueType);
      const statusMatch = filters.status.length === 0 || filters.status.includes(ticket.status);
      const priorityMatch = filters.priority.length === 0 || filters.priority.includes(ticket.priority);

      return searchMatch && issueTypeMatch && statusMatch && priorityMatch;
    });
  }, [tickets, searchTerm, filters]);

  const uniqueIssueTypes = useMemo(() => {
    return tickets
      .map(ticket => ticket.issueType)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [tickets]);

  const totalFilterCount = useMemo(() => 
    Object.values(filters).flat().length,
    [filters]
  );

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const maxPage = useMemo(() => 
    Math.ceil(filteredTickets.length / itemsPerPage),
    [filteredTickets.length, itemsPerPage]
  );

  return (
    <>
      <div className="p-4 bg-white md:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-teal-600 font-bold">Support Desk</h2>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <div className="absolute left-0 pl-3 flex items-center h-full pr-3">
                <Search className="w-5 h-5 text-teal-600" />
              </div>
              <input
                type="text"
                placeholder="Search TicketId and Contact"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-14 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <div className="absolute right-0 pr-3 flex items-center h-full border-l border-gray-300 pl-3">
                <ChevronDown className="w-11 h-11 text-teal-600 fill-teal-600" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {currentPage}-{Math.min(currentPage * itemsPerPage, filteredTickets.length)}/{filteredTickets.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, maxPage))}
                disabled={currentPage === maxPage}
                className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={toggleFilter}
              className={`p-2 rounded-md border ${showFilter ? 'bg-teal-50 text-white border-teal-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} relative`}
            >
              <Filter className="w-5 h-5 text-teal-600 fill-teal-600" strokeWidth={2} />
              {totalFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {totalFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`flex w-full transition-all duration-300 ease-in-out ${showFilter ? 'space-x-4' : ''}`}>
        <div className={`${showFilter ? 'w-3/4' : 'w-full'} transition-all duration-300`}>
          <div className="overflow-x-auto border border-gray-300">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Ticket ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Contact</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Issue Type</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Priority</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Created Date & Time</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length > 0 ? (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className="px-4 md:px-6 py-4 text-sm text-teal-500"><Link>{ticket._id.slice(-5, -1)}</Link></td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.contact}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.issueType}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.status}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.priority}</td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{ticket.createdDate}</td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        <SupportActionModal ticketId={ticket._id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">No tickets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showFilter && (
          <div className="w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filter by</h3>
                <button onClick={closeFilterModal} className="text-gray-400">
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div
                    className="flex items-center justify-between font-medium cursor-pointer"
                    onClick={() => toggleActiveFilter('issueType')}
                  >
                    <h4>Issue Type</h4>
                    {activeFilter === 'issueType' ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {activeFilter === 'issueType' && (
                    <div className="ml-8 mt-2">
                      {uniqueIssueTypes.map((type) => (
                        <label key={type} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={filters.issueType.includes(type)}
                            onChange={() => handleFilterChange('issueType', type)}
                            className="mr-2"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className="flex items-center justify-between font-medium cursor-pointer"
                    onClick={() => toggleActiveFilter('status')}
                  >
                    <h4>Status</h4>
                    {activeFilter === 'status' ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {activeFilter === 'status' && (
                    <div className="ml-8 mt-2">
                      {filterOptions.status.map((status) => (
                        <label key={status} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => handleFilterChange('status', status)}
                            className="mr-2"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className="flex items-center justify-between font-medium cursor-pointer"
                    onClick={() => toggleActiveFilter('priority')}
                  >
                    <h4>Priority</h4>
                    {activeFilter === 'priority' ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {activeFilter === 'priority' && (
                    <div className="ml-8 mt-2">
                      {filterOptions.priority.map((priority) => (
                        <label key={priority} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes(priority)}
                            onChange={() => handleFilterChange('priority', priority)}
                            className="mr-2"
                          />
                          <span>{priority}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={clearFilters}
                  className="bg-teal-600 w-full text-white mt-6 py-2 px-4 rounded-lg hover:bg-teal-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SupportDesk;