import React, { useMemo, useState } from 'react';
import {  User, MessageSquare, FileText } from 'lucide-react';

// import CandidateDetails from './CandidateDetails';
import CandidateMiniTab from '../Dashboard-Part/Tabs/Feedback/MiniTabs/Candidate'

import FeedbackForm from './FeedbackForm';

import InterviewsMiniTabComponent from '../Dashboard-Part/Tabs/Feedback/MiniTabs/Interviews';
import InterviewActions from './InterviewActions';

const InterviewerView = ({ onBack,decodedData, feedbackData,feedbackLoading,feedbackError,isScheduler,schedulerFeedbackData}) => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [selectedCandidate] = useState(feedbackData);

  console.log("selectedCandidate",selectedCandidate,isScheduler,feedbackData);
  
  // Question Bank State Management
  const initialQuestions = feedbackData?.questionFeedback;
const [interviewerSectionData, setInterviewerSectionData] = useState(
  Array.isArray(initialQuestions) ? [...initialQuestions] : []
);
console.log("interviewerSectionData",initialQuestions);

  // const [interviewerSectionData, setInterviewerSectionData] = useState( [...selectedCandidate.interviewData?.questionFeedback]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Merge answered and newly added
  const mergedQuestions = useMemo(() => {
    // Get existing interviewer questions from API
    const existingInterviewerQuestions = selectedCandidate?.interviewData?.questionFeedback || [];
    
    // Get newly added questions from interviewerSectionData
    const newlyAddedQuestions = (interviewerSectionData || []).filter(newQ => {
      const newId = newQ.questionId || newQ._id || newQ.id;
      return !existingInterviewerQuestions.some(existingQ => {
        const existingId = existingQ.questionId || existingQ._id || existingQ.id;
        return existingId === newId;
      });
    });
  
    // Combine both for submission purposes
    return [...existingInterviewerQuestions, ...newlyAddedQuestions];
  }, [selectedCandidate, interviewerSectionData]);
