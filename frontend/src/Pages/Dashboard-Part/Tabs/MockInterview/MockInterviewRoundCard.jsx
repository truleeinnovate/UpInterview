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
  MessageSquare,
  ThumbsDown,
  CheckCircle,
  Edit,
} from "lucide-react";
import Cookies from "js-cookie";
import { createPortal } from "react-dom";
// import { useCustomContext } from '../../../../Context/Contextfetch';
// import { Button } from '../CommonCode-AllTabs/ui/button';
import InterviewerAvatar from "../CommonCode-AllTabs/InterviewerAvatar";
import FeedbackModal from "../Interview-New/components/FeedbackModal";
import RejectionModal from "../Interview-New/components/RejectionModal";
import { Button } from "../CommonCode-AllTabs/ui/button";
import axios from "axios";
import { notify } from "../../../../services/toastService";
import { config } from "../../../../config";
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";

const MoockRoundCard = ({
  mockinterview,
  round,
    canEdit,
    onEdit,
  isActive = false,
  hideHeader = false,
}) => {
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);
      const [confirmAction, setConfirmAction] = useState(null);
      const [showConfirmModal, setShowConfirmModal] = useState(false);

      // console.log("round",round);
      const { addOrUpdateMockInterview } = useMockInterviews();

       const authToken = Cookies.get("authToken");
          const tokenPayload = decodeJwt(authToken);
          const userId = tokenPayload?.userId;
          const organizationId = tokenPayload?.tenantId;

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
  //     ...round,
  //     _id: round._id,
     
  //     status: newStatus,
  //     completedDate: newStatus === "Completed",
  //     rejectionReason: reason || null,
  //   };

  //   const formData = {
  //     id: round?.mockInterviewId,
  //     rounds: [ roundData ],
  //     isEdit: true,
  //     // roundId: round._id,
  //     // isEditing: true, // Always set isEditing to true
  //   };
  //   console.log("done",
  //     {
  //       formData: {
  //         // id: round?.mockInterviewId,      // ID of existing mock interview (if editing)
  //         ...mockinterview,
  //         rounds: [                        // Always an array of rounds
  //           {
  //             ...round,
  //             _id: round?._id,             // keep round ID for updates
  //             status: newStatus,           // e.g. "Scheduled", "Completed", etc.
  //             completedDate: newStatus === "Completed" ? new Date() : null,
  //             rejectionReason: reason || null,
  //           },
  //         ],
  //         isEdit: true,                    // Always true for update
  //       },
  //       id: round?.mockInterviewId,        // duplicate for backend compatibility
  //       isEdit: true,
  //       userId,
  //       organizationId,
  //                                    // the original round reference
  //     }
  //   );
    

  //   try {
  //     // const response = await axios.patch(
  //     //   `${config.REACT_APP_API_URL}/updateMockInterview/${round?.mockInterviewId}`,
  //     //   payload
  //     // );
  //      // Call API to save/update Page 1 data
  //      const response = await addOrUpdateMockInterview(
  //       {
  //         formData: {
  //           // id: round?.mockInterviewId,      // ID of existing mock interview (if editing)
  //           ...mockinterview,
  //           rounds: [                        // Always an array of rounds
  //             {
  //               ...round,
  //               _id: round?._id,             // keep round ID for updates
  //               status: newStatus,           // e.g. "Scheduled", "Completed", etc.
  //               completedDate: newStatus === "Completed" ? new Date() : null,
  //               rejectionReason: reason || null,
  //             },
  //           ],
  //           isEdit: true,                    // Always true for update
  //         },
  //         id: round?.mockInterviewId,        // duplicate for backend compatibility
  //         isEdit: true,
  //         userId,
  //         organizationId,
  //                                      // the original round reference
  //       }
  //      );
  //      const savedMockId = response?.data?.mockInterview?._id || response?._id || response?.data?._id;


  //      console.log("Status updated:", response.data);
  //      // Show success toast
  //      if (savedMockId) {
  //       notify.success(`Round status updated to ${newStatus}`, {
  //       });
  //      }

  //       if (!savedMockId) {
  //              notify.error("Failed to save mock interview data");
  //              return;
  //            }
  
     
   
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //   }
  // };


  const handleStatusChange = async (newStatus, reason = null) => {
    try {
      // 🧩 Ensure interviewer IDs are strings
      const interviewerIds =
        Array.isArray(round?.interviewers)
          ? round.interviewers.map((i) => (typeof i === "object" ? i._id : i))
          : [];
  
      // 🧩 Prepare round data in backend-expected shape
      const roundData = {
        ...round,
        _id: round._id,
        interviewers: interviewerIds, // ✅ Fix: send string IDs, not objects
        status: newStatus,
        completedDate: newStatus === "Completed" ? new Date() : null,
        rejectionReason: reason || null,
      };
  
      // 🧩 Prepare formData payload
      const formData = {
        id: round?.mockInterviewId,
        rounds: [roundData],
        isEdit: true,
      };
  
      console.log("✅ Mock Interview Status Update Payload:", {
        formData,
        id: round?.mockInterviewId,
        isEdit: true,
        userId,
        organizationId,
      });
  
      // 🧩 Call mutation
      const response = await addOrUpdateMockInterview({
        formData,
        id: round?.mockInterviewId,
        isEdit: true,
        userId,
        organizationId,
      });
  
      const savedMockId =
        response?.data?.mockInterview?._id ||
        response?._id ||
        response?.data?._id;
  
      if (savedMockId) {
        notify.success(`Round status updated to "${newStatus}" successfully.`);
      } else {
        notify.error("Failed to save mock interview data.");
      }
    } catch (error) {
      console.error("❌ Error updating mock interview status:", error);
      notify.error("Failed to update round status. Please try again.");
    }
  };
  

  const handleConfirmStatusChange = () => {
    if (confirmAction) {
      handleStatusChange(confirmAction);
    }
    setShowConfirmModal(false);
    setActionInProgress(false);
  };

  const handleReject = (reason) => {
    handleStatusChange("Rejected", reason);
    setShowRejectionModal(false);
  };

    // const handleDeleteRound = async () => {
    //   try {
    //     await deleteRoundMutation(round._id);
    //     notify.success("Round Deleted successfully");
    //   } catch (error) {
    //     console.error("Error Deleting Round:", error);
    //     notify.error("Failed to Delete Round");
    //   }
    // };


  const handleRemoveInterviewer = (interviewerId) => {
    const updatedRound = {
      interviewers: round.interviewers.filter(id => id !== interviewerId)
    };
  };

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

  const handleActionClick = (action) => {
    setActionInProgress(true);
    if (
      action === "Completed" ||
      action === "Cancelled" ||
      action === "Rejected" ||
      action === "Selected" ||
      action === "Rescheduled"
      // action === "Scheduled" // <-- add this line
    ) {
      setConfirmAction(action);
      setShowConfirmModal(true);
    }
  };

  const handleSelect = () => {
    setActionInProgress(true);
    setConfirmAction("Selected");
    setShowConfirmModal(true);
  };

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
      // canEdit: true,
      // canDelete: true,
      // canMarkScheduled: true,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
     
    },
    RequestSent: {
      // canEdit: true,
      // canDelete: false,
      // canMarkScheduled: true,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
    
    },
    Scheduled: {
      // canEdit: false,
      // canDelete: false,
      // canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      canReject: false,
      canSelect: false,
     
    },
    Rescheduled: {
      // canEdit: false,
      // canDelete: false,
      // canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      // canReject: false,
      // canSelect: false,
     
    },
    Completed: {
      // canEdit: false,
      // canDelete: false,
      // canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      // canReject: true,
      // canSelect: true,
     
    },
    Cancelled: {
      // canEdit: false,
      // canDelete: false,
      // canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      
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
    
    // },
    InComplete: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
     
    },
    NoShow: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      
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
                {/* commmented for conformation */}
                    {/* {isInstantInterview() && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Instant
                      </span>
                    )} */}
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
                   
                   
                    {/* {round?.interviewers?.length > 0 && (
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
                            
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
 */}


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
                                {interviewer?.firstName  + " "
                                 + interviewer?.lastName }
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

            <div className="overflow-x-auto">
                <div className="mt-6 w-full flex gap-2 whitespace-nowrap sm:justify-start md:justify-start justify-end">
                  {/* Reschedule */}
                  {permissions.canReschedule &&
                    round.interviewerType === "external" &&
                     (
                      <button
                        // onClick={() => onEdit(round, { isReschedule: true })}
                        onClick={() => {
                          setActionInProgress(true);
                          setConfirmAction("Rescheduled");
                          setShowConfirmModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <Calendar className="h-4 w-4 mr-1" /> Reschedule
                      </button>
                    )}
                  {/* Cancel */}
                  {permissions.canCancel  && (
                    <button
                      onClick={() => {
                        setActionInProgress(true);
                        setConfirmAction("Cancelled");
                        setShowConfirmModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  )}
              
                  {/* Delete */}
                  {/* {canEdit && permissions.canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Delete Round
                    </button>
                  )}
                 */}
                
                  {/* Complete */}
                  {permissions.canComplete  && (
                    <button
                      onClick={() => handleActionClick("Completed")}
                      className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Complete
                    </button>
                  )}

                  {/* Select */}
                  {/* {console.log("333", permissions.canSelect)}
                  {permissions.canSelect && (
                    <button
                      onClick={handleSelect}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Select
                    </button>
                  )}
                  
                  {console.log("333", permissions.canReject)}
                  {permissions.canReject && (
                    <button
                      onClick={() =>
                        setShowRejectionModal(true) || setActionInProgress(true)
                      }
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                    </button>
                  )} */}

                  {/* Feedback */}
                  {permissions.canFeedback && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Feedback
                    </button>
                  )}

                  


                

                
                </div>
              </div>
          </>
        </div>
      </div>

         {showConfirmModal &&
              createPortal(
                // v1.0.5 <--------------------------------------------------------------------------------
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
                  <div className="bg-white p-5 rounded-lg shadow-md">
                    <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-3">
                      Are you sure you want to {confirmAction.toLowerCase()} this
                      round?
                    </h3>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmModal(false)}
                      >
                        No, Cancel
                      </Button>
                      <Button variant="success" onClick={handleConfirmStatusChange}>
                        Yes, Confirm
                      </Button>
                    </div>
                  </div>
                </div>,
                document.body
                // v1.0.5 -------------------------------------------------------------------------------->
              )}
            {/* {showDeleteConfirmModal &&
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
                      <Button variant="destructive" onClick={handleDeleteRound}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>,
                document.body
                // v1.0.5 ------------------------------------------------------------------------------------------>
              )} */}

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
