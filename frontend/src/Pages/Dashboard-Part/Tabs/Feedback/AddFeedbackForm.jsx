import React, { useState, useRef, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../Components/Buttons/Button";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

// Mini Tab Components imported from your existing files
import CandidateMiniTab from "./MiniTabs/Candidate";
import InterviewsMiniTabComponent from "./MiniTabs/Interviews";
import FeedbackForm from "../../../videoCall/FeedbackForm";

const tabsList = [
  { id: 1, tab: "Candidate" },
  { id: 2, tab: "Interview Questions" },
  { id: 3, tab: "Feedback Form" },
];

const AddFeedbackForm = ({
  isModal = false,
  onClose,
  roundId,
  interviewType,
}) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  // General Form Step State
  const [currentFormStep, setCurrentFormStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    feedbackCategory: "",
  });

  // Step 2 Logic States (Copied from FeedbackFormModal)
  const [activeTab, setActiveTab] = useState(1);
  const [interviewerSectionData, setInterviewerSectionData] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState([]);

  const categoryOptions = useMemo(
    () => [
      { value: "technical", label: "Technical Skills" },
      { value: "behavioral", label: "Behavioral" },
      { value: "culture", label: "Culture Fit" },
    ],
    [],
  );

  const handleClose = () => {
    if (isModal && onClose) onClose();
    else navigate(-1);
  };

  const handleProceed = () => {
    if (!formData.feedbackCategory) {
      setErrors({ feedbackCategory: "Category is required" });
      return;
    }
    setCurrentFormStep(2);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Logic Handlers (Step 2)
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setInterviewerSectionData((prevList) => {
        if (prevList.some((q) => q.questionId === question.questionId))
          return prevList;
        return [
          ...prevList,
          { ...question, addedBy: "interviewer", mandatory: "false" },
        ];
      });
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setInterviewerSectionData((prev) =>
      prev.filter((q) => (q.questionId || q.id) !== questionId),
    );
    setRemovedQuestionIds((prev) => [...prev, questionId]);
  };

  const handleToggleMandatory = (questionId) => {
    setInterviewerSectionData((prev) =>
      prev.map((q) => {
        if ((q.questionId || q.id) === questionId) {
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          return { ...q, mandatory: newMandatory };
        }
        return q;
      }),
    );
  };

  const handlePreselectedQuestionResponse = (questionId, responseData) => {
    setPreselectedQuestionsResponses((prev) => {
      const index = prev.findIndex((q) => q.questionId === questionId);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...responseData };
        return updated;
      }
      return [...prev, { questionId, ...responseData }];
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <CandidateMiniTab roundId={roundId} interviewType={interviewType} />
        );
      case 2:
        return (
          <InterviewsMiniTabComponent
            tab={true}
            page="Popup"
            closePopup={handleClose}
            interviewType={interviewType}
            roundId={roundId}
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
            interviewType={interviewType}
            roundId={roundId}
            interviewerSectionData={interviewerSectionData}
            setInterviewerSectionData={setInterviewerSectionData}
            preselectedQuestionsResponses={preselectedQuestionsResponses}
          />
        );
      default:
        return null;
    }
  };

  const formContent = (
    <div className="sm:p-0 p-4" ref={formRef}>
      {currentFormStep === 1 && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Feedback Setup
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <DropdownWithSearchField
                label="Feedback Category"
                options={categoryOptions}
                value={formData.feedbackCategory}
                onChange={(e) =>
                  setFormData({ ...formData, feedbackCategory: e.target.value })
                }
                error={errors.feedbackCategory}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              className="border border-custom-blue text-custom-blue"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              className="bg-custom-blue text-white"
            >
              Proceed
            </Button>
          </div>
        </div>
      )}

      {currentFormStep === 2 && (
        <div className="space-y-4">
          {/* Dynamic Tab Content */}
          <div className="min-h-[400px] py-4">{renderTabContent()}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed sm:px-[4%] px-[8%] top-[62px] inset-x-0 bottom-0 z-40 overflow-y-auto bg-white">
      <div className="relative flex flex-col min-h-full items-center justify-start pb-10 pt-4">
        <div className="w-full mb-4">
          <button
            onClick={handleClose}
            className="flex items-center text-gray-600 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Feedbacks
          </button>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Add Interview Feedback
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Step {currentFormStep} of 2</p>
            {currentFormStep === 1 ? (
              <span className="text-sm text-gray-500">Selection </span>
            ) : (
              <span className="text-sm text-gray-500">Configuration</span>
            )}
          </div>
        </div>
        {currentFormStep === 2 && (
          <ul className="flex self-start gap-6 cursor-pointer border-b mb-6 w-full">
            {tabsList.map((tab) => (
              <li
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 flex-shrink-0 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-custom-blue text-custom-blue"
                    : "text-gray-600 hover:text-gray-700"
                }`}
              >
                {tab.tab}
              </li>
            ))}
          </ul>
        )}
        <div className="w-full p-4 rounded-lg border bg-white">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default AddFeedbackForm;
