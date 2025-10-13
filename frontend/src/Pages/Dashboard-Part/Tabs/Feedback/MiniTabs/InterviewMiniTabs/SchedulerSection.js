//<----v1.0.0---Venkatesh-----disable like and dislike in view mode
// v1.0.1 - Ashok - Improved responsiveness

/* eslint-disable no-lone-blocks */
import React, { useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FaAngleDown, FaAngleUp, FaTrash } from "react-icons/fa";
import Popup from "reactjs-popup";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";

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
  preselectedQuestionsResponses,
  setPreselectedQuestionsResponses,
  handlePreselectedQuestionResponse,
}) => {
  const location = useLocation();
  const feedbackData = location.state?.feedback || {};

  // Get preselected questions from the new API structure
  const preselectedQuestionsFromAPI =
    interviewdata?.interviewQuestions?.preselectedQuestions ||
    interviewdata?.questionFeedback ||
    [];
  const allQuestions = interviewdata?.interviewQuestions
    ? interviewdata?.interviewQuestions || interviewdata?.questionFeedback
    : feedbackData.preSelectedQuestions || [];
  // console.log("allQuestions", allQuestions);




  // Use preselected questions from API if available, otherwise fallback to old logic
  // const schedulerQuestions = preselectedQuestionsFromAPI.length > 0
  //   ? preselectedQuestionsFromAPI
  //   : (Array.isArray(allQuestions)
  //       ? allQuestions.filter(question => question.addedBy !== "interviewer" || !question.addedBy)
  //       : []);

  // FIXED FILTERING LOGIC: Filter out questions added by interviewer
  const schedulerQuestions =
    preselectedQuestionsFromAPI.length > 0
      ? preselectedQuestionsFromAPI.filter((question) => {
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
      : [];

      

  const questionsfeedback =
    feedbackData.questionFeedback || interviewdata?.questionFeedback || [];
  // console.log("All questions:", allQuestions.length);
  // console.log(
  //   "Preselected questions from API:",
  //   preselectedQuestionsFromAPI.length
  // );
  // console.log(
  //   "Scheduler questions (not added by interviewer):",
  //   schedulerQuestions.length
  // );
  // console.log("Scheduler questions data:", schedulerQuestions);
  // console.log(
  //   "Preselected questions responses:",
  //   preselectedQuestionsResponses
  // );
  // console.log("questionsfeedback", questionsfeedback);

  // Initialize state variables
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const [schedulerQuestionsData, setSchedulerQuestionsData] = useState(() => {
    return schedulerQuestions.map((q) => {
      // Find feedback for this question
      const feedback = questionsfeedback?.find(
        (f) => f.questionId === q.questionId
      );
      // Find preselected response for this question
      const preselectedResponse = preselectedQuestionsResponses?.find(
        (r) => r.questionId === q.questionId
      );
      console.log("qda", feedback);

      if (feedback) {
        return {
          ...q,
          candidateAnswer:
            feedback.candidateAnswer || q.candidateAnswer || null,
          interviewerFeedback:
            feedback.interviewerFeedback || q.interviewerFeedback || null,
          isAnswered:
            feedback.candidateAnswer?.answerType ||
            q.candidateAnswer?.answerType
              ? feedback.candidateAnswer.answerType ||
                q.candidateAnswer?.answerType === "correct"
                ? "Fully Answered"
                : feedback.candidateAnswer.answerType ||
                  q.candidateAnswer?.answerType === "partial"
                ? "Partially Answered"
                : feedback.candidateAnswer.answerType ||
                  q.candidateAnswer?.answerType === "incorrect"
                ? "Not Answered"
                : "Not Answered"
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
  });

// Add this sync function inside SchedulerSectionComponent after state declarations
const syncQuestionChanges = useCallback((questionId, updates) => {
  console.log("🔄 Scheduler syncQuestionChanges called:", { questionId, updates });
  
  // Update local state
  setSchedulerQuestionsData(prev =>
    prev.map(question =>
      question._id === questionId ? { ...question, ...updates } : question
    )
  );

  // Update preselected questions responses for parent synchronization
  if (handlePreselectedQuestionResponse) {
    const question = schedulerQuestionsData.find(q => q._id === questionId);
    const bankQuestionId = question?.questionId || questionId;
    
    console.log("📤 Sending update to parent:", { bankQuestionId, updates });
    handlePreselectedQuestionResponse(bankQuestionId, updates);
  } else {
    console.warn("❌ handlePreselectedQuestionResponse is not available");
  }
}, [schedulerQuestionsData, handlePreselectedQuestionResponse]);

// Update the radio input handler
const onChangeRadioInput = (id, value) => {
  console.log("📻 Radio input changed:", { id, value });
  syncQuestionChanges(id, { isAnswered: value });
};

// Update the dislike radio handler
const onChangeDislikeRadioInput = (questionId, value) => {
  console.log("👎 Dislike radio changed:", { questionId, value });
  syncQuestionChanges(questionId, { whyDislike: value, isLiked: "disliked" });
};

// Update the dislike toggle handler
const handleDislikeToggle = (id) => {
  if (isViewMode) return;
  
  console.log("👎 Dislike toggle:", id);
  
  syncQuestionChanges(id, { 
    isLiked: "disliked",
    whyDislike: "" // Clear dislike reason when toggling
  });
  
  if (dislikeQuestionId === id) setDislikeQuestionId(null);
  else setDislikeQuestionId(id);
};

// Update the like toggle handler
const handleLikeToggle = (id) => {
  if (isViewMode) return;

  console.log("👍 Like toggle:", id);

  syncQuestionChanges(id, { 
    isLiked: "liked",
    whyDislike: "" // Clear dislike reason when liking
  });

  if (dislikeQuestionId === id) setDislikeQuestionId(null);
};

// Function to handle add note
const onClickAddNote = (id) => {
  syncQuestionChanges(id, { notesBool: true });
};

// Function to handle delete note
const onClickDeleteNote = (id) => {
  syncQuestionChanges(id, { 
    notesBool: false, 
    note: "" 
  });
};

// Function to handle interview question notes
const onChangeInterviewQuestionNotes = (questionId, notes) => {
  syncQuestionChanges(questionId, { 
    note: notes,
    notesBool: notes.length > 0 // Auto-set notesBool based on content
  });
};
  // Define DisLikeSection component
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
                    id={`dislike-${each._id}-${option.value}`}
                    name={`dislike-${each._id}`}
                    value={option.value}
                    checked={each.whyDislike === option.value}
                    onChange={(e) =>
                      onChangeDislikeRadioInput(each._id, e.target.value)
                    }
                  />
                  <label
                    htmlFor={`dislike-${each._id}-${option.value}`}
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
  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex rounded-md mt-2">
        <p className="w-[200px] font-bold text-gray-700">
          Response Type{" "}
          {each.mandatory === "true" && <span className="text-[red]">*</span>}
        </p>
        {isEditMode || isAddMode ? (
          <div className={`w-full flex gap-x-2 gap-y-2 `}>
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
                    className="whitespace-nowrap"
                  />
                  <label
                    htmlFor={`isAnswered-${each._id}-${option}`}
                    className="cursor-pointer"
                  >
                    {option}
                  </label>
                </span>
              )
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

  // Return JSX
  return (
    <div className="space-y-4">
      {schedulerQuestionsData.length > 0 ? (
        schedulerQuestionsData.map((question) => (
          <div
            key={question._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                {question.snapshot.technology &&
                question.snapshot.technology.length > 0
                  ? question.snapshot.technology[0]
                  : "N/A"}
              </span>
              <span className="text-sm text-gray-500">
                {question.snapshot.difficultyLevel}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              {question.snapshot.questionText}
            </h3>
            {question.snapshot.correctAnswer && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Expected Answer:
                </p>
                <p className="text-sm text-gray-700">
                  {question.snapshot.correctAnswer}
                </p>
              </div>
            )}
            {(isEditMode || isAddMode) && (
              <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                <span>
                  Mandatory: {question.mandatory === "true" ? "Yes" : "No"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 mt-2">
              <RadioGroupInput each={question} />
              <div className="flex items-center gap-4 mt-2">
                {(isEditMode || isAddMode) && (
                  <button
                    className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                    // className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                    // onClick={() => onClickAddNote(question._id)}
                    onClick={() =>
                      question.notesBool
                        ? onClickDeleteNote(question._id)
                        : onClickAddNote(question._id)
                    }
                  >
                    {question.notesBool ? "Delete Note" : "Add a Note"}
                  </button>
                )}
                <SharePopupSection />
                {(isEditMode || isViewMode || isAddMode) && (
                  <>
                    <span
                      className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                        question.isLiked === "liked" ? "text-green-700" : ""
                      }`}
                      onClick={() => handleLikeToggle(question._id)}
                    >
                      <SlLike />
                    </span>
                    <span
                      // className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                      //   question.isLiked === "disliked" ? "text-red-500" : ""
                      // }`}
                      className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                        question.isLiked === "disliked" ? "text-red-500" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDislikeToggle(question._id)}
                    >
                      <SlDislike />
                    </span>
                  </>
                )}
              </div>
            </div>

            {question.notesBool && (
              <div>
                <div className="flex justify-start mt-4">
                  <label
                    htmlFor={`note-input-${question._id}`}
                    className="w-[180px] font-bold text-gray-700"
                  >
                    Note
                  </label>
                  {isEditMode || isAddMode ? (
                    <div className="flex flex-col items-start w-full h-[80px]">
                      <div className="w-full relative  rounded-md ">
                        <input
                          className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                          id={`note-input-${question._id}`}
                          type="text"
                          value={question.note}
                          onChange={(e) =>
                            onChangeInterviewQuestionNotes(
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
                      {/* <span className=" text-md text-right text-gray-500">
                        {question.note?.length || 0}/250
                      </span> */}
                      {/* <button
                      onClick={() => onClickDeleteNote(question._id)}
                      className="text-red-500 text- lg mt-2"
                    >
                      <FaTrash size={20}/>
                    </button> */}
                    </div>
                  ) : (
                    <p className="w-full flex gap-x-8 gap-y-2 text-sm text-gray-500">
                      {question.note}
                    </p>
                  )}
                </div>
              </div>
            )}
            {(dislikeQuestionId === question._id || question.questionId) &&
              question.isLiked === "disliked" && (
                <DisLikeSection each={question} />
              )}
          </div>
        ))
      ) : (
        // Empty state when no preselected questions are present
        // v1.0.1 <--------------------------------------------------------------------------------
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="text-gray-500 mb-4">
            <p className="text-md font-medium mb-2">
              No preselected questions found
            </p>
            <p className="text-sm">
              No questions have been preselected for this round
            </p>
          </div>
        </div>
        // v1.0.1 -------------------------------------------------------------------------------->
      )}
    </div>
  );
};

// Export SchedulerSectionComponent
export default SchedulerSectionComponent;
