// v1.0.0  -  Ashraf  - fixed add candidate click navigate to add form
// v1.0.1  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code),added dropdown to show assessment when user is from shedule assessment true. STOPPED LOOPS: Replaced bulk section fetching with lazy loading to prevent performance issues
// v1.0.2  -  Ashraf  -  called sections function to load data fast
// v1.0.3  -  Ashraf  -  removed already selected cant select logic because very new schedule we can select same candidate
// v1.0.5  -  Ashok   -  z-index issue fixed and disabled outer scrollbar
// v1.0.6  -  Ashok   -  popup z-index issues fixed and dynamically increased the height of the popup container
// v1.0.7  -  Ashok   -  improved responsiveness

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { shareAssessmentAPI } from "./AssessmentShareAPI.jsx";
import { IoMdClose } from "react-icons/io";
import { FiX } from "react-icons/fi";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from "../../../../config.js";
import { useCandidates } from "../../../../apiHooks/useCandidates";
import Loading from "../../../../Components/Loading.js";
// <------------------------------- v1.0.0
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
// ------------------------------ v1.0.0 >
// <---------------------- v1.0.1
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { useQueryClient } from "@tanstack/react-query";
// <---------------------- v1.0.1 >
// v1.0.5 <--------------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.5 -------------------------------------------------------------------------->
// Common Form Field Components
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField.jsx";

