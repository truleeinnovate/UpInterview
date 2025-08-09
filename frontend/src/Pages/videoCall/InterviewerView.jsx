import React, { useState } from 'react';
import { Users, Video, LogOut, User, MessageSquare, FileText } from 'lucide-react';
import { mockData } from './mockData';
// import CandidateDetails from './CandidateDetails';
import CandidateMiniTab from '../Dashboard-Part/Tabs/Feedback/MiniTabs/Candidate'
import InterviewQuestions from './InterviewQuestions';
import FeedbackForm from './FeedbackForm';
import FeedbackManagement from './FeedbackManagement';
import InterviewsMiniTabComponent from '../Dashboard-Part/Tabs/Feedback/MiniTabs/Interviews';

const InterviewerView = ({ onBack,decodedData, feedbackData,feedbackLoading,feedbackError}) => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [selectedCandidate] = useState(feedbackData);

  console.log("selectedCandidate",selectedCandidate);
  
  // Question Bank State Management
  const [interviewerSectionData, setInterviewerSectionData] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Preselected Questions Responses State Management
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] = useState([]);

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setInterviewerSectionData((prevList) => {
        if (prevList.some((q) => q.questionId === question.questionId)) {
          return prevList;
        }
        return [
          ...prevList,
          {
            ...question,
            mandatory: "false", // Default to false when adding a new question
            snapshot: {
              ...question.snapshot,
              mandatory: "false"
            }
          },
        ]; // Add new question
      });
    }
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
    { id: 'feedback', label: 'Feedback Form', icon: FileText },
    // { id: 'management', label: 'Feedback Management', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      {/* Meeting Controls - Floating */}
      <div className="fixed top-14 right-4 z-40 bg-white shadow-lg rounded-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(decodedData.meetLink, '_blank')}
            className=" text-black hover:bg-[#1a616e] hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Start Meeting
          </button>
          {/* <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            <LogOut className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Fixed Sidebar - No Scroll */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
          <div className="p-6 sticky top-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#217989] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
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
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'candidate' && <CandidateMiniTab selectedData={selectedCandidate} />}
            {activeTab === 'questions' && (
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
              />
            )}
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
                isEditMode={false}
                // feedbackId={null}
                preselectedQuestionsResponses={preselectedQuestionsResponses}
              />
            )}
            {/* {activeTab === 'management' && <FeedbackManagement />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerView;