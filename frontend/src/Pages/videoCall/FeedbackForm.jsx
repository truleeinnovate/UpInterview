//<---v1.0.0-----Venkatesh----solved edit mode issues
//<---v1.0.1-----Venkatesh----solved edit mode issues
//<---v1.0.2-----Ranjith----solved feedback issues
// v1.0.3 - Ashok - Improved responsiveness
// v1.0.4 - Ashok - fixed responsiveness issues

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  X,
  Video,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  AlertCircle,
  Star, CheckCircle, ArrowLeft, Sparkles
} from "lucide-react";
import Popup from "reactjs-popup";
import QuestionBank from "../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx";
import { config } from "../../config.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import axios from "axios";
import {
  useCreateFeedback,
  useFeedbackData,
  useUpdateFeedback,
} from "../../apiHooks/useFeedbacks";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock.js";
import { SchedulerViewMode } from "./SchedulerViewMode.jsx";
import DescriptionField from "../../Components/FormFields/DescriptionField.jsx";
import DropdownSelect from "../../Components/Dropdowns/DropdownSelect.jsx";
import { notify } from "../../services/toastService.js";
import { extractUrlData } from "../../apiHooks/useVideoCall.js";
import useAutoSaveFeedback from "../../apiHooks/useAutoSaveFeedback.js";
import { useInterviews } from "../../apiHooks/useInterviews.js";
import { useMockInterviewById } from "../../apiHooks/useMockInterviews.js";
import QuestionCard, { EmptyState } from "../../Components/QuestionCard.jsx";
import { Button } from "../../Components/Buttons/Button.jsx";
import TechnicalSkillsAssessment from "../Dashboard-Part/Tabs/Feedback/TechnicalSkillsAssessment.jsx";
import { useUserProfile } from "../../apiHooks/useUsers.js";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
// import { useMeeting } from "@videosdk.live/react-sdk";

const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];
//<---v1.0.0-----
// Map UI response labels to backend codes expected elsewhere in the app
const toBackendAnswerType = (ui) => {
  if (ui === "Fully Answered") return "correct";
  if (ui === "Partially Answered") return "partial";
  if (ui === "Not Answered") return "not answered";
  return "not answered";
};
// Helper: normalize questionFeedback from backend object {preselected, interviewerAdded}
// into a flat array so all existing code that iterates with .forEach/.map/.find still works.
const flattenQuestionFeedback = (qf) => {
  if (Array.isArray(qf)) return qf;
  if (qf && typeof qf === "object" && (qf.preselected || qf.interviewerAdded)) {
    return [...(qf.preselected || []), ...(qf.interviewerAdded || [])];
  }
  return [];
};

// Inverse mapping for when we need to merge from persisted backend values
const fromBackendAnswerType = (backend) => {
  if (!backend) return undefined;
  if (backend === "correct" || backend === "Fully Answered")
    return "Fully Answered";
  if (backend === "partial" || backend === "Partially Answered")
    return "Partially Answered";
  if (
    backend === "incorrect" ||
    backend === "wrong" ||
    backend === "Not Answered" ||
    backend === "not answered"
  )
    return "Not Answered";
  return undefined;
};
//---v1.0.0----->

