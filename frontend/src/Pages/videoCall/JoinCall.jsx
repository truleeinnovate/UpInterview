import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import RoleSelector from './RoleSelector';
import CandidateView from './CandidateView';
import InterviewerView from './InterviewerView';
import { decryptData } from '../../utils/PaymentCard';
import { config } from '../../config';

function JoinMeeting() {
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // Function to fetch feedback data
  const fetchFeedbackData = async (roundId) => {
    if (!roundId) {
      console.log('No round ID provided, skipping feedback fetch');
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      
      console.log('🔍 Fetching feedback data for round ID:', roundId);
      
              const response = await axios.get(`${config.REACT_APP_API_URL}/feedback/round/${roundId}`, {
                  headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`
          },
      });

      if (response.data.success) {
        console.log('✅ Feedback data fetched successfully:', response.data.data);
        setFeedbackData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch feedback data');
      }
    } catch (error) {
      console.error('❌ Error fetching feedback data:', error);
      setFeedbackError(error.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const schedule = urlParams.get('schedule');
    const meeting = urlParams.get('meeting');
    const round = urlParams.get('round');
    const candidate = urlParams.get('candidate');
    const interviewer = urlParams.get('interviewer');

    console.log('=== URL PARAMETERS DEBUG ===');
    console.log('Raw URL parameters:', {
      schedule,
      candidate,
      interviewer,
      meeting,
      round
    });

    // Parse schedule parameter
    const isSchedule = schedule === 'true';
    const isCandidate = candidate === 'true';
    const isInterviewer = interviewer === 'true';
    console.log('Schedule boolean:', isSchedule);
    console.log('Is Candidate:', isCandidate);
    console.log('Is Interviewer:', isInterviewer);

    // Decrypt meeting data
    let decryptedMeeting = null;
    if (meeting) {
      try {
        const decodedMeeting = decodeURIComponent(meeting);
        console.log('Decoded meeting parameter:', decodedMeeting);
        decryptedMeeting = decryptData(decodedMeeting);
        console.log('Decrypted meeting data:', decryptedMeeting);
      } catch (error) {
        console.error('Error decrypting meeting data:', error);
      }
    }

    // Decrypt round data
    let decryptedRound = null;
    if (round) {
      try {
        const decodedRound = decodeURIComponent(round);
        console.log('Decoded round parameter:', decodedRound);
        decryptedRound = decryptData(decodedRound);
        console.log('Decrypted round data:', decryptedRound);
      } catch (error) {
        console.error('Error decrypting round data:', error);
      }
    }

    // Extract key information
    const extractedData = {
      schedule: isSchedule,
      isCandidate: isCandidate,
      isInterviewer: isInterviewer,
      meetLink: decryptedMeeting,
      roundData: decryptedRound,
      // meetLink: decryptedMeeting?.meetLink || decryptedRound?.meetLink,
      interviewRoundId: decryptedRound || '',
      // candidateId: decryptedMeeting?.candidateId || decryptedRound?.candidateId,
      // interviewerId: decryptedMeeting?.interviewerId || decryptedRound?.interviewerId,
      // isCandidate: decryptedMeeting?.isCandidate || decryptedRound?.isCandidate,
      // isInterviewer: decryptedMeeting?.isInterviewer || decryptedRound?.isInterviewer
    };

    console.log('=== EXTRACTED DATA ===');
    console.log('Schedule:', extractedData.schedule);
    console.log('Meet Link:', extractedData.meetLink);
    console.log('Interview Round ID:', extractedData.interviewRoundId);
    console.log('Is Candidate:', extractedData.isCandidate);
    console.log('Is Interviewer:', extractedData.isInterviewer);
    console.log('Full extracted data:', extractedData);

    setDecodedData(extractedData);

    // Fetch feedback data if we have a round ID
    if (extractedData.interviewRoundId) {
      console.log('🔄 Fetching feedback data for round ID:', extractedData.interviewRoundId);
      fetchFeedbackData(extractedData.interviewRoundId);
    } else {
      console.log('⚠️ No round ID available, skipping feedback fetch');
    }

    // Set role information for RoleSelector
    // If schedule=true, treat it as interviewer role
    const effectiveIsInterviewer = isInterviewer || isSchedule;
    const roleInfo = {
      isCandidate: isCandidate,
      isInterviewer: effectiveIsInterviewer,
      hasRolePreference: isCandidate || effectiveIsInterviewer
    };
    setUrlRoleInfo(roleInfo);

    // Auto-select candidate role if URL indicates candidate
    if (isCandidate) {
      console.log('Auto-selecting candidate role based on URL parameter');
      setCurrentRole('candidate');
    } else {
      console.log('RoleSelector will be shown - user must click button to proceed');
    }

  }, [location.search]);

  // Debug useEffect to log feedback data changes
  useEffect(() => {
    console.log('📊 Feedback Data Status:', {
      loading: feedbackLoading,
      error: feedbackError,
      hasData: !!feedbackData,
      dataKeys: feedbackData ? Object.keys(feedbackData) : []
    });
    
    if (feedbackData) {
      console.log('📋 Feedback Data Details:', {
        hasInterviewRound: !!feedbackData.interviewRound,
        hasCandidate: !!feedbackData.candidate,
        hasPosition: !!feedbackData.position,
        interviewersCount: feedbackData.interviewers?.length || 0,
        feedbacksCount: feedbackData.feedbacks?.length || 0
      });
    }
  }, [feedbackData, feedbackLoading, feedbackError]);

  const handleRoleSelect = (role) => {
    console.log('User clicked role selection:', role);
    setCurrentRole(role);
  };

  const handleBack = () => {
    console.log('User clicked back - returning to RoleSelector');
    setCurrentRole(null);
  };

  // Show appropriate view based on user's button click
  if (currentRole === 'candidate') {
    return <CandidateView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackData} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />;
  }

  if (currentRole === 'interviewer') {
    return <InterviewerView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackData} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />;
  }

  // Always show RoleSelector first - user must click button to proceed
  return <RoleSelector onRoleSelect={handleRoleSelect} roleInfo={urlRoleInfo} />;
}

export default JoinMeeting;