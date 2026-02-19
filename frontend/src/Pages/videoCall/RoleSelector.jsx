// v1.0.0 - Ashok - Improved responsiveness

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Users,
  MessageSquare,
  Video,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";
// import { useMediaDevice } from "@videosdk.live/react-sdk";
import { useInterviews } from "../../apiHooks/useInterviews";
import { extractUrlData } from "../../apiHooks/useVideoCall";
import { useLocation } from "react-router-dom";
import {
  useMockInterviewById,
  useUpdateRoundStatus,
} from "../../apiHooks/useMockInterviews";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const RoleSelector = ({ onRoleSelect, roleInfo, feedbackData }) => {
  // Determine which sections to show based on roleInfo
  // const showCandidateSection = !roleInfo?.hasRolePreference || roleInfo?.isCandidate;
  // const showInterviewerSection = !roleInfo?.hasRolePreference || roleInfo?.isInterviewer;
  // const isSingleRole = roleInfo?.hasRolePreference && (roleInfo?.isCandidate || roleInfo?.isInterviewer);
  const { updateRoundStatus, useInterviewDetails } = useInterviews();

  const location = useLocation();

  // console.log("round",round);
  // const { addOrUpdateMockInterview } = useMockInterviews();
  const updateMockRoundStatus = useUpdateRoundStatus();

  // const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [localInterviewTime, setLocalInterviewTime] = useState("");
  const [localEndTime, setLocalEndTime] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  // const [videoTrack, setVideoTrack] = useState(null);
  // const [audioTrack, setAudioTrack] = useState(null);
  const videoPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const micStreamRef = useRef();
  // Get media devices
  // const { getCameras, getMicrophones, getPlaybackDevices } = useMediaDevice();

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );
  const isMockInterview = urlData?.interviewType === "mockinterview";
  // console.log("isMockInterview", isMockInterview);
  // const { data, isLoading } = useInterviewDetails({
  //   roundId: urlData.interviewRoundId,
  // });

  // ✅ ALWAYS call hooks
  const {
    mockInterview: mockinterview,
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

  const interviewRoundData =
    interviewData?.rounds[0] || mockinterview?.rounds[0] || {};

  // console.log("interviewRoundData", interviewRoundData);

  console.log("interviewRoundData:", interviewRoundData);

  const currentStatus = interviewRoundData?.status;

  // Statuses that allow joining the interview
  const isFinalStatus = ["InProgress", "Scheduled", "Rescheduled"].includes(
    currentStatus,
  );

  // Statuses that should disable the button completely
  // const disabledStatuses = ["Draft", "Completed", "Evaluated", "FeedbackSubmitted"];
  // const isStatusDisabled = disabledStatuses.includes(currentStatus);

  // Function to update interview status to "in-progress"
  const updateInterviewStatus = async (role) => {
    try {
      // console.log("Updating status...", role);
      setIsUpdatingStatus(true);
      const normalizedRole = capitalizeFirstLetter(role) || "";

      const payload = {
        roundId: interviewRoundData?._id,
        interviewId: interviewRoundData?.interviewId,
        action: interviewRoundData?.status,
        role: capitalizeFirstLetter(role),
        userId: urlData?.interviewerId,
        History_Type: "Histoy_Handling",
        joined:
          (normalizedRole === "Interviewer" && true) ||
          (normalizedRole === "Scheduler" && true),
      };
      console.log("payload", payload)

      let response;

      if (urlData?.interviewType === "mockinterview") {
        // Fallback for mockInterviewId if mockinterview object is not fully loaded
        const mockId =
          mockinterview?._id ||
          (typeof interviewRoundData?.mockInterviewId === "object"
            ? interviewRoundData?.mockInterviewId?._id
            : interviewRoundData?.mockInterviewId);

        console.log("Resolving mockId for status update:", {
          fromMockObj: mockinterview?._id,
          fromRoundDate: interviewRoundData?.mockInterviewId,
          resolved: mockId,
        });

        if (!mockId) {
          console.error("Missing mockInterviewId for status update!");
          // toast.error("Unable to start interview: Missing ID");
          return;
        }

        response = await updateMockRoundStatus.mutateAsync({
          mockInterviewId: mockId,
          roundId: interviewRoundData?._id,
          payload,
        });
      } else {
        response = await updateRoundStatus(payload);
      }

      console.log("response", response);
      return response;

      // console.log("Status update response:", response);

      // toast.success("Interview marked as in progress", {});
    } catch (error) {
      console.error("Error updating status:", error);
      // toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle role selection
  const handleRoleSelect = async (role) => {
    // if (role === "interviewer") {
    try {
      // Wait for the API call to succeed
      let response = await updateInterviewStatus(role);
      console.log(
        "API response from status update: handleRoleSelect",
        response,
      );

      if (response?.success === true) {
        if (interviewRoundData?.meetPlatform === "platform") {
          const currentUrl = new URL(window.location.href);

          // change only the path
          currentUrl.pathname = "/video-call";

          window.open(currentUrl.toString(), "_blank");
        } else {
          // Only proceed if API call was successful
          onRoleSelect(role);
        }
      }
    } catch (error) {
      // Handle the error - don't call onRoleSelect
      console.error("Failed to update interview status:", error);
      // You could show a toast message here
      // toast.error("Failed to start interview. Please try again.");
    }
  };

  // Parse custom datetime format "DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM"
  // Parse custom datetime format "DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM"
  const parseCustomDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { start: null, end: null };

    try {
      // Split into start and end parts
      const [startPart, endPart] = dateTimeStr.split(" - ");

      // Parse the date part (DD-MM-YYYY)
      const [datePart, startTime, startPeriod] = startPart.split(/\s+/);
      const [day, month, year] = datePart.split("-").map(Number);

      // Parse start time
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      let startHours24 = startHours;
      if (startPeriod === "PM" && startHours < 12) startHours24 += 12;
      if (startPeriod === "AM" && startHours === 12) startHours24 = 0;

      // Parse end time (handle both "HH:MM" and "HH:MM AM/PM" formats)
      let endHours, endMinutes, endPeriod;

      if (endPart.includes("AM") || endPart.includes("PM")) {
        // Format: "09:04 PM"
        const [endTime, period] = endPart.split(/\s+/);
        [endHours, endMinutes] = endTime.split(":").map(Number);
        endPeriod = period;
      } else {
        // Format: "09:04" (assuming same period as start)
        [endHours, endMinutes] = endPart.split(":").map(Number);
        endPeriod = startPeriod;
      }

      let endHours24 = endHours;
      if (endPeriod === "PM" && endHours < 12) endHours24 += 12;
      if (endPeriod === "AM" && endHours === 12) endHours24 = 0;

      return {
        start: new Date(year, month - 1, day, startHours24, startMinutes),
        end: new Date(year, month - 1, day, endHours24, endMinutes),
      };
    } catch (error) {
      console.error("Error parsing date time:", error, dateTimeStr);
      return { start: null, end: null };
    }
  };
  // Add this state for join button
  const [isJoinButtonEnabled, setIsJoinButtonEnabled] = useState(false);

  // Add this new state for edit button
  const [isEditButtonDisabled, setIsEditButtonDisabled] = useState(false);

  // Add this function to calculate extended end time (+10 minutes)
  const getExtendedEndTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;

    const { end: originalEnd } = parseCustomDateTime(dateTimeStr);
    if (!originalEnd) return null;

    const extendedEnd = new Date(originalEnd);
    extendedEnd.setMinutes(extendedEnd.getMinutes() + 10);
    return extendedEnd;
  };

  // Update the useEffect
  useEffect(() => {
    if (!interviewRoundData?.dateTime) return;

    // Parse original start and end times
    const { start: interviewStart, end: originalEnd } = parseCustomDateTime(
      interviewRoundData?.dateTime,
    );

    // Get extended end time (+10 minutes) for join button cutoff
    const extendedEndTime = getExtendedEndTime(interviewRoundData?.dateTime);

    if (!interviewStart || !originalEnd || !extendedEndTime) return;

    // Format times for display
    const formatTime = (date) => {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    setLocalInterviewTime(formatTime(interviewStart));
    setLocalEndTime(formatTime(originalEnd));

    // Update button states
    const updateButtonStates = () => {
      const now = new Date();
      const startTime = interviewStart.getTime();
      const extendedEndTimeValue = extendedEndTime.getTime(); // Original end + 10 minutes
      const currentTime = now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      // Enable join button from 15 minutes before start until extended end time (+10 minutes)
      const shouldEnableJoin =
        currentTime >= startTime - fifteenMinutes &&
        currentTime <= extendedEndTimeValue;

      setIsJoinButtonEnabled(shouldEnableJoin);

      // Disable edit button after extended end time (+10 minutes)
      setIsEditButtonDisabled(currentTime > extendedEndTimeValue);

      // Update time left message
      if (currentTime < startTime) {
        const diff = startTime - currentTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diff <= fifteenMinutes) {
          setTimeLeft(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`Scheduled for ${formatTime(interviewStart)}`);
        }
      } else if (currentTime <= extendedEndTimeValue) {
        setTimeLeft("Interview in progress");
      } else {
        setTimeLeft("Interview completed");
      }
    };

    updateButtonStates();
    const interval = setInterval(updateButtonStates, 60000);

    return () => clearInterval(interval);
  }, [interviewRoundData?.dateTime]);

  // Remove these as they're not needed:
  // - addTenMinutesToEndTime function
  // - modifiedDateTime variable
  // - isEditButtonDisabled state (already added above)

  const showCandidateSection =
    !roleInfo?.hasRolePreference || roleInfo?.isCandidate;
  const showInterviewerSection =
    !roleInfo?.hasRolePreference || roleInfo?.isInterviewer;
  const isSingleRole =
    roleInfo?.hasRolePreference &&
    (roleInfo?.isCandidate || roleInfo?.isInterviewer);

  // Toggle microphone
  const toggleMic = async () => {
    try {
      if (!audioTrackRef.current) {
        // If we don't have an audio track yet, create one and turn it on
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTrackRef.current = audioTracks[0];
          // Start with the mic on
          audioTrackRef.current.enabled = true;
          setMicOn(true);

          // Store the stream to clean it up later
          micStreamRef.current = stream;
        }
      } else {
        // Toggle the existing audio track
        audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
        setMicOn((prev) => !prev);
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMicOn(false);
    }
  };

  // Toggle webcam
  const toggleWebcam = async () => {
    if (!videoTrackRef.current && !webcamOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTrackRef.current = videoTracks[0];
          if (videoPlayerRef.current) {
            videoPlayerRef.current.srcObject = new MediaStream([
              videoTracks[0],
            ]);
          }
          setWebcamOn(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    } else if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setWebcamOn((prev) => !prev);
    }
  };

  // Initialize video preview
  useEffect(() => {
    if (interviewRoundData?.meetPlatform !== "platform") return;

    let stream = null;

    const initVideoPreview = async () => {
      try {
        if (webcamOn) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          // Get video track
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0) {
            videoTrackRef.current = videoTracks[0];
            if (videoPlayerRef.current) {
              videoPlayerRef.current.srcObject = new MediaStream([
                videoTracks[0],
              ]);
            }
          }

          // Get audio track
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioTrackRef.current = audioTracks[0];
            audioTrackRef.current.enabled = micOn;
          }
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initVideoPreview();

    // Cleanup function
    return () => {
      // Store refs in variables to avoid issues with the cleanup running after component unmount
      const videoPlayer = videoPlayerRef.current;
      const currentVideoTrack = videoTrackRef.current;
      const currentAudioTrack = audioTrackRef.current;
      const currentMicStream = micStreamRef.current;

      // Stop all tracks from the main stream if it exists
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Stop tracks from video player if it exists
      if (videoPlayer?.srcObject) {
        videoPlayer.srcObject.getTracks().forEach((track) => track.stop());
        videoPlayer.srcObject = null;
      }

      // Stop microphone stream if it exists
      if (currentMicStream) {
        currentMicStream.getTracks().forEach((track) => track.stop());
      }

      // Stop individual tracks if they exist
      if (currentVideoTrack) {
        currentVideoTrack.stop();
      }
      if (currentAudioTrack) {
        currentAudioTrack.stop();
      }

      // Clear refs
      videoTrackRef.current = null;
      audioTrackRef.current = null;
      micStreamRef.current = null;
    };
  }, [webcamOn, micOn, interviewRoundData?.meetPlatform]);

  return (
    <div className="bg-gradient-to-br from-[#217989] to-[#1a616e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl py-8 sm:px-4 md:px-4 px-8 w-full max-w-8xl">
        <div className="text-center mb-6">
          {/* {console.log(
            "interviewRoundData?.meetPlatform near video preview ",
            interviewRoundData?.meetPlatform,
          )} */}
          {interviewRoundData?.meetPlatform === "platform" ? (
            <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden mb-8 max-w-2xl mx-auto">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoPlayerRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!webcamOn && (
                    <div className="text-white text-lg bg-black bg-opacity-50 p-4 rounded-full">
                      Camera is off
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    onClick={toggleMic}
                    className={`p-3 rounded-full ${micOn ? "bg-white text-gray-800" : "bg-red-600 text-white"
                      }`}
                    aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                  >
                    {micOn ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <MicOff className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={toggleWebcam}
                    className={`p-3 rounded-full ${webcamOn
                      ? "bg-white text-gray-800"
                      : "bg-red-600 text-white"
                      }`}
                    aria-label={webcamOn ? "Turn off camera" : "Turn on camera"}
                  >
                    {webcamOn ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <VideoOff className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sm:w-14 sm:h-14 md:w-14 md:h-14 w-16 h-16 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="sm:w-6 sm:h-6 md:w-6 md:h-6 w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="sm:text-lg md:text-lg lg:text-lg xl:text-2xl 2xl:text-2xl font-bold text-gray-800">
            Interview Portal
          </h1>
          {interviewRoundData?.dateTime && (
            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                {/* Calendar Icon */}
                <div className="bg-[#217989] bg-opacity-10 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#217989]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Clock Icon */}
                <div className="bg-[#217989] bg-opacity-10 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[#217989]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Main Time Display */}
              <div className="text-center">
                {/* Date */}
                <div className="sm:text-sm md:text-sm text-gray-600 font-medium mt-1">
                  {new Date(
                    interviewRoundData?.dateTime
                      .split(" ")[0]
                      .split("-")
                      .reverse()
                      .join("-"),
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <div className="sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl font-bold text-[#217989]">
                  {localInterviewTime}
                  {/* - {localEndTime} */}
                </div>

                {/* Countdown Timer */}
                {/* {timeLeft && (
        <div className={`mt-3 px-4 py-2 rounded-full inline-flex items-center ${
          timeLeft.includes('Starts in') 
            ? 'bg-blue-100 text-blue-800' 
            : timeLeft.includes('Interview in progress') 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {timeLeft.includes('Starts in') && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1 animate-pulse" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
              />
            </svg>
          )}
          <span className="text-sm font-semibold">{timeLeft}</span>
        </div>
      )} */}
              </div>
            </div>
          )}

          {/* {feedbackData?.interviewRound?.dateTime && (
            <div className="mt-2 text-lg font-semibold text-[#217989]">
              {feedbackData?.interviewRound?.dateTime}
            </div>
          )} */}
          <p className="text-gray-600 mt-2">
            {isSingleRole
              ? roleInfo?.isCandidate
                ? "Welcome Candidate!"
                : "Welcome Interviewer!"
              : "Select your role to continue"}
          </p>
        </div>

        <div
          className={`grid gap-8 mb-8 ${isSingleRole
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
            }`}
        >
          {/* Interviewer Instructions */}
          {showInterviewerSection && (
            <div className="bg-gray-50 rounded-xl sm:p-4 md:p-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#217989]" />
                <h3 className="text-lg font-semibold text-gray-800">
                  For Interviewers
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600 mb-6 w-full">
                <div className="flex items-start gap-2 w-full">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </span>
                  <p>Review candidate details and resume before starting</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </span>
                  <p>Prepare interview questions based on the role</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </span>
                  <p>Use the feedback form to document your assessment</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </span>
                  <p>Rate candidate skills and provide detailed comments</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    5
                  </span>
                  <p>Submit feedback immediately after the interview</p>
                </div>
              </div>

              <button
                onClick={() => {
                  handleRoleSelect(
                    urlData?.isInterviewer ? "interviewer" : "scheduler",
                  );
                  // }
                }}
                //  className={`w-full sm:text-sm md:text-sm ${
                // isButtonEnabled && isFinalStatus
                // isStatusDisabled ||
                disabled={
                  !isJoinButtonEnabled ||
                  !isFinalStatus}
                className={`w-full sm:text-sm md:text-sm ${
                  // !isStatusDisabled&& 
                  isJoinButtonEnabled && isFinalStatus
                    ? "bg-custom-blue hover:bg-custom-blue/90"
                    : "bg-gray-400 cursor-not-allowed"
                  } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3`}
              >
                <Users className="w-5 h-5" />
                {/* Join as Interviewer */}
                {/* {isButtonEnabled && isFinalStatus */}
                {
                  // isStatusDisabled
                  // ? `Interview ${currentStatus}`
                  isJoinButtonEnabled && isFinalStatus
                    ? roleInfo?.isInterviewer
                      ? "Start Interview"
                      : "Join as Interviewer"
                    :
                    "Join (Available 15 mins before)"}
              </button>

              {/* <button
                onClick={() => onRoleSelect('interviewer')}
                // className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
                disabled={!isButtonEnabled}
                className={`w-full ${
                  isButtonEnabled 
                    ? 'bg-[#217989] hover:bg-[#1a616e] hover:scale-105' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3`}
              >
                <Users className="w-5 h-5" />
                {isButtonEnabled 
                  ? (roleInfo?.isInterviewer ? 'Start Interview' : 'Join as Interviewer')
                  : 'Join (Available 15 mins before)'}
              
              </button> */}
            </div>
          )}
        </div>
        {/* {roleInfo?.isInterviewer ? 'Start Interview' : 'Join as Interviewer'} */}

        {/* General Interview Guidelines */}
        <div className="bg-blue-50 rounded-xl sm:p-4 md:p-4 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#217989]" />
            General Interview Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Technical Requirements
              </h4>
              <ul className="space-y-1">
                <li>• Stable internet connection required</li>
                <li>• Chrome or Firefox browser recommended</li>
                <li>• Enable camera and microphone permissions</li>
                <li>• Close unnecessary applications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Interview Etiquette
              </h4>
              <ul className="space-y-1">
                <li>• Maintain professional appearance</li>
                <li>• Speak clearly and at moderate pace</li>
                <li>• Ask questions if something is unclear</li>
                <li>• Be respectful and courteous</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
