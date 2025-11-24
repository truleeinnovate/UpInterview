//<----v1.0.0---Venkatesh-----add isEditMode prop
// v1.0.1 - Ashok - Improved responsiveness

import React, { useState } from "react";
import SchedulerSectionComponent from "./InterviewMiniTabs/SchedulerSection";
import InterviewerSectionComponent from "./InterviewMiniTabs/InterviewerSection";
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

  const handleTabChange = (tab) => {
    setInterviewMiniTab(tab);
  };
  //----v1.0.0--->

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
            handlePreselectedQuestionResponse={
              handlePreselectedQuestionResponse
            }
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
    // v1.0.1 <-----------------------------------------------------------
    <div>
      {isAddMode && (
        <div className="mb-6">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => window.open(decodedData.meetLink, "_blank")}
              className="text-sm bg-custom-blue hover:bg-custom-blue/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
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
        className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2 mb-4 
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
    // v1.0.1 ----------------------------------------------------------->
  );
};
//----v1.0.0---->

export default InterviewsMiniTabComponent;
