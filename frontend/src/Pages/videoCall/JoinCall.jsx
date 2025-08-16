// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import RoleSelector from './RoleSelector';
// import CandidateView from './CandidateView';
// import InterviewerView from './InterviewerView';
// import CombinedNavbar from '../../Components/Navbar/CombinedNavbar';
// import { decryptData } from '../../utils/PaymentCard';
// import { config } from '../../config';
// import AuthCookieManager from '../../utils/AuthCookieManager/AuthCookieManager';
// import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode';
// import { useFeedbackData } from '../../apiHooks/useFeedbacks';


// function JoinMeeting() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [currentRole, setCurrentRole] = useState(null);
//   const [decodedData, setDecodedData] = useState(null);
//   const [urlRoleInfo, setUrlRoleInfo] = useState(null);
//   const [feedbackDatas, setFeedbackData] = useState(null);
//   // const [feedbackLoading, setFeedbackLoading] = useState(false);
//   // const [feedbackError, setFeedbackError] = useState(null);
//   const [isAuthChecking, setIsAuthChecking] = useState(true);
//   const [authError, setAuthError] = useState(null);

//   // ✅ New state for pre-auth status
//   const [preAuthPassed, setPreAuthPassed] = useState(false);
//   const [preAuthLoading, setPreAuthLoading] = useState(true);
//   const [AuthType, setAuthType] = useState(null);

//   // Authentication check function
//   const checkAuthentication = () => {
//     try {
//       if (!AuthCookieManager.isAuthenticated()) {
//         console.log('User not authenticated, redirecting to login');
//         const returnUrl = encodeURIComponent(window.location.href);
//         navigate(`/organization-login?returnUrl=${returnUrl}`);
//         return false;
//       }

//       const currentUserData = AuthCookieManager.getActiveUserData();
//       if (!currentUserData) {
//         console.log('Unable to get current user data, redirecting to login');
//         const returnUrl = encodeURIComponent(window.location.href);
//         navigate(`/organization-login?returnUrl=${returnUrl}`);
//         return false;
//       }

//       const urlParams = new URLSearchParams(location.search);
//       const encryptedOwnerId = urlParams.get('owner');

//       if (!encryptedOwnerId) {
//         console.log('No ownerId in URL parameters');
//         setAuthError('Invalid meeting link: missing owner information');
//         setIsAuthChecking(false);
//         return false;
//       }

//       let decryptedOwnerId;
//       try {
//         if (!AuthCookieManager.isAuthenticated()) {
//           console.log('User not authenticated, redirecting to login');
//           const returnUrl = encodeURIComponent(window.location.href);

//           // Determine login path based on role (interviewer vs scheduler/organization)
//           // const urlParams = new URLSearchParams(location.search);
//           // const isInterviewer = urlParams.get('interviewer') === 'true';
//           const isIndividual = AuthType === "individual";
//           const loginPath = isIndividual ? '/individual-login' : '/organization-login';

//           navigate(`${loginPath}?returnUrl=${returnUrl}`);
//           return false;
//         }

//         const currentUserData = AuthCookieManager.getActiveUserData();
//         if (!currentUserData) {
//           console.log('Unable to get current user data, redirecting to login');
//           const returnUrl = encodeURIComponent(window.location.href);

//           // Same login path logic as above
//           const urlParams = new URLSearchParams(location.search);
//           const isInterviewer = urlParams.get('interviewer') === 'true';
//           const loginPath = isInterviewer ? '/individual-login' : '/organization-login';

//           navigate(`${loginPath}?returnUrl=${returnUrl}`);
//           return false;
//         }

//         const urlParams = new URLSearchParams(location.search);
//         const encryptedOwnerId = urlParams.get('owner');

//         if (!encryptedOwnerId) {
//           console.log('No ownerId in URL parameters');
//           setAuthError('Invalid meeting link: missing owner information');
//           setIsAuthChecking(false);
//           return false;
//         }

//         let decryptedOwnerId;
//         try {
//           const decodedOwnerId = decodeURIComponent(encryptedOwnerId);
//           decryptedOwnerId = decryptData(decodedOwnerId);
//           console.log('Decrypted ownerId from URL:', decryptedOwnerId);
//         } catch (error) {
//           console.error('Error decrypting ownerId:', error);
//           setAuthError('Invalid meeting link: unable to decrypt owner information');
//           setIsAuthChecking(false);
//           return false;
//         }

