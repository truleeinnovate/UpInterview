// v1.0.0 - Ashok - removed show and hide toggle
// v1.0.1 - Ashok - disabled outer scrollbar using hook for better user experience
/*
   v1.0.2 - Ashok - fixed z-index issue and added createPortal using this
   lets you render a React component into a different part of the DOM
   outside its parent hierarchy.
*/
// v1.0.3 - Ashok - In the showConfirmModal fixed z-index issue and disabled outer scrollbar using useScrollLock hook

// v1.0.4  -  mansoor  -  added the buttons visibility based on the statuses
// v1.0.5  -  Ashok    -  Improved responsiveness

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
  Share2,
  BarChart3,
} from "lucide-react";

// import StatusBadge from '../../CommonCode-AllTabs/StatusBadge';
import InterviewerAvatar from "../../CommonCode-AllTabs/InterviewerAvatar";
import RejectionModal from "./RejectionModal";
import FeedbackModal from "./FeedbackModal";
import RoundFeedbackTab from "./RoundFeedbackTab";
import { Button } from "../../CommonCode-AllTabs/ui/button";
import axios from "axios";
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
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useInterviewerDetails } from "../../../../../utils/CommonFunctionRoundTemplates";
import { notify } from "../../../../../services/toastService";
import ScheduledAssessmentResultView from "../../Assessment-Tab/AssessmentViewDetails/ScheduledAssessmentResultView";
import { useScheduleAssessments } from "../../../../../apiHooks/useScheduleAssessments.js";
const RoundCard = ({
  round,
  interviewData,
  // canEdit,
  onEdit,
  isActive = false,
  hideHeader = false,
  isExpanded,
  onInitiateAction,
}) => {
  // const {
  //   assessmentData,
  //   // sectionQuestions,
  //   // fetchQuestionsForAssessment,
  //   // questionsLoading,
  //   // questionsError,
  //   // setSectionQuestions,
  // } = useCustomContext();
  const { deleteRoundMutation, updateInterviewRound } = useInterviews();
  const { fetchAssessmentQuestions, fetchAssessmentResults, assessmentData } =
    useAssessments();

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

  // const [linkExpiryDays, setLinkExpiryDays] = useState(3);

  // useEffect(() => {
  //   if (round.assessmentId) {
  //     fetchQuestionsForAssessment(round.assessmentId)
  //   }

  // }, [round.assessmentId])

  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  //  const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);
  const [showAssessmentCard, setShowAssessmentCard] = useState(false);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;

  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    if (isExpanded && round?.assessmentId) {
      // const data = fetchAssessmentQuestions(round.assessmentId);
      // setSectionQuestions(data)
      setQuestionsLoading(true);
      fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
        if (data) {
          setQuestionsLoading(false);
          setSectionQuestions(data?.sections);
          setShowAssessmentCard(true);
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
  }, [isExpanded, round?.assessmentId]);

  useEffect(() => {
    if (isExpanded) {
      setShowQuestions(true);
    }
  }, [isExpanded]);

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
      notify.success("Round Deleted successfully");
    } catch (error) {
      console.error("Error Deleting Round:", error);
      notify.error("Failed to Delete Round");
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
      // const response = await axios.post(
      //   `${config.REACT_APP_API_URL}/interview/save-round`,
      //   payload
      // );
      const response = await updateInterviewRound(payload);
      // Show success toast
      notify.success(`Round Status updated to ${newStatus}`, {});
    } catch (error) {
      console.error("Error updating status:", error);
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

  // // Check if round is active (can be modified)
  // const isRoundActive =
  //   round.status !== "Completed" &&
  //   round.status !== "Cancelled" &&
  //   round.status !== "Rejected" &&
  //   !isInterviewCompleted;

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

  // New state for candidate assessment data
  let [candidateAssessment, setCandidateAssessment] = useState(null);
  let [currentScheduledAssessment, setCurrentScheduledAssessment] =
    useState(null);

  // Always call hooks unconditionally at the top level
  let { scheduleData, isLoading } = useScheduleAssessments(
    round.roundTitle === "Assessment" ? round?.assessmentId : null
  );

  // Filter scheduled assessments for Assessment rounds
  useEffect(() => {
    if (
      round.roundTitle === "Assessment" &&
      round.scheduleAssessmentId &&
      scheduleData.length > 0
    ) {
      // Find the specific scheduled assessment
      let filteredAssessment = scheduleData.find(
        (assessment) => assessment._id === round.scheduleAssessmentId
      );

      // Find the candidate-specific data
      let candidateData = filteredAssessment?.candidates?.find(
        (candidate) =>
          candidate.candidateId?._id === interviewData?.candidateId?._id
      );

      if (filteredAssessment) {
        setCurrentScheduledAssessment(filteredAssessment);
      }
      if (candidateData) {
        setCandidateAssessment(candidateData);
      }
    }
  }, [scheduleData, round, interviewData, round?.assessmentId]);

  //  Resend Mail for assessment by Ranjith
  const handleResendClick = async (round) => {
    if (!round?.assessmentId) {
      throw new Error("Unable to determine assessment ID for resend operation");
    }

    // Use the same API endpoint for both single and multiple candidates
    let response = await axios.post(
      `${config.REACT_APP_API_URL}/emails/resend-link`,
      {
        // candidateAssessmentIds: selectedCandidates,
        // userId,
        // organizationId,
        // assessmentId,

        // candidateAssessmentId: interviewData?.candidateId,
        candidateAssessmentIds: [candidateAssessment?._id],
        userId,
        organizationId: orgId,
        assessmentId: round?.assessmentId,
      }
    );

    if (response?.data?.success) {
      let roundData = {
        ...round,
        scheduleAssessmentId: response?.data?.scheduledAssessmentId,
      };

      let payload = {
        interviewId: interview._id,
        round: { ...roundData },
        roundId: round._id,
        isEditing: true,
      };

      // React Query will handle data refresh automatically
      // No need to manually fetch data

      response = await updateInterviewRound(payload);
      if (response.status === "ok") {
        notify.success("Assessment link resend successfully");
      }
    } else {
      notify.error(response?.message || "Failed to schedule assessment");
    }
    // setIsLoading(false);
  };

  const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);

  //  Share Mail for assessment by Ranjith
  // Share Mail for assessment by Ranjith - UPDATED VERSION
  const handleShareClick = async (round) => {
    if (!round?.assessmentId) {
      throw new Error("Unable to determine assessment ID for share operation");
    }

    try {
      // Calculate link expiry days from assessment data
      let linkExpiryDays = null;
      if (sectionQuestions?.ExpiryDate) {
        const expiryDate = new Date(sectionQuestions?.ExpiryDate);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        linkExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Use the shareAssessmentAPI function to create and share the assessment link
      const result = await shareAssessmentAPI({
        assessmentId: round?.assessmentId,
        selectedCandidates: [interviewData?.candidateId],
        linkExpiryDays,
        organizationId: orgId,
        queryClient,
      });

      if (result.success) {
        // Update the round with the scheduled assessment ID
        const roundData = {
          ...round,
          status: "Scheduled", // Update status to Scheduled
          scheduleAssessmentId: result?.data?.scheduledAssessmentId, // Use the ID from share result
        };

        const payload = {
          interviewId: interview._id,
          round: { ...roundData },
          roundId: round._id,
          isEditing: true,
        };

        // Update the round in the database
        const response = await updateInterviewRound(payload);

        if (response?.status === "ok") {
          notify.success("Assessment link shared successfully!");

          // Optional: Refresh the data to show updated status
          queryClient.invalidateQueries(["interview", interview._id]);
        } else {
          notify.error("Failed to update round status");
        }
      } else {
        notify.error(result.message || "Failed to share assessment link");
      }
    } catch (error) {
      console.error("Error sharing assessment:", error);
      notify.error("An error occurred while sharing the assessment");
    }
  };

  // result showing
  const shouldShowResultButton = () => {
    if (round.roundTitle !== "Assessment") return false;

    if (candidateAssessment?.status) {
      const showStatuses = ["completed", "failed", "pass"];
      return showStatuses.includes(candidateAssessment.status.toLowerCase());
    }

    return false;
  };

  const [showResultModal, setShowResultModal] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [toggleStates, setToggleStates] = useState([]);
  const [results, setResults] = useState([]);

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    const getResults = async () => {
      const { data, error } = await fetchAssessmentResults(round?.assessmentId);

      if (!error) {
        setResults(data);
      } else {
        console.error("Error loading results:", error);
      }
    };

    if (round?.assessmentId) {
      getResults();
    }
  }, []);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);

  // const [currentScheduledAssessment, setCurrentScheduledAssessment] = useState(null);

  // Update the handleResultClick function
  // const handleResultClick = async (round) => {
  //   setShowResultModal(true);

  //   // Set the current scheduled assessment data
  //   if (currentScheduledAssessment) {
  //     setCurrentScheduledAssessment(currentScheduledAssessment);
  //   }

  //   const candidateData = interviewData?.candidateId;

  //     // Load assessment data using the useEffect logic you provided
  //     const loadData = async () => {
  //       const foundAssessment = assessmentData?.find((a) => a._id === round?.assessmentId);
  //       if (foundAssessment) {
  //         setAssessment(foundAssessment);
  //         setIsModalOpen(true);
  //       }
  //     };

  //     await loadData();

  //   // Fetch assessment questions if needed
  //   if (round?.assessmentId) {
  //     fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
  //       if (data) {
  //         setAssessmentQuestions(data);
  //         setToggleStates((prev) => {
  //           if (prev.length !== data.sections.length) {
  //             return new Array(data.sections.length)
  //               .fill(false)
  //               .map((_, index) => index === 0);
  //           }
  //           return prev;
  //         });
  //       } else {
  //         console.error("Error fetching assessment questions:", error);
  //       }
  //     });
  //   }
  // }

  const handleResultClick = async (round) => {
    setShowResultModal(true);

    let candidateResultData = null;
    let scheduledData = null;

    if (scheduleData.length > 0 && round.scheduleAssessmentId) {
      // Find the specific scheduled assessment
      scheduledData = scheduleData.find(
        (assessment) => assessment._id === round.scheduleAssessmentId
      );

      // Find the candidate-specific data
      if (scheduledData && scheduledData.candidates) {
        const candidateAssessment = scheduledData.candidates.find(
          (candidate) =>
            candidate.candidateId?._id === interviewData?.candidateId?._id
        );

        if (candidateAssessment) {
          // Transform the data to match what ScheduledAssessmentResultView expects
          candidateResultData = {
            id: candidateAssessment?._id,
            name: `${candidateAssessment?.candidateId?.FirstName || ""} ${
              candidateAssessment?.candidateId?.LastName || ""
            }`.trim(),
            email: candidateAssessment?.candidateId?.Email,
            answeredQuestions: candidateAssessment?.answeredQuestions || 0,
            totalScore: candidateAssessment?.totalScore || 0,
            result: candidateAssessment?.status,
            // status: candidateAssessment.status,
            completionDate: candidateAssessment?.completionDate,
            expiryAt: candidateAssessment?.expiryAt,
            remainingTime: candidateAssessment?.remainingTime,
            sections: candidateAssessment?.sections || [],
            experience: candidateAssessment?.candidateId?.CurrentExperience,
            // Include the full candidate assessment data for reference
            candidateAssessment: candidateAssessment,
          };
        }
      }
    }

    // Set selected candidate and schedule for the result view
    setSelectedCandidate(candidateResultData);
    // setSelectedSchedule(scheduleData);

    // Load assessment data
    const loadData = async () => {
      const foundAssessment = assessmentData?.find(
        (a) => a._id === round?.assessmentId
      );
      if (foundAssessment) {
        setAssessment(foundAssessment);
      }
    };

    await loadData();

    // Fetch assessment questions if needed
    if (round?.assessmentId) {
      fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
        if (data) {
          setAssessmentQuestions(data);
          setToggleStates((prev) => {
            if (prev.length !== data.sections.length) {
              return new Array(data.sections.length)
                .fill(false)
                .map((_, index) => index === 0);
            }
            return prev;
          });
        } else {
          console.error("Error fetching assessment questions:", error);
        }
      });
    }
  };

  // const handleShareClick = async (round) => {

  //   if (!round?.assessmentId) {
  //     throw new Error("Unable to determine assessment ID for resend operation");
  //   }

  //   // Use the same API endpoint for both single and multiple candidates
  //   const response = await axios.post(
  //     `${config.REACT_APP_API_URL}/emails/resend-link`,
  //     {
  //       // candidateAssessmentIds: selectedCandidates,
  //       // userId,
  //       // organizationId,
  //       // assessmentId,

  //       // candidateAssessmentId: interviewData?.candidateId,
  //       candidateAssessmentIds: [candidateAssessment?._id],
  //       userId,
  //       organizationId: orgId,
  //       assessmentId: round?.assessmentId,
  //     }
  //   );

  //   if (response?.data?.success) {

  //     const roundData = {
  //       ...round,
  //       scheduleAssessmentId: response?.data?.scheduledAssessmentId,
  //     };

  //     const payload =   {
  //       interviewId: interview._id,
  //       round: { ...roundData },
  //       roundId: round._id,
  //       isEditing: true,
  //     };

  //     // React Query will handle data refresh automatically
  //     // No need to manually fetch data

  //     response = await updateInterviewRound(payload);
  //     if  (response.status === "ok") {
  //       notify.success("Assessment link resend successfully");
  //     }

  //   } else {
  //     notify.error(response?.message || "Failed to schedule assessment");
  //   }
  //   // setIsLoading(false);
  // };

  // <----------------------- v1.0.4

  const handleActionClick = (action) => {
    setActionInProgress(true);
    if (
      action === "Completed" ||
      action === "Cancelled" ||
      action === "Rejected" ||
      action === "Selected" ||
      action === "Scheduled" // <-- add this line
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
      canEdit: true,
      canDelete: true,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: true,
    },
    RequestSent: {
      canEdit: true,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
    },
    Scheduled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canShareLink: false,
      canResendLink: true,
    },
    Rescheduled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: true,
      canComplete: true,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
    },
    Completed: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: true,
      canSelect: true,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
    },
    Cancelled: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
    },
    Rejected: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
    },
    Selected: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: false,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: true,
      canResendLink: false,
      canShareLink: false,
    },
    InComplete: {
      canEdit: false,
      canDelete: false,
      canMarkScheduled: false,
      canReschedule: true,
      canCancel: false,
      canComplete: false,
      canReject: false,
      canSelect: false,
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
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
      canFeedback: false,
      canResendLink: false,
      canShareLink: false,
    },
  };

  // Helper to get permissions for current round status
  const getRoundPermissions = (status) =>
    roundActionPermissions[status] || roundActionPermissions["Draft"];

  const permissions = getRoundPermissions(round.status);

  // v1.0.4 -------------------------->

  const handleCreateAssessmentClick = async (round) => {
    if (round?.roundTitle === "Assessment") {
      // Calculate link expiry days
      let linkExpiryDays = null;
      if (sectionQuestions?.ExpiryDate) {
        const expiryDate = new Date(sectionQuestions?.ExpiryDate);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        linkExpiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // difference in days
      }

      // setIsLoading(true);
      const result = await shareAssessmentAPI({
        assessmentId: round?.assessmentId,
        selectedCandidates: [interviewData?.candidateId],
        linkExpiryDays,
        // userId: userId,
        organizationId: orgId,
        // setErrors,
        queryClient,

        // onClose: onCloseshare,
        // setErrors,
        // setIsLoading,
        // organizationId,
        // userId,
      });

      if (result.success) {
        let isEditing = true;
        // const payload = isEditing
        // && {
        //   interviewId,
        //   round: roundData,
        //   roundId,
        //   questions: interviewQuestionsList,
        // }

        const roundData = {
          ...round,
          status: "scheduled", // or whatever status you want to set
          completedDate: null,
          rejectionReason: null,
        };

        const payload = isEditing && {
          interviewId: interview._id,
          round: { ...roundData },
          roundId: round._id,
          isEditing: true,
        };
        // Use saveInterviewRound mutation from useInterviews hook
        const response = await updateInterviewRound(payload);

        // navigate(`/interviews/${interviewId}`);
        if (response?.status === "ok") {
          notify.success("Round Status updated successfully!");
        }
      } else {
        notify.error(result.message || "Failed to schedule assessment");
      }
    }

    // if (result.success) {
    //   // React Query will handle data refresh automatically
    //   // No need to manually fetch data
    // } else {
    //   toast.error(result.message || "Failed to schedule assessment");
    // }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg ${
          !hideHeader && "shadow-md"
        } overflow-hidden ${isActive ? "ring-2 ring-custom-blue p-2" : ""}`}
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
                  {/* <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scheduled: {formatDate(round.scheduledDate)}</span>
                    {isInstantInterview() && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Instant
                      </span>
                    )}
                  </div> */}

                  {/* {round.dateTime && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Scheduled At: {round.dateTime}</span>
                    </div>
                  )} */}
                  {round.dateTime && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Scheduled At: {round.dateTime.split(" - ")[0]}
                      </span>
                    </div>
                  )}
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

                  {(internalInterviewers || externalInterviewers).length ===
                    0 &&
                    round.roundTitle !== "Assessment" && (
                      <span className="text-sm text-gray-500">
                        No interviewers assigned
                      </span>
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
                            {internalInterviewers.length > 0 &&
                              internalInterviewers.map((interviewer) => (
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

              {round?.assessmentId && (
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
                                      {/* v1.0.5 <-------------------------------- */}
                                      <span className="sm:text-sm font-medium">
                                        {/* v1.0.5 --------------------------------> */}
                                        {sectionData?.sectionName
                                          ? sectionData?.sectionName
                                              .charAt(0)
                                              .toUpperCase() +
                                            sectionData?.sectionName.slice(1)
                                          : "Unnamed Section"}
                                      </span>
                                      <ChevronUp
                                        // v1.0.5 <----------------------------------------------
                                        className={`h-4 w-4 transform transition-transform ${
                                          expandedSections[sectionId]
                                            ? ""
                                            : "rotate-180"
                                        }`}
                                        // v1.0.5 ---------------------------------------------->
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

              {/* <---------------------------v1.0.4 */}

              {/* {isRoundActive && (
                <div className="mt-6 flex flex-wrap justify-end space-x-2">
                  {['scheduled'].includes(round.status?.toLowerCase()) && (
                    <>
                      {round.interviewerType === 'outsource' && !round.isInstant && (
                        <button
                          onClick={() => onInitiateAction(round, 'reschedule')}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <Calendar className="h-4 w-4 mr-1" /> Reschedule
                        </button>
                      )}
                      {['scheduled'].includes(round.status?.toLowerCase()) && (
                        <button
                          onClick={() => { setActionInProgress(true); onInitiateAction(round, 'cancel'); }}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </button>
                      )}
                    </>
                  )}


{round?.roundTitle === "Assessment" && round?.status === "draft"  && (
                    <button
                    onClick={() => handleCreateAssessmentClick(round)}
                      // onClick={handleCreateAssessmentClick(round)}
                      className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Create Assessment Link
                    </button>
                  )}

                  {round.roundTitle === "Assessment" && round?.status !== "draft"  && (
                    <button
                      onClick={() => handleShareClick(round)}
                      className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Resend Assessment Link
                    </button>
                  )}


                  {canEdit && !['Completed', 'Cancelled', 'Rejected', 'Selected'].includes(round.status) && !actionInProgress && (
                    <button
                      onClick={onEdit}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit Round
                    </button>
                  )}

                  {round.status === "Completed" && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Feedback
                    </button>
                  )}
                  {!["Draft", "Request Sent"].includes(round.status) && (
                    <button
                      onClick={() => handleActionClick("Scheduled")}
                      className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <Clock className="h-4 w-4 mr-1" /> Mark Scheduled
                    </button>
                  )}

                  {round.status === "Scheduled" && (
                    <>
                      <button
                        onClick={() => handleActionClick("Completed")}
                        className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                      </button>
                      <button
                        onClick={() => setShowRejectionModal(true) || setActionInProgress(true)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                      </button>
                      <button
                        onClick={handleSelect}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Select
                      </button>
                    </>
                  )}

                  {canEdit &&
                    ![
                      "Request Sent",
                      "Scheduled",
                      "Completed",
                      "Interview_Completed",
                      "Feedback_Submitted",
                    ].includes(round.status) && (
                      <button
                        onClick={() => setShowDeleteConfirmModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Delete Round
                      </button>
                    )}
                </div>
              )} */}
              {/* v1.0.5 <------------------------------------------------------------------ */}
              <div className="overflow-x-auto">
                <div className="mt-6 w-full flex gap-2 whitespace-nowrap sm:justify-start md:justify-start justify-end">
                  {/* Reschedule */}
                  {permissions.canReschedule &&
                    round?.roundTitle !== "Assessment" && (
                      // round.interviewerType === "External" &&
                      // !round.isInstant &&
                      <button
                        onClick={() => onEdit(round, { isReschedule: true })}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <Calendar className="h-4 w-4 mr-1" /> Reschedule
                      </button>
                    )}
                  {/* Cancel */}
                  {permissions.canCancel &&
                    round.roundTitle !== "Assessment" && (
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
                  {/* Edit */}
                  {permissions.canEdit && (
                    <button
                      onClick={() => onEdit(round)}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit Round
                    </button>
                  )}
                  {/* Delete */}
                  {permissions.canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Delete Round
                    </button>
                  )}
                  {/* Mark Scheduled */}
                  {permissions.canMarkScheduled &&
                    round.roundTitle !== "Assessment" && (
                      <button
                        onClick={() => handleActionClick("Scheduled")}
                        className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                      >
                        <Clock className="h-4 w-4 mr-1" /> Mark Scheduled
                      </button>
                    )}
                  {/* Complete */}
                  {permissions.canComplete &&
                    round.roundTitle !== "Assessment" && (
                      <button
                        onClick={() => handleActionClick("Completed")}
                        className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                      </button>
                    )}
                  {/* Select */}
                  {permissions.canSelect && (
                    <button
                      onClick={handleSelect}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Select
                    </button>
                  )}
                  {/* Reject */}
                  {permissions.canReject && (
                    <button
                      onClick={() =>
                        setShowRejectionModal(true) || setActionInProgress(true)
                      }
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                    </button>
                  )}
                  {/* Feedback */}
                  {permissions.canFeedback && (
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-purple-300 text-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Feedback
                    </button>
                  )}

                  {/* Share (always for Assessment) */}
                  {permissions.canResendLink &&
                    round.roundTitle === "Assessment" &&
                    round?.scheduleAssessmentId &&
                    !shouldShowResultButton() && (
                      <button
                        onClick={() => handleResendClick(round)}
                        // onClick={ handleShareClick}
                        className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Resend Link
                      </button>
                    )}

                  {/* Share (always for Assessment) */}
                  {permissions.canShareLink &&
                    round.roundTitle === "Assessment" &&
                    !round?.scheduleAssessmentId &&
                    !candidateAssessment?.status === "Draft" && (
                      <button
                        onClick={() => handleShareClick(round)}
                        // onClick={ handleShareClick}
                        className="inline-flex items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>
                    )}

                  {/* Share (always for Assessment) */}
                  {round.roundTitle === "Assessment" &&
                    round?.scheduleAssessmentId &&
                    shouldShowResultButton() && (
                      <button
                        onClick={() => handleResultClick(round)}
                        // onClick={ handleShareClick}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-custom-blue-700 bg-blue-50 hover:bg-blue-100 "
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Result
                      </button>
                    )}
                </div>
              </div>
              {/* v1.0.5 -----------------------------------------------------------------> */}

              {/* v1.0.4 ----------------------------> */}
            </>
          ) : (
            <RoundFeedbackTab round={round} />
          )}
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
                <Button
                  className={`${
                    confirmAction === "Cancelled" &&
                    "bg-red-600 hover:bg-red-700"
                  }`}
                  variant="success"
                  onClick={handleConfirmStatusChange}
                >
                  Yes, Confirm
                </Button>
              </div>
            </div>
          </div>,
          document.body
          // v1.0.5 -------------------------------------------------------------------------------->
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
                <Button variant="destructive" onClick={handleDeleteRound}>
                  Delete
                </Button>
              </div>
            </div>
          </div>,
          document.body
          // v1.0.5 ------------------------------------------------------------------------------------------>
        )}
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

      {showResultModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-4  bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assessment Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    {interviewData?.candidateId?.FirstName}{" "}
                    {interviewData?.candidateId?.LastName} - {round?.roundTitle}
                  </p>
                </div>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                <ScheduledAssessmentResultView
                  candidate={selectedCandidate}
                  // schedule={selectedSchedule}
                  assessment={assessment}
                  // onBack={closeResultView}
                  onClose={() => setShowResultModal(false)}
                  toggleStates={toggleStates}
                  toggleArrow1={toggleArrow1}
                  // isFullscreen={isFullscreen}
                  assessmentQuestions={assessmentQuestions}
                  mode="interviewMode"
                />
              </div>
            </div>
          </div>,
          document.body
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
