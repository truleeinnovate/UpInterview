/* eslint-disable no-lone-blocks */
import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaAngleDown, FaAngleUp, FaTrash } from "react-icons/fa";
import Popup from "reactjs-popup";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";

const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const SchedulerSectionComponent = ({ isEditMode }) => {
  const location = useLocation();
  const feedbackData = location.state?.feedback || {};
  const schedulerQuestions = feedbackData.preSelectedQuestions || [];
  const questionsfeedback = feedbackData.questionFeedback || [];

  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const [schedulerQuestionsData, setSchedulerQuestionsData] = useState(
    schedulerQuestions.map((q) => ({
      ...q,
      isAnswered: "Not Answered",
      isLiked: "",
      whyDislike: "",
      notesBool: false,
      note: "",
    }))
  );
  const questionRef = useRef(); // For future use, e.g., scrolling to a specific question

  // Function to handle radio input changes if needed
  const onChangeRadioInput = (questionId, value) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((question) =>
        question._id === questionId ? { ...question, isAnswered: value } : question
      )
    );
  };

  const onChangeDislikeRadioInput = (questionId, value) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((question) => {
        if (question._id === questionId) {
          return { ...question, whyDislike: value, isLiked: "disliked" };
        }
        return question;
      })
    );
  };

  const handleDislikeToggle = (id) => {
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
    else setDislikeQuestionId(id);
    setSchedulerQuestionsData((prev) =>
      prev.map((q) =>
        q._id === id ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" } : q
      )
    );
  };

  const handleLikeToggle = (id) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((q) =>
        q._id === id ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" } : q
      )
    );
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  };

  const onClickAddNote = (id) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((q) => (q._id === id ? { ...q, notesBool: !q.notesBool } : q))
    );
  };

  const onClickDeleteNote = (id) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((q) => (q._id === id ? { ...q, notesBool: false, note: "" } : q))
    );
  };

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setSchedulerQuestionsData((prev) =>
      prev.map((question) =>
        question._id === questionId ? { ...question, note: notes } : question
      )
    );
  };

  const DisLikeSection = React.memo(({ each }) => {
    return (
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
                onChange={(e) => onChangeDislikeRadioInput(each._id, e.target.value)}
              />
              <label htmlFor={`dislike-${each._id}-${option.value}`} className="cursor-pointer">
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
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
          Response Type {each.mandatory === "true" && <span className="text-[red]">*</span>}
        </p>
        <div className={`w-full flex gap-x-8 gap-y-2 `}>
          {["Not Answered", "Partially Answered", "Fully Answered"].map((option) => (
            <span key={option} className="flex items-center gap-2">
              <input
                checked={each.isAnswered === option}
                value={option}
                name={`isAnswered-${each._id}`}
                type="radio"
                id={`isAnswered-${each._id}-${option}`}
                onChange={(e) => onChangeRadioInput(each._id, e.target.value)}
                className="whitespace-nowrap"
              />
              <label htmlFor={`isAnswered-${each._id}-${option}`} className="cursor-pointer">
                {option}
              </label>
            </span>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-4">
      {schedulerQuestionsData.map((question) => (
        <div key={question._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2">
          <div className="flex items-start justify-between mb-3">
            <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
              {question.snapshot.technology && question.snapshot.technology.length > 0
                ? question.snapshot.technology[0]
                : "N/A"}
            </span>
            <span className="text-sm text-gray-500">{question.snapshot.difficultyLevel}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">{question.snapshot.questionText}</h3>
          {question.snapshot.correctAnswer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
              <p className="text-sm text-gray-700">{question.snapshot.correctAnswer}</p>
            </div>
          )}
          {isEditMode && (
            <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
              <span>Mandatory: {question.mandatory === "true" ? "Yes" : "No"}</span>
            </div>
          )}
          <RadioGroupInput each={question} />
          <div className="flex items-center gap-4 mt-2">
            <button
              className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
              onClick={() => onClickAddNote(question._id)}
            >
              Add a Note
            </button>
            <SharePopupSection />
            <span
              className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                question.isLiked === "liked" ? "text-green-700" : ""
              }`}
              onClick={() => handleLikeToggle(question._id)}
            >
              <SlLike />
            </span>
            <span
              className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                question.isLiked === "disliked" ? "text-red-500" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleDislikeToggle(question._id)}
            >
              <SlDislike />
            </span>
          </div>
          {dislikeQuestionId === question._id && <DisLikeSection each={question} />}
          {question.notesBool && (
            <div>
            <div className="flex justify-start mt-4">
              <label htmlFor={`note-input-${question._id}`} className="w-[200px]">
                Note
              </label>
              <div className="flex items-start w-full">
              <div className="w-full relative mr-5 rounded-md h-[80px]">
                <input
                  className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                  id={`note-input-${question._id}`}
                  type="text"
                  value={question.note}
                  onChange={(e) => onChangeInterviewQuestionNotes(question._id, e.target.value.slice(0, 250))}
                  placeholder="Add your note here"
                />
                <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                  {question.note?.length || 0}/250
                </span>
              </div>
              <button
            onClick={() => onClickDeleteNote(question._id)}
            className="text-red-500 text-lg mt-2"
          >
            <FaTrash size={20}/>
          </button>
          </div>
            </div>
          </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SchedulerSectionComponent;

{/* <div className="flex items-center text-gray-500 text-xs flex-wrap gap-4">
{isEditMode && (
  <div className="flex flex-col items-start gap-2">
    <span className="font-medium text-gray-700">Response Type {question.mandatory && (
            <span className="text-red-500">*</span>
          )}</span>
    <div className={`w-full flex gap-x-8 gap-y-2 flex-row`}>
      {[
        "Not Answered",
        "Partially Answered",
        "Fully Answered"
      ].map((status) => (
        <span key={status} className="flex items-center gap-2">
          <input
            type="radio"
            id={`${status.toLowerCase().replace(" ", "-")}-${question.id}`}
            name={`isAnswered-${question.id}`}
            value={status}
            checked={question.isAnswered === status}
            onChange={(e) => onChangeRadioInput(question.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <label
            htmlFor={`${status.toLowerCase().replace(" ", "-")}-${question.id}`}
            className="cursor-pointer"
          >
            {status}
          </label>
        </span>
      ))}
    </div>
  </div>
)}
</div>
{isEditMode && !question.notesBool ? (
<button
  onClick={(e) => {
    e.stopPropagation();
    onClickAddNote(question.id);
  }}
  className="text-blue-600 hover:underline text-sm"
>
  + Add Note
</button>
) : (
isEditMode && question.notesBool && (
  <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-50">
    <p className="text-gray-700 mb-1">Notes:</p>
    <textarea
      className="w-full p-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="2"
      value={question.note}
      onChange={(e) =>
        onChangeInterviewQuestionNotes(
          question.id,
          e.target.value.slice(0, 250)
        )
      }
      onClick={(e) => e.stopPropagation()}
      placeholder="Add your note here"
    />
    <div className="flex items-center justify-between mt-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClickDeleteNote(question.id);
        }}
        className="text-red-600 hover:underline text-xs"
      >
        Delete Note
      </button>
      <span className="text-gray-500 text-xs">
        {question.note?.length || 0}/250
      </span>
    </div>
  </div>
)
)} */}