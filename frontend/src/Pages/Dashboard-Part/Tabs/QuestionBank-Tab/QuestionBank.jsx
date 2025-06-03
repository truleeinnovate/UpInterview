import { useState } from "react";
import MyQuestionListMain from "./MyQuestionsList.jsx"
import SuggesstedQuestions from "./SuggesstedQuestionsMain.jsx";
import { XCircle } from "lucide-react";

const QuestionBank = ({ assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  closeQuestionBank,
  checkedCount,
fromScheduleLater,onAddQuestion,handleRemoveQuestion,handleToggleMandatory,
interviewQuestionsLists,removedQuestionIds
}) => {

    console.log("type:", type);

  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([])


  const handleSuggestedTabClick = (questionType) => {
    setActiveTab("SuggesstedQuestions");
  };

  const handleFavoriteTabClick = (questionType) => {
    setActiveTab("MyQuestionsList");
  };
  return (
    <div className={`sm:pt-10 md:pt-10${type === "interviewerSection" || type === "assessment" ? "h-[95%] bg-white rounded-lg" : ""}`}>
            {/* Header Section */}
      <div className={`${type === "interviewerSection" || type === "assessment" ? "" : "top-16 sm:top-20 md:top-24 left-0 right-0"}
       ${type ==="interviewerSection" ? 'hidden': ""}
      `}>
        {(type === "interviewerSection" || type === "assessment") && (
          <div className={`flex justify-between items-center p-4 ${type === "interviewerSection" || type === "assessment" ? "bg-custom-blue text-white rounded-t-lg" : " text-white"}`}>
            <div>
              <span className="text-xl font-semibold">Question Bank</span>
            </div>
            <div className="flex items-center gap-4">

                <button 
                  className="p-2 rounded-full hover:bg-blue-700/80 transition-all duration-200"
                  onClick={() => closeQuestionBank()}
                >
                  <XCircle className="text-xl transition-transform duration-200 hover:scale-110" />
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className={`${type === "interviewerSection" || type === "assessment" ? "w-full px-4" : "w-full z-10 top-28 sm:top-32 md:top-36 left-0 right-0 px-4"}`}>
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
      <div className={` ${type === "interviewerSection" || type === "assessment" ? "h-[calc(100%-110px)]" : "h-[calc(100%-100px)]"} overflow-auto transition-all duration-300`}>
        {activeTab === "SuggesstedQuestions" && (
          <SuggesstedQuestions
            sectionName={sectionName}
            updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
            interviewQuestionsList={interviewQuestionsList}
            setInterviewQuestionsList={setInterviewQuestionsList}
            questionBankPopupVisibility={questionBankPopupVisibility}
            type={type}
            addedSections={addedSections}
            questionsLimit={questionsLimit}
            checkedCount={checkedCount}
            onAddQuestion={onAddQuestion}
            handleRemoveQuestion={handleRemoveQuestion}
            handleToggleMandatory={handleToggleMandatory}
            fromScheduleLater={fromScheduleLater}
            interviewQuestionsLists={interviewQuestionsLists}
            removedQuestionIds={removedQuestionIds}
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
            type={type}
            addedSections={addedSections}
            questionsLimit={questionsLimit}
            checkedCount={checkedCount}
            onAddQuestion={onAddQuestion}
            handleRemoveQuestion={handleRemoveQuestion}
            handleToggleMandatory={handleToggleMandatory}
              fromScheduleLater={fromScheduleLater}
              removedQuestionIds={removedQuestionIds}
              // interviewQuestionsLists={interviewQuestionsLists}
          />
        )}
      </div>
    </div>
  );

};

export default QuestionBank;
