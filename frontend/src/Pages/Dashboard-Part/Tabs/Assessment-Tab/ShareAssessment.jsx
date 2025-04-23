import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// import { fetchFilterData } from '../../../../utils/dataUtils.js';
// import { usePermissions } from '../../../../Context/PermissionsContext.js';
// import { useMemo } from 'react';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
// import Cookies from 'js-cookie'
// import toast from "react-hot-toast";
import { X } from 'lucide-react';
import { useCustomContext } from '../../../../Context/Contextfetch';
import { shareAssessmentAPI } from './AssessmentShareAPI.jsx';

const ShareAssessment = ({
  isOpen,
  onCloseshare,
  onOutsideClick,
  AssessmentTitle,
  assessmentId,
}) => {
  const [linkExpiryDays, setLinkExpiryDays] = useState(3)
  const {
    candidateData,
  } = useCustomContext();
  console.log(assessmentId, "assessmentId");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  const [assignedCandidateIds, setAssignedCandidateIds] = useState([]);

  // Add this useEffect to fetch assigned candidates when the component mounts
useEffect(() => {
  const fetchAssignedCandidates = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/assessments/assigned/${assessmentId}`
      );
      if (response.data.success) {
        setAssignedCandidateIds(response.data.assignedCandidateIds);
      }
    } catch (error) {
      console.error('Error fetching assigned candidates:', error);
    }
  };

  if (assessmentId) {
    fetchAssignedCandidates();
  }
}, [assessmentId]);

const handleCandidateInputChange = (e) => {
  const inputValue = e.target.value;
  setCandidateInput(inputValue);
  
  const filtered = candidateData.filter((candidate) =>
    candidate.LastName.toLowerCase().includes(inputValue.toLowerCase()) &&
    !assignedCandidateIds.includes(candidate._id.toString())
  );
  
  setFilteredCandidates(filtered);
  setShowDropdownCandidate(!showDropdownCandidate);
}

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


  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  console.log(selectedCandidates, "selectedCandidates");
  const [candidateInput, setCandidateInput] = useState("");
  const [showDropdownCandidate, setShowDropdownCandidate] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);


  const handleDropdownToggle = () => {
    setShowDropdownCandidate((prev) => !prev);
  };

  const handleCandidateSelect = (candidate) => {
    if (candidate && !selectedCandidates.some(selected => selected._id === candidate._id)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
      setErrors({ ...errors, Candidate: "" });
    }
    setCandidateInput("");
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

  // const handleclose = () => {
  //   setShowMainContent(true);
  //   setShowNewCandidateContent(false);
  // };

  // const handleCandidateAdded = (newCandidate) => {
  //   setCandidateData([...candidateData, newCandidate]);
  //   setSelectedCandidates([...selectedCandidates, newCandidate.LastName]);
  //   setShowMainContent(true);
  //   setShowNewCandidateContent(false);
  //   setShowDropdownCandidate(false);
  // };

  // const handleShareClick = async () => {
  //   if (selectedCandidates.length === 0) {
  //     setErrors({ ...errors, Candidate: "Please select at least one candidate." });
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const reqBody = {
  //       assessmentId,
  //       organizationId: Cookies.get("organizationId"),
  //       expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)) || 3,
  //       status: "scheduled",
  //       proctoringEnabled: true,
  //       createdBy: Cookies.get("userId"),
  //     }
  //     const scheduleAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/schedule-assessment/schedule`, reqBody)
  //     const selectedCandidateIds = selectedCandidates.map(candidate => candidate._id);
  //     const candidatesPayload = selectedCandidates.map(candidate => ({
  //       candidateId: candidate._id,
  //       emails: candidate.Email
  //     }));
  //     console.log("candidatesPayload", candidatesPayload)

  //     if (scheduleAssessmentResponse.data.success) {
  //       const CandidateAssessmentsList = selectedCandidateIds.map(candidateId => ({
  //         scheduledAssessmentId: scheduleAssessmentResponse.data.assessment._id,
  //         candidateId,
  //         status: "pending",
  //         expiryAt: new Date(new Date().setDate(new Date().getDate() + linkExpiryDays)) || 3,
  //         isActive: true,
  //         assessmentLink: ""
  //       }))
  //       console.log("candidate assessment list", CandidateAssessmentsList)
  //       const CandidateAssessmentResponse = await axios.post(`${process.env.REACT_APP_API_URL}/candidate-assessment/create`, CandidateAssessmentsList)
  //       if (CandidateAssessmentResponse.data.success) {
  //         const response = await axios.post(`${process.env.REACT_APP_API_URL}/emailCommon/assessmentSendEmail`, {
  //           candidates: {scheduledAssessmentId:scheduleAssessmentResponse.data.assessment._id,  candidatesPayload}, 
  //           category: "assessment",
  //           userId: Cookies.get("userId"),
  //           organizationId: Cookies.get("organizationId"),
  //         });
  //         toast.success(`${response.data.message}`)
  //       }

  //       setIsLoading(false)
  //       onCloseshare();
  //     }
  //     toast.success(`Assessment Scheduled`)
  //   } catch (error) {
  //     console.error("error in sharing assessment from frontend in Share Assessment page", error)
  //   }
  //   finally {
  //     setIsLoading(false)
  //   }
  // }

  // In your component
const handleShareClick = async () => {
  const result = await shareAssessmentAPI({
    assessmentId,
    selectedCandidates,
    linkExpiryDays,
    onClose: onCloseshare, // your close modal function
    setErrors: setErrors, // your error state setter
    setIsLoading: setIsLoading // your loading state setter
  });

  if (result.success) {
    // Additional success handling if needed
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-4 rounded shadow-lg">
              Sending email...
            </div>
          </div>
        )}
        
        {isSuccess && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-4 rounded shadow-lg">
              Email sent successfully!
            </div>
          </div>
        )}
        
        {showMainContent ? (
          <>
            <div className="sticky top-0 bg-custom-blue text-white p-4 rounded-t-lg flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold">
                Share <span className="text-gray-200">{AssessmentTitle}</span>
              </h2>
              <button
                className="text-white hover:text-gray-200 transition-colors"
                onClick={onCloseshare}
              >
                <X className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="Candidate" className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate <span className="text-red-500">*</span>
                </label>
                
                <div className="relative">
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${errors.Candidate ? "border-red-500" : "border-gray-300"} focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500`}>
                    <input
                      type="text"
                      className="flex-grow outline-none text-sm"
                      value={candidateInput}
                      onChange={handleCandidateInputChange}
                      onClick={() => {
                        setShowDropdownCandidate(!showDropdownCandidate);
                        if (!candidateInput) {
                          setFilteredCandidates(candidateData);
                        }
                      }}
                      placeholder="Search candidates..."
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
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {errors.Candidate && (
                    <p className="mt-1 text-sm text-red-500">{errors.Candidate}</p>
                  )}
                  
                  {showDropdownCandidate && (
                    <div 
                      ref={dropdownRef} 
                      className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
                    >
                      <div className="p-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">Recent Candidates</p>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.slice(0, 4).map((candidate) => (
                            <li
                              key={candidate._id}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                              onClick={() => handleCandidateSelect(candidate)}
                            >
                              <span className="text-sm">{candidate.LastName}</span>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-sm text-gray-500">
                            No matching candidates found
                          </li>
                        )}
                        <li
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-sm text-blue-600"
                          onClick={handleAddNewCandidateClick}
                        >
                          <IoIosAddCircle className="mr-2" />
                          <span>Add New Candidate</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Selected candidates chips */}
                {selectedCandidates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCandidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                      >
                        {candidate.LastName}
                        <button
                          onClick={() => handleCandidateRemove(candidate._id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2 flex justify-end rounded-b-lg">
              <button 
                onClick={handleShareClick} 
                className="bg-custom-blue hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </>
        ) : (
          <>
            {showNewCandidateContent && (
              <div></div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShareAssessment;