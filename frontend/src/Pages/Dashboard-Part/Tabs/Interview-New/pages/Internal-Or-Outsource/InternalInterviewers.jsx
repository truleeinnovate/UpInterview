import React, { useState, useEffect, useCallback, useRef } from "react";
import femaleImage from "../../../../../Dashboard-Part/Images/woman.png";
import maleImage from "../../../../../Dashboard-Part/Images/man.png";
import genderlessImage from "../../../../../Dashboard-Part/Images/transgender.png";
import { useMemo } from 'react';
import { useCustomContext } from "../../../../../../Context/Contextfetch.js";
import { Search, X } from 'lucide-react';

const InternalInterviews = ({ onClose, onSelectCandidates }) => {
  const {  teamsData } = useCustomContext();
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const FilteredData = useMemo(() => {
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
  }, [teamsData, searchQuery]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select Internal Interviewers
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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

        {filteredData.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No internal interviewers found
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {filteredData.map((interviewer) => (
              <div
                key={interviewer._id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                  isInterviewerSelected(interviewer)
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleSelectClick(interviewer)}
              >
                <div className="flex items-center">
                  <img
                    src={
                      interviewer.imageUrl ||
                      (interviewer.Gender === "Male"
                        ? maleImage
                        : interviewer.Gender === "Female"
                          ? femaleImage
                          : genderlessImage)
                    }
                    alt="interviewerImage"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{interviewer.contactId?.name || "N/A"}</p>
                    <p className="text-xs text-gray-500">{interviewer.contactId?.technology || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {isInterviewerSelected(interviewer) && (
                    <div className="h-5 w-5 rounded-full flex items-center justify-center bg-blue-500 text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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