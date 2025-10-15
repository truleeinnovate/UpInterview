// v1.0.0 - Ashok - Improved responsiveness

import React, { useCallback, useMemo, useState } from "react";
import {
  User,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// import CandidateDetails from './CandidateDetails';
import CandidateMiniTab from "../Dashboard-Part/Tabs/Feedback/MiniTabs/Candidate";

import FeedbackForm from "./FeedbackForm";

import InterviewsMiniTabComponent from "../Dashboard-Part/Tabs/Feedback/MiniTabs/Interviews";
import InterviewActions from "./InterviewActions";

const InterviewerView = ({
  onBack,
  decodedData,
  feedbackData,
  feedbackLoading,
  feedbackError,
  isScheduler,
  schedulerFeedbackData,
}) => {
  const [activeTab, setActiveTab] = useState("candidate");
  const [selectedCandidate] = useState(feedbackData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  console.log(
    "selectedCandidate",
    selectedCandidate,
    isScheduler,
    feedbackData
  );

  // Question Bank State Management
  const initialQuestions = feedbackData?.questionFeedback || [];
  // const [interviewerSectionData, setInterviewerSectionData] = useState(
  //   Array.isArray(initialQuestions) ? [...initialQuestions] : []
  // );

  const [interviewerSectionData, setInterviewerSectionData] = useState(() => {
    if (!feedbackData?.questionFeedback) return [];

    return feedbackData.questionFeedback.map((q) => {
      // Map backend answer types to UI values
      const mapAnswerType = (type) => {
        if (type === "correct") return "Fully Answered";
        if (type === "partial") return "Partially Answered";
        if (type === "incorrect" || type === "not answered")
          return "Not Answered";
        return "Not Answered";
      };

      return {
        ...q,
        questionId: q.questionId || q._id,
        isAnswered: mapAnswerType(q.candidateAnswer?.answerType),
        isLiked: q.interviewerFeedback?.liked || "",
        whyDislike: q.interviewerFeedback?.dislikeReason || "",
        note: q.interviewerFeedback?.note || "",
        notesBool: !!q.interviewerFeedback?.note,
        // Preserve original data for reference
        originalData: q,
      };
    });
  });
  console.log("interviewerSectionData", interviewerSectionData);

  // const [interviewerSectionData, setInterviewerSectionData] = useState( [...selectedCandidate.interviewData?.questionFeedback]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Merge answered and newly added
  const mergedQuestions = useMemo(() => {
    // Get existing interviewer questions from API
    const existingInterviewerQuestions =
      selectedCandidate?.interviewData?.questionFeedback || [];

    // Get newly added questions from interviewerSectionData
    const newlyAddedQuestions = (interviewerSectionData || []).filter(
      (newQ) => {
        const newId = newQ.questionId || newQ._id || newQ.id;
        return !existingInterviewerQuestions.some((existingQ) => {
          const existingId =
            existingQ.questionId || existingQ._id || existingQ.id;
          return existingId === newId;
        });
      }
    );

    // Combine both for submission purposes
    return [...existingInterviewerQuestions, ...newlyAddedQuestions];
  }, [selectedCandidate, interviewerSectionData]);
  console.log("mergedQuestions", mergedQuestions);

  // // Preselected Questions Responses State Management
  // const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] = useState([]);

  // Properly initialize preselected questions with full question data and responses
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState(() => {
      const preselectedQuestions =
        feedbackData?.interviewQuestions?.preselectedQuestions || [];
      console.log(
        "🔄 Initializing preselected questions:",
        preselectedQuestions
      );

      return preselectedQuestions.map((question) => {
        // Find existing feedback for this question
        const existingFeedback = feedbackData?.questionFeedback?.find(
          (f) => f.questionId === (question.questionId || question._id)
        );

        return {
          // Include the full question data
          ...question,
          // Response data with proper defaults
          isAnswered: existingFeedback?.candidateAnswer?.answerType
            ? existingFeedback.candidateAnswer.answerType === "correct"
              ? "Fully Answered"
              : existingFeedback.candidateAnswer.answerType === "partial"
              ? "Partially Answered"
              : "Not Answered"
            : "Not Answered",
          isLiked: existingFeedback?.interviewerFeedback?.liked || "",
          whyDislike:
            existingFeedback?.interviewerFeedback?.dislikeReason || "",
          note: existingFeedback?.interviewerFeedback?.note || "",
          notesBool: !!existingFeedback?.interviewerFeedback?.note,
          answer: existingFeedback?.candidateAnswer?.submittedAnswer || "",
        };
      });
    });

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      if (typeof setInterviewerSectionData === "function") {
        setInterviewerSectionData((prevList) => {
          if (prevList.some((q) => q.questionId === question.questionId)) {
            return prevList;
          }
          const newList = [
            ...prevList,
            {
              ...question,
              addedBy: "interviewer",
              mandatory: "false", // Default to false when adding a new question
              snapshot: {
                ...question.snapshot,
                addedBy: "interviewer",
                mandatory: "false",
              },
            },
          ];

          // Clear questions error if questions are added
          // if (newList.length > 0) {
          //   clearError('questions');
          // }

          return newList;
        });
      } else {
        console.warn(
          "setInterviewerSectionData is not a function, cannot add question to round"
        );
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
    setInterviewerSectionData((prev) =>
      prev.filter((q) => (q.questionId || q.id) !== questionId)
    );

    // Add to removed question IDs
    setRemovedQuestionIds((prev) => [...prev, questionId]);
  };

  const handleToggleMandatory = (questionId) => {
    console.log("Toggling mandatory for question:", questionId);

    // Toggle mandatory status for the question
    setInterviewerSectionData((prev) => {
      console.log("Previous state:", prev);
      const updated = prev.map((q) => {
        if ((q.questionId || q.id) === questionId) {
          console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          console.log("New mandatory value:", newMandatory);
          return {
            ...q,
            mandatory: newMandatory,
            snapshot: q.snapshot
              ? {
                  ...q.snapshot,
                  mandatory: newMandatory,
                }
              : undefined,
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
    setPreselectedQuestionsResponses((prev) => {
      const existingIndex = prev.findIndex((q) => q.questionId === questionId);
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

  // Enhanced handler to update both response data and question data
  const enhancedHandlePreselectedQuestionResponse = useCallback(
    (questionId, updates) => {
      console.log("🔄 Enhanced handler called with full question data:", {
        questionId,
        updates,
      });

      setPreselectedQuestionsResponses((prev) => {
        const existingIndex = prev.findIndex(
          (response) =>
            response.questionId === questionId ||
            response.id === questionId ||
            response._id === questionId
        );

        let newResponses;
        if (existingIndex >= 0) {
          // Update existing response while preserving question data
          newResponses = prev.map((response, index) =>
            index === existingIndex
              ? {
                  ...response, // Preserve existing question data
                  ...updates, // Update response fields
                }
              : response
          );
        } else {
          // This shouldn't happen often, but handle it by finding the question data
          const preselectedQuestions =
            feedbackData?.interviewQuestions?.preselectedQuestions || [];
          const questionData = preselectedQuestions.find(
            (q) => q.questionId === questionId || q._id === questionId
          );

          newResponses = [
            ...prev,
            {
              ...questionData, // Include full question data
              questionId: questionId,
              ...updates,
            },
          ];
        }

        console.log("📝 Updated preselectedQuestionsResponses:", newResponses);
        return newResponses;
      });

      // Also call the original handler if it exists
      if (handlePreselectedQuestionResponse) {
        handlePreselectedQuestionResponse(questionId, updates);
      }
    },
    [
      setPreselectedQuestionsResponses,
      handlePreselectedQuestionResponse,
      feedbackData,
    ]
  );

  const tabs = [
    { id: "candidate", label: "Candidate Details", icon: User },
    { id: "questions", label: "Interview Questions", icon: MessageSquare },
    { id: "interviewActions", label: "Interview Actions", icon: FileText },
    { id: "feedback", label: "Feedback Form", icon: FileText },
    // { id: 'management', label: 'Feedback Management', icon: Users }
  ];

  console.log("mergedQuestions", mergedQuestions);

  return (
    // v1.0.0 <------------------------------------------------------------------------------
    <div className="flex-1 flex flex-col overflow-hidden mt-1">
      <div className="min-h-screen bg-gray-50">
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

        <div className="flex h-screen overflow-hidden relative">
          {/* Fixed Sidebar - No Scroll */}
          {/* <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex-shrink-0"> */}
          <div
            className={`
            absolute inset-y-0 left-0 sm:w-62 md:w-62 lg:w-70 xl:w-70 2xl:w-70 bg-white transform transition-transform duration-300 ease-in-out
            z-30 lg:relative xl:relative 2xl:relative lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0 lg:z-10 shadow-lg
            ${
              isSidebarOpen
                ? "translate-x-0 w-60"
                : "-translate-x-full lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0"
            }
          `}
          >
            <div className="flex-grow overflow-y-auto">
              <nav className="mt-6 pb-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`outline-none w-[230px] flex items-center px-6 py-3 text-sm font-medium transition-colors
                      ${
                        decodedData?.schedule && tab.id === "questions"
                          ? "hidden"
                          : ""
                      }
                      ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-custom-blue border-r-4 border-custom-blue"
                          : "text-gray-600 hover:bg-gray-50"
                        // activeTab === tab.id
                        //   ? 'bg-[#217989] text-white'
                        //   : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              onClick={toggleSidebar}
              className="absolute cursor-pointer right-0 top-2 sm:translate-x-3/4 md:translate-x-3/4 lg:translate-x-1/2 xl:translate-x-1/2 2xl:translate-x-1/2 rounded-full w-10 h-10 flex items-center justify-center shadow lg:hidden xl:hidden 2xl:hidden transition-opacity duration-300 bg-white/70 opacity-90"
            >
              {isSidebarOpen ? (
                <span
                  title="Close Sidebar"
                  className="flex items-center justify-center"
                >
                  <ChevronLeft className="h-5 w-5 text-custom-blue" />
                </span>
              ) : (
                <span
                  title="Open Sidebar"
                  className="flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5 text-custom-blue" />
                </span>
              )}
            </button>
          </div>
          {/* </div> */}

          {/* Scrollable Main Content */}
          <div className="flex-1 bg-gray-50 max-h-[calc(100vh-58px)] overflow-y-auto">
            <div className="py-6 sm:px-3 px-6">
              {activeTab === "candidate" && (
                <CandidateMiniTab
                  selectedData={selectedCandidate}
                  isAddMode={true}
                  decodedData={decodedData}
                />
              )}
              {!decodedData?.schedule && activeTab === "questions" && (
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
                  setPreselectedQuestionsResponses={
                    setPreselectedQuestionsResponses
                  }
                  handlePreselectedQuestionResponse={
                    handlePreselectedQuestionResponse
                  }
                  decodedData={decodedData}
                />
              )}
              {activeTab === "interviewActions" && (
                <InterviewActions
                  interviewData={selectedCandidate}
                  isAddMode={true}
                  decodedData={decodedData}
                />
              )}
              {activeTab === "feedback" && (
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
                  schedulerFeedbackData={schedulerFeedbackData}
                />
              )}
              {/* {activeTab === 'management' && <FeedbackManagement />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
    // v1.0.0 ------------------------------------------------------------------------------>
  );
};

export default InterviewerView;