//         const currentUserOwnerId = currentUserData.userId || currentUserData.id;
//         console.log('Current user ownerId:', currentUserOwnerId);
//         console.log('URL ownerId:', decryptedOwnerId);

//         if (currentUserOwnerId !== decryptedOwnerId) {
//           console.log('OwnerId mismatch, redirecting to login');
//           const returnUrl = encodeURIComponent(window.location.href);

//           // Same login path logic for mismatch
//           const urlParams = new URLSearchParams(location.search);
//           const isInterviewer = urlParams.get('interviewer') === 'true';
//           const loginPath = isInterviewer ? '/individual-login' : '/organization-login';

//           navigate(`${loginPath}?returnUrl=${returnUrl}`);
//           return false;
//         }

//         console.log('Authentication successful, ownerId matches');
//         setIsAuthChecking(false);
//         return true;
//       } catch (error) {
//         console.error('Error in authentication check:', error);
//         setAuthError('Authentication error occurred');
//         setIsAuthChecking(false);
//         return false;
//       }

//       // Check authentication on component mount

//       const currentUserOwnerId = currentUserData.userId || currentUserData.id;
//       console.log('Current user ownerId:', currentUserOwnerId);
//       console.log('URL ownerId:', decryptedOwnerId);
//       if (currentUserOwnerId !== decryptedOwnerId) {
//         console.log('OwnerId mismatch, redirecting to login');
//         const returnUrl = encodeURIComponent(window.location.href);
//         navigate(`/organization-login?returnUrl=${returnUrl}`);
//         return false;
//       }

//       console.log('Authentication successful, ownerId matches');
//       setIsAuthChecking(false);
//       return true;
//     } catch (error) {
//       console.error('Error in authentication check:', error);
//       setAuthError('Authentication error occurred');
//       setIsAuthChecking(false);
//       return false;
//     }
//   };




//   // Function to fetch feedback data
//   // const fetchFeedbackData = async (roundId, interviewerId) => {
//   //   if (!roundId) {
//   //     console.log('No round ID provided, skipping feedback fetch');
//   //     return;
//   //   }

//   //   try {
//   //     setFeedbackLoading(true);
//   //     setFeedbackError(null);


//   //     // Build URL with query parameters
//   //     let url = `${config.REACT_APP_API_URL}/feedback/round/${roundId}`;
//   //     if (interviewerId) {
//   //       url += `?interviewerId=${interviewerId}`;
//   //     }

//   //     console.log('🌐 Making API call to:', url);

//   //     const response = await axios.get(url, {
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         // 'Authorization': `Bearer ${Cookies.get('authToken')}`
//   //       },
//   //     });

//   //     if (response.data.success) {

//   //       setFeedbackData(response.data.data);
//   //     } else {
//   //       throw new Error(response.data.message || 'Failed to fetch feedback data');
//   //     }
//   //   } catch (error) {
//   //     console.error('❌ Error fetching feedback data:', error);
//   //     setFeedbackError(error.message);
//   //   } finally {
//   //     setFeedbackLoading(false);
//   //   }
//   // };

//   useEffect(() => {
//     // Skip if still checking authentication
//     // if (isAuthChecking) return;

//     // Parse URL parameters
//     const urlParams = new URLSearchParams(location.search);
//     const schedule = urlParams.get('scheduler');
//     const meeting = urlParams.get('meeting');
//     const round = urlParams.get('round');
//     const candidate = urlParams.get('candidate');
//     const interviewer = urlParams.get('interviewer');
//     const interviewerToken = urlParams.get('interviewertoken');
//     const schedulerToken = urlParams.get('schedulertoken');


//     // Parse schedule parameter
//     const isSchedule = schedule === 'true';
//     const isCandidate = candidate === 'true';
//     const isInterviewer = interviewer === 'true';
//     console.log('Schedule boolean:', isSchedule);
//     console.log('Is Candidate:', isCandidate);
//     console.log('Is Interviewer:', isInterviewer);

//     // Skip auth for candidate links
//     if (isCandidate) {
//       console.log('Candidate link detected, skipping pre-auth & auth');
//       setIsAuthChecking(false);
//       setPreAuthPassed(true);
//       setPreAuthLoading(false);
//       return;
//     }


