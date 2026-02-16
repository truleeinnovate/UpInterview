// v1.0.0 - Ashok - add first letter capital function
// v1.0.1 - Ashok - improved responsiveness
// v1.0.2 - Ashok - changed placement of edit mock interview button
// v1.0.3 - Ashok - fixed style related issues

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  // Plus,
  Edit,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Clock,
  XCircle,
  MessageSquare,
  UserX,
  ClipboardList,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
// import axios from "axios";
// import { getStatusBadgeColor } from "../CommonCode-AllTabs/StatusBadge.jsx";
import Breadcrumb from "../CommonCode-AllTabs/Breadcrumb.jsx";
import MoockRoundCard from "./MockInterviewRoundCard.jsx";
import MockCandidateDetails from "./MockinterviewCandidate.jsx";
import {
  useMockInterviewById,
  useUpdateRoundStatus,
} from "../../../../apiHooks/useMockInterviews.js";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import MeetPlatformBadge from "../../../../utils/MeetPlatformBadge/meetPlatformBadge.js";
import { formatDateTime } from "../../../../utils/dateFormatter.js";
import { notify } from "../../../../services/toastService.js";
import { Button } from "../CommonCode-AllTabs/ui/button.jsx";
import { createPortal } from "react-dom";
import DateChangeConfirmationModal from "../Interview-New/components/DateChangeConfirmationModal";
import RejectionModal from "../Interview-New/components/RejectionModal.jsx";
// import FeedbackModal from "../Interview-New/components/FeedbackModal";
import { useRef } from "react";
import { getStatusBadgeColor } from "../CommonCode-AllTabs/StatusBadge.jsx";
import FeedbackFormModal from "../Feedback/FeedbackFormModel.jsx";
import { createJoinMeetingUrl } from "../Interview-New/components/joinMeeting";

