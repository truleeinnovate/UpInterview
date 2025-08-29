//<---v1.0.0-----Venkatesh---add sidebar open state and pass it to myquestionslist

import { useState } from "react";
import MyQuestionListMain from "./MyQuestionsList.jsx"
import SuggesstedQuestions from "./SuggesstedQuestionsMain.jsx";
import { Plus, XCircle } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
//<---v1.0.0-----
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  //---v1.0.0----->

  return (
    <div className={`h-full bg-white rounded-lg flex flex-col ${type === "interviewerSection" || type === "feedback" || type === "assessment" ? "" : ""}`}>
      {/* Tab Navigation - Fixed at top for modal context */}
      <div className="flex justify-between bg-white px-4 py-3 flex-shrink-0">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "SuggesstedQuestions" ? "text-custom-blue border-b-2 border-custom-blue" : "text-gray-500 hover:text-gray-700 transition-colors duration-200"}`}
            onClick={() => handleSuggestedTabClick()}
            type="button"
          >
            Suggested Questions
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "MyQuestionsList" ? "text-custom-blue border-b-2 border-custom-blue" : "text-gray-500 hover:text-gray-700 transition-colors duration-200"}`}
            onClick={() => handleFavoriteTabClick()}
            type="button"
          >
            My Questions List
          </button>
        </div>
      {/*<---v1.0.0-----*/}
      {activeTab === "MyQuestionsList" && (
        <div className="flex items-center gap-2">
        <button
          className="text-md bg-custom-blue text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          onClick={toggleSidebar}
        >
          <Plus /> Add Question
        </button>
        </div>
       )}
      </div>
      {/*---v1.0.0----->*/}

      {/* Tab Content - Scrollable area */}
      <div className="flex-1 overflow-auto transition-all duration-300">
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
            sidebarOpen={sidebarOpen}//<---v1.0.0-----
            setSidebarOpen={setSidebarOpen}//<---v1.0.0-----
          />
        )}
      </div>
    </div>
  );

};

export default QuestionBank;
