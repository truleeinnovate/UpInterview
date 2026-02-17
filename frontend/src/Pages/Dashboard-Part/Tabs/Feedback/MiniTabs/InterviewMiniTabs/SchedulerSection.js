//<----v1.0.0---Venkatesh-----disable like and dislike in view mode
// v1.0.1 - Ashok - Improved responsiveness
// v1.0.2 - Ashok - Fixed responsiveness issues

/* eslint-disable no-lone-blocks */
import React, { useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import { ThumbsUp, ThumbsDown, XCircle } from "lucide-react";
import { useEffect } from "react";
import QuestionCard, { EmptyState } from "../../../../../../Components/QuestionCard";

// Define dislike options
const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const SchedulerSectionComponent = ({
  isEditMode,
  isAddMode,
  interviewdata,
  isViewMode,
  roundId,
  interviewType,
  preselectedQuestionsResponses,
  setPreselectedQuestionsResponses,
  handlePreselectedQuestionResponse,
  isSchedule,
  triggerAutoSave,
  feedbackDataResponse

}) => {
  const saveTimeoutRef = useRef(null);

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
  const location = useLocation();
  const feedbackData = useMemo(() => location.state?.feedback || {}, [location.state]);

  // console.log("SchedulerSectionComponent interviewdata", interviewdata);

  // Get preselected questions from the new API structure
  const preselectedQuestionsFromAPI = useMemo(() =>
    interviewdata?.interviewQuestions?.preselectedQuestions ||
    interviewdata?.questionFeedback ||
    [], [interviewdata]);

  const allQuestions = useMemo(() => interviewdata?.interviewQuestions
    ? interviewdata?.interviewQuestions || interviewdata?.questionFeedback
    : feedbackData.preSelectedQuestions || [], [interviewdata, feedbackData]);

  // Use preselected questions from API if available, otherwise fallback to old logic
  // const schedulerQuestions = preselectedQuestionsFromAPI.length > 0
  //   ? preselectedQuestionsFromAPI
  //   : (Array.isArray(allQuestions)
  //       ? allQuestions.filter(question => question.addedBy !== "interviewer" || !question.addedBy)
  //       : []);

  // FIXED FILTERING LOGIC: Filter out questions added by interviewer
  const schedulerQuestions = useMemo(() =>
    preselectedQuestionsFromAPI.length > 0
      ? preselectedQuestionsFromAPI.filter((question) => {
        // console.log(
        //   "Filtering question",
        //   question.questionId,
        //   "addedBy:",
        //   question.addedBy,
        // );
        // Exclude questions added by interviewer
        return question.addedBy !== "interviewer";
      })
      : Array.isArray(allQuestions)
        ? allQuestions.filter((question) => {
          // Exclude questions added by interviewer
          if (question.addedBy === "interviewer") {
            return false;
          }

          // Additional logic: Keep questions that have feedback even if they were added by interviewer
          // (This is commented out as per your requirement to completely exclude interviewer questions)
          // const hasFeedback = questionsfeedback.some(f => f.questionId === question.questionId);
          // return question.addedBy !== "interviewer" || hasFeedback;

          return true;
        })
        : [], [preselectedQuestionsFromAPI, allQuestions]);

  // console.log("schedulerQuestions after filtering:", schedulerQuestions);

  const questionsfeedback = useMemo(() => {
    // Check direct questionFeedback first, then look inside feedbacks array (API response structure)
    if (feedbackData.questionFeedback) return feedbackData.questionFeedback;
    if (interviewdata?.questionFeedback) return interviewdata.questionFeedback;
    if (Array.isArray(interviewdata?.feedbacks) && interviewdata.feedbacks.length > 0) {
      return interviewdata.feedbacks[0].questionFeedback || [];
    }
    return [];

  }, [feedbackData, interviewdata]);

  const isSubmitted = feedbackDataResponse?.status === "submitted" || feedbackDataResponse?.status === "Submitted";
  const isReadOnly = isViewMode || isSubmitted;

  // Initialize state variables
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const noteTimeoutRef = useRef(null);

  // Helper to map backend/stored answerType to UI label
  const mapAnswerTypeToLabel = (type) => {
    if (!type) return "Not Answered";
    if (type === "correct" || type === "Fully Answered")
      return "Fully Answered";
    if (type === "partial" || type === "Partially Answered")
      return "Partially Answered";
    if (
      type === "incorrect" ||
      type === "wrong" ||
      type === "Not Answered" ||
      type === "not answered"
    )
      return "Not Answered";
    return "Not Answered";
  };

  const mapQuestionsToState = useCallback(() => {
    return schedulerQuestions.map((q) => {
      // Find feedback for this question - match by _id (InterviewQuestions ID)
      const feedback = questionsfeedback?.find(
        (f) => String(f._id) === String(q._id),
      );
      // Find preselected response for this question
      const preselectedResponse = preselectedQuestionsResponses?.find(
        (r) => String(r._id) === String(q._id) || r.questionId === q.questionId,
      );

      console.log("preselectedResponse question", preselectedResponse);

      if (feedback) {
        const backendAnswerType =
          feedback.candidateAnswer?.answerType || q.candidateAnswer?.answerType;
        return {
          ...q,
          candidateAnswer:
            feedback.candidateAnswer || q.candidateAnswer || null,
          interviewerFeedback:
            feedback.interviewerFeedback || q.interviewerFeedback || null,
          isAnswered: backendAnswerType
            ? mapAnswerTypeToLabel(backendAnswerType)
            : preselectedResponse?.isAnswered || "Not Answered",
          isLiked:
            feedback.interviewerFeedback?.liked ||
            preselectedResponse?.isLiked ||
            q.interviewerFeedback?.liked ||
            "",
          whyDislike:
            feedback.interviewerFeedback?.dislikeReason ||
            preselectedResponse?.whyDislike ||
            q.interviewerFeedback?.dislikeReason ||
            "",
          notesBool:
            !!feedback.interviewerFeedback?.note ||
            preselectedResponse?.notesBool ||
            q.interviewerFeedback?.note ||
            false,
          note:
            feedback.interviewerFeedback?.note ||
            preselectedResponse?.note ||
            q.interviewerFeedback?.note ||
            "",
        };
      } else {
        return {
          ...q,
          candidateAnswer: null,
          interviewerFeedback: null,
          isAnswered:
            preselectedResponse?.isAnswered || q.isAnswered || "Not Answered",
          isLiked: preselectedResponse?.isLiked || q.isLiked || "",
          whyDislike: preselectedResponse?.whyDislike || q.whyDislike || "",
          notesBool: preselectedResponse?.notesBool || q.notesBool || false,
          note: preselectedResponse?.note || q.note || "",
        };
      }
    });
  }, [schedulerQuestions, questionsfeedback, preselectedQuestionsResponses]);

  const [schedulerQuestionsData, setSchedulerQuestionsData] = useState(() => mapQuestionsToState());

  // Only sync on initial data load (not on refetch during active editing)
  const hasSchedulerInitRef = useRef(false);

  useEffect(() => {
    if (hasSchedulerInitRef.current) return;
    const data = mapQuestionsToState();
    if (data.length > 0 || schedulerQuestions.length > 0) {
      setSchedulerQuestionsData(data);
      hasSchedulerInitRef.current = true;
    }
  }, [mapQuestionsToState, schedulerQuestions]);

  // Initialize questionRef
  const questionRef = useRef(); // For future use, e.g., scrolling to a specific question

  // Function to handle radio input changes if needed
  const onChangeRadioInput = (id, value) => {
    if (isReadOnly || isSchedule) return;
    setSchedulerQuestionsData((prev) => {
      const questionIndex = prev.findIndex((q) => q._id === id || q.questionId === id || q.id === id);
      if (questionIndex === -1) return prev;

      const newQuestions = [...prev];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], isAnswered: value };
      return newQuestions;
    });

    // Update preselected questions responses using the underlying bank questionId
    if (handlePreselectedQuestionResponse) {
      const q = schedulerQuestionsData.find((qq) => qq._id === id || qq.questionId === id || qq.id === id);
      if (q) {
        const bankQuestionId = q.questionId || q._id || id;
        handlePreselectedQuestionResponse(bankQuestionId, { isAnswered: value });
      }
    }

    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // Function to handle dislike radio input changes
  const onChangeDislikeRadioInput = (questionId, value) => {
    if (isReadOnly || isSchedule) return;
    setSchedulerQuestionsData((prev) =>
      prev.map((question) => {
        if (question._id === questionId || question.questionId === questionId || question.id === questionId) {
          return { ...question, whyDislike: value, isLiked: "disliked" };
        }
        return question;
      }),
    );

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const q = schedulerQuestionsData.find((qq) => qq._id === questionId || qq.questionId === questionId || qq.id === questionId);
      if (q) {
        const bankQuestionId = q.questionId || q._id || questionId;
        handlePreselectedQuestionResponse(bankQuestionId, {
          whyDislike: value,
          isLiked: "disliked",
        });
      }
    }

    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // Function to handle dislike toggle
  // const handleDislikeToggle = (id) => {
  //   if (isViewMode) return;//<----v1.0.0---
  //   if (dislikeQuestionId === id) setDislikeQuestionId(null);
  //   else setDislikeQuestionId(id);
  //   setSchedulerQuestionsData((prev) =>
  //     prev.map((q) =>
  //       q._id === id ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" } : q
  //     )
  //   );

  //   // Update preselected questions responses
  //   if (handlePreselectedQuestionResponse) {
  //     const question = schedulerQuestionsData.find(q => q._id === id);
  //     const newIsLiked = question?.isLiked === "disliked" ? "" : "disliked";
  //     const bankQuestionId = question?.questionId || id;
  //     handlePreselectedQuestionResponse(bankQuestionId, { isLiked: newIsLiked });
  //   }
  // };

  // Function to handle dislike toggle
  const handleDislikeToggle = (id) => {
    if (isReadOnly || isSchedule) return;

    // Find the question first to get robust ID
    const question = schedulerQuestionsData.find((q) => q._id === id || q.questionId === id || q.id === id);
    if (!question) return;

    // Use the reliable ID from the found question, prioritizing questionId to match QuestionCard
    const targetId = question.questionId || question.id || question._id;

    setSchedulerQuestionsData((prev) =>
      prev.map((q) =>
        (q._id === targetId || q.questionId === targetId || q.id === targetId)
          ? {
            ...q,
            isLiked: q.isLiked === "disliked" ? "" : "disliked",
            // Clear dislike reason when toggling off dislike
            whyDislike: q.isLiked === "disliked" ? "" : q.whyDislike,
          }
          : q,
      ),
    );

    // Show/hide the "Tell us more" section
    // Check against targetId derived from question, or the passed id if it matches
    if (dislikeQuestionId === targetId || dislikeQuestionId === id) {
      setDislikeQuestionId(null);
    } else {
      setDislikeQuestionId(targetId);
    }

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const newIsLiked = question.isLiked === "disliked" ? "" : "disliked";
      const bankQuestionId = question.questionId || question._id || id;
      handlePreselectedQuestionResponse(bankQuestionId, {
        isLiked: newIsLiked,
        // Clear dislike reason when toggling off dislike
        whyDislike: newIsLiked === "disliked" ? question.whyDislike : "",
      });
    }

    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // Function to handle like toggle
  // const handleLikeToggle = (id) => {
  //   if (isViewMode) return;//<----v1.0.0---
  //   setSchedulerQuestionsData((prev) =>
  //     prev.map((q) =>
  //       q._id === id ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" } : q
  //     )
  //   );
  //   if (dislikeQuestionId === id) setDislikeQuestionId(null);

  //   // Update preselected questions responses
  //   if (handlePreselectedQuestionResponse) {
  //     const question = schedulerQuestionsData?.find(q => q?._id === id);
  //     const newIsLiked = question?.isLiked === "liked" ? "" : "liked";
  //     const bankQuestionId = question?.questionId || id;
  //     handlePreselectedQuestionResponse(bankQuestionId, { isLiked: newIsLiked });
  //   }
  // };

  // Function to handle like toggle
  const handleLikeToggle = (id) => {
    if (isReadOnly || isSchedule) return;

    const question = schedulerQuestionsData.find((q) => q._id === id || q.questionId === id || q.id === id);
    if (!question) return;

    const targetId = question.questionId || question.id || question._id;

    setSchedulerQuestionsData((prev) =>
      prev.map((q) =>
        (q._id === targetId || q.questionId === targetId || q.id === targetId)
          ? {
            ...q,
            isLiked: q.isLiked === "liked" ? "" : "liked",
            // Clear dislike reason when liking
            whyDislike: q.isLiked === "liked" ? q.whyDislike : "",
          }
          : q,
      ),
    );

    // Hide the "Tell us more" section when liking
    if (dislikeQuestionId === targetId || dislikeQuestionId === id) {
      setDislikeQuestionId(null);
    }

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const newIsLiked = question.isLiked === "liked" ? "" : "liked";
      const bankQuestionId = question.questionId || question._id || id;
      handlePreselectedQuestionResponse(bankQuestionId, {
        isLiked: newIsLiked,
        // Clear dislike reason when liking
        whyDislike: newIsLiked === "liked" ? "" : question.whyDislike,
      });
    }

    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // Function to handle add note
  const onClickAddNote = (id) => {
    if (isReadOnly || isSchedule) return;
    setSchedulerQuestionsData((prev) =>
      prev.map((q) => ((q._id === id || q.questionId === id || q.id === id) ? { ...q, notesBool: !q.notesBool } : q)),
    );

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const question = schedulerQuestionsData.find((q) => q._id === id || q.questionId === id || q.id === id);
      if (question) {
        const newNotesBool = !question.notesBool;
        const bankQuestionId = question.questionId || question._id || id;
        handlePreselectedQuestionResponse(bankQuestionId, {
          notesBool: newNotesBool,
        });
      }
    }
    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // // Function to handle delete note
  // const onClickDeleteNote = (id) => {
  //   setSchedulerQuestionsData((prev) =>
  //     prev.map((q) => (q._id === id ? { ...q, notesBool: false, note: "" } : q))
  //   );

  //   // Update preselected questions responses
  //   if (handlePreselectedQuestionResponse) {
  //     const question = schedulerQuestionsData.find(q => q._id === id);
  //     const bankQuestionId = question?.questionId || id;
  //     handlePreselectedQuestionResponse(bankQuestionId, { notesBool: false, note: "" });
  //   }
  // };

  // Function to handle delete note
  const onClickDeleteNote = (id) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((q) =>
        (q._id === id || q.questionId === id || q.id === id) ? { ...q, notesBool: false, note: "" } : q,
      ),
    );

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const question = schedulerQuestionsData.find((q) => q._id === id || q.questionId === id || q.id === id);
      if (question) {
        const bankQuestionId = question.questionId || question._id || id;
        handlePreselectedQuestionResponse(bankQuestionId, {
          notesBool: false,
          note: "",
        });
      }
    }

    // Trigger auto-save after change
    triggerDebouncedSave();
  };

  // Function to handle interview question notes
  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    if (isReadOnly || isSchedule) return;
    setSchedulerQuestionsData((prev) =>
      prev.map((question) =>
        (question._id === questionId || question.questionId === questionId || question.id === questionId) ? { ...question, note: notes } : question,
      ),
    );

    // Update preselected questions responses
    if (handlePreselectedQuestionResponse) {
      const q = schedulerQuestionsData.find((qq) => qq._id === questionId || qq.questionId === questionId || qq.id === questionId);
      if (q) {
        const bankQuestionId = q.questionId || q._id || questionId;
        handlePreselectedQuestionResponse(bankQuestionId, { note: notes });
      }
    }

    // Debounced auto-save for notes
    triggerDebouncedSave();
  };

  // Add cleanup for timeout:
  // Add useEffect for cleanup (add after other hooks):

  useEffect(() => {
    return () => {
      if (noteTimeoutRef.current) {
        clearTimeout(noteTimeoutRef.current);
      }
    };
  }, []);

  // Define DisLikeSection component
  // v1.0.2 <---------------------------------------------------------------
  const DisLikeSection = React.memo(({ each }) => {
    return (
      <>
        {isEditMode || isAddMode ? (
          <div className="border border-gray-500 w-full p-3 rounded-md mt-2">
            <div className="flex justify-between items-center mb-2">
              <h1>Tell us more :</h1>
              <button disabled={isSchedule || isReadOnly} onClick={() => setDislikeQuestionId(null)}>
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <ul className="flex flex-wrap gap-3">
              {dislikeOptions.map((option) => (
                <li key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`dislike-${each._id}-${option.value}`}
                    name={`dislike-${each._id}`}
                    value={option.value}
                    checked={each.whyDislike === option.value}
                    className="accent-custom-blue"
                    onChange={(e) =>
                      onChangeDislikeRadioInput(each._id || each.questionId || each.id, e.target.value)
                    }
                    disabled={isSchedule || isReadOnly}
                  />
                  <label
                    htmlFor={`dislike-${each._id}-${option.value}`}
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
  // v1.0.2 --------------------------------------------------------------->

  // Define SharePopupSection component
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

  // Define RadioGroupInput component
  // v1.0.2 <-----------------------------------------------------------------------
  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex sm:flex-col md:flex-col lg:flex-col rounded-md mt-2">
        <p className="sm:text-sm md:text-sm w-[200px] font-bold text-gray-700 sm:mb-2 md:mb-2">
          Response Type
          {each.mandatory === "true" && (
            <span className="text-[red] ml-1">*</span>
          )}
        </p>
        {isEditMode || isAddMode ? (
          // <div className={`w-full flex gap-x-2 gap-y-2`}>
          <div
            className={`w-full grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3`}
          >
            {["Not Answered", "Partially Answered", "Fully Answered"].map(
              (option) => (
                <span key={option} className="flex items-center gap-2">
                  <input
                    checked={each.isAnswered === option}
                    value={option}
                    name={`isAnswered-${each._id}`}
                    type="radio"
                    id={`isAnswered-${each._id}-${option}`}
                    onChange={(e) =>
                      onChangeRadioInput(each._id, e.target.value)
                    }
                    disabled={isSchedule || isReadOnly}
                    className="accent-custom-blue whitespace-nowrap text-sm"
                  />
                  <label
                    htmlFor={`isAnswered-${each._id}-${option}`}
                    className="text-sm cursor-pointer"
                  >
                    {option}
                  </label>
                </span>
              ),
            )}
          </div>
        ) : (
          <p className="w-full flex gap-x-8 gap-y-2 ">
            {each.isAnswered || "Not Answered"}
          </p>
        )}
      </div>
    );
  });
  // v1.0.2 ----------------------------------------------------------------------->

  // Return JSX
  return (
    // v1.0.2 <------------------------------------------------------------------------
    <div className="space-y-4">
      {schedulerQuestionsData.length > 0 ? (
        schedulerQuestionsData.map((question) => (
          <QuestionCard
            key={question._id}
            question={question}
            mode={!isReadOnly && (isEditMode || isAddMode) ? "edit" : "view"}
            onNoteAdd={(id) => {
              const q = schedulerQuestionsData.find((sq) => sq._id === id || sq.questionId === id || sq.id === id);
              if (q?.notesBool) {
                onClickDeleteNote(id);
              } else {
                onClickAddNote(id);
              }
            }}
            onNoteChange={onChangeInterviewQuestionNotes}
            onLikeToggle={handleLikeToggle}
            onDislikeToggle={handleDislikeToggle}
            DisLikeSection={DisLikeSection}
            dislikeQuestionId={dislikeQuestionId}
            RadioGroupInput={RadioGroupInput}
            SharePopupSection={SharePopupSection}
            isViewMode={isViewMode}
          />
        ))
      ) : (
        <EmptyState
          message="No preselected questions found"
          subMessage="No questions have been preselected for this round"
        />
      )}
    </div>
    // v1.0.2 ------------------------------------------------------------------------>
  );
};

// Export SchedulerSectionComponent
export default SchedulerSectionComponent;
