// v1.0.0 - Ashok - modified as first card should open by default and added optional chaining(?)
// v1.0.1 - Ashok - improved first should open by default
// v1.0.2 - Ashok - Improved responsiveness

import { useState, useEffect } from "react";
import RoundCard from "./RoundCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import MeetPlatformBadge from "../../../../../utils/MeetPlatformBadge/meetPlatformBadge.js";
import { createJoinMeetingUrl } from "./joinMeeting";

// import { useAssessments } from "../../../../../apiHooks/useAssessments";
import { useScheduleAssessments } from "../../../../../apiHooks/useScheduleAssessments.js";
import { useSingleContact } from "../../../../../apiHooks/useUsers";
import { notify } from "../../../../../services/toastService.js";
import { config } from "../../../../../config.js";
import axios from "axios";

const VerticalRoundsView = ({
  rounds,
  interviewData,
  // canEditRound,
  onEditRound,
  onInitiateAction,
}) => {
  // const { useScheduledAssessments } = useScheduleAssessments();
  // const { scheduleData } = useScheduleAssessments();
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);
  const { singleContact } = useSingleContact();

  // Track expanded rounds
  const [expandedRounds, setExpandedRounds] = useState({});
  const [resendingRoundId, setResendingRoundId] = useState(null);
  // v1.0.1 <-------------------------------------------------------------------------------------
  // v1.0.0 <----------------------------------------------------------
  // Open first round by default
  // useEffect(() => {
  //   if (sortedRounds.length > 0) {
  //     setExpandedRounds({ [sortedRounds[0]._id]: true });
  //   }
  // }, [rounds]);

  useEffect(() => {
    if (sortedRounds.length > 0) {
      setExpandedRounds(sortedRounds[0]._id);
    }
  }, [rounds]);

  // v1.0.0 ---------------------------------------------------------->

  // Toggle round expansion
  // const toggleRound = (roundId) => {
  //   setExpandedRounds((prev) => ({
  //     ...prev,
  //     [roundId]: !prev[roundId],
  //   }));
  // };

  // Check if a round is expanded
  // const isExpanded = (roundId) => !!expandedRounds[roundId];

  // Toggle round expansion (only one open at a time)
  const toggleRound = (roundId) => {
    setExpandedRounds((prev) => (prev === roundId ? null : roundId));
  };

  // Check if a round is expanded
  const isExpanded = (roundId) => expandedRounds === roundId;
  // v1.0.1 -------------------------------------------------------------------------------------->

  // v1.0.0 <----------------------------------------------------------
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  // v1.0.0 ---------------------------------------------------------->
  let [candidateAssessment, setCandidateAssessment] = useState(null);
  // let [currentScheduledAssessment, setCurrentScheduledAssessment] =
  //   useState(null);

  // Assessment round status handling
  // let getAssessmentRoundStatus = (round) => {
  //   if (round.roundTitle === "Assessment" && candidateAssessment) {
  //     return candidateAssessment.status || "Pending";
  //   }
  //   return round?.status;
  // };

  // 🔑 Hook to fetch scheduled assessments
  let { data: scheduledAssessments = [] } = useScheduleAssessments(
    sortedRounds.some((r) => r.roundTitle === "Assessment")
      ? sortedRounds.find((r) => r.roundTitle === "Assessment")?.assessmentId
      : null,
  );

  // 🔑 Whenever rounds/assessments change, extract candidate-specific data
  useEffect(() => {
    sortedRounds.forEach((round) => {
      if (
        round.roundTitle === "Assessment" &&
        round.scheduleAssessmentId &&
        scheduledAssessments.length > 0
      ) {
        let filteredAssessment = scheduledAssessments?.find(
          (assessment) => assessment._id === round.scheduleAssessmentId,
        );
        let candidateData = filteredAssessment?.candidates?.find(
          (candidate) =>
            candidate.candidateId?._id === interviewData?.candidateId?._id,
        );

        // if (filteredAssessment) {
        //   setCurrentScheduledAssessment(filteredAssessment);
        // }
        if (candidateData) {
          setCandidateAssessment(candidateData);
        }
      }
    });
  }, [scheduledAssessments, sortedRounds, interviewData]);

  function getStatusBadgeColor(status) {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800 border border-gray-400";
      case "RequestSent":
        return "bg-orange-50 text-orange-800 border border-orange-200";
      case "Scheduled":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "Rescheduled":
        return "bg-blue-100 text-blue-900 border border-blue-400";
      case "Completed":
        return "bg-green-50 text-green-800 border border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-800 border border-red-200";
      case "Rejected":
        return "bg-purple-50 text-purple-800 border border-purple-200";
      case "Selected":
        return "bg-teal-50 text-teal-800 border border-teal-200";
      case "InComplete":
        return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  }

  const handleJoinMeeting = (round) => {
    const url = createJoinMeetingUrl(round, interviewData, singleContact.contactId
    );

    if (!url) {
      console.warn("No valid join URL");
      return;
    }

    // ONLY this line — no location.href, no useNavigate, no extra calls
    window.open(url, '_blank', 'noopener,noreferrer');

    // Optional: prevent any default/fallback behavior
    // Do NOT add window.location or navigate here
  };

  const handleResendEmails = async (round) => {
    if (!round?._id) return;

    // Prevent action if already in progress
    if (resendingRoundId === round._id) return;

    setResendingRoundId(round._id);
    try {
      const payload = {
        interviewId: interviewData?._id,
        roundId: round._id,
        sendEmails: true,
        type: "interview"
      };

      const response = await axios.post(`${config.REACT_APP_API_URL}/emails/interview/round-emails`, payload);

      if (response.data?.success) {
        notify.success("Links resent successfully!", { id: "resend-emails" });
      } else {
        notify.error(response.data?.message || "Failed to resend links", {
          id: "resend-emails",
        });
      }
    } catch (err) {
      console.error("Resend emails failed:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while resending links";

      notify.error(message, { id: "resend-emails" });
    } finally {
      // Always clear loading state
      setResendingRoundId(null);
    }
  };
  return (
    <div className="space-y-4">
      {sortedRounds.map((round, index) => {
        const isResending = resendingRoundId === round._id;
        return (
          <div
            key={round._id || `${round.sequence}-${index}`}
            className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
          >
            <button
              onClick={() => toggleRound(round?._id)}
              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-custom-blue mr-2">
                  <span className="text-sm font-medium">{round?.sequence}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    {/* v1.0.3 <-------------------------------------------------------------------------------------------- */}
                    <h3 className="sm:text-sm md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-900">
                      {/* v1.0.3 --------------------------------------------------------------------------------------------> */}
                      {round?.roundTitle}
                    </h3>
                    <span
                      className={`mx-2 text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                        round?.status,
                      )}`}
                    >
                      {round?.status === "RequestSent"
                        ? "Request Sent"
                        : round?.status === "InProgress"
                          ? "In Progress"
                          : round?.status === "FeedbackPending"
                            ? "Feedback Pending"
                            : round?.status === "FeedbackSubmitted"
                              ? "Feedback Submitted"
                              :
                              // : round?.status,
                              capitalizeFirstLetter(round?.status)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span className="mr-2">
                      {capitalizeFirstLetter(round?.interviewType)}
                    </span>
                    <span>•</span>
                    <span className="mx-2">
                      {capitalizeFirstLetter(round?.interviewMode)}
                    </span>
                    {round?.meetPlatform &&
                      round?.roundTitle !== "Assessment" && (
                        <div className="flex items-center gap-2">
                          <MeetPlatformBadge platform={round?.meetPlatform} />
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
                                {/* Vertical divider */}
                                <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
                                {/* ─────────────── New Resend Links Button ─────────────── */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isResending) handleResendEmails(round);
                                  }}
                                  disabled={isResending}
                                  className={`
                            text-sm font-medium transition-colors
                            ${isResending
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "cursor-pointer text-custom-blue hover:underline"}
                          `}
                                  title="Resend interview links to candidate, interviewers & scheduler"
                                >
                                  {isResending ? "Resending..." : "Resend Links"}
                                </button>
                              </>
                            )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {isExpanded(round._id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
            {isExpanded(round._id) && (
              // v1.0.3 <--------------------------------
              <div className="sm:px-0 px-4 pb-4">
                {/* v1.0.3 --------------------------------> */}
                <RoundCard
                  round={round}
                  interviewData={interviewData}
                  // canEdit={canEditRound(round)}
                  // onEdit={() => onEditRound(round)}
                  onEdit={(r, opts) => onEditRound(r, opts)}
                  isActive={false}
                  hideHeader={true}
                  onInitiateAction={onInitiateAction}
                  // isExpanded={isExpanded}
                  isExpanded={isExpanded(round._id)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// VerticalRoundsView.propTypes = {
//   rounds: PropTypes.arrayOf(PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     mode: PropTypes.string.isRequired,
//     sequence: PropTypes.number.isRequired
//   })).isRequired,
//   interviewId: PropTypes.string.isRequired,
//   canEditRound: PropTypes.func.isRequired,
//   onEditRound: PropTypes.func.isRequired
// };

export default VerticalRoundsView;
