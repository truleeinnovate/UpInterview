// v1.0.0 - Ashok - Improved responsiveness and added common code to popup

// FeedbackFormModal.jsx
import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Expand, Minimize } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import CandidateMiniTab from "./MiniTabs/Candidate";
import InterviewsMiniTabComponent from "./MiniTabs/Interviews";
import FeedbackForm from "../../../videoCall/FeedbackForm";
// v1.0.0 <-----------------------------------------------------------
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.0 ----------------------------------------------------------->

const tabsList = [
  { id: 1, tab: "Candidate" },
  { id: 2, tab: "Interview Questions" },
  { id: 3, tab: "Feedback Form" },
];

const FeedbackFormModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  const { mode = "view", feedback } = state || {};

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const isEditMode = mode === "edit";

  const isViewMode = mode === "view";

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Question Bank State Management
  const [interviewerSectionData, setInterviewerSectionData] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Preselected Questions Responses State Management
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState([]);

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
              mandatory: "false",
            },
          },
        ]; // Add new question
      });
    }
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

  const displayData = () => {
    switch (activeTab) {
      case 1:
        return <CandidateMiniTab isViewMode={isViewMode} />;
      case 2:
        return (
          <InterviewsMiniTabComponent
            tab={true}
            page="Popup"
            closePopup={handleClose}
            isEditMode={isEditMode}
            isViewMode={isViewMode}
            // interviewData={selectedCandidate}
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
            handlePreselectedQuestionResponse={
              handlePreselectedQuestionResponse
            }
          />
        );
      case 3:
        return (
          <FeedbackForm
            tab={true}
            page="Popup"
            isEditMode={isEditMode}
            isViewMode={isViewMode}
            interviewerSectionData={interviewerSectionData}
            setInterviewerSectionData={setInterviewerSectionData}
            // interviewRoundId={decodedData?.interviewRoundId}
            // candidateId={selectedCandidate?.candidate?._id}
            // positionId={selectedCandidate?.position?._id}
            // interviewerId={decodedData?.interviewerId}
            // tenantId={decodedData?.tenantId}
            // isEditMode={false}
            // feedbackId={null}
            preselectedQuestionsResponses={preselectedQuestionsResponses}
          />
        );

      default:
        return null;
    }
  };

  if (!feedback) return null;

  return (
    // v1.0.0 <-----------------------------------------------------------------------------
    <SidebarPopup title="Interview Feedback" onClose={handleClose}>
      <div>
        <ul
          className="flex items-center gap-8 cursor-pointer py-1 sm:px-4 px-8 
             overflow-x-auto whitespace-nowrap scrollbar-hide"
        >
          {tabsList.map((EachTab) => (
            <li
              key={EachTab.id}
              onClick={() => setActiveTab(EachTab.id)}
              className={`pb-2 flex-shrink-0 ${
                activeTab === EachTab.id ? "border-b-2 border-[#227a8a]" : ""
              }`}
            >
              {EachTab.tab}
            </li>
          ))}
        </ul>

        <div className="flex-1 overflow-y-auto">{displayData()}</div>
      </div>
    </SidebarPopup>
    // v1.0.0 ----------------------------------------------------------------------------->
  );
};

export default FeedbackFormModal;