const FeedbackForm = ({
  custom,
  // interviewerSectionData = [],
  // setInterviewerSectionData,
  interviewRoundId,
  candidateId,
  positionId,
  interviewerId,
  // feedbackCandidate,
  // tenantId,
  isEditMode,
  isViewMode,
  interviewType,
  roundId,
  // preselectedQuestionsResponses = [],

  decodedData,
  isAddMode,
  // isScheduler,
  schedulerFeedbackData,
}) => {
  // console.log("feedbackCandidate", isEditMode, isViewMode, isAddMode);
  useScrollLock(true);
  const location = useLocation();
  const locationFeedback = location.state?.feedback;

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );
  const { useInterviewDetails } = useInterviews();
  const { userProfile } = useUserProfile();

  const firstName = capitalizeFirstLetter(userProfile?.firstName);
  const lastName = capitalizeFirstLetter(userProfile?.lastName);
  // const contactId = formatName(singleContact?.contactId);
  const fullName = firstName + " " + lastName


  // Feedback query (existing)
  const {
    data: feedbackDatas,
    isLoading: feedbackLoading,
    isError: feedbackError,
  } = useFeedbackData({
    roundId: isViewMode ? roundId : !urlData?.isCandidate ? urlData?.interviewRoundId : null,
    interviewerId: !urlData?.isCandidate && !urlData?.isSchedule ? urlData?.interviewerId : null,
    interviewType: urlData?.interviewType || interviewType,
    // roundId: !urlData.isCandidate ? urlData.interviewRoundId : null,
    // interviewerId: !urlData.isCandidate ? urlData.interviewerId : null,
    // interviewType: urlData?.interviewType,
  });

  // console.log("feedbackDatas", feedbackDatas)
  // <---------------------------- NEW UI FIELDS -------------------------------------------
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    roundTitle: '',
    interviewerName: '',
    interviewDate: new Date().toISOString().split('T')[0],
    isMockInterview: false,
    overallRating: 0,
    communicationRating: 0,
    recommendation: 'Maybe',
    skillRatings: [
      { skillName: 'Problem Solving', rating: 0, notes: '' },
      { skillName: 'Technical Knowledge', rating: 0, notes: '' },
      { skillName: 'Communication', rating: 0, notes: '' }
    ],
    technicalSkills: {
      strong: [],
      good: [],
      basic: [],
      noExperience: []
    },
    skillOrder: [],
    questionsAsked: [
      { question: '', answered: true, notes: '' }
    ],
    strengths: [''],
    areasForImprovement: [''],
    additionalComments: '',
    cultureFit: 0,
    willingnessToLearn: 0,
    mockInterviewNotes: ''
  });

  const isMockInterview = urlData?.interviewType ? urlData?.interviewType === "mockinterview" : interviewType || locationFeedback?.isMockInterview;

  // const isMockInterview = urlData?.interviewType === "mockinterview" || interviewType === "mockinterview";
  // console.log("isMockInterview", isMockInterview);
  // const { data, isLoading } = useInterviewDetails({
  //   roundId: urlData.interviewRoundId,
  // });

  // ✅ ALWAYS call hooks
  const {
    mockInterview: mockinterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
    // mockInterviewRoundId: isMockInterview ? urlData?.interviewRoundId : null,
    // enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: !isMockInterview,
    // roundId: !isMockInterview ? urlData?.interviewRoundId : null,
    // enabled: !isMockInterview,
  });

  const candidateData = isMockInterview
    ? mockinterview
    : interviewData?.candidateId || {};


  const interviewRoundData =
    interviewData || mockinterview || {};

  const positionData = isMockInterview ? {} : interviewData?.positionId || {};

  console.log("candidateData", candidateData)

  console.log("positionData", positionData)

  console.log("interviewRoundData", interviewRoundData)

  const currentRound = useMemo(() => {
    if (interviewRoundData?.rounds && Array.isArray(interviewRoundData.rounds)) {
      if (urlData?.interviewRoundId || roundId) {
        const rId = urlData?.interviewRoundId || roundId;
        return (
          interviewRoundData.rounds.find((r) => String(r._id) === String(rId)) ||
          interviewRoundData.rounds[0]
        );
      }
      return interviewRoundData.rounds[0];
    }
    return interviewRoundData;
  }, [interviewRoundData, urlData?.interviewRoundId, roundId]);

  console.log("currentRound", currentRound);

  const feedbackData = useMemo(() => {
    const raw = locationFeedback || feedbackDatas || {};
    // If the API response has a feedbacks array, find the feedback that
    // matches the current interviewer ID from the URL.
    if (Array.isArray(raw?.feedbacks) && raw.feedbacks.length > 0) {
      // Find the feedback that matches the current interviewer ID from URL
      let fb = raw.feedbacks[0]; // Default to first one
      if (urlData?.interviewerId) {
        const found = raw.feedbacks.find((f) => {
          const fbInterviewerId = f.interviewerId?._id || f.interviewerId;
          const fbOwnerId = f.ownerId?._id || f.ownerId;
          return (
            String(fbInterviewerId) === String(urlData.interviewerId) ||
            String(fbOwnerId) === String(urlData.interviewerId)
          );
        });
        if (found) fb = found;
      }

      return {
        ...raw,
        _id: fb._id,
        questionFeedback: flattenQuestionFeedback(fb.questionFeedback),
        skills: fb.skills || fb.technicalSkills,
        overallImpression: fb.overallImpression,
        generalComments: fb.generalComments || fb.additionalComments,
        additionalComments: fb.additionalComments || fb.generalComments,
        strengths: fb.strengths,
        areasForImprovement: fb.areasForImprovement,
        technicalCompetency: fb.technicalCompetency,
        technicalSkills: fb.technicalSkills || fb.skills,
        status: fb.status,
      };
    }
    return raw;
  }, [locationFeedback, feedbackDatas, urlData?.interviewerId]);
  console.log("feedbackData", feedbackData);

  // Derived state for submission status
  const isSubmitted = feedbackData?.status === "submitted" || feedbackData?.status === "Submitted";
  // Read-only mode applies if viewed in read-only mode OR if the feedback is already submitted
  const isReadOnly = isViewMode || isSubmitted;

  // console.log("feedbackData", feedbackData);

  const getInterviewerSectionData = useCallback(() => {
    // 1. Try to get questions from the specific feedback object (if editing/viewing)
    //    Use flattenQuestionFeedback to handle both array and {preselected, interviewerAdded} formats
    let questions = flattenQuestionFeedback(feedbackData?.questionFeedback);

    // 2. If not found, check if feedbackData is a wrapper with a 'feedbacks' array
    if (questions.length === 0 && Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0) {
      questions = flattenQuestionFeedback(feedbackData.feedbacks[0].questionFeedback);
    }

    // 3. If still not found (e.g., new feedback), get from interviewQuestions (interviewer added)
    if (questions.length === 0) {
      questions = feedbackData?.interviewQuestions?.interviewerAddedQuestions || [];
    }

    if (!questions || questions.length === 0) return [];

    // console.log("questions questions", questions);

    const allQuestions =
      Array.isArray(questions)
        ? questions.filter((q) => q?.addedBy === "interviewer")
        : [];

    return allQuestions.map((q) => {
      // Map backend answer types to UI values
      const mapAnswerType = (type) => {
        if (type === "correct") return "Fully Answered";
        if (type === "partial") return "Partially Answered";
        if (type === "incorrect" || type === "not answered")
          return "Not Answered";
        return "Not Answered";
      };

      return {
        ...q,
        questionId: q.questionId || q._id,
        isAnswered: mapAnswerType(q.candidateAnswer?.answerType),
        isLiked: q.interviewerFeedback?.liked || "",
        whyDislike: q.interviewerFeedback?.dislikeReason || "",
        note: q.interviewerFeedback?.note || "",
        notesBool: !!q.interviewerFeedback?.note,
        // Preserve original data for reference
        originalData: q,
      };
    });
  }, [feedbackData]);

  const [interviewerSectionData, setInterviewerSectionData] = useState(() => getInterviewerSectionData());

  // console.log("interviewerSectionData", interviewerSectionData)

  // Track if initial load was done — we must NOT reset interviewerSectionData
  // on every feedbackData change because that wipes user modifications
  // (notesBool, isLiked, whyDislike, note) made via the UI handlers.
  const initialSectionLoadDone = useRef(false);

  useEffect(() => {
    // Only initialize once after feedbackData loads. Subsequent feedbackData
    // changes (e.g., from auto-save refetch) must NOT overwrite user edits.
    if (!initialSectionLoadDone.current) {
      const data = getInterviewerSectionData();
      if (data.length > 0) {
        setInterviewerSectionData(data);
        initialSectionLoadDone.current = true;
      }
    }
  }, [getInterviewerSectionData]);

  // const [interviewerSectionData, setInterviewerSectionData] = useState( [...selectedCandidate.interviewData?.questionFeedback]);
  // const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  // const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Question Bank Handler Functions
  // const handleAddQuestionToRound = (question) => {
  //   if (question && question.questionId && question.snapshot) {
  //     if (typeof setInterviewerSectionData === "function") {
  //       setInterviewerSectionData((prevList) => {
  //         if (prevList.some((q) => q.questionId === question.questionId)) {
  //           return prevList;
  //         }
  //         const newList = [
  //           ...prevList,
  //           {
  //             ...question,
  //             addedBy: "interviewer",
  //             mandatory: "false", // Default to false when adding a new question
  //             snapshot: {
  //               ...question.snapshot,
  //               addedBy: "interviewer",
  //               mandatory: "false",
  //             },
  //           },
  //         ];

  //         // Clear questions error if questions are added
  //         // if (newList.length > 0) {
  //         //   clearError('questions');
  //         // }

  //         // Trigger auto-save after adding question
  //         setTimeout(() => autoSaveQuestions(), 500);

  //         return newList;
  //       });
  //     } else {
  //       console.warn(
  //         "setInterviewerSectionData is not a function, cannot add question to round",
  //       );
  //     }
  //   }
  // };

  // const handleRemoveQuestion = (questionId) => {
  //   // Remove question from interviewer section data
  //   setInterviewerSectionData((prev) =>
  //     prev.filter((q) => (q.questionId || q.id) !== questionId),
  //   );

  //   // Add to removed question IDs
  //   setRemovedQuestionIds((prev) => [...prev, questionId]);

  //   // Trigger auto-save after removing question
  //   setTimeout(() => autoSaveQuestions(), 500);
  // };

  // const handleToggleMandatory = (questionId) => {
  //   // Toggle mandatory status for the question
  //   setInterviewerSectionData((prev) => {
  //     const updated = prev.map((q) => {
  //       if ((q.questionId || q.id) === questionId) {
  //         const newMandatory = q.mandatory === "true" ? "false" : "true";

  //         return {
  //           ...q,
  //           mandatory: newMandatory,
  //           snapshot: q.snapshot
  //             ? {
  //                 ...q.snapshot,
  //                 mandatory: newMandatory,
  //               }
  //             : undefined,
  //         };
  //       }
  //       return q;
  //     });

  //     // Trigger auto-save after toggling mandatory
  //     setTimeout(() => autoSaveQuestions(), 500);
  //     return updated;
  //   });
  // };

  // Preselected Questions Responses Handler Functions
  const handlePreselectedQuestionResponse = (questionId, responseData) => {
    setPreselectedQuestionsResponses((prev) => {
      const existingIndex = prev.findIndex((q) => q.questionId === questionId);
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...responseData };
        return updated;
      } else {
        // Add new response
        return [...prev, { questionId, ...responseData }];
      }
    });
  };

  // Helper to get merged question feedback from the correct API response path
  const getMergedQuestionFeedback = useCallback(() => {
    if (feedbackData?.questionFeedback) return feedbackData.questionFeedback;
    if (Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0) {
      return feedbackData.feedbacks[0].questionFeedback || [];
    }
    return [];
  }, [feedbackData]);

  // Properly initialize preselected questions with full question data and responses
  const getPreselectedQuestionsResponses = useCallback(() => {
    const preselectedQuestions =
      feedbackData?.interviewQuestions?.preselectedQuestions || [];

    const mergedQuestions = getMergedQuestionFeedback();

    return preselectedQuestions.map((question) => {
      // Find existing feedback for this question by matching _id
      const existingFeedback = mergedQuestions?.find(
        (f) => String(f._id) === String(question._id),
      );

      return {
        // Include the full question data
        ...question,
        // Response data with proper defaults
        isAnswered: existingFeedback?.candidateAnswer?.answerType
          ? existingFeedback.candidateAnswer.answerType === "correct"
            ? "Fully Answered"
            : existingFeedback.candidateAnswer.answerType === "partial"
              ? "Partially Answered"
              : "Not Answered"
          : "Not Answered",
        isLiked: existingFeedback?.interviewerFeedback?.liked || "",
        whyDislike:
          existingFeedback?.interviewerFeedback?.dislikeReason || "",
        note: existingFeedback?.interviewerFeedback?.note || "",
        notesBool: !!existingFeedback?.interviewerFeedback?.note,
        answer: existingFeedback?.candidateAnswer?.submittedAnswer || "",
      };
    });
  }, [feedbackData, getMergedQuestionFeedback]);

  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState(() => getPreselectedQuestionsResponses());

  // Only sync on initial data load (not on refetch during active editing)
  const hasPreselectedLoadRef = useRef(false);

  useEffect(() => {
    if (hasPreselectedLoadRef.current) return;
    const data = getPreselectedQuestionsResponses();
    if (data.length > 0 || feedbackData?.interviewQuestions) {
      setPreselectedQuestionsResponses(data);
      hasPreselectedLoadRef.current = true;
    }
  }, [getPreselectedQuestionsResponses, feedbackData]);

  // const feedbackData = React.useMemo(() => locationFeedback || {}, [locationFeedback]);
  const feedbackId =
    feedbackData?._id ||
    (Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0
      ? feedbackData.feedbacks[0]?._id
      : null);

  const skillsData = feedbackData.skills || [];

  // console.log("feedbackId", feedbackId);
  // console.log("feedbackData", feedbackData);
  // Fixed: Properly initialize overall impression data with fallback
  const overallImpressionTabData = feedbackData?.overallImpression || {};

  const navigate = useNavigate();

  const [autoSaveFeedbackId, setAutoSaveFeedbackId] = useState(feedbackId);

  useEffect(() => {
    if (feedbackId) {
      setAutoSaveFeedbackId(feedbackId);
    }
  }, [feedbackId]);
  // console.log("autoSaveFeedbackId", autoSaveFeedbackId);
  // const [overallRating, setOverallRating] = useState(((isEditMode || isViewMode) && overallImpressionTabData.overallRating) || 0);
  // const [communicationRating, setCommunicationRating] = useState(((isEditMode || isViewMode) && overallImpressionTabData.communicationRating) || 0);
  // const [skillRatings, setSkillRatings] = useState(((isEditMode || isViewMode) && skillsData.map(skill => ({ skill: skill.skillName, rating: skill.rating, comments: skill.note }))) || [{ skill: '', rating: 0, comments: '' }]);


  // Track if user has interacted with skills to prevents overwriting user work with async loaded data
  const hasUserInteractedWithSkills = useRef(false);
  // Track if we have already synced with the persistence layer once
  const hasLoadedSavedSkills = useRef(false);

  // Define initial skills derived from position or interview data
  const initialSkillRatings = useMemo(() => {
    const dSkills = isMockInterview
      ? interviewRoundData?.skills || []
      : positionData?.skills || [];

    return (Array.isArray(dSkills) ? dSkills : []).map((s) => ({
      skill: s.skill || s.SkillName || (typeof s === "string" ? s : ""),
      skillName: s.skill || s.SkillName || (typeof s === "string" ? s : ""),
      rating: 0,
      notes: "",
    }));
  }, [isMockInterview, interviewRoundData, positionData]);



  // Re-sync scalar feedback values on initial load only
  const hasScalarInitRef = useRef(false);


  // Merge answered and newly added
  const mergedQuestions = useMemo(() => {
    // Get existing interviewer questions from API
    const existingInterviewerQuestions =
      feedbackData?.interviewData?.questionFeedback || [];

    // Get newly added questions from interviewerSectionData
    const newlyAddedQuestions = (interviewerSectionData || []).filter(
      (newQ) => {
        const newId = newQ.questionId || newQ._id || newQ.id;
        const isNotDuplicate = !existingInterviewerQuestions.some(
          (existingQ) => {
            const existingId =
              existingQ.questionId || existingQ._id || existingQ.id;
            return existingId === newId;
          },
        );
        const isAddedByInterviewer =
          (newQ.addedBy || newQ.snapshot?.addedBy) === "interviewer";
        return isNotDuplicate && isAddedByInterviewer;
      },
    );

    // const newlyAddedQuestions = (interviewerSectionData || []).filter(newQ => {
    //   const newId = newQ.questionId || newQ._id || newQ.id;
    //   return !existingInterviewerQuestions.some(existingQ => {
    //     const existingId = existingQ.questionId || existingQ._id || existingQ.id;
    //     return existingId === newId;
    //   });
    // });

    // Combine both for submission purposes
    return [...existingInterviewerQuestions, ...newlyAddedQuestions];
  }, [feedbackData, interviewerSectionData]);
  // console.log("mergedQuestions",mergedQuestions);

  //<---v1.0.0-----
  const filteredInterviewerQuestions = React.useMemo(() => {
    const all =
      isEditMode || isViewMode
        ? feedbackData.preSelectedQuestions
        : mergedQuestions;
    return Array.isArray(all)
      ? all.filter((q) => q.addedBy === "interviewer")
      : [];
  }, [isEditMode, isViewMode, isAddMode, feedbackData, interviewerSectionData]);
  // console.log("filteredInterviewerQuestions",filteredInterviewerQuestions)

  const questionsWithFeedback = React.useMemo(() => {
    // Start with interviewer-added questions from preselected/merged data
    const allQuestions = [...(filteredInterviewerQuestions || [])];

    // console.log("allQuestions", allQuestions);

    // Build a quick lookup of current UI state overlays
    const overlayMap = (interviewerSectionData || []).reduce((acc, q) => {
      const id = q.questionId || q._id || q.id;
      if (!id) return acc;
      acc[id] = q;
      return acc;
    }, {});

    // Create a map by question ID and overlay interviewerSectionData when present
    const questionsMap = new Map();
    allQuestions.forEach((q) => {
      const id = q.questionId || q._id || q.id;
      if (!id) return;
      const overlay = overlayMap[id];
      questionsMap.set(id, overlay ? { ...q, ...overlay } : { ...q });
    });

    // Include any interviewerSectionData questions that aren't in filteredInterviewerQuestions yet
    (interviewerSectionData || []).forEach((q) => {
      const id = q.questionId || q._id || q.id;
      if (!id) return;
      if (!questionsMap.has(id)) {
        questionsMap.set(id, { ...q });
      }
    });

    // Apply persisted feedback data if available (only filling in when UI state is missing)
    if (
      (isEditMode || isViewMode || isAddMode) &&
      feedbackData?.questionFeedback
    ) {
      flattenQuestionFeedback(feedbackData.questionFeedback).forEach((feedback) => {
        const id = feedback.questionId || feedback._id;
        if (id && questionsMap.has(id)) {
          const question = questionsMap.get(id);

          // Merge answer data
          if (feedback.candidateAnswer) {
            const mappedType = fromBackendAnswerType(
              feedback.candidateAnswer.answerType,
            );
            if (!question.isAnswered && mappedType) {
              question.isAnswered = mappedType;
            }
            if (!question.answer && feedback.candidateAnswer.submittedAnswer) {
              question.answer = feedback.candidateAnswer.submittedAnswer;
            }
          }

          // Merge feedback data
          if (feedback.interviewerFeedback) {
            if (!question.isLiked) {
              question.isLiked = feedback.interviewerFeedback.liked;
            }
            if (!question.whyDislike) {
              question.whyDislike =
                feedback.interviewerFeedback.dislikeReason || "";
            }
            if (!question.note) {
              question.note = feedback.interviewerFeedback.note || "";
              // Only overwrite notesBool if it's undefined (not set by UI yet)
              // This prevents closing the input when user clicks "Add Note" (note is empty but notesBool is true)
              if (question.notesBool === undefined) {
                question.notesBool = !!feedback.interviewerFeedback.note;
              }
            }
          }
        }
      });
    }

    return Array.from(questionsMap.values());
  }, [
    isEditMode,
    isViewMode,
    feedbackData,
    interviewerSectionData,
    filteredInterviewerQuestions,
    isAddMode,
  ]);




  // Questions Asked Handlers
  const addQuestion = () => {
    setFormData({
      ...formData,
      questionsAsked: [...formData.questionsAsked, { question: '', answered: true, notes: '' }]
    });
  };

  const removeQuestion = (index) => {
    const updated = formData.questionsAsked.filter((_, i) => i !== index);
    setFormData({ ...formData, questionsAsked: updated });
  };

  const updateQuestion = (index, field, value) => {
    const updated = formData.questionsAsked.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setFormData({ ...formData, questionsAsked: updated });
  };

  // Skill Ratings Handlers
  const addSkillRating = () => {
    setFormData({
      ...formData,
      skillRatings: [...formData.skillRatings, { skillName: '', rating: 0, notes: '' }]
    });
  };

  const removeSkillRating = (index) => {
    const updated = formData.skillRatings.filter((_, i) => i !== index);
    setFormData({ ...formData, skillRatings: updated });
  };

  const updateSkillRating = (index, field, value) => {
    const updated = formData.skillRatings.map((skill, i) =>
      i === index ? { ...skill, [field]: value } : skill
    );
    setFormData({ ...formData, skillRatings: updated });
  };

  // Strengths Handlers
  const addStrength = () => {
    setFormData({ ...formData, strengths: [...formData.strengths, ''] });
  };

  const removeStrength = (index) => {
    const updated = formData.strengths.filter((_, i) => i !== index);
    setFormData({ ...formData, strengths: updated });
  };

  const updateStrength = (index, value) => {
    const updated = formData.strengths.map((s, i) => (i === index ? value : s));
    setFormData({ ...formData, strengths: updated });
  };

  // Areas for Improvement Handlers
  const addArea = () => {
    setFormData({
      ...formData,
      areasForImprovement: [...formData.areasForImprovement, '']
    });
  };

  const removeArea = (index) => {
    const updated = formData.areasForImprovement.filter((_, i) => i !== index);
    setFormData({ ...formData, areasForImprovement: updated });
  };

  const updateArea = (index, value) => {
    const updated = formData.areasForImprovement.map((a, i) => (i === index ? value : a));
    setFormData({ ...formData, areasForImprovement: updated });
  };

  // Additional Ratings
  const StarRating = ({ rating, onChange, size = 'md', isReadOnly = false }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !isReadOnly && onChange(star)}
            disabled={isReadOnly}
            className={`transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };


  // Sync formData with secondary data
  useEffect(() => {
    if (Object.keys(interviewRoundData).length > 0) {
      const candidateName = isMockInterview
        ? candidateData?.candidateName || ""
        : `${candidateData?.FirstName || ""} ${candidateData?.LastName || ""}`.trim();

      // Handle "DD-MM-YYYY ..." format or ISO format
      const rawDate = currentRound?.dateTime || interviewRoundData?.dateTime;
      let interviewDate = new Date().toISOString().split("T")[0];
      if (rawDate) {
        const dateMatch = String(rawDate).match(/^(\d{2})-(\d{2})-(\d{4})/);
        if (dateMatch) {
          interviewDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        } else {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            interviewDate = d.toISOString().split("T")[0];
          }
        }
      }

      const roundInterviewers =
        currentRound?.interviewers || interviewRoundData?.interviewers;
      const interviewerName =
        roundInterviewers?.[0]?.name ||
        interviewRoundData?.interviewerId?.name ||
        "";

      setFormData((prev) => {
        const roundSkills = currentRound?.questions || [];
        const dataSkills = isMockInterview
          ? interviewRoundData?.skills || []
          : positionData?.skills || [];

        const technicalSkills = {
          strong: [...(prev.technicalSkills?.strong || [])],
          good: [...(prev.technicalSkills?.good || [])],
          basic: [...(prev.technicalSkills?.basic || [])],
          noExperience: [...(prev.technicalSkills?.noExperience || [])],
        };

        const skillOrder = [...(prev.skillOrder || [])];

        // 1. Restore from existing feedbackData if available (Edit/View mode)
        // Check new technicalSkills array first
        const savedTechnicalSkills = feedbackData?.technicalSkills || [];
        const savedLegacySkills = feedbackData?.skills || [];
        const skillsToRestore = savedTechnicalSkills.length > 0 ? savedTechnicalSkills : savedLegacySkills;

        if (skillsToRestore.length > 0) {
          skillsToRestore.forEach(s => {
            const sName = s.skillName;
            if (!sName) return;

            // Support both old note-based categorization and new level field
            let category = s.level;
            if (!category) {
              if (s.rating === 5 && s.note?.includes("Strong")) category = "strong";
              else if (s.rating === 4 && s.note?.includes("Good")) category = "good";
              else if (s.rating === 3 && s.note?.includes("Basic")) category = "basic";
              else if (s.rating === 1 && s.note?.includes("No Experience")) category = "noExperience";
            }

            if (category && ["strong", "good", "basic", "noExperience"].includes(category)) {
              // Remove from all categories first to avoid duplicates
              Object.keys(technicalSkills).forEach(cat => {
                technicalSkills[cat] = technicalSkills[cat].filter(name => name !== sName);
              });
              technicalSkills[category].push(sName);
              if (!skillOrder.includes(sName)) skillOrder.push(sName);
            }
          });
        }

        // 2. Add skills from round/position data if not already present
        const allPotentialSkills = [...roundSkills];
        dataSkills.forEach((s) => {
          const sName = typeof s === "string" ? s : s.skill;
          if (sName && !allPotentialSkills.some(existing => (typeof existing === 'string' ? existing : existing.skill) === sName)) {
            allPotentialSkills.push(sName);
          }
        });

        if (allPotentialSkills.length > 0) {
          allPotentialSkills.forEach((skillObj) => {
            const sName =
              typeof skillObj === "string" ? skillObj : skillObj.skill;
            if (
              sName &&
              !technicalSkills.strong.includes(sName) &&
              !technicalSkills.good.includes(sName) &&
              !technicalSkills.basic.includes(sName) &&
              !technicalSkills.noExperience.includes(sName)
            ) {
              technicalSkills.good.push(sName);
            }

            if (sName && !skillOrder.includes(sName)) {
              skillOrder.push(sName);
            }
          });
        }

        // Restore other fields from feedbackData
        const impression = feedbackData?.overallImpression || {};

        return {
          ...prev,
          candidateName: candidateName,
          position: positionData?.title || positionData?.name || "",
          roundTitle:
            currentRound?.roundTitle || interviewRoundData?.roundTitle || "",
          interviewerName: interviewerName,
          interviewDate: interviewDate,
          isMockInterview: isMockInterview,
          technicalSkills: technicalSkills,
          skillOrder: skillOrder,
          // Sync existing feedback fields from database
          overallRating: impression.overallRating || prev.overallRating,
          recommendation: impression.recommendation || prev.recommendation,
          cultureFit: impression.cultureFit || prev.cultureFit,
          willingnessToLearn: impression.willingnessToLearn || prev.willingnessToLearn,
          additionalComments: (prev.additionalComments && prev.additionalComments !== "") ? prev.additionalComments : (feedbackData?.additionalComments || feedbackData?.generalComments || ""),
          strengths: feedbackData?.strengths?.length > 0 ? feedbackData.strengths : prev.strengths,
          areasForImprovement: feedbackData?.areasForImprovement?.length > 0 ? feedbackData.areasForImprovement : prev.areasForImprovement,
          communicationRating: prev.communicationRating || impression.communicationRating || 0,
          // Technical Competency (Star Ratings) - Map from technicalCompetency in schema
          skillRatings: feedbackData?.technicalCompetency?.length > 0
            ? feedbackData.technicalCompetency.map(s => ({
              skillName: s.skillName || s.skill,
              rating: s.rating || 0,
              notes: s.notes || s.note || ""
            }))
            : prev.skillRatings
        };
      });
    }
  }, [
    candidateData,
    positionData,
    interviewRoundData,
    currentRound,
    isMockInterview,
    feedbackData, // Depend on full feedbackData for correct population
  ]);

  // ---------------------------- NEW UI FIELDS ------------------------------------------->



  // Final list of questions to render in the interviewer section

  // console.log("questionsWithFeedback", questionsWithFeedback)

  const questionsToRender = React.useMemo(() => {
    if (isEditMode || isViewMode || isAddMode) {
      return Array.isArray(questionsWithFeedback) ? questionsWithFeedback : [];
    }

    return Array.isArray(filteredInterviewerQuestions)
      ? filteredInterviewerQuestions
      : [];
  }, [
    isEditMode,
    isViewMode,
    isAddMode,
    questionsWithFeedback,
    filteredInterviewerQuestions,
  ]);

  // Build a final, de-duplicated list of questionFeedback for updates, preserving existing interviewerFeedback
  const finalQuestionFeedback = React.useMemo(() => {
    // Helper to normalize to string id
    const normId = (q) => {
      if (!q) return "";
      if (typeof q === "string") return q;
      return q.questionId || q.id || q._id || "";
    };

    // Existing saved feedback map (edit/view modes)
    const existingMap = (
      flattenQuestionFeedback(feedbackData?.questionFeedback)
    ).reduce((acc, f) => {
      const k = normId(f?.questionId || f);
      if (!k) return acc;
      acc[k] = f;
      return acc;
    }, {});

    // Gather candidate IDs from all sources
    const idsSet = new Set();
    (preselectedQuestionsResponses || []).forEach((r) => idsSet.add(normId(r)));
    (interviewerSectionData || []).forEach((q) => idsSet.add(normId(q)));
    Object.keys(existingMap).forEach((k) => idsSet.add(k));

    // Build a quick lookup for overlays
    const overlayMap = (interviewerSectionData || []).reduce((acc, q) => {
      const k = normId(q);
      if (!k) return acc;
      acc[k] = q;
      return acc;
    }, {});

    const preselectedMap = (preselectedQuestionsResponses || []).reduce(
      (acc, r) => {
        const k = normId(r);
        if (!k) return acc;
        acc[k] = r;
        return acc;
      },
      {},
    );

    // console.log("overlayMap",overlayMap);
    // console.log("preselectedMap",preselectedMap);
    // console.log("existingMap",existingMap);
    // console.log("idsSet",idsSet);

    const result = [];
    idsSet.forEach((id) => {
      const overlay = overlayMap[id] || {};
      const pre = preselectedMap[id] || {};
      const existingEntry = existingMap[id];
      const existing = existingEntry || {};

      const uiIsAnswered =
        overlay.isAnswered ??
        pre.isAnswered ??
        fromBackendAnswerType(existing?.candidateAnswer?.answerType);
      const uiLiked =
        overlay.isLiked ?? pre.isLiked ?? existing?.interviewerFeedback?.liked;
      const uiNote =
        overlay.note ?? pre.note ?? existing?.interviewerFeedback?.note;
      const uiWhyDislike =
        overlay.whyDislike ??
        pre.whyDislike ??
        existing?.interviewerFeedback?.dislikeReason;

      const isNewInterviewerQuestion =
        !existingEntry &&
        (overlay.addedBy === "interviewer" ||
          overlay.snapshot?.addedBy === "interviewer");

      const questionIdPayload = isNewInterviewerQuestion ? overlay : id;

      result.push({
        questionId: questionIdPayload,
        candidateAnswer: {
          answerType: toBackendAnswerType(uiIsAnswered),
          submittedAnswer: "",
        },
        interviewerFeedback: {
          liked: uiLiked ?? "none",
          note: uiNote ?? "",
          dislikeReason: uiWhyDislike ?? "",
        },
      });
    });

    return result;
  }, [
    feedbackData?.questionFeedback,
    interviewerSectionData,
    preselectedQuestionsResponses,
  ]);

  // Question Bank State Management
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const currentTenantId = tokenPayload?.tenantId;
  const currentOwnerId = tokenPayload?.userId;

  // Validation errors state
  const [errors, setErrors] = useState({
    overallRating: "",
    communicationRating: "",
    skills: "",
    comments: "",
    questions: "",
  });

  // console.log("feedbackData", feedbackData);

  // Add the auto-save hook after all your useState declarations (around line 350):

  const { isSaving, lastSaved, saveNow: autoSaveQuestions } = useAutoSaveFeedback({
    isAddMode,
    isEditMode,
    interviewRoundId:
      interviewRoundId ||
      urlData?.interviewRoundId ||
      decodedData?.interviewRoundId,
    tenantId: currentTenantId,
    interviewerId: interviewerId || decodedData?.interviewerId || urlData?.interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings: formData.skillRatings,
    technicalSkills: formData.technicalSkills,
    strengths: formData.strengths,
    areasForImprovement: formData.areasForImprovement,
    overallRating: formData.overallRating,
    communicationRating: formData.communicationRating,
    recommendation: formData.recommendation,
    cultureFit: formData.cultureFit,
    willingnessToLearn: formData.willingnessToLearn,
    comments: formData.additionalComments,
    candidateId: candidateData?._id || undefined,
    positionId:
      positionId ||
      positionData?._id ||
      decodedData?.positionId ||
      urlData?.positionId ||
      undefined,
    ownerId: currentOwnerId,
    feedbackId: autoSaveFeedbackId,
    isMockInterview: urlData?.interviewType === "mockinterview" || false,
    feedbackCode:
      urlData?.interviewType === "mockinterview" ? (interviewRoundData?.mockInterviewCode || "MOCK") + "-001" :
        (interviewRoundData?.interviewCode
          ? `${interviewRoundData.interviewCode}-00${interviewRoundData?.rounds?.[0]?.sequence || ""}`
          : "") || "",
    isLoaded: !feedbackLoading && !isMockLoading && !isInterviewLoading,
  });

  // Watch for changes to feedback data and trigger auto-save
  useEffect(() => {
    if (!feedbackLoading && !isMockLoading && !isInterviewLoading) {
      triggerAutoSave();
    }
  }, [
    formData,
    interviewerSectionData,
    preselectedQuestionsResponses,
  ]);

  const saveTimeoutRef = React.useRef(null);

  // Helper Function (Outside the component or inside FeedbackForm)
  const triggerAutoSave = () => {
    if (isAddMode || isEditMode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSaveQuestions();
      }, 500);
    }
  };

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      if (typeof setInterviewerSectionData === "function") {
        setInterviewerSectionData((prevList) => {
          if (prevList.some((q) => q.questionId === question.questionId)) {
            return prevList;
          }
          const newList = [
            ...prevList,
            {
              ...question,
              addedBy: "interviewer",
              mandatory: "false", // Default to false when adding a new question
              snapshot: {
                ...question.snapshot,
                addedBy: "interviewer",
                mandatory: "false",
              },
            },
          ];

          // Clear questions error if questions are added
          if (newList.length > 0) {
            clearError("questions");
          }

          // Trigger immediate save after adding question
          triggerAutoSave();

          return newList;
        });
      } else {
        console.warn(
          "setInterviewerSectionData is not a function, cannot add question to round",
        );
      }
    }
  };

  const handleRemoveQuestion = (questionId) => {
    // console.log("Removing question:", questionId);

    // Remove question from interviewer section data
    setInterviewerSectionData((prev) =>
      prev.filter((q) => (q.questionId || q.id) !== questionId),
    );

    // Add to removed question IDs
    setRemovedQuestionIds((prev) => [...prev, questionId]);

    // Trigger auto-save
    triggerAutoSave();
  };

  const handleToggleMandatory = (questionId) => {
    // console.log("Toggling mandatory for question:", questionId);

    // Toggle mandatory status for the question
    setInterviewerSectionData((prev) => {
      // console.log("Previous state:", prev);
      const updated = prev.map((q) => {
        if ((q.questionId || q.id) === questionId) {
          // console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          // console.log("New mandatory value:", newMandatory);
          return {
            ...q,
            mandatory: newMandatory,
            snapshot: q.snapshot
              ? {
                ...q.snapshot,
                mandatory: newMandatory,
              }
              : undefined,
          };
        }
        return q;
      });
      // console.log("Updated state:", updated);
      return updated;
    });
  };

  // Handle escape key to close question bank
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isQuestionBankOpen) {
        setIsQuestionBankOpen(false);
      }
    };

    if (isQuestionBankOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset"; // Restore scrolling
    };
  }, [isQuestionBankOpen]);

  // Question Interaction Functions
  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === questionId);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, note: notes, notesBool: true }
            : q,
        );
      }
      // add minimal overlay so UI updates immediately
      return [...prev, { questionId, note: notes, notesBool: true }];
    });

    // to auto save comments change
    triggerAutoSave();
    //---v1.0.0----->
  };

  // const onClickAddNote = (id) => {
  //   //<---v1.0.0-----
  //   setInterviewerSectionData((prev) => {
  //     const exists = prev.some((q) => (q.questionId || q.id) === id);
  //     if (exists) {
  //       return prev.map((q) =>
  //         (q.questionId || q.id) === id ? { ...q, notesBool: !q.notesBool } : q
  //       );
  //     }
  //     return [...prev, { questionId: id, notesBool: true }];
  //   });
  //   // to auto save comments change
  //   triggerAutoSave();
  //   //---v1.0.0----->
  // };

  const onClickAddNote = (id) => {
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? {
              ...q,
              notesBool: !q.notesBool,
              // Clear note when toggling off
              note: !q.notesBool ? q.note : "",
            }
            : q,
        );
      }
      return [...prev, { questionId: id, notesBool: true }];
    });
    // to auto save comments change
    triggerAutoSave();
    //---v1.0.0----->
  };

  // const onClickDeleteNote = (id) => {
  //   setInterviewerSectionData((prev) =>
  //     prev.map((question) =>
  //       (question.questionId || question.id) === id
  //         ? { ...question, notesBool: false, note: "" }
  //         : question
  //     )
  //   );
  // };

  const onChangeRadioInput = (questionId, value) => {
    //<---v1.0.0-----
    if (isReadOnly) return;
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === questionId);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, isAnswered: value }
            : q,
        );
      }
      return [...prev, { questionId, isAnswered: value }];
    });
    //---v1.0.0----->
  };

  const onChangeDislikeRadioInput = (questionId, value) => {
    //<---v1.0.0-----
    // console.log("onChangeDislikeRadioInput", questionId, value);
    if (isReadOnly) return;
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === questionId);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, whyDislike: value, isLiked: "disliked" }
            : q,
        );
      }
      return [...prev, { questionId, whyDislike: value, isLiked: "disliked" }];
    });

    //---v1.0.0----->
  };

  const handleDislikeToggle = (id) => {
    if (isReadOnly) return;

    // Toggle dislikeQuestionId
    setDislikeQuestionId((prev) => (prev === id ? null : id));

    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);

      if (exists) {
        return prev.map((q) => {
          if ((q.questionId || q.id) === id) {
            // If already disliked, clear it
            if (q.isLiked === "disliked") {
              return {
                ...q,
                isLiked: "",
                whyDislike: "",
              };
            }
            // Otherwise, set to disliked
            return {
              ...q,
              isLiked: "disliked",
              whyDislike: q.whyDislike || "",
            };
          }
          return q;
        });
      }

      // If question doesn't exist in state, add it
      return [...prev, { questionId: id, isLiked: "disliked", whyDislike: "" }];
    });

    triggerAutoSave();
  };

  const handleLikeToggle = (id) => {
    if (isReadOnly) return; //<---v1.0.1-----
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? {
              ...q,
              isLiked: q.isLiked === "liked" ? "" : "liked",
              whyDislike: "", // Clear dislike reason when liking
            }
            : q,
        );
      }

      return [...prev, { questionId: id, isLiked: "liked", whyDislike: "" }];
    });

    //---v1.0.0----->
    if (dislikeQuestionId === id) setDislikeQuestionId(null);

    // Trigger auto-save
    triggerAutoSave();
  };

  const openQuestionBank = () => {
    setIsQuestionBankOpen(true);
  };

  // Component Functions
  const DisLikeSection = React.memo(({ each }) => {
    return (
      <>
        {!isReadOnly && (isEditMode || isAddMode) ? (
          <div className="border border-gray-500 w-full p-3 rounded-md mt-2">
            <div className="flex justify-between items-center mb-2">
              <h1>Tell us more :</h1>
              <button onClick={() => setDislikeQuestionId(null)}>
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <ul className="flex flex-wrap gap-3">
              {dislikeOptions.map((option) => (
                <li key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`dislike-${each.questionId || each.id}-${option.value}`}
                    name={`dislike-${each.questionId || each.id}`}
                    value={option.value}
                    checked={each.whyDislike === option.value}
                    className="accent-custom-blue"
                    onChange={(e) => {
                      onChangeDislikeRadioInput(
                        each.questionId || each.id,
                        e.target.value,
                      );
                    }}
                    disabled={isReadOnly}
                  />
                  <label
                    htmlFor={`dislike-${each.questionId || each.id}-${option.value
                      }`}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="w-full flex gap-x-8 gap-y-2 ">
            {each.whyDislike || "N/A"}
          </p>
        )}
      </>
    );
  });

  const SharePopupSection = () => {
    return (
      <Popup
        trigger={<button className="text-[#227a8a] font-bold">Share</button>}
        arrow={true}
        on={"hover"}
        position={"top center"}
        offsetY={5}
        arrowStyle={{
          color: "gray",
        }}
      >
        <p className="bg-[gray] text-xs text-white px-2 p-1 rounded-md">
          share with candidate
        </p>
      </Popup>
    );
  };

  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex flex-row items-center rounded-md my-2">
        <p className="text-sm font-bold text-gray-600 sm:mb-2 md:mb-2">
          Response Type{" "}
          {(each.mandatory === "true" ||
            each.snapshot?.mandatory === "true") && (
              <span className="text-[red]">*</span>
            )}
        </p>
        <div className={`grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3`}>
          {["Not Answered", "Partially Answered", "Fully Answered"].map(
            (option) => (
              <span key={option} className="flex items-center gap-2 pl-8 sm:pl-0">
                <input
                  checked={each.isAnswered === option}
                  value={option}
                  name={`isAnswered-${each.questionId || each.id}`}
                  type="radio"
                  id={`isAnswered-${each.questionId || each.id}-${option}`}
                  onChange={(e) =>
                    onChangeRadioInput(
                      each.questionId || each.id,
                      e.target.value,
                    )
                  }
                  disabled={isReadOnly}
                  className="accent-custom-blue whitespace-nowrap"
                />
                <label
                  htmlFor={`isAnswered-${each.questionId || each.id}-${option}`}
                  className="text-xs cursor-pointer"
                >
                  {option}
                </label>
              </span>
            ),
          )}
        </div>
      </div>
    );
  });

  const renderStarRating = (rating, setRating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              if (isReadOnly || !setRating) return;
              setRating(star);
              triggerAutoSave();
            }}
            disabled={isReadOnly || !setRating}
            className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              } ${isReadOnly || !setRating ? "cursor-default" : "hover:text-yellow-400 transition-colors cursor-pointer"}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    if (formData.skillRatings.length >= 10) {
      notify.error("Maximum 10 skills allowed");
      return;
    }
    hasUserInteractedWithSkills.current = true;
    setFormData((prev) => ({
      ...prev,
      skillRatings: [
        ...prev.skillRatings,
        { skillName: "", rating: 0, notes: "" },
      ],
    }));
    triggerAutoSave();
  };

  const handleRemoveSkill = (index) => {
    hasUserInteractedWithSkills.current = true;
    const updatedSkills = [...formData.skillRatings];
    updatedSkills.splice(index, 1);
    setFormData((prev) => ({ ...prev, skillRatings: updatedSkills }));

    // Also clear error if valid... (retaining existing logic)
    const validSkills = updatedSkills.filter(
      (s) => (s.skillName || s.skill || "").trim() !== "",
    );
    if (
      validSkills.length > 0 &&
      validSkills.every((skill) => skill.rating > 0)
    ) {
      clearError("skills");
    }
    triggerAutoSave();
  };

  const { mutate: createFeedback, isLoading: isCreating } = useCreateFeedback();
  const { mutate: updateFeedback, isLoading: isUpdating } = useUpdateFeedback();

  // Validation function
  const validateForm = () => {
    const newErrors = {
      overallRating: "",
      communicationRating: "",
      skills: "",
      comments: "",
      questions: "",
    };

    // Validate overall rating
    if (formData.overallRating === 0) {
      newErrors.overallRating = "Please provide an overall rating";
    }

    // Validate communication rating
    if (formData.communicationRating === 0) {
      newErrors.communicationRating = "Please provide a communication rating";
    }

    // Validate skills - filter out empty names first
    const validSkills = formData.skillRatings.filter(
      (s) => (s.skillName || s.skill) && (s.skillName || s.skill).trim() !== "",
    );
    if (
      validSkills.length === 0 ||
      validSkills.some((skill) => skill.rating === 0)
    ) {
      newErrors.skills = "Please provide ratings for all listed skills";
    }

    // Validate comments
    if (!formData.additionalComments.trim()) {
      newErrors.comments = "Please provide overall comments";
    }

    // Validate questions
    // if (interviewerSectionData.length === 0) {
    //   newErrors.questions = 'Please add at least one question from the question bank';
    // }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  // Clear specific error when user interacts with field
  const clearError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // Handle overall rating change
  const handleOverallRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, overallRating: rating }));
    if (rating > 0) {
      clearError("overallRating");
    }

    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode)) {
      triggerAutoSave();
    }
  };

  // Handle communication rating change
  const handleCommunicationRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, communicationRating: rating }));
    if (rating > 0) {
      clearError("communicationRating");
    }

    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode)) {
      triggerAutoSave();
    }
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, additionalComments: value }));
    if (value.trim()) {
      clearError("comments");
    }

    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode)) {
      triggerAutoSave();
    }
  };

  // Handle skill change with validation
  const handleSkillChange = (index, field, value) => {
    hasUserInteractedWithSkills.current = true;
    const updatedSkills = [...formData.skillRatings];
    updatedSkills[index][field] = value;
    setFormData((prev) => ({ ...prev, skillRatings: updatedSkills }));

    // Clear skills error if all skills are valid
    const validSkills = updatedSkills.filter(
      (s) => (s.skillName || s.skill || "").trim() !== "",
    );
    if (
      validSkills.length > 0 &&
      validSkills.every((skill) => skill.rating > 0)
    ) {
      clearError("skills");
    }
    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode) && !isReadOnly) {
      triggerAutoSave();
    }
  };

  // Initial submit handler - triggers confirmation popup
  const handleSubmitClick = () => {
    // Validate form locally first
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }
    setShowSubmitConfirmation(true);
  };

  const submitFeedback = async () => {
    try {
      setShowSubmitConfirmation(false);
      // console.log("🚀 Starting feedback submission...");
      // console.log(
      //   "📋 Preselected questions responses:",
      //   preselectedQuestionsResponses
      // );

      // Validate form locally first
      //      if (!validateForm()) {
      //        console.log("❌ Form validation failed");
      //        return;
      //      }

      // Prepare feedback payload
      const payload = {
        tenantId: currentTenantId || "",
        ownerId: currentOwnerId || "",
        interviewRoundId: interviewRoundId || urlData?.interviewRoundId || decodedData?.interviewRoundId || "",
        candidateId: candidateData?._id || "",
        positionId: positionId || positionData?._id || decodedData?.positionId || urlData?.positionId || "",
        interviewerId: interviewerId || decodedData?.interviewerId || urlData?.interviewerId || "",
        isMockInterview: isMockInterview || false,
        feedbackCode: feedbackDatas?.interviewRound?.interviewCode || "" + "-" + (feedbackDatas?.interviewRound?.sequence || ""),

        // Technical Skills (Categorized)
        technicalSkills: [
          ...formData.technicalSkills.strong.map(s => ({ skillName: s, level: 'strong', rating: 5, note: 'Strong' })),
          ...formData.technicalSkills.good.map(s => ({ skillName: s, level: 'good', rating: 4, note: 'Good' })),
          ...formData.technicalSkills.basic.map(s => ({ skillName: s, level: 'basic', rating: 3, note: 'Basic' })),
          ...formData.technicalSkills.noExperience.map(s => ({ skillName: s, level: 'noExperience', rating: 1, note: 'No Experience' })),
        ],

        // Technical Competency (Star Ratings)
        technicalCompetency: formData.skillRatings
          .filter(s => s.skillName?.trim())
          .map(s => ({ skillName: s.skillName, rating: s.rating || 0, notes: s.notes || "" })),

        // Questions Asked
        questionsAsked: finalQuestionFeedback.map(q => ({
          questionId: q.questionId || q._id || q.id,
          question: q.question,
          candidateAnswer: {
            answerType: toBackendAnswerType(q.isAnswered),
            submittedAnswer: q.answer || ""
          },
          interviewerFeedback: {
            liked: q.isLiked || "none",
            dislikeReason: q.whyDislike || "",
            note: q.note || ""
          },
          answered: q.isAnswered !== "Not Answered",
          notes: q.note || ""
        })),


        // Comments & Assessments
        strengths: formData.strengths.filter(s => s?.trim()),
        areasForImprovement: formData.areasForImprovement.filter(s => s?.trim()),
        additionalComments: formData.additionalComments,
        generalComments: formData.additionalComments,

        overallImpression: {
          overallRating: formData.overallRating || 0,
          recommendation: formData.recommendation || "Maybe",
          note: formData.additionalComments,
          cultureFit: formData.cultureFit || 0,
          willingnessToLearn: formData.willingnessToLearn || 0,
          communicationRating: formData.communicationRating || 0
        },
        status: "submitted"
      };

      if (isEditMode || autoSaveFeedbackId) {
        const fId = feedbackId || autoSaveFeedbackId;
        updateFeedback(
          { feedbackId: fId, feedbackData: payload },
          {
            onSuccess: (data) => {
              if (data.success) {
                notify.success("Feedback submitted successfully!");
              } else {
                notify.error("Failed to update feedback: " + data.message);
              }
            },
            onError: (error) => {
              notify.error("Failed to update feedback: " + error.message);
            },
          }
        );
      } else {
        createFeedback(payload, {
          onSuccess: (data) => {
            if (data.success) {
              notify.success("Feedback submitted successfully!");
              // Optionally, reset form or redirect
            } else {
              notify.error("Failed to submit feedback: " + data.message);
            }
          },
          onError: (error) => {
            notify.error("Failed to submit feedback: " + error.message);
          },
        });
      }


      if (interviewRoundData?.meetPlatform === "platform") {
        // const { leave } = useMeeting();
        // leave();
      }

      // navigate("/feedback");
    } catch (error) {
      console.error("💥 Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };
  // console.log("feedbackCandidate", feedbackCandidate);

  const saveFeedback = async () => {
    try {
      // console.log("💾 Starting draft save...");

      // Prepare feedback payload for draft
      const payload = {
        tenantId: currentTenantId || "",
        ownerId: currentOwnerId || "",
        interviewRoundId: interviewRoundId || urlData?.interviewRoundId || decodedData?.interviewRoundId || "",
        candidateId: candidateData?._id || "",
        positionId: positionId || positionData?._id || decodedData?.positionId || urlData?.positionId || "",
        interviewerId: interviewerId || decodedData?.interviewerId || urlData?.interviewerId || "",
        isMockInterview: isMockInterview || false,
        feedbackCode: feedbackDatas?.interviewRound?.interviewCode || "" + "-" + (feedbackDatas?.interviewRound?.sequence || ""),

        // Technical Skills (Categorized)
        technicalSkills: [
          ...formData.technicalSkills.strong.map(s => ({ skillName: s, level: 'strong', rating: 5, note: 'Strong' })),
          ...formData.technicalSkills.good.map(s => ({ skillName: s, level: 'good', rating: 4, note: 'Good' })),
          ...formData.technicalSkills.basic.map(s => ({ skillName: s, level: 'basic', rating: 3, note: 'Basic' })),
          ...formData.technicalSkills.noExperience.map(s => ({ skillName: s, level: 'noExperience', rating: 1, note: 'No Experience' })),
        ],

        // Technical Competency (Star Ratings)
        technicalCompetency: formData.skillRatings
          .filter(s => s.skillName?.trim())
          .map(s => ({ skillName: s.skillName, rating: s.rating || 0, notes: s.notes || "" })),

        // Questions Asked
        questionsAsked: finalQuestionFeedback.map(q => ({
          questionId: q.questionId || q._id || q.id,
          question: q.question,
          candidateAnswer: {
            answerType: toBackendAnswerType(q.isAnswered),
            submittedAnswer: q.answer || ""
          },
          interviewerFeedback: {
            liked: q.isLiked || "none",
            dislikeReason: q.whyDislike || "",
            note: q.note || ""
          },
          answered: q.isAnswered !== "Not Answered",
          notes: q.note || ""
        })),


        // Comments & Assessments
        strengths: formData.strengths.filter(s => s?.trim()),
        areasForImprovement: formData.areasForImprovement.filter(s => s?.trim()),
        additionalComments: formData.additionalComments,
        generalComments: formData.additionalComments,

        overallImpression: {
          overallRating: formData.overallRating || 0,
          recommendation: formData.recommendation || "Maybe",
          note: formData.additionalComments,
          cultureFit: formData.cultureFit || 0,
          willingnessToLearn: formData.willingnessToLearn || 0,
          communicationRating: formData.communicationRating || 0
        },
        status: "draft"
      };

      if (isEditMode || autoSaveFeedbackId) {
        const fId = feedbackId || autoSaveFeedbackId;
        if (fId) {
          updateFeedback(
            { feedbackId: fId, feedbackData: payload },
            {
              onSuccess: (data) => {
                if (data.success) {
                  notify.success("Feedback saved successfully!");
                  if (isEditMode) navigate("/feedback");
                } else {
                  notify.error("Failed to save feedback: " + data.message);
                }
              },
              onError: (error) => {
                notify.error("Failed to save feedback: " + error.message);
              },
            }
          );
        } else {
          notify.error("No feedback ID found, cannot save draft.");
        }
      } else {
        createFeedback(payload, {
          onSuccess: (data) => {
            if (data.success) {
              if (data.data?._id) {
                setAutoSaveFeedbackId(data.data._id);
              }
              notify.success("Feedback saved as draft!");
            } else {
              notify.error("Failed to save feedback as draft: " + data.message);
            }
          },
          onError: (error) => {
            notify.error("Failed to save feedback as draft: " + error.message);
          },
        });
      }
    } catch (error) {
      console.error("💥 Error saving draft:", error);
      alert("Failed to save draft. Please try again.");
    }
  };

  // console.log("feedbackDatas", feedbackDatas)

  //<---v1.0.2-----Ranjith----solved feedback issues

  if (urlData?.isSchedule || isViewMode) {
    return <SchedulerViewMode feedbackData={schedulerFeedbackData || feedbackDatas} />;
  }

  //<---v1.0.2-----Ranjith----solved feedback issues

  // Add visual indicator for auto-saving at the bottom of your return statement
  // Before the closing </div> of your main container (around line 1100):

  // Button component for consistency
  // const Button = ({
  //   children,
  //   onClick,
  //   variant = "default",
  //   size = "default",
  //   className = "",
  //   style = {},
  //   disabled = false,
  //   type = "button",
  // }) => {
  //   const baseClasses =
  //     "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  //   const variants = {
  //     default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  //     outline:
  //       "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  //     ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
  //   };
  //   const sizes = {
  //     sm: "px-3 py-1.5 text-sm",
  //     default: "px-4 py-2 text-sm",
  //   };

  //   return (
  //     <button
  //       type={type}
  //       onClick={onClick}
  //       disabled={disabled}
  //       className={`${baseClasses} ${variants[variant]} ${sizes[size]
  //         } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  //       style={style}
  //     >
  //       {children}
  //     </button>
  //   );
  // };

  return (
    // v1.0.4 <----------------------------------------------------------------------
    <>
      {!custom && isAddMode && (
        <div className="right-4 z-40  pb-3 top-5">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  feedbackDatas?.interviewRound?.meetingId,
                  // decodedData.meetLink,
                  "_blank",
                )
              }
              className="text-sm bg-custom-blue hover:bg-custom-blue/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        </div>
      )}

      {/* v1.0.3 <--------------------------------------------------------- */}
      <div
        className="bg-white px-6 pt-6 pb-20"
      // className="bg-white rounded-lg sm:px-3 px-6 py-6 shadow-sm pb-20 mb-8"
      >
        {/* v1.0.3 ---------------------------------------------------------> */}
        {/* <div className="flex items-center mb-6">
          <FileText
            className="h-5 w-5 mr-2"
            style={{ color: "rgb(33, 121, 137)" }}
          />
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
            Interview Feedback
          </h3>
        </div> */}

        <div className="grid grid-cols-1 space-y-5">
          {/* -------------------------------NEW UI----------------------------------- */}
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={formData.candidateName}
                  className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                  placeholder="Enter candidate name"
                />
              </div>

              {urlData?.interviewType !== "mockinterview" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={formData.position}
                    className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Round Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={formData.roundTitle}
                  className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                  placeholder="e.g., Technical Screening, System Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={true}
                  value={fullName}
                  className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  disabled={true}
                  value={formData.interviewDate}
                  className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                />
              </div>
              {urlData?.interviewType === "mockinterview" && (
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled
                      checked={formData.isMockInterview}
                      onChange={(e) => setFormData({ ...formData, isMockInterview: e.target.checked })}
                      className="w-4 h-4 accent-custom-blue text-[rgb(33,121,137)] border-gray-300 rounded focus:ring-[rgb(33,121,137)]"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      This is a Mock Interview
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Technical Skills Assessment */}
          <div className="border-t border-gray-200 pt-8">
            <TechnicalSkillsAssessment
              formData={formData}
              setFormData={setFormData}
              onSkillChange={triggerAutoSave}
              isReadOnly={isReadOnly}
            />
          </div>




          {/* <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions Asked</h3>
              <button
                type="button"
                onClick={addQuestion}
                style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
            <div className="space-y-4">
              {formData.questionsAsked.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="e.g., Implement a binary search tree"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent bg-white"
                    />
                    {formData.questionsAsked.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mb-3 flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={q.answered === true}
                        onChange={() => updateQuestion(index, 'answered', true)}
                        className="w-4 h-4 accent-custom-blue border-gray-300 focus:ring-custom-blue"
                      />
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2 mr-1" />
                      <span className="text-sm text-gray-700">Answered</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={q.answered === false}
                        onChange={() => updateQuestion(index, 'answered', false)}
                        className="w-4 h-4 accent-custom-blue border-gray-300 focus:ring-custom-blue"
                      />
                      <XCircle className="w-4 h-4 text-red-600 ml-2 mr-1" />
                      <span className="text-sm text-gray-700">Not Answered</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={q.notes}
                      onChange={(e) => updateQuestion(index, 'notes', e.target.value)}
                      rows="2"
                      placeholder="How did the candidate approach this question?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Skill Ratings */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Technical Competency Ratings</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addSkillRating}
                  style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              )}
            </div>
            <div className="space-y-4">
              {formData.skillRatings.map((skill, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="text"
                        value={skill.skillName}
                        readOnly={isReadOnly}
                        onChange={(e) => updateSkillRating(index, 'skillName', e.target.value)}
                        placeholder="e.g., Problem Solving, Coding Skills"
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent bg-white'}`}
                      />
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={skill.rating}
                          isReadOnly={isReadOnly}
                          onChange={(rating) => updateSkillRating(index, 'rating', rating)}
                        />
                        <span className="text-sm text-gray-600 min-w-[50px]">
                          {skill.rating > 0 ? `${skill.rating}/5` : 'Rate'}
                        </span>
                      </div>
                    </div>
                    {!isReadOnly && formData.skillRatings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillRating(index)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <textarea
                      value={skill.notes}
                      readOnly={isReadOnly}
                      onChange={(e) => updateSkillRating(index, 'notes', e.target.value)}
                      rows="2"
                      placeholder="Provide specific observations about this skill..."
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent bg-white'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Questions Asked */}
          <div className="flex sm:flex-row sm:items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Questions Asked
              </label>
              <span className="text-xs text-gray-500 mt-1 block">
                {questionsWithFeedback.length} question(s) from question bank
              </span>
            </div>
            {!isReadOnly && (
              <Button
                className="flex items-center gap-2 bg-custom-blue text-white hover:bg-custom-blue/90 font-medium"
                onClick={openQuestionBank}
                title="Add Question from Question Bank"
              // disabled={decodedData?.schedule}
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
                <span className="sm:hidden inline">Question</span>
              </Button>
            )}
          </div>


          {isReadOnly ? (
            // VIEW MODE - Read-only display
            <div className="space-y-4">
              {questionsWithFeedback?.length > 0 ? (
                questionsWithFeedback.map((question) => (
                  <QuestionCard
                    key={question.questionId || question.id}
                    question={question}
                    mode="view"
                    onLikeToggle={handleLikeToggle}
                    onDislikeToggle={handleDislikeToggle}
                    DisLikeSection={DisLikeSection}
                    dislikeQuestionId={dislikeQuestionId}
                  />
                ))
              ) : (
                <EmptyState
                  message="No questions available"
                  subMessage="Questions with feedback will appear here"
                />
              )}
            </div>
          ) : (
            // EDIT/ADD MODE - Interactive display
            <div className="space-y-4">
              {questionsToRender?.length > 0 ? (
                questionsToRender.map((question) => (
                  <QuestionCard
                    key={question.questionId || question.id}
                    question={question}
                    mode={isReadOnly ? 'view' : 'edit'}
                    onNoteAdd={onClickAddNote}
                    onNoteChange={onChangeInterviewQuestionNotes}
                    onLikeToggle={handleLikeToggle}
                    onDislikeToggle={handleDislikeToggle}
                    DisLikeSection={DisLikeSection}
                    dislikeQuestionId={dislikeQuestionId}
                    RadioGroupInput={RadioGroupInput}
                    SharePopupSection={SharePopupSection}
                    isViewMode={isReadOnly}
                  />
                ))
              ) : (
                <EmptyState
                  message="No questions selected from question bank"
                  subMessage="Go to 'Interview Questions' tab to add questions from the question bank"
                  icon="FileText"
                />
              )}
            </div>
          )}


          {/* Strengths */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
                <p className="text-sm text-gray-600 mt-0.5">What did the candidate do well?</p>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addStrength}
                  style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Strength
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={strength}
                    readOnly={isReadOnly}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    placeholder="e.g., Strong problem-solving approach, Excellent communication skills"
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent'}`}
                  />
                  {!isReadOnly && formData.strengths.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStrength(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
                <p className="text-sm text-gray-600 mt-0.5">What could the candidate work on?</p>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addArea}
                  style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Area
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.areasForImprovement.map((area, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={area}
                    readOnly={isReadOnly}
                    onChange={(e) => updateArea(index, e.target.value)}
                    placeholder="e.g., Needs to work on time complexity analysis, Could improve code organization"
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent'}`}
                  />
                  {!isReadOnly && formData.areasForImprovement.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArea(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Ratings */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Ratings</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Culture Fit</label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.cultureFit}
                    onChange={(rating) => setFormData({ ...formData, cultureFit: rating })}
                    isReadOnly={isReadOnly}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.cultureFit > 0 ? `${formData.cultureFit}/5` : 'Not rated'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Willingness to Learn</label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.willingnessToLearn}
                    onChange={(rating) => setFormData({ ...formData, willingnessToLearn: rating })}
                    isReadOnly={isReadOnly}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.willingnessToLearn > 0 ? `${formData.willingnessToLearn}/5` : 'Not rated'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Rating</label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.communicationRating}
                    onChange={(rating) => setFormData({ ...formData, communicationRating: rating })}
                    isReadOnly={isReadOnly}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.communicationRating > 0 ? `${formData.communicationRating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.overallRating}
                    onChange={(rating) => setFormData({ ...formData, overallRating: rating })}
                    size="lg"
                    isReadOnly={isReadOnly}
                  />
                  <span className="text-sm text-gray-600">
                    {formData.overallRating > 0 ? `${formData.overallRating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recommendation}
                  disabled={isReadOnly}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent'}`}
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Maybe">Maybe</option>
                  <option value="No Hire">No Hire</option>
                  <option value="Strong No Hire">Strong No Hire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Comments</h3>
            <p className="text-sm text-gray-600 mb-4">Any other observations or feedback</p>
            <textarea
              value={formData.additionalComments}
              readOnly={isReadOnly}
              onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
              rows="4"
              placeholder="Share any additional thoughts, observations, or context that would be helpful for the hiring decision..."
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isReadOnly ? 'bg-gray-50' : 'focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent'}`}
            />
          </div>
          {/* -------------------------------NEW UI----------------------------------- */}


          {/* <div className="bg-gray-50 p-4 gap-4 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 rounded-lg">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating{" "}
                {!isReadOnly && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center flex-wrap gap-2">
                {renderStarRating(overallRating, handleOverallRatingChange)}
                <span className="ml-2 text-sm text-gray-600">
                  {overallRating}/5
                </span>
              </div>
              {errors.overallRating && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.overallRating}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Communication Rating{" "}
                {!isReadOnly && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center flex-wrap gap-2">
                {renderStarRating(
                  communicationRating,
                  handleCommunicationRatingChange,
                )}
                <span className="ml-2 text-sm text-gray-600">
                  {communicationRating}/5
                </span>
              </div>
              {errors.communicationRating && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.communicationRating}
                </p>
              )}
            </div>
          </div> */}

          {/* <div>
            <div className="flex w-full items-center justify-between mb-4">
         
              <div className="flex flex-col">
                <p className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  Skill Ratings
                  {!isReadOnly && <span className="text-red-500">*</span>}
                </p>
                
                <span className="text-xs text-gray-600">
                  {skillRatings.length} / 10 Skills
                </span>
              </div>

              {!isReadOnly && !urlData?.isSchedule && (
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  // className="flex items-center text-sm bg-custom-blue text-white hover:bg-custom-blue/90 transition-colors"
                  disabled={skillRatings.length >= 10}
                  className={`flex items-center text-sm transition-colors ${skillRatings.length >= 10
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-custom-blue hover:bg-custom-blue/90"
                    } text-white`}
                >
                  <Plus className="h-4 w-4 mr-1 text-white" />
                  Add Skill
                </Button>
              )}
            </div>

            {isReadOnly ? (
              <div className="space-y-3">
                {skillRatings.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Skill</span>
                        <div className="text-sm font-medium text-gray-800">{skill.skill}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Rating</span>
                        <div className="flex items-center">
                          {renderStarRating(skill.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {skill.rating}/5
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Comments</span>
                        <div className="text-sm text-gray-600">
                          {skill.comments || "No comments"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {skillRatings.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 items-start">
                 
                      <div>
                        <label className="block text-xs text-gray-500 mb-1 lg:hidden">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          value={skill.skill}
                          onChange={(e) =>
                            handleSkillChange(index, "skill", e.target.value)
                          }
                          placeholder="Skill name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent"
                        // className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1 lg:hidden">
                          Rating
                        </span >
                        <div className="flex items-center">
                          {renderStarRating(skill.rating, (rating) =>
                            handleSkillChange(index, "rating", rating),
                          )}
                          <span className="ml-2 text-sm text-gray-600">
                            {skill.rating}/5
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <span className="block text-xs text-gray-500 mb-1 lg:hidden">
                          Comments (optional)
                        </span >
                        <input
                          type="text"
                          value={skill.comments || ""}
                          onChange={(e) =>
                            handleSkillChange(index, "comments", e.target.value)
                          }
                          placeholder="Comments (optional)"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent"
                        // className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                       
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div> */}




          {/* Comments Section */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Comments{" "}
              {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            {isReadOnly ? (
              <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded-md">
                {comments || "Not Provided"}
              </div>
            ) : (
              <div>
                <DescriptionField
                  rows={4}
                  value={comments}
                  onChange={handleCommentsChange}
                  maxLength={1000}
                  placeholder="Provide overall feedback about the candidate's performance..."
                  error={errors.comments}
                />
              </div>
            )}
          </div> */}


          {/* Recommendation Section */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation{" "}
              {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            {isReadOnly ? (
              <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded-md">
                {recommendation || "Not Provided"}
              </div>
            ) : (
              <DropdownSelect
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "Maybe", label: "Maybe" },
                  { value: "No", label: "No" },
                ]}
                value={
                  [
                    { value: "Yes", label: "Yes" },
                    { value: "Maybe", label: "Maybe" },
                    { value: "No", label: "No" },
                  ].find((opt) => opt.value === recommendation) || null
                }
                disabled={isReadOnly || urlData?.isSchedule}
                onChange={(opt) => {
                  setRecommendation(opt?.value || "");
                  // to auto save comments change
                  // triggerAutoSave();
                  // IMMEDIATE auto-save
                  if (triggerAutoSave && (isAddMode || isEditMode)) {
                    triggerAutoSave();
                  }
                }}
                placeholder="Select Recommendation"
              />
            )}
          </div> */}

          {/* Action Buttons */}
          {!isReadOnly && !urlData?.isSchedule && (
            <div>
              {!urlData?.isSchedule && (
                <div className="flex justify-end items-center gap-3 mt-6">
                  {/* <Button
                    variant="outline"
                    className="border border-custom-blue text-custom-blue"
                  >
                    Cancel
                  </Button> */}
                  <Button
                    onClick={saveFeedback}
                    variant="outline"
                    className="border border-custom-blue text-custom-blue"
                  // disabled={decodedData.schedule}
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmitClick}
                    className="text-sm bg-custom-blue text-white hover:bg-custom-blue/90"
                  // disabled={decodedData.schedule}
                  >
                    Submit Feedback
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirmation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Conformation
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to submit this feedback? Once submitted, you won't be able to make any further changes.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSubmitConfirmation(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFeedback}
                    className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg focus:outline-none   shadow-sm transition-all hover:shadow-md"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QuestionBank Modal */}
        {isQuestionBankOpen && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center min-h-screen z-50"
            onClick={() => setIsQuestionBankOpen(false)}
          >
            <div
              className="bg-white rounded-md w-[96%] max-h-[90vh] overflow-y-auto sm:px-2  px-4 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              {urlData?.isSchedule ? null : (
                <div className="py-3 px-4 flex items-center justify-between">
                  <h2 className="text-xl text-custom-blue font-semibold">
                    Add Interview Question
                  </h2>
                  <button>
                    <X
                      className="text-2xl text-red-500"
                      onClick={() => setIsQuestionBankOpen(false)}
                    />
                  </button>
                </div>
              )}
              {/* QuestionBank Content */}
              <div className="flex-1 overflow-hidden">
                <QuestionBank
                  interviewQuestionsLists={[...interviewerSectionData, ...preselectedQuestionsResponses] || []}
                  type="feedback"
                  fromScheduleLater={true}
                  onAddQuestion={handleAddQuestionToRound}
                  handleRemoveQuestion={handleRemoveQuestion}
                  handleToggleMandatory={handleToggleMandatory}
                  removedQuestionIds={removedQuestionIds}
                  closeQuestionBank={() => setIsQuestionBankOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div >

      {/* {isAddMode && autoSaveQuestions && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Auto-saving...</span>
          </div>
        </div>
      )} */}
    </>
    // v1.0.4 ---------------------------------------------------------------------->
  );
};

// To:
export default FeedbackForm;
export { flattenQuestionFeedback };
