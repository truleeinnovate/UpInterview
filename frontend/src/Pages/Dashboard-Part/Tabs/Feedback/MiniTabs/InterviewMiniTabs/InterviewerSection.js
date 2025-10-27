/* eslint-disable react-hooks/exhaustive-deps */
//<----v1.0.0---Venkatesh-----open selected question on load
//<----v1.0.1---Venkatesh-----update selected question on load from question bank
////<---v1.0.2-----Venkatesh-----solved edit mode issues
//<----v1.0.3-----Venkatesh-----disable like and dislike in view mode
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Fixed responsiveness issues

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FaTrash, FaPlus } from "react-icons/fa";
import Popup from "reactjs-popup";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { X } from "lucide-react";
import QuestionBank from "../../../../Tabs/QuestionBank-Tab/QuestionBank.jsx";

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
}) => {
  // Get all questions from interviewData and filter for interviewer-added questions
  const location = useLocation();
  const rawFeedbackData = location.state?.feedback;
  // const feedbackData = React.useMemo(() => rawFeedbackData || {}, [rawFeedbackData] || interviewData?.questionFeedback);
  const feedbackData = React.useMemo(() => {
    return rawFeedbackData || interviewData || {};
  }, [rawFeedbackData, interviewData]);
  console.log("isEditMode", isEditMode);

  // console.log("feedbackData",interviewData?.questionFeedback);

  // Get interviewer-added questions from the new API structure
  const rawInterviewerAddedQuestionsFromAPI =
    interviewData?.interviewQuestions?.interviewerAddedQuestions;
  const interviewerAddedQuestionsFromAPI = React.useMemo(
    () => rawInterviewerAddedQuestionsFromAPI || [],
    [rawInterviewerAddedQuestionsFromAPI]
  );
  const rawInterviewQuestions =
    interviewData?.interviewQuestions || interviewerSectionData;
  const allQuestions = React.useMemo(() => {
    if (feedbackData?.preSelectedQuestions)
      return feedbackData.preSelectedQuestions;
    return rawInterviewQuestions || [];
  }, [feedbackData, rawInterviewQuestions]);

  // console.log("rawInterviewQuestions",rawInterviewQuestions);

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
        (question) => question.addedBy === "interviewer"
      );
    }
    return [];
  }, [interviewerAddedQuestionsFromAPI, allQuestions]);

  // console.log("InterviewerSection - interviewer added questions from API:", interviewerAddedQuestionsFromAPI.length);
  // console.log("InterviewerSection - feedbackData:", filteredInterviewerQuestions);

  // console.log("InterviewerSection - all questions:", allQuestions.length);
  // console.log("InterviewerSection - interviewerSectionData:", interviewerSectionData?.length || 0);
  // console.log("InterviewerSection - filtered interviewer questions:", filteredInterviewerQuestions?.length || 0);
  // console.log("InterviewerSection - combined questions:", (interviewerSectionData?.length || 0) + (filteredInterviewerQuestions?.length || 0));
  // console.log("InterviewerSection - filtered interviewer questions data:", filteredInterviewerQuestions);
  ////<---v1.0.2-----
  // Merge persisted feedback into interviewer questions without overwriting current UI state
  const questionsWithFeedback = React.useMemo(() => {
  
    const existingQuestions = filteredInterviewerQuestions || [];

    // Get newly added questions from interviewerSectionData that are not in existing questions
    // const newlyAddedQuestions = (interviewerSectionData || []).filter(newQ => {
    //   const newId = newQ.questionId || newQ._id || newQ.id;
    //   return !existingQuestions.some(existingQ => {
    //     const existingId = existingQ.questionId || existingQ._id || existingQ.id;
    //     return existingId === newId;
    //   });

    // });
      const newlyAddedQuestions = (interviewerSectionData || []).filter(
    (newQ) => {
      const newId = newQ.questionId || newQ._id || newQ.id;
      const isNotDuplicate = !existingQuestions.some((existingQ) => {
        const existingId = existingQ.questionId || existingQ._id || existingQ.id;
        return existingId === newId;
      });
      const isAddedByInterviewer = (newQ.addedBy || newQ.snapshot?.addedBy) === "interviewer";
      return isNotDuplicate && isAddedByInterviewer;
    }
  );
    // const newlyAddedQuestions = (interviewerSectionData || []).filter(
    //   (newQ) => {
    //     const newId = newQ.questionId || newQ._id || newQ.id;
    //     const isNotDuplicate = !existingQuestions.some((existingQ) => {
    //       const existingId =
    //         existingQ.questionId || existingQ._id || existingQ.id;
    //       return existingId === newId;
    //     });
    //     const isAddedByInterviewer =
    //       (newQ.addedBy || newQ.snapshot?.addedBy) === "interviewer";
    //     return isNotDuplicate && isAddedByInterviewer;
    //   }
    // );

    // Combine both arrays
    
    const allCombinedQuestions = [...existingQuestions, ...newlyAddedQuestions];

    const shouldApplyFeedback =
      (isEditMode || isViewMode || isAddMode) &&
      feedbackData &&
      Array.isArray(feedbackData.questionFeedback) &&
      feedbackData.questionFeedback.length > 0;
    console.log("shouldApplyFeedback", shouldApplyFeedback, isAddMode);

    if (!shouldApplyFeedback) return allCombinedQuestions;
    const feedbackMap = feedbackData.questionFeedback.reduce((acc, f) => {
      const k = f.questionId || f._id;
      if (!k) return acc;
      acc[k] = f;
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
      console.log("item", item);
      const id = item.questionId || item._id;
      const f = id ? feedbackMap[id] : null;
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
        merged.notesBool = true;
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
  ////---v1.0.2----->

  console.log("questionsWithFeedback", questionsWithFeedback);

  // const [interviewerSection, setInterviewerSection] = useState(
  //   isAddMode ? [] : [

  //   ]
  // );

  // Fixed version:
  // const [interviewerSection, setInterviewerSection] = useState(() => {
  //   if (isEditMode) {
  //     // In edit mode, use the questions with feedback data
  //     return questionsWithFeedback || [];
  //   } else if (isAddMode) {
  //     // In add mode, start with empty array or existing data
  //     return interviewerSectionData || [];
  //   } else {
  //     // View mode or other cases
  //     return questionsWithFeedback || [];
  //   }
  // });

  // Fixed version of useState initialization
// const [interviewerSection, setInterviewerSection] = useState(() => {
//   if (isEditMode || isViewMode) {
//     // In edit/view mode, use the questions with feedback data
//     return questionsWithFeedback || [];
//   } else if (isAddMode) {
//     // In add mode, start with existing data or empty array
//     return interviewerSectionData || [];
//   } else {
//     // Default case
//     return [];
//   }
// });

// Enhanced state initialization
const [interviewerSection, setInterviewerSection] = useState(() => {
  // For initial load, use the data that's already passed in
  if (interviewerSectionData && interviewerSectionData.length > 0) {
    return interviewerSectionData;
  }
  if ((isEditMode || isViewMode) && questionsWithFeedback && questionsWithFeedback.length > 0) {
    return questionsWithFeedback;
  }
  return [];
});

  // const [interviewerSection, setInterviewerSection] = useState(() => {
  //   return isAddMode || isEditMode ? questionsWithFeedback : [];
  // });

  //<----v1.0.0---
  const [selectedQuestion, setSelectedQuestion] = useState(
    interviewerSection.length > 0 ? interviewerSection[0].id : null
  );
  //<----v1.0.1---
  const [sectionName, setSectionName] = useState("Interviewer Section");
  const [roundId, setRoundId] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [type, setType] = useState("Feedback");
  const [questionBankPopupVisibility, setQuestionBankPopupVisibility] =
    useState(true);
  //----v1.0.1--->

  // Add this useEffect to sync data
  // useEffect(() => {
  //   if (isEditMode && questionsWithFeedback) {
  //     setInterviewerSection(questionsWithFeedback);
  //     // Also update the parent data if needed
  //     if (setInterviewerSectionData) {
  //       setInterviewerSectionData(questionsWithFeedback);
  //     }
  //   }
  // }, [questionsWithFeedback, isEditMode, setInterviewerSectionData]);


// REPLACE with this stable version:
useEffect(() => {
  // Only update if we're in edit/view mode and have questions with feedback
  if ((isEditMode || isViewMode) && questionsWithFeedback && questionsWithFeedback.length > 0) {
    const currentIds = interviewerSection.map(q => q.questionId || q.id).sort().join(',');
    const newIds = questionsWithFeedback.map(q => q.questionId || q.id).sort().join(',');
    
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
        (q) => (q.questionId || q.id) === questionId
      );

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, note: notes, notesBool: true,
               ...(isEditMode && { isEdited: true }) // Mark as edited in edit mode
             }
            : q
        );
      } else {
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === questionId
        );

        if (originalQuestion) {
          return [
            ...prev,
            {
              ...originalQuestion,
              questionId: questionId,
              note: notes,
              notesBool: true,
                addedBy: 'interviewer',
            ...(isEditMode && { isEdited: true })
            },
          ];
        }

        return prev;
      }
    });
  };

  const onClickAddNote = (id) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id ? { ...q, notesBool: !q.notesBool } : q
        );
      } else {
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === id
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
      const questionExists = prev.some((q) => (q.questionId || q.id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? { ...q, notesBool: false, note: "" }
            : q
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
    [isQuestionBankOpen]
  );

  // const updateQuestionsInAddedSectionFromQuestionBank = (questions) => {
  //   console.log("Updating questions from question bank:", questions);

  //   if (questions && questions.length > 0) {
  //     // Transform questions to match the interviewer section format
  //     const newQuestions = questions.map((question, index) => ({
  //       id: Date.now() + index, // Generate unique ID
  //       question: question.question || question.title || "N/A",
  //       expectedAnswer: question.expectedAnswer || question.answer || "N/A",
  //       category: question.category || "N/A",
  //       difficulty: question.difficulty || "N/A",
  //       //addedBy: 'interviewer',
  //       mandatory: question.mandatory || false,
  //       isAnswered: "Not Answered",
  //       notesBool: false,
  //       note: "",
  //     }));

  //     // Add new questions to the existing interviewer section
  //     setInterviewerSection((prev) => [...prev, ...newQuestions]);

  //     // Update interviewerSectionData as well
  //     const newQuestionsData = newQuestions.map((q) => ({
  //       ...q,
  //       isAnswered: "Not Answered",
  //       isLiked: "",
  //       whyDislike: "",
  //       notesBool: false,
  //       note: "",
  //       //addedBy: 'interviewer',
  //     }));
  //     setInterviewerSectionData((prev) => [...prev, ...newQuestionsData]);

  //     // Close the question bank after adding questions
  //     setIsQuestionBankOpen(false);
  //   }
  // };

  // const onClickDeleteNote = (id) => {
  //   setInterviewerSectionData((prev) =>
  //     prev.map((question) =>
  //       (question.questionId || question.id) === id ? { ...question, notesBool: false, note: "" } : question
  //     )
  //   );
  // };

  // Function to handle delete note

 const updateQuestionsInAddedSectionFromQuestionBank = (questions) => {
  console.log("Updating questions from question bank:", questions);

  if (questions && questions.length > 0) {
    const newQuestions = questions.map((question, index) => ({
      id: question._id || `qb-${Date.now()}-${index}`, // Use question ID if available
      questionId: question._id, // Store the original question ID
      question: question.question || question.title || "N/A",
      expectedAnswer: question.expectedAnswer || question.answer || "N/A",
      category: question.category || "N/A",
      difficulty: question.difficulty || "N/A",
      mandatory: question.mandatory || false,
      isAnswered: "Not Answered",
      notesBool: false,
      note: "",
      addedBy: 'interviewer',
      // Edit mode specific fields
      ...((isEditMode || isAddMode) && {
        isEdited: true,
        originalData: question,
      }),
    }));

    // Update local state
    setInterviewerSection((prev) => {
      const existingIds = new Set(prev.map(q => q.questionId || q.id));
      const uniqueNewQuestions = newQuestions.filter(q => !existingIds.has(q.questionId || q.id));
      return [...prev, ...uniqueNewQuestions];
    });

    // Update parent data - this should trigger the parent to re-render properly
    setInterviewerSectionData((prev) => {
      const existingIds = new Set(prev.map(q => q.questionId || q.id));
      const uniqueNewQuestions = newQuestions.filter(q => !existingIds.has(q.questionId || q.id));
      return [...prev, ...uniqueNewQuestions];
    });
    
    setIsQuestionBankOpen(false);
  }
};

  // const onClickDeleteNote = (id) => {
  //   setInterviewerSectionData((prev) =>
  //     prev.map((q) => (q._id === id ? { ...q, notesBool: false, note: "" } : q))
  //   );

  //   // Update preselected questions responses
  //   // if (handlePreselectedQuestionResponse) {
  //   //   const question = schedulerQuestionsData.find(q => q._id === id);
  //   //   const bankQuestionId = question?.questionId || id;
  //   //   handlePreselectedQuestionResponse(bankQuestionId, { notesBool: false, note: "" });
  //   // }
  // };

  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const questionRef = useRef(); // For future use, e.g., scrolling to a specific question

  // Fixed radio input handler
  const onChangeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some(
        (q) => (q.questionId || q.id) === questionId
      );

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, isAnswered: value,
                    ...(isEditMode && { isEdited: true }) // Mark as edited
             }
            : q
        );
      } else {
        // Find the question in original feedback data and create new entry
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === questionId
        );

        if (originalQuestion) {
          return [
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
               addedBy: 'interviewer',
            ...(isEditMode && { isEdited: true })
            },
          ];
        }

        return prev;
      }
    });
  };

  // Fixed dislike radio input handler
  const onChangeDislikeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) => {
      const questionExists = prev.some(
        (q) => (q.questionId || q.id) === questionId
      );

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === questionId
            ? { ...q, whyDislike: value, isLiked: "disliked" }
            : q
        );
      } else {
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === questionId
        );

        if (originalQuestion) {
          return [
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
        }

        return prev;
      }
    });
  };

  // Fixed like/dislike toggle handlers
  const handleLikeToggle = (id) => {
    if (isViewMode) return;

    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? {
                ...q,
                isLiked: q.isLiked === "liked" ? "" : "liked",
                whyDislike: q.isLiked === "liked" ? "" : q.whyDislike, // Clear dislike reason when liking
              }
            : q
        );
      } else {
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === id
        );

        if (originalQuestion) {
          return [
            ...prev,
            {
              ...originalQuestion,
              questionId: id,
              isLiked: "liked",
              whyDislike: "", // Clear dislike reason
              note: originalQuestion.interviewerFeedback?.note || "",
              notesBool: !!originalQuestion.interviewerFeedback?.note,
            },
          ];
        }

        return prev;
      }
    });

    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  };

  const handleDislikeToggle = (id) => {
    if (isViewMode) return;

    setInterviewerSectionData((prev) => {
      const questionExists = prev.some((q) => (q.questionId || q.id) === id);

      if (questionExists) {
        return prev.map((q) =>
          (q.questionId || q.id) === id
            ? {
                ...q,
                isLiked: q.isLiked === "disliked" ? "" : "disliked",
              }
            : q
        );
      } else {
        const originalQuestion = feedbackData?.questionFeedback?.find(
          (f) => (f.questionId || f._id) === id
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
                <IoIosCloseCircleOutline />
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
                        each.questionId || each.id,
                        e.target.value
                      )
                    }
                  />
                  <label
                    htmlFor={`dislike-${each.questionId || each.id}-${
                      option.value
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
      <div className="flex sm:flex-col md:flex-col lg:flex-col rounded-md mt-2">
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
                      each.questionId || each._id,
                      e.target.value
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
            )
          )}
        </div>
      </div>
    );
  });
  // v1.0.5 ----------------------------------------------------->

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
          {isViewMode  || decodedData?.schedule ? (
            <div></div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="text-sm flex items-center gap-2 px-4 py-2 bg-[#227a8a] text-white rounded-lg hover:bg-[#1a5f6b] transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
                onClick={openQuestionBank}
                title="Add Question from Question Bank"
              >
                <FaPlus className="text-sm" />
                <span>Add</span>
                <span className="sm:hidden inline">Question</span>
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {questionsWithFeedback?.length > 0 ? (
            // Render merged interviewer questions with feedback applied
            questionsWithFeedback.map((question) => (
              <div
                key={question.questionId || question._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                    {question.snapshot?.skill || question.category || "N/A"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {question.snapshot?.difficultyLevel ||
                      question.difficulty ||
                      "N/A"}
                  </span>
                </div>
                <h3 className="sm:text-sm font-semibold text-gray-800 mb-2">
                  {question.snapshot?.questionText ||
                    question?.question ||
                    "N/A"}
                </h3>
                {/* {question.expectedAnswer && ( */}
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
                          onClickAddNote(question.questionId || question.id)
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
                            question.isLiked === "liked" ? "text-green-700" : ""
                          }`}
                          onClick={() =>
                            handleLikeToggle(
                              question.questionId || question._id
                            )
                          }
                        >
                          <SlLike />
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
                          <SlDislike />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {question.notesBool && (
                  <div>
                    {/* v1.0.4 <------------------------------------------------------ */}
                    <div className="flex flex-col justify-start mt-4">
                      {/* v1.0.4 ------------------------------------------------------> */}
                      <label
                        htmlFor={` note-input-${question.questionId}`}
                        className="w-[170px] font-bold text-gray-700"
                      >
                        Note
                      </label>
                      {isEditMode || isAddMode ? (
                        <div className="flex flex-col items-start w-full h-[80px]">
                          <div className="w-full relative  rounded-md ">
                            <input
                              className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                              id={`note-input-${question.questionId}`}
                              type="text"
                              value={question.note}
                              onChange={(e) =>
                                onChangeInterviewQuestionNotes(
                                  question.questionId,
                                  e.target.value.slice(0, 250)
                                )
                              }
                              placeholder="Add your note here"
                            />
                          </div>
                          <span className="w-full text-sm text-right text-gray-500">
                            {question.note?.length || 0}/250
                          </span>

                          {/* <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                                  {question.note?.length || 0}/250
                                </span> */}
                        </div>
                      ) : (
                        <p className="w-full flex gap-x-8 gap-y-2 text-sm text-gray-500">
                          {question.note}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {(dislikeQuestionId === (question.questionId || question._id) ||
                  !!question.whyDislike) && <DisLikeSection each={question} />}

                {/* )} */}
              </div>
            ))
          ) : (
            // Empty state when no questions are present
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="text-gray-500 mb-4">
                <FaPlus className="mx-auto text-4xl mb-2" />
                <p className="text-lg font-medium">
                  No interviewer questions found
                </p>
                <p className="text-sm">
                  No questions have been added by interviewers for this round
                </p>
              </div>
            </div>
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
    </>
    // v1.0.5 ----------------------------------------------------------------->
  );
};

export default InterviewerSectionComponent;