//     // Decrypt meeting data
//     let decryptedMeeting = null;
//     if (meeting) {
//       try {
//         const decodedMeeting = decodeURIComponent(meeting);
//         console.log('Decoded meeting parameter:', decodedMeeting);
//         decryptedMeeting = decryptData(decodedMeeting);
//         console.log('Decrypted meeting data:', decryptedMeeting);
//       } catch (error) {
//         console.error('Error decrypting meeting data:', error);
//       }
//     }

//     // Decrypt round data
//     let decryptedRound = null;
//     if (round) {
//       try {
//         const decodedRound = decodeURIComponent(round);
//         console.log('Decoded round parameter:', decodedRound);
//         decryptedRound = decryptData(decodedRound);
//         console.log('Decrypted round data:', decryptedRound);
//       } catch (error) {
//         console.error('Error decrypting round data:', error);
//       }
//     }

//     // Decrypt round data
//     let interviewerId = null;
//     if (interviewerToken || schedulerToken) {
//       try {
//         console.log('Decoded round parameter:', schedulerToken);
//         const decodedInterviewerToken = decodeURIComponent(interviewerToken || schedulerToken);
//         console.log('Decoded round parameter:', decodedInterviewerToken);
//         interviewerId = decryptData(interviewerToken || schedulerToken);
//         console.log('Decrypted round data:', interviewerId);
//       } catch (error) {
//         console.error('Error decrypting round data:', error);
//       }
//     }

//     // interviewerToken

//     // const interviewerId = "68664845d494db82db30103c"
//     // Extract key information
//     const extractedData = {
//       schedule: isSchedule,
//       isCandidate: isCandidate,
//       isInterviewer: isInterviewer,
//       meetLink: decryptedMeeting,
//       roundData: decryptedRound,
//       interviewRoundId: decryptedRound || '',
//       interviewerId: interviewerId || "not found",
//     };

//     setDecodedData(extractedData);

//     // Set role information for RoleSelector
//     // If schedule=true, treat it as interviewer role
//     const effectiveIsInterviewer = isInterviewer || isSchedule;
//     const roleInfo = {
//       isCandidate: isCandidate,
//       isInterviewer: effectiveIsInterviewer,
//       hasRolePreference: isCandidate || effectiveIsInterviewer
//     };
//     setUrlRoleInfo(roleInfo);

//     // Auto-select candidate role if URL indicates candidate
//     if (isCandidate) {

//       setCurrentRole('candidate');
//     }

//     // ✅ Pre-Auth API Call
//     const fetchPreAuthDetails = async () => {
//       try {
//         const res = await axios.get(`${config.REACT_APP_API_URL}/feedback/contact-details`, {
//           params: {
//             contactId: extractedData.interviewerId,
//             roundId: extractedData.interviewRoundId
//           }
//         });
//         console.log("res", res);

//         const result = res.data
//         if (result) {
//           console.log('📅 Pre-auth API data:', result);


//           // Check meeting expiry
//           // if (res.data.round && res.data.round.dateTime) {
//           //   const roundDate = new Date(res.data.round.dateTime);
//           //   if (roundDate < new Date()) {
//           //     setAuthError('Meeting link has expired');
//           //     setPreAuthPassed(false);
//           //     return; // stop here, don't set preAuthPassed true
//           //   }
//           // }

//           // If not expired, pass pre-auth
//           setPreAuthPassed(true);
//           setAuthType(result?.tenant?.type)

//         } else {
//           console.error('❌ API error:', res.data.error);
//           setAuthError(res.data.error || 'Error fetching meeting details');
//         }
//       } catch (err) {
//         console.error('❌ API call failed:', err);
//         setAuthError('Failed to check meeting details');
//       } finally {
//         setPreAuthLoading(false);
//       }
//     };

//     fetchPreAuthDetails();


//     // ✅ Pre-Auth API Call
//     // const fetchPreAuthDetails = async () => {
//     //   try {
//     //     const res = await axios.get(`${config.REACT_APP_API_URL}/feedback/contact-details`, {
//     //       params: {
//     //         contactId: extractedData.interviewerId,
//     //         roundId: extractedData.interviewRoundId
//     //       }
//     //     });

//     //     if (res.data.success) {
//     //       console.log('📅 Pre-auth API data:', res.data);
//     //       setPreAuthPassed(true);
//     //     } else {
//     //       console.error('❌ API error:', res.data.error);
//     //       setAuthError(res.data.error || 'Error fetching meeting details');
//     //     }
//     //   } catch (err) {
//     //     console.error('❌ API call failed:', err);
//     //     setAuthError('Failed to check meeting details');
//     //   } finally {
//     //     setPreAuthLoading(false);
//     //   }
//     // };

//     // fetchPreAuthDetails();




//   }, [location.search]);




//   // Check authentication on component mount
//   useEffect(() => {
//     if (!preAuthLoading && preAuthPassed) {
//       // Only check authentication for schedule and interviewer links
//       const urlParams = new URLSearchParams(location.search);
//       // Fix typo - standardize to 'schedule' (was 'scheduler')
//       const schedule = urlParams.get('scheduler');
//       const interviewer = urlParams.get('interviewer');
//       const candidate = urlParams.get('candidate');

//       const isSchedule = schedule === 'true';
//       const isInterviewer = interviewer === 'true';
//       const isCandidate = candidate === 'true';




//       // Skip authentication for candidate links
//       if (isCandidate) {
//         console.log('Candidate link detected, skipping authentication');
//         setIsAuthChecking(false);
//         return;
//       }

//       // Check authentication for schedule and interviewer links
//       if (isSchedule || isInterviewer) {
//         console.log('Schedule or interviewer link detected, checking authentication');
//         checkAuthentication();
//       } else {
//         console.log('No specific role detected, skipping authentication');
//         setIsAuthChecking(false);
//       }
//     }
//   }, [preAuthLoading, preAuthPassed]);




//   const {
//     data: feedbackData,
//     isLoading: feedbackLoading,
//     error: feedbackError
//   } = useFeedbackData(
//     !isAuthChecking && preAuthPassed ? decodedData?.interviewRoundId : null,
//     !isAuthChecking && preAuthPassed ? decodedData?.interviewerId : null
//   );

//   console.log("feedbackData join call", feedbackData);

//   useEffect(() => {
//     if (!feedbackLoading && feedbackData?.feedbacks?.length) {
//       const matchedFeedbacks = feedbackData.feedbacks
//         .filter(fb =>
//           fb.interviewerId?._id?.toString() === decodedData?.interviewerId
//         )
//         .map(fb => ({
//           ...fb,
//           interviewRound: feedbackData.interviewRound,
//           candidate: feedbackData.candidate,
//           position: feedbackData.position
//         }));
//       console.log("matchedFeedbacks", matchedFeedbacks);

//       setFeedbackData(matchedFeedbacks[0]);

//       // if (matchedFeedbacks.length > 0) {
//       //   setFeedbackData(matchedFeedbacks);
//       // } else {
//       //   // No match
//       // }
//     } else {
//       console.log("feedbackData", feedbackData);

//       setFeedbackData(feedbackData);
//     }
//   }, [feedbackLoading, feedbackData, decodedData?.interviewRoundId]);

  

//   // Loading state for pre-auth
//   if (preAuthLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p>Checking meeting details...</p>
//       </div>
//     );
//   }

//   if (feedbackLoading) {
//     return <div>Loading...</div>;
//   }

//   if (feedbackError) {
//     return <div>Error loading feedback</div>;
//   }
//   // Debug useEffect to log feedback data changes
//   // useEffect(() => {
//   //   console.log('📊 Feedback Data Status:', {
//   //     loading: feedbackLoading,
//   //     error: feedbackError,
//   //     hasData: !!feedbackData,
//   //     dataKeys: feedbackData ? Object.keys(feedbackData) : []
//   //   });

//   //   if (feedbackData) {
//   //     console.log('📋 Feedback Data Details:', {
//   //       hasInterviewRound: !!feedbackData.interviewRound,
//   //       hasCandidate: !!feedbackData.candidate,
//   //       hasPosition: !!feedbackData.position,
//   //       interviewersCount: feedbackData.interviewers?.length || 0,
//   //       feedbacksCount: feedbackData.feedbacks?.length || 0
//   //     });
//   //   }
//   // }, [feedbackData, feedbackLoading, feedbackError]);

//   const handleRoleSelect = (role) => {
//     // console.log('User clicked role selection:', role);
//     setCurrentRole(role);
//   };

