import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { shareAssessmentAPI } from './AssessmentShareAPI.jsx';
import { IoMdClose } from 'react-icons/io';
import { FiX } from 'react-icons/fi';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from '../../../../config.js';
import { useCandidates } from '../../../../apiHooks/useCandidates';

const ShareAssessment = ({
  isOpen,
  onCloseshare,
  assessment
}) => {
  const { candidateData, loading } = useCandidates();

  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const organizationId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;

  const [linkExpiryDays, setLinkExpiryDays] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [showDropdownCandidate, setShowDropdownCandidate] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch assigned candidates
  const fetchAssignedCandidates = async () => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/schedule-assessment/${assessment._id}/schedules`
      );
      const assigned = response.data.flatMap((schedule) =>
        schedule.candidates.map((candidate) => ({
          candidateId: candidate.candidateId._id.toString(),
          scheduleOrder: schedule.order,
        }))
      );
      setAssignedCandidates(assigned);
    } catch (error) {
      console.error('Error fetching assigned candidates:', error);
      toast.error('Failed to fetch assigned candidates');
    }
  };

  useEffect(() => {
    if (assessment._id) {
      fetchAssignedCandidates();
    }
  }, [assessment._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCandidate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCandidateInputChange = (e) => {
    const inputValue = e.target.value;
    setCandidateInput(inputValue);

    const filtered = candidateData.filter((candidate) =>
      `${candidate.FirstName} ${candidate.LastName}`.toLowerCase().includes(inputValue.toLowerCase()) ||
      candidate.Email.toLowerCase().includes(inputValue.toLowerCase())
    );

    setFilteredCandidates(filtered);
    setShowDropdownCandidate(true);
  };

  const handleDropdownToggle = () => {
    if (showDropdownCandidate) {
      setShowDropdownCandidate(false);
    } else {
      setShowDropdownCandidate(true);
      if (!candidateInput) {
        setFilteredCandidates(candidateData);
      }
      // Focus input when dropdown is opened
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
    }
  };

  const handleCandidateSelect = (candidate) => {
    if (candidate && !selectedCandidates.some((selected) => selected._id === candidate._id)) {
      const assignedSchedules = assignedCandidates.filter(
        (ac) => ac.candidateId === candidate._id.toString()
      );
      if (assignedSchedules.length > 0) {
        const scheduleNames = assignedSchedules.map((ac) => ac.scheduleOrder).join(', ');
        toast.error(
          `${candidate.LastName} is already assigned to ${scheduleNames}.`
        );
        return;
      }
      setSelectedCandidates([...selectedCandidates, candidate]);
      setErrors({ ...errors, Candidate: '' });
    }
    setCandidateInput('');
    setShowDropdownCandidate(false);
  };

  // Add this new function to handle multi-select
  const handleSelectAllVisible = () => {
    const newCandidates = filteredCandidates.filter(
      candidate =>
        !selectedCandidates.some(selected => selected._id === candidate._id) &&
        !assignedCandidates.some(ac => ac.candidateId === candidate._id.toString())
    );

    if (newCandidates.length > 0) {
      setSelectedCandidates([...selectedCandidates, ...newCandidates]);
      setErrors({ ...errors, Candidate: '' });
      toast.success(`Added ${newCandidates.length} candidates`);
    } else {
      toast.error('No new candidates to add from current view');
    }
    setShowDropdownCandidate(false);
  };

  const handleCandidateRemove = (candidateId) => {
    setSelectedCandidates(
      selectedCandidates.filter((candidate) => candidate._id !== candidateId)
    );
  };

  const handleClearAllCandidates = () => {
    setSelectedCandidates([]);
  };

  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    setShowNewCandidateContent(true);
  };

  const handleShareClick = async () => {
    if (selectedCandidates.length === 0) {
      setErrors({ ...errors, Candidate: 'Please select at least one candidate.' });
      return;
    }

    setIsLoading(true);
    const result = await shareAssessmentAPI({
      assessmentId: assessment._id,
      selectedCandidates,
      linkExpiryDays,
      onClose: onCloseshare,
      setErrors,
      setIsLoading,
      organizationId,
      userId
    });

    if (result.success) {
      await fetchAssignedCandidates();
    } else {
      toast.error(result.message || 'Failed to schedule assessment');
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black top-0 bg-opacity-30 z-50 flex items-center justify-center">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium">Sending emails...</p>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <svg
                className="w-12 h-12 text-green-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-lg font-medium">Emails sent successfully!</p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showMainContent ? (
          <>
            <div className="sticky top-0 p-4 rounded-t-lg flex justify-between items-center z-10 border-b">
              <div>
                <h2 className="text-xl font-semibold">Share Assessment</h2>
              </div>
              <button
                className=" transition-colors p-1 rounded-full"
                onClick={onCloseshare}
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            <div className="p-4">
              <p className='font-semibold mb-2'>Assessment Template Title: <span className="text-sm text-custom-blue">{assessment.AssessmentTitle}</span></p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="Candidate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Candidate <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={handleAddNewCandidateClick}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <IoIosAddCircle className="mr-1" />
                    Add New Candidate
                  </button>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <div
                    className={`flex items-center border rounded-lg px-3 py-2 ${errors.Candidate ? 'border-red-500' : 'border-gray-300'
                      } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors`}
                    onClick={() => setShowDropdownCandidate(true)}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-grow outline-none text-sm bg-transparent"
                      value={candidateInput}
                      onChange={handleCandidateInputChange}
                      onFocus={() => {
                        setShowDropdownCandidate(true);
                        if (!candidateInput) {
                          setFilteredCandidates(candidateData);
                        }
                      }}
                      placeholder="Search by name or email..."
                      autoComplete="off"
                    />
                    <div className="flex space-x-2">
                      {selectedCandidates.length > 0 && (
                        <button
                          onClick={handleClearAllCandidates}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Clear all
                        </button>
                      )}
                      <MdArrowDropDown
                        onClick={handleDropdownToggle}
                        className={`text-gray-500 hover:text-gray-700 cursor-pointer transition-transform ${showDropdownCandidate ? 'transform rotate-180' : ''
                          }`}
                      />
                    </div>
                  </div>

                  {errors.Candidate && (
                    <p className="mt-1 text-sm text-red-500">{errors.Candidate}</p>
                  )}

                  {showDropdownCandidate && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                      <div className="sticky top-0 p-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available Candidates ({filteredCandidates.length})
                        </p>
                        {filteredCandidates.length > 0 && (
                          <button
                            onClick={handleSelectAllVisible}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Select All
                          </button>
                        )}
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((candidate) => {
                            const assignedSchedules = assignedCandidates.filter(
                              (ac) => ac.candidateId === candidate._id.toString()
                            );
                            const isAssigned = assignedSchedules.length > 0;
                            const isSelected = selectedCandidates.some(
                              (selected) => selected._id === candidate._id
                            );

                            return (
                              <li
                                key={candidate._id}
                                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${isAssigned ? 'bg-yellow-50' :
                                  isSelected ? 'bg-blue-50' : ''
                                  }`}
                                onClick={() => handleCandidateSelect(candidate)}
                              >
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    {candidate.FirstName} {candidate.LastName}
                                  </span>
                                  {candidate.Email && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({candidate.Email})
                                    </span>
                                  )}
                                </div>
                                {isAssigned ? (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                    Assigned
                                  </span>
                                ) : isSelected ? (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Selected
                                  </span>
                                ) : null}
                              </li>
                            );
                          })
                        ) : (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No matching candidates found
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedCandidates.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Candidates ({selectedCandidates.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidates.map((candidate) => (
                          <div
                            key={candidate._id}
                            className="inline-flex items-center bg-blue-50 text-blue-800 rounded-lg px-3 py-1.5 text-sm border border-blue-100"
                          >
                            <span className="font-medium">{candidate.LastName}</span>
                            {candidate.Email && (
                              <span className="ml-1 text-xs text-blue-600">
                                ({candidate.Email})
                              </span>
                            )}
                            <button
                              onClick={() => handleCandidateRemove(candidate._id)}
                              className="ml-2 text-blue-600 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-100"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={onCloseshare}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareClick}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading || selectedCandidates.length === 0}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sharing...
                  </span>
                ) : (
                  'Share Assessment'
                )}
              </button>
            </div>
          </>
        ) : (
          <>{showNewCandidateContent && <div>{/* Add New Candidate Form */}</div>}</>
        )}
      </div>
    </div>
  );
};

export default ShareAssessment;