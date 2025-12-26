// frontend/src/Pages/videoCall/VideoSdkPanel.js
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CandidateDetails from '../Pages/videoCall/CandidateDetails';
import FeedbackForm from '../Pages/videoCall/FeedbackForm';
import InterviewActions from '../Pages/videoCall/InterviewActions';

const VideoSdkPanel = () => {
  const { panelType } = useParams();
  const [searchParams] = useSearchParams();
  
  // Parse the data from URL search params
  const parseData = () => {
    const data = {};
    for (let [key, value] of searchParams.entries()) {
      try {
        // Try to parse as JSON, fallback to string if not valid JSON
        data[key] = JSON.parse(value);
      } catch (e) {
        data[key] = value;
      }
    }
    return data;
  };

  const panelData = parseData();

  const renderPanel = () => {
    switch (panelType) {
      case 'candidate-details':
        return <CandidateDetails candidate={panelData} isFullScreen onClose={() => window.close()} />;
      case 'feedback':
        return <FeedbackForm isFullScreen onClose={() => window.close()} />;
      case 'interview-actions':
        return (
          <div className="p-4">
            <InterviewActions
              isFullScreen
              onClose={() => window.close()}
              interviewData={panelData}
              isAddMode={false}
              decodedData={{}}
              onActionComplete={() => {}}
            />
          </div>
        );
      default:
        return <div>Panel not found</div>;
    }
  };

  const getTitle = () => {
    switch (panelType) {
      case 'candidate-details': return 'Candidate Details';
      case 'feedback': return 'Interview Feedback';
      case 'interview-actions': return 'Interview Actions';
      default: return '';
    }
  };

  return (
    <div className="h-screen w-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">
          {getTitle()}
        </h2>
        <button 
          onClick={() => window.close()}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
        {renderPanel()}
      </div>
    </div>
  );
};

export default VideoSdkPanel;