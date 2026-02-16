/* eslint-disable react-hooks/exhaustive-deps */
//<----v1.0.0---Venkatesh-----open selected question on load
//<----v1.0.1---Venkatesh-----update selected question on load from question bank
////<---v1.0.2-----Venkatesh-----solved edit mode issues
//<----v1.0.3-----Venkatesh-----disable like and dislike in view mode
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Fixed responsiveness issues

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import { X, Plus, ThumbsUp, ThumbsDown, XCircle } from "lucide-react";
import QuestionBank from "../../../../Tabs/QuestionBank-Tab/QuestionBank.jsx";
import QuestionCard, { EmptyState } from "../../../../../../Components/QuestionCard";

// Helper to normalize questionFeedback from backend object {preselected, interviewerAdded}
const flattenQuestionFeedback = (qf) => {
  if (!qf) return [];
  if (Array.isArray(qf)) return qf;
  if (qf && typeof qf === "object" && (qf.preselected || qf.interviewerAdded)) {
    return [...(qf.preselected || []), ...(qf.interviewerAdded || [])];
  }
  return [];
};

const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const InterviewerSectionComponent = ({
  closePopup,
  isEditMode,
  isAddMode,
  isViewMode,
  // Question Bank Props from parent
  interviewerSectionData,
  preselectedQuestionsResponses,
  setInterviewerSectionData,
  removedQuestionIds,
  setRemovedQuestionIds,
  isQuestionBankOpen,
  setIsQuestionBankOpen,
  handleAddQuestionToRound,
  handleRemoveQuestion,
  handleToggleMandatory,
  // Filtered interviewer questions from parent
  interviewerQuestions = [],
  // Interview data from parent
  interviewData,
  decodedData,
  triggerAutoSave,
}) => {
  const saveTimeoutRef = useRef(null);

  console.log("interviewerSectionData InterviewerSectionComponent", interviewerSectionData)

  const triggerDebouncedSave = () => {
    if (isAddMode || isEditMode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (triggerAutoSave) triggerAutoSave();
      }, 1000);
    }
  };
  // Get all questions from interviewData and filter for interviewer-added questions
  const location = useLocation();
  const rawFeedbackData = location.state?.feedback;
  // const feedbackData = React.useMemo(() => rawFeedbackData || {}, [rawFeedbackData] || interviewData?.questionFeedback);
  const feedbackData = React.useMemo(() => {
    return rawFeedbackData || interviewData || {};
  }, [rawFeedbackData, interviewData]);

  console.log("feedbackData", feedbackData);
  console.log("interviewData", interviewData);
  console.log("rawFeedbackData", rawFeedbackData);

  // Get interviewer-added questions from the new API structure
  const rawInterviewerAddedQuestionsFromAPI =
    interviewData?.interviewQuestions?.interviewerAddedQuestions;
  const interviewerAddedQuestionsFromAPI = React.useMemo(
    () => rawInterviewerAddedQuestionsFromAPI || [],
    [rawInterviewerAddedQuestionsFromAPI],
  );

  console.log(
    "interviewerAddedQuestionsFromAPI",
    interviewerAddedQuestionsFromAPI,
  );

  const rawInterviewQuestions =
    interviewData?.interviewQuestions || interviewerSectionData;
  const allQuestions = React.useMemo(() => {
    if (feedbackData?.preSelectedQuestions)
      return feedbackData.preSelectedQuestions;
    return rawInterviewQuestions || [];
  }, [feedbackData, rawInterviewQuestions]);

  // Use interviewer-added questions from API if available, otherwise fallback to old logic
  const filteredInterviewerQuestions = React.useMemo(() => {
    if (
      Array.isArray(interviewerAddedQuestionsFromAPI) &&
      interviewerAddedQuestionsFromAPI.length > 0
    ) {
      return interviewerAddedQuestionsFromAPI;
    }
    if (Array.isArray(allQuestions)) {
      return allQuestions.filter(
        (question) => question.addedBy === "interviewer",
      );
    }
    return [];
  }, [interviewerAddedQuestionsFromAPI, allQuestions]);

  // Merge persisted feedback into interviewer questions without overwriting current UI state
  const questionsWithFeedback = React.useMemo(() => {
    const existingQuestions = filteredInterviewerQuestions || [];

    const newlyAddedQuestions = (interviewerSectionData || []).filter(
      (newQ) => {
        const newId = newQ.questionId || newQ._id || newQ.id;
        const isNotDuplicate = !existingQuestions.some((existingQ) => {
          const existingId =
            existingQ.questionId || existingQ._id || existingQ.id;
          return existingId === newId;
        });
        const isAddedByInterviewer =
          (newQ.addedBy || newQ.snapshot?.addedBy) === "interviewer";
        return isNotDuplicate && isAddedByInterviewer;
      },
    );

    // Combine both arrays

    const allCombinedQuestions = [...existingQuestions, ...newlyAddedQuestions];

    // Normalize questionFeedback using helper
    const normalizedQF = flattenQuestionFeedback(feedbackData.questionFeedback);

    const shouldApplyFeedback =
      (isEditMode || isViewMode || isAddMode) &&
      feedbackData &&
      normalizedQF.length > 0;

    if (!shouldApplyFeedback) return allCombinedQuestions;
    // Build feedbackMap keyed by _id (InterviewQuestions ID) since
    // merged feedback uses _id consistently (questionId is renamed to questionBankId)
    const feedbackMap = normalizedQF.reduce((acc, f) => {
      // Key by _id first, then fallback to questionBankId for lookup by either
      if (f._id) acc[f._id] = f;
      if (f.questionBankId) acc[f.questionBankId] = f;
      return acc;
    }, {});
    const mapAnswerType = (type) => {
      if (!type) return undefined;
      if (type === "correct" || type === "Fully Answered")
        return "Fully Answered";
      if (type === "partial" || type === "Partially Answered")
        return "Partially Answered";
      if (
        type === "incorrect" ||
        type === "Not Answered" ||
        type === "not answered" ||
        type === "wrong"
      )
        return "Not Answered";
      return undefined;
    };
    return allCombinedQuestions.map((item) => {
      // Try to find feedback by _id first (InterviewQuestions ID), then questionId (QuestionBank ID)
      const f = feedbackMap[item._id] || feedbackMap[item.questionId] || null;
      if (!f) return item;
      const merged = { ...item };
      const submittedAns =
        f.candidateAnswer?.submittedAnswer ||
        item.candidateAnswer?.submittedAnswer ||
        "";
      const answerType =
        f.candidateAnswer?.answerType || item.candidateAnswer?.answerType || "";
      const derivedIsAnswered = mapAnswerType(answerType);
      if (!merged.answer && submittedAns) merged.answer = submittedAns;
      if (!merged.isAnswered || merged.isAnswered === "Not Answered") {
        if (derivedIsAnswered) merged.isAnswered = derivedIsAnswered;
      }
      const liked = f.interviewerFeedback?.liked;
      const dislikeReason = f.interviewerFeedback?.dislikeReason;
      const note = f.interviewerFeedback?.note;
      if ((!merged.isLiked || merged.isLiked === "") && liked)
        merged.isLiked = liked;
      if (!merged.whyDislike && dislikeReason)
        merged.whyDislike = dislikeReason;
      if ((!merged.note || merged.note === "") && note) {
        merged.note = note;
        // Only overwrite notesBool if it's undefined (not set by UI yet)
        if (merged.notesBool === undefined) {
          merged.notesBool = true;
        }
      }
      return merged;
    });
  }, [
    isEditMode,
    isViewMode,
    feedbackData,
    isAddMode,
    interviewerSectionData,
    filteredInterviewerQuestions,
  ]);

  // Enhanced state initialization
  // Enhanced state initialization with useEffect to sync with props
  const [interviewerSection, setInterviewerSection] = useState([]);

  useEffect(() => {
    if (questionsWithFeedback && questionsWithFeedback.length > 0) {
      setInterviewerSection(questionsWithFeedback);
    } else if (interviewerSectionData && interviewerSectionData.length > 0) {
      // Fallback to initial data if no feedback yet
      setInterviewerSection(interviewerSectionData);
    }
  }, [questionsWithFeedback, interviewerSectionData]);

  // const [interviewerSection, setInterviewerSection] = useState(() => {
  //   return isAddMode || isEditMode ? questionsWithFeedback : [];
  // });

  //<----v1.0.0---
  const [selectedQuestion, setSelectedQuestion] = useState(
    interviewerSection.length > 0 ? interviewerSection[0].id : null,
  );

  // REPLACE with this stable version:
  useEffect(() => {
    // Only update if we're in edit/view mode and have questions with feedback
    if (
      (isEditMode || isViewMode) &&
      questionsWithFeedback &&
      questionsWithFeedback.length > 0
    ) {
      const currentIds = interviewerSection
        .map((q) => q.questionId || q.id)
        .sort()
        .join(",");
      const newIds = questionsWithFeedback
        .map((q) => q.questionId || q.id)
        .sort()
        .join(",");

      // Only update if the data has actually changed
      if (currentIds !== newIds) {
        setInterviewerSection(questionsWithFeedback);
      }
    }
  }, [questionsWithFeedback, isEditMode, isViewMode]);

  useEffect(() => {
    if (interviewerSection.length > 0 && selectedQuestion === null) {
      setSelectedQuestion(interviewerSection[0].id);
    }
  }, [interviewerSection, selectedQuestion]);

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

  // const onChangeInterviewQuestionNotes = (questionId, notes) => {
  //   setInterviewerSectionData((prev) =>
  //     prev.map((question) =>
  //       (question.questionId || question.id) === questionId
  //         ? { ...question, note: notes }
  //         : question
  //     )
  //   );
  // };

  // const onClickAddNote = (id) => {
  //   setInterviewerSectionData((prev) =>
  //     prev.map((question) =>
  //       (question.questionId || question.id) === id
  //         ? { ...question, notesBool: !question.notesBool }
  //         : question
  //     )
  //   );
  // };

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some(
        (q) => (q.questionId || q.id || q._id) === questionId,
      );

      if (questionExists) {
        const updated = prev.map((q) =>
          (q.questionId || q.id || q._id) === questionId
            ? {
              ...q,
              note: notes,
              notesBool: true,
              ...(isEditMode && { isEdited: true }),
            }
            : q,
        );

        // Debounced auto-save for notes
        triggerDebouncedSave();

        return updated;
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === questionId,
        );

        if (originalQuestion) {
          const newData = [
            ...prev,
            {
              ...originalQuestion,
              questionId: questionId,
              note: notes,
              notesBool: true,
              addedBy: "interviewer",
              ...(isEditMode && { isEdited: true }),
            },
          ];

          // Debounced auto-save for notes
          triggerDebouncedSave();

          return newData;
        }

        return prev;
      }
    });
  };

  useEffect(() => {
    return () => {
      if (noteTimeoutRef.current) {
        clearTimeout(noteTimeoutRef.current);
      }
    };
  }, []);

  // const onChangeInterviewQuestionNotes = (questionId, notes) => {
  //   setInterviewerSectionData((prev) => {
  //     const questionExists = prev.some(
  //       (q) => (q.questionId || q.id) === questionId
  //     );

  //     if (questionExists) {
  //       return prev.map((q) =>
  //         (q.questionId || q.id) === questionId
  //           ? {
  //               ...q,
  //               note: notes,
  //               notesBool: true,
  //               ...(isEditMode && { isEdited: true }), // Mark as edited in edit mode
  //             }
  //           : q
  //       );
  //     } else {
  //       const originalQuestion = feedbackData?.questionFeedback?.find(
  //         (f) => (f.questionId || f._id) === questionId
  //       );

  //       if (originalQuestion) {
  //         return [
  //           ...prev,
  //           {
  //             ...originalQuestion,
  //             questionId: questionId,
  //             note: notes,
  //             notesBool: true,
  //             addedBy: "interviewer",
  //             ...(isEditMode && { isEdited: true }),
  //           },
  //         ];
  //       }

  //       return prev;
  //     }
  //   });
  // };

  const onClickAddNote = (id) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id || q._id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id || q._id) === id ? { ...q, notesBool: !q.notesBool } : q,
        );
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === id,
        );

        if (originalQuestion) {
          return [
            ...prev,
            {
              ...originalQuestion,
              questionId: id,
              notesBool: true,
              note: originalQuestion.interviewerFeedback?.note || "",
            },
          ];
        }

        return prev;
      }
    });
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id || q._id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id || q._id) === id
            ? { ...q, notesBool: false, note: "" }
            : q,
        );
      }
      return prev;
    });
  };

  const openQuestionBank = () => {
    setIsQuestionBankOpen(true);
  };

  const closeSidebar = () => {
    setIsQuestionBankOpen(false);
  };

  const handleOutsideClick = () => {
    setIsQuestionBankOpen(false);
  };

  // Add missing functions required by Sidebar component
  const closeSidebarCallback = useCallback(() => {
    setIsQuestionBankOpen(false);
  }, []);

  const handleOutsideClickCallback = useCallback(
    (event) => {
      if (
        isQuestionBankOpen &&
        !event.target.closest(".question-bank-sidebar")
      ) {
        setIsQuestionBankOpen(false);
      }
    },
    [isQuestionBankOpen],
  );

  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const questionRef = useRef(); // For future use, e.g., scrolling to a specific question

  // Fixed radio input handler
  // const onChangeRadioInput = (questionId, value) => {
  //   setInterviewerSectionData((prev) => {
  //     const questionExists = prev.some(
  //       (q) => (q.questionId || q.id) === questionId
  //     );

  //     if (questionExists) {
  //       return prev.map((q) =>
  //         (q.questionId || q.id) === questionId
  //           ? {
  //               ...q,
  //               isAnswered: value,
  //               ...(isEditMode && { isEdited: true }), // Mark as edited
  //             }
  //           : q
  //       );
  //     } else {
  //       // Find the question in original feedback data and create new entry
  //       const originalQuestion = feedbackData?.questionFeedback?.find(
  //         (f) => (f.questionId || f._id) === questionId
  //       );

  //       if (originalQuestion) {
  //         return [
  //           ...prev,
  //           {
  //             ...originalQuestion,
  //             questionId: questionId,
  //             isAnswered: value,
  //             isLiked: originalQuestion.interviewerFeedback?.liked || "",
  //             whyDislike:
  //               originalQuestion.interviewerFeedback?.dislikeReason || "",
  //             note: originalQuestion.interviewerFeedback?.note || "",
  //             notesBool: !!originalQuestion.interviewerFeedback?.note,
  //             addedBy: "interviewer",
  //             ...(isEditMode && { isEdited: true }),
  //           },
  //         ];
  //       }

  //       return prev;
  //     }
  //   });
  // };

  const onChangeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some(
        (q) => (q.questionId || q.id || q._id) === questionId,
      );

      if (questionExists) {
        const updated = prev.map((q) =>
          (q.questionId || q.id || q._id) === questionId
            ? {
              ...q,
              isAnswered: value,
              ...(isEditMode && { isEdited: true }),
            }
            : q,
        );

        // Trigger auto-save after change
        triggerDebouncedSave();

        return updated;
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === questionId,
        );

        if (originalQuestion) {
          const newData = [
            ...prev,
            {
              ...originalQuestion,
              questionId: questionId,
              isAnswered: value,
              isLiked: originalQuestion.interviewerFeedback?.liked || "",
              whyDislike:
                originalQuestion.interviewerFeedback?.dislikeReason || "",
              note: originalQuestion.interviewerFeedback?.note || "",
              notesBool: !!originalQuestion.interviewerFeedback?.note,
              addedBy: "interviewer",
              ...(isEditMode && { isEdited: true }),
            },
          ];

          // Trigger auto-save after change
          triggerDebouncedSave();

          return newData;
        }

        return prev;
      }
    });
  };

  // Fixed dislike radio input handler
  // const onChangeDislikeRadioInput = (questionId, value) => {
  //   setInterviewerSectionData((prev) => {
  //     const questionExists = prev.some(
  //       (q) => (q.questionId || q.id) === questionId
  //     );

  //     if (questionExists) {
  //       return prev.map((q) =>
  //         (q.questionId || q.id) === questionId
  //           ? { ...q, whyDislike: value, isLiked: "disliked" }
  //           : q
  //       );
  //     } else {
  //       const originalQuestion = feedbackData?.questionFeedback?.find(
  //         (f) => (f.questionId || f._id) === questionId
  //       );

  //       if (originalQuestion) {
  //         return [
  //           ...prev,
  //           {
  //             ...originalQuestion,
  //             questionId: questionId,
  //             whyDislike: value,
  //             isLiked: "disliked",
  //             note: originalQuestion.interviewerFeedback?.note || "",
  //             notesBool: !!originalQuestion.interviewerFeedback?.note,
  //           },
  //         ];
  //       }

  //       return prev;
  //     }
  //   });
  // };

  const onChangeDislikeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some(
        (q) => (q.questionId || q.id || q._id) === questionId,
      );

      if (questionExists) {
        const updated = prev.map((q) =>
          (q.questionId || q.id || q._id) === questionId
            ? { ...q, whyDislike: value, isLiked: "disliked" }
            : q,
        );

        // Trigger auto-save after change
        triggerDebouncedSave();

        return updated;
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === questionId,
        );

        if (originalQuestion) {
          const newData = [
            ...prev,
            {
              ...originalQuestion,
              questionId: questionId,
              whyDislike: value,
              isLiked: "disliked",
              note: originalQuestion.interviewerFeedback?.note || "",
              notesBool: !!originalQuestion.interviewerFeedback?.note,
            },
          ];

          // Trigger auto-save after change
          triggerDebouncedSave();

          return newData;
        }

        return prev;
      }
    });
  };

  // Fixed like/dislike toggle handlers
  // const handleLikeToggle = (id) => {
  //   if (isViewMode) return;

  //   setInterviewerSectionData((prev) => {
  //     const questionExists = prev.some((q) => (q.questionId || q.id) === id);

  //     if (questionExists) {
  //       return prev.map((q) =>
  //         (q.questionId || q.id) === id
  //           ? {
  //               ...q,
  //               isLiked: q.isLiked === "liked" ? "" : "liked",
  //               whyDislike: q.isLiked === "liked" ? "" : q.whyDislike, // Clear dislike reason when liking
  //             }
  //           : q
  //       );
  //     } else {
  //       const originalQuestion = feedbackData?.questionFeedback?.find(
  //         (f) => (f.questionId || f._id) === id
  //       );

  //       if (originalQuestion) {
  //         return [
  //           ...prev,
  //           {
  //             ...originalQuestion,
  //             questionId: id,
  //             isLiked: "liked",
  //             whyDislike: "", // Clear dislike reason
  //             note: originalQuestion.interviewerFeedback?.note || "",
  //             notesBool: !!originalQuestion.interviewerFeedback?.note,
  //           },
  //         ];
  //       }

  //       return prev;
  //     }
  //   });

  //   if (dislikeQuestionId === id) setDislikeQuestionId(null);
  // };

  const handleLikeToggle = (id) => {
    if (isViewMode) return;

    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id || q._id) === id);

      if (questionExists) {
        const updated = prev.map((q) =>
          (q.questionId || q.id || q._id) === id
            ? {
              ...q,
              isLiked: q.isLiked === "liked" ? "" : "liked",
              whyDislike: q.isLiked === "liked" ? "" : q.whyDislike,
            }
            : q,
        );

        // Trigger auto-save after change
        triggerDebouncedSave();

        return updated;
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === id,
        );

        if (originalQuestion) {
          const newData = [
            ...prev,
            {
              ...originalQuestion,
              questionId: id,
              isLiked: "liked",
              whyDislike: "",
              note: originalQuestion.interviewerFeedback?.note || "",
              notesBool: !!originalQuestion.interviewerFeedback?.note,
            },
          ];

          // Trigger auto-save after change
          triggerDebouncedSave();

          return newData;
        }

        return prev;
      }
    });

    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  };

  const noteTimeoutRef = useRef(null);

  const handleDislikeToggle = (id) => {
    if (isViewMode) return;

    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id || q._id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id || q._id) === id
            ? {
              ...q,
              isLiked: q.isLiked === "disliked" ? "" : "disliked",
            }
            : q,
        );
      } else {
        const originalQuestion = flattenQuestionFeedback(feedbackData?.questionFeedback).find(
          (f) => (f.questionId || f._id || f.id) === id,
        );

        if (originalQuestion) {
          return [
            ...prev,
            {
              ...originalQuestion,
              questionId: id,
              isLiked: "disliked",
              note: originalQuestion.interviewerFeedback?.note || "",
              notesBool: !!originalQuestion.interviewerFeedback?.note,
            },
          ];
        }

        // IMMEDIATE auto-save
        // Trigger auto-save after change
        triggerDebouncedSave();

        return prev;
      }
    });

    if (dislikeQuestionId === id) setDislikeQuestionId(null);
    else setDislikeQuestionId(id);
  };

  // v1.0.5 <--------------------------------------------------------
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
                    className="accent-custom-blue"
                    onChange={(e) =>
                      onChangeDislikeRadioInput(
                        each.questionId || each.id || each._id,
                        e.target.value,
                      )
                    }
                  />
                  <label
                    htmlFor={`dislike-${each.questionId || each.id}-${option.value
                      }`}
                    className="text-sm cursor-pointer"
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
  // v1.0.5 -------------------------------------------------------->

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

  // v1.0.5 <-----------------------------------------------------
  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex sm:flex-col md:flex-col lg:flex-col  xl:flex-col  2xl:flex-col  rounded-md mt-2">
        <p className="sm:text-sm md:text-sm w-[200px] font-bold text-gray-700 sm:mb-2 md:mb-2">
          Response Type{" "}
          {(each.mandatory === "true" ||
            each.snapshot?.mandatory === "true") && (
              <span className="text-[red]">*</span>
            )}
        </p>
        <div
          className={`w-full grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-x-8 gap-y-2`}
        >
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
                      each.questionId || each._id || each.id,
                      e.target.value,
                    )
                  }
                  className="accent-custom-blue whitespace-nowrap text-sm"
                  disabled={isViewMode}
                />
                <label
                  htmlFor={`isAnswered-${each.questionId || each.id}-${option}`}
                  className="text-sm cursor-pointer"
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
  // v1.0.5 ----------------------------------------------------->
  console.log(
    "interviewerSection",
    interviewerSectionData,
    "Or",
    ...questionsWithFeedback,
  );
  return (
    // v1.0.5 <-----------------------------------------------------------------
    <>
      <div className="relative px-2 pt-2 space-y-2">
        <div className="flex justify-between items-center">
          {/* v1.0.4 <----------------------------------------------------------------------------- */}
          <div className="flex sm:flex-col sm:justify-start sm:items-start items-center sm:gap-1 gap-4 mt-4">
            {/* v1.0.4 -----------------------------------------------------------------------------> */}
            <p>
              <b>Note:</b>
            </p>
            <p className="text-sm para-value text-gray-500">
              The questions listed below are interviewer's choice.
            </p>
          </div>
          {isViewMode || decodedData?.schedule ? (
            <div></div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="text-sm flex items-center gap-2 px-4 py-2 bg-[#227a8a] text-white rounded-lg hover:bg-[#1a5f6b] transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
                onClick={openQuestionBank}
                title="Add Question from Question Bank"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
                <span className="sm:hidden inline">Question</span>
              </button>
            </div>
          )}
        </div>
        {/* <div className="space-y-4">
          {(() => {
            // Get the data to display based on mode
            let displayData;

            if (isEditMode || isAddMode) {
              // Create a map to prioritize interviewerSectionData over questionsWithFeedback
              const questionMap = new Map();

              // First add all questions from questionsWithFeedback
              (questionsWithFeedback || []).forEach((question) => {
                const id = question.questionId || question._id || question.id;
                if (id) {
                  questionMap.set(id, question);
                }
              });

              // Then override with questions from interviewerSectionData (these have latest edits)
              (interviewerSectionData || []).forEach((question) => {
                const id = question.questionId || question._id || question.id;
                if (id) {
                  questionMap.set(id, question);
                }
              });

              displayData = Array.from(questionMap.values());
            } else {
              displayData = questionsWithFeedback || [];
            }

            return displayData.length > 0 ? (
              displayData.map((question) => {
                // Get question data from snapshot or root level
                const questionText =
                  question.snapshot?.questionText ||
                  question.snapshot?.snapshot?.questionText ||
                  question.question ||
                  "N/A";
                const expectedAnswer =
                  question.snapshot?.correctAnswer ||
                  question.snapshot?.snapshot?.correctAnswer ||
                  question.expectedAnswer ||
                  "N/A";
                const skill =
                  question.snapshot?.technology?.[0] ||
                  question.snapshot?.snapshot?.technology?.[0] ||
                  question.snapshot?.category?.[0] ||
                  question.snapshot?.snapshot?.category?.[0] ||
                  question.snapshot?.skill ||
                  question.category ||
                  "N/A";
                const difficulty =
                  question.snapshot?.difficultyLevel ||
                  question.snapshot?.snapshot?.difficultyLevel ||
                  question.difficulty ||
                  "N/A";

                return (
                  <div
                    key={question.questionId || question._id || question.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                        {skill}
                      </span>
                      <span className="text-sm text-gray-500">
                        {difficulty}
                      </span>
                    </div>
                    <h3 className="sm:text-sm font-semibold text-gray-800 mb-2">
                      {questionText}
                    </h3>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Expected Answer:
                      </p>
                      <p className="text-sm text-gray-700">{expectedAnswer}</p>
                    </div>
                    {(isEditMode || isAddMode) && (
                      <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                        <span>
                          Mandatory:{" "}
                          {question.mandatory === "true" ||
                          question.snapshot?.mandatory === "true"
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    )}
                    <div className="flex sm:flex-col sm:items-start items-center justify-between gap-2 mt-2">
                      <RadioGroupInput each={question} />
                      <div className="flex items-center gap-4 mt-2">
                        {(isEditMode || isAddMode) && (
                          <button
                            className={`text-sm py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                            onClick={() =>
                              onClickAddNote(
                                question.questionId ||
                                  question.id ||
                                  question._id
                              )
                            }
                          >
                            {question.notesBool ? "Delete Note" : "Add a Note"}
                          </button>
                        )}
                        <SharePopupSection />
                        {(isEditMode || isViewMode || isAddMode) && (
                          <>
                            <span
                              className={`transition-transform hover:scale-110 duration-300 ease-in-out  ${
                                question.isLiked === "liked"
                                  ? "text-green-700"
                                  : ""
                              }`}
                              onClick={() =>
                                handleLikeToggle(
                                  question.questionId ||
                                    question._id ||
                                    question.id
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
                                  question.questionId ||
                                    question._id ||
                                    question.id
                                )
                              }
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {question.notesBool && (
                      <div>
                        <div className="flex flex-col justify-start mt-4">
                          <label
                            htmlFor={`note-input-${
                              question.questionId || question.id || question._id
                            }`}
                            className="w-[170px] font-bold text-gray-700"
                          >
                            Note
                          </label>
                          {isEditMode || isAddMode ? (
                            <div className="flex flex-col items-start w-full h-[80px]">
                              <div className="w-full relative rounded-md">
                                <input
                                  className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                                  id={`note-input-${
                                    question.questionId ||
                                    question.id ||
                                    question._id
                                  }`}
                                  type="text"
                                  value={question.note || ""}
                                  onChange={(e) =>
                                    onChangeInterviewQuestionNotes(
                                      question.questionId ||
                                        question.id ||
                                        question._id,
                                      e.target.value.slice(0, 250)
                                    )
                                  }
                                  placeholder="Add your note here"
                                />
                              </div>
                              <span className="w-full text-sm text-right text-gray-500">
                                {question.note?.length || 0}/250
                              </span>
                            </div>
                          ) : (
                            <p className="w-full flex gap-x-8 gap-y-2 text-sm text-gray-500">
                              {question.note}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {(dislikeQuestionId ===
                      (question.questionId || question._id || question.id) ||
                      !!question.whyDislike) && (
                      <DisLikeSection each={question} />
                    )}
                  </div>
                );
              })
            ) : (
              // Empty state when no questions are present
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <Plus className="mx-auto h-5 w-5 mb-2" />
                  <p className="text-lg font-medium">
                    No interviewer questions found
                  </p>
                  <p className="text-sm">
                    No questions have been added by interviewers for this round
                  </p>
                </div>
              </div>
            );
          })()}
        </div> */}

        <div className="space-y-4">
          {questionsWithFeedback?.length > 0 ? (
            // Render merged interviewer questions with feedback applied
            questionsWithFeedback.map((question) => (
              <QuestionCard
                key={question.questionId || question._id}
                question={question}
                mode={isEditMode || isAddMode ? "edit" : "view"}
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
              message="No interviewer questions found"
              subMessage="No questions have been added by interviewers for this round"
              icon="Plus"
            />
          )}
        </div>
      </div>

      {/* QuestionBank Modal */}
      {isQuestionBankOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 min-h-screen"
          onClick={() => setIsQuestionBankOpen(false)}
        >
          <div
            className="bg-white rounded-md w-[96%] max-h-[90vh] overflow-y-auto sm:px-2  px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-3 px-4  flex items-center justify-between">
              <h2 className="text-xl text-custom-blue  font-semibold">
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
                interviewQuestionsLists={[interviewerSectionData, ...preselectedQuestionsResponses] || []}
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
    </>
    // v1.0.5 ----------------------------------------------------------------->
  );
};

export default InterviewerSectionComponent;
