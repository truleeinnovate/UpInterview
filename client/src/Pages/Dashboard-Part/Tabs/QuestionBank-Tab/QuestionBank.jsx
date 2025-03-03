
import React, { useState } from "react";
// import "../../../../index.css";
// import "../styles/tabs.scss";
import MyQuestionListMain from "./MyQuestionsList.jsx"
import SuggesstedQuestions from "./SuggesstedQuestionsMain.jsx";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { TbArrowsMaximize } from "react-icons/tb";
import { FiMinimize } from "react-icons/fi";
import Popup from "reactjs-popup";
import { FaCaretUp } from "react-icons/fa";
import { useLocation } from "react-router-dom";


// const QuestionBank = ({section,closeQuestionBank,questionBankPopupVisibility,setQuestionBankPopupVisibility}) => {
//change done by Shashank on -[08/01/2025]
const QuestionBank = ({ assessmentId, sectionName, updateQuestionsInAddedSectionFromQuestionBank, section: sectionProp, closeQuestionBank, questionBankPopupVisibility, setQuestionBankPopupVisibility }) => {
  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([])

  const location = useLocation()
 const section = location.state?.section || sectionProp || ""
  //  const section = location?.state?.section || sectionProp || "assessment";

  console.log('location state from qb', location.state)
  //  alert(`section: ${section}`)

  const handleSuggestedTabClick = (questionType) => {
    setActiveTab("SuggesstedQuestions");
  };

  const handleFavoriteTabClick = (questionType) => {
    setActiveTab("MyQuestionsList");
  };
  return (
    <div className={`${section === "interviewerSection" || section === "assessment" && "h-[95%] shadow-md  w-[95%] bg-white "}`}>
      <div className={`${section === "interviewerSection" || section === "assessment" ? "" : " top-16 sm:top-20 md:top-24 left-0 right-0"}`}>
        {(section === "Popup" || section === "interviewerSection" || section === "assessment") &&
          <div className={`flex justify-between p-4 bg-custom-blue text-white  ${(section === "interviewerSection" || section === "assessment") ? "bg-custom-blue text-white " : ""}`}>
            <div>
              <span className="text-lg font-semibold">Question Bank</span>
            </div>
            <div className="flex items-center gap-8 ">
              {section === "Popup" && <>
                {
                  questionBankPopupVisibility ? <button className="text-[1.2rem]" onClick={() => setQuestionBankPopupVisibility(false)}><FiMinimize /></button > : <button className="text-[1.2rem]" onClick={() => setQuestionBankPopupVisibility(true)}><TbArrowsMaximize /></button>
                }
              </>
              }
              {section === "Popup" ?
                <div>
                  <Popup
                    arrow={false}
                    offsetX={-130} trigger={<span className="text-[1.2rem] font-bold text-white cursor-pointer" onClick={closeQuestionBank}><IoIosCloseCircleOutline /> </span>}>
                    {questionBankCloseConfirmation =>
                      <div className="mt-3 relative backdrop-blur-md bg-white text-black w-[300px] rounded-md shadow-lg text-center p-4">
                        {/* Arrow Icon */}
                        <FaCaretUp className="absolute  transform right-0 top-[-17px] text-2xl bg-transparent" />
                        {/* Popup Content */}
                        <div className="flex flex-col gap-3">
                          <h2>Are you sure to close the form?</h2>
                          <div className="flex gap-4 items-center justify-center">
                            <button
                              className="border-[1px] border-gray-900 rounded-sm px-2 font-medium"
                              onClick={() => questionBankCloseConfirmation()}
                            >
                              No
                            </button>
                            <button
                              className="border-none bg-custom-blue px-2 rounded-sm text-white cursor-pointer font-medium"
                              onClick={() => {
                                setQuestionBankPopupVisibility(false);
                                closeQuestionBank();
                              }}
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      </div>

                    }
                  </Popup>
                </div>
                : <span className="text-[1.2rem] font-bold text-white cursor-pointer" onClick={() => closeQuestionBank()}><IoIosCloseCircleOutline /> </span>}
            </div>

          </div>
        }
      </div>
      <div className={` ${(section === "interviewerSection" || section === "assessment") ? "w-[95%]" : " z-10 top-28 sm:top-32 md:top-36 left-0 right-0"} `}>
        <div className="flex gap-10 p-4">
          <div className="relative inline-block">
            <span className="flex items-center cursor-pointer ">
              <span
                className={`pb-3 ${activeTab === "SuggesstedQuestions"
                  ? "text-black font-semibold border-b-2 border-custom-blue"
                  : "text-gray-500"
                  }`}
                onClick={() => handleSuggestedTabClick()}
              >
                Suggested Questions
              </span>
            </span>
          </div>
          <div className="relative inline-block">
            <span className="flex items-center cursor-pointer">
              <span
                className={`pb-3 ${activeTab === "MyQuestionsList"
                  ? "text-black font-semibold border-b-2 border-custom-blue"
                  : "text-gray-500"
                  }`}
                onClick={() => handleFavoriteTabClick()}
              >
                My Questions List
              </span>
            </span>
          </div>
        </div>
      </div>
      {activeTab === "SuggesstedQuestions" && (
        <>
          {/* <SuggesstedQuestions   interviewQuestionsList={interviewQuestionsList} setInterviewQuestionsList={setInterviewQuestionsList}  questionBankPopupVisibility={questionBankPopupVisibility} section={section}/> */}
          <SuggesstedQuestions sectionName={sectionName} updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank} interviewQuestionsList={interviewQuestionsList} setInterviewQuestionsList={setInterviewQuestionsList} questionBankPopupVisibility={questionBankPopupVisibility} section={section} />
        </>
      )}
      {activeTab === "MyQuestionsList" && (
        <div>
          {/* <MyQuestionListMain  interviewQuestionsList={interviewQuestionsList} setInterviewQuestionsList={setInterviewQuestionsList} questionBankPopupVisibility={questionBankPopupVisibility} section={section}/> */}
          <MyQuestionListMain assessmentId={assessmentId} sectionName={sectionName} updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank} interviewQuestionsList={interviewQuestionsList} setInterviewQuestionsList={setInterviewQuestionsList} questionBankPopupVisibility={questionBankPopupVisibility} section={section} />
        </div>
      )}
    </div>
  );
};

export default QuestionBank;

