// v1.0.0  -  mansoor  -  when we select the interview template then error is getting that is solved now
// v1.0.1  -  mansoor  -  fixed dropdown alignments of candidate and position
// v1.0.2  -  mansoor  -  added the add new buttons in the candidate and position dropdowns
// v1.0.3  -  Ashok    -  Disabled outer scrollbar when popup is open for better UX
// v1.0.4  -  Ashok    -  Improved responsiveness
// v1.0.6  -  Ranjith    -  Fixed issues at responsiveness
// v1.0.7  -  Ashok    -  Z-index issue fixed when opening position form

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
// import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb.jsx";
import { useCandidates } from "../../../../../apiHooks/useCandidates";
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import { useFilteredApplications } from "../../../../../apiHooks/useApplications.js";
import LoadingButton from "../../../../../Components/LoadingButton";
import { useInterviewTemplates } from "../../../../../apiHooks/useInterviewTemplates.js";
import {
  usePositions,
  usePositionById,
} from "../../../../../apiHooks/usePositions.js";
import AddCandidateForm from "../../Candidate-Tab/AddCandidateForm.jsx";
import PositionForm from "../../Position-Tab/Position-Form.jsx";
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField.jsx";
// v1.0.3 <-----------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
import { notify } from "../../../../../services/toastService.js";
import InfoGuide from "../../CommonCode-AllTabs/InfoCards.jsx";
import { Button } from "../../../../../Components/Buttons/Button.jsx";
import { ArrowLeft, Info, CheckCircle } from "lucide-react";

// v1.0.3 ----------------------------------------------------------->

