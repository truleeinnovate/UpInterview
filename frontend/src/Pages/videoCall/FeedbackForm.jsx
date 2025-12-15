//<---v1.0.0-----Venkatesh----solved edit mode issues
//<---v1.0.1-----Venkatesh----solved edit mode issues
//<---v1.0.2-----Ranjith----solved feedback issues
// v1.0.3 - Ashok - Improved responsiveness
// v1.0.4 - Ashok - fixed responsiveness issues

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  X,
  Video,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import Popup from "reactjs-popup";
import QuestionBank from "../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx";
import { config } from "../../config.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import axios from "axios";
import {
  useCreateFeedback,
  useUpdateFeedback,
} from "../../apiHooks/useFeedbacks";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock.js";
import { SchedulerViewMode } from "./SchedulerViewMode.jsx";
import DescriptionField from "../../Components/FormFields/DescriptionField.jsx";
import DropdownSelect from "../../Components/Dropdowns/DropdownSelect.jsx";
import { notify } from "../../services/toastService.js";

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
  interviewerSectionData = [],
  setInterviewerSectionData,
  interviewRoundId,
  candidateId,
  positionId,
  interviewerId,
  feedbackCandidate,
  // tenantId,
  isEditMode,
  isViewMode,
  preselectedQuestionsResponses = [],

  decodedData,
  isAddMode,
  isScheduler,
  schedulerFeedbackData,
}) => {
  // console.log("feedbackCandidate", isEditMode, isViewMode, isAddMode);
  useScrollLock(true);
  const location = useLocation();
  const locationFeedback = location.state?.feedback;
  const feedbackData = useMemo(() => {
    return locationFeedback || feedbackCandidate || {};
  }, [locationFeedback, feedbackCandidate]);
  // const feedbackData = React.useMemo(() => locationFeedback || {}, [locationFeedback]);
  const feedbackId = feedbackData._id || null;
  // const skillsData = feedbackData.skills || [];
  // const overallImpressionTabData = feedbackData.overallImpression || {};
  // console.log("feedbackData edit mode", feedbackData);
  // Fixed: Properly initialize skills data with fallback
  const skillsData = feedbackData.skills || [];

  // Fixed: Properly initialize overall impression data with fallback
  const overallImpressionTabData = feedbackData?.overallImpression || {};
  //  console.log("feedbackData edit mode", feedbackData);
  //  console.log("overallImpressionTabData",overallImpressionTabData?.overallRating,isAddMode);
  const navigate = useNavigate();

  // const [overallRating, setOverallRating] = useState(((isEditMode || isViewMode) && overallImpressionTabData.overallRating) || 0);
  // const [communicationRating, setCommunicationRating] = useState(((isEditMode || isViewMode) && overallImpressionTabData.communicationRating) || 0);
  // const [skillRatings, setSkillRatings] = useState(((isEditMode || isViewMode) && skillsData.map(skill => ({ skill: skill.skillName, rating: skill.rating, comments: skill.note }))) || [{ skill: '', rating: 0, comments: '' }]);

  // Fixed: Proper initialization for overall rating with proper fallbacks
  const [overallRating, setOverallRating] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData?.overallRating
      : 0
  );

  // console.log("overallImpressionTabData",overallRating);

  // Fixed: Proper initialization for communication rating with proper fallbacks
  const [communicationRating, setCommunicationRating] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData?.communicationRating
      : 0
  );
  console.log("skillsData", overallImpressionTabData);

  // Fixed: Proper initialization for skill ratings with proper conditional checks
  const initialSkillRatings =
    (isEditMode || isViewMode || isAddMode) && skillsData.length > 0
      ? skillsData.map((skill) => ({
          skill: skill.skillName,
          rating: skill.rating,
          comments: skill.note,
        }))
      : [{ skill: "", rating: 0, comments: "" }];

  const [skillRatings, setSkillRatings] = useState(initialSkillRatings);

  // Fixed: Proper initialization for recommendation with proper fallbacks
  const [recommendation, setRecommendation] = useState(
    isEditMode || isViewMode || isAddMode
      ? overallImpressionTabData.recommendation || "Maybe"
      : "Maybe"
  );

  // General comments uses feedbackData.generalComments directly
  const [comments, setComments] = useState(
    isEditMode || isViewMode || isAddMode
      ? feedbackData?.generalComments || ""
      : ""
  );

  // Merge answered and newly added
  const mergedQuestions = useMemo(() => {
    // Get existing interviewer questions from API
    const existingInterviewerQuestions =
      feedbackCandidate?.interviewData?.questionFeedback || [];

    // Get newly added questions from interviewerSectionData
    const newlyAddedQuestions = (interviewerSectionData || []).filter(
      (newQ) => {
        const newId = newQ.questionId || newQ._id || newQ.id;
        const isNotDuplicate = !existingInterviewerQuestions.some(
          (existingQ) => {
            const existingId =
              existingQ.questionId || existingQ._id || existingQ.id;
            return existingId === newId;
          }
        );
        const isAddedByInterviewer =
          (newQ.addedBy || newQ.snapshot?.addedBy) === "interviewer";
        return isNotDuplicate && isAddedByInterviewer;
      }
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
  }, [feedbackCandidate, interviewerSectionData]);
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

  // const questionsWithFeedback = React.useMemo(() => {

  //   const existingQuestions  = [
  //     ...(filteredInterviewerQuestions || []),
  //     ...(interviewerSectionData || [])
  //   ];
  //   // filteredInterviewerQuestions || [];
  //   // console.log("existingQuestions",existingQuestions);

  //   // Get newly added questions from interviewerSectionData that are not in existing questions
  //   const newlyAddedQuestions = (interviewerSectionData || []).filter(newQ => {
  //     const newId = newQ.questionId || newQ._id || newQ.id;
  //     return !existingQuestions.some(existingQ => {
  //       const existingId = existingQ.questionId || existingQ._id || existingQ.id;
  //       return existingId === newId;
  //     });
  //   });

  //   // Combine both arrays
  //   const allCombinedQuestions = [...existingQuestions, ...newlyAddedQuestions];
  //   // console.log("feedbackData",feedbackData);

  //     const shouldApplyFeedback = (isEditMode || isViewMode || isAddMode) && feedbackData && Array.isArray(feedbackData.questionFeedback) && feedbackData.questionFeedback.length > 0;
  //     console.log("shouldApplyFeedback",shouldApplyFeedback,isAddMode);

  //     if (!shouldApplyFeedback) return allCombinedQuestions;
  //     console.log("allCombinedQuestions",allCombinedQuestions);

  //     const feedbackMap = feedbackData.questionFeedback.reduce((acc, f) => {
  //       const k = f.questionId || f._id;
  //       if (!k) return acc;
  //       acc[k] = f;
  //       return acc;
  //     }, {});
  //     const mapAnswerType = (type) => {
  //       if (!type) return undefined;
  //       if (type === "correct" || type === "Fully Answered") return "Fully Answered";
  //       if (type === "partial" || type === "Partially Answered") return "Partially Answered";
  //       if (type === "incorrect" || type === "Not Answered" || type === "not answered" || type === "wrong") return "Not Answered";
  //       return undefined;
  //     };
  //     return allCombinedQuestions.map((item) => {
  //      console.log("item",item);
  //       const id = item.questionId ||  item._id;
  //       const f = id ? feedbackMap[id] : null;
  //       if (!f) return item;
  //       const merged = { ...item };
  //       const submittedAns = f.candidateAnswer?.submittedAnswer || item.candidateAnswer?.submittedAnswer || "";
  //       const answerType = f.candidateAnswer?.answerType || item.candidateAnswer?.answerType || "";
  //       const derivedIsAnswered = mapAnswerType(answerType);
  //       if (!merged.answer && submittedAns) merged.answer = submittedAns;
  //       if (!merged.isAnswered || merged.isAnswered === "Not Answered") {
  //         if (derivedIsAnswered) merged.isAnswered = derivedIsAnswered;
  //       }
  //       const liked = f.interviewerFeedback?.liked;
  //       const dislikeReason = f.interviewerFeedback?.dislikeReason;
  //       const note = f.interviewerFeedback?.note;
  //       if ((!merged.isLiked || merged.isLiked === "") && liked) merged.isLiked = liked;
  //       if (!merged.whyDislike && dislikeReason) merged.whyDislike = dislikeReason;
  //       if ((!merged.note || merged.note === "") && note) {
  //         merged.note = note;
  //         merged.notesBool = true;
  //       }
  //       console.log("merged",merged);

  //       return merged;
  //     });
  //   }, [isEditMode, isViewMode, feedbackData, interviewerSectionData, filteredInterviewerQuestions]);

  const questionsWithFeedback = React.useMemo(() => {
    // Start with all questions from all sources
    const allQuestions = [
      ...(filteredInterviewerQuestions || []),
      // ...(interviewerSectionData || [])
    ];

    console.log("allQuestions", allQuestions);

    // Create a map by question ID for quick lookup
    const questionsMap = new Map();
    allQuestions.forEach((q) => {
      const id = q.questionId || q._id || q.id;
      if (id) {
        questionsMap.set(id, { ...q });
      }
    });

    // Apply feedback data if available
    if (
      (isEditMode || isViewMode || isAddMode) &&
      feedbackData?.questionFeedback
    ) {
      feedbackData.questionFeedback.forEach((feedback) => {
        const id = feedback.questionId || feedback._id;
        if (id && questionsMap.has(id)) {
          const question = questionsMap.get(id);

          // Merge answer data
          if (feedback.candidateAnswer) {
            question.isAnswered = fromBackendAnswerType(
              feedback.candidateAnswer.answerType
            );
            question.answer =
              feedback.candidateAnswer.submittedAnswer || question.answer;
          }

          // Merge feedback data
          if (feedback.interviewerFeedback) {
            question.isLiked =
              feedback.interviewerFeedback.liked || question.isLiked;
            question.whyDislike =
              feedback.interviewerFeedback.dislikeReason || question.whyDislike;
            question.note = feedback.interviewerFeedback.note || question.note;
            question.notesBool = !!feedback.interviewerFeedback.note;
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
  ]);

  // console.log("questionsWithFeedback",questionsWithFeedback);

  // Build a single, de-duplicated list that prefers current UI state and only falls back to persisted feedback
  // const questionsWithFeedback = React.useMemo(() => {
  //   // Start with interviewer-added questions (from preselected in edit/view) as the base for text/snapshot
  //   const mapById = new Map();
  //   (filteredInterviewerQuestions || []).forEach((q) => {
  //     const key = q?.questionId || q?.id || q?._id;
  //     if (!key) return;
  //     mapById.set(key, { ...q });
  //   });
  //   // Overlay current UI state coming from interviewerSectionData (notes, likes, response type)
  //   (interviewerSectionData || []).forEach((q) => {
  //     const key = q?.questionId || q?.id || q?._id;
  //     // console.log("key",key);

  //     if (!key) return;
  //     const base = mapById.get(key);
  //     // console.log("base",base);

  //     if (!base) return; // only overlay onto interviewer-added base questions
  //     const merged = { ...base };
  //     console.log("merged",merged);
  //     console.log("q",q);

  //     if (q.answer || q.candidateAnswer?.submittedAnswer !== undefined) merged.answer = q.answer;
  //     if (q.isAnswered || q.candidateAnswer?.isAnswered !== undefined) merged.isAnswered = q.isAnswered;
  //     if (q.notesBool || q.candidateAnswer?.notesBool !== undefined) merged.notesBool = q.notesBool;
  //     if (q.note || q.candidateAnswer?.note !== undefined) merged.note = q.note;
  //     if (q.isLiked || q.candidateAnswer?.isLiked !== undefined) merged.isLiked = q.isLiked;
  //     if (q.whyDislike || q.candidateAnswer?.whyDislike !== undefined) merged.whyDislike = q.whyDislike;
  //     mapById.set(key, merged);
  //   });
  //   // Apply persisted feedback only when UI state hasn't provided a value yet
  //   const fb = feedbackData;
  //   const shouldApply = (isEditMode || isViewMode) && fb && Array.isArray(fb.questionFeedback) && fb.questionFeedback.length > 0;
  //   if (shouldApply) {
  //     const feedbackMap = fb.questionFeedback.reduce((acc, f) => {
  //       const k = f?.questionId || f?._id;
  //       if (!k) return acc;
  //       acc[k] = f;
  //       return acc;
  //     }, {});
  //     const mapAnswerType = (type) => {
  //       if (!type) return undefined;
  //       if (type === "correct" || type === "Fully Answered") return "Fully Answered";
  //       if (type === "partial" || type === "Partially Answered") return "Partially Answered";
  //       if (type === "incorrect" || type === "Not Answered" || type === "not answered" || type === "wrong") return "Not Answered";
  //       return undefined;
  //     };
  //     console.log("mapById",mapById);

  //     Array.from(mapById.keys()).forEach((key) => {
  //       const item = mapById.get(key) || {};
  //       // console.log("item",item);

  //       const f = feedbackMap[key];
  //       if (!f) return item;
  //       const submittedAns = f.candidateAnswer?.submittedAnswer || item.candidateAnswer?.submittedAnswer || "";
  //       const answerType = f.candidateAnswer?.answerType || item.candidateAnswer?.answerType || "";
  //       const derivedIsAnswered = mapAnswerType(answerType);
  //       if ((item.answer === undefined || item.answer === "") && submittedAns) item.answer = submittedAns;
  //       if (!item.isAnswered || item.isAnswered === "Not Answered") {
  //         if (derivedIsAnswered) item.isAnswered = derivedIsAnswered;
  //       }
  //       const liked = f.interviewerFeedback?.liked;
  //       const dislikeReason = f.interviewerFeedback?.dislikeReason;
  //       const note = f.interviewerFeedback?.note;
  //       if ((!item.isLiked || item.isLiked === "") && liked) item.isLiked = liked;
  //       if (!item.whyDislike && dislikeReason) item.whyDislike = dislikeReason;
  //       if ((!item.note || item.note === "") && note) {
  //         item.note = note;
  //         item.notesBool = true;
  //       }
  //       mapById.set(key, item);
  //     });
  //   }
  //   return Array.from(mapById.values());
  // }, [isEditMode, isViewMode, feedbackData, interviewerSectionData, filteredInterviewerQuestions]);
  //---v1.0.0----->

  // Final list of questions to render in the interviewer section

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
      Array.isArray(feedbackData?.questionFeedback)
        ? feedbackData.questionFeedback
        : []
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
      {}
    );

    // console.log("overlayMap",overlayMap);
    // console.log("preselectedMap",preselectedMap);
    // console.log("existingMap",existingMap);
    // console.log("idsSet",idsSet);

    // Compose final items per id
    const result = [];
    idsSet.forEach((id) => {
      const overlay = overlayMap[id] || {};
      const pre = preselectedMap[id] || {};
      const existing = existingMap[id] || {};

      // Prefer UI state; then preselected; then existing persisted
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

      result.push({
        questionId: id,
        candidateAnswer: {
          answerType: toBackendAnswerType(uiIsAnswered),
          submittedAnswer: "",
        },
        interviewerFeedback: {
          // Only default if truly missing everywhere to avoid overwriting existing data
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

          return newList;
        });
      } else {
        console.warn(
          "setInterviewerSectionData is not a function, cannot add question to round"
        );
      }
    }
  };

  const handleRemoveQuestion = (questionId) => {
    // console.log("Removing question:", questionId);

    // Remove question from interviewer section data
    setInterviewerSectionData((prev) =>
      prev.filter((q) => (q.questionId || q.id) !== questionId)
    );

    // Add to removed question IDs
    setRemovedQuestionIds((prev) => [...prev, questionId]);
  };

  const handleToggleMandatory = (questionId) => {
    // console.log("Toggling mandatory for question:", questionId);

    // Toggle mandatory status for the question
    setInterviewerSectionData((prev) => {
      // console.log("Previous state:", prev);
      const updated = prev.map((q) => {
        if ((q.questionId || q.id) === questionId) {
          console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          console.log("New mandatory value:", newMandatory);
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
      console.log("Updated state:", updated);
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
            : q
        );
      }
      // add minimal overlay so UI updates immediately
      return [...prev, { questionId, note: notes, notesBool: true }];
    });
    //---v1.0.0----->
  };

  const onClickAddNote = (id) => {
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id ? { ...q, notesBool: !q.notesBool } : q
        );
      }
      return [...prev, { questionId: id, notesBool: true }];
    });
    //---v1.0.0----->
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === id
          ? { ...question, notesBool: false, note: "" }
          : question
      )
    );
  };

  const onChangeRadioInput = (questionId, value) => {
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === questionId);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, isAnswered: value }
            : q
        );
      }
      return [...prev, { questionId, isAnswered: value }];
    });
    //---v1.0.0----->
  };

  const onChangeDislikeRadioInput = (questionId, value) => {
    //<---v1.0.0-----
    console.log("onChangeDislikeRadioInput", questionId, value);
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === questionId);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, whyDislike: value, isLiked: "disliked" }
            : q
        );
      }
      return [...prev, { questionId, whyDislike: value, isLiked: "disliked" }];
    });
    //---v1.0.0----->
  };

  const handleDislikeToggle = (id) => {
    if (isViewMode) return; //<---v1.0.1-----
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
    else setDislikeQuestionId(id);
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" }
            : q
        );
      }
      return [...prev, { questionId: id, isLiked: "disliked" }];
    });
    //---v1.0.0----->
  };

  const handleLikeToggle = (id) => {
    if (isViewMode) return; //<---v1.0.1-----
    //<---v1.0.0-----
    setInterviewerSectionData((prev) => {
      const exists = prev.some((q) => (q.questionId || q.id) === id);
      if (exists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" }
            : q
        );
      }
      return [...prev, { questionId: id, isLiked: "liked" }];
    });
    //---v1.0.0----->
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  };

  const openQuestionBank = () => {
    setIsQuestionBankOpen(true);
  };

  // Component Functions
  const DisLikeSection = React.memo(({ each }) => {
    return (
      <>
        {isEditMode || isAddMode ? (
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
                    onChange={(e) =>
                      onChangeDislikeRadioInput(
                        each.questionId || each.id,
                        e.target.value
                      )
                    }
                  />
                  <label
                    htmlFor={`dislike-${each.questionId || each.id}-${
                      option.value
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
      <div className="flex rounded-md mt-2">
        <p className="w-[200px] font-bold text-gray-700">
          Response Type{" "}
          {(each.mandatory === "true" ||
            each.snapshot?.mandatory === "true") && (
            <span className="text-[red]">*</span>
          )}
        </p>
        <div className={`w-full flex gap-x-8 gap-y-2 `}>
          {["Not Answered", "Partially Answered", "Fully Answered"].map(
            (option) => (
              <span key={option} className="flex items-center gap-2">
                <input
                  checked={each.isAnswered === option}
                  value={option}
                  name={`isAnswered-${each.questionId || each.id}`}
                  type="radio"
                  id={`isAnswered-${each.questionId || each.id}-${option}`}
                  onChange={(e) =>
                    onChangeRadioInput(
                      each.questionId || each.id,
                      e.target.value
                    )
                  }
                  className="whitespace-nowrap"
                />
                <label
                  htmlFor={`isAnswered-${each.questionId || each.id}-${option}`}
                  className="cursor-pointer"
                >
                  {option}
                </label>
              </span>
            )
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
            onClick={() => setRating(star)}
            disabled={isViewMode}
            className={`w-6 h-6 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    setSkillRatings([...skillRatings, { skill: "", rating: 0, comments: "" }]);
  };

  const handleRemoveSkill = (index) => {
    if (skillRatings.length > 1) {
      setSkillRatings(skillRatings.filter((_, i) => i !== index));
    }
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

    // Validate skills
    if (
      skillRatings.some((skill) => !skill.skill.trim() || skill.rating === 0)
    ) {
      newErrors.skills =
        "Please provide skill names and ratings for all skills";
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
  };

  // Handle communication rating change
  const handleCommunicationRatingChange = (rating) => {
    setCommunicationRating(rating);
    if (rating > 0) {
      clearError("communicationRating");
    }
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    setComments(e.target.value);
    if (e.target.value.trim()) {
      clearError("comments");
    }
  };

  // Handle skill change with validation
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...skillRatings];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkillRatings(updatedSkills);

    // Clear skills error if all skills are valid
    if (
      updatedSkills.every((skill) => skill.skill.trim() && skill.rating > 0)
    ) {
      clearError("skills");
    }
  };

  const submitFeedback = async () => {
    try {
      console.log("🚀 Starting feedback submission...");
      console.log(
        "📋 Preselected questions responses:",
        preselectedQuestionsResponses
      );

      // Validate form locally first
      if (!validateForm()) {
        console.log("❌ Form validation failed");
        return;
      }

      // Prepare feedback data
      const feedbackData = {
        type: "submit",
        tenantId: currentTenantId || "",
        ownerId: decodedData?.ownerId || currentOwnerId || "",
        interviewRoundId: interviewRoundId || "",
        candidateId: candidateId || "",
        feedbackCode:
          feedbackCandidate?.interviewRound?.interviewCode ||
          "" + "-" + feedbackCandidate?.interviewRound?.sequence ||
          "",
        positionId: positionId || "",
        interviewerId: interviewerId || "",
        skills: skillRatings.map((skill) => ({
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
      try {
        const validationResponse = await axios.post(
          `${config.REACT_APP_API_URL}/feedback/validate`,
          feedbackData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!validationResponse.data.success) {
          console.log(
            "❌ Backend validation failed",
            validationResponse.data.errors
          );
          // Update error state with backend errors
          if (validationResponse.data.errors) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              ...validationResponse.data.errors,
            }));
          }
          alert("Validation failed. Please check the form.");
          return;
        }
      } catch (validationError) {
        // If backend validation fails, continue with frontend validation only
        console.warn(
          "Backend validation unavailable, proceeding with frontend validation only",
          validationError
        );
      }

      const updatedFeedbackData = {
        overallRating,
        skills: skillRatings.map((skill) => ({
          skillName: skill.skill,
          rating: skill.rating,
          note: skill.comments,
        })),
        questionFeedback: finalQuestionFeedback,
        generalComments: comments,
        overallImpression: {
          overallRating,
          recommendation,
          note: comments,
        },
        status: "submitted", // Mark as submitted
      };

      // console.log('📤 Update payload (submit):', updatedFeedbackData);

      // console.log('📤 Sending feedback data:', feedbackData);

      if (isEditMode) {
        if (feedbackId) {
          updateFeedback(
            { feedbackId, feedbackData: updatedFeedbackData },
            {
              onSuccess: (data) => {
                if (data.success) {
                  alert("Feedback updated successfully!");
                } else {
                  alert("Failed to update feedback: " + data.message);
                }
              },
              onError: (error) => {
                alert("Failed to update feedback: " + error.message);
              },
            }
          );
        } else {
          alert("No feedback ID found, cannot update.");
        }
      } else {
        createFeedback(feedbackData, {
          onSuccess: (data) => {
            if (data.success) {
              alert("Feedback submitted successfully!");
              // Optionally, reset form or redirect
            } else {
              alert("Failed to submit feedback: " + data.message);
            }
          },
          onError: (error) => {
            alert("Failed to submit feedback: " + error.message);
          },
        });
      }

      navigate("/feedback");
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
        ownerId: decodedData?.ownerId || currentOwnerId || "",
        interviewRoundId: interviewRoundId || "",
        candidateId: candidateId || "",
        positionId: positionId || "",
        interviewerId: interviewerId || "",
        skills: skillRatings.map((skill) => ({
          skillName: skill.skill,
          rating: skill.rating,
          note: skill.comments || "",
        })),
        feedbackCode:
          feedbackCandidate?.interviewRound?.interviewCode ||
          "" + "-" + feedbackCandidate?.interviewRound?.sequence ||
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
        skills: skillRatings.map((skill) => ({
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

      // console.log('📤 Update payload (draft):', updatedFeedbackData);
      //
      // console.log('📤 Sending draft data:', feedbackData);

      if (isEditMode) {
        if (feedbackId) {
          updateFeedback(
            { feedbackId, feedbackData: updatedFeedbackData },
            {
              onSuccess: (data) => {
                if (data.success) {
                  notify.success("Feedback saved as draft successfully!");
                } else {
                  notify.error(
                    "Failed to save feedback as draft: " + data.message
                  );
                }
              },
              onError: (error) => {
                notify.error(
                  "Failed to save feedback as draft: " + error.message
                );
              },
            }
          );
        } else {
          notify.error("No feedback ID found, cannot save draft.");
        }
      } else {
        createFeedback(feedbackData, {
          onSuccess: (data) => {
            if (data.success) {
              notify.success("Feedback saved as draft!");
              navigate("/feedback");
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

  console.log("schedulerFeedbackData", schedulerFeedbackData);
  //<---v1.0.2-----Ranjith----solved feedback issues

  if (decodedData?.schedule) {
    console.log("schedulerFeedbackData", schedulerFeedbackData);
    return <SchedulerViewMode feedbackData={schedulerFeedbackData} />;
  }
  console.log("schedulerFeedbackData", isScheduler, decodedData?.schedule);
  //<---v1.0.2-----Ranjith----solved feedback issues

  // Button component for consistency
  const Button = ({
    children,
    onClick,
    variant = "default",
    size = "default",
    className = "",
    style = {},
    disabled = false,
    type = "button",
  }) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      default: "px-4 py-2 text-sm",
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${
          sizes[size]
        } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        style={style}
      >
        {children}
      </button>
    );
  };

  return (
    // v1.0.4 <----------------------------------------------------------------------
    <>
      {isAddMode === true && (
        <div className="right-4 z-40  pb-3 top-5">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => window.open(decodedData.meetLink, "_blank")}
              className="text-sm bg-custom-blue hover:bg-custom-blue/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        </div>
      )}

      {/* v1.0.3 <--------------------------------------------------------- */}
      <div className="bg-white rounded-lg sm:px-3 px-6 py-6 shadow-sm pb-20 mb-8">
        {/* v1.0.3 ---------------------------------------------------------> */}
        <div className="flex items-center mb-6">
          <FileText
            className="h-5 w-5 mr-2"
            style={{ color: "rgb(33, 121, 137)" }}
          />
          <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-medium text-gray-900">
            Interview Feedback
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating{" "}
              {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Rating{" "}
              {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center">
              {renderStarRating(
                communicationRating,
                handleCommunicationRatingChange
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

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Skill Ratings{" "}
                {!isViewMode && <span className="text-red-500">*</span>}
              </label>
              {isViewMode || isEditMode ? (
                <div></div>
              ) : (
                // {!isViewMode &&

                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                  size="sm"
                  style={{
                    borderColor: "rgb(33, 121, 137)",
                    color: "rgb(33, 121, 137)",
                  }}
                  className="bg-custom-blue text-sm border-custom-blue"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Skill
                </Button>
              )}
            </div>
            {isViewMode ? (
              <div className="space-y-3">
                {skillRatings.map((skill, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-sm text-gray-800">{skill.skill}</div>
                      <div className="flex items-center">
                        {renderStarRating(skill.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {skill.rating}/5
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {skill.comments || "No comments"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {skillRatings.map((skill, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={skill.skill}
                        onChange={(e) =>
                          handleSkillChange(index, "skill", e.target.value)
                        }
                        placeholder="Skill name"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        {renderStarRating(skill.rating, (rating) =>
                          handleSkillChange(index, "rating", rating)
                        )}
                        <span className="ml-2 text-sm text-gray-600">
                          {skill.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={skill.comments || ""}
                          onChange={(e) =>
                            handleSkillChange(index, "comments", e.target.value)
                          }
                          placeholder="Comments (optional)"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <div className="flex justify-between items-center mb-3">
              {/* v1.0.3 <-------------------------------------------------------- */}
              <div className="flex sm:flex-col sm:items-start items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  Questions Asked
                </label>
                <span className="text-sm text-gray-500">
                  {questionsWithFeedback.length} question(s) from question bank
                </span>
              </div>
              {/* v1.0.3 --------------------------------------------------------> */}
              {isViewMode || isEditMode ? (
                <div></div>
              ) : (
                <button
                  className="text-sm flex items-center gap-2 sm:px-3 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 font-medium"
                  onClick={openQuestionBank}
                  title="Add Question from Question Bank"
                  // disabled={decodedData?.schedule}
                >
                  <Plus className="text-sm" />
                  <span>Add</span>
                  <span className="sm:hidden inline">Question</span>
                </button>
              )}
            </div>
          </div>

          {isViewMode ? (
            <>
              {questionsWithFeedback?.length > 0
                ? questionsWithFeedback.map((question) => (
                    <div
                      key={question.questionId || question.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-2"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                          {question.snapshot?.skill ||
                            question.category ||
                            "N/A"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.snapshot?.difficultyLevel ||
                            question.difficulty ||
                            "N/A"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-800 mb-2">
                        {question.snapshot?.questionText ||
                          question.question ||
                          "N/A"}
                      </h3>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Expected Answer:
                        </p>
                        <p className="text-sm text-gray-700">
                          {question.snapshot?.correctAnswer ||
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
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "liked" ? "text-green-700" : ""
                          }`}
                          onClick={() =>
                            handleLikeToggle(question.questionId || question.id)
                          }
                          disabled={!isViewMode}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </span>
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "disliked"
                              ? "text-red-500"
                              : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleDislikeToggle(
                              question.questionId || question.id
                            )
                          }
                          disabled={!isViewMode}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </span>
                      </div>
                      <div>
                        {(dislikeQuestionId ===
                          (question.questionId || question._id) ||
                          !!question.whyDislike) && (
                          <DisLikeSection each={question} />
                        )}
                      </div>

                      {/* Note display if available */}
                      {question.notesBool && question.note && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Note:
                          </p>
                          <p className="text-sm text-gray-800">
                            {question.note}
                          </p>
                          {!isViewMode && (
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
                // console.log("questionsToRender", question);
                return (
                  <div
                    key={question.questionId || question.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                        {
                          // question.snapshot?.skill ||
                          question?.snapshot?.technology[0] ||
                            question?.snapshot?.category[0] ||
                            "N/A"
                        }
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.snapshot?.difficultyLevel ||
                          question.difficulty ||
                          "N/A"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {question.snapshot?.questionText ||
                        question.question ||
                        "N/A"}
                    </h3>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Expected Answer:
                      </p>
                      <p className="text-sm text-gray-700">
                        {question.snapshot?.correctAnswer ||
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
                            onClickAddNote(question.questionId || question.id)
                          }
                        >
                          {question.notesBool ? "Delete Note" : "Add a Note"}
                          {/* Add a Note */}
                        </button>
                        <SharePopupSection />
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "liked" ? "text-green-700" : ""
                          }`}
                          onClick={() =>
                            handleLikeToggle(
                              question.questionId || question._id
                            )
                          }
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </span>
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "disliked"
                              ? "text-red-500"
                              : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleDislikeToggle(
                              question.questionId || question._id
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
                            htmlFor={`note-input-${
                              question.questionId || question.id
                            }`}
                            className="w-[180px] font-bold text-gray-700"
                          >
                            Note
                          </label>
                          <div className="flex flex-col items-start w-full  h-[80px]">
                            <div className="w-full relative  rounded-md">
                              <input
                                className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                                id={`note-input-${
                                  question.questionId || question.id
                                }`}
                                type="text"
                                value={question.note}
                                onChange={(e) =>
                                  onChangeInterviewQuestionNotes(
                                    question.questionId || question.id,
                                    e.target.value.slice(0, 250)
                                  )
                                }
                                placeholder="Add your note here"
                              />
                              {/* <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                                  {question.note?.length || 0}/250
                                </span> */}
                            </div>
                            <span className="w-full text-sm text-right text-gray-500">
                              {question.note?.length || 0}/250
                            </span>
                            {/* <button
                                onClick={() => onClickDeleteNote(question.questionId || question.id)}
                                className="text-red-500 text-lg mt-2"
                              >
                                <FaTrash size={20} />
                              </button> */}
                          </div>
                        </div>
                      </div>
                    )}

                    {(dislikeQuestionId ===
                      (question.questionId || question._id) ||
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
          )}

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Comments{" "}
              {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            {isViewMode ? (
              <div className="text-sm text-gray-800">
                {comments || "Not Provided"}
              </div>
            ) : (
              <DescriptionField
                rows={4}
                value={comments}
                onChange={handleCommentsChange}
                maxLength={1000}
                placeholder="Provide overall feedback about the candidate's performance..."
                error={errors.comments}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation{" "}
              {!isViewMode && <span className="text-red-500">*</span>}
            </label>
            {isViewMode ? (
              <div className="text-sm text-gray-800">
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
                onChange={(opt) => setRecommendation(opt?.value || "")}
                placeholder="Select Recommendation"
              />
            )}
          </div>
          {isViewMode ? (
            <div></div>
          ) : (
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={saveFeedback}
                variant="outline"
                // disabled={decodedData.schedule}
                style={{
                  borderColor: "rgb(33, 121, 137)",
                  color: "rgb(33, 121, 137)",
                }}
                className="hover:bg-gray-50"
              >
                Save Draft
              </Button>
              <Button
                onClick={submitFeedback}
                className="text-sm bg-custom-blue text-white hover:bg-custom-blue/90"
                // disabled={decodedData.schedule}
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </div>

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
              {/* QuestionBank Content */}
              <div className="flex-1 overflow-hidden">
                <QuestionBank
                  interviewQuestionsLists={interviewerSectionData || []}
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
      </div>
    </>
    // v1.0.4 ---------------------------------------------------------------------->
  );
};

export default FeedbackForm;
