// MeetingContainer.js (Updated PiP strip: Horizontal top strip during presentation)
import React, { useState, useEffect, useRef, createRef, memo } from "react";
import {
  Constants,
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import { ChatPanel } from "../components/sidebar/ChatPanel";
import { ParticipantPanel } from "../components/sidebar/ParticipantPanel";
import { ExternalLink } from "lucide-react";
import { ParticipantView } from "../components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import CandidateDetails from "../../Pages/videoCall/CandidateDetails";
import FeedbackForm from "../../Pages/videoCall/FeedbackForm";
import InterviewActions from "../../Pages/videoCall/InterviewActions";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import {
  MessageSquare,
  Users,
  User,
  ClipboardList,
  ClipboardCheck,
  BookOpen,
  X,
} from "lucide-react";
import { openPanelInNewTab } from "../utils/openInNewTab";
import QuestionBank from "../../Pages/Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank";
import InterviewsMiniTabComponent from "../../Pages/Dashboard-Part/Tabs/Feedback/MiniTabs/Interviews";

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
  isCandidate = false,
  isInterviewer = false,
  isSchedule = false,
  candidateData,
  positionData,
}) {
  const { setSelectedMic, setSelectedWebcam, setSelectedSpeaker } =
    useMeetingAppContext();

  // console.log("candidateData MeetingContainer", candidateData);

  const [uniqueParticipants, setUniqueParticipants] = useState(new Set());

  const ParticipantMicStream = memo(({ participantId }) => {
    // Individual hook for each participant
    const { micStream, isLocal } = useParticipant(participantId);

    useEffect(() => {
      if (micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        const audioElement = new Audio();
        audioElement.srcObject = mediaStream;
        audioElement.muted = isLocal;
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    }, [micStream, participantId, isLocal]);

    return null;
  });

  const { useRaisedHandParticipants } = useMeetingAppContext();
  const bottomBarHeight = 60;

  // State for active sidebar item
  const [activeItem, setActiveItem] = useState(null);
  const { localScreenShareOn, toggleScreenShare, sideBarMode, setSideBarMode } =
    useMeetingAppContext();
  const { participants } = useMeeting();

  // Function to get sidebar width based on mode
  const getSidebarWidth = (mode) => {
    switch (mode) {
      case "CANDIDATE":
      case "FEEDBACK":
      case "INTERVIEWACTIONS":
      case "QUESTIONBANK":
        return "50%";
      case "CHAT":
      case "PARTICIPANTS":
        return "25%";
      default:
        return "25%";
    }
  };

  // Get the current sidebar width
  const sidebarWidth = sideBarMode ? getSidebarWidth(sideBarMode) : "0";
  const mainContentPadding = sideBarMode ? `pr-[${sidebarWidth}]` : "";

  // Handle sidebar item click
  const handleSidebarItemClick = (id) => {
    const upperId = id.toUpperCase();
    setSideBarMode((prevMode) => (prevMode === upperId ? null : upperId));
  };

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
      ? 360
      : isTab
        ? 320
        : isMobile
          ? 280
          : 240;

  useEffect(() => {
    containerRef.current?.offsetHeight &&
      setContainerHeight(containerRef.current.offsetHeight);
    containerRef.current?.offsetWidth &&
      setContainerWidth(containerRef.current.offsetWidth);

    window.addEventListener("resize", ({ target }) => {
      containerRef.current?.offsetHeight &&
        setContainerHeight(containerRef.current.offsetHeight);
      containerRef.current?.offsetWidth &&
        setContainerWidth(containerRef.current.offsetWidth);
    });
  }, [containerRef]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      // Recording status change handled silently
    }
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
  }

  function onEntryResponded(participantId, name) {
    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (name === "allowed") {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          _handleMeetingLeft();
        }, 3000);
      }
    }
  }

  function onMeetingJoined() {
    // console.log("onMeetingJoined");
  }

  function onMeetingLeft() {
    setSelectedMic({ id: null, label: null });
    setSelectedWebcam({ id: null, label: null });
    setSelectedSpeaker({ id: null, label: null });
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? "https://static.videosdk.live/prebuilt/notification_critical_err.mp3"
        : "https://static.videosdk.live/prebuilt/notification_err.mp3",
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  const mMeeting = useMeeting({
    // Enable screen sharing with audio
    enableScreenShare: true,
    // Allow screen share audio capture
    captureScreenShare: true,
    // Set preferred codec for better compatibility
    preferredCodec: "h264",
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined,
    onMeetingStateChanged: ({ state }) => {
      // Meeting state change handled silently
    },
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  // Update participants list when participants change
  useEffect(() => {
    const participantIds = Array.from(participants.keys());

    // Only update if there's an actual change in participants
    const currentParticipants = new Set(participantIds);
    if (
      currentParticipants.size !== uniqueParticipants.size ||
      !Array.from(currentParticipants).every((id) => uniqueParticipants.has(id))
    ) {
      setUniqueParticipants(currentParticipants);
    }
  }, [participants, uniqueParticipants]);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      // Hand raise notification handled silently

      participantRaisedHand(senderId);
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;
      const { senderId } = data;
      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          "https://static.videosdk.live/prebuilt/notification.mp3",
        ).play();
      }
    },
  });

  // Navigation items configuration
  const getNavigationItems = () => {
    return [
      {
        id: "chat",
        label: "Chat",
        tooltip: "Chat",
        icon: <MessageSquare className="w-4 h-4" />,
        show: true,
      },
      {
        id: "participants",
        label: "Participants",
        tooltip: "Participants",
        icon: <Users className="w-4 h-4" />,
        show: true,
      },
      {
        id: "candidate",
        label: "Candidate Details",
        tooltip: "Candidate Details",
        icon: <User className="w-4 h-4" />,
        show: isInterviewer || isSchedule,
        // show: isCandidate || isInterviewer || isSchedule,
      },
      {
        id: "feedback",
        label: "Feedback Form",
        tooltip: "Feedback Form",
        icon: <ClipboardList className="w-4 h-4" />,
        show: isInterviewer || isSchedule,
        // show: isCandidate || isInterviewer || isSchedule,
      },
      {
        id: "questionbank",
        label: "Interview Questions",
        tooltip: "Interview Questions",
        icon: <BookOpen className="w-4 h-4" />,
        show: isInterviewer || isSchedule,
        // show: isCandidate || isInterviewer || isSchedule,
      },
      {
        id: "interviewactions",
        label: "Interview Actions",
        tooltip: "Interview Actions",
        icon: <ClipboardCheck className="w-4 h-4" />,
        show: isInterviewer || isSchedule,
        // show: isCandidate || isInterviewer || isSchedule,
      },
    ].filter((item) => item.show === true);
  };

  // Add this useEffect to handle messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PANEL_DATA") {
        // Handle any initialization if needed
        // console.log("Received panel data:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-6">
          <div className="flex justify-between h-14">
            <div className="flex items-center space-x-2">
              <a
                href="/code-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-custom-blue text-white rounded-md text-sm font-medium hover:bg-custom-blue/80 transition-colors flex items-center"
              >
                <span>Code Editor</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="/whiteboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-custom-blue text-white rounded-md text-sm font-medium hover:bg-custom-blue/80 transition-colors flex items-center"
              >
                <span>Whiteboard</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2 mr-3">
              {getNavigationItems().map((item) => (
                <div key={item.id} className="group relative">
                  <button
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`p-2.5 rounded-md flex items-center justify-center transition-colors ${sideBarMode === item.id.toUpperCase()
                      ? "bg-blue-100 text-custom-blue border-2 border-custom-blue"
                      : "text-custom-blue hover:bg-gray-100 border border-custom-blue hover:border-custom-blue"
                      }`}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </button>
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap transition-opacity duration-200 z-50 pointer-events-none">
                    {item.tooltip}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-800 z-50 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Area - Will be resized when sidebar is open */}
        <div className="flex-1 flex overflow-hidden">
          <div
            className={`flex-1 transition-all duration-300 ${mainContentPadding}`}
            style={{
              width: sideBarMode
                ? `calc(100% - ${getSidebarWidth(sideBarMode)})`
                : "100%",
            }}
            ref={containerRef}
          >
            {typeof localParticipantAllowedJoin === "boolean" ? (
              localParticipantAllowedJoin ? (
                <div className="flex flex-col h-full w-full">
                  <div className="flex-1 overflow-hidden">
                    {isPresenting ? (
                      <div className="flex flex-col h-full">
                        {/* Horizontal PiP Participants - Top strip below navbar */}
                        <div className="h-32 bg-gray-800 border-b border-gray-600 flex flex-row gap-2 overflow-x-auto p-2">
                          {Array.from(uniqueParticipants).map(
                            (participantId) => (
                              <div
                                key={`pip-${participantId}`}
                                className="relative flex-shrink-0 h-full"
                                style={{
                                  width: "320px", // Fixed width for each participant
                                }}
                              >
                                <ParticipantView
                                  participantId={participantId}
                                />
                                <ParticipantMicStream
                                  participantId={participantId}
                                />
                              </div>
                            ),
                          )}
                        </div>
                        {/* Main presentation area */}
                        <div className="flex-1 relative">
                          <PresenterView
                            height={containerHeight - bottomBarHeight - 128}
                          />{" "}
                          {/* Adjust for h-32 (~128px) */}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="grid h-full w-full"
                        style={{
                          gridTemplateColumns:
                            uniqueParticipants.size === 1
                              ? "1fr"
                              : uniqueParticipants.size === 2
                                ? "1fr 1fr"
                                : "1fr 1fr 1fr",
                          gridTemplateRows:
                            uniqueParticipants.size <= 3
                              ? "1fr"
                              : uniqueParticipants.size <= 6
                                ? "1fr 1fr"
                                : "1fr 1fr 1fr",
                        }}
                      >
                        {Array.from(uniqueParticipants).map((participantId) => (
                          <div
                            key={`participant-${participantId}`}
                            className="relative"
                            style={{
                              height: containerHeight - bottomBarHeight - 10,
                            }}
                          >
                            <ParticipantView participantId={participantId} />
                            <ParticipantMicStream
                              participantId={participantId}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-500 text-lg">
                    You have not been allowed to join yet.
                  </p>
                </div>
              )
            ) : (
              !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
            )}
          </div>
          {/* Sidebar - Rendered conditionally */}
          {sideBarMode && (
            <div
              className="bg-white border-l border-gray-200 flex flex-col transition-all duration-300 overflow-y-auto"
              style={{
                width: getSidebarWidth(sideBarMode),
                height: "100%",
              }}
            >
              {[
                "CANDIDATE",
                "FEEDBACK",
                "INTERVIEWACTIONS",
                "QUESTIONBANK",
              ].includes(sideBarMode) ? (
                <div className="flex flex-col h-full">
                  {/* Sidebar Header for all four modes */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      {sideBarMode === "CANDIDATE" && (
                        <User className="h-5 w-5 mr-2" />
                      )}
                      {sideBarMode === "FEEDBACK" && (
                        <ClipboardCheck className="h-5 w-5 mr-2" />
                      )}
                      {sideBarMode === "INTERVIEWACTIONS" && (
                        <ClipboardList className="h-5 w-5 mr-2" />
                      )}
                      {sideBarMode === "QUESTIONBANK" && (
                        <BookOpen className="h-5 w-5 mr-2" />
                      )}
                      <h3 className="text-lg font-medium">
                        {sideBarMode === "CANDIDATE" && "Candidate Details"}
                        {sideBarMode === "FEEDBACK" && "Interview Feedback"}
                        {sideBarMode === "INTERVIEWACTIONS" &&
                          "Interview Actions"}
                        {sideBarMode === "QUESTIONBANK" &&
                          "Interview Questions"}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <button
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => {
                          if (!sideBarMode) return;
                          openPanelInNewTab(
                            sideBarMode,
                            sideBarMode === "CANDIDATE" ? data : {}
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </button> */}

                      <button
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => setSideBarMode(null)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto">
                    {sideBarMode === "CANDIDATE" ? (
                      <CandidateDetails
                        candidateData={candidateData}
                        positionData={positionData}
                      />
                    ) : sideBarMode === "FEEDBACK" ? (
                      <FeedbackForm
                        custom={true}
                        isAddMode={true}
                        onClose={() => setSideBarMode(null)} />
                    ) : sideBarMode === "INTERVIEWACTIONS" ? (
                      <div className="p-4">
                        <InterviewActions
                          custom={true}
                          onClose={() => setSideBarMode(null)}
                          interviewData={{
                            interviewRound: {
                              dateTime: new Date().toLocaleString(),
                              status: "Scheduled",
                              _id: "mock-id",
                            },
                          }}
                          isAddMode={false}
                          decodedData={{}}
                          onActionComplete={() => { }}
                        />
                      </div>
                    ) : sideBarMode === "QUESTIONBANK" ? (
                      <div className="">
                        <InterviewsMiniTabComponent
                          custom={true}
                          isAddMode={true}
                          isMeetingSidePanel={sideBarMode === "QUESTIONBANK"}
                        />

                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                // Original SidebarConatiner for CHAT and PARTICIPANTS
                <SidebarConatiner
                  height={containerHeight}
                  sideBarContainerWidth={getSidebarWidth(sideBarMode)}
                />
              )}
            </div>
          )}
        </div>
        {/* Bottom Bar - Always full width */}
        <div className="w-full">
          <BottomBar
            bottomBarHeight={bottomBarHeight}
            setIsMeetingLeft={setIsMeetingLeft}
          />
        </div>
      </div>
    </div>
  );
}