console.log("mergedQuestions",mergedQuestions);


  // Preselected Questions Responses State Management
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] = useState([]);

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      if (typeof setInterviewerSectionData === 'function') {
        setInterviewerSectionData((prevList) => {
          if (prevList.some((q) => q.questionId === question.questionId)) {
            return prevList;
          }
          const newList = [
            ...prevList,
            {
              ...question,
              addedBy: 'interviewer',
              mandatory: "false", // Default to false when adding a new question
              snapshot: {
                ...question.snapshot,
                addedBy: 'interviewer',
                mandatory: "false"
              }
            },
          ];

          // Clear questions error if questions are added
          // if (newList.length > 0) {
          //   clearError('questions');
          // }

          return newList;
        });
      } else {
        console.warn('setInterviewerSectionData is not a function, cannot add question to round');
      }
    }
    // if (question && question.questionId && question.snapshot) {
    //   setInterviewerSectionData((prevList) => {
    //     if (prevList.some((q) => q.questionId === question.questionId)) {
    //       return prevList;
    //     }
    //     return [
    //       ...prevList,
    //       {
    //         ...question,
    //         mandatory: "false", // Default to false when adding a new question
    //         snapshot: {
    //           ...question.snapshot,
    //           mandatory: "false"
    //         }
    //       },
    //     ]; // Add new question
    //   });
    // }
  };

  const handleRemoveQuestion = (questionId) => {
    console.log("Removing question:", questionId);
    
    // Remove question from interviewer section data
    setInterviewerSectionData(prev => prev.filter(q => (q.questionId || q.id) !== questionId));
    
    // Add to removed question IDs
    setRemovedQuestionIds(prev => [...prev, questionId]);
  };

  const handleToggleMandatory = (questionId) => {
    console.log("Toggling mandatory for question:", questionId);
    
    // Toggle mandatory status for the question
    setInterviewerSectionData(prev => {
      console.log("Previous state:", prev);
      const updated = prev.map(q => {
        if ((q.questionId || q.id) === questionId) {
          console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          console.log("New mandatory value:", newMandatory);
          return { 
            ...q, 
            mandatory: newMandatory,
            snapshot: q.snapshot ? {
              ...q.snapshot,
              mandatory: newMandatory
            } : undefined
          };
        }
        return q;
      });
      console.log("Updated state:", updated);
      return updated;
    });
  };

  // Preselected Questions Responses Handler Functions
  const handlePreselectedQuestionResponse = (questionId, responseData) => {
    setPreselectedQuestionsResponses(prev => {
      const existingIndex = prev.findIndex(q => q.questionId === questionId);
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...responseData };
        return updated;
      } else {
        // Add new response
        return [...prev, { questionId, ...responseData }];
      }
    });
  };

  const tabs = [
    { id: 'candidate', label: 'Candidate Details', icon: User },
   { id: 'questions', label: 'Interview Questions', icon: MessageSquare },
    {id:'interviewActions',label:'Interview Actions',icon:FileText},
    { id: 'feedback', label: 'Feedback Form', icon: FileText },
    // { id: 'management', label: 'Feedback Management', icon: Users }
  ];

  console.log("mergedQuestions",mergedQuestions);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
    <div className="min-h-screen bg-gray-50 ">
      {/* Meeting Controls - Floating */}
      {/* <div className="fixed top-14 right-4 z-40 bg-white shadow-lg rounded-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(decodedData.meetLink, '_blank')}
            className="bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Start Meeting
          </button>
        </div>
      </div> */}

      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar - No Scroll */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
          <div className="p-6 flex-col h-full">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3  font-medium transition-colors
                      ${decodedData?.schedule && tab.id === 'questions' ? 'hidden' : ''}
                      ${
                        activeTab === tab.id
                        ? 'bg-blue-50 text-custom-blue border-r-4 border-custom-blue'
                        : 'text-gray-600 hover:bg-gray-50'
                      // activeTab === tab.id
                      //   ? 'bg-[#217989] text-white'
                      //   : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 bg-gray-50 mb-10 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'candidate' && <CandidateMiniTab selectedData={selectedCandidate} isAddMode={true} decodedData={decodedData} />}
             {!decodedData?.schedule && activeTab === 'questions' && (
              <InterviewsMiniTabComponent 
                interviewData={selectedCandidate} 
                isAddMode={true}
                
                interviewerSectionData={interviewerSectionData}
                setInterviewerSectionData={setInterviewerSectionData}
                removedQuestionIds={removedQuestionIds}
                setRemovedQuestionIds={setRemovedQuestionIds}
                isQuestionBankOpen={isQuestionBankOpen}
                setIsQuestionBankOpen={setIsQuestionBankOpen}
                handleAddQuestionToRound={handleAddQuestionToRound}
                handleRemoveQuestion={handleRemoveQuestion}
                handleToggleMandatory={handleToggleMandatory}
                preselectedQuestionsResponses={preselectedQuestionsResponses}
                setPreselectedQuestionsResponses={setPreselectedQuestionsResponses}
                handlePreselectedQuestionResponse={handlePreselectedQuestionResponse}
                decodedData={decodedData}
                
              />
            )}
            {
              activeTab === 'interviewActions' && (
                <InterviewActions 
                  interviewData={selectedCandidate}
                  isAddMode={true}
                  decodedData={decodedData}
                />
              )
            }
            {activeTab === 'feedback' && (
              <FeedbackForm 
                interviewerSectionData={interviewerSectionData}
                setInterviewerSectionData={setInterviewerSectionData}
                interviewRoundId={decodedData?.interviewRoundId}
                candidateId={selectedCandidate?.candidate?._id}
                positionId={selectedCandidate?.position?._id}
                interviewerId={decodedData?.interviewerId}
                feedbackCandidate={selectedCandidate}
                // tenantId={decodedData?.tenantId}
                // isEditMode={false}
                // feedbackId={null}
                preselectedQuestionsResponses={preselectedQuestionsResponses}
                decodedData={decodedData}
                isAddMode={true}
                isScheduler={isScheduler}
                schedulerFeedbackData ={schedulerFeedbackData}
              />
            )}
            {/* {activeTab === 'management' && <FeedbackManagement />} */}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default InterviewerView;