// BottomBar.js (Unchanged from your last version - includes ScreenShareBTN updates, but fix button nesting warning as noted)
import {
  Constants,
  useMeeting,
  usePubSub,
  useMediaDevice,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import recordingBlink from "../../static/animations/recording-blink.json";
import useIsRecording from "../../hooks/useIsRecording";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import PipIcon from "../../icons/Bottombar/PipIcon";
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import { sideBarModes } from "../../utils/common";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { createPopper } from "@popperjs/core";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import useMediaStream from "../../hooks/useMediaStream";

const MicBTN = () => {
  const {
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    isMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const { getMicrophones, getPlaybackDevices } = useMediaDevice();

  const mMeeting = useMeeting();
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const localMicOn = mMeeting?.localMicOn;
  const changeMic = mMeeting?.changeMic;

  useMediaDevice({
    onDeviceChanged
  })

  function onDeviceChanged(devices) {
    getMics();
    const newSpeakerList = devices.devices.filter(device => device.kind === 'audiooutput');

    if (newSpeakerList.length > 0) {
      setSelectedSpeaker({ id: newSpeakerList[0].deviceId, label: newSpeakerList[0].label });
    }

  }



  const getMics = async () => {
    const mics = await getMicrophones();
    const speakers = await getPlaybackDevices();

    mics && mics?.length && setMics(mics);
    speakers && speakers?.length && setSpeakers(speakers);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "top",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localMicOn ? MicOnIcon : MicOffIcon}
        onClick={() => {
          mMeeting.toggleMic();
        }}
        bgColor={localMicOn ? "bg-gray-750" : "bg-white"}
        borderColor={localMicOn && "#ffffff33"}
        isFocused={localMicOn}
        focusIconColor={localMicOn && "white"}
        tooltip={"Toggle Mic"}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isMicrophonePermissionAllowed}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div
                        ref={btnRef}
                        onMouseEnter={openTooltip}
                        onMouseLeave={closeTooltip}
                        onClick={() => getMics()} // FIXED: Direct click, no inner button
                      >
                        <ChevronDownIcon
                          className="h-4 w-4"
                          style={{
                            color: mMeeting.localMicOn ? "white" : "black",
                          }}
                        />
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className={" bg-gray-750 py-1"}>
                            <div>
                              <div className="flex items-center p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900">
                                  {"MICROPHONE"}
                                </p>
                              </div>
                              <div className="flex flex-col">
                                {mics.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white text-left ${deviceId === selectedMic.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedMic.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`mics_${deviceId}`}
                                      onClick={() => {
                                        setSelectedMic({ id: deviceId });
                                        changeMic(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Mic ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <hr className="border border-gray-50 mt-2 mb-1" />
                            <div>
                              <div className="flex p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900  text-center">
                                  {"SPEAKER"}
                                </p>
                              </div>
                              <div className="flex flex-col ">
                                {speakers.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white ${deviceId === selectedSpeaker.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedSpeaker.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`speakers_${deviceId}`}
                                      onClick={() => {
                                        setSelectedSpeaker({ id: deviceId });
                                        close();
                                      }}
                                    >
                                      {label || `Speaker ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className={"rounded-md p-1.5 bg-black "}>
                  <p className="text-base text-white ">{"Change microphone"}</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

const WebCamBTN = () => {
  const { selectedWebcam, setSelectedWebcam, isCameraPermissionAllowed } =
    useMeetingAppContext();

  const { getCameras } = useMediaDevice();
  const mMeeting = useMeeting();
  const [webcams, setWebcams] = useState([]);
  const { getVideoTrack } = useMediaStream();

  const localWebcamOn = mMeeting?.localWebcamOn;
  const changeWebcam = mMeeting?.changeWebcam;

  const getWebcams = async () => {
    let webcams = await getCameras();
    webcams && webcams?.length && setWebcams(webcams);
  };

  const [tooltipShow, setTooltipShow] = useState(false);
  const btnRef = useRef();
  const tooltipRef = useRef();

  const openTooltip = () => {
    createPopper(btnRef.current, tooltipRef.current, {
      placement: "top",
    });
    setTooltipShow(true);
  };
  const closeTooltip = () => {
    setTooltipShow(false);
  };

  return (
    <>
      <OutlinedButton
        Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
        onClick={async () => {
          let track;
          if (!localWebcamOn) {
            track = await getVideoTrack({
              webcamId: selectedWebcam.id,
            });
          }
          mMeeting.toggleWebcam(track);
        }}
        bgColor={localWebcamOn ? "bg-gray-750" : "bg-white"}
        borderColor={localWebcamOn && "#ffffff33"}
        isFocused={localWebcamOn}
        focusIconColor={localWebcamOn && "white"}
        tooltip={"Toggle Webcam"}
        renderRightComponent={() => {
          return (
            <>
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button
                      disabled={!isCameraPermissionAllowed}
                      className="flex items-center justify-center mt-1 mr-1 focus:outline-none"
                    >
                      <div
                        ref={btnRef}
                        onMouseEnter={openTooltip}
                        onMouseLeave={closeTooltip}
                        onClick={() => getWebcams()} // FIXED: Direct click, no inner button
                      >
                        <ChevronDownIcon
                          className="h-4 w-4"
                          style={{
                            color: localWebcamOn ? "white" : "black",
                          }}
                        />
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <div className={" bg-gray-750 py-1"}>
                            <div>
                              <div className="flex items-center p-3 pb-0">
                                <p className="ml-3 text-sm text-gray-900">
                                  {"WEBCAM"}
                                </p>
                              </div>
                              <div className="flex flex-col">
                                {webcams.map(({ deviceId, label }, index) => (
                                  <div
                                    className={`px-3 py-1 my-1 pl-6 text-white ${deviceId === selectedWebcam.id &&
                                      "bg-gray-150"
                                      }`}
                                  >
                                    <button
                                      className={`flex flex-1 w-full text-left ${deviceId === selectedWebcam.id &&
                                        "bg-gray-150"
                                        }`}
                                      key={`output_webcams_${deviceId}`}
                                      onClick={() => {
                                        setSelectedWebcam({ id: deviceId });
                                        changeWebcam(deviceId);
                                        close();
                                      }}
                                    >
                                      {label || `Webcam ${index + 1}`}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div
                style={{ zIndex: 999 }}
                className={`${tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                ref={tooltipRef}
              >
                <div className={"rounded-md p-1.5 bg-black "}>
                  <p className="text-base text-white ">{"Change webcam"}</p>
                </div>
              </div>
            </>
          );
        }}
      />
    </>
  );
};

export function BottomBar({ bottomBarHeight, setIsMeetingLeft, isSchedule = false }) {

  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const RaiseHand = () => {
      try {
        publish("Raise Hand");
      } catch (e) {
        console.log("Error in pubsub", e)
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle={"Raise hand"}
        Icon={RaiseHandIcon}
        onClick={RaiseHand}
        buttonText={"Raise Hand"}
      />
    ) : (
      <OutlinedButton
        onClick={RaiseHand}
        tooltip={"Raise Hand"}
        Icon={RaiseHandIcon}
      />
    );
  };

  const RecordingBTN = () => {
    const { startRecording, stopRecording, recordingState } = useMeeting();

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    // Timer state
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Start/stop timer based on recording state
    useEffect(() => {
      if (isRecording) {
        setElapsedSeconds(0);
        timerRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [isRecording]);

    const formatTime = (totalSeconds) => {
      const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
      const secs = (totalSeconds % 60).toString().padStart(2, "0");
      return `${mins}:${secs}`;
    };

    const isRequestProcessing = useMemo(
      () =>
        recordingState === Constants.recordingEvents.RECORDING_STARTING ||
        recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      [recordingState]
    );

    const _handleClick = () => {
      const isRec = isRecordingRef.current;
      if (isRec) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    const tooltipText = recordingState === Constants.recordingEvents.RECORDING_STARTED
      ? "Stop Recording"
      : recordingState === Constants.recordingEvents.RECORDING_STARTING
        ? "Starting Recording"
        : recordingState === Constants.recordingEvents.RECORDING_STOPPED
          ? "Start Recording"
          : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording";

    return (
      <div
        onClick={isRequestProcessing ? undefined : _handleClick}
        title={tooltipText}
        className={`flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none m-1 ${isRequestProcessing ? "opacity-60 cursor-not-allowed" : ""
          }`}
        style={{
          padding: isRecording ? "6px 12px" : "6px 10px",
          background: isRecording ? "#dc2626" : "#2d3748",
          border: isRecording ? "2px solid #f87171" : "2px solid rgba(255,255,255,0.2)",
          height: 40,
        }}
      >
        {/* Red/white dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isRecording ? "#fff" : "#ef4444",
            animation: isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {isRequestProcessing
            ? recordingState === Constants.recordingEvents.RECORDING_STARTING
              ? "Starting..."
              : "Stopping..."
            : isRecording
              ? formatTime(elapsedSeconds)
              : "REC"}
        </span>
      </div>
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const mMeeting = useMeeting();
    const { localScreenShareOn, toggleScreenShare, presenterId } = mMeeting;
    const { setLocalScreenShareStream } = useMeetingAppContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const screenShareStreamRef = useRef(null);

    // Clean up screen share stream on unmount
    useEffect(() => {
      return () => {
        if (screenShareStreamRef.current) {
          screenShareStreamRef.current.getTracks().forEach(track => track.stop());
          screenShareStreamRef.current = null;
        }
      };
    }, []);

    const handleScreenShare = async () => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);

        // If already sharing, stop sharing
        if (localScreenShareOn) {
          await toggleScreenShare();
          setLocalScreenShareStream(null);
          // if (screenShareStreamRef.current) {
          //   screenShareStreamRef.current.getTracks().forEach(track => track.stop());
          //   screenShareStreamRef.current = null;
          // }
          return;
        }

        console.log('Starting screen share...', {
          isLocalPresenting: mMeeting?.localParticipant?.id === presenterId,
          presenterId,
          localScreenShareOn,
          meetingState: mMeeting
        });

        // Request screen share with system audio if available
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30, max: 30 },
            width: { max: 1920 },
            height: { max: 1080 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            suppressLocalAudioPlayback: true,
          },
          surfaceSwitching: 'include',
          selfBrowserSurface: 'exclude',
          systemAudio: 'include',
          preferCurrentTab: false
        }).catch(err => {
          console.error('Screen share error:', err);
          throw err;
        });

        console.log('Screen share stream obtained:', stream);
        setLocalScreenShareStream(stream);
        // screenShareStreamRef.current = stream;

        // Handle stream ended (user stops sharing)
        stream.getVideoTracks().forEach(track => {
          track.onended = () => {
            console.log('Screen share track ended:', track.kind);
            if (localScreenShareOn) {
              toggleScreenShare();
            }
            setLocalScreenShareStream(null);
            // if (screenShareStreamRef.current) {
            //   screenShareStreamRef.current.getTracks().forEach(t => t.stop());
            //   screenShareStreamRef.current = null;
            // }
          };
        });

        // Start screen share through VideoSDK
        await toggleScreenShare(stream);

      } catch (error) {
        console.error('Screen share failed:', error);
        setLocalScreenShareStream(null);
        // if (screenShareStreamRef.current) {
        //   screenShareStreamRef.current.getTracks().forEach(track => track.stop());
        //   screenShareStreamRef.current = null;
        // }
      } finally {
        setIsProcessing(false);
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          localScreenShareOn
            ? "Stop Presenting"
            : "Present Screen"
        }
        buttonText={
          localScreenShareOn
            ? "Stop Presenting"
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={handleScreenShare}
        disabled={isProcessing}
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={handleScreenShare}
        isFocused={localScreenShareOn}
        tooltip={
          localScreenShareOn
            ? "Stop Presenting"
            : "Present Screen"
        }
        disabled={isProcessing} // Always enable the button to allow starting screen share
      />
    );
  };

  const LeaveBTN = () => {
    const { leave } = useMeeting();

    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="bg-red-150"
        onClick={() => {
          leave();
          setIsMeetingLeft(true);
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const tollTipEl = useRef();
  const { meetingId } = useMeeting();
  const [isCopied, setIsCopied] = useState(false);

  // Custom button component to ensure consistent styling and centering
  const ControlButton = ({ children, className = '' }) => (
    <div className={`flex items-center justify-center w-12 h-12 hover:bg-gray-700 rounded-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-center w-7 h-7">
        {children}
      </div>
    </div>
  );

  const handleCopyClick = () => {
    if (meetingId) {
      navigator.clipboard.writeText(meetingId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);
    return (
      <div className="flex items-center justify-center lg:ml-0 ml-2">
        <div className="flex border-2 border-gray-850 p-1.5 rounded-md items-center justify-center">
          <span className="text-white text-sm">{meetingId}</span>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // Force black text for all button components
  const buttonProps = {
    className: 'text-black',
    style: { color: 'black' }
  };

  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-gray-800 border-gray-600 h-16">
      {/* Left side - Meeting ID */}
      <div className="flex items-center">
        {/* <MeetingIdCopyBTN /> */}
      </div>

      {/* Middle - Controls */}
      <div className="absolute left-1/2 transform -translate-x-1/2" ref={tollTipEl}>
        <div className="flex items-center">
          {/* First group */}
          <div className="flex items-center space-x-4">
            {isSchedule && (
              <RecordingBTN {...buttonProps} />
            )}
            <ControlButton><RaiseHandBTN isMobile={false} isTab={false} {...buttonProps} /></ControlButton>
          </div>

          {/* Middle group with mic and webcam - centered */}
          <div className="flex items-center mx-6">
            <ControlButton className="mr-2"><MicBTN {...buttonProps} /></ControlButton>
            <div className="h-8 bg-gray-600 mx-2"></div>
            <ControlButton className="ml-2"><WebCamBTN {...buttonProps} /></ControlButton>
          </div>

          {/* Last group */}
          <div className="flex items-center space-x-4">
            <ControlButton><ScreenShareBTN isMobile={false} isTab={false} {...buttonProps} /></ControlButton>
            <ControlButton><LeaveBTN {...buttonProps} /></ControlButton>
          </div>
        </div>
      </div>

      {/* Right side - Chat and Participants */}
      <div>
        {/* <ControlButton><ChatBTN isMobile={false} isTab={false} {...buttonProps} /></ControlButton>
        <ControlButton><ParticipantsBTN isMobile={false} isTab={false} {...buttonProps} /></ControlButton> */}
      </div>
    </div>
  );
}