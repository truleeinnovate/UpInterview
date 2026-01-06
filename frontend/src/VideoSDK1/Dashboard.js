import React, { useState, useEffect, useMemo } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useLocation } from "react-router-dom";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { ToastContainer } from "react-toastify";
import { getToken } from "./api";
import "react-toastify/dist/ReactToastify.css";
import {
  decryptParam,
  extractUrlData,
  // useCandidateDetails,
  // useContactDetails,
  // useSchedulerRoundDetails,
} from "../apiHooks/useVideoCall";
// import { useInterviews } from "../apiHooks/useInterviews";
import { JoiningScreen } from "./components/screens/JoiningScreen";


import { useInterviews } from "../apiHooks/useInterviews";
// import { extractUrlData } from "../apiHooks/useVideoCall";

const Dashboard = () => {
  // Set default values
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceError, setDeviceError] = useState(null);
  // const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);
  const [customVideoStream, setCustomVideoStream] = useState(null);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [isMeetingStarted, setMeetingStarted] = useState(false);

  // const { useInterviewDetails } = useInterviews();

  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const { useInterviewDetails } = useInterviews();

  const location = useLocation();
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search]
  );

  const { data, isLoading } = useInterviewDetails(
    urlData.isCandidate ? { roundId: urlData.roundData } : {}
  );

  const [decodedData, setDecodedData] = useState(null);
  const [urlRoleInfo, setUrlRoleInfo] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  console.log("location.search", urlData);

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

console.log('urlData int he dashboard:', urlData)

  const candidateData = data?.candidateId || {};
  const positionData = data?.positionId || {};
  const interviewRoundData = data?.rounds[0] || {};

  console.log("data", data);
  console.log("candidateData1", candidateData);
  console.log("positionData1", positionData);
  console.log("interviewRoundData1", interviewRoundData);

  useEffect(() => {
    if (interviewRoundData?.meetPlatform && !meetingId) {
      console.log(
        "Setting meetingId from candidateData:",
        interviewRoundData.meetingId
      );
      setMeetingId(interviewRoundData.meetingId);
    }
  }, [interviewRoundData?.meetPlatform, interviewRoundData?.meetingId, meetingId])

  // 1. Initialize meeting - SIMPLIFIED VERSION
  useEffect(() => {
    // In your Dashboard component, update the initializeMeeting function:
    const initializeMeeting = async () => {
      try {
        // Get token from API
        const authToken = await getToken();
        setToken(authToken);

        // First, just check permissions without accessing devices
        try {
          const permissionResult = await navigator.permissions.query({
            name: "camera",
            name: "microphone",
          });

          // Set default states to false
          setWebcamOn(false);
          setMicOn(false);
        } catch (error) {
          console.warn("Permission check failed:", error);
          // Continue without media
          setWebcamOn(false);
          setMicOn(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing meeting:", error);
        setDeviceError(`Error: ${error.message}`);
      }
    };

    if (isMobile) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }

    initializeMeeting();

    return () => {
      if (customAudioStream) {
        customAudioStream.getTracks().forEach((track) => track.stop());
      }
      if (customVideoStream) {
        customVideoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMobile]);

  // 2. Extract URL data
  // const [decodedData, setDecodedData] = useState(null);

  // useEffect(() => {
  //   console.log("Extracting URL data from:", window.location.search);
  //   const urlData = extractUrlData(window.location.search);
  //   console.log("Extracted URL data:", urlData);
  //   setDecodedData(urlData);
  // }, []);

  // 3. Data hooks
  // const { data: contactData } = useContactDetails(
  //   decodedData && !decodedData.isCandidate ? decodedData.interviewerId : null,
  //   decodedData && !decodedData.isCandidate
  //     ? decodedData.interviewRoundId
  //     : null
  // );
  // const { data: schedulerData } = useSchedulerRoundDetails(
  //   decodedData?.interviewRoundId,
  //   decodedData?.isSchedule
  // );
  // const { data: candidateData } = useCandidateDetails(
  //   decodedData?.isCandidate ? decodedData.interviewRoundId : null
  // );

  // const { data, isLoading } = useInterviewDetails(
  //   decodedData.isCandidate
  //     ? { interviewRoundId: decodedData.interviewRoundId }
  //     : {}
  // );

  // const candidateData = data;

  // console.log("candidateData", candidateData);

  // 4. Set meetingId from candidateData
  // useEffect(() => {
  // if (candidateData?.round?.meetingId && !meetingId) {
  //   console.log(
  //     "Setting meetingId from candidateData:",
  //     candidateData.round.meetingId
  //   );
  //   setMeetingId(candidateData.round.meetingId);
  // }

  //   // Also check if meetingId is in URL
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const urlMeetingId = urlParams.get("meetingId");
  //   if (urlMeetingId && !meetingId) {
  //     console.log("Setting meetingId from URL:", urlMeetingId);
  //     setMeetingId(urlMeetingId);
  //   }
  // }, [candidateData, meetingId]);

  // 5. Debug logs
  // useEffect(() => {
  //   console.log("Current state:", {
  //     meetingId,
  //     token: token ? "Token available" : "No token",
  //     isInitialized,
  //     micOn,
  //     webcamOn,
  //     deviceError,
  //   });
  // }, [meetingId, token, isInitialized, micOn, webcamOn, deviceError]);

  // 6. Request permissions when user wants to enable media
  // const requestPermissions = async () => {
  //   try {
  //     setHasRequestedPermissions(true);

  //     // Request camera permission
  //     if (webcamOn) {
  //       const videoStream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       videoStream.getTracks().forEach((track) => track.stop());
  //     }

  //     // Request microphone permission
  //     if (micOn) {
  //       const audioStream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //       });
  //       audioStream.getTracks().forEach((track) => track.stop());
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error("Permission error:", error);

  //     if (error.name === "NotFoundError") {
  //       setDeviceError(
  //         "Camera or microphone not found. Please check your devices."
  //       );
  //     } else if (error.name === "NotAllowedError") {
  //       setDeviceError(
  //         "Permission denied. Please allow camera/microphone access."
  //       );
  //     } else {
  //       setDeviceError(`Device error: ${error.message}`);
  //     }

  //     // Turn off media if permission fails
  //     setWebcamOn(false);
  //     setMicOn(false);
  //     return false;
  //   }
  // };

  // 7. Join meeting function
  // const joinMeeting = async () => {
  //   if (!hasRequestedPermissions && (micOn || webcamOn)) {
  //     const hasPermission = await requestPermissions();
  //     if (!hasPermission) {
  //       return; // Don't join if permissions failed
  //     }
  //   }

  //   // Meeting will join through MeetingProvider
  // };

  // 8. Auto-join when everything is ready
  useEffect(() => {
    if (isInitialized && token && meetingId) {
      console.log("All conditions met for joining meeting");
      // The meeting will join automatically with joinOnLoad: true
      setMeetingStarted(true);
    }
  }, [isInitialized, token, meetingId]);

  return (
    <>
      {/* <div className="h-screen w-full bg-gray-100">
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
            <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
              <div className="text-red-500 text-3xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Device Issue
              </h2>
              <p className="text-gray-600 mb-4">{deviceError}</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setDeviceError(null);
                    // Join without media
                    setWebcamOn(false);
                    setMicOn(false);
                    setHasRequestedPermissions(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Join Without Camera/Mic
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        ) : isMeetingLeft ? (
          <LeaveScreen
            setIsMeetingLeft={setIsMeetingLeft}
            onJoinAgain={() => {
              setIsMeetingLeft(false);
            }}
          />
        ) : isInitialized && token && meetingId ? (
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: candidateData?.LastName || contactData?.name,
              multiStream: false,
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true} // Changed back to true for auto-join
            joinOnLoad={true}
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
              <p className="mt-4 text-gray-600">Setting up meeting room...</p>
              <p className="text-sm text-gray-500 mt-2">
                {!meetingId && "Waiting for meeting ID..."}
                {!token && "Getting authentication token..."}
                {meetingId && token && "Joining meeting..."}
              </p>
              {meetingId && (
                <p className="text-xs text-gray-400 mt-1">
                  Meeting ID: {meetingId.substring(0, 20)}...
                </p>
              )}
            </div>
          </div>
        )}
      </MeetingAppProvider>
    </div> */}

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
          {isMeetingStarted ? (
            <>
              <MeetingProvider
                config={{
                  meetingId,
                  micEnabled: false, // Start with mic off
                  webcamEnabled: false, // Start with webcam off
                  // name: candidateData?.LastName || contactData?.name,
                  name: candidateData?.LastName,
                  multiStream: true,
                  defaultAudioDevice: {
                    deviceId: "default",
                    label: "Default Audio Device",
                  },
                  defaultVideoDevice: {
                    deviceId: "default",
                    label: "Default Video Device",
                  },
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
                    setMeetingStarted(false);
                  }}
                  setIsMeetingLeft={setIsMeetingLeft}
                isCandidate={urlData?.isCandidate || false}
                isInterviewer={urlData?.isInterviewer || false}
                isSchedule={urlData?.isSchedule || false}
                candidateData={candidateData}
                positionData={positionData}
                />
              </MeetingProvider>
            </>
          ) : isMeetingLeft ? (
            <>
              <LeaveScreen
                setIsMeetingLeft={setIsMeetingLeft}
                onJoinAgain={() => {
                  setIsMeetingLeft(false);
                  setMeetingStarted(true);
                }}
              />
            </>
          ) : (
            <>
              <JoiningScreen
              // participantName={candidateData?.LastName || contactData?.name}
              // setParticipantName={setParticipantName}
              // setMeetingId={setMeetingId}
              // setToken={setToken}
              // micOn={micOn}
              // setMicOn={setMicOn}
              // webcamOn={webcamOn}
              // setWebcamOn={setWebcamOn}
              // customAudioStream={customAudioStream}
              // setCustomAudioStream={setCustomAudioStream}
              // customVideoStream={customVideoStream}
              // setCustomVideoStream={setCustomVideoStream}
              // onClickStartMeeting={() => setMeetingStarted(true)}
              // startMeeting={isMeetingStarted}
              // setIsMeetingLeft={setIsMeetingLeft}
              />
            </>
          )}
        </MeetingAppProvider>
      </div>
    </>
  );
};

export default Dashboard;
