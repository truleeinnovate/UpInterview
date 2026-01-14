// v1.0.0 - Ranjith added the interview details tab new things relaetd path set for candidate and postion view tab show proeprly
// v1.0.1 - Ashok - commented extra user icon and user name
/*
   v1.0.2 - Ashok - fixed z-index issue and added createPortal using this
   lets you render a React component into a different part of the DOM
   outside its parent hierarchy.
*/
// v1.0.3 - Ashok - Improved responsiveness
// v1.0.4 - Ashok - changed edit interview button placement

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Calendar,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  LayoutList,
  LayoutGrid,
  ExternalLink,
  Users,
  UserX,
  IdCard,
  ThumbsUp,
  ThumbsDown,
  Ban,
  MoreVertical,
} from "lucide-react";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb.jsx";
import InterviewProgress from "../components/InterviewProgress";
import StatusBadge from "../../CommonCode-AllTabs/StatusBadge.jsx";
import FinalFeedbackModal from "../components/FinalFeedbackModal";

import DateChangeConfirmationModal from "../components/DateChangeConfirmationModal"; // Import the modal
import {
  CANCEL_OPTIONS,
  REJECT_OPTIONS,
  COMPLETE_OPTIONS,
  WITHDRAW_OPTIONS, // Ensure this exists or use appropriate options
} from "../../../../../utils/roundHistoryOptions"; // Import options
import SingleRoundView from "../components/SingleRoundView";
import VerticalRoundsView from "../components/VerticalRoundsView";
import PositionSlideDetails from "../../Position-Tab/PositionSlideDetails";
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import Loading from "../../../../../Components/Loading.js";
import CandidateDetails from "../../Candidate-Tab/CandidateViewDetails/CandidateDetails.jsx";
// v1.0.2 <---------------------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.2 --------------------------------------------------------------------->
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { notify } from "../../../../../services/toastService.js";
import axios from "axios";
import { config } from "../../../../../config.js";
import { useMemo } from "react";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import TemplateDetail from "../../../../InteviewTemplates/TemplateDetail.jsx";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
// import FeeConfirmationModal from '../components/FeeConfirmationModal.js';

