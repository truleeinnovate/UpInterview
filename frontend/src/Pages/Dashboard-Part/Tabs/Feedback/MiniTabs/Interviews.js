//<----v1.0.0---Venkatesh-----add isEditMode prop
// v1.0.1 - Ashok - Improved responsiveness

import React, { useCallback, useState } from "react";
import SchedulerSectionComponent from "./InterviewMiniTabs/SchedulerSection";
import InterviewerSectionComponent from "./InterviewMiniTabs/InterviewerSection";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import { Video } from "lucide-react";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";

const interviewMiniTabsList = [
  {
    id: 1,
    // name: "Scheduler Questions",
    name: "Preselected Questions",
  },
  {
    id: 2,
    // name: "Interviewer Questions",
    name: "Interviewer - added Questions",
  },
];

//<----v1.0.0---

const InterviewsMiniTabComponent = ({
  interviewData,
  isAddMode,
  roundDetails,
  tab,
  page,
  closePopup,
  data,
  isEditMode,
  isViewMode,
  // Question Bank Props
  interviewerSectionData,
  setInterviewerSectionData,
  removedQuestionIds,
  setRemovedQuestionIds,
  isQuestionBankOpen,
  setIsQuestionBankOpen,
  handleAddQuestionToRound,
  handleRemoveQuestion,
  handleToggleMandatory,
  // Preselected Questions Responses Props
  preselectedQuestionsResponses,
  setPreselectedQuestionsResponses,
  handlePreselectedQuestionResponse,
  decodedData,
}) => {
  useScrollLock(true);
  const [interviewMiniTab, setInterviewMiniTab] = useState(1);
  const { SchedulerSectionData, setSchedulerSectionData } = useCustomContext();
  console.log("interviewData", interviewData);
  console.log("interviewer Section Data", interviewerSectionData);
  console.log("📊 InterviewData structure:", {
    hasInterviewQuestions: !!interviewData?.interviewQuestions,
    interviewQuestionsType: typeof interviewData?.interviewQuestions,
    isObject:
      interviewData?.interviewQuestions &&
      typeof interviewData?.interviewQuestions === "object",
    hasPreselectedQuestions:
      !!interviewData?.interviewQuestions?.preselectedQuestions,
    hasInterviewerAddedQuestions:
      !!interviewData?.interviewQuestions?.interviewerAddedQuestions,
    preselectedCount:
      interviewData?.interviewQuestions?.preselectedQuestions?.length || 0,
    interviewerAddedCount:
      interviewData?.interviewQuestions?.interviewerAddedQuestions?.length || 0,
    questionFeedback: interviewData?.questionFeedback,
  });

  const handleTabChange = (tab) => {
    setInterviewMiniTab(tab);
  };
  //----v1.0.0--->

// Enhanced handler for preselected question responses
const enhancedHandlePreselectedQuestionResponse = useCallback((questionId, updates) => {
  console.log("🔄 Enhanced handler called:", { questionId, updates });
  
  setPreselectedQuestionsResponses(prev => {
    const existingIndex = prev.findIndex(response => 
      response.questionId === questionId || response.id === questionId || response._id === questionId
    );
    
    let newResponses;
    if (existingIndex >= 0) {
      // Update existing response
      newResponses = prev.map((response, index) => 
        index === existingIndex 
          ? { ...response, ...updates }
          : response
      );
    } else {
      // Add new response
      newResponses = [...prev, { questionId, ...updates }];
    }
    
    console.log("📝 Updated preselectedQuestionsResponses:", newResponses);
    return newResponses;
  });
  
  // Also call the original handler if it exists
  if (handlePreselectedQuestionResponse) {
    handlePreselectedQuestionResponse(questionId, updates);
  }
}, [setPreselectedQuestionsResponses, handlePreselectedQuestionResponse]);
  

const InterviewDisplayData = () => {
    switch (interviewMiniTab) {
      case 1:
        return (
          <SchedulerSectionComponent
            isEditMode={isEditMode}
            isAddMode={isAddMode}
            interviewdata={interviewData}
            isViewMode={isViewMode}
            preselectedQuestionsResponses={preselectedQuestionsResponses}
            setPreselectedQuestionsResponses={setPreselectedQuestionsResponses}
            handlePreselectedQuestionResponse={enhancedHandlePreselectedQuestionResponse}
            // handlePreselectedQuestionResponse={
            //   handlePreselectedQuestionResponse
            // }
          />
        ); //<----v1.0.0---
      case 2:
        return (
          <InterviewerSectionComponent
            closePopup={closePopup}
            tab={tab}
            page={page}
            isAddMode={isAddMode}
            isEditMode={isEditMode}
            isViewMode={isViewMode}
            // Question Bank Props
            interviewerSectionData={interviewerSectionData || []}
            setInterviewerSectionData={setInterviewerSectionData}
            removedQuestionIds={removedQuestionIds}
            setRemovedQuestionIds={setRemovedQuestionIds}
            isQuestionBankOpen={isQuestionBankOpen}
            setIsQuestionBankOpen={setIsQuestionBankOpen}
            handleAddQuestionToRound={handleAddQuestionToRound}
            handleRemoveQuestion={handleRemoveQuestion}
            handleToggleMandatory={handleToggleMandatory}
            interviewData={interviewData}
            decodedData={decodedData}
          />
        ); //<----v1.0.0---
      default:
        return "";
    }
  };

  //<----v1.0.0----
  return (
    <div>
      {isAddMode && (
        <div className="  right-4 z-40 pt-3">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => window.open(decodedData.meetLink, "_blank")}
              className="  bg-[#1a616e] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        </div>
      )}
      {/* v1.0.1 <------------------------------------------------------------------------- */}
      {/* <ul className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2">
        {interviewMiniTabsList.map((each) => (
          <li
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
              interviewMiniTab === each.id
                ? "bg-[#227a8a] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(each.id)}
            key={each.id}
          >
            {each.name}
          </li>
        ))}
      </ul> */}
      <ul
        className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2 
             overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        {interviewMiniTabsList.map((each) => (
          <li
            key={each.id}
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors flex-shrink-0 ${
              interviewMiniTab === each.id
                ? "bg-[#227a8a] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(each.id)}
          >
            {each.name}
          </li>
        ))}
      </ul>
      {/* v1.0.1 -------------------------------------------------------------------------> */}

      <div className="px-2 py-2">{InterviewDisplayData()}</div>
    </div>
  );
};
//----v1.0.0---->

export default InterviewsMiniTabComponent;
