import { useState } from "react";
import MyQuestionListMain from "./MyQuestionsList.jsx"
import SuggesstedQuestions from "./SuggesstedQuestionsMain.jsx";
import { XCircle } from "lucide-react";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../utils/permissionUtils";

const QuestionBank = ({ assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  closeQuestionBank,
  checkedCount,
  fromScheduleLater, onAddQuestion, handleRemoveQuestion, handleToggleMandatory,
  interviewQuestionsLists, removedQuestionIds
}) => {

  console.log("type:", type);

  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();
  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([])

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("QuestionBank")) {
    return null;
  }

  const handleSuggestedTabClick = (questionType) => {
    setActiveTab("SuggesstedQuestions");
  };

  const handleFavoriteTabClick = (questionType) => {
    setActiveTab("MyQuestionsList");
  };

  return (
    <div className={`sm:pt-10 md:pt-10 lg:pt-3 xl:pt-3 2xl:pt-3 ${type === "interviewerSection" || type === "assessment" ? "h-[85%] bg-white rounded-lg flex flex-col" : ""}`}>
      {/* Header Section */}
      {/* <div className={`${type === "interviewerSection" || type === "assessment" ? "" : "top-16 sm:top-20 md:top-24 left-0 right-0"}
      ${type === "interviewerSection" ? 'hidden' : ""}`}>
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
      </div> */}

      {/* Tab Navigation - keep this outside the scrollable area */}
      <div
        className={`fixed bg-white px-5 z-40
        ${activeTab === "SuggesstedQuestions" && type !== "interviewerSection" && type !== "assessment" ? "h-[180px]" : "h-[110px]"}
        ${activeTab === "MyQuestionsList" && type !== "interviewerSection" && type !== "assessment" ? "h-[170px]" : ""}
        ${type === "interviewerSection" || type === "assessment" ? "w-[85%] px-4" : "w-full z-40 top-16 sm:top-0 md:top-0 lg:top-0 xl:top-0 2xl:top-0 left-0 right-0 pt-16"}`}
      >
        <div className="flex">
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

      {/* Tab Content - only this should scroll */}
      <div className={`flex-1 mt-3 overflow-auto ${type === "interviewerSection" || type === "assessment" ? "" : ""} transition-all duration-300`}>
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
            interviewQuestionsLists={interviewQuestionsLists}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );

};

export default QuestionBank;
