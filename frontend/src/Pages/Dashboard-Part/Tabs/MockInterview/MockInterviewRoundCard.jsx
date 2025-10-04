// v1.0.0 - Ashok - added format date function
// v1.0.1 - Ashok - Improved responsiveness

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  XCircle,
  User,
} from "lucide-react";

// import { useCustomContext } from '../../../../Context/Contextfetch';
// import { Button } from '../CommonCode-AllTabs/ui/button';
import InterviewerAvatar from "../CommonCode-AllTabs/InterviewerAvatar";

const MoockRoundCard = ({
  round,
  //   canEdit,
  //   onEdit,
  isActive = false,
  hideHeader = false,
}) => {
  const [showInterviewers, setShowInterviewers] = useState(false);

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

  // const handleStatusChange = async (newStatus, reason = null) => {
  //   const roundData = {
  //     status: newStatus,
  //     completedDate: newStatus === "Completed",
  //     rejectionReason: reason || null,
  //   };

  //   const payload = {
  //     interviewId: interview._id,
  //     round: { ...roundData, },
  //     roundId: round._id,
  //     isEditing: true, // Always set isEditing to true
  //   };

  //   try {
  //     const response = await axios.post(
  //       `${config.REACT_APP_API_URL}/interview/save-round`,
  //       payload
  //     );
  //     console.log("Status updated:", response.data);
  //     // Show success toast
  //   toast.success(`Round status updated to ${newStatus}`, {
  //   });
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //   }
  // };

  // const handleConfirmStatusChange = () => {
  //   if (confirmAction) {
  //     handleStatusChange(confirmAction);
  //   }
  //   setShowConfirmModal(false);
  // };

  // const handleRemoveInterviewer = (interviewerId) => {
  //   const updatedRound = {
  //     interviewers: round.interviewers.filter(id => id !== interviewerId)
  //   };
  // };

  // Get interviewers based on interviewerType

  const externalInterviewers =
    round?.interviewerType === "external" ? round?.interviewers || [] : [];

  // Check if round is active (can be modified)
  //   const isRoundActive = round.status !== 'Completed' && round.status !== 'Cancelled' && round.status !== 'Rejected' && !isInterviewCompleted;

  // Check if round has feedback
  // const hasFeedback = round?.detailedFeedback || (round?.feedbacks && round.feedbacks.length > 0);

  // Check if this is an instant interview (scheduled within 15 minutes of creation)
  const isInstantInterview = () => {
    if (!round.dateTime) return false;

    const scheduledTime = new Date(round.dateTime).getTime();
    const creationTime = new Date(round?.dateTime || "").getTime();

    // If scheduled within 30 minutes of creation, consider it instant
    return scheduledTime - creationTime < 30 * 60 * 1000;
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg ${
          !hideHeader && "shadow-md"
        } overflow-hidden ${isActive ? "ring-2 ring-blue-500" : ""}`}
      >
        <div className="p-5">
          <>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4 sm:grid-cols-1">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </h4>
                {/* v1.0.0 <------------------------------------------------------------------- */}
                <div className="flex sm:flex-col sm:items-start items-center text-sm text-gray-500 mb-1">
                  <div className="flex gap-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Scheduled:
                  </div>
                  <div className="flex items-center justify-between sm:w-full">
                    <span>{formatDate(round?.dateTime?.split(" ")[0])}</span>
                    {isInstantInterview() && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Instant
                      </span>
                    )}
                  </div>
                </div>
                {/* v1.0.0 <------------------------------------------------------------------- */}
                {round.completedDate && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Completed: {formatDate(round?.completedDate)}</span>
                  </div>
                )}
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
                  {/* v1.0.0 <--------------------------------------------------------------------------------- */}
                  {/* <button
                    onClick={() => setShowInterviewers(!showInterviewers)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {showInterviewers ? "Hide" : "Show"}
                    {showInterviewers ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </button> */}
                </div>

                {
                  <div className="space-y-2">
                    {/* v1.0.0 ------------------------------------------------------------------ */}
                    {round?.interviewers?.length > 0 && (
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <User className="h-3 w-3 mr-1" />
                          <span>Internal ({round?.interviewers?.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {round?.interviewers?.map((interviewer) => (
                            <div
                              key={interviewer._id}
                              className="flex items-center"
                            >
                              <InterviewerAvatar
                                interviewer={interviewer}
                                size="sm"
                              />
                              <span className="ml-1 text-xs text-gray-600">
                                {interviewer?.firstName ||
                                  "" + interviewer.lastName ||
                                  ""}
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
                                {interviewer.name}
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

            <div className="mt-6 flex justify-end space-x-3">
              {/* <Button
                      onClick={onEdit}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Round
                    </Button>
             */}
            </div>
          </>
        </div>
      </div>

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

// RoundCard.propTypes = {
//   round: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     mode: PropTypes.string.isRequired,
//     status: PropTypes.string.isRequired,
//     scheduledDate: PropTypes.string,
//     completedDate: PropTypes.string,
//     duration: PropTypes.number,
//     interviewers: PropTypes.arrayOf(PropTypes.string).isRequired,
//     questions: PropTypes.arrayOf(PropTypes.string).isRequired,
//     detailedFeedback: PropTypes.string,
//     feedbacks: PropTypes.array
//   }).isRequired,
//   interviewId: PropTypes.string.isRequired,
//   canEdit: PropTypes.bool.isRequired,
//   onEdit: PropTypes.func.isRequired,
//   isActive: PropTypes.bool,
//   hideHeader: PropTypes.bool
// };

export default MoockRoundCard;
