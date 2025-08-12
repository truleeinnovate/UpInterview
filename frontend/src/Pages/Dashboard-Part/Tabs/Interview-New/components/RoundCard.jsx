// v1.0.0 - Ashok - removed show and hide toggle
// v1.0.1 - Ashok - disabled outer scrollbar using hook for better user experience
/* 
   v1.0.2 - Ashok - fixed z-index issue and added createPortal using this
   lets you render a React component into a different part of the DOM
   outside its parent hierarchy.
*/
// v1.0.3 - Ashok - In the showConfirmModal fixed z-index issue and disabled outer scrollbar using useScrollLock hook

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  ExternalLink,
  Share2
} from "lucide-react";

// import StatusBadge from '../../CommonCode-AllTabs/StatusBadge';
import InterviewerAvatar from "../../CommonCode-AllTabs/InterviewerAvatar";
import RejectionModal from "./RejectionModal";
import FeedbackModal from "./FeedbackModal";
import RoundFeedbackTab from "./RoundFeedbackTab";
import { Button } from "../../CommonCode-AllTabs/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { config } from "../../../../../config";
import { useAssessments } from "../../../../../apiHooks/useAssessments";
import { useInterviews } from "../../../../../apiHooks/useInterviews";
// v1.0.1 <------------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.1 ------------------------------------------------------------>
// v1.0.2 <--------------------------------------------
import { createPortal } from "react-dom";
import { shareAssessmentAPI } from "../../Assessment-Tab/AssessmentShareAPI";
// v1.0.2 -------------------------------------------->
import { useQueryClient } from "@tanstack/react-query";
const RoundCard = ({
  round,
  interviewData,
  canEdit,
  onEdit,
  isActive = false,
  hideHeader = false,
}) => {
  // const {
  //   assessmentData,
  //   sectionQuestions,
  //   fetchQuestionsForAssessment,
  //   questionsLoading,
  //   questionsError,
  //   setSectionQuestions,
  // } = useCustomContext();
  const { deleteRoundMutation } = useInterviews();
  const { fetchAssessmentQuestions } = useAssessments();
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const queryClient = useQueryClient();
  // v1.0.1 <--------------------------------------------
  // v1.0.3 <--------------------------------------------------------
  useScrollLock(showDeleteConfirmModal || showConfirmModal);
  // v1.0.3 -------------------------------------------------------->
  // v1.0.1 -------------------------------------------->
  
    const [linkExpiryDays, setLinkExpiryDays] = useState(3);

  // useEffect(() => {
  //   if (round.assessmentId) {
  //     fetchQuestionsForAssessment(round.assessmentId)
  //   }

  // }, [round.assessmentId])

  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (showQuestions && round?.assessmentId) {
      // const data = fetchAssessmentQuestions(round.assessmentId);
      // setSectionQuestions(data)
      setQuestionsLoading(true);
      fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
        if (data) {
          setQuestionsLoading(false);
          setSectionQuestions(data?.sections);
          // Only initialize toggleStates if it's empty or length doesn't match sections
          // setToggleStates((prev) => {
          //   if (prev.length !== data.sections.length) {
          //     return new Array(data.sections.length).fill(false);
          //   }
          //   return prev; // Preserve existing toggle states
          // });
        } else {
          console.error("Error fetching assessment questions:", error);
          setQuestionsLoading(false);
        }
      });
    }
  }, [showQuestions, round?.assessmentId]);

  // Remove console.log to prevent loops
  // console.log("round", round);
  console.log("interviewData",interviewData);
  

  const toggleSection = async (sectionId) => {
    if (expandedSections[sectionId]) {
      const newExpandedQuestions = { ...expandedQuestions };
      const section = sectionQuestions[sectionId];
      if (section && section.questions) {
        section.questions.forEach((question) => {
          newExpandedQuestions[question._id] = false;
        });
      }
      setExpandedQuestions(newExpandedQuestions);
    }

    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));

    // Fetch questions if the section is being expanded and questions are not already loaded
    // if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
    //   await fetchQuestionsForAssessment(round?.assessmentId);
    // }
  };

  const handleDeleteRound = async () => {
    try {
      await deleteRoundMutation(round._id);
      toast.success("Round Deleted successfully");
    } catch (error) {
      console.error("Error Deleting Round:", error);
      toast.error("Failed to Delete Round");
    }
  };

  const toggleShowQuestions = () => {
    if (showQuestions) {
      // Collapse all when hiding
      setExpandedSections({});
      setExpandedQuestions({});
    }
    setShowQuestions(!showQuestions);
  };

  // const fetchQuestionsForSection = async (sectionId) => {
  //   try {
  //     const response = assessmentData.find(pos => pos._id === round.assessmentId)
  //     // const response = await axios.get(`${config.REACT_APP_API_URL}/assessments/${assessmentTemplate.assessmentId}`);
  //     const assessment = response;

  //     const section = assessment.Sections.find(s => s._id === sectionId);
  //     if (!section) {
  //       throw new Error('Section not found');
  //     }

  //     setSectionQuestions(prev => ({
  //       ...prev,
  //       [sectionId]: section.Questions
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //     setSectionQuestions(prev => ({
  //       ...prev,
  //       [sectionId]: 'error'
  //     }));
  //   }
  // };

  const interview = interviewData;
  const isInterviewCompleted =
    interview?.status === "Completed" || interview?.status === "Cancelled";

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
  const handleStatusChange = async (newStatus, reason = null) => {
    const roundData = {
      status: newStatus,
      completedDate: newStatus === "Completed",
      rejectionReason: reason || null,
    };

    const payload = {
      interviewId: interview._id,
      round: { ...roundData },
      roundId: round._id,
      isEditing: true, // Always set isEditing to true
    };

    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/interview/save-round`,
        payload
      );
      console.log("Status updated:", response.data);
      // Show success toast
      toast.success(`Round Status updated to ${newStatus}`, {});
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConfirmStatusChange = () => {
    if (confirmAction) {
      handleStatusChange(confirmAction);
    }
    setShowConfirmModal(false);
  };

  const handleReject = (reason) => {
    handleStatusChange("Rejected", reason);
    setShowRejectionModal(false);
  };

  // const handleRemoveInterviewer = (interviewerId) => {
  //   const updatedRound = {
  //     interviewers: round.interviewers.filter(id => id !== interviewerId)
  //   };
  // };

  // Get interviewers based on interviewerType
  const internalInterviewers =
    round?.interviewerType === "Internal" ? round?.interviewers || [] : [];

  const externalInterviewers =
    round?.interviewerType === "External" ? round?.interviewers || [] : [];

  // Get questions
  const questions = round?.questions || [];

  // Check if round is active (can be modified)
  const isRoundActive =
    round.status !== "Completed" &&
    round.status !== "Cancelled" &&
    round.status !== "Rejected" &&
    !isInterviewCompleted;

  // Check if round has feedback
  const hasFeedback =
    round?.detailedFeedback || (round?.feedbacks && round.feedbacks.length > 0);

  // Check if this is an instant interview (scheduled within 15 minutes of creation)
  const isInstantInterview = () => {
    if (!round.scheduledDate) return false;

    const scheduledTime = new Date(round.scheduledDate).getTime();
    const creationTime = new Date(interview?.createdAt || "").getTime();

    // If scheduled within 30 minutes of creation, consider it instant
    return scheduledTime - creationTime < 30 * 60 * 1000;
  };
  console.log("round",round);
  

    const handleShareClick = async () => {
      // Validate assessment selection when fromscheduleAssessment is true
      // if (fromscheduleAssessment && !selectedAssessment) {
      //   setErrors({
      //     ...errors,
      //     Assessment: "Please select an assessment template.",
      //   });
      //   return;
      // }
  
      // if (selectedCandidates.length === 0) {
      //   setErrors({
      //     ...errors,
      //     Candidate: "Please select at least one candidate.",
      //   });
      //   return;
      // }
  
      console.log("selectedAssessment",
        {
          assessmentId: round?.assessmentId,
          selectedCandidates: interviewData?.candidateId,
          userId: interviewData?.candidateId?.ownerId,
        // selectedCandidates,
        // linkExpiryDays,
        // onClose: onCloseshare,
        // setErrors,
        // setIsLoading,
        // organizationId,
        // userId,
        queryClient,
        }
      );
      
   const linkExpiryDays = round?.dateTime
      // setIsLoading(true);
      const result = await shareAssessmentAPI({
        assessmentId:   round?.assessmentId,
        selectedCandidates: interviewData?.candidateId,
        userId: interviewData?.candidateId?.ownerId,
          // ? selectedAssessment._id
          // : assessment._id,
        // selectedCandidates,
        linkExpiryDays,
        // onClose: onCloseshare,
        // setErrors,
        // setIsLoading,
        // organizationId,
        // userId,
        queryClient,
      });
      console.log("assessment result",result);
      
  
      if (result.success) {
        // React Query will handle data refresh automatically
        // No need to manually fetch data
      } else {
        toast.error(result.message || "Failed to schedule assessment");
      }
      // setIsLoading(false);
    };

  return (
    <>
      <div
        className={`bg-white rounded-lg ${
          !hideHeader && "shadow-md"
        } overflow-hidden ${isActive ? "ring-2 ring-custom-blue" : ""}`}
      >
        <div className="p-5">
          {/* Tabs */}
          {hasFeedback && (
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-4">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-custom-blue text-custom-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Round Details
                </button>
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "feedback"
                      ? "border-custom-blue text-custom-blue"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Feedback
                </button>
              </nav>
            </div>
          )}

          {activeTab === "details" ? (
            <>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4 sm:grid-cols-1">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Schedule
                  </h4>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scheduled: {formatDate(round.scheduledDate)}</span>
                    {isInstantInterview() && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Instant
                      </span>
                    )}
                  </div>
                  {round.completedDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Completed: {formatDate(round.completedDate)}</span>
                    </div>
                  )}
                  {round.duration && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration: {round.duration} Minutes</span>
                    </div>
                  )}
                </div>

                <div>
                  {round.roundTitle !== "Assessment" && (
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        <>
                          <span>{round?.interviewerType}</span>
                          <span>
                            {round?.interviewerGroupName ? " Group " : " "}
                          </span>
                        </>
                        Interviewers
                      </h4>
                      {/* v1.0.0 <-------------------------------------------------------------------- */}

                      {/* <button
                        onClick={() => setShowInterviewers(!showInterviewers)}
                        className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                      >
                        {showInterviewers ? "Hide" : "Show"}
                        {showInterviewers ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </button> */}
                    </div>
                  )}

                  {
                    <div className="space-y-2">
                      {internalInterviewers.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>
                                {" "}
                                {internalInterviewers.length}
                                {internalInterviewers.length > 1
                                  ? " Interviewers"
                                  : " Interviewer"}
                              </span>
                            </span>
                            {round?.interviewerGroupName && (
                              <div className="flex items-center   gap-1 text-xs text-gray-500 ">
                                <span> Group Name: </span>
                                <span className="text-black ">
                                  {round?.interviewerGroupName
                                    ? round?.interviewerGroupName
                                    : ""}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {internalInterviewers.map((interviewer) => (
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
                            <span>
                              External ({externalInterviewers.length})
                            </span>
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
                  {/* v1.0.0 -------------------------------------------------------------------------> */}
                </div>
              </div>

              {/* {questions?.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Questions</h4>
                    <button
                      onClick={() => setShowQuestions(!showQuestions)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {showQuestions ? 'Hide' : 'Show'}
                      {showQuestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                    </button>
                  </div>

                  {showQuestions && (
                    <div className="space-y-2">
                      {questions.map((question) => (
                        <div key={question._id} className="text-sm text-gray-600">
                          • {question.snapshot?.questionText || "No question text available"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )} */}
              {questions?.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Interview Questions
                    </h4>
                    <button
                      onClick={toggleShowQuestions}
                      className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                    >
                      {showQuestions ? "Hide" : "Show"}
                      {showQuestions ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </div>

                  {showQuestions && round.questions && (
                    <div className="space-y-2">
                      {round?.questions.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {round.questions.map((question, qIndex) => {
                            // const isMandatory = question?.mandatory === "true";
                            const questionText =
                              question?.snapshot?.questionText ||
                              "No Question Text Available";
                            return (
                              <li
                                key={qIndex}
                                className="text-gray-600 font-sm"
                              >
                                <span>
                                  {/* {qIndex + 1}. */}•{" "}
                                  {questionText || "No question text available"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-2 text-gray-500 flex justify-center">
                          No Questions added yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {round.assessmentId && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Assessment Questions
                    </h4>
                    <button
                      onClick={toggleShowQuestions}
                      className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                    >
                      {showQuestions ? "Hide" : "Show"}
                      {showQuestions ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  </div>

                  {showQuestions && (
                    <div className="space-y-4">
                      {questionsLoading ? (
                        <div className="text-center py-4">
                          <span className="text-gray-600">
                            Loading questions...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Check if sectionQuestions is properly structured */}
                          {Object.keys(sectionQuestions).length > 0 ? (
                            Object.entries(sectionQuestions).map(
                              ([sectionId, sectionData]) => {
                                // Find section details from assessmentData
                                // const selectedAssessment = assessmentData.find(
                                //   a => a._id === formData.assessmentTemplate[0].assessmentId
                                // );

                                // const section = selectedAssessment?.Sections?.find(s => s._id === sectionId);

                                return (
                                  <div
                                    key={sectionId}
                                    className="border rounded-md shadow-sm p-4"
                                  >
                                    <button
                                      onClick={() => toggleSection(sectionId)}
                                      className="flex justify-between items-center w-full"
                                    >
                                      <span className="font-medium">
                                        {sectionData?.sectionName
                                          ? sectionData?.sectionName
                                              .charAt(0)
                                              .toUpperCase() +
                                            sectionData?.sectionName.slice(1)
                                          : "Unnamed Section"}
                                      </span>
                                      <ChevronUp
                                        className={`transform transition-transform ${
                                          expandedSections[sectionId]
                                            ? ""
                                            : "rotate-180"
                                        }`}
                                      />
                                    </button>

                                    {expandedSections[sectionId] && (
                                      <div className="mt-4 space-y-3">
                                        {Array.isArray(sectionData.questions) &&
                                        sectionData.questions.length > 0 ? (
                                          sectionData.questions.map(
                                            (question, idx) => (
                                              <div
                                                key={question._id || idx}
                                                className="border rounded-md shadow-sm overflow-hidden"
                                              >
                                                <div
                                                  onClick={() =>
                                                    setExpandedQuestions(
                                                      (prev) => ({
                                                        ...prev,
                                                        [question._id]:
                                                          !prev[question._id],
                                                      })
                                                    )
                                                  }
                                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-600">
                                                      {idx + 1}.
                                                    </span>
                                                    <p className="text-sm text-gray-700">
                                                      {question.snapshot
                                                        ?.questionText ||
                                                        "No question text"}
                                                    </p>
                                                  </div>
                                                  <ChevronDown
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${
                                                      expandedQuestions[
                                                        question._id
                                                      ]
                                                        ? "transform rotate-180"
                                                        : ""
                                                    }`}
                                                  />
                                                </div>

                                                {expandedQuestions[
                                                  question._id
                                                ] && (
                                                  <div className="px-4 py-3">
                                                    <div className="flex justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Type:
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot
                                                            ?.questionType ||
                                                            "Not specified"}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Score:
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot
                                                            ?.score || "0"}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    {/* Display question options if MCQ */}
                                                    {question.snapshot
                                                      ?.questionType ===
                                                      "MCQ" && (
                                                      <div className="mt-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Options:
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                                          {question.snapshot?.options?.map(
                                                            (
                                                              option,
                                                              optIdx
                                                            ) => (
                                                              <div
                                                                key={optIdx}
                                                                //  className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                                className={`text-sm p-2 rounded border ${
                                                                  option ===
                                                                  question
                                                                    .snapshot
                                                                    .correctAnswer
                                                                    ? "bg-green-50 border-green-200 text-green-800"
                                                                    : "bg-gray-50 border-gray-200"
                                                                }`}
                                                              >
                                                                {option}
                                                                {option ===
                                                                  question
                                                                    .snapshot
                                                                    .correctAnswer && (
                                                                  <span className="ml-2 text-green-600">
                                                                    ✓
                                                                  </span>
                                                                )}
                                                              </div>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    )}

                                                    {/* Display correct answer */}
                                                    {/* <div className="mt-2">
                                                                                   <span className="text-sm font-medium text-gray-500">
                                                                                     Correct Answer:
                                                                                   </span>
                                                                                   <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                                                                     {question.snapshot?.correctAnswer || 'Not specified'}
                                                                                   </div>
                                                                                 </div> */}

                                                    {/* Additional question metadata */}
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                      <div>
                                                        <span className="text-xs font-medium text-gray-500">
                                                          Difficulty:
                                                        </span>
                                                        <span className="text-xs text-gray-700 ml-1">
                                                          {question.snapshot
                                                            ?.difficultyLevel ||
                                                            "Not specified"}
                                                        </span>
                                                      </div>
                                                      <div>
                                                        <span className="text-xs font-medium text-gray-500">
                                                          Skills:
                                                        </span>
                                                        <span className="text-xs text-gray-700 ml-1">
                                                          {question.snapshot?.skill?.join(
                                                            ", "
                                                          ) || "None"}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div className="text-center py-4 text-gray-500">
                                            No Questions found in this section
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No sections available for this assessment
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}



              {isRoundActive && (
                <div className="mt-6 flex justify-end space-x-3">

{round.roundTitle === "Assessment" && (
                    <Button
                      onClick={handleShareClick}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      share 
                    </Button>
                  )}



                  {canEdit && (
                    <Button
                      onClick={onEdit}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Round
                    </Button>
                  )}
                  {/* v1.0.0 <------------------------------------------------------------------------ */}
                  <Button
                    onClick={() => setShowFeedbackModal(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Feedback
                  </Button>
                  {/* v1.0.0 ------------------------------------------------------------------------> */}

                  {round.status === "Pending" && (
                    <Button
                      // onClick={() => handleStatusChange('Scheduled')}
                      onClick={() => {
                        setConfirmAction("Scheduled");
                        setShowConfirmModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Mark Scheduled
                    </Button>
                  )}

                  {round.status === "Scheduled" && (
                    <>
                      <Button
                        onClick={() => {
                          setConfirmAction("Completed");
                          setShowConfirmModal(true);
                        }}
                        variant="success"
                        size="sm"
                        className="flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>

                      <Button
                        onClick={() => {
                          setConfirmAction("Cancelled");
                          setShowConfirmModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>

                      <Button
                        onClick={() => setShowRejectionModal(true)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {canEdit && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Delete Round
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <RoundFeedbackTab round={round} />
          )}
        </div>
      </div>
      {/* v1.0.3 <------------------------------------------------------------------------------------ */}
      {/* {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Are you sure you want to {confirmAction.toLowerCase()} this round?
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
        </div>
      )} */}

      {showConfirmModal &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">
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
        )}
      {/* v1.0.3 ---------------------------------------------------------------------------------------> */}
      {/* v1.0.2 <-------------------------------------------------------------------------- */}
      {/* {showDeleteConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
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
        </div>
      )} */}
      {showDeleteConfirmModal &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">
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
        )}
      {/* v1.0.2 --------------------------------------------------------------------------> */}
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
          interviewId={interviewData._id}
          roundId={round.id}
        />
      )}
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

export default RoundCard;