//   const handleBack = () => {
//     // console.log('User clicked back - returning to RoleSelector');
//     setCurrentRole(null);
//   };

//   // Show loading while checking authentication
//   if (isAuthChecking) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error if authentication failed
//   if (authError) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="text-red-600 text-xl mb-4">⚠️</div>
//           <p className="text-gray-800 mb-4">{authError}</p>
//           <button
//             onClick={() => {
//               const returnUrl = encodeURIComponent(window.location.href);
//               navigate(`/organization-login?returnUrl=${returnUrl}`);
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }
//   console.log("feedbackData", feedbackDatas);

//   // Show appropriate view based on user's button click
//   if (currentRole === 'candidate') {
//     return <CandidateView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackDatas} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />;
//   }

//   if (currentRole === 'interviewer' || currentRole === 'scheduler') {
//     return (
//       <>
//         <CombinedNavbar />
//         <InterviewerView onBack={handleBack} decodedData={decodedData} feedbackData={feedbackDatas} feedbackLoading={feedbackLoading} feedbackError={feedbackError} />
//       </>
//     );
//   }

//   // Always show RoleSelector first - user must click button to proceed
//   return <RoleSelector onRoleSelect={handleRoleSelect} roleInfo={urlRoleInfo} />;
// }

// export default JoinMeeting;



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
import AuthCookieManager from '../../utils/AuthCookieManager/AuthCookieManager';
import { useFeedbackData } from '../../apiHooks/useFeedbacks';

function JoinMeeting() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  const [feedbackDatas, setFeedbackData] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [preAuthPassed, setPreAuthPassed] = useState(false);
  const [preAuthLoading, setPreAuthLoading] = useState(true);
  const [authType, setAuthType] = useState(null);

  // Purpose: Store candidate details fetched from candidate-details API for candidate view
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState(null);


