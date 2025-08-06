//<----v1.0.0---Venkatesh-----open selected question on load
//<----v1.0.1---Venkatesh-----update selected question on load from question bank

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
  // Question Bank Props from parent
  interviewerSectionData,
  setInterviewerSectionData,
  removedQuestionIds,
  setRemovedQuestionIds,
  isQuestionBankOpen,
  setIsQuestionBankOpen,
  handleAddQuestionToRound,
  handleRemoveQuestion,
  handleToggleMandatory
}) => {
  const [interviewerSection, setInterviewerSection] = useState(
    isAddMode ? [] : [
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
    ]
  );



  //<----v1.0.0---
  const [selectedQuestion, setSelectedQuestion] = useState(
    interviewerSection.length > 0 ? interviewerSection[0].id : null
  );
  //<----v1.0.1---
  const [sectionName, setSectionName] = useState("Interviewer Section");
  const [roundId, setRoundId] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState(null);
  const [type, setType] = useState("Feedback");
  const [questionBankPopupVisibility, setQuestionBankPopupVisibility] = useState(true);
  //----v1.0.1--->

  useEffect(() => {
    if (
      interviewerSection.length > 0 &&
      selectedQuestion === null
    ) {
      setSelectedQuestion(interviewerSection[0].id);
    }
  }, [interviewerSection, selectedQuestion]);

  // Initialize interviewerSectionData with default data when not in add mode
  useEffect(() => {
    if (!isAddMode && (!interviewerSectionData || interviewerSectionData.length === 0)) {
      const defaultData = [
        {
          id: 1,
          questionId: 1,
          question: "Tell me about your experience with React",
          answer: "Sample answer about React experience",
          mandatory: "true",
          isAnswered: "Not Answered",
          notesBool: false,
          note: ""
        },
        {
          id: 2,
          questionId: 2,
          question: "How do you handle state management?",
          answer: "Sample answer about state management",
          mandatory: "false",
          isAnswered: "Not Answered",
          notesBool: false,
          note: ""
        }
      ];
      setInterviewerSectionData(defaultData);
    }
  }, [isAddMode, interviewerSectionData, setInterviewerSectionData]);

  // Handle escape key to close question bank
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isQuestionBankOpen) {
        setIsQuestionBankOpen(false);
      }
    };

    if (isQuestionBankOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [isQuestionBankOpen]);

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === questionId ? { ...question, note: notes } : question
      )
    );
  };

  const onClickAddNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === id ? { ...question, notesBool: !question.notesBool } : question
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

  // Add missing functions required by Sidebar component
  const closeSidebarCallback = useCallback(() => {
    setIsQuestionBankOpen(false);
  }, []);

  const handleOutsideClickCallback = useCallback((event) => {
    if (isQuestionBankOpen && !event.target.closest('.question-bank-sidebar')) {
      setIsQuestionBankOpen(false);
    }
  }, [isQuestionBankOpen]);



  const updateQuestionsInAddedSectionFromQuestionBank = (questions) => {
    console.log("Updating questions from question bank:", questions);
    
    if (questions && questions.length > 0) {
      // Transform questions to match the interviewer section format
      const newQuestions = questions.map((question, index) => ({
        id: Date.now() + index, // Generate unique ID
        question: question.question || question.title || 'N/A',
        expectedAnswer: question.expectedAnswer || question.answer || 'N/A',
        category: question.category || 'N/A',
        difficulty: question.difficulty || 'N/A',
        mandatory: question.mandatory || false,
        isAnswered: "Not Answered",
        notesBool: false,
        note: ""
      }));

      // Add new questions to the existing interviewer section
      setInterviewerSection(prev => [...prev, ...newQuestions]);
      
      // Update interviewerSectionData as well
      const newQuestionsData = newQuestions.map(q => ({
        ...q,
        isAnswered: "Not Answered",
        isLiked: "",
        whyDislike: "",
        notesBool: false,
        note: "",
      }));
      setInterviewerSectionData(prev => [...prev, ...newQuestionsData]);
      
      // Close the question bank after adding questions
      setIsQuestionBankOpen(false);
    }
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        (question.questionId || question.id) === id ? { ...question, notesBool: false, note: "" } : question
      )
    );
  };

  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const questionRef = useRef(); // For future use, e.g., scrolling to a specific question
  
         // Function to handle radio input changes if needed
     const onChangeRadioInput = (questionId, value) => {
       setInterviewerSectionData((prev) =>
         prev.map((question) =>
           (question.questionId || question.id) === questionId ? { ...question, isAnswered: value } : question
         )
       );
     };
   
     const onChangeDislikeRadioInput = (questionId, value) => {
       setInterviewerSectionData((prev) =>
         prev.map((question) => {
           if ((question.questionId || question.id) === questionId) {
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
           (q.questionId || q.id) === id ? { ...q, isLiked: q.isLiked === "disliked" ? "" : "disliked" } : q
         )
       );
     };
   
     const handleLikeToggle = (id) => {
       setInterviewerSectionData((prev) =>
         prev.map((q) =>
           (q.questionId || q.id) === id ? { ...q, isLiked: q.isLiked === "liked" ? "" : "liked" } : q
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
                   id={`dislike-${each.questionId || each.id}-${option.value}`}
                   name={`dislike-${each.questionId || each.id}`}
                   value={option.value}
                   checked={each.whyDislike === option.value}
                   onChange={(e) => onChangeDislikeRadioInput(each.questionId || each.id, e.target.value)}
                 />
                 <label htmlFor={`dislike-${each.questionId || each.id}-${option.value}`} className="cursor-pointer">
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
             Response Type {(each.mandatory === "true" || each.snapshot?.mandatory === "true") && <span className="text-[red]">*</span>}
           </p>
          <div className={`w-full flex gap-x-8 gap-y-2 `}>
            {["Not Answered", "Partially Answered", "Fully Answered"].map((option) => (
              <span key={option} className="flex items-center gap-2">
                                 <input
                   checked={each.isAnswered === option}
                   value={option}
                   name={`isAnswered-${each.questionId || each.id}`}
                   type="radio"
                   id={`isAnswered-${each.questionId || each.id}-${option}`}
                   onChange={(e) => onChangeRadioInput(each.questionId || each.id, e.target.value)}
                   className="whitespace-nowrap"
                 />
                 <label htmlFor={`isAnswered-${each.questionId || each.id}-${option}`} className="cursor-pointer">
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
                     {(isEditMode || isAddMode) && (
             <div className="flex items-center gap-2">
               <button
                 className="flex items-center gap-2 px-4 py-2 bg-[#227a8a] text-white rounded-lg hover:bg-[#1a5f6b] transition-colors duration-200 shadow-md hover:shadow-lg font-medium"
                 onClick={openQuestionBank}
                 title="Add Question from Question Bank"
               >
                 <FaPlus className="text-sm" />
                 <span>Add Question</span>
               </button>
             </div>
           )}
        </div>
                          <div className="space-y-4">
        {interviewerSectionData?.length > 0 ? (
          interviewerSectionData.map((question) => (
                 <div key={question.questionId || question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 gap-2">
           <div className="flex items-start justify-between mb-3">
             <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
               {question.snapshot?.skill || question.category || 'N/A'}
             </span>
             <span className="text-sm text-gray-500">{question.snapshot?.difficultyLevel || question.difficulty || 'N/A'}</span>
           </div>
           <h3 className="font-semibold text-gray-800 mb-2">{question.snapshot?.questionText || question.question || 'N/A'}</h3>
           {/* {question.expectedAnswer && ( */}
             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
               <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
               <p className="text-sm text-gray-700">{question.snapshot?.correctAnswer || question.expectedAnswer || 'N/A'}</p>
             </div>
                                               {isEditMode && (
                         <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
                           <span>Mandatory: {(question.mandatory === "true" || question.snapshot?.mandatory === "true") ? "Yes" : "No"}</span>
                         </div>
                       )}
                      <RadioGroupInput each={question} />
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          className={`py-[0.2rem] px-[0.8rem] question-add-note-button cursor-pointer font-bold text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                          onClick={() => onClickAddNote(question.questionId || question.id)}
                        >
                          Add a Note
                        </button>
                        <SharePopupSection />
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "liked" ? "text-green-700" : ""
                          }`}
                          onClick={() => handleLikeToggle(question.questionId || question.id)}
                        >
                          <SlLike />
                        </span>
                        <span
                          className={`transition-transform hover:scale-110 duration-300 ease-in-out ${
                            question.isLiked === "disliked" ? "text-red-500" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleDislikeToggle(question.questionId || question.id)}
                        >
                          <SlDislike />
                        </span>
                      </div>
                      {dislikeQuestionId === (question.questionId || question.id) && <DisLikeSection each={question} />}
                      {question.notesBool && (
                        <div>
                        <div className="flex justify-start mt-4">
                          <label htmlFor={`note-input-${question.questionId || question.id}`} className="w-[200px]">
                            Note
                          </label>
                          <div className="flex items-start w-full">
                          <div className="w-full relative mr-5 rounded-md h-[80px]">
                            <input
                              className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                              id={`note-input-${question.questionId || question.id}`}
                              type="text"
                              value={question.note}
                              onChange={(e) => onChangeInterviewQuestionNotes(question.questionId || question.id, e.target.value.slice(0, 250))}
                              placeholder="Add your note here"
                            />
                            <span className="absolute right-[1rem] bottom-[0.2rem] text-gray-500">
                              {question.note?.length || 0}/250
                            </span>
                          </div>
                          <button
                        onClick={() => onClickDeleteNote(question.questionId || question.id)}
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
       ))
       ) : (
         // Empty state when no questions are present
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
           <div className="text-gray-500 mb-4">
             <FaPlus className="mx-auto text-4xl mb-2" />
             <p className="text-lg font-medium">No questions added yet</p>
             <p className="text-sm">Click the "Add Question" button to get started</p>
           </div>
         </div>
       )}
     </div>
      </div>
      

             {/* QuestionBank Modal */}
       {isQuestionBankOpen && (
           <div
           className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50"
           onClick={() => setIsQuestionBankOpen(false)}
         >
           <div
             className="bg-white rounded-md w-[95%] h-[90%]"
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
                  interviewQuestionsLists={interviewerSectionData}
                  type="interviewerSection"
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
  );
};

export default InterviewerSectionComponent;
