

import React, { useCallback, useMemo, useState } from 'react'
import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
import manImage from "../../Images/man.png";
import womanImage from "../../Images/woman.png";
import profile from "../../Images/profile.png";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const ScheduledAssessmentViewPage = ({candidates,assessment,showMainPage}) => {
    const [activeTab,setActiveTab]=useState("ScheduledAssessment")
    const [showResult,setShowResult]=useState(false)
    const [candidateResult,setCandidateResult]=useState({})

    const [expandedSection,setExpandedSection]=useState([])
    

console.log("candidates data from view page",candidates)
const ReturnScheduleAssessmentSection = ()=>{
return (
    <div className='border border-gray-300 rounded-md p-2 h-[40vh]'>
        <div>
            {/* Schedule details */}
            <div>
                <h2 className='font-bold text-md'>Scheduled Details:</h2>
                <div className='grid grid-cols-2 gap-6 mt-6'>
                    <div className='flex items-center'>
                        <p className='w-1/2'>Assessment Id</p>
                        <p className='w-/12 text-[gray]'>assessment-{assessment._id?.slice(-5,-1)}</p>
                    </div>
                    <div className='flex  items-center'>
                        <p className='w-1/2'>Candidates</p>
                         <div className="flex relative items-center w-1/2">
                                                <div className="relative w-[80px] h-10 ">
                                                  <img
                                                    src={manImage}
                                                    alt="First"
                                                    className="w-10 rounded-full aspect-square absolute border-2 border-gray-900 z-40"
                                                  />
                                                  <img
                                                    src={profile}
                                                    alt="Second"
                                                    className="w-10 rounded-full aspect-square absolute left-[20px] z-30  border-2 border-gray-900 "
                                                  />
                                                  <img
                                                    src={womanImage}
                                                    alt="Third"
                                                    className="w-10 rounded-full aspect-square absolute left-[40px] z-20  border-2 border-gray-900 "
                                                  />
                                                  <img
                                                    src={profile}
                                                    alt="Fourth"
                                                    className="w-10 rounded-full aspect-square absolute left-[60px] z-10  border-2 border-gray-900 "
                                                  />
                                                </div>
                                              </div>
                    </div>
                    <div className='flex  items-center'>
                        <p className='w-1/2'>Expiry At</p>
                        <p className='w-1/2 text-[gray]'>{new Intl.DateTimeFormat("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                          .format(
                                            new Date(
                                              assessment.expiryAt
                                            )
                                          )
                                          .replace("am", "AM")
                                          .replace("pm", "PM")}</p>
                    </div>
                    <div className='flex  items-center'>
                        <p className='w-1/2'>Status</p>
                        <p className='w-1/2 text-[gray]'>{assessment.status}</p>
                    </div>
                </div>
            </div>
                <div className='border-b-2 my-4 border-gray-300'></div>
            {/* System Details */}
            <div >
               <h2 className='font-bold'>System Details:</h2>
               <div className='grid grid-cols-2 gap-6 my-4'>
                    <div className='flex '>
                        <p className='w-1/2'>Created By</p>
                        <p className='text-[gray] w-1/2'>{assessment.createdBy.Firstname} {new Intl.DateTimeFormat("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                          .format(
                                            new Date(
                                                assessment.createdAt
                                            )
                                          )
                                          .replace("am", "AM")
                                          .replace("pm", "PM")} </p>
                    </div>
                    <div className='flex '>
                        <p className='w-1/2'>Modified By</p>
                        <p className='text-[gray] w-1/2'>{assessment.createdBy.Firstname}  {new Intl.DateTimeFormat("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                          .format(
                                            new Date(
                                                assessment.updatedAt
                                            )
                                          )
                                          .replace("am", "AM")
                                          .replace("pm", "PM")}</p>
                    </div>
               </div>

            </div>
        </div>
    </div>
)
}

const ReturnCandidatesSection = ()=>{
    return (
        <table className="w-full rounded-sm border border-[#8080808f]">
                                    <thead className="z-10 border-collapse sticky top-0 bg-white border border-[#8080808f]">
                                      <tr className="border-collapse">
                                        <th className="p-1 text-md text-[#227a8a] font-semibold text-center">
                                          Candidate Name
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Status
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Expiry At
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Started At
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Ended At
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Progress
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
                                          Total Score
                                        </th>
                                        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center bg-white">
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {candidates.
                                        length === 0 ? (
                                        <tr>
                                          <td colSpan="8" className="text-center p-2">
                                            No candidate data available
                                          </td>
                                        </tr>
                                      ) : (
                                        candidates.map(
                                          (candidateAssessment, index) => (
                                            <tr
                                              key={index}
                                              className="border-b border-[#8080808f] border-collapse"
                                            >
                                              <td className="text-center p-2 ">
                                                {
                                                  candidateAssessment.candidateId
                                                    .FirstName
                                                }
                                              </td>
                                              <td className="text-center  p-2">
                                                {candidateAssessment.status}
                                              </td>
                                              
                                              <td className="text-center p-2">
                                                {new Intl.DateTimeFormat("en-GB", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: true,
                                                })
                                                  .format(
                                                    new Date(
                                                      candidateAssessment.expiryAt
                                                    )
                                                  )
                                                  .replace("am", "AM")
                                                  .replace("pm", "PM")}
                                              </td>
                                              <td className="text-center  p-2">
                                                {candidateAssessment.startedAt || "-"}
                                              </td>
                                              <td className="text-center  p-2">
                                                {candidateAssessment.endedAt || "-"}
                                              </td>
                                              <td className="text-center  p-2">
                                                {candidateAssessment.progress}
                                              </td>
                                              <td className="text-center  p-2">
                                                {candidateAssessment.totalScore}
                                              </td>
                                              <td className="text-center p-2">
                                                <div className="relative flex justify-center items-center cursor-pointer">
                                                  <button
                                                    
                                                  >
                                                    <FiMoreHorizontal className="text-2xl text-gray-600 hover:text-gray-800" />
                                                  </button>
                                                  {/* {actionViewMore === */}
                                                    {/* candidateAssessment._id && ( */}
                                                    {/* <div className="absolute top-5 z-10 p-4 w-40 rounded-md shadow-lg bg-white border border-gray-200 ">
                                                      <div className="flex flex-col gap-2">
                                                        <button
                                                    //      onClick={() =>
                                                    //   toggleAction(
                                                    //     candidateAssessment._id
                                                    //   )
                                                    // } 
                                                    className="py-2 px-4 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                                          View
                                                        </button>
                                                        <button
                                                        //   onClick={() =>
                                                        //     toggleCandidateAssessmentActionCancel(
                                                        //       candidateAssessment._id
                                                        //     )
                                                        //   }
                                                          className="py-2 px-4 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                                        >
                                                          Cancel
                                                        </button>
                                                      </div>
                                                    </div> */}
                                                  {/* )} */}
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        )
                                      )}
                                    </tbody>
                                  </table>
    )
}


const onClickCandidateName = (result)=>{
  setShowResult(true)
  setCandidateResult(result)
}

const ReturnResultsSection =()=>{
  return(
    <>
    {!showResult &&  
      <table className="w-full rounded-sm border border-[#8080808f]">
    <thead className="z-10  border-collapse sticky top-0 bg-white border border-[#8080808f]">
      <tr className="border-collapse">
        <th className=" p-1 text-md text-[#227a8a] font-semibold text-center">
          Candidate Name
        </th>
        <th className="p-1 text-md text-[#227a8a] font-semibold text-center">Candidate Assessment Id</th>
        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
          Total Score
        </th>
        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
          Status
        </th>
        
        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center">
        Completion Time
        </th>

        
        <th className="p-1 text-md text-[#227a8a]  font-semibold text-center bg-white">
          Action
        </th>
      </tr>
    </thead>
    <tbody>
      {candidates.
        length === 0 ? (
        <tr>
          <td colSpan="8" className="text-center p-2">
            No candidate data available
          </td>
        </tr>
      ) : (
        candidates.map(
          (candidateAssessment, index) => (
            <tr
              key={index}
              className="border-b border-[#8080808f] border-collapse"
            >
              <td className="text-center p-1 cursor-pointer " onClick={()=>onClickCandidateName(candidateAssessment)}>
                {
                  candidateAssessment.candidateId
                    .FirstName
                }
              </td>
              <td  className="text-center  p-2">assessment - {assessment._id.slice(-5,-1)}</td>
              <td className="text-center  p-2">
                {candidateAssessment.totalScore}
              </td>
              <td className="text-center  p-2">
                {candidateAssessment.status}
              </td>
              
            
              <td className="text-center  p-2">
                90 minutes
              </td>
    
              
              <td className="text-center p-2">
                <div className="relative flex justify-center items-center cursor-pointer">
                  <button
                    
                  >
                    <FiMoreHorizontal className="text-2xl text-gray-600 hover:text-gray-800" />
                  </button>

                </div>
              </td>
            </tr>
          )
        )
      )}
    </tbody>
  </table>}
  {showResult && ResultDetailsSection()}
  </>
  )
}


const onClickExpandEachSection =(id)=>{
  setExpandedSection(prev=> prev.includes(id)? prev.filter(sId=>sId!==id):[...prev,id])
}


const returnTotalAnsweredQuestions = useCallback(() => {
  let total = 0;
  
  // if (candidateResult){
  candidateResult.sections.forEach(section => {
    total += section.Answers.reduce((count, answer) => {
      return !answer.isAnswerLater ? count + 1 : count;
    }, 0);
  });
// }
  
  return total;
}, [candidateResult]);



const ResultDetailsSection =()=>{
  return (
    <div className='border-2 border-gray-400 rounded-md p-3'>
      <h2 className='text-lg mb-4 cursor-pointer' onClick={()=>setShowResult(false)}><span className='text-[#227a8a] font-medium mb-4'>Results</span> / {candidateResult.candidateId.FirstName}</h2>
      <div className='grid grid-cols-[30%_68%] gap-4 '>
        {/* left side section */}
          <div className='border-2 border-gray-400 rounded-md '>
            <div className='flex flex-col items-center gap-4 px-3 pt-3 border-b border-gray-400'>
                <img src={manImage} alt='candidate image' className='w-40'/>
                <p className='text-custom-blue font-medium'>{candidateResult.candidateId.FirstName}</p>
                <p>{candidateResult.candidateId.Email}</p>
                <p className='mb-4'>Experience - {candidateResult.candidateId.CurrentExperience} Year</p>
            </div>
            <div className='p-3 flex flex-col gap-3'>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Assessment Name</p>
                <p>{assessment.assessmentId.AssessmentTitle}</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Total(Answered/Questions)</p>
                <p>{returnTotalAnsweredQuestions()}/{assessment.assessmentId.NumberOfQuestions}</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Answered Questions</p>
                <p>{returnTotalAnsweredQuestions()}</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Total Score</p>
                <p>{candidateResult.totalScore}</p>
                {/* <p>{assessment.assessmentId.totalScore}</p> */}
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Overall Score</p>
                <p>70</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Pass Score</p>
                <p>{assessment.assessmentId.passScore}</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Status</p>
                <p>{candidateResult.status}</p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Completed/Duration(mints)</p>
                <p>{Math.floor((30*60 - candidateResult.remainingTime)/60)} / 30 </p>
              </div>
              <div className='flex'>
                <p className='w-[60%] text-[gray]'>Date & Time</p>
                <p>{new Intl.DateTimeFormat("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                          .format(
                                            new Date(
                                              candidateResult.updatedAt
                                            )
                                          )
                                          .replace("am", "AM")
                                          .replace("pm", "PM")}</p>
              </div>
            </div>
          </div>
          {/* right side section */}
          <div className="border-2 border-gray-400 rounded-md h-full overflow-auto">
            {/* <div> */}
              <ul>
                {candidateResult.sections.map((section, index) => {
                  const answerQuestion = section.Answers.reduce((acc,item)=>!item.isAnswerLater ? acc+1:acc,0)
                  return (
                  <li key={index} className='rounded-md  mb-4'>
                    <div className="bg-custom-blue  p-3 rounded-md ">
                      <div className='text-white flex justify-between '>
                      <h3 className='w-[15%]'>{section.SectionName}</h3>
                      <p  className='w-[45%]'>Answered Questions / Total Questions : {answerQuestion} / {section.Answers.length}</p>
                      <p  className='w-[30%]'>Pass Score / Total Score :  {section.passScore} / {section.totalScore}</p>
                      <button
                       onClick={()=> onClickExpandEachSection(section._id)}
                       >{expandedSection.includes(section._id) ? <IoIosArrowUp/>:<IoIosArrowDown/>}</button>
                      </div>
                    </div>
                    {expandedSection.includes(section._id) && (
                      <ul className='h-[50vh] overflow-auto'>
                     { section.Answers.map((answer,answerIndex)=>(
                        <li key={answerIndex} className='flex flex-col gap-3 p-2 border-b border-[gray]'>
                          <p className='font-medium'>{answerIndex+1}. {answer.questionId.snapshot.questionText}</p>
                          <p >
                            <span className='text-[gray]'>Correct Answer: </span>
                            <span className='font-medium '>{answer.questionId.snapshot.correctAnswer}</span>
                          </p>
                          <p >
                            <span className='text-[gray]'>Answer : </span>
                            <span className='font-medium '>{answer.answer}</span>
                          </p>
                          <div className='flex gap-8'>
                          <p >
                            <span className='text-[gray]'>Marks : </span>
                            <span className='font-medium '>{answer.score}</span>
                          </p>
                          <p >
                            <span className='text-[gray]'>Score : </span>
                            <span className='font-medium '>{answer.score}</span>
                          </p>
                          </div>
                        </li>
                      ))
}
                      </ul>
                    )}
                  </li>
                )})}
              </ul>
            {/* </div> */}
        </div>

              </div>
    </div>
  )
}

const displayTabsData =()=>{
    switch(activeTab){
        case "ScheduledAssessment":
            return ReturnScheduleAssessmentSection()
        case "candidates":
            return ReturnCandidatesSection()
        case "Results":
            return ReturnResultsSection()

    }
}


  return (
    <div className='p-6'>
        <div >
            <h2 onClick={()=>showMainPage(false)} className='font-medium cursor-pointer'><span className='text-[#227a8a]'>Scheduled Assessment</span> / assessment-{assessment._id?.slice(-5,-1)}</h2>

        </div>

        {/* Tabs */}
      
        <ul className='flex items-center gap-8 my-4 sticky top-0'>
            <li className={`cursor-pointer ${activeTab==="ScheduledAssessment" && 'border-b-2 border-[#227a8a]'}`} onClick={()=>setActiveTab("ScheduledAssessment")}>Scheduled Assessment</li>
            <li className={`cursor-pointer ${activeTab==="candidates" && 'border-b-2 border-[#227a8a]'}`} onClick={()=>setActiveTab("candidates")}>Candidates</li>
            <li className={`cursor-pointer ${activeTab==="Results" && 'border-b-2 border-[#227a8a]'}`} onClick={()=>setActiveTab("Results")}>Results</li>
        </ul>

        <div>
            {displayTabsData()}
        </div>

    </div>
  )
}

export default ScheduledAssessmentViewPage