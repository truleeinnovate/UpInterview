// JoinMeeting.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Cookies from "js-cookie";
import RoleSelector from "./RoleSelector";
import CandidateView from "./CandidateView";
import InterviewerView from "./InterviewerView";
import CombinedNavbar from "../../Components/Navbar/CombinedNavbar";
// import { decryptData } from "../../utils/PaymentCard";
// import { config } from "../../config";
import AuthCookieManager from "../../utils/AuthCookieManager/AuthCookieManager";
import { useFeedbackData } from "../../apiHooks/useFeedbacks";
import {
  decryptParam,
  extractUrlData,
  // useCandidateDetails,
  useContactDetails,
  useSchedulerRoundDetails,
} from "../../apiHooks/useVideoCall";
import { useInterviews } from "../../apiHooks/useInterviews";
import { useMockInterviewById } from "../../apiHooks/useMockInterviews";
import Loading from "../../Components/Loading";

function JoinMeeting() {
  const location = useLocation();
  const navigate = useNavigate();
  const { useInterviewDetails } = useInterviews();
  const [currentRole, setCurrentRole] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  const [feedbackDatas, setFeedbackData] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authType, setAuthType] = useState(null);

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );

  const isMockInterview = urlData?.interviewType === "mockinterview";

  useEffect(() => {
    setDecodedData(urlData);

    const effectiveIsInterviewer = urlData.isInterviewer || urlData.isSchedule;
    const roleInfo = {
      isCandidate: urlData.isCandidate,
      isInterviewer: effectiveIsInterviewer,
      hasRolePreference: urlData.isCandidate || effectiveIsInterviewer,
    };
    setUrlRoleInfo(roleInfo);

    if (urlData.isCandidate) {
      setCurrentRole("candidate");
    }
  }, [urlData]);

  // Pre-auth query
  const {
    data: contactData,
    isLoading: preAuthLoading,
    isError: preAuthError,
  } = useContactDetails({
    contactId: !urlData.isCandidate ? urlData?.interviewerId : null,
    roundId: !urlData.isCandidate ? urlData?.interviewRoundId : null,
    interviewType: urlData?.interviewType,
  });

  // Scheduler query
  const { data: schedulerData, isLoading: schedulerLoading } =
    useSchedulerRoundDetails(
      !isMockInterview && urlData.interviewRoundId,
      !isMockInterview && urlData.isSchedule,
      // urlData?.interviewType,
    );

  // Candidate query
  // const {
  //   data: candidateData,
  //   isLoading: candidateLoading,
  //   isError: candidateError,
  // } = useCandidateDetails(
  //   urlData.isCandidate ? urlData.interviewRoundId : null
  // );

  // // useInterviews

  // const data = null;
  // if (urlData?.interviewType === "mockintervieew") {
  //   const { mockInterview, isMockLoading } = useMockInterviewById(
  //     urlData.interviewRoundId,
  //   );
  // } else {
  //   const { data, isLoading } = useInterviewDetails({
  //     roundId: urlData.interviewRoundId,
  //   });
  // }

  /* -----------------------------
     INTERVIEW DATA (IMPORTANT FIX)
  ------------------------------ */

  // ✅ ALWAYS call hooks
  const {
    mockInterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId : null,
    enabled: !isMockInterview,
  });

  // const candidateData = data;
  // ✅ Select final data
  const candidateData = isMockInterview ? mockInterview : interviewData;
  const isLoading = isMockInterview ? isMockLoading : isInterviewLoading;
  const error = isMockInterview ? isMockError : interviewError;

  // Feedback query (existing)
  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    isError: feedbackError,
  } = useFeedbackData({
    roundId:
      !isAuthChecking && !urlData.isCandidate ? urlData.interviewRoundId : null,
    interviewerId:
      !isAuthChecking && !urlData.isCandidate ? urlData.interviewerId : null,
    interviewType: urlData?.interviewType,
  });

  // === 1. Better handling of contactData (including API-level errors) ===
  useEffect(() => {
    if (preAuthError) {
      setAuthError("Failed to validate meeting access");
      setIsAuthChecking(false);
      return;
    }

    if (contactData) {
      // If backend returns { error: "..." } inside data
      if (contactData.error) {
        setAuthError(contactData.error);

        if (contactData.error.includes("Owner mismatch")) {
          redirectToLogin(contactData.tenant?.type === "individual");
        } else {
          setIsAuthChecking(false);
        }
        return;
      }

      // Success case - valid contact
      setAuthType(contactData.tenant?.type || "organization");
      // Do NOT set isAuthChecking false here - wait for actual auth check
    }
  }, [contactData, preAuthError]);

  // === 2. Trigger authentication ONLY after pre-auth succeeds ===
  useEffect(() => {
    if (urlData.isCandidate) {
      setIsAuthChecking(false);
      return;
    }

    // Only run check when we have both contactData AND authType
    if (
      !preAuthLoading &&
      !preAuthError &&
      contactData &&
      !contactData.error &&
      authType !== null
    ) {
      const authenticated = checkAuthentication();
      if (authenticated) {
        setIsAuthChecking(false);
      }
    }
  }, [preAuthLoading, preAuthError, contactData, authType, urlData]);

  useEffect(() => {
    if (!feedbackLoading && feedbackData) {
      if (feedbackData.feedbacks?.length) {
        const matched = feedbackData.feedbacks
          .filter(
            (fb) => fb.interviewerId?._id?.toString() === urlData.interviewerId,
          )
          .map((fb) => ({
            ...fb,
            interviewRound: feedbackData.interviewRound,
            candidate: feedbackData.candidate,
            position: feedbackData.position,
          }));
        setFeedbackData(matched[0] || null);
      } else {
        setFeedbackData(feedbackData);
      }
    }
  }, [feedbackLoading, feedbackData, urlData.interviewerId]);

  useEffect(() => {
    if (candidateData && urlData.meetLink) {
      candidateData.meetingLink = urlData.meetLink;
    }
  }, [candidateData, urlData.meetLink]);

  const redirectToLogin = (isIndividual) => {
    const returnUrl = encodeURIComponent(window.location.href);
    const loginPath = isIndividual
      ? "/individual-login"
      : "/organization-login";
    navigate(`${loginPath}?returnUrl=${returnUrl}`);
  };

  const checkAuthentication = () => {
    try {
      if (!AuthCookieManager.isAuthenticated()) {
        redirectToLogin(authType === "individual");
        return false;
      }

      const currentUserData = AuthCookieManager.getActiveUserData();
      if (!currentUserData) {
        redirectToLogin(authType === "individual");
        return false;
      }
      //taking owner id from params
      const params = new URLSearchParams(location.search);
      const encryptedOwnerId = params.get("owner");

      if (!encryptedOwnerId) {
        setAuthError("Invalid meeting link: missing owner information");
        setIsAuthChecking(false);
        return false;
      }

      const decryptedOwnerId = decryptParam(encryptedOwnerId);
      if (!decryptedOwnerId) {
        setAuthError(
          "Invalid meeting link: unable to decrypt owner information",
        );
        setIsAuthChecking(false);
        return false;
      }

      const currentUserOwnerId = currentUserData.userId || currentUserData.id;
      if (currentUserOwnerId !== decryptedOwnerId) {
        redirectToLogin(authType === "individual");
        return false;
      }

      setIsAuthChecking(false);
      return true;
    } catch (error) {
      setAuthError("Authentication error occurred");
      setIsAuthChecking(false);
      return false;
    }
  };

  const isAnyLoading =
    preAuthLoading ||
    isAuthChecking ||
    isLoading ||
    feedbackLoading ||
    schedulerLoading;
  const anyError = authError || feedbackError || preAuthError;

  if (isAnyLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loading />
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-4">
            {authError || "An error occurred"}
          </p>
          <button
            onClick={() => redirectToLogin(authType === "individual")}
            className="bg-custom-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // candidate view page  path
  if (urlRoleInfo?.isCandidate) {
    return <CandidateView />;
  }

  // interviewer view page path
  if (!currentRole && urlRoleInfo?.isInterviewer) {
    return (
      <RoleSelector
        onRoleSelect={setCurrentRole}
        roleInfo={urlRoleInfo}
      // feedbackData={feedbackDatas}
      />
    );
  }

  if (
    urlRoleInfo?.isInterviewer ||
    currentRole === "interviewer" ||
    currentRole === "scheduler"
  ) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <CombinedNavbar />
        <InterviewerView
          onBack={() => setCurrentRole(null)}
          decodedData={decodedData}
          feedbackData={feedbackDatas}
          feedbackLoading={feedbackLoading}
          feedbackError={feedbackError ? "Failed to fetch feedback" : null}
          isScheduler={currentRole === "scheduler"}
          schedulerFeedbackData={schedulerData}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Invalid meeting configuration</p>
    </div>
  );
}


export default JoinMeeting;