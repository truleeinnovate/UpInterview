// v.0.0 ---------------------------------------------------------- Ranjith added entire changes made for v.0.0
// v1.0.1 - Ashok - Improved responsiveness

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  X,
} from "lucide-react";
import axios from "axios";
import SupportForm from "../Dashboard-Part/Tabs/SupportDesk/SupportForm";
// import { toast } from "react-toastify";
import { config } from "../../config";
import { useInterviews } from "../../apiHooks/useInterviews";
import { notify } from "../../services/toastService";
import RoundStatusReasonModal from "../Dashboard-Part/Tabs/CommonCode-AllTabs/RoundStatusReasonModal";
import {
  CANCEL_OPTIONS,
  INTERVIEW_INCOMPLETE_REASONS,
  NO_SHOW_OPTIONS,
} from "../../utils/roundHistoryOptions";
import { createPortal } from "react-dom";
import { Button } from "../../../src/Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button";
const InterviewActions = ({
  interviewData,
  isAddMode,
  decodedData,
  onActionComplete,
}) => {
  const { updateRoundStatus } = useInterviews();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ reason: "", comments: "" });

  const [noShowReasonModalOpen, setNoShowReasonModalOpen] = useState(false);
  // const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [completedReasonModalOpen, setCompletedReasonModalOpen] =
    useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  // console.log("interviewData InterviewActions ", interviewData);
  const [markIncompleteModalOpen, setMarkIncompleteModalOpen] = useState(false);
  const [candidateJoinedReasonModalOpen, setCandidateJoinedReasonModalOpen] =
    useState(false);
  const [
    reportTechnicalIssueReasonModalOpen,
    setReportTechnicalIssueReasonModalOpen,
  ] = useState(false);

  // Mock interview times for demonstration
  // Replace the mock start/end time with real ones
  const parseInterviewTimes = (interviewData) => {
    if (!interviewData?.interviewRound?.dateTime) return {};

    // Example: "17-08-2025 1:32 PM - 07:25 PM"
    const dateTimeString = interviewData.interviewRound.dateTime;

    // Split on space to get all parts
    const parts = dateTimeString.split(" ");

    // Extract date (first part)
    const date = parts[0];

    // Extract start time (second and third parts)
    const startTime = `${parts[1]} ${parts[2]}`;

    // Extract end time (fourth and fifth parts)
    const endTime = `${parts[4]} ${parts[5]}`;

    const [day, month, year] = date.split("-");

    // Build Date strings
    const startDateTime = new Date(`${year}-${month}-${day} ${startTime}`);
    const endDateTime = new Date(`${year}-${month}-${day} ${endTime}`);

    return { startDateTime, endDateTime };
  };

  const { startDateTime, endDateTime } = parseInterviewTimes(interviewData);

  // Fallback if parsing fails
  const startTime = startDateTime;
  const endTime = endDateTime;

  // Timer updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Time-based conditions
  // const candidateActionEnabled = currentTime >= new Date(startTime.getTime() + 15 * 60000);
  // const completionActionEnabled = currentTime >= new Date(endTime.getTime() - 15 * 60000);
  const canCancel = currentTime <= endTime;
  // const canRaiseIssue = currentTime >= startTime && currentTime <= endTime;
  const candidateActionEnabled = startDateTime;
  const completionActionEnabled = startDateTime;
  // const canCancel = currentTime <= endTime;
  const canRaiseIssue = startTime;

  // Handlers
  // const handleConfirm = (type, extra = {}) => {
  //   onActionComplete({ type, timestamp: new Date(), ...extra });
  //   setModal(null);
  //   setFormData({ reason: "", comments: "" });
  // };

  // const handleConfirm = async (type, extra = {}) => {
  //   try {
  //     if (type === "completion" || type === "noShow" || type === "cancel") {
  //       // Determine the new status based on the action type
  //       let newStatus;
  //       let rejectionReason = null;
  //       let event = null;
  //       let eventReason = null;

  //       if (type === "completion") {
  //         newStatus =
  //           extra.status === "completed" ? "Completed" : "InCompleted";
  //         rejectionReason = extra.comments || null;
  //       } else if (type === "noShow") {
  //         newStatus = "NoShow";
  //         event = "Candidate_NoShow";
  //         eventReason = extra.comments;
  //       } else if (type === "cancel") {
  //         newStatus = "Cancelled";
  //         rejectionReason = extra.reason || null;
  //       }

  //       // Prepare the round data for API call
  //       const roundData = {
  //         status: newStatus,
  //         completedDate: newStatus === "Completed" ? new Date() : null,
  //         rejectionReason: rejectionReason,
  //         // NEW: Add event and eventReason for Candidate No-Show
  //         ...(event && { event }),
  //         ...(eventReason && { eventReason }),
  //       };

  //       const payload = {
  //         interviewId: interviewData?.interviewRound?.interviewId,
  //         // round: { ...roundData },
  //         roundId: interviewData?.interviewRound?._id,
  //         // isEditing: true,
  //         cancellationReason: rejectionReason,
  //         action: newStatus,
  //       };

  //       try {
  //         // const response = await axios.post(
  //         //   `${config.REACT_APP_API_URL}/interview/save-round`,
  //         //   payload
  //         // );
  //         const response = await updateRoundStatus(payload);

  //         console.log("Status updated:", response.data);

  //         // Show success toast based on action type
  //         if (type === "completion") {
  //           notify.success(`Interview marked as ${newStatus}`, {});
  //         } else if (type === "noShow") {
  //           notify.success("Candidate marked as no-show", {});
  //         } else if (type === "cancel") {
  //           notify.success("Interview cancelled successfully", {});
  //         }

  //         // Show success toast based on action type
  //         // if (type === "completion") {
  //         //   toast.success(`Interview marked as ${newStatus}`, {});
  //         // } else if (type === "noShow") {
  //         //   toast.success("Candidate marked as no-show", {});
  //         // }

  //         // Update local state after success
  //         // onActionComplete({ type, timestamp: new Date(), ...extra });

  //         // Update local state after success - ADD SAFETY CHECK
  //         if (typeof onActionComplete === "function") {
  //           onActionComplete({ type, timestamp: new Date(), ...extra });
  //         }
  //       } catch (error) {
  //         console.error("Error updating status:", error);
  //         toast.error("Failed to update status");
  //       }
  //     } else {
  //       // For other actions (techIssue, cancel), just complete without API call
  //       onActionComplete({ type, timestamp: new Date(), ...extra });
  //     }
  //   } catch (error) {
  //     console.error("Error updating interview:", error);
  //     toast.error("An error occurred");
  //   } finally {
  //     setModal(null);
  //     setFormData({ reason: "", comments: "" });
  //   }
  // };

  const handleStatusChange = async (
    newStatus,
    reasonValue = null,
    comment = null
  ) => {
    // const roundData = {
    //   status: newStatus,
    //   completedDate: newStatus === "Completed",
    //   rejectionReason: reason || null,
    // };

    // const payload = {
    //   interviewId: interview._id,
    //   round: { ...roundData },
    //   roundId: round._id,
    //   isEditing: true, // Always set isEditing to true
    // };

    // For cancellation/no-show, we need to ensure we pass a reason
    if ((newStatus === "Cancelled" || newStatus === "NoShow") && !reasonValue) {
      if (newStatus === "Cancelled") {
        setActionInProgress(true);
        setCancelReasonModalOpen(true);
      } else if (newStatus === "NoShow") {
        setActionInProgress(true);
        setNoShowReasonModalOpen(true);
      }
      return;
    }
    // console.log("status reason", newStatus, reasonValue);

    try {
      // const response = await axios.post(
      //   `${config.REACT_APP_API_URL}/interview/save-round`,
      //   payload
      // );
      // const response = await updateInterviewRound(payload);

      // Build the payload based on status
      const payload = {
        roundId: interviewData?.interviewRound?._id,
        interviewId: interviewData?.interviewRound?.interviewId,
        action: newStatus,
      };

      // Add cancellation / NoShow reason if provided
      if (
        (newStatus === "Cancelled" ||
          newStatus === "NoShow" ||
          newStatus === "InCompleted") &&
        reasonValue
      ) {
        payload.reasonCode = reasonValue;
        payload.comment = comment || null;
      }

      console.log("payload payload", payload);

      await updateRoundStatus(payload);

      // await updateRoundStatus({
      //   roundId: round?._id,
      //   interviewId: interview?._id,
      //   status: newStatus, // or any other status
      //   ...(cancellationReason && { cancellationReason }),
      // });
      // Show success toast
      notify.success(`Round Status updated to ${newStatus}`, {});
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // handling No show functionlity
  const handleNoShowWithReason = async ({ reason, comment }) => {
    try {
      await handleStatusChange("NoShow", reason, comment || null);
      setNoShowReasonModalOpen(false);
      setActionInProgress(false);
    } catch (error) {
      setActionInProgress(false);
    }
  };

  // handling Cancellation functionlity
  const handleCancelWithReason = async ({ reason, comment }) => {
    try {
      await handleStatusChange("Cancelled", reason, comment || null);
      setCancelReasonModalOpen(false);
      setActionInProgress(false);
    } catch (error) {
      setActionInProgress(false);
    }
  };

  const handleMarkAsIncompleteWithReason = async ({ reason, comment }) => {
    try {
      await handleStatusChange("InCompleted", reason, comment || null);
      setMarkIncompleteModalOpen(false);
      setActionInProgress(false);
    } catch (error) {
      setActionInProgress(false);
    }
  };

  // const openModal = (type, status = null) => {
  //   setModal({ type, status });
  //   setFormData({ reason: "", comments: "" });
  // };

  const closeModal = () => {
    setModal(null);
    setFormData({ reason: "", comments: "" });
  };

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
        setActionInProgress(false);
      }
      // selectedReasonModalOpen status handling
      else if (candidateJoinedReasonModalOpen && change) {
        await handleStatusChange("CandidateJoined", reason, comment || null);
        setCandidateJoinedReasonModalOpen(false);
        setActionInProgress(false);
      }
    } catch (error) {
      setActionInProgress(false);
    }
  };

  // const getTimeUntilEnabled = (targetTime) => {
  //   const diff = targetTime - currentTime;
  //   if (diff <= 0) return null;
  //   const minutes = Math.ceil(diff / (1000 * 60));
  //   return `${minutes} min`;
  // };

  const isCompleted = interviewData?.interviewRound?.status === "completed";
  // v1.0.1 <------------------------------------------------
  const ActionCard = ({
    icon: Icon,
    title,
    description,
    onClick,
    disabled,
    variant = "default",
    timeUntil = null,
    ready = false,
  }) => {
    const variants = {
      success: "border-green-200 bg-green-50 hover:bg-green-100",
      warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
      danger: "border-red-200 bg-red-50 hover:bg-red-100",
      default: "border-gray-200 bg-white hover:bg-gray-50",
    };

    const iconColors = {
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      danger: "text-red-600 bg-red-100",
      default: "text-gray-600 bg-gray-100",
    };

    return (
      <div
        className={`relative border-2 rounded-xl sm:px-4 p-6 transition-all duration-200 cursor-pointer ${
          disabled
            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
            : variants[variant]
        }`}
        onClick={disabled ? undefined : onClick}
      >
        {ready && !disabled && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Ready
          </div>
        )}

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${
              disabled ? "bg-gray-200 text-gray-400" : iconColors[variant]
            }`}
          >
            <Icon size={24} />
          </div>

          <div className="flex-1">
            <h3
              className={`font-semibold mb-2 ${
                disabled ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {title}
            </h3>
            <p
              className={`text-sm mb-3 ${
                disabled ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {description}
            </p>

            {/* {timeUntil && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>Available in {timeUntil}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>
    );
  };
  // v1.0.1 ------------------------------------------------>

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  return (
    // v1.0.1 <----------------------------------------------------------------------------
    <div className="mb-10">
      {/* Status Card */}
      <div className="mb-4 bg-gradient-to-r from-custom-blue to-custom-blue/90 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl font-bold">
            Interview Status
          </h2>
          {/* <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white text-opacity-80">Start Time</p>
            <p className="font-semibold">
              {startTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <p className="text-white text-opacity-80">Status</p>
            <p className="font-semibold">
              {interviewData?.interviewRound?.status === "InProgress"
                ? "In Progress"
                : interviewData?.interviewRound?.status}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="space-y-4">
        <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800">
          Available Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          {/* Candidate Participation */}
          <ActionCard
            icon={CheckCircle}
            title="Candidate Joined"
            description="Confirm that the candidate has successfully joined the interview"
            // onClick={() => handleConfirm("candidateJoined")}
            onClick={() => {
              // openModal("noShow");
              setActionInProgress(true);
              setCandidateJoinedReasonModalOpen(true);
            }}
            disabled={isCompleted || !candidateActionEnabled}
            variant="success"
            // timeUntil={!candidateActionEnabled ? getTimeUntilEnabled(new Date(startTime.getTime() + 15 * 60000)) : null}
            ready={candidateActionEnabled}
          />

          <ActionCard
            icon={XCircle}
            title="Candidate No-Show"
            description="Mark candidate as no-show if they haven't joined after 15 minutes"
            onClick={() => {
              // openModal("noShow");
              setActionInProgress(true);
              setNoShowReasonModalOpen(true);
            }}
            disabled={isCompleted || !candidateActionEnabled}
            variant="danger"
            // timeUntil={!candidateActionEnabled ? getTimeUntilEnabled(new Date(startTime.getTime() + 15 * 60000)) : null}
          />

          {/* Interview Completion */}
          <ActionCard
            icon={CheckCircle}
            title="Mark Completed"
            description="Mark the interview as successfully completed"
            // onClick={() => openModal("completion", "completed")}
            onClick={() => {
              setActionInProgress(true);
              setCompletedReasonModalOpen(true);
              // setConfirmAction("Selected");
            }}
            disabled={isCompleted || !completionActionEnabled}
            variant="success"
            // timeUntil={!completionActionEnabled ? getTimeUntilEnabled(new Date(endTime.getTime() - 15 * 60000)) : null}
            ready={completionActionEnabled}
          />

          <ActionCard
            icon={AlertTriangle}
            title="Mark Incomplete"
            description="Mark the interview as incomplete due to issues"
            // onClick={() => openModal("completion", "incomplete")}
            onClick={() => {
              setActionInProgress(true);
              setMarkIncompleteModalOpen(true);
              // setConfirmAction("Selected");
            }}
            disabled={isCompleted || !completionActionEnabled}
            variant="warning"
            // timeUntil={!completionActionEnabled ? getTimeUntilEnabled(new Date(endTime.getTime() - 15 * 60000)) : null}
          />

          {/* Technical Issues */}
          <ActionCard
            icon={AlertCircle}
            title="Report Technical Issue"
            description="Report any technical problems during the interview"
            // onClick={() => openModal("techIssue")}
            onClick={() => {
              setActionInProgress(true);
              setReportTechnicalIssueReasonModalOpen(true);

              // setConfirmAction("Cancelled");
              // setShowConfirmModal(true);
            }}
            disabled={isCompleted || !canRaiseIssue}
            variant="warning"
            ready={canRaiseIssue}
          />

          {/* Cancel Interview */}
          <ActionCard
            icon={Ban}
            title="Cancel Interview"
            description="Cancel the interview and notify all parties"
            // onClick={() => openModal("cancel")}
            onClick={() => {
              setActionInProgress(true);
              setCancelReasonModalOpen(true);

              // setConfirmAction("Cancelled");
              // setShowConfirmModal(true);
            }}
            disabled={isCompleted || !canCancel}
            variant="danger"
            // ready={canCancel}
          />
        </div>
      </div>

      {/* Shared reason modal for No Show */}
      <RoundStatusReasonModal
        isOpen={noShowReasonModalOpen}
        title="Mark as No Show"
        label="Reason for No Show"
        options={NO_SHOW_OPTIONS}
        onClose={() => {
          setNoShowReasonModalOpen(false);
          setActionInProgress(false);
        }}
        onConfirm={handleNoShowWithReason}
        confirmLabel="Confirm No Show"
      />

      {(completedReasonModalOpen || candidateJoinedReasonModalOpen) &&
        createPortal(
          // v1.0.5 <--------------------------------------------------------------------------------
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-3">
                Are you sure you want to{" "}
                {completedReasonModalOpen ? "Complete" : "Joined"} this round?
              </h3>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompletedReasonModalOpen(false);
                    setCandidateJoinedReasonModalOpen(false);
                    // setSelectedReasonModalOpen(false);
                    setActionInProgress(false);
                  }}
                >
                  No, Cancel
                </Button>
                <Button
                  // className={`${
                  //   confirmAction === "Cancelled" &&
                  //   "bg-red-600 hover:bg-red-700"
                  // }`}
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

      {/* Shared reason modal for Cancel */}
      <RoundStatusReasonModal
        isOpen={cancelReasonModalOpen}
        title="Cancel Round"
        label="Reason for Cancellation"
        options={CANCEL_OPTIONS}
        onClose={() => {
          setCancelReasonModalOpen(false);
          setActionInProgress(false);
        }}
        onConfirm={handleCancelWithReason}
        confirmLabel="Confirm Cancel"
      />

      {/* Shared reason modal for No Show */}
      <RoundStatusReasonModal
        isOpen={markIncompleteModalOpen}
        title="Mark as Incomplete"
        label="Reason for Mark Incomplete"
        options={INTERVIEW_INCOMPLETE_REASONS}
        onClose={() => {
          setMarkIncompleteModalOpen(false);
          setActionInProgress(false);
        }}
        onConfirm={handleMarkAsIncompleteWithReason}
        confirmLabel="Confirm No Show"
      />

      {/* Shared reason modal for No Show */}
      {/* <RoundStatusReasonModal
        isOpen={markCompletedModalOpen}
        title="Mark as Completed"
        label="Reason for Mark Completed"
        // options={INTERVIEW_COMPLETED_REASONS}
        onClose={() => {
          setMarkCompletedModalOpen(false);
          setActionInProgress(false);
        }}
        onConfirm={handleMarkAsCompletedWithReason}
        confirmLabel="Confirm Completed"
      /> */}

      {reportTechnicalIssueReasonModalOpen && (
        <SupportForm
          onClose={closeModal}
          FeedbackIssueType="FeedbackInterviewTechIssue"
          roundId={interviewData?.interviewRound?._id}
        />
      )}
    </div>
    // v1.0.1 ---------------------------------------------------------------------------->
  );
};

export default InterviewActions;

// v.0.0.0 ---------------------------------------------------------- Ranjith added entire changes made
