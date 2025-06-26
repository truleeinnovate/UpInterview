import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, Minimize, Expand } from 'lucide-react';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { Button } from '../../../CommonCode-AllTabs/ui/button.jsx';

const InternalInterviews = ({ onClose, onSelectCandidates, navigatedfrom, selectedInterviewers: selectedInterviewersProp = [], }) => {
  const { interviewers, groups } = useCustomContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [viewType, setViewType] = useState('individuals');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedInterviewers, setSelectedInterviewers] = useState(selectedInterviewersProp);
  const [selectedRole, setSelectedRole] = useState('all');
  const roles = [
    { value: 'all', label: 'All' },
    { value: 'Admin', label: 'Admin' },
    { value: 'HR_Manager', label: 'HR Manager' },
    { value: 'HR_Lead', label: 'HR Lead' },
    { value: 'Recruiter', label: 'Recruiter' },
    { value: 'Internal_Interviewer', label: 'Internal Interviewer' },
  ];
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const roleDropdownRef = useRef(null);

  // // Fetch all interviewers on component mount
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       await fetchInterviewers(); // Fetch all interviewers without role filter
  //     } catch (error) {
  //       console.error('Error fetching interviewers:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
    
  //   fetchData();
  // }, [fetchInterviewers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const FilteredData = useMemo(() => {
    if (viewType === 'individuals') {
      const interviewersArray = interviewers?.data && Array.isArray(interviewers.data) ? interviewers.data : [];
      return interviewersArray
        .filter((interviewer) => {
          // Filter by selected role
          if (selectedRole !== 'all' && interviewer.roleName !== selectedRole) {
            return false;
          }
          
          // Filter by search query
          const contact = interviewer.contact || {};
          const matchesSearch = [contact.firstName, contact.lastName, contact.email, contact.phone].some(
            (field) => field && field.toString().toLowerCase().includes(searchQuery.toLowerCase())
          );
          return matchesSearch;
        })
        .map((interviewer) => ({
          _id: interviewer._id,
          ...interviewer.contact,
          contactId: interviewer.contact?._id || null,
          type: interviewer.type,
          roleName: interviewer.roleName, // Include roleName in the mapped data
          availability: interviewer.availability,
          name: interviewer.firstName + interviewer.lastName
        }));
    } else {
      // Groups filtering remains the same
      return Array.isArray(groups)
        ? groups.filter((group) =>
            [group.name, group.description].some(
              (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        : [];
    }
  }, [interviewers, groups, searchQuery, viewType, selectedRole]); // Added selectedRole to dependencies
  

  useEffect(() => {
    setFilteredData(FilteredData);
  }, [FilteredData]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectClick = (item) => {
    setSelectedInterviewers((prev) => {
      const isAlreadySelected = prev.some(interviewer => interviewer._id === item._id);
      if (isAlreadySelected) {
        return prev.filter(interviewer => interviewer._id !== item._id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleScheduleClick = () => {
    onSelectCandidates(selectedInterviewers);
    onClose();
  };

  const isInterviewerSelected = (item) => selectedInterviewers?.some(interviewer => interviewer._id === item._id);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowRoleDropdown(false);
  };

  const toggleRoleDropdown = () => {
    setShowRoleDropdown(!showRoleDropdown);
    setShowDropdown(false);
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setShowRoleDropdown(false);
  };

  const selectViewType = (type) => {
    setViewType(type);
    setSelectedInterviewers([]);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div
        ref={modalRef}
        className={`bg-white h-full shadow-xl flex flex-col ${isFullscreen ? 'w-full' : 'w-full md:w-2/3 lg:w-1/2 xl:w-1/2 2xl:w-1/2'}`}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white z-10">
          <div>
            <h2 className="text-2xl font-semibold text-custom-blue">
              Select Internal {viewType === 'individuals' ? 'Interviewers' : 'Groups'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedInterviewers.length} {viewType === 'individuals' ? 'interviewer' : 'group'}
              {selectedInterviewers.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-gray-500" />
              ) : (
                <Expand className="w-5 h-5 text-gray-500" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Fixed Dropdown and Search Section */}
        <div className="px-6 bg-white border-b border-gray-200 z-10">
          <div className="flex gap-x-4 md:flex-row md:items-end md:space-x-4 md:space-y-0 justify-between my-5">
            {/* View Type Dropdown */}
            <div className="w-[25%]" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-full flex justify-between items-center border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <span>{viewType === 'individuals' ? 'Individuals' : 'Groups'}</span>
                {showDropdown ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {showDropdown && (
                <div className="absolute z-20 mt-1 w-[20%] bg-white shadow-lg rounded-md py-1 border border-gray-200">
                  <button
                    onClick={() => selectViewType('individuals')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Individuals
                  </button>
                  <button
                    onClick={() => selectViewType('groups')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Groups
                  </button>
                </div>
              )}
            </div>

            {/* Role Filter Dropdown */}
            <div className="w-[25%] relative" ref={roleDropdownRef}>
              <button
                onClick={toggleRoleDropdown}
                className="w-full flex justify-between items-center border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <span>
                  {roles.find(r => r.value === selectedRole)?.label || 'Select Role'}
                </span>
                {showRoleDropdown ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {showRoleDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => selectRole(role.value)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${viewType === 'individuals' ? 'interviewers' : 'groups'}...`}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Data Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4' : 'grid-cols-2'}`}>
            {filteredData?.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 rounded-md ${navigatedfrom !== 'dashboard' ? 'cursor-pointer' : 'cursor-default'} ${navigatedfrom !== 'dashboard' && isInterviewerSelected(item)
                  ? 'bg-custom-bg border border-custom-blue'
                  : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                onClick={() => navigatedfrom !== 'dashboard' && handleSelectClick(item)}
              >
                <div className="flex items-center">
                  {viewType === 'individuals' ? (
                    <>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={`${item.firstName} ${item.lastName}`}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center ring-2 ring-gray-200">
                          <span className="text-white font-semibold text-md -mt-[4px]">
                            {(item.firstName || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.firstName || item.lastName ? `${item.firstName || ''} ${item.lastName || ''}` : 'no name available'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Array.isArray(item.technologies) && item.technologies.length > 0
                            ? item.technologies.join(', ')
                            : 'no technology available'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.name || 'no name available'}</p>
                        <p className="text-xs text-gray-500">{item.description || 'No description available'}</p>
                      </div>
                    </>
                  )}
                </div>

                {isInterviewerSelected(item) && (
                  <div className="h-5 w-5 rounded-full flex items-center justify-center bg-blue-500 text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredData.length === 0 && (
            <div className={`text-gray-500 ${isFullscreen ? 'min-h-full flex items-center justify-center -mt-10' : 'flex items-center justify-center h-full -mt-8'}`}>
              <p>No {viewType === 'individuals' ? 'interviewers' : 'groups'} found for the selected criteria.</p>
            </div>
          )}
        </div>

        {/* Fixed Footer (Hidden when navigatedfrom is 'dashboard') */}
        {navigatedfrom !== 'dashboard' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={handleScheduleClick}
              disabled={selectedInterviewers.length === 0}
              className="bg-custom-blue px-4 py-2 rounded-md text-white  disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Schedule ({selectedInterviewers.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalInterviews;