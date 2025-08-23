// v1.0.0  -  mansoor  -  when we select the interview template then error is getting that is solved now
// v1.0.1  -  mansoor  -  fixed dropdown alignments of candidate and position
// v1.0.2  -  mansoor  -  added the add new buttons in the candidate and position dropdowns
// v1.0.3  -  Ashok    -  Disabled outer scrollbar when popup is open for better UX
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb.jsx";
import { useCandidates } from "../../../../../apiHooks/useCandidates";
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import LoadingButton from "../../../../../Components/LoadingButton";
import { useInterviewTemplates } from "../../../../../apiHooks/useInterviewTemplates.js";
import { usePositions } from "../../../../../apiHooks/usePositions.js";
import AddCandidateForm from "../../Candidate-Tab/AddCandidateForm.jsx";
import PositionForm from "../../Position-Tab/Position-Form.jsx";
// v1.0.3 <-----------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.3 ----------------------------------------------------------->

// Custom Dropdown Component
const CustomDropdown = ({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  error = false,
  placeholder = "Select an option",
  className = "",
  onAddNew = null,
  addNewLabel = "+ Add New",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownClass = `relative mt-1 block w-full ${className}`;
  // <-------------------- v1.0.0
  const buttonClass = `w-full pl-3 pr-10 py-2 text-base border ${
    error ? "border-red-500" : disabled ? "border-gray-200" : "border-gray-300"
  } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
    disabled ? "bg-gray-50 cursor-not-allowed" : ""
  } text-left`;
  // v1.0.0 ---------------------------->

  // <-------------------- v1.0.1
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(`[data-dropdown="${id}"]`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, id]);
  //  v1.0.1---------------------->

  // <-------------------- v1.0.2
  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      setIsOpen(false);
    }
  };
  //  v1.0.2 ---------------------->

  return (
    <div className={dropdownClass} data-dropdown={id}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {/* <-------------------- v1.0.0 */}
        {label} {required && <span className="text-red-500">*</span>}
        {/* v1.0.0 ----------------------------> */}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={buttonClass}
          disabled={disabled}
        >
          {/* <-------------------- v1.0.0 */}
          {value
            ? options.find((opt) => opt.value === value)?.label || value
            : placeholder}
          {/* v1.0.0 ----------------------------> */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200">
            {/* <--------------------v1.0.1 */}
            {options.length === 0 ? (
              // Empty state - minimal height
              <div className="py-3 px-4 text-sm text-gray-500 text-center">
                No data found
              </div>
            ) : (
              // Options list with controlled height
              <ul className="py-1 text-base text-gray-900 max-h-48 overflow-y-auto">
                {options.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      // Prevent selection of loading items
                      if (option.value === "loading") return;
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
                      option.value === "loading"
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    } ${
                      value === option.value
                        ? "bg-custom-blue/10 text-custom-blue"
                        : ""
                    }`}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
            {/* v1.0.1------------------> */}

            {/* Add New Button */}
            {onAddNew && (
              <div className="border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 transition-colors duration-150"
                >
                  <span className="text-gray-900 font-medium">
                    {addNewLabel}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Reusable Modal Component
const ConfirmationModal = ({ isOpen, onClose, onProceed, message }) => {
  // v1.0.3 <-----------------------------------------------------------
  useScrollLock(isOpen);
  // v1.0.3 ----------------------------------------------------------->

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900">
          Confirm Template Change
        </h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

const InterviewForm = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const orgId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { positionData, isLoading: positionsLoading } = usePositions();
  const { templatesData, isLoading: templatesLoading } =
    useInterviewTemplates();
  const { interviewData, isMutationLoading, createInterview } = useInterviews();
  const { candidateData, isLoading: candidatesLoading } = useCandidates();

  const [candidateId, setCandidateId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [positionError, setPositionError] = useState("");
  // <---------------------- v1.0.2
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [from360, setFrom360] = useState(false);

  // Modal handlers for Add New buttons
  const handleAddNewCandidate = () => {
    setShowCandidateModal(true);
  };

  const handleAddNewPosition = () => {
    setShowPositionModal(true);
  };

  const handleCloseCandidateModal = () => {
    setShowCandidateModal(false);
  };

  const handleClosePositionModal = () => {
    setShowPositionModal(false);
  };

  const handleCandidateCreated = (newCandidate) => {
    setShowCandidateModal(false);
    if (newCandidate && newCandidate._id) {
      setCandidateId(newCandidate._id);
      setCandidateError("");
    }
    // The candidate data will be automatically refreshed by the useCandidates hook
  };

  const handlePositionCreated = (newPosition) => {
    setShowPositionModal(false);
    if (newPosition && newPosition._id) {
      setPositionId(newPosition._id);
      setPositionError("");
    }
    // The position data will be automatically refreshed by the usePositions hook
  };

  // Handle click outside to close modals
  const handleModalBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      if (modalType === "candidate") {
        handleCloseCandidateModal();
      } else if (modalType === "position") {
        handleClosePositionModal();
      }
    }
  };
  //  v1.0.1---------------------->

  const isEditing = !!id;
  const interview = isEditing
    ? interviewData.find((interview) => interview._id === id)
    : null;
  //console.log('interview-----',interview);

  useEffect(() => {
    if (isEditing && interview) {
      setCandidateId(interview.candidateId._id);
      setPositionId(interview.positionId._id);
      setTemplateId(interview.templateId?._id);
    }
  }, [isEditing, interview]);

  useEffect(() => {
    if (positionId) {
      const selectedPosition = positionData.find(
        (pos) => pos._id === positionId
      );
      if (selectedPosition) {
        if (selectedPosition.templateId) {
          setTemplateId(selectedPosition.templateId);
          toast.info("Template and rounds are fetched from the position.");
        } else {
          setTemplateId("");
        }
      }
    }
  }, [positionId]);

  useEffect(() => {
    if (
      location.state?.candidateId &&
      candidateData?.length > 0 &&
      !candidateId
    ) {
      setCandidateId(location.state.candidateId);
      setFrom360(!!location.state.from360);
    }
  }, [location.state, candidateData, candidateId]);

  // <-------------------- v1.0.0
  const handleTemplateChange = (newTemplateId) => {
    // v1.0.0 ---------------------------->
    if (!positionId) {
      toast.error("Please select a position first.", { autoClose: 3000 });
      return;
    }

    const selectedPosition = positionData.find((pos) => pos._id === positionId);

    if (selectedPosition) {
      if (
        (selectedPosition.rounds && selectedPosition.rounds.length > 0) ||
        selectedPosition.templateId
      ) {
        setTemplateId(newTemplateId);
        setShowModal(true);
      } else {
        setTemplateId(newTemplateId);
      }
    }
  };

  const handleProceed = () => {
    setShowModal(false);
    handleSubmit();
  };

  const handleCancel = () => {
    setTemplateId("");
    setShowModal(false);
  };

  // <-------------------- v1.0.0
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Reset errors
    setCandidateError("");
    setPositionError("");

    let hasError = false;

    if (!candidateId) {
      setCandidateError("Candidate is required");
      hasError = true;
    }

    if (!positionId) {
      setPositionError("Position is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const selectedTemplate = templateId
        ? templatesData.find((template) => template._id === templateId)
        : null;

      if (templateId && !selectedTemplate) {
        throw new Error("Selected template not found");
      }

      // Use createInterview mutation from useInterviews hook
      const result = await createInterview({
        candidateId,
        positionId,
        orgId,
        userId,
        templateId,
        id, // interviewId
      });
      // On success, navigate to rounds step and pass state
      const interviewId = result?._id || id;
      if (interviewId && templateId) {
        navigate(`/interviews/${interviewId}`);
      } else {
        navigate(`/interviews/${interviewId}/rounds/new`, {
          state: { candidateId, from360 },
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
    }
  };
  // v1.0.0 ---------------------------->

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumb
            items={[
              { label: "Interviews", path: "/interviewList" },
              ...(isEditing && interview
                ? [
                    {
                      label: candidateData?.LastName || "Interview",
                      path: `/interviews/${id}`,
                      status: interview.status,
                    },
                    { label: "Edit Interview", path: "" },
                  ]
                : [{ label: "New Interview", path: "" }]),
            ]}
          />

          <div className="mt-4 bg-white shadow overflow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? "Edit Interview" : "Create New Interview"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing
                  ? "Update the interview details below"
                  : "Fill in the details to create a new interview"}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <CustomDropdown
                      id="candidate"
                      label="Candidate"
                      value={candidateId}
                      onChange={(value) => {
                        setCandidateId(value);
                        setCandidateError("");
                      }}
                      // <-------------v1.0.1
                      options={
                        candidatesLoading
                          ? [
                              {
                                value: "loading",
                                label: "Loading candidates...",
                              },
                            ]
                          : candidateData?.length > 0
                          ? candidateData.map((candidate) => ({
                              value: candidate._id,
                              label: `${candidate.FirstName || ""} ${
                                candidate.LastName
                              } (${candidate.Email})`,
                            }))
                          : []
                      }
                      error={candidateError}
                      placeholder={
                        candidatesLoading ? "Loading..." : "Select a Candidate"
                      }
                      disabled={candidatesLoading || from360}
                      onAddNew={handleAddNewCandidate}
                      addNewLabel="+ Add New Candidate"
                      required={true}
                    />
                    {/* v1.0.1-------------> */}
                  </div>

                  <div>
                    <CustomDropdown
                      id="position"
                      label="Position"
                      value={positionId}
                      onChange={(value) => {
                        setPositionId(value);
                        setPositionError("");
                      }}
                      // <----------------v1.0.1
                      options={
                        positionsLoading
                          ? [
                              {
                                value: "loading",
                                label: "Loading positions...",
                              },
                            ]
                          : positionData?.length > 0
                          ? positionData.map((position) => ({
                              value: position._id,
                              label: position.title,
                            }))
                          : []
                      }
                      error={positionError}
                      placeholder={
                        positionsLoading ? "Loading..." : "Select a Position"
                      }
                      disabled={positionsLoading}
                      onAddNew={handleAddNewPosition}
                      addNewLabel="+ Add New Position"
                      required={true}
                    />
                    {/* v1.0.1-----------------> */}
                  </div>

                  <div>
                    <CustomDropdown
                      id="template"
                      label="Interview Template"
                      required={false}
                      value={templateId}
                      onChange={handleTemplateChange}
                      // <----------v1.0.1
                      options={
                        templatesLoading
                          ? [
                              {
                                value: "loading",
                                label: "Loading templates...",
                              },
                            ]
                          : (templatesData ?? [])
                              .filter(
                                (template) =>
                                  template.rounds &&
                                  template.rounds.length > 0 &&
                                  template.status === "active"
                              )
                              .map((template) => ({
                                value: template._id,
                                label: template.templateName,
                              }))
                      }
                      disabled={!positionId || templatesLoading}
                      placeholder={
                        templatesLoading ? "Loading..." : "Select a Template"
                      }
                    />
                    {/* v1.0.1 -------------------> */}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 border border-custom-blue rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    {/* <button type="submit" disabled={submitting}
                      className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90">
                      {submitting ? 'Saving...' : isEditing ? 'Update Interview' : 'Create Interview'}
                    </button> */}

                    <LoadingButton
                      onClick={handleSubmit}
                      isLoading={isMutationLoading}
                      loadingText={isEditing ? "Updating..." : "Saving..."}
                    >
                      {isEditing ? "Update Interview" : "Create Interview"}
                    </LoadingButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onProceed={handleProceed}
        message="Changing the template will override the existing rounds. Do you want to proceed?"
      />

      {/* <---------------------- v1.0.2 */}
      {/* Candidate Modal */}
      {showCandidateModal && (
        // <div
        //   className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        //   onClick={(e) => handleModalBackdropClick(e, 'candidate')}
        // >
        //   <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] overflow-hidden relative">
        //     <button
        //       onClick={handleCloseCandidateModal}
        //       className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg"
        //     >
        //       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        //       </svg>
        //     </button>
        <AddCandidateForm
          mode="Create"
          onClose={handleCandidateCreated}
          isModal={true}
          hideAddButton={true}
        />
        //   </div>
        // </div>
      )}

      {/* Position Modal */}
      {showPositionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={(e) => handleModalBackdropClick(e, "position")}
        >
          <PositionForm
            mode="new"
            onClose={handlePositionCreated}
            isModal={true}
          />
        </div>
      )}
      {/* v1.0.1----------------------> */}
    </div>
  );
};

export default InterviewForm;
