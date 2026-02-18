// v.0.0 ---------------------------------------------------------- Ranjith added entire changes made for v.0.0
// v1.0.1 - Ashok - Improved responsiveness

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import SupportForm from "../Dashboard-Part/Tabs/SupportDesk/SupportForm";

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
import { useMemo } from "react";
import { extractUrlData } from "../../apiHooks/useVideoCall";
import { useLocation } from "react-router-dom";
import {
  useMockInterviewById,
  useUpdateRoundStatus,
} from "../../apiHooks/useMockInterviews";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
const InterviewActions = ({
  // interviewData,
  isAddMode,
  decodedData,
  onActionComplete,
}) => {
  const queryClient = useQueryClient();
  const { updateRoundStatus, useInterviewDetails } = useInterviews();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [noShowReasonModalOpen, setNoShowReasonModalOpen] = useState(false);
  const [completedReasonModalOpen, setCompletedReasonModalOpen] =
    useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [cancelReasonModalOpen, setCancelReasonModalOpen] = useState(false);
  const [markIncompleteModalOpen, setMarkIncompleteModalOpen] = useState(false);
  const [candidateJoinedReasonModalOpen, setCandidateJoinedReasonModalOpen] =
    useState(false);
  const [
    reportTechnicalIssueReasonModalOpen,
    setReportTechnicalIssueReasonModalOpen,
  ] = useState(false);
  const [
    interviewerJoinedReasonModalOpen,
    setInterviewerJoinedReasonModalOpen,
  ] = useState(false);

  const location = useLocation();

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );

  const isMockInterview = urlData?.interviewType === "mockinterview";

  /* -----------------------------
       INTERVIEW DATA (IMPORTANT FIX)
    ------------------------------ */

  // ✅ ALWAYS call hooks
  const {
    mockInterview,
    isMockLoading,
    isError: isMockError,
    refetch: refetchMock,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    refetchInterval: 15000, // Auto-poll every 15 seconds
    // mockInterviewId: null,
  });

  const {
    data: interview,
    isLoading: isInterviewLoading,
    isError: interviewError,
    refetch: refetchInterview,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId : null,
    enabled: !isMockInterview,
    refetchInterval: 15000, // Auto-poll every 15 seconds
  });

  // State for refresh animation
  const [isRefetching, setIsRefetching] = useState(false);



  // Manual refresh handler
  const handleRefetchStatus = async () => {
    setIsRefetching(true);
    try {
      if (isMockInterview && refetchMock) {
        await refetchMock();
      } else if (!isMockInterview && refetchInterview) {
        await refetchInterview();
      }
    } catch (e) {
      console.error("Error refreshing status:", e);
    } finally {
      setIsRefetching(false);
    }
  };
  // const { data, isLoading } = useInterviewDetails({
  //   roundId: urlData.interviewRoundId,
  // });

  // const candidateData = data?.candidateId || {};
  // const positionData = data?.positionId || {};
  const interviewData = isMockInterview
    ? mockInterview?.rounds[0]
    : interview?.rounds[0] || {};
  const participants = interviewData?.participants;
  // interviewData?.rounds[0]?.participants ||
  // mockInterview?.rounds[0]?.participants ||
  // [];

  // console.log()
  const isCandidateJoined = participants.some(
    (p) => p.role === "Candidate" && p.status === "Joined",
  );
  // console.log("isCandidateJoined", isCandidateJoined);

  // console.log("interviewData interviewData", interviewData);

  // Function to check if a participant is interviewer Joined
  const isInterviewerJoined = (userId) =>
    participants.some(
      (p) =>
        p.role === "Interviewer" &&
        p.userId === userId &&
        p.status === "Joined",
    );

  // Function to check if a participant is Scheduler Joined
  const isSchedulerJoined = (userId) =>
    participants.some(
      (p) =>
        p.role === "Scheduler" && p.userId === userId && p.status === "Joined",
    );

  // Mock interview times for demonstration
  // Replace the mock start/end time with real ones
  const parseInterviewTimes = (interviewData) => {
    // Use correct property
    if (!interviewData?.dateTime) return {};

    const dateTimeString = interviewData.dateTime;

    const parts = dateTimeString.split(" ");
    const date = parts[0];
    const startTime = `${parts[1]} ${parts[2]}`;
    const endTime = `${parts[4]} ${parts[5]}`;

    const [day, month, year] = date.split("-");

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

  const currentStatus = interviewData?.status;

  const isFinalStatus = [
    "Completed",
    "InCompleted",
    "NoShow",
    "Cancelled",
  ].includes(currentStatus);
  const updateMockRoundStatus = useUpdateRoundStatus();
  const isCompleted = currentStatus === "Completed"; // Keep if needed elsewhere

  const handleStatusChange = async (
    newStatus,
    reasonValue = null,
    comment = null,
    type = null,
  ) => {
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
      // Build the payload based on status
      const payload = {
        roundId: interviewData?._id,
        interviewId: interviewData?.interviewId,
        action: newStatus,
      };

      if (type === "CandidateJoined") {
        payload.role = "Candidate";
        payload.joined = true;
        payload.userId =
          interviewData?.candidateId?._id || mockInterview?.ownerId;
      } else if (type === "InterviewerJoined") {
        payload.role = "Interviewer";
        payload.joined = true;
        payload.userId = urlData?.interviewerId;
        payload.interviewerJoined = type === "InterviewerJoined" ? true : false;
      }

      // Add cancellation / NoShow reason if provided
      if (
        ((newStatus === "Cancelled" ||
          newStatus === "NoShow" ||
          newStatus === "InCompleted") &&
          reasonValue) ||
        null
      ) {
        payload.reasonCode = reasonValue || null;
        payload.comment = comment || null;
      }

      console.log("payload payload", payload);

      // await updateRoundStatus(payload);

      let response;

      if (isMockInterview) {
        response = await updateMockRoundStatus.mutateAsync({
          mockInterviewId: mockInterview?._id,
          roundId: interviewData?._id,
          payload,
        });
      } else {
        response = await updateRoundStatus(payload);
      }
      // console.log("response updateRoundStatus", response);

      // await updateRoundStatus({
      //   roundId: round?._id,
      //   interviewId: interview?._id,
      //   status: newStatus, // or any other status
      //   ...(cancellationReason && { cancellationReason }),
      // });
      // Show success toast
      notify.success(`Round Status updated to ${newStatus}`, {});

      // Invalidate interview-details queries to update status in real-time
      queryClient.invalidateQueries({ queryKey: ["interview-details"] });
      // Also invalidate mock interview queries for mock interviews
      if (isMockInterview) {
        queryClient.invalidateQueries({ queryKey: ["mockInterview"] });
      }
      // Also invalidate feedback queries for updated status
      queryClient.invalidateQueries({ queryKey: ["feedbackDatas"] });
      // Notify parent if callback provided
      onActionComplete?.();
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

  const closeModal = () => {
    // setModal(null);
    setInterviewerJoinedReasonModalOpen(false);

    // setFormData({ reason: "", comments: "" });
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
      } else if (interviewerJoinedReasonModalOpen && change) {
        await handleStatusChange(
          interviewData?.status,
          reason,
          comment || null,
          "InterviewerJoined",
        );

        setInterviewerJoinedReasonModalOpen(false);
        setActionInProgress(false);
      }
      // selectedReasonModalOpen status handling
      else if (candidateJoinedReasonModalOpen && change) {
        await handleStatusChange(
          interviewData?.status,
          reason,
          comment || null,
          "CandidateJoined",
        );

        setCandidateJoinedReasonModalOpen(false);
        setActionInProgress(false);
      }
    } catch (error) {
      setActionInProgress(false);
    }
  };

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
        className={`relative border-2 rounded-xl sm:px-4 p-6 transition-all duration-200 cursor-pointer ${disabled
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
            className={`p-3 rounded-lg ${disabled ? "bg-gray-200 text-gray-400" : iconColors[variant]
              }`}
          >
            <Icon size={24} />
          </div>

          <div className="flex-1">
            <h3
              className={`font-semibold mb-2 ${disabled ? "text-gray-400" : "text-gray-800"
                }`}
            >
              {title}
            </h3>
            <p
              className={`text-sm mb-3 ${disabled ? "text-gray-400" : "text-gray-600"
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

  const isLoading = isInterviewLoading || isMockLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-custom-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  return (
    // v1.0.1 <----------------------------------------------------------------------------
    <div className="mb-10">
      {/* Status Card */}
      <div className="mb-4 bg-gradient-to-r from-custom-blue to-custom-blue/90 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl font-bold">
            Interview Status
          </h2>
          <button
            onClick={handleRefetchStatus}
            disabled={isRefetching}
            className="p-1.5 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            title="Refresh status"
          >
            <RefreshCw
              size={16}
              className={isRefetching ? "animate-spin" : ""}
            />
          </button>
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
              {interviewData?.status === "RequestSent"
                ? "Request Sent"
                : interviewData?.status === "InProgress"
                  ? "In Progress"
                  : interviewData?.status === "FeedbackPending"
                    ? "Feedback Pending"
                    : interviewData?.status === "FeedbackSubmitted"
                      ? "Feedback Submitted"
                      : interviewData?.status === "NoShow"
                        ? "No Show"
                        : interviewData?.status === "InCompleted" ?
                          "In Completed"
                          : capitalizeFirstLetter(interviewData?.status)}
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
          {/* isSchedulerJoined  Participation */}
          {/* {urlData?.isSchedule && (
            <ActionCard
              icon={CheckCircle}
              title="Scheduler Joined"
              description="Confirm that the scheduler has successfully joined the interview"
              // onClick={() => handleConfirm("interviewerJoined")}
              onClick={() => {
                // openModal("noShow");
                // setActionInProgress(true);
                setInterviewerJoinedReasonModalOpen(true);
              }}
              disabled={isCompleted || isSchedulerJoined}
              variant="success"
            />
          )} */}

          {/* Interviewer Participation */}
          {urlData?.isSchedule && (
            <ActionCard
              icon={CheckCircle}
              title="Interviewer Joined"
              description="Confirm that the interviewer has successfully joined the interview"
              // onClick={() => handleConfirm("interviewerJoined")}
              onClick={() => {
                // openModal("noShow");
                // setActionInProgress(true);
                setInterviewerJoinedReasonModalOpen(true);
              }}
              disabled={isCompleted || isInterviewerJoined}
              variant="success"
            />
          )}

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
            disabled={
              isCompleted || !candidateActionEnabled || isCandidateJoined
            }
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
            disabled={isCompleted || !candidateActionEnabled || isFinalStatus}
            variant="danger"
          // timeUntil={!candidateActionEnabled ? getTimeUntilEnabled(new Date(startTime.getTime() + 15 * 60000)) : null}
          />

          {/* for scheduler Interview Completion */}
          {urlData?.isSchedule && (
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
              disabled={
                isCompleted || !completionActionEnabled || isFinalStatus
              }
              variant="success"
              // timeUntil={!completionActionEnabled ? getTimeUntilEnabled(new Date(endTime.getTime() - 15 * 60000)) : null}
              ready={completionActionEnabled}
            />
          )}

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
            disabled={isCompleted || !completionActionEnabled || isFinalStatus}
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
          {urlData?.isSchedule && (
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
              disabled={isCompleted || isFinalStatus}
              variant="danger"
            // ready={canCancel}
            />
          )}
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

      {(completedReasonModalOpen ||
        candidateJoinedReasonModalOpen ||
        interviewerJoinedReasonModalOpen) &&
        createPortal(
          // v1.0.5 <--------------------------------------------------------------------------------
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-3">
                {completedReasonModalOpen
                  ? "Are you sure you want to Complete this round?"
                  : interviewerJoinedReasonModalOpen
                    ? "Are you sure Interviewer Joined?"
                    : "Are you sure Candidate Joined?"}
              </h3>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompletedReasonModalOpen(false);
                    setCandidateJoinedReasonModalOpen(false);
                    setInterviewerJoinedReasonModalOpen(false);
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
          document.body,
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
        roundData={interviewData}
        showPolicyInfo={true}
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
          roundId={interviewData?._id}
        />
      )}
    </div>
    // v1.0.1 ---------------------------------------------------------------------------->
  );
};

export default InterviewActions;

// v.0.0.0 ---------------------------------------------------------- Ranjith added entire changes made