const InterviewDetail = () => {
  const { id } = useParams();
  const {
    useInterviewDetails,
    updateInterviewStatus,
    isQueryLoading,
    isError,
    error,
  } = useInterviews(id);

  const { data, isLoading } = useInterviewDetails({ interviewId: id });
  // const interview = data || {};
  const interview = useMemo(() => data ?? null, [data]);

  const candidate = interview?.candidateId;
  const position = interview?.positionId;
  const rounds = useMemo(() => interview?.rounds ?? [], [interview?.rounds]);
  const template = interview?.templateId;

  // const interview = interviewData?.find((interview) => interview._id === id);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);

  const handleView = (candidate) => {
    if (!candidate) return; // Prevents error if candidate is undefined
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };
  // const handleViewPosition = (position) => {
  //   setSelectedPosition(position);
  //   setSelectPositionView(true);
  // };

  // <-------v1.0.0 - Ranjith

  const handleViewPosition = (position) => {
    navigate(`/position/view-details/${position._id}`, {
      state: {
        mode: "Interview",
      },
    });
    // setSelectedPosition(position);
    // setSelectPositionView(true);
  };

  // ----------------------->

  // Get user token information and check organization field
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const isOrganization = tokenPayload?.organization === true;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // const [candidate, setCandidate] = useState(null);
  // const [position, setPosition] = useState(null);
  // const [rounds, setRounds] = useState([]);
  // const [template, setTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // useEffect(() => {
  //   if (interview) {
  //     setCandidate(interview?.candidateId || null);
  //     setPosition(interview?.positionId || null);
  //     setRounds(interview?.rounds || []);
  //     setTemplate(interview?.templateId || null);
  //   }
  // }, [interview]);

  useEffect(() => {
    if (rounds && rounds.length > 0) {
      if (rounds.length === 1) {
        // Force vertical mode when only one round exists
        setRoundsViewMode("vertical");
        setActiveRound(rounds[0]?._id); // Always open the only card
        return; // No need to run the rest of the logic
      }

      // Set the active round to the first non-completed round
      const nextRound = rounds
        .filter((round) => ["Scheduled"].includes(round?.status))
        .sort((a, b) => a?.sequence - b?.sequence)[0];

      if (nextRound) {
        setActiveRound(nextRound?._id);
      } else {
        // If all rounds are completed, set the last round as active
        const lastRound = [...rounds].sort(
          (a, b) => b?.sequence - a?.sequence
        )[0];
        if (lastRound) {
          setActiveRound(lastRound?._id);
        }
      }
    }
  }, [rounds]);

  const checkRoundStatuses = (action) => {
    const allowedStatuses = [
      "Draft",
      "Completed",
      "Cancelled",
      "Selected",
      "Rejected",
    ];
    const invalidRounds = interview?.rounds?.filter(
      (round) => !allowedStatuses.includes(round.status)
    );

    if (invalidRounds && invalidRounds.length > 0) {
      const roundItems = invalidRounds
        .map((round) => {
          const roundName = round.roundTitle || `Round ${round.sequence}`;
          return `
          <li class="mb-2">
            <div class="flex items-start">
              <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600 text-xs font-bold mr-2 flex-shrink-0">!</span>
              <div>
                <span class="font-bold text-gray-900">${roundName}</span>
                <span class="text-gray-600 ml-1">(${round.status})</span>
              </div>
            </div>
          </li>`;
        })
        .join("");

      setStatusModal({
        isOpen: true,
        title: `Cannot ${action.charAt(0).toUpperCase() + action.slice(1)
          } Interview`,
        message: `The following rounds are not completed state:<ul class="list-disc pl-5 mt-2 mb-3">${roundItems}</ul>Please update all rounds to a completed state (Completed, Cancelled, Selected, or Rejected) before ${action.toLowerCase()} the interview.`,
        isHTML: true,
      });
      return false;
    }
    return true;
  };

  // Modal state for actions
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    actionType: "", // "Complete", "Reject", "Cancel", "Withdraw", "Select"
    title: "",
    requiresReason: false,
  });

  const handleConfirmAction = async (data) => {
    const { reason, comment } = data;
    const actionType = actionModal.actionType; // Get actionType from state

    // Use comment if reason is "other" (case-insensitive) or if reason is missing but comment exists
    const finalReason = (reason?.toLowerCase() === 'other' || reason === '__other__') ? comment : reason;

    // Map action type to status
    let newStatus = "";
    switch (actionType) {
      case "Complete": newStatus = "Completed"; break;
      case "Reject": newStatus = "Rejected"; break;
      case "Cancel": newStatus = "Cancelled"; break;
      case "Withdraw": newStatus = "Withdrawn"; break;
      case "Select": newStatus = "Selected"; break;
      default: return;
    }

    try {
      // Pass reason as currentReason for Reject/Cancel/Withdraw, or completionReason for Complete
      const isCompletion = newStatus === "Completed";

      await updateInterviewStatus({
        interviewId: id,
        status: newStatus,
        reason: isCompletion ? finalReason : null, // completionReason
        currentReason: !isCompletion ? finalReason : null, // currentReason
      });

      notify.success(`Interview ${newStatus.toLowerCase()} successfully`);
      setActionModal((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error(`Error updating interview status to ${newStatus}:`, error);
      notify.error(`Failed to update interview status`);
    }
  };

  const handleCompleteClick = async () => {
    // if (checkRoundStatuses("complete")) {
    setActionModal({
      isOpen: true,
      actionType: "Complete",
      title: "Complete Interview",
      requiresReason: false, // Confirmation only
    });
    // }
  };

  const handleCancelClick = async () => {
    // if (!checkRoundStatuses("cancel")) {
    //   return; 
    // }
    setActionModal({
      isOpen: true,
      actionType: "Cancel",
      title: "Cancel Interview",
      requiresReason: true,
    });
  };

  const handleSelectClick = async () => {
    // if (checkRoundStatuses("select")) {
    setActionModal({
      isOpen: true,
      actionType: "Select",
      title: "Select Candidate",
      requiresReason: false, // Confirmation only
    });
    // }
  };

  const handleRejectClick = async () => {
    // if (checkRoundStatuses("reject")) {
    setActionModal({
      isOpen: true,
      actionType: "Reject",
      title: "Reject Candidate",
      requiresReason: true,
    });
    // }
  };

  const handleWithdrawClick = async () => {
    // if (checkRoundStatuses("withdraw")) {
    setActionModal({
      isOpen: true,
      actionType: "Withdraw",
      title: "Withdraw Application",
      requiresReason: true,
    });
    // }
  };

  // Ensure rounds is always an array

  const handleInitiateAction = async (round, action) => {
    try {
      // Update round status and fees via API
      await updateInterviewStatus({
        interviewId: id,
        roundId: round._id,
        action: action,
        newStatus: action === "cancel" ? "Cancelled" : "Rescheduled", // Or 'Pending' for reschedule
      });
      // If reschedule, increment rescheduleCount in backend (optional, depending on API)
      if (action === "reschedule") {
        // API call to increment count if needed
      }
      // Refresh interviewData (optional, depending on hook behavior)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const [activeRound, setActiveRound] = useState(null);
  const [showFinalFeedbackModal, setShowFinalFeedbackModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [roundsViewMode, setRoundsViewMode] = useState("vertical");
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Entity details state
  const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  const [entityDetailsModal, setEntityDetailsModal] = useState(null);

  // it disables the outer scrollbar for these two popups when they are open
  // v1.0.2 <---------------------------------------------------
  useScrollLock(isModalOpen || showCompletionModal);
  // v1.0.2 --------------------------------------------------->

  // v1.0.1 <----------------------------------------------------------------------------------
  // useEffect(() => {
  //   if (rounds) {
  //     // Set the active round to the first non-completed round
  //     const nextRound = rounds
  //       .filter((round) => ["Pending", "Scheduled"].includes(round.status))
  //       .sort((a, b) => a.sequence - b.sequence)[0];

  //     if (nextRound) {
  //       setActiveRound(nextRound._id);
  //     } else {
  //       // If all rounds are completed, set the last round as active
  //       const lastRound = [...rounds].sort(
  //         (a, b) => b.sequence - a.sequence
  //       )[0];
  //       if (lastRound) {
  //         setActiveRound(lastRound._id);
  //       }
  //     }
  //   }
  // }, [rounds]);

  // Handle loading state
  if (isQueryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Breadcrumb
              items={[
                { label: "Interviews", path: "/interviews" },
                { label: "Error" },
              ]}
            />
            <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Error loading interview
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {error?.message ||
                  "Failed to load interview details. Please try again later."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle case when interview is not found
  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Breadcrumb
              items={[
                { label: "Interviews", path: "/interviews" },
                { label: "Not Found" },
              ]}
            />
            <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Interview not found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                The requested interview could not be found.
              </p>
              <div className="mt-6">
                <Link
                  to="/interviews"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                >
                  Back to Interviews
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Count internal and external interviewers across all rounds
  const allInterviewerIds = new Set();
  const internalInterviewerIds = new Set();
  const externalInterviewerIds = new Set();

  rounds?.forEach((round) => {
    round?.interviewers?.forEach((interviewer) => {
      if (interviewer?._id) {
        allInterviewerIds.add(interviewer._id);

        if (round.interviewerType?.toLowerCase() === "internal") {
          internalInterviewerIds.add(interviewer._id);
        } else if (round.interviewerType?.toLowerCase() === "external") {
          externalInterviewerIds.add(interviewer._id);
        }
      }
    });
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  // cancle interviwe popup

  const handleStatusChange = (newStatus) => {
    if (rounds) {
      const updatedInterview = {
        status: newStatus,
      };
    }
  };

  // const updateInterviewStatus = async (newStatus, reason = null) => {
  //   if (rounds) {
  //     const interviewData = {
  //       status: newStatus,
  //       ...(reason && { completionReason: reason }) // Add reason only if provided
  //     };

  //     try {
  //       await axios.post(`${config.REACT_APP_API_URL}/interview`, {
  //         ...interviewData,
  //         interviewId: id,
  //         updatingInterviewStatus: true
  //       });
  //     } catch (error) {
  //       console.error("Error updating interview status:", error);
  //     }
  //   }
  // };

  const handleUpdateStatus = async (newStatus, reason = null) => {
    try {
      // Use the correct endpoint for updating status
      await axios.patch(
        `${config.REACT_APP_API_URL}/interview/status/${id}/${newStatus}`,
        { reason },
        { withCredentials: true }
      );

      // Refresh the interview data
      await queryClient.invalidateQueries(["interview", id]);
      await queryClient.invalidateQueries(["interviews"]);

      // Show success message
      notify.success(
        `Interview marked as ${newStatus.toLowerCase()} successfully`
      );
      return true;
    } catch (error) {
      console.error("Error updating interview status:", error);
      notify.error(
        `Failed to update status: ${error.response?.data?.message || error.message
        }`
      );
      return false;
    }
  };

  // Call this function for completion with a reason
  const handleCompleteWithReason = async (reason) => {
    const success = await handleUpdateStatus("Completed", reason);
    if (success) {
      setShowCompletionModal(false);
    }
  };

  // Call this function for cancellation
  const confirmCancel = () => {
    handleUpdateStatus("Cancelled");
    setIsModalOpen(false);
  };

  const canAddRound = () => {
    return interview?.status === "Draft" || interview?.status === "InProgress";
  };

  // const canEditRound = (round) => {
  //   return interview?.status === "Draft" || round.status !== "Completed";
  // };

  const handleEditRound = (round, options = {}) => {
    navigate(`/interviews/${id}/rounds/${round._id}`, {
      // state: { isReschedule: options.isReschedule },
      state: {
        ...options, // 👈 spread all options
      },
    });
  };

  const handleAddRound = () => {
    navigate(`/interviews/${id}/rounds/new`);
  };

  const handleSelectRound = (roundId) => {
    setActiveRound(roundId);
  };

  const toggleViewMode = () => {
    setRoundsViewMode((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
  };

  const pendingRounds = rounds?.filter((round) =>
    ["Scheduled"].includes(round.status)
  );

  // const [TemplateDetailsSidebarOpen, setTemplateDetailsSidebarOpen] = useState(false);

  const handleViewEntityDetails = (entity, type, viewType = "sidebar") => {
    // if (type === "template") {

    //   <TemplateDetail mode="interviewDetails" templateId={entity?._id}
    //   onClose={() => {
    //     TemplateDetailsSidebarOpen(false);
    //   }
    //   />;
    // }

    if (viewType === "sidebar") {
      setEntityDetailsSidebar({ entity, type });
      setEntityDetailsModal(null);
    } else {
      setEntityDetailsModal({ entity, type });
      setEntityDetailsSidebar(null);
    }
  };

  // Handle opening entity in new modal
  // const handleOpenEntityInNew = (entity, type) => {
  //     setEntityDetailsModal({ entity, type });
  //     setEntityDetailsSidebar(null);
  // };

  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: "Interviews",
      path: "/interviews",
    },
    {
      label: candidate?.LastName || "Interview",
      path: `/interviews/${id}`,
      // status: interview?.status,
    },
  ];

  // Calculate progress percentage
  const completedRounds =
    rounds?.filter((round) => round.status === "Completed").length || 0;
  const totalRounds = rounds?.length || 0;
  const progressPercentage =
    totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  // Check if all rounds are completed
  const allRoundsCompleted = totalRounds > 0 && completedRounds === totalRounds;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* v1.0.3 <------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-4 lg:px-8">
        {/* v1.0.3 ------------------------------------------------------------> */}
        <div>
          <div className="flex items-center mb-4">
            <Link
              to="/interviews"
              className="text-gray-800 flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Interviews
            </Link>
          </div>

          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
            {/* v1.0.3 <-------------------------------------------------------------------------- */}
            <div className="px-5 py-5 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full">
                <div className="flex justify-between w-full">
                  <div className="flex items-center gap-2">
                    <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg leading-6 font-medium text-gray-900">
                      Interview Details
                    </h3>
                    {/* <span>
                      <StatusBadge status={interview?.status} size="md" />
                    </span> */}
                    <span>
                      <StatusBadge
                        status={
                          interview?.status === "InProgress"
                            ? "In Progress"
                            : interview?.status
                        }
                        size="md"
                      />
                    </span>
                  </div>
                  {/* v1.0.4 <------------------------------------------------------------------------------------------------------ */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {interview?.status === "InProgress" && (
                      (() => {
                        // Normalize statuses to lowercase for safe comparison
                        const blockingStatuses = new Set([
                          'Scheduled',
                          'Rescheduled',
                          'InProgress',
                          'RequestSent'
                        ]);

                        const hasBlockingRound = rounds.some(r =>
                          r?.status && blockingStatuses.has(r.status)
                        );

                        // Only show actions when interview is InProgress AND no blocking rounds
                        if (hasBlockingRound) return null;

                        const actions = [
                          {
                            label: "Complete Interview",
                            icon: CheckCircle,
                            onClick: handleCompleteClick,
                            bgColor: "bg-green-600",
                            hoverColor: "hover:bg-green-700",
                            ringColor: "focus:ring-green-500",
                          },
                          {
                            label: "Cancel Interview",
                            icon: XCircle,
                            onClick: handleCancelClick,
                            bgColor: "bg-red-600",
                            hoverColor: "hover:bg-red-700",
                            ringColor: "focus:ring-red-500",
                          },
                          {
                            label: "Selected",
                            icon: ThumbsUp,
                            onClick: handleSelectClick,
                            bgColor: "bg-teal-600",
                            hoverColor: "hover:bg-teal-700",
                            ringColor: "focus:ring-teal-500",
                          },
                          {
                            label: "Rejected",
                            icon: ThumbsDown,
                            onClick: handleRejectClick,
                            bgColor: "bg-purple-600",
                            hoverColor: "hover:bg-purple-700",
                            ringColor: "focus:ring-purple-500",
                          },
                          {
                            label: "Withdraw",
                            icon: Ban,
                            onClick: handleWithdrawClick,
                            bgColor: "bg-orange-600",
                            hoverColor: "hover:bg-orange-700",
                            ringColor: "focus:ring-orange-500",
                          },
                        ];

                        const visibleActions = actions.slice(0, 2);
                        const hiddenActions = actions.slice(2);

                        // If we have no visible AND no hidden actions → don't render anything
                        if (actions.length === 0) return null;

                        return (
                          <>
                            {/* Always visible buttons */}
                            {visibleActions.map((action, index) => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={action.onClick}
                                  className={`inline-flex flex-shrink-0 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${action.bgColor} ${action.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.ringColor}`}
                                >
                                  <Icon className="h-4 w-4 mr-1" />
                                  {action.label}
                                </button>
                              );
                            })}

                            {/* "More" button only if there are actually hidden actions */}
                            {hiddenActions.length > 0 && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowMoreActions(prev => !prev)}
                                  className="inline-flex flex-shrink-0 items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <MoreVertical className="h-4 w-4 mr-1" />
                                  More
                                </button>

                                {showMoreActions && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setShowMoreActions(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                      <div className="py-1" role="menu">
                                        {hiddenActions.map((action, index) => {
                                          const Icon = action.icon;
                                          return (
                                            <button
                                              key={index}
                                              onClick={() => {
                                                action.onClick();
                                                setShowMoreActions(false);
                                              }}
                                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                              role="menuitem"
                                            >
                                              <Icon className="h-4 w-4 mr-3 text-gray-500" />
                                              {action.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()
                    )}

                    {interview?.status === "Draft" && (
                      <Link
                        to={`/interviews/${id}/edit`}
                        className="inline-flex flex-shrink-0 items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit <span className="sm:hidden inline ml-1">Interview</span>
                      </Link>
                    )}
                  </div>
                  {/* v1.0.4 ------------------------------------------------------------------------------------------------------> */}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Created on {formatDate(interview?.createdAt)}
                </p>
              </div>
            </div>
            {/* v1.0.3 --------------------------------------------------------------------------> */}
            {/* v1.0.3 <--------------------------------------------------------- */}
            <div className="border-t border-gray-200 px-5 py-5 sm:px-4">
              {/* v1.0.3 ---------------------------------------------------------> */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-1">
                <div className="sm:col-span-1">
                  {/* v1.0.1 <-------------------------------------------------------------------- */}
                  {/* <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-5 w-5 mr-1" />
                    Candidate
                  </dt> */}
                  <dd className="text-sm text-gray-900">
                    {/* v1.0.1 ---------------------------------------------------------------------> */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {candidate?.ImageData ? (
                          <img
                            src={candidate?.ImageData?.path}
                            alt={candidate?.LastName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium truncate">
                            {candidate?.LastName
                              ? candidate.LastName.charAt(0).toUpperCase() +
                              candidate.LastName.slice(1)
                              : "Unknown"}
                          </span>
                          {candidate && (
                            <button
                              onClick={() => handleView(candidate)}
                              className="p-0.5 text-custom-blue hover:bg-blue-50 rounded focus:outline-none"
                              title="View Candidate Details"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {candidate?.Email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Experience: {candidate?.CurrentExperience} years
                        </div>
                      </div>
                    </div>
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Briefcase className="h-5 w-5 mr-1" />
                    Position
                    {position && (
                      <button
                        onClick={() => handleViewPosition(position)}
                        className="ml-1 p-0.5 text-custom-blue hover:bg-blue-50 rounded focus:outline-none"
                        title="View Position Details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="font-medium">
                      {position?.title
                        ? position.title.charAt(0).toUpperCase() +
                        position.title.slice(1)
                        : "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {position?.companyname?.name || ""} • {position?.Location}
                    </div>
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-5 w-5 mr-1" />
                    Template
                    {template && (
                      <button
                        onClick={() =>
                          handleViewEntityDetails(
                            template,
                            "template",
                            "sidebar"
                          )
                        }
                        className="ml-1 p-0.5 text-custom-blue hover:bg-blue-50 rounded focus:outline-none"
                        title="View Template Details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="font-medium">
                      {position?.roundsModified
                        ? "Selected Custom round"
                        : template?.title
                          ? capitalizeFirstLetter(template?.title)
                          : //  template.templateName.charAt(0).toUpperCase() +
                          //   template.templateName.slice(1)
                          "Not selected any template"}
                    </div>
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <LayoutList className="h-5 w-5 mr-1" />
                    Parallel Scheduling
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled
                        className={`${interview?.allowParallelScheduling
                          ? "bg-teal-600"
                          : "bg-gray-200"
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${interview?.allowParallelScheduling
                            ? "translate-x-5"
                            : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                      </button>
                      <span className="ml-3 text-sm font-medium">
                        {interview?.allowParallelScheduling
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Progress
                  </dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">
                        {completedRounds} of {totalRounds} Rounds Completed
                      </span>
                      <span className="text-sm font-medium text-custom-blue">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-custom-blue h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </dd>
                </div>
              </div>

              {/* External ID Field - Only show for organization users */}
              {interview?.externalId && isOrganization && (
                <div className="sm:col-span-1 mt-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <IdCard className="h-5 w-5 mr-1" />
                    External ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="font-medium">{interview?.externalId}</div>
                  </dd>
                </div>
              )}

              {/* Interviewers summary */}
              <div className="mt-6 mb-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">
                    Interviewers
                  </h4>
                </div>
                {/* v1.0.3 <------------------------------------------------- */}
                <div className="flex sm:flex-col flex-wrap gap-2">
                  {/* v1.0.3 -------------------------------------------------> */}
                  <div className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    <span className="font-medium">
                      {internalInterviewerIds.size}
                    </span>{" "}
                    Internal
                  </div>
                  <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    <span className="font-medium">
                      {externalInterviewerIds.size}
                    </span>{" "}
                    Outsourced
                  </div>
                  <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    <span className="font-medium">
                      {allInterviewerIds.size}
                    </span>{" "}
                    Total
                  </div>
                </div>
              </div>

              {/* Interview Rounds Table Header */}
              {/* v1.0.3 <---------------------------------------------- */}
              <div className="border-gray-200 px-4 py-5 sm:px-0 mt-3">
                <div className="flex sm:flex-col md:flex-col justify-between sm:items-start md:items-start items-center w-full mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 sm:mb-4 md:mb-4">
                    Interview Rounds
                  </h3>
                  <div className="sm:w-full md:w-full overflow-x-auto">
                    <div className="inline-flex gap-2 pb-2 min-w-max">
                      {/* v1.0.0 <------------------------------------------------------------------------------------------------------------- */}
                      {interview?.rounds?.length > 1 && (
                        <button
                          onClick={toggleViewMode}
                          className="inline-flex flex-shrink-0 items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                        >
                          {roundsViewMode === "vertical" ? (
                            <>
                              <LayoutGrid className="h-4 w-4 mr-1" />
                              Horizontal View
                            </>
                          ) : (
                            <>
                              <LayoutList className="h-4 w-4 mr-1" />
                              Vertical View
                            </>
                          )}
                        </button>
                      )}
                      {/* v1.0.0 -------------------------------------------------------------------------------------------------------------> */}

                      {/* {interview?.status === "InProgress" &&
                                                allRoundsCompleted && (
                                                    <button
                                                        onClick={() => setShowFinalFeedbackModal(true)}
                                                        className="inline-flex flex-shrink-0 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Add Final Feedback
                                                    </button>
                                                )} */}
                      {/* we have to check like we need final feedback for interviews or not */}

                      {canAddRound() && (
                        <button
                          onClick={handleAddRound}
                          className="inline-flex flex-shrink-0 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Round
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <InterviewProgress
                  rounds={rounds}
                  interviewId={id}
                  currentRoundId={activeRound || undefined}
                  viewMode={roundsViewMode}
                  onSelectRound={handleSelectRound}
                />

                {rounds.length > 0 && (
                  <div className="mt-6">
                    {roundsViewMode === "horizontal" ? (
                      activeRound && (
                        <>
                          <SingleRoundView
                            rounds={rounds}
                            interviewData={interview}
                            currentRoundId={activeRound}
                            // canEditRound={canEditRound}
                            onEditRound={handleEditRound}
                            onChangeRound={handleSelectRound}
                          />
                        </>
                      )
                    ) : (
                      <>
                        <VerticalRoundsView
                          rounds={rounds}
                          interviewData={interview}
                          // canEditRound={canEditRound}
                          onEditRound={handleEditRound}
                          onInitiateAction={handleInitiateAction}
                        />
                      </>
                    )}
                  </div>
                )}

                {rounds.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No Rounds added yet.</p>
                    {canAddRound() && (
                      <button
                        onClick={handleAddRound}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue  "
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Round
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* v1.0.3 ----------------------------------------------> */}
            </div>
          </div>
        </div>
      </main>

      {showFinalFeedbackModal && (
        <FinalFeedbackModal
          onClose={() => setShowFinalFeedbackModal(false)}
          interviewId={id}
        />
      )}

      {/* Confirmation Modal for cancle interview */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to cancel this interview?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {entityDetailsSidebar && entityDetailsSidebar.type === "template" && (
        <TemplateDetail
          templateId={entityDetailsSidebar.entity?._id}
          // onClose={() => setEntityDetailsSidebar(null)}
          onClose={() => {
            setEntityDetailsSidebar(null);
          }}
          mode="interviewDetails"
        />
      )}

      {/* if (type === "template") {
    if (viewType === "sidebar") {
      setEntityDetailsSidebar({ entity, type });
      setEntityDetailsModal(null);
    } else {
      setEntityDetailsModal({ entity, type });
      setEntityDetailsSidebar(null);
    }
  } else {
    if (viewType === "sidebar") {
      setEntityDetailsSidebar({ entity, type });
      setEntityDetailsModal(null);
    } else {
      setEntityDetailsModal({ entity, type });
      setEntityDetailsSidebar(null);
    }
  } */}

      {/* Entity Details Sidebar */}
      {/* {entityDetailsSidebar && (
          <EntityDetailsSidebar
            onClose={() => setEntityDetailsSidebar(null)}
            entity={entityDetailsSidebar.entity}
            entityType={entityDetailsSidebar.type}
            onOpenInNew={() => handleOpenEntityInNew(entityDetailsSidebar.entity, entityDetailsSidebar.type)}
          />
        )}

        {entityDetailsModal && (
          <EntityDetailsModal
            onClose={() => setEntityDetailsModal(null)}
            entity={entityDetailsModal.entity}
            entityType={entityDetailsModal.type}
          />
        )} */}

      {/* {selectCandidateView === true && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectCandidateView(null)}
        />
      )} */}

      {/* // <-------v1.0.0 - Ranjith  */}
      {selectCandidateView === true && (
        <CandidateDetails
          mode="Interview"
          candidateId={selectedCandidate?._id}
          onClose={() => setSelectCandidateView(false)}
        />
      )}

      {/*  ------------------------> */}

      {/* {showFeeModal && (
        <FeeConfirmationModal
          onClose={() => setShowFeeModal(false)}
          onConfirm={handleConfirmAction}
          action={modalAction}
          fees={calculatedFees}
          round={selectedRound}
        />
      )} */}

      {/* Action Confirmation Modal */}
      <DateChangeConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        actionType={actionModal.actionType}
        title={actionModal.title}
        status={interview?.status} // Pass current status
      // Pass requiresReason implicitly via actionType logic in Modal, or explicitly if Modal supports it
      />

      {/* {selectPositionView === true && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(null)}
        />
      )} */}

      {/* Status Modal for Round Validation */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900">
                  {statusModal.title}
                </h3>
              </div>
              <div className="mt-4">
                {statusModal.isHTML ? (
                  <div
                    className="text-gray-700 [&_ul]:mb-3 [&_ul]:mt-1 [&_li]:bg-gray-50 [&_li]:px-3 [&_li]:py-2 [&_li]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: statusModal.message }}
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-line">
                    {statusModal.message}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() =>
                  setStatusModal({ ...statusModal, isOpen: false })
                }
                className="px-6 py-2.5 bg-custom-blue text-white font-medium rounded-lg hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDetail;
