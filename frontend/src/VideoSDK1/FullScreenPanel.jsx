// VideoSDK1/FullScreenPanel.js
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { MeetingContainer } from './meeting/MeetingContainer';
import CandidateDetails from '../Pages/videoCall/CandidateDetails';
import FeedbackForm from '../Pages/videoCall/FeedbackForm';
import QuestionBank from '../Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank';
import InterviewActions from '../Pages/videoCall/InterviewActions';

const FullScreenPanel = () => {
const [searchParams] = useSearchParams();
  const [panelData, setPanelData] = useState(null);
  const panelType = searchParams.get('panel')?.toUpperCase();
  useEffect(() => {
    // If we have a candidate ID in URL, use it to fetch data
    const candidateId = searchParams.get('candidateId');
    if (candidateId) {
      // Fetch candidate data using the ID
      // fetchCandidateData(candidateId).then(setPanelData);
    }
  }, [searchParams]);

  const renderPanel = () => {
    switch (panelType) {
      case 'CANDIDATE':
        return <CandidateDetails candidate={panelData} isFullScreen={true} />;
      case 'FEEDBACK':
        return <FeedbackForm isFullScreen={true} />;
      case 'QUESTIONBANK':
        return <QuestionBank isFullScreen={true} />;
      case 'INTERVIEWACTIONS':
        return <InterviewActions isFullScreen={true} />;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="h-screen w-full bg-white p-6">
      <div className="max-w-7xl mx-auto h-full">
        <div className="bg-white rounded-lg shadow-lg h-full overflow-auto">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPanel;