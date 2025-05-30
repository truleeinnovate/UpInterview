import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, Minimize, Expand } from 'lucide-react';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import femaleImage from '../../../../../Dashboard-Part/Images/woman.png';
import maleImage from '../../../../../Dashboard-Part/Images/man.png';
import genderlessImage from '../../../../../Dashboard-Part/Images/transgender.png';
import { Button } from '../../../CommonCode-AllTabs/ui/button.jsx'; // Assuming Button component is available

const InternalInterviews = ({ onClose, onSelectCandidates, navigatedfrom }) => {
  const { interviewers, groups } = useCustomContext();
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [viewType, setViewType] = useState('individuals');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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
        .filter((availability) => {
          const contact = availability.contact || {};
          return [contact.Name, contact.Email, contact.Phone, contact.UserName].some(
            (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .map((availability) => ({
          _id: availability._id,
          contactId: {
            name: availability.contact?.Name || 'N/A',
            email: availability.contact?.Email || 'N/A',
            phone: availability.contact?.Phone || 'N/A',
            technology:
              availability.contact?.Technologys?.join(', ') ||
              availability.contact?.Skills?.join(', ') ||
              'N/A'
          },
          imageUrl: availability.contact?.ImageData?.path
            ? `${process.env.REACT_APP_API_URL}/${availability.contact.ImageData.path.replace(/\\/g, '/')}`
            : null,
          Gender: availability.contact?.Gender || 'Unknown'
        }));
    } else {
      return Array.isArray(groups)
        ? groups.filter((group) =>
          [group.name, group.description].some(
            (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        : [];
    }
  }, [interviewers, groups, searchQuery, viewType]);

  useEffect(() => {
    setFilteredData(FilteredData);
  }, [FilteredData]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectClick = (item) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(item._id) ? prev.filter((id) => id !== item._id) : [...prev, item._id]
    );
  };

  const handleScheduleClick = () => {
    const selectedInterviewers = filteredData.filter((item) =>
      selectedInterviewerIds.includes(item._id)
    );
    onSelectCandidates(selectedInterviewers);
    onClose();
  };

  const isInterviewerSelected = (item) => selectedInterviewerIds.includes(item._id);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const selectViewType = (type) => {
    setViewType(type);
    setSelectedInterviewerIds([]);
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
              {selectedInterviewerIds.length} {viewType === 'individuals' ? 'interviewer' : 'group'}
              {selectedInterviewerIds.length !== 1 ? 's' : ''} selected
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
            {/* Dropdown */}
            <div className="w-[30%]" ref={dropdownRef}>
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
                <div className="absolute z-20 mt-1 w-[25%] bg-white shadow-lg rounded-md py-1 border border-gray-200">
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
            {filteredData.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${isInterviewerSelected(item)
                  ? 'bg-blue-100 border border-blue-300'
                  : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                onClick={() => handleSelectClick(item)}
              >
                <div className="flex items-center">
                  {viewType === 'individuals' ? (
                    <>
                      <img
                        src={
                          item.imageUrl ||
                          (item.Gender === 'Male'
                            ? maleImage
                            : item.Gender === 'Female'
                              ? femaleImage
                              : genderlessImage)
                        }
                        alt="interviewerImage"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.contactId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{item.contactId?.technology || 'N/A'}</p>
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
                        <p className="text-sm font-medium text-gray-900">{item.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{item.description || 'No description'}</p>
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
              disabled={selectedInterviewerIds.length === 0}
              className="bg-custom-blue px-4 py-2 rounded-md text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Schedule ({selectedInterviewerIds.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalInterviews;