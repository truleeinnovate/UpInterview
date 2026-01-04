import React, { useState, useEffect } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { ToastContainer } from "react-toastify";
import { getToken } from "./api";
import "react-toastify/dist/ReactToastify.css";
import {
  decryptParam,
  extractUrlData,
  useCandidateDetails,
  useContactDetails,
  useSchedulerRoundDetails,
} from "../apiHooks/useVideoCall";

const MeetingApp = () => {
  // Get meeting ID from URL or use a default one
  const urlParams = new URLSearchParams(window.location.search);
  const meetLink = urlParams.get('meetLink');
  const meetingData = urlParams.get('meetingData');

  // Parse meeting data if available
  const parsedMeetingData = meetingData ? JSON.parse(decodeURIComponent(meetingData)) : null;

  // Set default values
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState(meetLink || parsedMeetingData?.meetLink || "");
  const [micOn, setMicOn] = useState(false); // Start with mic off to avoid permission errors
  const [webcamOn, setWebcamOn] = useState(false); // Start with webcam off to avoid permission errors
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceError, setDeviceError] = useState(null);

  const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Get token from API
        const authToken = await getToken();
        setToken(authToken);

        // If no meeting ID is provided, create a new meeting
        if (!meetingId) {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/create-meeting`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ token: authToken })
          });
          const data = await response.json();
          if (data.roomId) {
            setMeetingId(data.roomId);
          }
        }

        // Request device permissions
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          // If we get here, permissions were granted
          setMicOn(true);
          setWebcamOn(true);
        } catch (err) {
          console.warn('Could not access media devices:', err);
          setDeviceError('Could not access camera or microphone. Please check your device settings.');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing meeting:', error);
        setDeviceError('Error initializing meeting. Please try again.');
      }
    };

    if (isMobile) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }

    initializeMeeting();

    // Cleanup function
    return () => {
      if (customAudioStream) {
        customAudioStream.getTracks().forEach(track => track.stop());
      }
      if (customVideoStream) {
        customVideoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMobile, meetingId]);

  // usevideocall page fetching aprt ==============================================
  // Add these state variables at the top of your component with other state declarations
  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  console.log("Initial state:", {
    decodedData,
    urlRoleInfo,
    token,
    meetingId,
    micOn,
    webcamOn
  });
  // 2. Update the useEffect that extracts URL data
  useEffect(() => {
    console.log("Extracting URL data from:", window.location.search);
    const urlData = extractUrlData(window.location.search);
    console.log("Extracted URL data:", urlData);
    setDecodedData(urlData);
    const effectiveIsInterviewer = urlData.isInterviewer || urlData.isSchedule;
    const roleInfo = {
      isCandidate: urlData.isCandidate,
      isInterviewer: effectiveIsInterviewer,
      hasRolePreference: urlData.isCandidate || effectiveIsInterviewer,
    };
    console.log("Role information:", roleInfo);
    setUrlRoleInfo(roleInfo);
  }, []);
  // 3. Add these hooks with logging
  const { data: contactData, isLoading: preAuthLoading } = useContactDetails(
    decodedData && !decodedData.isCandidate ? decodedData.interviewerId : null,
    decodedData && !decodedData.isCandidate ? decodedData.interviewRoundId : null
  );
  const { data: schedulerData } = useSchedulerRoundDetails(
    decodedData?.interviewRoundId,
    decodedData?.isSchedule
  );
  const { data: candidateData } = useCandidateDetails(
    decodedData?.isCandidate ? decodedData.interviewRoundId : null
  );
  // 4. Add a new useEffect to log when data changes
  useEffect(() => {
    console.log("Contact Data:", contactData);
  }, [contactData]);
  useEffect(() => {
    console.log("Scheduler Data:", schedulerData);
  }, [schedulerData]);
  useEffect(() => {
    console.log("Candidate Data:", candidateData);
  }, [candidateData]);
  // 5. Add a log before the MeetingProvider to see all data before rendering
  console.log("Rendering MeetingProvider with:", {
    meetingId,
    micOn,
    webcamOn,
    participantName: candidateData?.LastName || contactData?.name,
    isInitialized,
    token,
    decodedData,
    urlRoleInfo
  });
  // usevideocall page fetching aprt ==============================================

  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const panel = urlParams.get('panel');
  if (panel) {
    // Optionally set the active panel based on URL
    // setActivePanel(panel);
  }
}, []);

  return (
    <div className="h-screen w-full bg-gray-100">
      <ToastContainer
        toastClassName={(context) =>
          `${context?.defaultClassName} relative flex py-4 px-3 rounded overflow-hidden cursor-pointer bg-white shadow-lg`
        }
        bodyClassName={(context) =>
          `${context?.defaultClassName} text-[#000] text-base font-bold`
        }
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={false}
        closeButton={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <MeetingAppProvider>
        {deviceError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="text-red-500 text-2xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Device Error</h2>
              <p className="text-gray-600 mb-4">{deviceError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isMeetingLeft ? (
          <LeaveScreen
            setIsMeetingLeft={setIsMeetingLeft}
            onJoinAgain={() => {
              setIsMeetingLeft(false);
              setWebcamOn(true);
              setMicOn(true);
            }}
          />
        ) : isInitialized && token && meetingId ? (
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: candidateData?.LastName || contactData?.name,
              multiStream: false, // Changed from true to false to avoid duplicate streams
              customCameraVideoTrack: customVideoStream,
              customMicrophoneAudioTrack: customAudioStream,
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
            <MeetingContainer
              onMeetingLeave={() => {
                setToken("");
                setMeetingId("");
                setWebcamOn(false);
                setMicOn(false);
                setIsMeetingLeft(true);
              }}
              setIsMeetingLeft={setIsMeetingLeft}
              isCandidate={decodedData?.isCandidate || false}
              isInterviewer={decodedData?.isInterviewer || false}
              isSchedule={decodedData?.isSchedule || false}
              data={candidateData || schedulerData}
            />
          </MeetingProvider>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Initializing meeting room...</p>
            </div>
          </div>
        )}
      </MeetingAppProvider>
    </div>
  );
};

export default MeetingApp;
