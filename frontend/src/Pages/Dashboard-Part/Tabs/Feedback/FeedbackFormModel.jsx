// FeedbackFormModal.jsx
import React, {useState} from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Expand, Minimize } from 'lucide-react';
import { IoMdClose } from 'react-icons/io';
import CandidateMiniTab from './MiniTabs/Candidate';
import InterviewsMiniTabComponent from './MiniTabs/Interviews';
import SkillsTabComponent from './MiniTabs/Skills';
import OverallImpressions from './MiniTabs/OverallImpressions';
import { useCustomContext } from '../../../../Context/Contextfetch.js';

const tabsList = [
  { id: 1, tab: "Candidate" },
  { id: 2, tab: "Interview Questions" },
  { id: 3, tab: "Skills" },
  { id: 4, tab: "Overall Impression" },
];

const FeedbackFormModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  const { mode = 'view', feedback } = state || {};

  // Get context data
  const {
    skillsTabData,
    setSkillsTabData,
    overallImpressionTabData,
    setOverallImpressionTabData,
    interviewerSectionData
  } = useCustomContext();

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const isEditMode = mode === 'edit';

  // Static data for view mode
  const staticFeedbackData = {
    _id: feedback?._id || "N/A",
    interview: feedback?.interview || "John Doe",
    interviewType: feedback?.interviewType || "Technical",
    scheduledDate: feedback?.scheduledDate || "2025-08-01",
    status: feedback?.status || "Active",
    feedback: feedback?.feedback || "Good performance",
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Button handler functions for the feedback modal
  const onClickPreviewButton = () => {
    // Navigate to preview page with current feedback data
    navigate('/feedback-preview', {
      state: {
        feedbackData: {
          candidateData: feedback,
          skillsTabData,
          overallImpressionTabData,
          interviewerSectionData
        }
      }
    });
  };

  const onClickSubmit = () => {
    // Handle feedback submission
    console.log('Submitting feedback:', {
      candidateData: feedback,
      skillsTabData,
      overallImpressionTabData,
      interviewerSectionData
    });
    // Add your submission logic here
    handleClose();
  };

  const onClickNextButton = () => {
    // Move to next tab
    if (activeTab < 4) {
      setActiveTab(activeTab + 1);
    }
  };

  const areAllValidationsMet = () => {
    // Add your validation logic here
    return true;
  };


  const displayData = () => {
    const roundDetails = { questions: [] };
    const interviewDetails = feedback ? {
      Candidate: feedback.interview,
      Position: "Software Developer",
      _id: feedback._id
    } : {};

    switch (activeTab) {
      case 1: 
        return <CandidateMiniTab 
          roundDetails={roundDetails} 
          interviewDetails={interviewDetails} 
          skillsTabData={skillsTabData}
          tab={true} 
          page="Popup"
          data={isEditMode ? feedback : staticFeedbackData}
          isEditMode={isEditMode}
        />;
      case 2: 
        return <InterviewsMiniTabComponent 
          roundDetails={roundDetails} 
          tab={true} 
          page="Popup" 
          closePopup={handleClose}
          data={isEditMode ? feedback : staticFeedbackData}
          isEditMode={isEditMode}
        />;
      case 3: 
        return <SkillsTabComponent 
          setSkillsTabData={setSkillsTabData}
          skillsTabData={skillsTabData}
          tab={true} 
          page="Popup"
          isEditMode={isEditMode}
        />;
      case 4: 
        return <OverallImpressions 
          overallImpressionTabData={overallImpressionTabData}
          setOverallImpressionTabData={setOverallImpressionTabData}
          tab={true} 
          page="Popup"
          isEditMode={isEditMode}
        />;
      default: 
        return null;
    }
  };

  if (!feedback) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className={`${isFullScreen ? "w-[100%]" : "w-[50%]"} bg-white h-[100%] flex flex-col`}>
        <div className="px-8 flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-[#227a8a]">Interview Feedback</h1>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
            >
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-500" />
              ) : (
                <Expand className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button 
              onClick={handleClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        </div>
        
        <ul className="flex items-center gap-8 cursor-pointer py-1 px-8">
          {tabsList.map((EachTab) => (
            <li
              key={EachTab.id}
              onClick={() => setActiveTab(EachTab.id)}
              className={`pb-2 ${activeTab === EachTab.id ? "border-b-2 border-[#227a8a]" : ""}`}
            >
              {EachTab.tab}
            </li>
          ))}
        </ul>
        
        <div className="flex-1 overflow-y-auto border-2 border-gray-200 border-solid rounded-md mx-8 mb-8 mt-4">
          {displayData()}
        </div>
        <div className="next-button--container flex justify-end py-1 pr-8 gap-4">
              {activeTab === 4 && isEditMode && (
                <>
                  <button 
                    //disabled={!areAllValidationsMet()} 
                    onClick={onClickPreviewButton} 
                    className={`bg-white text-[#227a8a] border-[1px] border-[#227a8a] py-[0.5rem] px-[2rem] rounded-lg `}//${!areAllValidationsMet() && "cursor-not-allowed"}
                  >
                    Preview
                  </button>
                  <button 
                    onClick={onClickSubmit} 
                    className="bg-[#227a8a] text-white py-[0.5rem] px-[2rem] rounded-lg"
                  >
                    Submit
                  </button>
                </>
              )}
              {activeTab <= 3 && isEditMode && (
                <button 
                  onClick={onClickNextButton} 
                  className="bg-[#227a8a] text-white py-[0.5rem] px-[2rem] rounded-lg"
                >
                  Next
                </button>
              )}
            </div>
      </div>
    </div>
  );
};

export default FeedbackFormModal;