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
const QuestionBank = ({ assessmentId, sectionName, updateQuestionsInAddedSectionFromQuestionBank, section: sectionProp, closeQuestionBank, questionBankPopupVisibility, setQuestionBankPopupVisibility,addedSections, questionsLimit,checkedCount}) => {
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
    <div className={`${section === "interviewerSection" || section === "assessment" ? "h-[95%] bg-white rounded-lg" : ""}`}>
      {/* Header Section */}
      <div className={`${section === "interviewerSection" || section === "assessment" ? "" : "top-16 sm:top-20 md:top-24 left-0 right-0"}`}>
        {(section === "Popup" || section === "interviewerSection" || section === "assessment") && (
          <div className={`flex justify-between items-center p-4 ${section === "interviewerSection" || section === "assessment" ? "bg-custom-blue text-white rounded-t-lg" : " text-white"}`}>
            <div>
              <span className="text-xl font-semibold">Question Bank</span>
            </div>
            <div className="flex items-center gap-4">
              {section === "Popup" && (
                <>
                  {questionBankPopupVisibility ? (
                    <button className="p-2 rounded-full hover:bg-blue-700/80 transition-all duration-200" onClick={() => setQuestionBankPopupVisibility(false)}>
                      <FiMinimize className="text-xl transition-transform duration-200 hover:scale-110" />
                    </button>
                  ) : (
                    <button className="p-2 rounded-full hover:bg-blue-700/80 transition-all duration-200" onClick={() => setQuestionBankPopupVisibility(true)}>
                      <TbArrowsMaximize className="text-xl transition-transform duration-200 hover:scale-110" />
                    </button>
                  )}
                </>
              )}
              
              {section === "Popup" ? (
                <Popup
                  modal
                  closeOnDocumentClick={false}
                  overlayStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                  }}
                  contentStyle={{
                    width: '90%',
                    maxWidth: '1200px',
                    height: '90vh',
                    borderRadius: '0.5rem',
                    padding: '0',
                    border: 'none',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  arrow={false}
                  offsetX={-130}
                  trigger={
                    <button className="p-2 rounded-full hover:bg-blue-700/80 transition-all duration-200">
                      <IoIosCloseCircleOutline className="text-xl transition-transform duration-200 hover:scale-110" />
                    </button>
                  }
                >
                  {close => (
                    <div className="mt-3 relative bg-white text-black w-[300px] rounded-md shadow-lg p-4 border border-gray-200">
                      <FaCaretUp className="absolute right-4 -top-3 text-white text-2xl" />
                      <div className="flex flex-col gap-4">
                        <h2 className="font-medium text-center text-gray-700">Are you sure to close the form?</h2>
                        <div className="flex gap-4 justify-center">
                          <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200"
                            onClick={() => close()}
                          >
                            No
                          </button>
                          <button
                            className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                            onClick={() => {
                              setQuestionBankPopupVisibility(false);
                              closeQuestionBank();
                              close();
                            }}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Popup>
              ) : (
                <button 
                  className="p-2 rounded-full hover:bg-blue-700/80 transition-all duration-200"
                  onClick={() => closeQuestionBank()}
                >
                  <IoIosCloseCircleOutline className="text-xl transition-transform duration-200 hover:scale-110" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
  
      {/* Tab Navigation */}
      <div className={`${section === "interviewerSection" || section === "assessment" ? "w-full px-4" : "z-10 top-28 sm:top-32 md:top-36 left-0 right-0 px-4"}`}>
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "SuggesstedQuestions" ? "text-custom-blue border-b-2 border-custom-blue" : "text-gray-500 hover:text-gray-700 transition-colors duration-200"}`}
            onClick={() => handleSuggestedTabClick()}
          >
            Suggested Questions
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "MyQuestionsList" ? "text-custom-blue border-b-2 border-custom-blue" : "text-gray-500 hover:text-gray-700 transition-colors duration-200"}`}
            onClick={() => handleFavoriteTabClick()}
          >
            My Questions List
          </button>
        </div>
      </div>
  
      {/* Tab Content */}
      <div className={`${section === "interviewerSection" || section === "assessment" ? "h-[calc(100%-110px)]" : "h-[calc(100%-100px)]"} overflow-auto transition-all duration-300`}>
        {activeTab === "SuggesstedQuestions" && (
          <SuggesstedQuestions
            sectionName={sectionName}
            updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
            interviewQuestionsList={interviewQuestionsList}
            setInterviewQuestionsList={setInterviewQuestionsList}
            questionBankPopupVisibility={questionBankPopupVisibility}
            section={section}
            addedSections={addedSections}
            questionsLimit={questionsLimit}
            checkedCount={checkedCount}
          />
        )}
        {activeTab === "MyQuestionsList" && (
          <MyQuestionListMain
            assessmentId={assessmentId}
            sectionName={sectionName}
            updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
            interviewQuestionsList={interviewQuestionsList}
            setInterviewQuestionsList={setInterviewQuestionsList}
            questionBankPopupVisibility={questionBankPopupVisibility}
            section={section}
            addedSections={addedSections}
            questionsLimit={questionsLimit}
            checkedCount={checkedCount}
          />
        )}
      </div>
    </div>
  );
  
};

export default QuestionBank;
