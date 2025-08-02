//<----v1.0.0---Venkatesh-----open selected question on load

import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { IoCodeSlash } from "react-icons/io5";
import { RxText } from "react-icons/rx";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useCustomContext } from "../../../../../../Context/Contextfetch";
import QuestionBank from "../../../../Tabs/QuestionBank-Tab/QuestionBank";


const InterviewerSectionComponent = ({closePopup}) => {


  const { interviewerSectionData, setInterviewerSectionData ,page} =
    useCustomContext();

  //<----v1.0.0---
    const [selectedQuestion, setSelectedQuestion] = useState(interviewerSectionData.length > 0 ? interviewerSectionData[0].id : null);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  useEffect(() => {
    if (interviewerSectionData.length > 0 && selectedQuestion === null) {
      setSelectedQuestion(interviewerSectionData[0].id);
    }
  }, []);
  //----v1.0.0--->





  const onChangeRadioInput = (questionId, value) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, isAnswered: value }
          : question
      )
    );
  };

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, note: notes } : question
      )
    );
  };





  const onClickAddNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, notesBool: true } : question
      )
    );
  };

  // Handler to open QuestionBank modal
  const openQuestionBank = () => {
    setIsQuestionBankOpen(true);
  };

  // Handler to close QuestionBank modal
  const closeQuestionBank = () => {
    setIsQuestionBankOpen(false);
  };

  const onClickDeleteNote = (id) => {
    setInterviewerSectionData((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, notesBool: false, note: "" }
          : question
      )
    );
  };



  return (
    <>
    <div className="relative h-[53vh] px-2 pt-2">
      <div className="flex items-center gap-4 mt-4">
        <p>
          <b>Note:</b>
        </p>
        <p className="para-value text-gray-500">
          The questions listed below are interviewer's choice.
        </p>
      </div>

     <div className="relative">
      <ul className={`mt-4 flex flex-col gap-4  overflow-auto pr-2 ${page==="Popup"?"h-[65vh]":"h-[45vh]"}`}>
        {interviewerSectionData?.map((EachQuestion,index) => (
          <li
            key={EachQuestion.id}
            className="border border-gray-500 rounded-md cursor-pointer flex flex-col gap-3"
          >
            <div
              className="flex justify-between px-2 py-4"
              onClick={() => {
                setSelectedQuestion(
                  selectedQuestion === EachQuestion.id ? null : EachQuestion.id
                );
              }}
            >
              <p>{index+1}. {EachQuestion.question}</p>
              {selectedQuestion === EachQuestion.id ? (
                <FaAngleUp />
              ) : (
                <FaAngleDown />
              )}
            </div>
            {selectedQuestion === EachQuestion.id && (
              <div className="px-2 pb-2" >
                <p className="text-gray-500">{EachQuestion.answer}</p>
                <div className="flex justify-between mt-4 items-start flex-wrap gap-4">
                  {/* Response Type Section */}
                  <div className="flex rounded-md">
                    <p className="w-[200px] font-bold text-gray-700">
                      Response Type
                      {EachQuestion.mandatory && (
                        <span className="text-red-500">*</span>
                      )}
                    </p>
                    <div className={`w-full flex gap-x-8 gap-y-2 ${
    page === "Home" ? "flex-row" : "flex-col"
  }`}>
                      {[
                        "Not Answered",
                        "Partially Answered",
                        "Fully Answered",
                      ].map((status) => (
                        <span key={status} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`${status.toLowerCase().replace(" ", "-")}-${
                              EachQuestion.id
                            }`}
                            name={`isAnswered-${EachQuestion.id}`}
                            value={status}
                            checked={EachQuestion.isAnswered === status}
                            onChange={(e) =>
                              onChangeRadioInput(
                                EachQuestion.id,
                                e.target.value
                              )
                            }
                          />
                          <label
                            htmlFor={`${status
                              .toLowerCase()
                              .replace(" ", "-")}-${EachQuestion.id}`}
                            className="cursor-pointer"
                          >
                            {status}
                          </label>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      className={`${page==="Home"?"py-[0.2rem] px-[0.8rem]":"p-1 "} question-add-note-button cursor-pointer font-bold  text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}  
                      onClick={() =>
                        EachQuestion.notesBool
                          ? onClickDeleteNote(EachQuestion.id)
                          : onClickAddNote(EachQuestion.id)
                      }
                    >
                      {EachQuestion.notesBool ? "Delete Note" : "Add a Note"}
                    </button>
                    <Popup
                      trigger={
                        <button className="text-[#227a8a] font-bold ">
                          Share
                        </button>
                      }
                      arrow={true}
                      on="hover"
                      position="top center"
                      offsetY={5}
                      arrowStyle={{ color: "gray" }}
                    >
                      <p className="bg-[gray] text-xs text-white px-2 py-1 rounded-md">
                        Share with candidate
                      </p>
                    </Popup>
                  </div>
                </div>

                {EachQuestion.notesBool ?(
                 page==="Home" ? (
                 <div className="flex justify-start mt-4">
                    <label htmlFor="note-input" className="w-[200px]">
                      Note
                    </label>
                    <div className="w-full relative mr-5 rounded-md h-[80px]">
                      <input
                        className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                        id="note-input"
                        type="text"
                        value={EachQuestion.note}
                        onChange={(e) =>
                          onChangeInterviewQuestionNotes(
                            EachQuestion.id,
                            e.target.value.slice(0, 250)
                          )
                        }
                        placeholder="Add your note here"
                      />
                      <span className="absolute right-[1rem] bottom-[0.2rem]  text-gray-500">
                        {EachQuestion.note?.length || 0}/250
                      </span>
                    </div>
                  </div>):page==="Popup"?(
                           <div className="flex justify-start mt-4">
                           <label htmlFor="note-input" className="w-[200px]">
                             Note
                           </label>
                           <div className="w-full relative mr-5 rounded-md h-[100px]">
                             <textarea
                             rows="3"
                               className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
                               id="note-input"
                               type="text"
                               value={EachQuestion.note}
                               onChange={(e) =>
                                 onChangeInterviewQuestionNotes(
                                   EachQuestion.id,
                                   e.target.value.slice(0, 250)
                                 )
                               }
                               placeholder="Add your note here"
                             ></textarea>
                             <span className="absolute right-[1rem] bottom-[0.2rem]  text-gray-500">
                               {EachQuestion.note?.length || 0}/250
                             </span>
                           </div>
                         </div>
                  ):null
                ):null}
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* <Popup
        trigger={
          <button className="absolute text-white text-[30px] bottom-[-25px] right-0 aspect-square rounded-full bg-[#227a8a] w-10  flex justify-center items-center cursor-pointer">
            +
          </button>
        }
        position={["top left", "bottom center", "right center"]}
        offsetX={-10}
        arrow
        contentStyle={{
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
        }}
        arrowStyle={{
          color: "gray",
        }}
        closeOnDocumentClick={false}
      >  
        {closeQuestionBank=><div className="fixed z-50 bg-white left-0 top-0 bottom -0  h-full w-full flex flex-col items-center justify-center">

        <QuestionBank closeQuestionBank={closeQuestionBank} type={"interviewerSection"} />
        </div>}
        
        
      </Popup> */}
      <button 
        className="absolute text-white text-[30px] bottom-[-25px] right-0 aspect-square rounded-full bg-[#227a8a] w-10  flex justify-center items-center cursor-pointer"
        onClick={openQuestionBank}
      >
        +
      </button>
    </div>
    </div>
    
    {/* QuestionBank Modal */}
    {isQuestionBankOpen && (
      <div className="fixed z-50 bg-black bg-opacity-50 left-0 top-0 bottom-0 h-full w-full flex flex-col items-center justify-center">
        <div className="relative bg-white rounded-lg w-[95%] h-[95%] max-w-8xl">
          {/* Close button */}
          <button 
            onClick={closeQuestionBank}
            className="absolute top-4 right-4 z-[9999] bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition-colors text-xl font-bold shadow-lg"
          >
            ×
          </button>
          <QuestionBank closeQuestionBank={closeQuestionBank} type={"interviewerSection"} />
        </div>
      </div>
    )}
    </>
  );
};

export default InterviewerSectionComponent;
