import React, { useState, useEffect, useCallback, useRef } from "react";
import femaleImage from "../../../../../Dashboard-Part/Images/woman.png";
import maleImage from "../../../../../Dashboard-Part/Images/man.png";
import genderlessImage from "../../../../../Dashboard-Part/Images/transgender.png";
import { useMemo } from 'react';
import { useCustomContext } from "../../../../../../Context/Contextfetch.js";
import { Search, X, ChevronDown } from 'lucide-react';

const InternalInterviews = ({ onClose, onSelectCandidates }) => {
  const { teamsData, groups } = useCustomContext();
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const modalRef = useRef(null);
  const [viewType, setViewType] = useState("individuals");
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
    if (viewType === "individuals") {
      if (!Array.isArray(teamsData)) {
        console.log("teamData is not an array:", teamsData);
        return [];
      }
      return teamsData.filter((team) => {
        const matchesSearchQuery = [team.contactId?.name, team.contactId?.email, team.contactId?.phone].some(
          (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesSearchQuery;
      });
    } else {
      // Filter groups
      if (!Array.isArray(groups)) {
        console.log("groups is not an array:", groups);
        return [];
      }
      return groups.filter((group) => {
        const matchesSearchQuery = [group.name, group.description].some(
          (field) => field && field.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesSearchQuery;
      });
    }
  }, [teamsData, groups, searchQuery, viewType]);

  useEffect(() => {
    setFilteredData(FilteredData);
  }, [FilteredData]);

  const handleSearchInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSelectClick = (interviewer) => {
    setSelectedInterviewerIds((prev) => {
      const isSelected = prev.includes(interviewer._id);
      if (isSelected) {
        return prev.filter(id => id !== interviewer._id);
      } else {
        return [...prev, interviewer._id];
      }
    });
  };

  const handleScheduleClick = () => {
    const selectedInterviewers = filteredData.filter((interviewer) =>
      selectedInterviewerIds.includes(interviewer._id)
    );
    onSelectCandidates(selectedInterviewers);
    onClose();
  };

  const isInterviewerSelected = (interviewer) => {
    return selectedInterviewerIds.includes(interviewer._id);
  };
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectViewType = (type) => {
    setViewType(type);
    setSelectedInterviewerIds([]); // Clear selection when switching view types
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select Internal {viewType === "individuals" ? "Interviewers" : "Groups"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex mb-4 gap-2">
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search interviewers..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="w-full flex justify-between items-center border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <span>{viewType === "individuals" ? "Individuals" : "Groups"}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200">
                <button
                  onClick={() => selectViewType("individuals")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Individuals
                </button>
                <button
                  onClick={() => selectViewType("groups")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Groups
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredData.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between p-3 mb-2 rounded-md cursor-pointer ${
                  isInterviewerSelected(item)
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleSelectClick(item)}
              >
                <div className="flex items-center">
                  {viewType === "individuals" ? (
                    <>
                      <img
                        src={
                          item.imageUrl ||
                          (item.Gender === "Male"
                            ? maleImage
                            : item.Gender === "Female"
                              ? femaleImage
                              : genderlessImage)
                        }
                        alt="interviewerImage"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.contactId?.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{item.contactId?.technology || "N/A"}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.name || "N/A"}</p>
                        <p className="text-xs text-gray-500">{item.description || "No description"}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  {isInterviewerSelected(item) && (
                    <div className="h-5 w-5 rounded-full flex items-center justify-center bg-blue-500 text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
         


        <div className="mt-6 flex justify-end">
          <button
            onClick={handleScheduleClick}
            className="bg-custom-blue p-2 rounded-md text-white"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalInterviews;