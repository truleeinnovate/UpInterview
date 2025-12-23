import React, { useState, useEffect, useRef, createRef, memo } from "react";
import { Constants, useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";
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
import CandidateDetails from "../../Pages/videoCall/CandidateDetails"
import FeedbackForm from "../../Pages/videoCall/FeedbackForm";
import InterviewActions from "../../Pages/videoCall/InterviewActions";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { MessageSquare, Users, User, ClipboardList, ClipboardCheck } from "lucide-react";


export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
}) {
  const {
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
  } = useMeetingAppContext();

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
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }, [micStream, participantId, isLocal]);

    return null;
  });

  const { useRaisedHandParticipants } = useMeetingAppContext();
  const bottomBarHeight = 60;

  // State for active sidebar item
  const [activeItem, setActiveItem] = useState(null);
  const { localScreenShareOn, toggleScreenShare, sideBarMode, setSideBarMode } = useMeetingAppContext();
  const { participants } = useMeeting();

  // Function to get sidebar width based on mode
  const getSidebarWidth = (mode) => {
    const wideModes = ['CANDIDATE', 'FEEDBACK', 'INTERVIEWACTIONS'];
    return wideModes.includes(mode) ? '600px' : '20rem';
  };

  // Get the current sidebar width
  const sidebarWidth = sideBarMode ? getSidebarWidth(sideBarMode) : '0';
  const mainContentPadding = sideBarMode ? `pr-[${sidebarWidth}]` : '';

  // Handle sidebar item click
  const handleSidebarItemClick = (id) => {
    if (sideBarMode === id.toUpperCase()) {
      setSideBarMode(null);
    } else {
      setSideBarMode(id.toUpperCase());
    }
  };

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
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
    console.log("onMeetingJoined");
  }

  function onMeetingLeft() {
    setSelectedMic({ id: null, label: null })
    setSelectedWebcam({ id: null, label: null })
    setSelectedSpeaker({ id: null, label: null })
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;
    console.log("meetingErr", code, message)

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  const mMeeting = useMeeting({
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
    if (currentParticipants.size !== uniqueParticipants.size ||
      !Array.from(currentParticipants).every(id => uniqueParticipants.has(id))) {
      setUniqueParticipants(currentParticipants);
      console.log("Updated participants:", Array.from(currentParticipants));
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
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();
      }
    },
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <a
                href="/code-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-custom-blue text-white rounded-md text-sm font-medium hover:bg-custom-blue/80 transition-colors flex items-center"
              >
                <span>Editor</span>
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
            <div className="flex items-center space-x-2">
              {[
                {
                  id: "chat",
                  label: "Chat",
                  icon: <MessageSquare className="w-5 h-5" />,
                  tooltip: "Chat"
                },
                {
                  id: "participants",
                  label: "Participants",
                  icon: <Users className="w-5 h-5" />,
                  tooltip: "Participants"
                },
                {
                  id: "candidate",
                  label: "Candidate Details",
                  icon: <User className="w-5 h-5" />,
                  tooltip: "Candidate Details"
                },
                {
                  id: "feedback",
                  label: "Feedback Form",
                  icon: <ClipboardList className="w-5 h-5" />,
                  tooltip: "Feedback Form"
                },
                {
                  id: "interviewactions",
                  label: "Interview Actions",
                  icon: <ClipboardCheck className="w-5 h-5" />,
                  tooltip: "Interview"
                },
              ].map((item) => (
                <div key={item.id} className="group relative">
                  <button
                    onClick={() => handleSidebarItemClick(item.id)}
                    className={`p-2.5 rounded-md flex items-center justify-center transition-colors ${sideBarMode === item.id.toUpperCase()
                      ? 'bg-blue-100 text-custom-blue border-2 border-custom-blue'
                      : 'text-custom-blue hover:bg-gray-100 border border-custom-blue hover:border-custom-blue'
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
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area - Takes full width when sidebar is closed, leaves space when open */}
        <div className={`flex-1 ${mainContentPadding} transition-all duration-300`} style={{
          width: sideBarMode ? `calc(100% - ${sidebarWidth})` : '100%'
        }}>
          {typeof localParticipantAllowedJoin === "boolean" ? (
            localParticipantAllowedJoin ? (
              <div className="flex flex-1 flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  {isPresenting ? (
                    <div className="h-full">
                      <PresenterView height={containerHeight - bottomBarHeight} />
                    </div>
                  ) : (
                    <div
                      className="grid h-full"
                      style={{
                        gridTemplateColumns:
                          uniqueParticipants.size === 1
                            ? '1fr'
                            : uniqueParticipants.size === 2
                              ? '1fr 1fr'
                              : '1fr 1fr 1fr',
                        gridTemplateRows:
                          uniqueParticipants.size <= 3
                            ? '1fr'
                            : uniqueParticipants.size <= 6
                              ? '1fr 1fr'
                              : '1fr 1fr 1fr',
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
                          <ParticipantMicStream participantId={participantId} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <BottomBar
                  bottomBarHeight={bottomBarHeight}
                  setIsMeetingLeft={setIsMeetingLeft}
                />
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

        {/* Right Sidebar */}
        {sideBarMode && (
          <div
            className="bg-white border-l border-gray-200 flex flex-col transition-all duration-300 fixed right-0 top-0 bottom-0 overflow-y-auto"
            style={{
              width: sidebarWidth,
              height: 'calc(100% - 4rem)', // Adjust based on your header height
              marginTop: '4rem' // Match your header height
            }}
          >
            {sideBarMode === 'CANDIDATE' ? (
              <CandidateDetails
                candidate={{
                  id: "candidate-1",
                  name: "John Doe",
                  email: "john@example.com",
                  position: "Software Engineer"
                }}
                onClose={() => setSideBarMode(null)}
              />
            ) : sideBarMode === 'FEEDBACK' ? (
              <FeedbackForm
                onClose={() => setSideBarMode(null)}
              />
            ) : sideBarMode === 'INTERVIEWACTIONS' ? (
              <div className="p-4">
                <InterviewActions
                  onClose={() => setSideBarMode(null)}
                  interviewData={{
                    interviewRound: {
                      dateTime: new Date().toLocaleString(),
                      status: 'Scheduled',
                      _id: 'mock-id'
                    }
                  }}
                  isAddMode={false}
                  decodedData={{}}
                  onActionComplete={() => { }}
                />
              </div>
            ) : (
              <SidebarConatiner
                height={containerHeight}
                sideBarContainerWidth={sideBarContainerWidth}
              />
            )}
          </div>
        )}
      </div>
      {/* Confirmation Dialog */}
      <ConfirmBox
        open={meetingErrorVisible}
        successText="OKAY"
        onSuccess={() => {
          setMeetingErrorVisible(false);
        }}
        title={`Error Code: ${meetingError?.code || 'Unknown Error'}`}
        subTitle={meetingError?.message || 'An unknown error occurred'}
      />
    </div>
  );
}