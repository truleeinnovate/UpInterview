import React, { useState, useRef, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../../Components/Buttons/Button";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

// Mini Tab Components imported from your existing files
import CandidateMiniTab from "./MiniTabs/Candidate";
import InterviewsMiniTabComponent from "./MiniTabs/Interviews";
import FeedbackForm from "../../../videoCall/FeedbackForm";
import { usePendingFeedbacks } from '../../../../apiHooks/useFeedbacks';

const tabsList = [
  { id: 1, tab: "Feedback" },
  { id: 2, tab: "Interview Questions" },
  { id: 3, tab: "Candidate" },


];

const AddFeedbackForm = ({
  isModal = false,
  onClose,
  roundId,
  interviewType,
  mode = "feedback"
}) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const formRef = useRef(null);

  console.log("interviewType", interviewType)

  const { data, isLoading, isError, error } = usePendingFeedbacks();
  console.log("PENDING FEEDBACKS DATA ================================> ", data);

  // General Form Step State
  const [currentFormStep, setCurrentFormStep] = useState(paramId ? 2 : 1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    selectedRoundId: paramId || "", // Store the selected round ID
    candidateName: "",
    position: "",
    roundTitle: "",
    interviewerName: "",
    interviewDate: "",
    isMockInterview: false
  });

  // Helper function to parse date from different formats
  const parseDateForInput = (dateTimeString) => {
    if (!dateTimeString) return '';

    // Handle format like "15-02-2026 12:57 PM - 01:57 PM"
    const datePart = dateTimeString.split(' ')[0]; // Gets "15-02-2026"
    if (datePart && datePart.includes('-')) {
      const [day, month, year] = datePart.split('-');
      // Return in yyyy-MM-dd format for input type="date"
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  // Determine which tab should be active based on mode

  const getActiveTabFromMode = () => {
    switch (mode) {
      case "candidate":
        return 3; // Candidate tab
      case "interviews":
        return 2; // Interview Questions tab
      case "feedback":
      default:
        return 1; // Feedback Form tab
    }
  };


  // Step 2 Logic States
  const [activeTab, setActiveTab] = useState(getActiveTabFromMode()); // Set based on mode

  useEffect(() => {
    setActiveTab(getActiveTabFromMode());
  }, [mode]);

  const [interviewerSectionData, setInterviewerSectionData] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState([]);
  // State to store selected round details (includes interviewCode and sequence)
  const [selectedRoundDetails, setSelectedRoundDetails] = useState(null);

  // Transform all pending feedbacks into dropdown options
  const roundOptions = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      value: item.roundId,
      label: `${item.interviewCode || 'N/A'}-${item?.sequence ? item.sequence : 1}  - ${item.roundTitle || 'Round'} - ${item.candidate?.fullName || 'Unknown Candidate'} `,
      // Store all relevant details
      interviewCode: item.interviewCode,
      sequence: item.sequence || 1,
      roundId: item.roundId,
      roundTitle: item.roundTitle,
      candidateName: item.candidate?.fullName,
      interviewType: item.interviewType,
      isMock: item.isMock,
      dateTime: item.dateTime,
      interviewStatus: item.interviewStatus,
      // Store the entire item for reference if needed
      fullDetails: item
    }));
  }, [data]);




  // useEffect(() => {
  //   if (paramId && roundOptions.length > 0) {
  //     const selectedOption = roundOptions.find(opt => opt.value === paramId);
  //     if (selectedOption) {
  //       setSelectedRoundDetails(selectedOption);
  //     }
  //   }
  // }, [paramId, roundOptions]);

  useEffect(() => {
    if (paramId && roundOptions.length > 0) {
      const selectedOption = roundOptions.find(opt => opt.value === paramId);
      if (selectedOption) {
        setSelectedRoundDetails(selectedOption);
        // Update form data with selected round details
        setFormData(prev => ({
          ...prev,
          selectedRoundId: paramId,
          candidateName: selectedOption.candidateName || selectedOption.fullDetails?.candidate?.fullName || '',
          // Handle position differently for mock vs regular interviews
          position: selectedOption.isMock
            ? selectedOption.fullDetails?.mockDetails?.currentRole || selectedOption.fullDetails?.position?.title || ''
            : selectedOption.fullDetails?.position?.title || selectedOption.fullDetails?.candidate?.position || '',
          roundTitle: selectedOption.roundTitle || '',
          // interviewerName: fullName,
          interviewDate: parseDateForInput(selectedOption.dateTime),
          isMockInterview: selectedOption.isMock || false
        }));
      }
    }
  }, [paramId, roundOptions]);

  // Handle round selection
  const handleRoundChange = (e) => {
    const selectedValue = e.target.value;
    const selectedOption = roundOptions.find(opt => opt.value === selectedValue);

    // setFormData({
    //   ...formData,
    //   selectedRoundId: selectedValue,
    // });
    console.log("selectedOption", selectedOption)

    // Update form data with selected round details
    setFormData({
      ...formData,
      selectedRoundId: selectedValue,
      candidateName: selectedOption?.candidateName || selectedOption?.fullDetails?.candidate?.fullName || '',
      // Handle position differently for mock vs regular interviews
      position: selectedOption?.isMock
        ? selectedOption?.fullDetails?.mockDetails?.currentRole || selectedOption?.fullDetails?.position?.title || ''
        : selectedOption?.fullDetails?.position?.title || selectedOption?.fullDetails?.candidate?.position || '',
      roundTitle: selectedOption?.roundTitle || '',
      // interviewerName: fullName,
      interviewDate: parseDateForInput(selectedOption?.dateTime),
      isMockInterview: selectedOption?.isMock || false
    });



    setSelectedRoundDetails(selectedOption || null);

    // Clear error for this field if it exists
    if (errors.selectedRoundId) {
      setErrors(prev => ({ ...prev, selectedRoundId: undefined }));
    }
  };

  const handleClose = () => {
    if (currentFormStep === 2) {
      setCurrentFormStep(1);
      navigate("/feedback/new");
    } else {
      if (isModal && onClose) onClose();
      else navigate("/feedback");
    }
  };

  // const handleProceed = () => {
  //   if (!formData.feedbackCategory) {
  //     setErrors({ feedbackCategory: "Category is required" });
  //     return;
  //   }
  //   setCurrentFormStep(2);
  //   formRef.current?.scrollIntoView({ behavior: "smooth" });
  // };
  // const handleProceed = () => {
  //   const newErrors = {};

  //   if (!formData.selectedRoundId) {
  //     newErrors.selectedRoundId = "Please select a round";
  //   }

  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     return;
  //   }

  //   setCurrentFormStep(2);
  //   formRef.current?.scrollIntoView({ behavior: "smooth" });
  // };
  const handleProceed = () => {
    const newErrors = {};

    if (!formData.selectedRoundId) {
      newErrors.selectedRoundId = "Please select a round";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update URL before proceeding
    const selectedValue = formData.selectedRoundId;
    switch (mode) {
      case "candidate":
        navigate(`/feedback-candidate/${selectedValue}`, { replace: true });
        break;
      case "interviews":
        navigate(`/interviews-questions/${selectedValue}`, { replace: true });
        break;
      case "feedback":
      default:
        navigate(`/feedback/${selectedValue}`, { replace: true });
        break;
    }

    setCurrentFormStep(2);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle tab change - Update mode and URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // Update mode and URL based on selected tab
    if (formData.selectedRoundId) {
      switch (tabId) {
        case 1: // Feedback Form tab
          navigate(`/feedback/${formData.selectedRoundId}`);
          break;
        case 2: // Interview Questions tab
          navigate(`/interviews-questions/${formData.selectedRoundId}`);
          break;
        case 3: // Candidate tab
          navigate(`/feedback-candidate/${formData.selectedRoundId}`);
          break;


        default:
          break;
      }
    }
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


  if (roundOptions?.length === 0) {

    return <div className="flex justify-center items-center h-screen">
      <h1 className="text-center p-3">No Rounds Found</h1>
    </div>
  }



  const renderTabContent = () => {
    const effectiveRoundId = roundId || formData.selectedRoundId;
    const effectiveInterviewType = selectedRoundDetails?.isMock;
    console.log("selectedRoundDetails", selectedRoundDetails)
    console.log("effectiveInterviewType", effectiveInterviewType)

    switch (activeTab) {
      case 3:
        return (
          <CandidateMiniTab roundId={effectiveRoundId} page="Popup" interviewType={effectiveInterviewType} />
        );
      case 2:
        return (
          <InterviewsMiniTabComponent
            tab={true}
            page="Popup"
            closePopup={handleClose}
            interviewType={effectiveInterviewType}
            roundId={effectiveRoundId}
            isAddMode={true}
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
      case 1:
        return (
          <FeedbackForm
            tab={true}
            page="Popup"
            interviewType={effectiveInterviewType}
            roundId={effectiveRoundId}
            interviewerSectionData={interviewerSectionData}
            setInterviewerSectionData={setInterviewerSectionData}
            preselectedQuestionsResponses={preselectedQuestionsResponses}
            isAddMode={true}
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
            Feedback
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Round Selection Dropdown */}
              <div className="flex flex-col">
                <DropdownWithSearchField
                  label="Select Interview"
                  options={roundOptions}
                  value={formData.selectedRoundId}
                  onChange={handleRoundChange}
                  error={errors.selectedRoundId}
                  required
                  placeholder="Search by interview code, round title, or candidate name..."
                />
                <span className="text-xs mt-1 text-gray-500">Please select an interview round to proceed</span>

              </div>

              {/* Display selected round details (optional) */}
              {/* {selectedRoundDetails && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">Selected Round Details:</p>
                  <div className="mt-1 text-xs text-gray-600 space-y-1">
                    <p>Interview Code: {selectedRoundDetails.interviewCode}</p>
                    <p>Round: {selectedRoundDetails.roundTitle}</p>
                    <p>Sequence: {selectedRoundDetails.sequence}</p>
                    <p>Candidate: {selectedRoundDetails.candidateName}</p>
                    <p>Type: {selectedRoundDetails.isMock ? 'Mock Interview' : 'Regular Interview'}</p>
                    <p>Status: {selectedRoundDetails.interviewStatus}</p>
                    <p>Date & Time: {selectedRoundDetails.dateTime}</p>
                  </div>
                </div>
              )} */}

              {/* Basic Information Section */}
              {selectedRoundDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candidate Name
                        {/* <span className="text-red-500">*</span> */}
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={formData.candidateName}
                        className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                        placeholder="Enter candidate name"
                      />
                    </div>

                    {!formData.isMockInterview && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position
                          {/* <span className="text-red-500">*</span> */}
                        </label>
                        <input
                          type="text"
                          disabled={true}
                          value={formData.position}
                          className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Round Title
                        {/* <span className="text-red-500">*</span> */}
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={formData.roundTitle}
                        className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                        placeholder="e.g., Technical Screening, System Design"
                      />
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interviewer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={formData.interviewerName}
                        className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                        placeholder="Enter your name"
                      />
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Date
                        {/* <span className="text-red-500">*</span> */}
                      </label>
                      <input
                        type="date"
                        disabled={true}
                        value={formData.interviewDate}
                        className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent cursor-not-allowed"
                      />
                    </div>
                    {formData.isMockInterview && (
                      <div className="flex items-center pt-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            disabled
                            checked={formData.isMockInterview}
                            className="w-4 h-4 accent-custom-blue text-[rgb(33,121,137)] border-gray-300 rounded focus:ring-[rgb(33,121,137)]"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            This is a Mock Interview
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
      )
      }

      {
        currentFormStep === 2 && (
          <div className="space-y-4">
            {/* Dynamic Tab Content */}
            <div className="min-h-[400px] py-4">{renderTabContent()}</div>
          </div>
        )
      }
    </div >
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
              <span className="text-sm text-gray-500">Select Interview </span>
            ) : (
              <span className="text-sm text-gray-500">Feedback</span>
            )}
          </div>
        </div>
        {currentFormStep === 2 && (
          <ul className="flex self-start gap-6 cursor-pointer border-b mb-6 w-full">
            {tabsList.map((tab) => (
              <li
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 flex-shrink-0 text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-600 hover:text-gray-700"
                  }`}
              >
                {tab.tab}
              </li>
            ))}
          </ul>
        )}
        <div className="w-full  rounded-lg border bg-white">
          {formContent}
        </div>
      </div>
    </div>
  );
};

export default AddFeedbackForm;
