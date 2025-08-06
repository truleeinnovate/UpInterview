//<----v1.0.0---Venkatesh-----open selected question on load
//<----v1.0.1---Venkatesh-----update selected question on load from question bank

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Popup from "reactjs-popup";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Sidebar from "../../../../Tabs/QuestionBank-Tab/QuestionBank-Form.jsx";


const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const InterviewerSectionComponent = ({ closePopup, isEditMode }) => {
  const [interviewerSection, setInterviewerSection] = useState([
      {
        id: 1,
        question: "Tell me about your experience with React",
        answer: "Sample answer about React experience",
        mandatory: true,
        isAnswered: "Not Answered",
        notesBool: false,
        note: ""
      },
      {
        id: 2,
        question: "How do you handle state management?",
        answer: "Sample answer about state management",
        mandatory: false,
        isAnswered: "Not Answered",
        notesBool: false,
        note: ""
      }
    ]);

  //<----v1.0.0---
  const [selectedQuestion, setSelectedQuestion] = useState(
    interviewerSection.length > 0 ? interviewerSection[0].id : null
  );
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  //<----v1.0.1---
  const [sectionName, setSectionName] = useState("Interviewer Section");
  const [roundId, setRoundId] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [type, setType] = useState("Feedback");
  const [questionBankPopupVisibility, setQuestionBankPopupVisibility] =useState(true);
  //----v1.0.1--->

  useEffect(() => {
    if (
      interviewerSection.length > 0 &&
      selectedQuestion === null
    ) {
      setSelectedQuestion(interviewerSection[0].id);
    }
  }, [interviewerSection, selectedQuestion]);

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setInterviewerSection((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, note: notes } : question
      )
    );
  };

  const onClickAddNote = (id) => {
    setInterviewerSection((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, notesBool: !question.notesBool } : question
      )
    );
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

  const updateQuestionsInAddedSectionFromQuestionBank = (questions) => {
    console.log("Updating questions from question bank:", questions);
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSection((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, notesBool: false, note: "" } : question
      )
    );
  };

  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const [interviewerSectionData, setInterviewerSectionData] = useState(
    interviewerSection.map((q) => ({
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
      setInterviewerSectionData((prev) =>
        prev.map((question) =>
          question._id === questionId ? { ...question, isAnswered: value } : question
        )
      );
    };
  
    const onChangeDislikeRadioInput = (questionId, value) => {
      setInterviewerSectionData((prev) =>
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
      setInterviewerSectionData((prev) =>
        prev.map((q) =>
          q._id === id ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" } : q
        )
      );
    };
  
    const handleLikeToggle = (id) => {
      setInterviewerSectionData((prev) =>
        prev.map((q) =>
          q._id === id ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" } : q
        )
      );
      if (dislikeQuestionId === id) setDislikeQuestionId(null);
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
    <>
      <div className="relative px-2 pt-2 space-y-2">
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 mt-4">
          <p>
            <b>Note:</b>
          </p>
          <p className="para-value text-gray-500">
            The questions listed below are interviewer's choice.
          </p>
        </div>
        {isEditMode && (
            <div className="">
              <button
                className="text-white text-[20px] aspect-square rounded-full bg-[#227a8a] w-10 flex justify-center items-center cursor-pointer"
                onClick={openQuestionBank}
              >
                +
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4">
      {interviewerSection?.map((question) => (
        <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2">
          <div className="flex items-start justify-between mb-3">
            <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
              {question.category || 'N/A'}
            </span>
            <span className="text-sm text-gray-500">{question.difficulty || 'N/A'}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">{question.question || 'N/A'}</h3>
          {/* {question.expectedAnswer && ( */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
              <p className="text-sm text-gray-700">{question.expectedAnswer || 'N/A'}</p>
            </div>
           {isEditMode && (
                       <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                         <span>Mandatory: {question.mandatory === "true" ? "Yes" : "No"}</span>
                       </div>
                     )}
                     <RadioGroupInput each={question} />
                     <div className="flex items-center gap-4 mt-2">
                       <button
                         className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                         onClick={() => onClickAddNote(question.id)}
                       >
                         Add a Note
                       </button>
                       <SharePopupSection />
                       <span
                         className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                           question.isLiked === "liked" ? "text-green-700" : ""
                         }`}
                         onClick={() => handleLikeToggle(question.id)}
                       >
                         <SlLike />
                       </span>
                       <span
                         className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                           question.isLiked === "disliked" ? "text-red-500" : ""
                         }`}
                         style={{ cursor: "pointer" }}
                         onClick={() => handleDislikeToggle(question.id)}
                       >
                         <SlDislike />
                       </span>
                     </div>
                     {dislikeQuestionId === question.id && <DisLikeSection each={question} />}
                     {question.notesBool && (
                       <div>
                       <div className="flex justify-start mt-4">
                         <label htmlFor={`note-input-${question.id}`} className="w-[200px]">
                           Note
                         </label>
                         <div className="flex items-start w-full">
                         <div className="w-full relative mr-5 rounded-md h-[80px]">
                           <input
                             className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                             id={`note-input-${question.id}`}
                             type="text"
                             value={question.note}
                             onChange={(e) => onChangeInterviewQuestionNotes(question.id, e.target.value.slice(0, 250))}
                             placeholder="Add your note here"
                           />
                           <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                             {question.note?.length || 0}/250
                           </span>
                         </div>
                         <button
                       onClick={() => onClickDeleteNote(question.id)}
                       className="text-red-500 text-lg mt-2"
                     >
                       <FaTrash size={20}/>
                     </button>
                     </div>
                       </div>
                     </div>
                     )}
          {/* )} */}
        </div>
      ))}
    </div>
      </div>
      

      {/* QuestionBank Modal */}
      {isQuestionBankOpen && (
        <Sidebar
          sectionName={sectionName}
          roundId={roundId}
          updateQuestionsInAddedSectionFromQuestionBank={
            updateQuestionsInAddedSectionFromQuestionBank
          }
          type={type}
          questionBankPopupVisibility={questionBankPopupVisibility}
          onClose={closeSidebar}
          onOutsideClick={handleOutsideClick}
          selectedLabelId={selectedLabelId}
          closePopup={closePopup}
        />
      )}
    </>
  );
};

export default InterviewerSectionComponent;