const MockInterviewDetails = () => {
  const { id } = useParams();
  const { mockInterview: mockinterview, isLoading } = useMockInterviewById({
    mockInterviewId: id,
  });

  const navigate = useNavigate();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState({});

  // const [showInterviewers, setShowInterviewers] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  // const [actionInProgress, setActionInProgress] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Add near other state declarations
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  const [noShowReasonModalOpen, setNoShowReasonModalOpen] = useState(false);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [completeReasonModalOpen, setCompleteReasonModalOpen] = useState(false);
  const [evaluatedReasonModalOpen, setEvaluatedReasonModalOpen] =
    useState(false);
  const [completedReasonModalOpen, setCompletedReasonModalOpen] =
    useState(false);
  const [selectedReasonModalOpen, setSelectedReasonModalOpen] = useState(false);
  // const [actionInProgress, setActionInProgress] = useState(false);
  const [isCancellingRound, setIsCancellingRound] = useState(false); // Loading state for cancel operation
  const [isNoShowingRound, setIsNoShowingRound] = useState(false); // Loading state for no-show operation

  const [showMoreActions, setShowMoreActions] = useState(false);
  const updateRoundStatus = useUpdateRoundStatus();

  const moreActionsRef = useRef(null);

  const handleView = (candidate) => {
    if (!candidate) return; // Prevents error if candidate is undefined
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };
  const [candidate, setCandidate] = useState([]);
  const [rounds, setRounds] = useState([]);

  // Track expanded rounds

  useEffect(() => {
    if (mockinterview) {
      setCandidate(mockinterview || null);
      const roundsData = mockinterview?.rounds;
      setRounds(
        Array.isArray(roundsData) ? roundsData : roundsData ? [roundsData] : [],
      );
    }
  }, [mockinterview]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target)
      ) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // v1.0.0 <----------------------------------------------------------------
  useEffect(() => {
    if (rounds.length > 0) {
      setExpandedRounds({ [rounds[0]._id]: true }); // Open first round
    }
  }, [rounds]);

  // v1.0.0 ---------------------------------------------------------------->

  // const [activeRound, setActiveRound] = useState(null);
  // const [roundsViewMode, setRoundsViewMode] = useState('vertical');

  // Entity details state
  // const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  // const [entityDetailsModal, setEntityDetailsModal] = useState(null);

  // useEffect(() => {
  //   if (rounds) {
  //     // Set the active round to the first non-completed round
  //     const nextRound = rounds
  //       .filter(round => ['Pending', 'Scheduled'].includes(round.status))
  //       .sort((a, b) => a.sequence - b.sequence)[0];

  //     if (nextRound) {
  //       setActiveRound(nextRound._id);
  //     } else {
  //       // If all rounds are completed, set the last round as active
  //       const lastRound = [...rounds].sort((a, b) => b.sequence - a.sequence)[0];
  //       if (lastRound) {
  //         setActiveRound(lastRound._id);
  //       }
  //     }
  //   }
  // }, [rounds]);

  // Count internal and external interviewers across all rounds
  const allInterviewerIds = new Set();
  // const internalInterviewerIds = new Set();
  const externalInterviewerIds = new Set();

  // const updateInterviewStatus = async (newStatus, reason = null) => {
  //   if (rounds) {
  //     const interviewData = {
  //       status: newStatus,
  //       ...(reason && { completionReason: reason }), // Add reason only if provided
  //     };

  //     try {
  //       await axios.post(`${config.REACT_APP_API_URL}/interview`, {
  //         ...interviewData,
  //         interviewId: id,
  //         updatingInterviewStatus: true,
  //       });
  //     } catch (error) {
  //       console.error("Error updating interview status:", error);
  //     }
  //   }
  // };

  // Call this function for completion with a reason
  // const handleCompleteWithReason = (reason) => {
  //   updateInterviewStatus("Completed", reason);
  //   setShowCompletionModal(false);
  // };

  // Call this function for cancellation

  const canAddRound = () => {
    // Check if the mock interview is in draft status
    // If it is, then the user can add a new round
    return mockinterview?.rounds?.status === "Draft";
  };
  /*******  0f06b6ee-9185-481b-bd68-17acfa422ab0  *******/

  // const canEditRound = (round) => {
  //   return mockinterview?.status === 'Draft' && round.status !== 'Completed';
  // };

  // const handleEditRound = (round) => {
  //   navigate(`/interviews/${id}/rounds/${round._id}`);
  // };

  const handleAddRound = () => {
    navigate(`/mock-interviews/${id}/edit`, {
      state: { from: "tableMode" },
    });
    // navigate(`/interviews/${id}/rounds/new`);
  };

  const handleStatusChange = async (
    newStatus,
    reasonValue = null,
    comment = null,
    roundOutcome = null,
  ) => {
    // For cancellation/no-show, we need to ensure we pass a reason
    if ((newStatus === "Cancelled" || newStatus === "NoShow") && !reasonValue) {
      if (newStatus === "Cancelled") {
        // setActionInProgress(true);
        setCancelReasonModalOpen(true);
      } else if (newStatus === "NoShow") {
        // setActionInProgress(true);
        setNoShowReasonModalOpen(true);
      }
      return;
    }

    try {
      // Build the payload based on status
      const payload = {
        // roundId: round?.rounds[0]?._id,
        // interviewId: mockinterview?._id,
        action: newStatus,
      };

      console.log("payload", rounds[0]?._id);
      console.log("payload", mockinterview?._id);

      console.log("payload", payload);

      // Add cancellation / NoShow reason if provided
      if (
        (newStatus === "Cancelled" ||
          newStatus === "NoShow" ||
          newStatus === "Skipped") &&
        reasonValue
      ) {
        payload.reasonCode = reasonValue;
        payload.comment = comment || null;
      }

      // Add evaluation data if Evaluated status
      if (newStatus === "Evaluated") {
        payload.reason = reasonValue;
        payload.comment = comment || null;
        if (roundOutcome) {
          payload.roundOutcome = roundOutcome;
        }
      }

      console.log("payload", payload);

      const response = await updateRoundStatus.mutateAsync({
        mockInterviewId: mockinterview?._id,
        roundId: rounds[0]?._id,
        payload,
      });
      // const savedMockId =
      //   response?.data?.mockInterview?._id ||
      //   response?._id ||
      //   response?.data?._id;

      // Show success toast
      if (response) {
        notify.success(`Round status updated to ${newStatus}`, {});
      }

      if (!response) {
        notify.error("Failed to save mock interview data");
        return;
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // handling Completion functionlity
  // setCompletedReasonModalOpen

  const handleConfirmStatusChange = async ({
    change = false,
    reason,
    comment,
  }) => {
    try {
      // completedReasonModalOpen status handling
      if (completedReasonModalOpen && change) {
        await handleStatusChange("Completed", reason, comment || null);
        setCompletedReasonModalOpen(false);
      }
      // selectedReasonModalOpen status handling
      else if (selectedReasonModalOpen && change) {
        await handleStatusChange("Selected", reason, comment || null);
        setSelectedReasonModalOpen(false);
      } else if (confirmAction && change) {
        // Generic handle for other actions like Evaluated, FeedbackPending
        await handleStatusChange(confirmAction, reason, comment || null);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReject = (reason) => {
    handleStatusChange("Rejected", reason);
    setShowRejectionModal(false);
  };

  const handleActionClick = (action) => {
    // setActionInProgress(true);
    if (action === "Evaluated") {
      setEvaluatedReasonModalOpen(true);
      // setActionInProgress(true);
      return;
    }

    if (
      action === "Completed" ||
      // action === "Cancelled" ||
      // action === "NoShow" ||
      action === "Rejected" ||
      action === "Selected" ||
      action === "Scheduled" || // <-- add this line
      action === "Skipped" ||
      // action === "Evaluated" ||
      action === "FeedbackPending"
    ) {
      setConfirmAction(action);
      setShowConfirmModal(true);
      // setActionInProgress(true);
    }
  };

  // handling Rejection functionlity
  const handleRejectWithReason = async ({ reason, comment }) => {
    try {
      await handleStatusChange("Rejected", reason, comment || null);
      setRejectReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // handling No show functionlity
  const handleNoShowWithReason = async ({ reason, comment }) => {
    setIsNoShowingRound(true);
    try {
      await handleStatusChange("NoShow", reason, comment || null);
      setNoShowReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsNoShowingRound(false);
    }
  };

  // handling Cancellation functionlity
  const handleCancelWithReason = async ({ reason, comment }) => {
    setIsCancellingRound(true);
    try {
      await handleStatusChange("Cancelled", reason, comment || null);
      setCancelReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsCancellingRound(false);
    }
  };

  // handling Rejection functionlity
  const handleCompleteWithReason = async ({ reason, comment }) => {
    try {
      await handleStatusChange("Completed", reason, comment || null);
      setCompleteReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // handling Evaluated functionlity
  const handleEvaluatedWithReason = async ({
    reason,
    comment,
    roundOutcome,
  }) => {
    try {
      await handleStatusChange(
        "Evaluated",
        reason,
        comment || null,
        roundOutcome,
      );
      setEvaluatedReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // const handleSelectRound = (roundId) => {
  //   setActiveRound(roundId);
  // };

  // const toggleViewMode = () => {
  //   setRoundsViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  // };

  // const pendingRounds = rounds?.filter(round =>
  //   ['Pending', 'Scheduled'].includes(round.status)
  // );

  // const handleViewEntityDetails = (
  //   entity,
  //   type,
  //   viewType = 'sidebar'
  // ) => {
  //   if (viewType === 'sidebar') {
  //     setEntityDetailsSidebar({ entity, type });
  //     setEntityDetailsModal(null);
  //   } else {
  //     setEntityDetailsModal({ entity, type });
  //     setEntityDetailsSidebar(null);
  //   }
  // };

  // Handle opening entity in new modal
  // const handleOpenEntityInNew = (entity, type) => {
  //   setEntityDetailsModal({ entity, type });
  //   setEntityDetailsSidebar(null);
  // };

  // Create breadcrumb items with status

  // Calculate progress percentage
  const completedRounds =
    rounds?.filter((round) => round.status === "Completed").length || 0;
  const totalRounds = rounds?.length || 0;
  const progressPercentage =
    totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  // Check if all rounds are completed
  // const allRoundsCompleted = totalRounds > 0 && completedRounds === totalRounds;

  // Normalize rounds for calculations
  const normalizedRounds = Array.isArray(rounds)
    ? rounds
    : rounds
      ? [rounds]
      : [];

  console.log(mockinterview);

  const roundActionPermissions = {
    // Draft: {
    //   canEdit: true,
    //   canDelete: true,
    //   canMarkScheduled: true,
    //   canReschedule: true,
    //   canCancel: true,
    //   canComplete: true,
    //   canReject: true,
    //   canSelect: true,
    //   canFeedback: true,
    // },
    Draft: {
      canEdit: true,
      canDelete: true,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
      canSkipped: true,
    },
    RequestSent: {
      canEdit: true,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
    },
    Scheduled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: true,
      canCancel: true,
      canComplete: true,
      canFeedback: false,
      canNoShow: true,
      canFeedbackPending: false,
    },
    // Rescheduled: {
    //   canEdit: true,
    //   canDelete: false,
    //   canMarkScheduled: false,
    //   // canReschedule: true,
    //   canCancel: true,
    //   canComplete: true,
    //   canFeedback: false,
    //   canNoShow: true,
    //   canFeedbackPending: false,
    // },
    Completed: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: true,
      canNoShow: false,
    },
    //  added by ranjith new status validation
    InProgress: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: true,
      canFeedback: false,
      canNoShow: true,
    },
    Cancelled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
    },
    InComplete: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
    },
    NoShow: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
    },
    FeedbackPending: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canNoShow: false,
      // canEvaluated: true,
      canFeedbackPending: false,
    },
    FeedbackSubmitted: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      // canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
      canSkipped: false,
      // canEvaluated: true,
    },
  };

  // Helper to get permissions for current round status
  const getRoundPermissions = (status) =>
    roundActionPermissions[status] || roundActionPermissions["Draft"];

  // console.log("status", round.status);
  const permissions = getRoundPermissions(rounds[0]?.status);

  // Create action buttons configuration
  const createActionButtons = () => {
    const actions = [];

    // Reschedule
    // if (
    //   permissions.canReschedule &&
    //   rounds[0]?.interviewType.toLowerCase() !== "instant"
    // ) {
    //   actions.push({
    //     label: "Reschedule",
    //     icon: Calendar,
    //     onClick: () =>
    //       navigate(`/mock-interviews/${mockinterview?._id}/edit`, {
    //         state: { isReschedule: true },
    //       }),
    //     className:
    //       "inline-flex items-center  text-sm text-blue-700 bg-blue-50 hover:bg-blue-100",
    //     showInMore: true,
    //   });
    // }

    // No Show
    if (permissions.canNoShow) {
      actions.push({
        label: "No Show",
        icon: UserX,
        onClick: () => setNoShowReasonModalOpen(true),
        className:
          "inline-flex items-center  text-sm  text-gray-700 bg-gray-50 hover:bg-gray-100",
        showInMore: true,
      });
    }

    // // Evaluated
    // if (permissions.canEvaluated) {
    //   actions.push({
    //     label: "Evaluated",
    //     icon: ClipboardList,
    //     onClick: () => handleActionClick("Evaluated"),
    //     className:
    //       "inline-flex items-center  text-sm text-teal-700 bg-teal-50 hover:bg-teal-100",
    //     showInMore: true,
    //   });
    // }

    // Cancel
    if (
      permissions.canCancel &&
      rounds[0]?.interviewType.toLowerCase() !== "instant"
    ) {
      actions.push({
        label: "Cancel",
        icon: XCircle,
        onClick: () => setCancelReasonModalOpen(true),
        className:
          "inline-flex items-center  text-sm text-red-700 bg-red-50 hover:bg-red-100",
        showInMore: true,
      });
    }

    // Edit
    if (permissions.canEdit) {
      actions.push({
        label: "Edit Round",
        icon: Edit,
        onClick: () =>
          navigate(`/mock-interviews/${mockinterview?._id}/edit`, {
            state: { isEdit: true },
          }),
        className:
          "inline-flex items-center text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100",
        showInMore: true,
      });
    }

    // Change Interviewers (for RequestSent status)
    if (
      rounds[0]?.status === "RequestSent" &&
      rounds[0]?.interviewType !== "instant"
    ) {
      actions.push({
        label: "Change Interviewers",
        icon: Edit,
        onClick: () =>
          navigate(`/mock-interviews/${mockinterview?._id}/edit`, {
            state: { isRequestSent: true },
          }),
        className:
          "inline-flex items-center  text-sm  text-yellow-800 bg-yellow-50 hover:bg-yellow-100",
        showInMore: true,
      });
    }

    // Delete
    if (permissions.canDelete) {
      actions.push({
        label: "Delete Round",
        icon: XCircle,
        onClick: () => setShowDeleteConfirmModal(true),
        className:
          "inline-flex items-center text-sm  text-red-700 bg-red-50 hover:bg-red-100",
        showInMore: true,
      });
    }

    // Mark Scheduled
    if (permissions.canMarkScheduled) {
      actions.push({
        label: "Mark Scheduled",
        icon: Clock,
        onClick: () => handleActionClick("Scheduled"),
        className:
          "inline-flex items-center  text-sm  text-indigo-700 bg-indigo-50 hover:bg-indigo-100",
        showInMore: true,
      });
    }

    // Complete
    if (permissions.canComplete) {
      actions.push({
        label: "Complete",
        icon: CheckCircle,
        onClick: () => setCompletedReasonModalOpen(true),
        className:
          "inline-flex items-center text-sm  text-green-700 bg-green-50 hover:bg-green-100",
        showInMore: true,
      });
    }

    // Feedback
    if (permissions?.canFeedback) {
      actions.push({
        label: "Feedback",
        icon: MessageSquare,
        onClick: () => setShowFeedbackModal(true),
        className:
          "inline-flex items-center    text-sm  text-purple-700 bg-purple-50 hover:bg-purple-100",
        showInMore: true,
      });
    }

    return actions;
  };

  const actionButtons = createActionButtons();
  const visibleActions = actionButtons.filter((action) => !action.showInMore);
  const hiddenActions = actionButtons.filter((action) => action.showInMore);

  const breadcrumbItems = [
    {
      label: "Mock Interview",
      path: "/mock-interviews",
    },
    {
      label: candidate?.candidateName || "Mock Interview",
      path: `/interviews/${id}`,
      status: mockinterview?.status,
    },
  ];

  // Ensure hooks are always called before any conditional return
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (!mockinterview) {
    return (
      <div className="flex justify-center items-center h-screen">
        No interview found
      </div>
    );
  }

  // Toggle round expansion
  const toggleRound = (roundId) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundId]: !prev[roundId],
    }));
  };

  // Check if a round is expanded
  const isExpanded = (roundId) => !!expandedRounds[roundId];

  if (!mockinterview) {
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
              <p className="text-gray-500">Interview not found.</p>
              <Link
                to="/mock-interviews"
                className="text-custom-blue hover:text-custom-blue/90 flex items-center mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Interviews
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleJoinMeeting = (round) => {
    const url = createJoinMeetingUrl(
      round,
      mockinterview,
      null,
      "mockinterview",
    );

    if (!url) {
      console.warn("No valid join URL");
      return;
    }

    // ONLY this line — no location.href, no useNavigate, no extra calls
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="px-[8%] sm:px-[5%] md:px-[5%] py-4 sm:py-6 pb-8">
          <div>
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/mock-interviews")}
                type="button"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Interviews
              </button>
            </div>

            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 px-4 bg-white shadow overflow-hidden rounded-lg">
              {/* v1.0.2 <------------------------------------------------------------------------- */}
              <div className="flex flex-col justify-between items-start sm:items-center px-4 py-5 sm:px-6 gap-4">
                <div className="flex justify-between w-full">
                  {/* v1.0.1 <----------------------------------------------------------------------------- */}
                  <h3 className="flex items-center text-lg leading-6 font-medium text-gray-900 gap-3">
                    Mock Interview Details
                    {mockinterview?.rounds[0]?.status && (
                      // <span className="ml-1">
                      //   <StatusBadge
                      //     status={mockinterview?.rounds[0]?.status}
                      //     size="md"
                      //   />
                      // </span>
                      <span
                        className={`mx-2 text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                          mockinterview?.rounds[0]?.status,
                        )}`}
                      >
                        {mockinterview?.rounds[0]?.status === "RequestSent"
                          ? "Request Sent"
                          : mockinterview?.rounds[0]?.status === "InProgress"
                            ? "In Progress"
                            : mockinterview?.rounds[0]?.status ===
                                "FeedbackPending"
                              ? "Feedback Pending"
                              : mockinterview?.rounds[0]?.status ===
                                  "FeedbackSubmitted"
                                ? "Feedback Submitted"
                                : // : round?.status,
                                  capitalizeFirstLetter(
                                    mockinterview?.rounds[0]?.status,
                                  )}
                      </span>
                    )}
                  </h3>

                  {/* Always visible buttons */}
                  {/* {visibleActions.map((action, index) => {
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
                  })} */}

                  {/* "More" button only if there are actually hidden actions */}
                  {hiddenActions.length > 0 && (
                    <div
                      className=" relative inline-block"
                      ref={moreActionsRef}
                    >
                      <button
                        onClick={() => setShowMoreActions((prev) => !prev)}
                        className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {showMoreActions && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white z-50">
                          {hiddenActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  action.onClick();
                                  setShowMoreActions(false);
                                }}
                                className="w-full flex items-center px-4 py-3 text-sm hover:bg-blue-50"
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {/* v1.0.1 -----------------------------------------------------------------------------> */}
                  {/* v1.0.0 <--------------------------------------------------------------- */}
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on{" "}
                    {mockinterview?.createdAt
                      ? formatDateTime(mockinterview?.createdAt)
                      : "N/A"}
                  </p>
                  {/* v1.0.0 ---------------------------------------------------------------> */}
                </div>
                <div className="flex space-x-2">
                  {![
                    "Completed",
                    "Rejected",
                    "Selected",
                    "Scheduled",
                    "Cancelled",
                    "RequestSent",
                  ].includes(rounds[0]?.status) &&
                    mockinterview?.rounds[0]?.interviewType.toLowerCase() ===
                      "instant" &&
                    mockinterview?.rounds[0]?.status.toLowerCase() ===
                      "draft" && (
                      <button
                        onClick={handleAddRound}
                        // to={`/mock-interview/${id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden inline">Edit Interview</span>
                      </button>
                    )}
                </div>
              </div>
              {/* v1.0.2 -------------------------------------------------------------------------> */}
              {/* v1.0.1 <------------------------------------------------------ */}
              <div className="border-t border-gray-200 px-4 py-5">
                {/* v1.0.1 ------------------------------------------------------> */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-1 mb-4">
                  <div className="sm:col-span-1">
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="mr-0 mb-3 sm:mb-0 sm:mr-3">
                          {candidate?.imageData ? (
                            <img
                              src={candidate.imageData?.path}
                              alt={candidate?.candidateName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-medium">
                            {candidate?.candidateName || "Unknown"}
                            <div>
                              {candidate && (
                                <>
                                  <button
                                    title="View Details"
                                    // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'sidebar')}
                                    onClick={() => handleView(candidate)}
                                    className="inline-flex items-center outline-none"
                                  >
                                    <ExternalLink className="h-4 w-4 text-custom-blue" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 text-xs text-gray-500 mt-1">
                            <span>Current Role:</span> {candidate?.currentRole}
                          </div>
                          <div className="grid grid-cols-2 text-xs text-gray-500 mt-1">
                            <span>Experience:</span>
                            {candidate?.currentExperience} Years
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Skills
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate?.skills?.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-custom-blue border border-gray-200 font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </dd>
                  </div>
                </div>

                {/* Interview Rounds Table Header */}
                {/* v1.0.1 <---------------------------------------------- */}
                <div className="border-t border-gray-200 py-5">
                  {/* v1.0.1 ----------------------------------------------> */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg leading-6 font-medium text-gray-900">
                      Mock Interview Round
                    </h3>
                  </div>

                  {rounds.length > 0 && (
                    <div className="mt-6">
                      <div className="space-y-4">
                        {normalizedRounds.map((round) => (
                          <div
                            key={round._id}
                            className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
                            // className="bg-white rounded-lg shadow-md overflow-hidden"
                          >
                            <button
                              onClick={() => toggleRound(round._id)}
                              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                              <div className="flex items-center">
                                {/* <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
                                  <span className="text-sm font-medium">
                                    {round.sequence + 1}
                                  </span>
                                </div> */}
                                <div>
                                  {/* v1.0.1 <------------------------------------------------------------------------------------------------------- */}
                                  <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-900">
                                    {/* v1.0.1 -------------------------------------------------------------------------------------------------------> */}
                                    {round.roundTitle}
                                  </h3>
                                  {/* v1.0.0 <-------------------------------------------------------------------------- */}
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <span className="mr-2">
                                      {capitalizeFirstLetter(
                                        round?.interviewType,
                                      )}
                                    </span>
                                    <span>•</span>
                                    <span className="mx-2">
                                      {capitalizeFirstLetter(
                                        round?.interviewMode,
                                      )}
                                    </span>
                                    <span className="mr-2">•</span>
                                     <div className="flex items-center gap-2">
                                    <MeetPlatformBadge
                                      platform={round?.meetPlatform}
                                    />

                                    {(round?.status === "Scheduled" ||
                                      round?.status === "Rescheduled" ||
                                      round?.status === "InProgress") && (
                                      <>
                                        <span
                                          onClick={(e) => {
                                            e.stopPropagation(); // ⛔ stop toggle
                                            handleJoinMeeting(round); // ✅ join only
                                          }}
                                          className="cursor-pointer text-custom-blue hover:underline font-medium"
                                        >
                                          Join Meeting
                                        </span>
                                      </>
                                    )}
                                    </div>
                                  </div>
                                  {/* v1.0.0 <-------------------------------------------------------------------------- */}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {isExpanded(round.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </button>

                            {isExpanded(round._id) && (
                              // v1.0.1 <----------------------------------------
                              <div className="sm:px-0 px-4 pb-4">
                                {/* v1.0.1 ----------------------------------------> */}
                                <MoockRoundCard
                                  mockinterview={mockinterview}
                                  round={round}
                                  // canEdit={canEditRound(round)}
                                  // onEdit={() => onEditRound(round)}
                                  isActive={false}
                                  hideHeader={true}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {normalizedRounds.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No round added yet.</p>
                      {/* {canAddRound() && ( */}

                      {/* <button
                        onClick={handleAddRound}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue  focus:outline-none "
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Round
                      </button> */}
                      {/* )} */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {(completedReasonModalOpen ||
          selectedReasonModalOpen ||
          showConfirmModal) &&
          createPortal(
            // v1.0.5 <--------------------------------------------------------------------------------
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-3">
                  Are you sure you want to{" "}
                  {completedReasonModalOpen
                    ? "Complete"
                    : selectedReasonModalOpen
                      ? "Select"
                      : confirmAction === "Skipped"
                        ? "mark as Skipped"
                        : confirmAction === "FeedbackPending"
                          ? "mark as Feedback Pending"
                          : confirmAction === "Scheduled"
                            ? "mark as Scheduled"
                            : "Reject"}{" "}
                  this round?
                </h3>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCompletedReasonModalOpen(false);
                      setSelectedReasonModalOpen(false);
                      setShowConfirmModal(false);
                    }}
                  >
                    No, Cancel
                  </Button>
                  <Button
                    className={`${
                      confirmAction === "Cancelled" &&
                      "bg-red-600 hover:bg-red-700"
                    }`}
                    variant="success"
                    onClick={() => handleConfirmStatusChange({ change: true })}
                    // onClick={handleConfirmStatusChange({ change: true })}
                  >
                    Yes, Confirm
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
            // v1.0.5 -------------------------------------------------------------------------------->
          )}

        {/* Modal for No Show using DateChangeConfirmationModal */}
        <DateChangeConfirmationModal
          isOpen={noShowReasonModalOpen}
          onClose={() => {
            setNoShowReasonModalOpen(false);
            // setActionInProgress(false);
          }}
          onConfirm={handleNoShowWithReason}
          selectedInterviewType={rounds[0]?.interviewerType}
          status={rounds[0]?.status}
          combinedDateTime={rounds[0]?.dateTime}
          actionType="NoShow"
          isLoading={isNoShowingRound}
        />

        {/* Modal for Reject using DateChangeConfirmationModal */}
        <DateChangeConfirmationModal
          isOpen={rejectReasonModalOpen}
          onClose={() => {
            setRejectReasonModalOpen(false);
            // setActionInProgress(false);
          }}
          onConfirm={handleRejectWithReason}
          selectedInterviewType={rounds[0]?.interviewerType}
          status={rounds[0]?.roundStatus}
          combinedDateTime={rounds[0]?.dateTime}
          actionType="Reject"
          isLoading={false}
        />

        {/* Modal for Complete using DateChangeConfirmationModal */}
        <DateChangeConfirmationModal
          isOpen={completeReasonModalOpen}
          onClose={() => {
            setCompleteReasonModalOpen(false);
            // setActionInProgress(false);
          }}
          onConfirm={handleCompleteWithReason}
          selectedInterviewType={rounds[0]?.interviewerType}
          status={rounds[0]?.roundStatus}
          combinedDateTime={rounds[0]?.dateTime}
          actionType="Complete"
          isLoading={false}
        />

        {/* Modal for Evaluated using DateChangeConfirmationModal */}
        <DateChangeConfirmationModal
          isOpen={evaluatedReasonModalOpen}
          onClose={() => {
            setEvaluatedReasonModalOpen(false);
            // setActionInProgress(false);
          }}
          onConfirm={handleEvaluatedWithReason}
          selectedInterviewType={rounds[0]?.interviewerType}
          status={rounds[0]?.roundStatus}
          combinedDateTime={rounds[0]?.dateTime}
          actionType="Evaluated"
          isLoading={false}
        />

        {/* Modal for Cancel using DateChangeConfirmationModal */}
        <DateChangeConfirmationModal
          isOpen={cancelReasonModalOpen}
          onClose={() => {
            setCancelReasonModalOpen(false);
          }}
          onConfirm={handleCancelWithReason}
          selectedInterviewType={rounds[0]?.interviewerType}
          status={rounds[0]?.roundStatus}
          combinedDateTime={rounds[0]?.dateTime}
          actionType="Cancel"
          isLoading={isCancellingRound}
        />

        {showRejectionModal && (
          <RejectionModal
            onClose={() => setShowRejectionModal(false)}
            onReject={handleReject}
            roundName={rounds[0]?.name}
          />
        )}
        {showFeedbackModal && (
          <FeedbackFormModal
            onClose={() => setShowFeedbackModal(false)}
            // interviewId={interviewData._id}
            Viewmode={true}
            roundId={rounds[0]?._id}
            interviewType={"mockinterview"}
          />
        )}

        {showDeleteConfirmModal &&
          createPortal(
            // v1.0.5 <------------------------------------------------------------------------------------------
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-3">
                  Are you sure you want to delete this round?
                </h3>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirmModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    // onClick={handleDeleteRound}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
            // v1.0.5 ------------------------------------------------------------------------------------------>
          )}

        {selectCandidateView === true && (
          <MockCandidateDetails
            candidate={selectedCandidate}
            onClose={() => setSelectCandidateView(null)}
          />
        )}
      </div>
    </>
  );
};

export default MockInterviewDetails;
