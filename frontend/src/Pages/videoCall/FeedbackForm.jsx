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
  if (ui === "Not Answered") return "incorrect";
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

  // console.log("positionData", positionData)

  // console.log("positioncandidateDataData", candidateData)

  const feedbackData = useMemo(() => {
    const raw = locationFeedback || feedbackDatas || {};
    // If the API response has a feedbacks array, merge the first feedback's
    // fields into the top level so code can read feedbackData.questionFeedback,
    // feedbackData.skills, feedbackData.overallImpression, etc. directly.
    if (Array.isArray(raw?.feedbacks) && raw.feedbacks.length > 0) {
      const fb = raw.feedbacks[0];
      return {
        ...raw,
        _id: fb._id,
        questionFeedback: flattenQuestionFeedback(fb.questionFeedback),
        skills: fb.skills,
        overallImpression: fb.overallImpression,
        generalComments: fb.generalComments,
        status: fb.status,
      };
    }
    return raw;
  }, [locationFeedback, feedbackDatas]);

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

  // Fixed: Proper initialization for overall rating with proper fallbacks
  const [overallRating, setOverallRating] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData?.overallRating
      : 0,
  );

  // Fixed: Proper initialization for communication rating with proper fallbacks
  const [communicationRating, setCommunicationRating] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData?.communicationRating
      : 0,
  );
  // console.log("skillsData", overallImpressionTabData);

  // Fixed: Proper initialization for skill ratings with proper conditional checks
  const initialSkillRatings = useMemo(() => {
    // 1. If we have a persisted feedback record with saved skills, use them.
    // This handles Edit/View modes AND Add mode after auto-save when skills have been saved.
    if (feedbackData?._id && skillsData && skillsData.length > 0) {
      return skillsData.map((skill) => ({
        skill: skill.skillName,
        rating: skill.rating,
        comments: skill.note,
      }));
    }

    // 2. Auto-populate from position/candidate data.
    // This runs for fresh Add Mode (no ID yet) AND when feedback exists but
    // has no saved skills yet (e.g. after auto-save created the record from adding questions).
    let autoSkills = [];

    // Mock Interview: Skills often in candidateData.skills (array of strings)
    if (isMockInterview && candidateData?.skills) {
      autoSkills = candidateData.skills;
    }
    // Regular Interview: Skills in positionData.skills (array of objects)
    else if (!isMockInterview && positionData?.skills) {
      // Map from position skill objects to string names
      autoSkills = positionData.skills.map(s => s.skill);
    }

    if (autoSkills.length > 0) {
      return autoSkills.map(skillName => ({
        skill: skillName,
        rating: 0,
        comments: ""
      }));
    }

    // Default fallback
    return [{ skill: "", rating: 0, comments: "" }];
  }, [feedbackData?._id, skillsData, isMockInterview, candidateData, positionData]);

  // const [skillRatings, setSkillRatings] = useState(initialSkillRatings);
  // changed to allow only 5 skills populated initially
  const [skillRatings, setSkillRatings] = useState(() => {
    return initialSkillRatings.slice(0, 5);
  });

  // Track if user has interacted with skills to prevents overwriting user work with async loaded data
  const hasUserInteractedWithSkills = useRef(false);
  // Track if we have already synced with the persistence layer once
  const hasLoadedSavedSkills = useRef(false);

  // Sync state if initialSkillRatings changes (mainly for async data loading)
  useEffect(() => {
    // If we have saved data (via ID) and we haven't synced yet, AND user hasn't touched the form manually
    if (feedbackData?._id && !hasLoadedSavedSkills.current && !hasUserInteractedWithSkills.current) {
      // When loading existing feedback, we show what was saved (up to 10)
      // but if it's a fresh load, we apply the 5 limit
      const limitedSkills = initialSkillRatings.slice(0, 5);
      // setSkillRatings(initialSkillRatings);
      setSkillRatings(limitedSkills);
      hasLoadedSavedSkills.current = true;
    }
    // Fallback: If current state is empty/default, always accept incoming data
    else if ((!skillRatings || (skillRatings.length === 1 && !skillRatings[0].skill)) && initialSkillRatings.length > 0 && initialSkillRatings[0].skill) {
      // setSkillRatings(initialSkillRatings);
      setSkillRatings(initialSkillRatings.slice(0, 5));
    }
  }, [initialSkillRatings, feedbackData?._id]);

  // Fixed: Proper initialization for recommendation with proper fallbacks
  const [recommendation, setRecommendation] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData.recommendation || "Maybe"
      : "Maybe",
  );

  // General comments uses feedbackData.generalComments directly
  const [comments, setComments] = useState(
    isEditMode || isViewMode || isAddMode
      ? feedbackData?.generalComments || ""
      : "",
  );

  // Re-sync scalar feedback values on initial load only
  const hasScalarInitRef = useRef(false);

  useEffect(() => {
    if (hasScalarInitRef.current) return; // Already synced
    if (!feedbackData?._id) return; // Skip until data is loaded
    hasScalarInitRef.current = true;

    const impression = feedbackData?.overallImpression || {};
    const skills = feedbackData?.skills || [];

    setOverallRating((prev) => prev || impression.overallRating || 0);
    setCommunicationRating((prev) => prev || impression.communicationRating || 0);
    setRecommendation((prev) => (prev && prev !== "Maybe") ? prev : (impression.recommendation || "Maybe"));
    setComments((prev) => prev || feedbackData?.generalComments || "");

    if (skills.length > 0) {
      setSkillRatings((prev) => {
        if (prev.length === 1 && !prev[0].skill && prev[0].rating === 0) {
          return skills.map((s) => ({
            skill: s.skillName,
            rating: s.rating,
            comments: s.note,
          }));
        }
        return prev;
      });
    }
  }, [feedbackData]);

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

    console.log("allQuestions", allQuestions);

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



  // Final list of questions to render in the interviewer section

  console.log("questionsWithFeedback", questionsWithFeedback)

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

  const {
    saveNow: autoSaveQuestions,
    // saveNow,
    // : autoSaveQuestions,
    // isSaving: autoSaveQuestions,
    // triggerAutoSave,
  } = useAutoSaveFeedback({
    isAddMode,
    isEditMode,
    interviewRoundId:
      interviewRoundId ||
      urlData?.interviewRoundId ||
      decodedData?.interviewRoundId,
    tenantId: currentTenantId,
    interviewerId:
      interviewerId || decodedData?.interviewerId || urlData?.interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    overallRating,
    communicationRating,
    recommendation,
    comments,
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
      urlData?.interviewType === "mockinterview" ? interviewRoundData?.mockInterviewCode + "-001" :
        (interviewRoundData?.interviewCode
          ? `${interviewRoundData.interviewCode}-00${interviewRoundData?.rounds?.[0]?.sequence || ""}`
          : "") || "",
    isLoaded: !feedbackLoading && !isMockLoading && !isInterviewLoading, // Ensure we don't save before data is loaded
  });

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
              setRating(star);
              triggerAutoSave();
            }}
            disabled={isReadOnly}
            className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    if (skillRatings.length >= 10) {
      notify.error("Maximum 10 skills allowed");
      return;
    }
    hasUserInteractedWithSkills.current = true;
    setSkillRatings([
      ...skillRatings,
      { skill: "", rating: 0, comments: "" },
    ]);
    triggerAutoSave();
  };

  const handleRemoveSkill = (index) => {
    hasUserInteractedWithSkills.current = true;
    const updatedSkills = [...skillRatings];
    updatedSkills.splice(index, 1);
    setSkillRatings(updatedSkills);

    // Also clear error if valid... (retaining existing logic)
    const validSkills = updatedSkills.filter(s => s.skill.trim() !== "");
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
    if (overallRating === 0) {
      newErrors.overallRating = "Please provide an overall rating";
    }

    // Validate communication rating
    if (communicationRating === 0) {
      newErrors.communicationRating = "Please provide a communication rating";
    }

    // Validate skills - filter out empty names first
    const validSkills = skillRatings.filter(s => s.skill && s.skill.trim() !== "");
    if (
      validSkills.length === 0 ||
      validSkills.some((skill) => skill.rating === 0)
    ) {
      newErrors.skills =
        "Please provide ratings for all listed skills";
    }

    // Validate comments
    if (!comments.trim()) {
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
    setOverallRating(rating);
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
    setCommunicationRating(rating);
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
    setComments(e.target.value);
    if (e.target.value.trim()) {
      clearError("comments");
    }

    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode)) {
      triggerAutoSave();
    }
    // to auto save comments change
    // triggerAutoSave();
  };

  // Handle skill change with validation
  const handleSkillChange = (index, field, value) => {
    hasUserInteractedWithSkills.current = true;
    const updatedSkills = [...skillRatings];
    updatedSkills[index][field] = value;
    setSkillRatings(updatedSkills);

    // Clear skills error if all skills are valid
    const validSkills = updatedSkills.filter(s => s.skill.trim() !== "");
    if (
      validSkills.length > 0 &&
      validSkills.every((skill) => skill.rating > 0)
    ) {
      clearError("skills");
    }
    // IMMEDIATE auto-save
    if (triggerAutoSave && (isAddMode || isEditMode)) {
      triggerAutoSave();
    }
    // triggerAutoSave();
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

      // Prepare feedback data
      const feedbackData = {
        type: "submit",
        tenantId: currentTenantId || "",
        ownerId: currentOwnerId || "",
        interviewRoundId:
          interviewRoundId ||
          urlData?.interviewRoundId ||
          decodedData?.interviewRoundId ||
          "",
        candidateId: candidateData?._id || "",
        feedbackCode:
          feedbackDatas?.interviewRound?.interviewCode ||
          "" + "-" + (feedbackDatas?.interviewRound?.sequence || ""),
        positionId:
          positionId ||
          positionData?._id ||
          decodedData?.positionId ||
          urlData?.positionId ||
          "",
        interviewerId:
          interviewerId ||
          decodedData?.interviewerId ||
          urlData?.interviewerId ||
          "",
        skills: skillRatings
          .filter(skill => skill.skill && skill.skill.trim() !== "") // Filter empty skills
          .map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments || "",
          })),
        questionFeedback: [
          // Interviewer section questions
          ...interviewerSectionData.map((question) => ({
            // Send full object for interviewer-added to preserve snapshot on server
            questionId: question,
            candidateAnswer: {
              answerType: toBackendAnswerType(question.isAnswered),
              submittedAnswer: "",
            },
            interviewerFeedback: {
              liked: question.isLiked || "none",
              note: question.note || "",
              dislikeReason: question.whyDislike || "",
            },
          })),
          // Preselected questions responses
          ...preselectedQuestionsResponses.map((response) => ({
            questionId:
              typeof response === "string"
                ? response
                : response?.questionId || response?.id || response?._id || "",
            candidateAnswer: {
              answerType: toBackendAnswerType(response.isAnswered),
              submittedAnswer: "",
            },
            interviewerFeedback: {
              liked: response.isLiked || "none",
              note: response.note || "",
              dislikeReason: response.whyDislike || "",
            },
          })),
        ],

        //         questionFeedback: filteredInterviewerQuestions.map(question => ({
        //           questionId: question, // Send the full question object
        //           candidateAnswer: {
        //             answerType: question.isAnswered || "not answered",
        //             submittedAnswer: ""
        //           },
        //           interviewerFeedback: {
        //             liked: question.isLiked || "none",
        //             note: question.note || "",
        //             dislikeReason: question.whyDislike || ""
        //           }
        //         })),

        generalComments: comments,
        overallImpression: {
          overallRating: overallRating,
          communicationRating: communicationRating,
          recommendation: recommendation,
          note: "",
        },
      };

      // Validate with backend before submission (optional - can be enabled)
      // try {
      //   const validationResponse = await axios.post(
      //     `${config.REACT_APP_API_URL}/feedback/validate`,
      //     feedbackData,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${authToken}`,
      //         "Content-Type": "application/json",
      //       },
      //     },
      //   );

      //   if (!validationResponse.data.success) {
      //     console.log(
      //       "❌ Backend validation failed",
      //       validationResponse.data.errors,
      //     );
      //     // Update error state with backend errors
      //     if (validationResponse.data.errors) {
      //       setErrors((prevErrors) => ({
      //         ...prevErrors,
      //         ...validationResponse.data.errors,
      //       }));
      //     }
      //     alert("Validation failed. Please check the form.");
      //     return;
      //   }
      // } catch (validationError) {
      //   // If backend validation fails, continue with frontend validation only
      //   console.warn(
      //     "Backend validation unavailable, proceeding with frontend validation only",
      //     validationError,
      //   );
      // }

      const updatedFeedbackData = {
        overallRating,
        skills: skillRatings
          .filter(skill => skill.skill && skill.skill.trim() !== "")
          .map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments,
          })),
        questionFeedback: finalQuestionFeedback,
        generalComments: comments,
        overallImpression: {
          overallRating,
          communicationRating,
          recommendation,
          note: comments,
        },
        status: "submitted", // Mark as submitted
      };

      // console.log('📤 Update payload (submit):', updatedFeedbackData);

      // console.log('📤 Sending feedback data:', feedbackData);

      if (isEditMode || autoSaveFeedbackId) {
        if (feedbackId || autoSaveFeedbackId) {
          updateFeedback(
            { feedbackId, feedbackData: updatedFeedbackData },
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
            },
          );
        } else {
          notify.error("No feedback ID found, cannot update.");
        }
      } else {
        createFeedback(feedbackData, {
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
      console.log("💾 Starting draft save...");

      // Prepare feedback data for draft save
      const feedbackData = {
        type: "draft",
        tenantId: currentTenantId || "",
        ownerId: currentOwnerId || "",
        interviewRoundId:
          interviewRoundId ||
          urlData?.interviewRoundId ||
          decodedData?.interviewRoundId ||
          "",
        candidateId: candidateData?._id || "",
        positionId:
          positionId ||
          positionData?._id ||
          decodedData?.positionId ||
          urlData?.positionId ||
          "",
        interviewerId:
          interviewerId ||
          decodedData?.interviewerId ||
          "" ||
          urlData?.interviewerId ||
          "",
        skills: skillRatings
          .filter(skill => skill.skill && skill.skill.trim() !== "")
          .map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments || "",
          })),
        feedbackCode:
          feedbackDatas?.interviewRound?.interviewCode ||
          "" + "-" + feedbackDatas?.interviewRound?.sequence ||
          "",
        questionFeedback: [
          // Interviewer section questions
          ...interviewerSectionData.map((question) => ({
            // Send full object for interviewer-added to preserve snapshot on server
            questionId: question,
            candidateAnswer: {
              answerType: question.isAnswered || "not answered",
              submittedAnswer: "",
            },
            interviewerFeedback: {
              liked: question.isLiked || "none",
              note: question.note || "",
              dislikeReason: question.whyDislike || "",
            },
          })),
          // Preselected questions responses
          ...preselectedQuestionsResponses.map((response) => ({
            questionId:
              typeof response === "string"
                ? response
                : response?.questionId || response?.id || response?._id || "",
            candidateAnswer: {
              answerType: response.isAnswered || "not answered",
              submittedAnswer: "",
            },
            interviewerFeedback: {
              liked: response.isLiked || "none",
              note: response.note || "",
              dislikeReason: response.whyDislike || "",
            },
          })),
        ],

        //         questionFeedback: filteredInterviewerQuestions.map(question => ({
        //           questionId: question, // Send the full question object
        //           candidateAnswer: {
        //             answerType: question.isAnswered || "not answered",
        //             submittedAnswer: ""
        //           },
        //           interviewerFeedback: {
        //             liked: question.isLiked || "none",
        //             note: question.note || "",
        //             dislikeReason: question.whyDislike || ""
        //           }
        //         })),

        generalComments: comments,
        overallImpression: {
          overallRating: overallRating,
          communicationRating: communicationRating,
          recommendation: recommendation,
          note: "",
        },
        status: "draft", // Mark as draft
      };

      // Optional: Validate draft with backend (usually not needed for drafts)
      // Uncomment if you want to validate drafts too
      /*
      try {
        const validationResponse = await axios.post(
          `${config.REACT_APP_API_URL}/feedback/validate`,
          feedbackData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!validationResponse.data.success) {
          console.log("⚠️ Draft validation warnings", validationResponse.data.errors);
          // For drafts, we might just show warnings but not block saving
        }
      } catch (validationError) {
        console.warn("Backend validation unavailable for draft", validationError);
      }
      */

      const updatedFeedbackData = {
        overallRating,
        skills: skillRatings
          .filter(skill => skill.skill && skill.skill.trim() !== "")
          .map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments,
          })),
        questionFeedback: finalQuestionFeedback,
        generalComments: comments,
        overallImpression: {
          overallRating,
          recommendation,
          communicationRating,
          note: comments,
        },
        status: "draft", // Mark as draft
      };

      if (isEditMode || autoSaveFeedbackId) {
        if (feedbackId) {
          updateFeedback(
            { feedbackId, feedbackData: updatedFeedbackData },
            {
              onSuccess: (data) => {
                if (data.success) {
                  notify.success("Feedback saved  successfully!");
                } else {
                  notify.error(
                    "Failed to save feedback as draft: " + data.message,
                  );
                }
              },
              onError: (error) => {
                notify.error(
                  "Failed to save feedback as draft: " + error.message,
                );
              },
            },
          );

          if (isEditMode) {
            navigate("/feedback");
          }

          // if (isAddMode) {
          //   navigate("/feedback");
          // } else {


          // }
        } else {
          notify.error("No feedback ID found, cannot save draft.");
        }
      } else {
        createFeedback(feedbackData, {
          onSuccess: (data) => {
            if (data.success) {
              // Store feedback ID for auto-save
              if (data.data?._id) {
                setAutoSaveFeedbackId(data.data._id);
              }
              notify.success("Feedback saved as draft!");
              // navigate("/feedback");
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

          <div className="bg-gray-50 p-4 gap-4 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 rounded-lg">
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
          </div>

          <div>
            <div className="flex w-full items-center justify-between mb-4">
              {/* <p className="flex items-center gap-1 text-sm font-medium text-gray-700">
                Skill Ratings
                {!isReadOnly && <span className="text-red-500">*</span>}
              </p> */}
              <div className="flex flex-col">
                <p className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  Skill Ratings
                  {!isReadOnly && <span className="text-red-500">*</span>}
                </p>
                {/* Step 3: Display the counter */}
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
                      {/* Skill Name */}
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
                      {/* Comments Input */}
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
                        {/* <Button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={skillRatings.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>


          <div className="flex sm:flex-row sm:items-center justify-between">
            {/* v1.0.3 <-------------------------------------------------------- */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Questions Asked
              </label>
              <span className="text-xs text-gray-500 mt-1 block">
                {questionsWithFeedback.length} question(s) from question bank
              </span>
            </div>
            {/* v1.0.3 --------------------------------------------------------> */}
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

          {/* {isViewMode ? (
            <>
              {questionsWithFeedback?.length > 0
                ? questionsWithFeedback.map((question) => (
                  <div
                    key={question.questionId || question.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                        {question.snapshot?.technology?.[0] ||
                          question.snapshot?.snapshot?.technology?.[0] ||
                          question.snapshot?.category?.[0] ||
                          question.snapshot?.snapshot?.category?.[0] ||
                          "N/A"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.snapshot?.difficultyLevel ||
                          question.snapshot?.snapshot?.difficultyLevel ||
                          question.difficulty ||
                          "N/A"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2">
                      {question.snapshot?.questionText ||
                        question.snapshot?.snapshot?.questionText ||
                        question.question ||
                        "N/A"}
                    </h3>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Expected Answer:
                      </p>
                      <p className="text-sm text-gray-700">
                        {question.snapshot?.correctAnswer ||
                          question.snapshot?.snapshot?.correctAnswer ||
                          question.expectedAnswer ||
                          "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                      <span>
                        Mandatory:{" "}
                        {question.mandatory === "true" ||
                          question.snapshot?.mandatory === "true"
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`transition-transform hover:scale-110 duration-300 ease-in-out ${question.isLiked === "liked" ? "text-green-700" : ""
                          }`}
                        onClick={() =>
                          handleLikeToggle(
                            question.questionId ||
                            question.id ||
                            question._id,
                          )
                        }
                        disabled={isReadOnly}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </span>
                      <span
                        className={`transition-transform hover:scale-110 duration-300 ease-in-out ${question.isLiked === "disliked"
                          ? "text-red-500"
                          : ""
                          }`}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleDislikeToggle(
                            question.questionId ||
                            question.id ||
                            question._id,
                          )
                        }
                        disabled={isReadOnly}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </span>
                    </div>
                    <div>
                     
                      {(dislikeQuestionId ===
                        (question.questionId ||
                          question.id ||
                          question._id) ||
                        (!!question.whyDislike &&
                          question.isLiked === "disliked")) && (
                          <DisLikeSection each={question} />
                        )}
                    </div>

                 
                    {question.notesBool && question.note && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Note:
                        </p>
                        <p className="text-sm text-gray-800">
                          {question.note}
                        </p>
                        {!isReadOnly && (
                          <p className="text-xs text-gray-400 mt-1">
                            {question.note.length}/250
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
                : null}
            </>
          ) : (
            <div className="space-y-4">
              {questionsToRender.map((question) => {
                return (
                  <div
                    key={question.questionId || question.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                        {
                          question?.snapshot?.technology?.[0] ||
                          question?.snapshot?.snapshot?.technology?.[0] ||
                          question?.snapshot?.category?.[0] ||
                          question?.snapshot?.snapshot?.category?.[0] ||
                          "N/A"
                        }
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.snapshot?.difficultyLevel ||
                          question.snapshot?.snapshot?.difficultyLevel ||
                          question.difficulty ||
                          "N/A"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {question.snapshot?.questionText ||
                        question.snapshot?.snapshot?.questionText ||
                        question.question ||
                        "N/A"}
                    </h3>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Expected Answer:
                      </p>
                      <p className="text-sm text-gray-700">
                        {question.snapshot?.correctAnswer ||
                          question.snapshot?.snapshot?.correctAnswer ||
                          question.expectedAnswer ||
                          "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                      <span>
                        Mandatory:{" "}
                        {question.mandatory === "true" ||
                          question.snapshot?.mandatory === "true"
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <RadioGroupInput each={question} />

                      <div className="flex items-center gap-4 mt-2">
                        <button
                          className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                          onClick={() =>
                            onClickAddNote(
                              question.questionId ||
                              question.id ||
                              question._id,
                            )
                          }
                        >
                          {question.notesBool ? "Delete Note" : "Add a Note"}
                         
                        </button>
                        <SharePopupSection />
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${question.isLiked === "liked" ? "text-green-700" : ""
                            }`}
                          onClick={() =>
                            handleLikeToggle(
                              question.questionId || question._id,
                            )
                          }
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </span>
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${question.isLiked === "disliked"
                            ? "text-red-500"
                            : ""
                            }`}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleDislikeToggle(
                              question.questionId || question._id,
                            )
                          }
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {question.notesBool && (
                      <div>
                        <div className="flex justify-start mt-4">
                          <label
                            htmlFor={`note-input-${question.questionId || question.id
                              }`}
                            className="w-[180px] font-bold text-gray-700"
                          >
                            Note
                          </label>
                          <div className="flex flex-col items-start w-full  h-[80px]">
                            <div className="w-full relative  rounded-md">
                              <input
                                className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                                id={`note-input-${question.questionId || question.id
                                  }`}
                                type="text"
                                value={question.note}
                                onChange={(e) =>
                                  onChangeInterviewQuestionNotes(
                                    question.questionId || question.id,
                                    e.target.value.slice(0, 250),
                                  )
                                }
                                placeholder="Add your note here"
                              />
                             
                            </div>
                            <span className="w-full text-sm text-right text-gray-500">
                              {question.note?.length || 0}/250
                            </span>
                            
                          </div>
                        </div>
                      </div>
                    )}

                    {(dislikeQuestionId ===
                      (question.questionId || question.id || question._id) ||
                      !!question.whyDislike) &&
                      question.isLiked === "disliked" && (
                        <DisLikeSection each={question} />
                      )}
                  </div>
                );
              })}
              {questionsToRender.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No questions selected from question bank
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Go to "Interview Questions" tab to add questions from the
                    question bank
                  </p>
                </div>
              )}
            </div>
          )} */}

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
                    mode="edit"
                    onNoteAdd={onClickAddNote}
                    onNoteChange={onChangeInterviewQuestionNotes}
                    onLikeToggle={handleLikeToggle}
                    onDislikeToggle={handleDislikeToggle}
                    DisLikeSection={DisLikeSection}
                    dislikeQuestionId={dislikeQuestionId}
                    RadioGroupInput={RadioGroupInput}
                    SharePopupSection={SharePopupSection}
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


          {/* Comments Section */}
          <div>
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
          </div>


          {/* Recommendation Section */}
          <div>
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
          </div>

          {/* Action Buttons */}
          {!isReadOnly && !urlData?.isSchedule && (
            <div>
              {!urlData?.isSchedule && (
                <div className="flex justify-end items-center gap-3 mt-6">
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
// // Add CSS for animation (add to your CSS file or styled components):
// /* Add CSS for animation (add to your CSS file or styled components): */

// /* Add to your main CSS file */
// @keyframes fade-in {
//   from {
//     opacity: 0;
//     transform: translateY(10px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// .animate-fade-in {
//   animation: fade-in 0.3s ease-in-out;
// }
