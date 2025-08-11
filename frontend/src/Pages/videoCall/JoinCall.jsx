import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import RoleSelector from './RoleSelector';
import CandidateView from './CandidateView';
import InterviewerView from './InterviewerView';
import CombinedNavbar from '../../Components/Navbar/CombinedNavbar';
import { decryptData } from '../../utils/PaymentCard';
import { config } from '../../config';
import { isAuthenticated, getCurrentUserId, getActiveUserData } from '../../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode';

function JoinMeeting() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Authentication check function
  const checkAuthentication = () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        const returnUrl = encodeURIComponent(window.location.href);
        navigate(`/organization-login?returnUrl=${returnUrl}`);
        return false;
      }

      // Get current user data
      const currentUserData = getActiveUserData();
      if (!currentUserData) {
        console.log('Unable to get current user data, redirecting to login');
        const returnUrl = encodeURIComponent(window.location.href);
        navigate(`/organization-login?returnUrl=${returnUrl}`);
        return false;
      }

      // Extract ownerId from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const encryptedOwnerId = urlParams.get('ownerId');
      
      if (!encryptedOwnerId) {
        console.log('No ownerId in URL parameters');
        setAuthError('Invalid meeting link: missing owner information');
        setIsAuthChecking(false);
        return false;
      }

      // Decrypt ownerId from URL
      let decryptedOwnerId;
      try {
        const decodedOwnerId = decodeURIComponent(encryptedOwnerId);
        decryptedOwnerId = decryptData(decodedOwnerId);
        console.log('Decrypted ownerId from URL:', decryptedOwnerId);
      } catch (error) {
        console.error('Error decrypting ownerId:', error);
        setAuthError('Invalid meeting link: unable to decrypt owner information');
        setIsAuthChecking(false);
        return false;
      }

      // Get current user's ownerId from token
      const currentUserOwnerId = currentUserData.userId || currentUserData.id;
      console.log('Current user ownerId:', currentUserOwnerId);
      console.log('URL ownerId:', decryptedOwnerId);

      // Check if ownerId matches
      if (currentUserOwnerId !== decryptedOwnerId) {
        console.log('OwnerId mismatch, redirecting to login');
        const returnUrl = encodeURIComponent(window.location.href);
        navigate(`/organization-login?returnUrl=${returnUrl}`);
        return false;
      }

      console.log('Authentication successful, ownerId matches');
      setIsAuthChecking(false);
      return true;

    } catch (error) {
      console.error('Error in authentication check:', error);
      setAuthError('Authentication error occurred');
      setIsAuthChecking(false);
      return false;
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    // Only check authentication for scheduler and interviewer links
    const urlParams = new URLSearchParams(location.search);
    const schedule = urlParams.get('scheduler');
    const interviewer = urlParams.get('interviewer');
    const candidate = urlParams.get('candidate');

    const isSchedule = schedule === 'true';
    const isInterviewer = interviewer === 'true';
    const isCandidate = candidate === 'true';

    // Skip authentication for candidate links
    if (isCandidate) {
      console.log('Candidate link detected, skipping authentication');
      setIsAuthChecking(false);
      return;
    }

    // Check authentication for scheduler and interviewer links
    if (isSchedule || isInterviewer) {
      console.log('Scheduler or interviewer link detected, checking authentication');
      checkAuthentication();
    } else {
      console.log('No specific role detected, skipping authentication');
      setIsAuthChecking(false);
    }
  }, [location.search]);


  // Function to fetch feedback data
  const fetchFeedbackData = async (roundId, interviewerId) => {
    if (!roundId) {
      console.log('No round ID provided, skipping feedback fetch');
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      
      console.log('🔍 Fetching feedback data for round ID:', roundId);
      console.log('👤 Interviewer ID for filtering:', interviewerId);
      
      // Build URL with query parameters
      let url = `${config.REACT_APP_API_URL}/feedback/round/${roundId}`;
      if (interviewerId) {
        url += `?interviewerId=${interviewerId}`;
      }
      
      console.log('🌐 Making API call to:', url);
      
      const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${Cookies.get('authToken')}`
          },
      });

      if (response.data.success) {
        console.log('✅ Feedback data fetched successfully:', response.data.data);
        console.log('📊 Response summary:', {
          hasInterviewRound: !!response.data.data.interviewRound,
          hasCandidate: !!response.data.data.candidate,
          hasPosition: !!response.data.data.position,
          interviewersCount: response.data.data.interviewers?.length || 0,
          feedbacksCount: response.data.data.feedbacks?.length || 0,
          interviewQuestionsCount: response.data.data.interviewQuestions?.length || 0,
          filteredByInterviewer: response.data.data.filteredByInterviewer || false
        });
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
    // Skip if still checking authentication
    if (isAuthChecking) return;

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
      round,
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

    const interviewerId ="68664845d494db82db30103c"
    // Extract key information
    const extractedData = {
      schedule: isSchedule,
      isCandidate: isCandidate,
      isInterviewer: isInterviewer,
      meetLink: decryptedMeeting,
      roundData: decryptedRound,
      interviewRoundId: decryptedRound || '',
      interviewerId:interviewerId || "not found",
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
      fetchFeedbackData(extractedData.interviewRoundId, extractedData.interviewerId);
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

  }, [location.search, isAuthChecking]);

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

  // Show loading while checking authentication
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-4">{authError}</p>
          <button 
            onClick={() => {
              const returnUrl = encodeURIComponent(window.location.href);
              navigate(`/organization-login?returnUrl=${returnUrl}`);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show appropriate view based on user's button click
  if (currentRole === 'candidate') {
    return <CandidateView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackData} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />;
  }

  if (currentRole === 'interviewer') {
    return (
      <>
        <CombinedNavbar />
        <InterviewerView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackData} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />
      </>
    );
  }

  // Always show RoleSelector first - user must click button to proceed
  return <RoleSelector onRoleSelect={handleRoleSelect} roleInfo={urlRoleInfo} />;
}

export default JoinMeeting;