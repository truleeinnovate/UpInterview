
//<----v1.0.0---Venkatesh-----add isEditMode prop


import React, { useState } from 'react'
import SchedulerSectionComponent from './InterviewMiniTabs/SchedulerSection';
import InterviewerSectionComponent from './InterviewMiniTabs/InterviewerSection';
import { useCustomContext } from '../../../../../Context/Contextfetch';


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
  // Question Bank Props
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
  const [interviewMiniTab, setInterviewMiniTab] = useState(1);
  const { SchedulerSectionData, setSchedulerSectionData } = useCustomContext()
  console.log("interviewData",interviewData);
  


  const handleTabChange = (tab) => {
      setInterviewMiniTab(tab);
  };
  //----v1.0.0--->

  const InterviewDisplayData = () => {
    switch (interviewMiniTab) {
      case 1:
        return <SchedulerSectionComponent isEditMode={isEditMode} interviewdata ={interviewData} />;//<----v1.0.0---
      case 2:
        return (
          <InterviewerSectionComponent 
            closePopup={closePopup} 
            tab={tab} 
            page={page} 
            isAddMode={isAddMode}  
            isEditMode={isEditMode}
            // Question Bank Props
            interviewerSectionData={interviewerSectionData}
            setInterviewerSectionData={setInterviewerSectionData}
            removedQuestionIds={removedQuestionIds}
            setRemovedQuestionIds={setRemovedQuestionIds}
            isQuestionBankOpen={isQuestionBankOpen}
            setIsQuestionBankOpen={setIsQuestionBankOpen}
            handleAddQuestionToRound={handleAddQuestionToRound}
            handleRemoveQuestion={handleRemoveQuestion}
            handleToggleMandatory={handleToggleMandatory}
          />
        );//<----v1.0.0---
      default:
        return ""
    }
  };

  //<----v1.0.0----
  return (
    <div >
        <ul className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2">
        {interviewMiniTabsList.map((each) => (
            <li
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${interviewMiniTab === each.id ? "bg-[#227a8a] text-white" : "text-gray-700 hover:bg-gray-100"}`}
            onClick={() => handleTabChange(each.id)}
            key={each.id}
          >
            {each.name}
          </li>
        ))}
        </ul>
        <div className='px-2 py-2'>{InterviewDisplayData()}</div>
    </div>
  )
}
//----v1.0.0---->

export default InterviewsMiniTabComponent