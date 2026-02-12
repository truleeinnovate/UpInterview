//<---v1.0.0-----Venkatesh---add sidebar open state and pass it to myquestionslist
// v1.0.1 - Ashok - Added prop isMeetingSidePanel to handle style and alignments for meeting page

import { useState } from "react";
import MyQuestionListMain from "./MyQuestionsList.jsx";
import SuggesstedQuestions from "./SuggesstedQuestionsMain.jsx";
import { Plus, XCircle } from "lucide-react";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../utils/permissionUtils";
import { Button } from "../../../../Components/Buttons/Button.jsx";

const QuestionBank = ({
  assessmentId,
  sectionName,
  updateQuestionsInAddedSectionFromQuestionBank,
  type,
  questionBankPopupVisibility,
  addedSections,
  questionsLimit,
  closeQuestionBank,
  checkedCount,
  fromScheduleLater,
  onAddQuestion,
  handleRemoveQuestion,
  handleToggleMandatory,
  interviewQuestionsLists,
  removedQuestionIds,
  isEmbedded = false,
  onSelectQuestion = () => { },
  isMeetingSidePanel,
  customHeight,
}) => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();
  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("interviewQuestionsLists", interviewQuestionsLists);

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

  const containerStyle = isEmbedded
    ? {
      padding: "0.5rem",
      height: "100%",
      overflowY: "auto",
      backgroundColor: "white",
    }
    : {};
  const handleQuestionClick = (question) => {
    if (isEmbedded) {
      onSelectQuestion(question);
      // Optionally close the sidebar after selection
      // You can remove this if you want to keep the sidebar open
      // setSideBarMode(null);
    } else {
      // Existing click handler logic
      // ...
    }
  };

  return (
    // v1.0.6 <--------------------------------------------------------------------------------------
    // <div
    //   className={`h-full bg-white rounded-lg flex flex-col ${
    //     type === "interviewerSection" ||
    //     type === "feedback" ||
    //     type === "assessment"
    //       ? ""
    //       : ""
    //   }`}
    //   style={containerStyle}
    // >
    <div
      className={`${isEmbedded ? "question-bank-embedded" : "h-full bg-white rounded-lg"
        } flex flex-col`}
      style={containerStyle}
    >
      {/* Tab Navigation - Fixed at top for modal context */}
      <div className="flex sm:gap-6 justify-between bg-white sm:px-0 sm:pl-4 text-center px-4 py-3 flex-shrink-0">
        <div className="flex sm:gap-6">
          <button
            className={`sm:px-0 px-6 py-3 font-medium text-sm ${activeTab === "SuggesstedQuestions"
                ? "text-custom-blue border-b-2 border-custom-blue"
                : "text-gray-500 hover:text-gray-700 transition-colors duration-200"
              }`}
            onClick={() => handleSuggestedTabClick()}
            type="button"
          >
            Suggested
            <span
              className={`${isMeetingSidePanel ? "hidden" : "sm:hidden inline ml-1"
                }`}
            >
              Questions
            </span>
          </button>
          <button
            className={`sm:px-0 px-6 py-3 font-medium text-sm ${activeTab === "MyQuestionsList"
                ? "text-custom-blue border-b-2 border-custom-blue"
                : "text-gray-500 hover:text-gray-700 transition-colors duration-200"
              }`}
            onClick={() => handleFavoriteTabClick()}
            type="button"
          >
            My Questions
            <span
              className={`${isMeetingSidePanel ? "hidden" : "sm:hidden inline ml-1"
                }`}
            >
              List
            </span>
          </button>
        </div>
        {/*<---v1.0.0-----*/}
        {activeTab === "MyQuestionsList" && (
          <div className="flex items-center sm:mr-4">
            <Button
              className={`bg-custom-blue text-white rounded-md flex items-center gap-1 ${isMeetingSidePanel ? "text-sm" : "text-sm"
                } `}
              onClick={toggleSidebar}
            >
              <Plus className="h-4 w-4" /> Add
              <span
                className={`${isMeetingSidePanel ? "hidden" : "sm:hidden inline"
                  }`}
              >
                Question
              </span>
            </Button>
          </div>
        )}
      </div>
      {/*---v1.0.0----->*/}

      {/* Tab Content - Scrollable area */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        {activeTab === "SuggesstedQuestions" && (
          <SuggesstedQuestions
            sectionName={sectionName}
            updateQuestionsInAddedSectionFromQuestionBank={
              updateQuestionsInAddedSectionFromQuestionBank
            }
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
            isMeetingSidePanel={isMeetingSidePanel}
            customHeight={customHeight}
          />
        )}
        {activeTab === "MyQuestionsList" && (
          <MyQuestionListMain
            assessmentId={assessmentId}
            sectionName={sectionName}
            updateQuestionsInAddedSectionFromQuestionBank={
              updateQuestionsInAddedSectionFromQuestionBank
            }
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
            sidebarOpen={sidebarOpen} //<---v1.0.0-----
            setSidebarOpen={setSidebarOpen} //<---v1.0.0-----
            customHeight={customHeight}
          />
        )}
      </div>
    </div>
    // v1.0.6 -------------------------------------------------------------------------------------->
  );
};

export default QuestionBank;
