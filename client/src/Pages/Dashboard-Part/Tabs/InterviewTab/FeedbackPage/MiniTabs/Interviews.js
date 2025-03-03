

import React,{useState} from 'react'
import SchedulerSectionComponent from './InterviewMiniTabs/SchedulerSection';
import InterviewerSectionComponent from './InterviewMiniTabs/InterviewerSection';

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

 
  const InterviewsMiniTabComponent = ({setSchedulerSectionData,SchedulerSectionData,tab,page,closePopup}) => {
    const [interviewMiniTab, setInterviewMiniTab] = useState(1);

    const InterviewDisplayData = () => {
        switch (interviewMiniTab) {
          case 1:
            return <SchedulerSectionComponent setSchedulerSectionData={setSchedulerSectionData} SchedulerSectionData={SchedulerSectionData} tab={tab} page={page}/>;
          case 2:
            return <InterviewerSectionComponent closePopup={closePopup} tab={tab} page={page}/>;
        default:
            return ""
        }
      };

  return (
    <div>
        <ul className="flex items-center gap-20 cursor-pointer md:text-sm">
          {interviewMiniTabsList.map((each) => (
            <li
              className={"font-bold"}
              onClick={() => setInterviewMiniTab(each.id)}
              style={{ color: interviewMiniTab === each.id ? "#227a8a" : "" }}
              key={each.id}
            >
              {each.name}
            </li>
          ))}
        </ul>
        <div>{InterviewDisplayData()}</div>
      </div>
  )
}

export default InterviewsMiniTabComponent