// Improved fetchCandidateDetails with retry logic and better timeout handling
const fetchCandidateDetails = async (roundId, retryCount = 0) => {
 
  
  if (!roundId) {
    console.error("❌ No roundId provided to fetchCandidateDetails");
    setCandidateError("Round ID is required");
    return;
  }

  try {
    setCandidateLoading(true);
    setCandidateError(null);
    
    const apiUrl = `${config.REACT_APP_API_URL}/feedback/candidate-details`;
  
    // Start with a shorter timeout for faster failure detection
    const timeout = retryCount === 0 ? 5000 : 10000; // 5s first try, 10s for retries
    
    const res = await axios.get(apiUrl, {
      params: { roundId },
      timeout: timeout,
      headers: {
        'Accept': 'application/json',
      }
    });
    //  console.log("decodedData?.meetLink",decodedData?.meetLink);
     

    
    if (res.data && res.data.success) {
      if (res.data.candidate) {
        console.log("✅ Setting candidate details:", res.data);
        // setCandidateDetails(res.data.candidate);
        setCandidateDetails({
          ...res.data.candidate,
          position: res.data.position,
          round: res.data.round,
          // meetingLink: decodedData?.meetLink || null, 
          // meetingLink:  decodedData?.meetLink
        });
        
      } else {
        console.warn("⚠️ API returned success but no candidate data");
        setCandidateError("Candidate data not found in response");
      }
    } else {
      const errorMessage = res.data?.message || "API returned unsuccessful response";
      console.error("❌ API returned error:", errorMessage);
      setCandidateError(errorMessage);
    }
  } catch (err) {
    console.error(`❌ Candidate API error (attempt ${retryCount + 1}):`, {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
    });
    
    // Retry logic for timeout errors
    if ((err.code === 'ECONNABORTED' || err.message.includes('timeout')) && retryCount < 2) {
      console.log(`🔄 Retrying request (attempt ${retryCount + 2}/3)...`);
      setTimeout(() => {
        fetchCandidateDetails(roundId, retryCount + 1);
      }, 1000); // Wait 1 second before retry
      return;
    }
    
    // Set appropriate error messages
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      setCandidateError("Request timeout - server is not responding. Please check if the backend server is running on port 5000.");
    } else if (err.code === 'ERR_NETWORK') {
      setCandidateError("Network error - please check CORS configuration or server status");
    } else if (err.response?.status === 404) {
      setCandidateError("Candidate not found for this round");
    } else if (err.response?.status === 500) {
      setCandidateError("Server error occurred");
    } else {
      setCandidateError(err.response?.data?.message || "Failed to fetch candidate details");
    }
  } finally {
    setCandidateLoading(false);
  }
};
  // console.log("candidateDetails", candidateDetails,"decodedData",decodedData);

  // Centralized navigation function
  const redirectToLogin = (isIndividual) => {
    const returnUrl = encodeURIComponent(window.location.href);
    const loginPath = isIndividual ? '/individual-login' : '/organization-login';
    navigate(`${loginPath}?returnUrl=${returnUrl}`);
  };

  // Authentication check function
  const checkAuthentication = () => {
    try {
      if (!AuthCookieManager.isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        redirectToLogin(authType === 'individual');
        return false;
      }

      const currentUserData = AuthCookieManager.getActiveUserData();
      if (!currentUserData) {
        console.log('Unable to get current user data, redirecting to login');
        redirectToLogin(authType === 'individual');
        return false;
      }

      const urlParams = new URLSearchParams(location.search);
      const encryptedOwnerId = urlParams.get('owner');

      if (!encryptedOwnerId) {
        console.log('No ownerId in URL parameters');
        setAuthError('Invalid meeting link: missing owner information');
        setIsAuthChecking(false);
        return false;
      }

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

      const currentUserOwnerId = currentUserData.userId || currentUserData.id;
      console.log('Current user ownerId:', currentUserOwnerId);
      console.log('URL ownerId:', decryptedOwnerId);

      if (currentUserOwnerId !== decryptedOwnerId) {
        console.log('OwnerId mismatch, redirecting to login');
        redirectToLogin(authType === 'individual');
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

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const schedule = urlParams.get('scheduler');
    const meeting = urlParams.get('meeting');
    const round = urlParams.get('round');
    const candidate = urlParams.get('candidate');
    const interviewer = urlParams.get('interviewer');
    const interviewerToken = urlParams.get('interviewertoken');
    const schedulerToken = urlParams.get('schedulertoken');

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
          decryptedRound = decryptData(decodedRound);
          console.log('Decrypted round data:', decryptedRound);
        } catch (error) {
          console.error('Error decrypting round data:', error);
        }
      }
  
      // Decrypt interviewer/scheduler token
      let interviewerId = null;
      if (interviewerToken || schedulerToken) {
        try {
          const decodedToken = decodeURIComponent(interviewerToken || schedulerToken);
          interviewerId = decryptData(decodedToken);
          console.log('Decrypted interviewer/scheduler data:', interviewerId);
        } catch (error) {
          console.error('Error decrypting token data:', error);
        }
      }

    // Skip auth for candidate links
    if (isCandidate) {
      console.log('Candidate link detected, skipping pre-auth & auth');
      setIsAuthChecking(false);
      setPreAuthPassed(true);
      setPreAuthLoading(false);
      // return;
       // Purpose: Fetch candidate data without any authentication requirements
       if (decryptedRound) {
        fetchCandidateDetails(decryptedRound);
      }
      console.log("decryptedMeeting",decryptedMeeting);
      if (decryptedMeeting) {
        setCandidateDetails(prev => prev ? { ...prev, meetingLink: decryptedMeeting } : prev);
      }

    }

  

    // Extract key information
    const extractedData = {
      schedule: isSchedule,
      isCandidate: isCandidate,
      isInterviewer: isInterviewer,
      meetLink: decryptedMeeting,
      roundData: decryptedRound,
      interviewRoundId: decryptedRound || '',
      interviewerId: interviewerId || 'not found',
    };

    setDecodedData(extractedData);
    console.log("extractedData",extractedData);

    // Set role information for RoleSelector
    const effectiveIsInterviewer = isInterviewer || isSchedule;
    const roleInfo = {
      isCandidate: false,
      isInterviewer: effectiveIsInterviewer,
      hasRolePreference: isCandidate || effectiveIsInterviewer,
    };
    setUrlRoleInfo(roleInfo);

    // Auto-select candidate role if URL indicates candidate
    if (isCandidate) {
      setCurrentRole('candidate');
    }

    // Pre-Auth API Call
    if (!isCandidate){
    const fetchPreAuthDetails = async () => {
      try {
        const res = await axios.get(`${config.REACT_APP_API_URL}/feedback/contact-details`, {
          params: {
            contactId: extractedData.interviewerId,
            roundId: extractedData.interviewRoundId,
          },
        });

        const result = res.data;
        if (result && res.status === 200) {
          console.log('📅 Pre-auth API data:', result);
          setPreAuthPassed(true);
          setAuthType(result?.tenant?.type);
        } else {
          console.error('❌ API error:', result?.error);
          setAuthError(result?.error || 'Error fetching meeting details');
          if (result?.error === 'Owner mismatch between contact and tenant') {
            redirectToLogin(result?.tenant?.type === 'individual');
          }
        }
      } catch (err) {
        console.error('❌ API call failed:', err);
        if (err.response?.status === 403 && err.response?.data?.error === 'Owner mismatch between contact and tenant') {
          redirectToLogin(authType === 'individual' || err.response?.data?.tenant?.type === 'individual');
        } else {
          setAuthError('Failed to check meeting details');
        }
      } finally {
        setPreAuthLoading(false);
      }
    };

    fetchPreAuthDetails();
  }
  }, [location.search]);

  useEffect(() => {
    if (!preAuthLoading && preAuthPassed) {
      const urlParams = new URLSearchParams(location.search);
      const schedule = urlParams.get('scheduler');
      const interviewer = urlParams.get('interviewer');
      const candidate = urlParams.get('candidate');

      const isSchedule = schedule === 'true';
      const isInterviewer = interviewer === 'true';
      const isCandidate = candidate === 'true';

      if (isCandidate) {
        console.log('Candidate link detected, skipping authentication');
        setIsAuthChecking(false);
        return;
      }

      if (isSchedule || isInterviewer) {
        console.log('Schedule or interviewer link detected, checking authentication');
        checkAuthentication();
      } else {
        console.log('No specific role detected, skipping authentication');
        setIsAuthChecking(false);
      }
    }
  }, [preAuthLoading, preAuthPassed, authType]);

  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    error: feedbackError,
  } = useFeedbackData(
    !isAuthChecking && preAuthPassed && currentRole !== 'candidate' ? decodedData?.interviewRoundId : null,
    !isAuthChecking && preAuthPassed && currentRole !== 'candidate' ? decodedData?.interviewerId : null
  );

  useEffect(() => {
    if (!feedbackLoading && feedbackData?.feedbacks?.length) {
      const matchedFeedbacks = feedbackData.feedbacks
        .filter((fb) => fb.interviewerId?._id?.toString() === decodedData?.interviewerId)
        .map((fb) => ({
          ...fb,
          interviewRound: feedbackData.interviewRound,
          candidate: feedbackData.candidate,
          position: feedbackData.position,
        }));
      console.log('matchedFeedbacks', matchedFeedbacks);
      setFeedbackData(matchedFeedbacks[0]);
    } else {
      console.log('feedbackData', feedbackData);
      setFeedbackData(feedbackData);
    }
  }, [feedbackLoading, feedbackData, decodedData?.interviewRoundId]);

  if (preAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking meeting details...</p>
      </div>
    );
  }

  if (feedbackLoading) {
    return <div>Loading...</div>;
  }

  if (feedbackError) {
    return <div>Error loading feedback</div>;
  }

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

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-4">{authError}</p>
          <button
            onClick={() => redirectToLogin(authType === 'individual')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (currentRole === 'candidate'  || urlRoleInfo?.isCandidate) {
    return (
      <CandidateView
        // onBack={() => setCurrentRole(null)}
        decodedData={decodedData}
        feedbackData={candidateDetails}
        feedbackLoading={candidateLoading}
        feedbackError={candidateError}
      />
    );
  }

  if (currentRole === 'interviewer' || currentRole === 'scheduler') {
    return (
      <>
        <CombinedNavbar />
        <InterviewerView
          onBack={() => setCurrentRole(null)}
          decodedData={decodedData}
          feedbackData={feedbackDatas}
          feedbackLoading={feedbackLoading}
          feedbackError={feedbackError}
        />
      </>
    );
  }
  if (!currentRole && urlRoleInfo?.isInterviewer) {
    return <RoleSelector onRoleSelect={setCurrentRole} roleInfo={urlRoleInfo} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Invalid meeting configuration</p>
    </div>
  );
}

export default JoinMeeting;