// Custom Dropdown Component

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
  const isOrganization = tokenPayload?.organization === true;
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const DROPDOWN_LIMIT = 50;

  const [candidateLimit, setCandidateLimit] = useState(DROPDOWN_LIMIT);
  const [positionLimit, setPositionLimit] = useState(DROPDOWN_LIMIT);
  const [templateLimit, setTemplateLimit] = useState(DROPDOWN_LIMIT);

  // State for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest(".tooltip-container")) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  const [candidateSearch, setCandidateSearch] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState("");
  const [debouncedPositionSearch, setDebouncedPositionSearch] = useState("");
  const [debouncedTemplateSearch, setDebouncedTemplateSearch] = useState("");

  const {
    positionData,
    total: totalPositions,
    isQueryLoading: positionsLoading,
  } = usePositions({
    page: 1,
    limit: positionLimit,
    ...(debouncedPositionSearch && { searchQuery: debouncedPositionSearch }),
  });

  const {
    templatesData,
    totalCount: totalTemplates,
    isQueryLoading: templatesLoading,
  } = useInterviewTemplates({
    type: "interviewtemplates",
    page: 1,
    limit: templateLimit,
    ...(debouncedTemplateSearch && { search: debouncedTemplateSearch }),
  });

  const { useInterviewDetails, isMutationLoading, createInterview } =
    useInterviews();
  const {
    candidateData,
    totalCandidates,
    isQueryLoading: candidatesLoading,
  } = useCandidates({
    page: 1,
    limit: candidateLimit,
    ...(debouncedCandidateSearch && { search: debouncedCandidateSearch }),
  });

  const [candidateId, setCandidateId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [allowParallelScheduling, setAllowParallelScheduling] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [positionError, setPositionError] = useState("");
  // <---------------------- v1.0.2
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [from360, setFrom360] = useState(false);


  const [rounds, setRounds] = useState([]);

  // Application Filtering State
  const [applicationId, setApplicationId] = useState("");
  const { applications: filteredApplications, isLoading: applicationsLoading } = useFilteredApplications({
    status: "New,APPLIED,SCREENED", // Match strict enum casing from Application model
    tenantId: orgId
  });

  const handleApplicationChange = (appId) => {
    setApplicationId(appId);

    if (appId) {
      const selectedApp = filteredApplications.find(app => app._id === appId);
      if (selectedApp) {
        setCandidateId(selectedApp.candidateId?._id || selectedApp.candidateId);
        setPositionId(selectedApp.positionId?._id || selectedApp.positionId);
        // Clear errors
        setCandidateError("");
        setPositionError("");
      }
    } else {
      // If cleared, maybe reset? Or keep as is?
      // User said "we can remove selceted options also"
      // I will reset them to allow manual selection again
      setCandidateId("");
      setPositionId("");
    }
  };

  // <---------------------- Manual Selection Validation
  const [manualValidationMsg, setManualValidationMsg] = useState("");
  const { applications: existingApplications } = useFilteredApplications({
    candidateId: !applicationId ? candidateId : null,
    positionId: !applicationId ? positionId : null,
    tenantId: orgId
  });

  useEffect(() => {
    setManualValidationMsg("");
    if (!applicationId && candidateId && positionId && existingApplications?.length > 0) {
      const app = existingApplications[0]; // Assuming one app per candidate-position pair
      const allowedStatuses = ["New", "APPLIED", "SCREENED"];

      if (!allowedStatuses.includes(app.status)) {
        setManualValidationMsg(`Cannot create interview: Application exists in '${app.status}' status. Only New, Applied, or Screened applications can proceed.`);
      }
    }
  }, [applicationId, candidateId, positionId, existingApplications]);
  // Manual Selection Validation ---------------------->


  // Filter positions to show only "opened" status
  const filteredPositionData =
    positionData?.filter((position) => position.status === "opened") || [];

  // Always load full position details by id (unfiltered, unpaginated)
  // so rounds/template are correct even if the position is not in the
  // current paginated/filtered positionData list.
  const { position: selectedPosition } = usePositionById(positionId);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCandidateSearch(candidateSearch.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [candidateSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPositionSearch(positionSearch.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [positionSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTemplateSearch(templateSearch.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [templateSearch]);

  useEffect(() => {
    setCandidateLimit(DROPDOWN_LIMIT);
  }, [debouncedCandidateSearch]);

  useEffect(() => {
    setPositionLimit(DROPDOWN_LIMIT);
  }, [debouncedPositionSearch]);

  useEffect(() => {
    setTemplateLimit(DROPDOWN_LIMIT);
  }, [debouncedTemplateSearch]);

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

  const { data: interview, isLoading: interviewLoading } = useInterviewDetails(
    // isEditing ? id : null
    isEditing ? { interviewId: id } : {},
  );

  // v1.0.7  -  Your Name  -  Fixed template dropdown not showing selected value in edit mode

  useEffect(() => {
    if (isEditing && interview && templatesData.length > 0) {
      setCandidateId(interview.candidateId?._id || "");
      setPositionId(interview.positionId?._id || "");
      setExternalId(interview.externalId || "");
      setAllowParallelScheduling(interview.allowParallelScheduling || false);

      // Fix for template - handle the nested object structure
      if (interview.templateId) {
        let templateIdToSet = null;

        if (
          typeof interview.templateId === "object" &&
          interview.templateId._id
        ) {
          templateIdToSet = interview.templateId._id;
        } else if (typeof interview.templateId === "string") {
          templateIdToSet = interview.templateId;
        }

        // Verify template exists in templatesData
        if (templateIdToSet) {
          const templateExists = templatesData.some(
            (t) => t._id === templateIdToSet,
          );
          if (templateExists) {
            // Use setTimeout to ensure state updates after component renders
            setTimeout(() => {
              setTemplateId(templateIdToSet);
            }, 0);
          } else {
            console.warn(
              "Template not found in templatesData:",
              templateIdToSet,
            );
            setTemplateId("");
          }
        }
      } else {
        setTemplateId("");
      }

      if (interview?.rounds && interview?.rounds.length > 0) {
        setRounds(interview?.rounds);
      } else {
        setRounds([]);
      }
    }
  }, [isEditing, interview, templatesData]);

  const handleCandidateMenuScrollToBottom = () => {
    if (candidatesLoading) return;
    if (!totalCandidates || candidateLimit >= totalCandidates) return;

    setCandidateLimit((prev) => prev + DROPDOWN_LIMIT);
  };

  const handlePositionMenuScrollToBottom = () => {
    if (positionsLoading) return;
    if (!totalPositions || positionLimit >= totalPositions) return;

    setPositionLimit((prev) => prev + DROPDOWN_LIMIT);
  };

  const handleTemplateMenuScrollToBottom = () => {
    if (templatesLoading) return;
    if (!totalTemplates || templateLimit >= totalTemplates) return;

    setTemplateLimit((prev) => prev + DROPDOWN_LIMIT);
  };

  useEffect(() => {
    if (!positionId) {
      return;
    }

    if (!selectedPosition) {
      return;
    }

    console.log("interview", interview);

    const isOriginalInterviewPosition =
      isEditing && interview?.positionId?._id === positionId;

    console.log("isOriginalInterviewPosition", isOriginalInterviewPosition);
    console.log("selectedPosition", selectedPosition);

    // Always apply position template when position changes (for both create and edit modes)
    // Only skip in edit mode if it's the original position that hasn't changed
    if (isOriginalInterviewPosition) {
      return;
    }

    if (selectedPosition?.rounds && selectedPosition?.rounds.length > 0) {
      setRounds(selectedPosition?.rounds);
    } else {
      setRounds([]);
    }

    // Always set templateId from position when position changes
    // Check if templateId exists in position data
    if (selectedPosition?.templateId) {
      // Handle both object and string formats
      let templateIdToSet = "";

      if (
        typeof selectedPosition.templateId === "object" &&
        selectedPosition.templateId._id
      ) {
        templateIdToSet = selectedPosition.templateId._id;
      } else if (typeof selectedPosition.templateId === "string") {
        templateIdToSet = selectedPosition.templateId;
      }

      if (templateIdToSet) {
        // Verify template exists in available templates before setting
        const templateExists = templatesData?.some(
          (t) => t._id === templateIdToSet,
        );
        if (templateExists) {
          setTemplateId(templateIdToSet);
        } else {
          console.warn(
            "Template from position not found in available templates:",
            templateIdToSet,
          );
          setTemplateId("");
        }
      } else {
        setTemplateId("");
      }
    } else {
      setTemplateId("");
    }
  }, [positionId, selectedPosition, isEditing, interview, templatesData]);

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
      notify.error("Please select a position first.");
      return;
    }

    const selectedPosition = positionData.find((pos) => pos._id === positionId);
    const selectedTemplate = templatesData?.find(
      (t) => t._id === newTemplateId,
    );

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

      if (selectedTemplate && selectedTemplate.rounds?.length > 0) {
        setRounds(selectedTemplate.rounds);
        // toast.success("Rounds have been overridden by the template.");
      }
    }
  };

  const handleProceed = () => {
    setShowModal(false);
    handleSubmit();
  };

  const handleCancel = () => {
    setTemplateId("");
    const selectedPosition = positionData.find((pos) => pos._id === positionId);

    if (selectedPosition?.rounds && selectedPosition?.rounds.length > 0) {
      setRounds(selectedPosition?.rounds);
    } else {
      setRounds([]);
    }

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

    if (manualValidationMsg) {
      return;
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

      // Determine application ID to link (manual selection or dropdown)
      const appToLink = applicationId || existingApplications?.[0]?._id;

      // Use createInterview mutation from useInterviews hook
      const result = await createInterview({
        candidateId,
        positionId,
        orgId,
        userId,
        templateId,
        externalId,
        allowParallelScheduling,
        applicationId: appToLink, // Pass determined application ID
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
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
    }
  };
  // v1.0.0 ---------------------------->

  // v1.0.6
  const handleClearTemplate = () => {
    setTemplateId("");
    setRounds([]); // Also clear any rounds that were set from template

    // If you want to show a message when template is cleared
    // notify.success("Template cleared");
  };
  // v1.0.6 <----------------------------------->

  return (
    <div className="flex items-center  justify-center w-full">

      <div className="bg-white w-full flex flex-col pb-20">
        {/* <Breadcrumb
            items={[
              { label: "Interviews", path: "/interviews" },
              ...(isEditing && interview
                ? [
                  {
                    label: interview?.candidateId?.LastName || "Interview",
                    path: `/interviews/${id}`,
                    status: interview.status,
                  },
                  { label: "Edit Interview", path: "" },
                ]
                : [{ label: "New Interview", path: "" }]),
            ]}
          /> */}

        <div className="px-[8%] sm:px-[5%] mt-4 mb-2 md:px-[5%]">
          <button
            onClick={() => {
              navigate(-1);
            }}
            type="button"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Interviews
          </button>
        </div>

        {/* Guidelines Component */}
        <div className="px-[8%] sm:px-[5%] md:px-[5%] mb-4">
          <InfoGuide
            className="mt-4"
            title="Interview Creation Guidelines"
            items={[
              <>
                <span className="font-medium">Candidate Selection:</span> Choose
                from existing candidates or add new candidates using the "Add
                New" option
              </>,
              <>
                <span className="font-medium">Position Selection:</span> Only
                positions with "opened" status are available for selection. Use
                "Add New" to create new positions
              </>,
              <>
                <span className="font-medium">Interview Template:</span>{" "}
                Optional - Select a predefined interview template to
                automatically set up rounds and evaluation criteria
              </>,
              <>
                <span className="font-medium">Template Override:</span> Changing
                templates after position selection will override existing rounds
                with template rounds
              </>,
              <>
                <span className="font-medium">Rounds Pathway:</span> The
                interview process flow is displayed as a horizontal stepper
                showing all rounds in sequence
              </>,
              <>
                <span className="font-medium">Status Management:</span>{" "}
                Interviews can have different statuses: draft, opened, closed,
                hold, or cancelled
              </>,
              <>
                <span className="font-medium">Required Fields:</span> Candidate
                and Position are mandatory fields for creating an interview
              </>,
              <>
                <span className="font-medium">Template Clearing:</span> Use the
                × button to clear the selected template and remove associated
                rounds
              </>,
              <>
                <span className="font-medium">Round Types:</span> Supports
                various round types including Assessment, Technical, HR, and
                Final interviews
              </>,
              <>
                <span className="font-medium">Interview Flow:</span> After
                creation, you'll be directed to set up individual rounds with
                specific questions and evaluators
              </>,
            ]}
          />
        </div>

        <div className="px-[8%] sm:px-[5%] md:px-[5%]">
          {/* v1.0.4 <----------------------------------- */}
          {/* <div className="px-6 py-5 sm:px-4">

            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditing ? "Edit Interview" : "Create New Interview"}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isEditing
                ? "Update the interview details below"
                : "Fill in the details to create a new interview"}
            </p>
          </div> */}
          {/* v1.0.4 <-------------------------------------------------------- */}
          <div className="bg-white rounded-lg shadow-md border">
            {/* v1.0.4 --------------------------------------------------------> */}
            <div className="px-6 pt-3">
              <form className="space-y-5 mb-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}


                <div className="space-y-6">
                  {/* Application Dropdown - Only for Organization Users */}
                  {isOrganization && (
                    <>
                      <div>
                        <DropdownWithSearchField
                          label="Application ID"
                          name="applicationId"
                          placeholder="Select an application to auto-fill details..."
                          isClearable={true}
                          loading={applicationsLoading}
                          value={applicationId || ""}
                          options={
                            filteredApplications?.map((app) => ({
                              value: app._id,
                              label: app.applicationNumber, // search key
                              application: app,
                            })) || []
                          }
                          onChange={(e) => {
                            const value = e?.target?.value || e?.value;
                            handleApplicationChange(value);
                          }}
                          formatOptionLabel={(option) => {
                            const app = option.application;
                            if (!app) return option.label;

                            const candidateName = app?.candidateId
                              ? `${app.candidateId.FirstName || ""} ${app.candidateId.LastName || ""}`
                              : "Unknown Candidate";

                            const positionTitle =
                              app?.positionId?.title || "Unknown Position";

                            const statusColors = {
                              NEW: "bg-blue-100 text-blue-800",
                              APPLIED: "bg-blue-100 text-blue-800",
                              SCREENED: "bg-purple-100 text-purple-800",
                              INTERVIEWING: "bg-yellow-100 text-yellow-800",
                              OFFERED: "bg-green-100 text-green-800",
                              HIRED: "bg-emerald-100 text-emerald-800",
                              REJECTED: "bg-red-100 text-red-800",
                              WITHDRAWN: "bg-gray-100 text-gray-800",
                              OPENED: "bg-blue-100 text-blue-800",
                            };

                            const statusKey = app.status?.toUpperCase() || "NEW";
                            const badgeClass =
                              statusColors[statusKey] || "bg-gray-100 text-gray-800";

                            return (
                              <div className="flex items-center justify-between w-full gap-3">
                                {/* LEFT TEXT — SINGLE LINE */}
                                <div className="flex items-center gap-2 text-sm text-gray-800 truncate">
                                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                                    {app.applicationNumber}
                                  </span>

                                  <span className="text-gray-400">•</span>

                                  <span className="truncate whitespace-nowrap">
                                    {candidateName}
                                  </span>

                                  <span className="text-gray-400">|</span>

                                  <span className="truncate whitespace-nowrap">
                                    {positionTitle}
                                  </span>
                                  {/* STATUS BADGE */}
                                  <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${badgeClass}`}
                                  >
                                    {capitalizeFirstLetter(app.status?.toLowerCase() || "")}
                                  </span>
                                </div>


                              </div>
                            );
                          }}
                        />

                        {applicationId && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs">
                            <CheckCircle className="h-4 w-4 text-green-700" />
                            Candidate and Position auto-populated from application.
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-medium bg-white px-2">OR SELECT MANUALLY</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                      </div>
                    </>
                  )}
                  <div>
                    <DropdownWithSearchField
                      label="Candidate"
                      name="candidateId"
                      value={candidateId || ""}
                      options={[
                        ...(candidateData?.map((candidate) => ({
                          value: candidate._id,
                          label: `${candidate.FirstName || ""} ${candidate.LastName || ""
                            } (${candidate.Email || ""})`,
                        })) || []),
                        {
                          value: "add_new",
                          label: "+ Add New Candidate",
                          isSticky: true,
                        },
                      ]}
                      onChange={(e) => {
                        const value = e?.target?.value || e?.value;
                        if (value === "add_new") {
                          handleAddNewCandidate();
                        } else if (value) {
                          setCandidateId(value);
                          setCandidateError("");
                        }
                      }}
                      onInputChange={(inputValue, actionMeta) => {
                        if (actionMeta?.action === "input-change") {
                          setCandidateSearch(inputValue || "");
                        }
                      }}
                      onMenuScrollToBottom={handleCandidateMenuScrollToBottom}
                      error={candidateError}
                      disabled={!!applicationId || (candidatesLoading && !candidateData?.length)}
                      loading={candidatesLoading}
                      required={true}
                      isMulti={false}
                    />
                  </div>

                  <div>
                    <DropdownWithSearchField
                      label="Position"
                      name="positionId"
                      value={positionId || ""}
                      options={[
                        ...(filteredPositionData?.map((position) => ({
                          value: position._id,
                          label: position.title,
                        })) || []),
                        {
                          value: "add_new",
                          label: "+ Add New Position",
                          isSticky: true,
                          className:
                            "text-blue-600 font-medium hover:bg-blue-50",
                        },
                      ]}
                      onChange={(e) => {
                        const value = e?.target?.value || e?.value;
                        if (value === "add_new") {
                          handleAddNewPosition();
                        } else if (value) {
                          setPositionId(value);
                          setPositionError("");
                        }
                      }}
                      onInputChange={(inputValue, actionMeta) => {
                        if (actionMeta?.action === "input-change") {
                          setPositionSearch(inputValue || "");
                        }
                      }}
                      onMenuScrollToBottom={handlePositionMenuScrollToBottom}
                      error={positionError || manualValidationMsg} // Show validation error here
                      disabled={!!applicationId || (positionsLoading && !positionData?.length)}
                      loading={positionsLoading}
                      required={true}
                      isMulti={false}
                    />
                  </div>

                  <div className="relative">
                    <DropdownWithSearchField
                      key={`template-${templateId}-${positionId}`}
                      // key={`template-${templateId}`}
                      label="Interview Template"
                      name="templateId"
                      value={templateId || ""}
                      // options={
                      //   templatesData
                      //     ?.filter(
                      //       (template) =>
                      //         template.rounds && template.rounds.length > 0
                      //     ) // ← FILTER ADDED
                      //     .map((template) => ({
                      //       value: template._id,
                      //       label: `${template.title} (${template.type})`,
                      //     })) || []
                      // }
                      options={
                        templatesData
                          ?.filter(
                            (template) =>
                              template.rounds && template.rounds.length > 0,
                          ) // only with rounds
                          .sort((a, b) => {
                            // custom first, standard after
                            if (a.type === "custom" && b.type === "standard")
                              return -1;
                            if (a.type === "standard" && b.type === "custom")
                              return 1;
                            return 0;
                          })
                          .map((template) => {
                            const titleLabel = capitalizeFirstLetter(
                              template.title ||
                              template.type ||
                              "Unnamed Template",
                            );

                            return {
                              value: template._id,
                              label: (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "99%",
                                  }}
                                >
                                  <span>{titleLabel}</span>
                                  <span
                                    className={
                                      "text-md " +
                                      (template.type === "custom"
                                        ? "text-custom-blue"
                                        : "text-green-600")
                                    }
                                  >
                                    {/* {template.type} */}
                                    {capitalizeFirstLetter(template.type)}
                                  </span>
                                </div>
                              ),
                              searchLabel: titleLabel,
                            };
                          }) || []
                      }
                      onChange={(e) => {
                        const value = e?.target?.value || e?.value;
                        if (value) {
                          handleTemplateChange(value);
                        }
                      }}
                      onInputChange={(inputValue, actionMeta) => {
                        if (actionMeta?.action === "input-change") {
                          setTemplateSearch(inputValue || "");
                        }
                      }}
                      onMenuScrollToBottom={handleTemplateMenuScrollToBottom}
                      //disabled={templatesLoading && !templatesData?.length}
                      loading={templatesLoading}
                      required={false}
                      isMulti={false}
                    />
                    {/* v1.0.1 -------------------> */}

                    {/* v1.0.6  -  Ranjith  -  rounds shown as horizontal stepper pathway   // v1.0.6 <-----------------------------------> */}
                    {/* Clear template button */}
                    {templateId && (
                      <button
                        type="button"
                        onClick={handleClearTemplate}
                        className="absolute right-14 text-xl  top-7 text-red-500 hover:text-red-600 z-10"
                        // className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 bg-red p-1 rounded-full hover:bg-gray-100"
                        title="Clear template"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {rounds.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-gray-800 mb-4">
                        Rounds Pathway
                      </p>
                      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                        {rounds.map((round, index) => (
                          <React.Fragment key={index}>
                            <div
                              className={`flex items-center px-4 py-2 border rounded-lg shadow-sm min-w-[200px]  `}

                            // ${index === rounds.length - 1 ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200"}
                            >
                              {/* Step number circle */}
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400 text-xs font-medium text-gray-600 mr-3">
                                {index + 1}
                              </div>
                              {/* Round title */}
                              <span className="text-sm font-medium text-gray-800 truncate">
                                {round?.roundTitle || `Round ${index + 1}`}
                              </span>
                            </div>

                            {/* Connector line */}
                            {index < rounds.length - 1 && (
                              <div className="flex-shrink-0 w-6 h-[2px] bg-gray-300"></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allow Parallel Scheduling Toggle */}
                  <div className="flex items-center justify-between border p-3 rounded-md bg-white mb-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900">
                        Allow Parallel Scheduling
                      </label>
                      <span className="text-xs text-gray-500">
                        Enable scheduling multiple rounds simultaneously
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAllowParallelScheduling(!allowParallelScheduling)
                      }
                      className={`${allowParallelScheduling ? "bg-teal-600" : "bg-gray-200"
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                    >
                      <span
                        aria-hidden="true"
                        className={`${allowParallelScheduling
                          ? "translate-x-5"
                          : "translate-x-0"
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  {/* External ID Field - Only show for organization users */}
                  {isOrganization && (
                    <div>
                      <div className="flex items-center gap-2 mb-1 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          External ID
                        </label>
                        <div className="relative tooltip-container">
                          <Info
                            className="w-4 h-4 text-gray-400 cursor-pointer"
                            onClick={() => setShowTooltip(!showTooltip)}
                          />
                          {showTooltip && (
                            <div className="absolute left-6 -top-1 z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              External System Reference Id
                              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        name="externalId"
                        value={externalId}
                        onChange={(e) => setExternalId(e.target.value)}
                        placeholder="External System Reference Id"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* v1.0.6  -  Ranjith  -  rounds shown as horizontal stepper pathway   // v1.0.6 <-----------------------------------> */}

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate(-1)}
                      className="border border-custom-blue rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
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
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onProceed={handleProceed}
        message="Changing the template will override the existing rounds. Do you want to proceed?"
      />

      {/* <---------------------- v1.0.2 */}
      {/* Candidate Modal */}
      {showCandidateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, 'candidate')}
        >
        <AddCandidateForm
          mode="Create"
          onClose={handleCandidateCreated}
          isModal={true}
          hideAddButton={true}
        />
        </div>
      )}

      {/* Position Modal */}
      {showPositionModal && (
        <div
          className="absolute top-0 left-0 w-full my-16 overflow-y-auto"
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
