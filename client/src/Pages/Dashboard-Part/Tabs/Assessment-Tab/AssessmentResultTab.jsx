
import React, { useCallback,useState } from 'react'
import { ReactComponent as FiMoreHorizontal } from "../../../../icons/FiMoreHorizontal.svg";
import ScheduledAssessmentViewPage from './ScheduledAssessmentViewPage';
import manImage from "../../Images/man.png";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const AssessmentResultTab = ({candidatesList,onClickViewButtonOfScheduledAssessment,filteredScheduledAssessmentData}) => {

    const [viewResultId,setViewResultId]=useState("")
    const [selectedAssessment,setSelectedAssessment]=useState({})
    const [selectedCandidate,setSelectedCandidate] = useState([])
    const [showResult,setShowResult]=useState(false)
    const [candidateResult,setCandidateResult]=useState({})
    const [expandedSection,setExpandedSection]=useState([])

    const returnTotalAnsweredQuestions = useCallback((sections)=>{
        let totalAnsweredQuestion = 0 
        console.log("sections,",sections)
       sections.forEach(section=>{
        totalAnsweredQuestion += section.Answers.reduce((count,answer)=>{
            return !answer.isAnswerLater ? count+1 :count
        },0)
       })
       return totalAnsweredQuestion
    },[])

    const onClickActionButton =(id)=>{
        setViewResultId(prev=> prev===id? "":id)
    }

    const onClickViewButton =(scheduledAssessmentId)=>{
        const assessment = filteredScheduledAssessmentData.find(assessment=>assessment._id===scheduledAssessmentId)
        // onClickViewButtonOfScheduledAssessment(assessment)
        setSelectedAssessment(assessment)
        setShowResult(true)
        setViewResultId("")
        const candidates = candidatesList.filter(candidate=>candidate.scheduledAssessmentId===scheduledAssessmentId)
        setSelectedCandidate(candidates[0])

    }

    const onClickExpandEachSection =(id)=>{
      setExpandedSection(prev=> prev.includes(id)? prev.filter(sId=>sId!==id):[...prev,id])
    }

    


  return (
    <>
    { !showResult && <table className="text-left w-full border-collapse border-gray-300 mb-14 mt-5">
                      <thead className="bg-custom-bg sticky top-0 z-10 text-xs">
                        <tr className=''>
                          <th scope="col" className="  py-3 px-6 text-center">
                            Candidate Name
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            No.Of Answered Questions
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Duration(mints)
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Progress Score/Total Score
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Pass Score
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Test Date
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Status
                          </th>
                          <th scope="col" className="py-3 px-6 text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidatesList.length > 0 ? (
                         candidatesList.map((candidateResult)=>{
                          return (
                            <tr key={candidateResult._id} className='border-b'> 
                              <td className="text-center p-2">{candidateResult.candidateId.FirstName}</td>
                              <td className="text-center p-2">{returnTotalAnsweredQuestions(candidateResult.sections)}</td>
                              <td className="text-center p-2">{(Math.floor((30*60 - candidateResult.remainingTime)/60))}</td>
                              <td className="text-center p-2">{candidateResult.totalScore}</td>
                              <td className="text-center p-2">40</td>
                              <td className="text-center p-2">
                                {new Intl.DateTimeFormat('en-GB',{
                                    day:"2-digit",
                                    month:"short",
                                    year:"numeric",
                                    hour:"2-digit",
                                    minute:"2-digit",
                                    hour12:true
                                }).format(new Date(candidateResult.startedAt))}
                              </td>
                              <td className="text-center p-2">{candidateResult.status}</td>
                              <td className="text-center p-2 relative">
                                <div  className="flex justify-center cursor-pointer">
                                <button onClick={()=>onClickActionButton(candidateResult._id)}><FiMoreHorizontal/></button>
                                </div>
                                {viewResultId === candidateResult._id && (
                                    <div className='absolute z-20 bg-white shadow-md rounded-md p-2 border'>
                                       <button onClick={()=>onClickViewButton(candidateResult.scheduledAssessmentId)}>view</button>
                                    </div>
                                )}
                              </td>
                            </tr>
                          )
                         })
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-gray-500 py-3"
                            >
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>}
    { showResult && (
        // <div>
        //     <ScheduledAssessmentViewPage
        //     candidates={selectedCandidate}
        //     assessment={selectedAssessment}
        //     showMainPage={setShowResult}
        //     />
        // </div>

        <div className='border-2 border-gray-400 rounded-md p-3'>
              <h2 className='text-lg mb-4 cursor-pointer' onClick={()=>setShowResult(false)}><span className='text-[#227a8a] font-medium mb-4'>Results</span> / {selectedCandidate.candidateId.FirstName}</h2>
              <div className='grid grid-cols-[30%_68%] gap-4 '>
                {/* left side section */}
                  <div className='border-2 border-gray-400 rounded-md '>
                    <div className='flex flex-col items-center gap-4 px-3 pt-3 border-b border-gray-400'>
                        <img src={manImage} alt='candidate image' className='w-40'/>
                        <p className='text-custom-blue font-medium'>{selectedCandidate.candidateId.FirstName}</p>
                        <p>{selectedCandidate.candidateId.Email}</p>
                        <p className='mb-4'>Experience - {selectedCandidate.candidateId.CurrentExperience} Year</p>
                    </div>
                    <div className='p-3 flex flex-col gap-3'>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Assessment Name</p>
                        <p>{selectedAssessment.assessmentId.AssessmentTitle}</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Total(Answered/Questions)</p>
                        <p>{returnTotalAnsweredQuestions(selectedCandidate.sections)}/{selectedAssessment.assessmentId.NumberOfQuestions}</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Answered Questions</p>
                        <p>{returnTotalAnsweredQuestions(selectedCandidate.sections)}</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Total Score</p>
                        <p>{selectedCandidate.totalScore}</p>
                        {/* <p>{assessment.assessmentId.totalScore}</p> */}
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Overall Score</p>
                        <p>70</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Pass Score</p>
                        <p>{selectedAssessment.assessmentId.passScore}</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Status</p>
                        <p>{selectedCandidate.status}</p>
                      </div>
                      <div className='flex'>
                        <p className='w-[60%] text-[gray]'>Completed/Duration(mints)</p>
                        <p>{Math.floor((30*60 - selectedCandidate.remainingTime)/60)} / 30 </p>
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
                                                      selectedCandidate.updatedAt
                                                    )
                                                  )
                                                  .replace("am", "AM")
                                                  .replace("pm", "PM")}</p>
                      </div>
                    </div>
                  </div>
                  {/* right side section */}
                    
                  <div className="border-2 border-gray-400 rounded-md h-full overflow-auto">
                      <ul>
                        {selectedCandidate.sections.map((section, index) => {
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
                </div>
                    
        
                      </div>
            </div>
        


    ) }
    </>
  )
}

export default AssessmentResultTab