// v1.0.0 - Ashok - added format date function
// v1.0.1 - Ashok - Improved responsiveness

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  XCircle,
  MessageSquare,
  UserX,
  ClipboardList,
  Edit,
  CheckCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import InterviewerAvatar from "../CommonCode-AllTabs/InterviewerAvatar";
import FeedbackModal from "../Interview-New/components/FeedbackModal";
import RejectionModal from "../Interview-New/components/RejectionModal";
import { Button } from "../CommonCode-AllTabs/ui/button";
import { notify } from "../../../../services/toastService";
import { useUpdateRoundStatus } from "../../../../apiHooks/useMockInterviews";
import { useNavigate } from "react-router-dom";
import DateChangeConfirmationModal from "../Interview-New/components/DateChangeConfirmationModal";

const MoockRoundCard = ({
  mockinterview,
  round,
  canEdit,
  onEdit,
  isActive = false,
  hideHeader = false,
}) => {
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

  // Assessment action popup states

  // const [actionInProgress, setActionInProgress] = useState(false);
  const [isCancellingRound, setIsCancellingRound] = useState(false); // Loading state for cancel operation
  const [isNoShowingRound, setIsNoShowingRound] = useState(false); // Loading state for no-show operation

  const navigate = useNavigate();

  // console.log("round",round);
  // const { addOrUpdateMockInterview } = useMockInterviews();
  const updateRoundStatus = useUpdateRoundStatus();

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;
  // const organizationId = tokenPayload?.tenantId;

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (
    newStatus,
    reasonValue = null,
    comment = null,
    roundOutcome = null
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

      console.log("payload", round?._id);
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
        roundId: round?._id,
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
        roundOutcome
      );
      setEvaluatedReasonModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Get interviewers based on interviewerType

  const externalInterviewers =
    round?.interviewerType === "External"
      ? Array.isArray(round?.interviewers) && round.interviewers.length > 0
        ? round.interviewers
        : Array.isArray(round?.pendingOutsourceRequests)
          ? round.pendingOutsourceRequests
            .map((req) => req.interviewerId)
            .filter(Boolean)
          : []
      : [];

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
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: true,
      canNoShow: false,
      canSkipped: true,
    },
    RequestSent: {
      canEdit: true,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
    },
    Scheduled: {
      canEdit: true,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      canFeedback: false,
      canShareLink: false,
      canResendLink: true,
      //only for if round title assessment
      canExtendAssessment: true,
      canCancelAssessment: true,
      canNoShow: true,
      canSkipped: false,
      canEvaluated: true,
      canFeedbackPending: false,
    },
    Rescheduled: {
      canEdit: true,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: true,
      canSkipped: false,
      canEvaluated: false,
      canFeedbackPending: false,
    },
    Completed: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
      canEvaluated: true,
    },
    //  added by ranjith new status validation
    InProgress: {
      canEdit: false,
      canDelete: false,
      canNoShow: true,
    },
    Cancelled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
    },
    // Rejected: {
    //   canEdit: false,
    //   canDelete: false,
    //   canMarkScheduled: false,
    //   canReschedule: false,
    //   canCancel: false,
    //   canComplete: false,
    //   canReject: false,
    //   canSelect: false,
    //   canFeedback: true,
    //   canResendLink: false,
    //   canShareLink: false,
    // },
    // Selected: {
    //   canEdit: false,
    //   canDelete: false,
    //   canMarkScheduled: false,
    //   canReschedule: false,
    //   canCancel: false,
    //   canComplete: false,
    //   canReject: false,
    //   canSelect: false,
    //   canFeedback: true,
    //   canResendLink: false,
    //   canShareLink: false,
    //   canNoShow: false,
    // },
    InComplete: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
    },
    NoShow: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
    },
    Skipped: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
      canSkipped: false,
      canEvaluated: false,
      canFeedbackPending: false,
    },
    Evaluated: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
      canSkipped: false,
      canEvaluated: false,
      canFeedbackPending: false,
    },
    FeedbackPending: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
      canNoShow: false,
      canSkipped: false,
      canEvaluated: false,
      canFeedbackPending: false,
    },
  };

  // Helper to get permissions for current round status
  const getRoundPermissions = (status) =>
    roundActionPermissions[status] || roundActionPermissions["Draft"];

  // console.log("status", round.status);
  const permissions = getRoundPermissions(round.status);

  return (
    <>
      <div
        className={`bg-white rounded-lg ${!hideHeader && "shadow-md"
          } overflow-hidden ${isActive ? "ring-2 ring-blue-500" : ""}`}
      >
        <div className="p-5">
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:grid-cols-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Schedule
                  </h4>
                </div>
                {round.dateTime && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scheduled At: {round.dateTime.split(" - ")[0]}</span>
                  </div>
                )}

                {/* v1.0.0 <------------------------------------------------------------------- */}
                {/* {round.completedDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Completed: {formatDate(round?.completedDate)}</span>
                  </div>
                )} */}
                {round.duration && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Duration: {round.duration} minutes</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Interviewers
                  </h4>
                </div>

                {externalInterviewers.length === 0 && (
                  <span className="text-sm text-gray-500">
                    No interviewers assigned
                  </span>
                )}

                {
                  <div className="space-y-2">
                    {/* v1.0.0 ------------------------------------------------------------------ */}

                    {externalInterviewers.length > 0 && (
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span>External ({externalInterviewers.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {externalInterviewers.map((interviewer) => (
                            <div
                              key={interviewer._id}
                              className="flex items-center"
                            >
                              <InterviewerAvatar
                                interviewer={interviewer}
                                size="sm"
                              />
                              <span className="ml-1 text-xs text-gray-600">
                                {interviewer?.firstName +
                                  " " +
                                  interviewer?.lastName}
                              </span>
                              {/* {isRoundActive && canEdit && (
                                  <button
                                    onClick={() => handleRemoveInterviewer(interviewer._id)}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )} */}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              </div>
            </div>

            {/* <div className="w-full overflow-x-auto">
              <div className="mt-6 flex gap-3 whitespace-nowrap min-w-max justify-end">
                {permissions.canReschedule &&
                  // round.interviewerType === "external" &&
                  round?.interviewType.toLowerCase() !== "instant" && (
                    <button
                      onClick={() =>
                        navigate(`/mock-interview/${mockinterview?._id}/edit`, {
                          state: { isReschedule: true },
                        })
                      }
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Calendar className="h-4 w-4 mr-1" /> Reschedule
                    </button>
                  )}
                {permissions.canNoShow && (
                  <button
                    onClick={() => {
                      setNoShowReasonModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100"
                  >
                    <UserX className="h-4 w-4 mr-1" /> No Show
                  </button>
                )}

                {permissions.canEvaluated && (
                  <button
                    onClick={() => handleActionClick("Evaluated")}
                    className="inline-flex items-center px-3 py-2 border border-teal-300 text-sm rounded-md text-teal-700 bg-teal-50 hover:bg-teal-100"
                  >
                    <ClipboardList className="h-4 w-4 mr-1" /> Evaluated
                  </button>
                )}

                {permissions.canCancel &&
                  round?.interviewType.toLowerCase() !== "instant" && (
                    <button
                      onClick={() => {
                        // setActionInProgress(true);
                        setCancelReasonModalOpen(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  )}

                {permissions.canEdit && (
                  // (round?.status === "Draft" ||
                  //   round?.status === "RequestSent") &&
                  // round?.interviewType?.toLowerCase() === "instant") ||
                  // round?.interviewType?.toLowerCase() !== "instant") &&
                  //  (
                  <button
                    onClick={() =>
                      navigate(`/mock-interview/${mockinterview?._id}/edit`, {
                        state: { isEdit: true },
                      })
                    }
                    className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Round
                  </button>
                )}

                {round.status === "RequestSent" &&
                  // round?.interviewerType === "External" &&

                  round?.interviewType !== "instant" && (
                    <button
                      onClick={() =>
                        navigate(`/mock-interview/${mockinterview?._id}/edit`, {
                          state: { isRequestSent: true },
                        })
                      }
                      // onClick={() => onEdit(round, { isRequestSent: true })}
                      className="inline-flex items-center px-3 py-2 border border-yellow-500 text-sm rounded-md text-yellow-800 bg-yellow-50 hover:bg-yellow-100"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Change Interviewers
                    </button>
                  )}

                {permissions.canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirmModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Delete Round
                  </button>
                )}
                {permissions.canMarkScheduled && (
                  <button
                    onClick={() => handleActionClick("Scheduled")}
                    className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <Clock className="h-4 w-4 mr-1" /> Mark Scheduled
                  </button>
                )}
                {permissions.canComplete && (
                  <button
                    onClick={() => {
                      setCompletedReasonModalOpen(true);
                      // setConfirmAction("Selected");
                    }}
                    className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Complete
                  </button>
                )}

                {permissions?.canFeedback && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Feedback
                  </button>
                )}

                {permissions.canFeedback && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" /> Feedback
                  </button>
                )}
              </div>
            </div> */}
          </>
        </div>
      </div>

      {/* {(completedReasonModalOpen ||
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
          document.body
          // v1.0.5 -------------------------------------------------------------------------------->
        )}

      <DateChangeConfirmationModal
        isOpen={noShowReasonModalOpen}
        onClose={() => {
          setNoShowReasonModalOpen(false);
          // setActionInProgress(false);
        }}
        onConfirm={handleNoShowWithReason}
        selectedInterviewType={round?.interviewerType}
        status={round?.roundStatus}
        combinedDateTime={round?.dateTime}
        actionType="NoShow"
        isLoading={isNoShowingRound}
        isMockInterview={true}
      />
      <DateChangeConfirmationModal
        isOpen={rejectReasonModalOpen}
        onClose={() => {
          setRejectReasonModalOpen(false);
          // setActionInProgress(false);
        }}
        onConfirm={handleRejectWithReason}
        selectedInterviewType={round?.interviewerType}
        status={round?.roundStatus}
        combinedDateTime={round?.dateTime}
        actionType="Reject"
        isLoading={false}
        isMockInterview={true}
      />

      <DateChangeConfirmationModal
        isOpen={completeReasonModalOpen}
        onClose={() => {
          setCompleteReasonModalOpen(false);
          // setActionInProgress(false);
        }}
        onConfirm={handleCompleteWithReason}
        selectedInterviewType={round?.interviewerType}
        status={round?.roundStatus}
        combinedDateTime={round?.dateTime}
        actionType="Complete"
        isLoading={false}
        isMockInterview={true}
      />

      <DateChangeConfirmationModal
        isOpen={evaluatedReasonModalOpen}
        onClose={() => {
          setEvaluatedReasonModalOpen(false);
          // setActionInProgress(false);
        }}
        onConfirm={handleEvaluatedWithReason}
        selectedInterviewType={round?.interviewerType}
        status={round?.roundStatus}
        combinedDateTime={round?.dateTime}
        actionType="Evaluated"
        isLoading={false}
        isMockInterview={true}
      />

      <DateChangeConfirmationModal
        isOpen={cancelReasonModalOpen}
        onClose={() => {
          setCancelReasonModalOpen(false);
        }}
        onConfirm={handleCancelWithReason}
        selectedInterviewType={round?.interviewerType}
        status={round?.roundStatus}
        combinedDateTime={round?.dateTime}
        actionType="Cancel"
        isLoading={isCancellingRound}
        isMockInterview={true}
        mockInterviewId={round?.mockInterviewId}
      />

      {showRejectionModal && (
        <RejectionModal
          onClose={() => setShowRejectionModal(false)}
          onReject={handleReject}
          roundName={round.name}
        />
      )}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          // interviewId={interviewData._id}
          roundId={round}
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
          document.body
          // v1.0.5 ------------------------------------------------------------------------------------------>
        )} */}

      {/* {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Are you sure you want to {confirmAction.toLowerCase()} this round?
            </h3>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                No, Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmStatusChange}>
                Yes, Confirm
              </Button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default MoockRoundCard;