const ShareAssessment = ({
  isOpen,
  onCloseshare,
  assessment,
  fromscheduleAssessment,
}) => {
  // v1.0.5 <--------------------------------------------------------------------
  useScrollLock(isOpen);
  // v1.0.5 -------------------------------------------------------------------->
  // <---------------------- v1.0.1
  const { assessmentData, fetchAssessmentQuestions } = useAssessments();
  const {
    candidateData,
    loading,
    refetch: refetchCandidates,
  } = useCandidates();
  const queryClient = useQueryClient();
  // <---------------------- v1.0.1 >

  // <------------------------------- v1.0.0
  const navigate = useNavigate();
  // ------------------------------ v1.0.0 >
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const organizationId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;

  const [linkExpiryDays, setLinkExpiryDays] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [showMainContent, setShowMainContent] = useState(true);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateInput, setCandidateInput] = useState("");
  const [showDropdownCandidate, setShowDropdownCandidate] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  // <---------------------- v1.0.1 >

  // Assessment selection state for fromscheduleAssessment
  const [selectedAssessment, setSelectedAssessment] = useState(
    fromscheduleAssessment ? null : assessment
  );
  const [assessmentInput, setAssessmentInput] = useState("");
  const [showDropdownAssessment, setShowDropdownAssessment] = useState(false);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const assessmentDropdownRef = useRef(null);
  const assessmentInputRef = useRef(null);

  // Assessment sections state - LAZY LOADING APPROACH
  const [assessmentSections, setAssessmentSections] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState({});
  const [sectionsCache, setSectionsCache] = useState({});

  // Fetch assigned candidates
  const fetchAssignedCandidates = async (assessmentId) => {
    // <---------------------- v1.0.1
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`
      );

      // Check if response has the expected structure
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const assigned = response.data.data.flatMap((schedule) =>
          schedule.candidates.map((candidate) => ({
            candidateId: candidate.candidateId._id.toString(),
            scheduleOrder: schedule.order,
          }))
        );
        setAssignedCandidates(assigned);
      } else {
        // Handle case where no schedules exist or different response structure
        setAssignedCandidates([]);
      }
    } catch (error) {
      console.error("Error fetching assigned candidates:", error);
      setAssignedCandidates([]);
    }
  };

  // <---------------------- v1.0.1 >

  // LAZY LOADING: Fetch sections for a specific assessment only when needed
  const fetchAssessmentSections = async (assessmentId) => {
    // Check if already cached
    if (sectionsCache[assessmentId] !== undefined) {
      return sectionsCache[assessmentId];
    }

    // Check if already loading
    if (sectionsLoading[assessmentId]) {
      return;
    }

    setSectionsLoading((prev) => ({ ...prev, [assessmentId]: true }));

    try {
      const { data, error } = await fetchAssessmentQuestions(assessmentId);

      let sections = 0;
      if (!error && data && data.sections) {
        sections = data.sections.length || 0;
      }

      const result = { id: assessmentId, sections };

      // Cache the result
      setSectionsCache((prev) => ({ ...prev, [assessmentId]: result }));
      setAssessmentSections((prev) => ({ ...prev, [assessmentId]: sections }));

      return result;
    } catch (error) {
      console.error(
        "Error fetching sections for assessment:",
        assessmentId,
        error
      );
      const result = { id: assessmentId, sections: 0 };
      setSectionsCache((prev) => ({ ...prev, [assessmentId]: result }));
      setAssessmentSections((prev) => ({ ...prev, [assessmentId]: 0 }));
      return result;
    } finally {
      setSectionsLoading((prev) => ({ ...prev, [assessmentId]: false }));
    }
  };

  //
  useEffect(() => {
    if (fromscheduleAssessment) {
      // When fromscheduleAssessment is true, we don't have an assessment initially
      setSelectedAssessment(null);
      setAssignedCandidates([]);
    } else if (assessment._id) {
      // When fromscheduleAssessment is false, we have an assessment
      setSelectedAssessment(assessment);
      fetchAssignedCandidates(assessment._id);
      // Pre-fetch sections for the current assessment
      fetchAssessmentSections(assessment._id);
    }
  }, [assessment._id, fromscheduleAssessment]);

  // Load candidates when popup opens
  useEffect(() => {
    if (isOpen) {
      // Refetch candidates to ensure we have the latest data
      refetchCandidates();
      // ------------------------------ v1.0.2 >
      fetchAssessmentQuestions();
      // ------------------------------ v1.0.2 >
    }
  }, [isOpen, refetchCandidates]);

  // REMOVED: The problematic bulk section fetching useEffect that was causing performance issues

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownCandidate(false);
      }
      if (
        assessmentDropdownRef.current &&
        !assessmentDropdownRef.current.contains(event.target)
      ) {
        setShowDropdownAssessment(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Assessment selection handlers
  const handleAssessmentInputChange = (e) => {
    const inputValue = e.target.value;
    setAssessmentInput(inputValue);

    // LAZY LOADING: Only filter based on cached data or fetch as needed
    const filterAssessments = async () => {
      const filtered = [];

      for (const assessment of assessmentData) {
        const hasSections = assessmentSections[assessment._id] ?? 0;
        const matchesInput = assessment.AssessmentTitle.toLowerCase().includes(
          inputValue.toLowerCase()
        );

        if (matchesInput) {
          if (hasSections > 0) {
            filtered.push(assessment);
          } else if (
            sectionsCache[assessment._id] === undefined &&
            !sectionsLoading[assessment._id]
          ) {
            // Fetch sections for this assessment if not cached
            const result = await fetchAssessmentSections(assessment._id);
            if (result.sections > 0) {
              filtered.push(assessment);
            }
          }
        }
      }

      setFilteredAssessments(filtered);
    };

    filterAssessments();
    setShowDropdownAssessment(true);
  };

  const handleAssessmentDropdownToggle = () => {
    if (showDropdownAssessment) {
      setShowDropdownAssessment(false);
    } else {
      setShowDropdownAssessment(true);
      if (!assessmentInput) {
        // LAZY LOADING: Filter assessments with sections using cached data
        const filterAssessmentsWithSections = async () => {
          const filteredAssessmentsWithSections = [];

          for (const assessment of assessmentData) {
            const sectionCount = assessmentSections[assessment._id] ?? 0;
            if (sectionCount > 0) {
              filteredAssessmentsWithSections.push(assessment);
            } else if (
              sectionsCache[assessment._id] === undefined &&
              !sectionsLoading[assessment._id]
            ) {
              // Fetch sections if not cached
              const result = await fetchAssessmentSections(assessment._id);
              if (result.sections > 0) {
                filteredAssessmentsWithSections.push(assessment);
              }
            }
          }

          setFilteredAssessments(filteredAssessmentsWithSections);
        };

        filterAssessmentsWithSections();
      }
      // Focus input when dropdown is opened
      setTimeout(() => {
        if (assessmentInputRef.current) assessmentInputRef.current.focus();
      }, 0);
    }
  };

  const handleAssessmentSelect = (assessment) => {
    if (assessment) {
      setSelectedAssessment(assessment);
      setAssessmentInput(assessment.AssessmentTitle);
      setErrors({ ...errors, Assessment: "" });
      // Fetch assigned candidates for the selected assessment
      fetchAssignedCandidates(assessment._id);
      // Pre-fetch sections for the selected assessment
      fetchAssessmentSections(assessment._id);
    }
    setShowDropdownAssessment(false);
  };
  // <---------------------- v1.0.1 >

  const handleCandidateInputChange = (e) => {
    const inputValue = e.target.value;
    setCandidateInput(inputValue);

    const filtered = candidateData.filter(
      (candidate) =>
        `${candidate.FirstName} ${candidate.LastName}`
          .toLowerCase()
          .includes(inputValue.toLowerCase()) ||
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
        // <---------------------- v1.0.1
        // Use already loaded candidate data
        setFilteredCandidates(candidateData || []);
      }
      // Focus input when dropdown is opened
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
    }
  };

  const handleCandidateSelect = (candidate) => {
    if (
      candidate &&
      !selectedCandidates.some((selected) => selected._id === candidate._id)
    ) {
      // <-------------------------------v1.0.3
      // const assignedSchedules = assignedCandidates.
      // filter(
      //   (ac) => ac.candidateId === candidate._id.
      //   toString()
      // );
      // if (assignedSchedules.length > 0) {
      //   const scheduleNames = assignedSchedules.map
      //   ((ac) => ac.scheduleOrder).join(', ');
      //   toast.error(
      //     `${candidate.LastName} is already assigned
      //     to ${scheduleNames}.`
      //   );
      //   return;
      // }
      // Remove the restriction that prevents selecting already assigned candidates
      // This allows creating multiple schedule assessments for the same assessment template
      setSelectedCandidates([...selectedCandidates, candidate]);
      setErrors({ ...errors, Candidate: "" });
    }
    setCandidateInput("");
    setShowDropdownCandidate(false);
  };

  // Add this new function to handle multi-select
  const handleSelectAllVisible = () => {
    const newCandidates = filteredCandidates.filter(
      (candidate) =>
        // !selectedCandidates.some(selected => selected.
        //   _id === candidate._id) &&
        //   !assignedCandidates.some(ac => ac.candidateId
        //   === candidate._id.toString())
        !selectedCandidates.some((selected) => selected._id === candidate._id)
      // Remove the restriction that prevents selecting already assigned candidates
    );

    if (newCandidates.length > 0) {
      setSelectedCandidates([...selectedCandidates, ...newCandidates]);
      setErrors({ ...errors, Candidate: "" });
      toast.success(`Added ${newCandidates.length} candidates`);
    } else {
      toast.error("No new candidates to add from current view");
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
  //
  const handleAddNewCandidateClick = () => {
    setShowMainContent(false);
    // <------------------------------- v1.0.0
    navigate("/candidate/new");
    // ------------------------------ v1.0.0 >
  };
  // <---------------------- v1.0.1 >
  const handleShareClick = async () => {
    // Validate assessment selection when fromscheduleAssessment is true
    if (fromscheduleAssessment && !selectedAssessment) {
      setErrors({
        ...errors,
        Assessment: "Please select an assessment template.",
      });
      return;
    }

    if (selectedCandidates.length === 0) {
      setErrors({
        ...errors,
        Candidate: "Please select at least one candidate.",
      });
      return;
    }

    console.log("selectedAssessment", {
      assessmentId: fromscheduleAssessment
        ? selectedAssessment._id
        : assessment._id,
      selectedCandidates,
      linkExpiryDays,
      onClose: onCloseshare,
      setErrors,
      setIsLoading,
      organizationId,
      userId,
      queryClient,
    });

    setIsLoading(true);
    const result = await shareAssessmentAPI({
      assessmentId: fromscheduleAssessment
        ? selectedAssessment._id
        : assessment._id,
      selectedCandidates,
      linkExpiryDays,
      onClose: onCloseshare,
      setErrors,
      setIsLoading,
      organizationId,
      userId,
      queryClient,
    });
    console.log("assessment result", result);

    if (result.success) {
      // React Query will handle data refresh automatically
      // No need to manually fetch data
    } else {
      toast.error(result.message || "Failed to schedule assessment");
    }
    setIsLoading(false);
  };
  // <-------------------------------v1.0.3 >
  if (!isOpen) return null;

  return (
    <div
      // v1.0.7 <-------------------------------------------------------------------------------------------
      className="fixed inset-0 bg-black top-0 bg-opacity-30 z-50 flex items-center justify-center px-2"
      // v1.0.7 ------------------------------------------------------------------------------------------->
      onClick={onCloseshare}
    >
      {/* v1.0.6 <----------------------------------------------------------------------------------- */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[100vh] ${
          showDropdownCandidate ? "h-[466px]" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* v1.0.6 -----------------------------------------------------------------------------------> */}
        {isLoading && <Loading message="Sending emails..." />}

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
        {/* <------------------------------- v1.0.0  */}
        {showMainContent && (
          <>
            <div className="sticky top-0 p-4 rounded-t-lg flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold">Share Assessment</h2>
              </div>
              <button
                className=" transition-colors p-1 rounded-full"
                onClick={onCloseshare}
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>

            <div className="p-4">
              {/* <---------------------- v1.0.1 */}
              {/* Assessment Template Selection */}
              {fromscheduleAssessment ? (
                <div className="mb-6">
                  <DropdownWithSearchField
                    containerRef={assessmentDropdownRef}
                    label="Assessment Template"
                    required
                    name="Assessment"
                    value={selectedAssessment?._id || ""}
                    options={
                      assessmentData?.map((assessment) => ({
                        value: assessment._id,
                        label: assessment.AssessmentTitle,
                      })) || []
                    }
                    onChange={(e) => {
                      const assessmentId = e?.target?.value;
                      if (assessmentId) {
                        const assessment = assessmentData.find(
                          (a) => a._id === assessmentId
                        );
                        if (assessment) {
                          handleAssessmentSelect(assessment);
                        }
                      }
                    }}
                    error={errors.Assessment}
                    placeholder="Search assessment templates..."
                    isSearchable={true}
                  />
                </div>
              ) : (
                <p className="font-semibold mb-2">
                  Assessment Template Title:{" "}
                  <span className="text-sm text-custom-blue">
                    {assessment.AssessmentTitle}
                  </span>
                </p>
              )}
              {/* <---------------------- v1.0.1 > */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="Candidate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Candidate <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={handleAddNewCandidateClick}
                    className="flex items-center text-sm text-custom-blue hover:text-custom-blue/90"
                  >
                    <Plus className="mr-1 w-5 h-5" />
                    Add New Candidate
                  </button>
                </div>

                <DropdownWithSearchField
                  containerRef={dropdownRef}
                  name="Candidate"
                  value={selectedCandidates.map((c) => c._id)}
                  options={[
                    ...(candidateData?.map((candidate) => ({
                      value: candidate._id,
                      label: `${candidate.FirstName} ${candidate.LastName}`,
                      subLabel: candidate.Email,
                      data: candidate,
                    })) || []),
                    {
                      value: "select_all",
                      label: "Select All",
                      isSticky: true,
                      className: "text-blue-600 font-medium border-t",
                    },
                  ]}
                  onChange={(e) => {
                    const values = e?.target?.value || [];

                    // Check if "Select All" was clicked
                    if (values.includes("select_all")) {
                      // If "select_all" was just added, select all candidates
                      if (
                        !selectedCandidates
                          .map((c) => c._id)
                          .includes("select_all")
                      ) {
                        setSelectedCandidates(candidateData || []);
                        // Note: The component won't actually select "select_all" in its value
                        // We just use it as a trigger
                        return;
                      }
                    }

                    // Handle regular selection changes
                    const currentIds = selectedCandidates.map((c) => c._id);
                    const newIds = values.filter((v) => v !== "select_all");

                    // Find which IDs were added or removed
                    const addedIds = newIds.filter(
                      (id) => !currentIds.includes(id)
                    );
                    const removedIds = currentIds.filter(
                      (id) => !newIds.includes(id)
                    );

                    // Add new selections
                    addedIds.forEach((id) => {
                      const candidate = candidateData.find((c) => c._id === id);
                      if (candidate) {
                        setSelectedCandidates((prev) => [...prev, candidate]);
                      }
                    });

                    // Remove deselected items
                    removedIds.forEach((id) => {
                      setSelectedCandidates((prev) =>
                        prev.filter((c) => c._id !== id)
                      );
                    });

                    // Clear error when selection is made
                    if (newIds.length > 0) {
                      setErrors({ ...errors, Candidate: "" });
                    }
                  }}
                  error={errors.Candidate}
                  placeholder="Search by name or email..."
                  isSearchable={true}
                  isMulti={true}
                  loading={loading}
                />

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
                            <span className="font-medium">
                              {candidate.LastName}
                            </span>
                            {candidate.Email && (
                              <span className="ml-1 text-xs text-blue-600">
                                ({candidate.Email})
                              </span>
                            )}
                            <button
                              onClick={() =>
                                handleCandidateRemove(candidate._id)
                              }
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
                className="px-6 py-2 bg-custom-blue hover:bg-custom-blue/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                // <---------------------- v1.0.1
                disabled={
                  isLoading ||
                  selectedCandidates.length === 0 ||
                  (fromscheduleAssessment && !selectedAssessment)
                }
                // <---------------------- v1.0.1 >
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
                  "Share Assessment"
                )}
              </button>
            </div>
          </>
        )}
        {/* ------------------------------ v1.0.0 > */}
      </div>
    </div>
  );
};

export default ShareAssessment;
