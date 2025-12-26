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

// function PipBTN({ isMobile, isTab }) {
//   const { pipMode, setPipMode } = useMeetingAppContext();

//   const getRowCount = (length) => {
//     return length > 2 ? 2 : length > 0 ? 1 : 0;
//   };
//   const getColCount = (length) => {
//     return length < 2 ? 1 : length < 5 ? 2 : 3;
//   };

//   const pipWindowRef = useRef(null);
//   const togglePipMode = async () => {
//     //Check if PIP Window is active or not
//     //If active we will turn it off
//     if (pipWindowRef.current) {
//       await document.exitPictureInPicture();
//       pipWindowRef.current = null;
//       return;
//     }

//     //Check if browser supports PIP mode else show a message to user
//     if ("pictureInPictureEnabled" in document) {
//       //Creating a Canvas which will render our PIP Stream
//       const source = document.createElement("canvas");
//       const ctx = source.getContext("2d");

//       //Create a Video tag which we will popout for PIP
//       const pipVideo = document.createElement("video");
//       pipWindowRef.current = pipVideo;
//       pipVideo.autoplay = true;

//       //Creating stream from canvas which we will play
//       const stream = source.captureStream();
//       pipVideo.srcObject = stream;
//       drawCanvas();

//       //When Video is ready we will start PIP mode
//       pipVideo.onloadedmetadata = () => {
//         pipVideo.requestPictureInPicture();
//       };
//       await pipVideo.play();

//       //When the PIP mode starts, we will start drawing canvas with PIP view
//       pipVideo.addEventListener("enterpictureinpicture", (event) => {
//         drawCanvas();
//         setPipMode(true);
//       });

//       //When PIP mode exits, we will dispose the track we created earlier
//       pipVideo.addEventListener("leavepictureinpicture", (event) => {
//         pipWindowRef.current = null;
//         setPipMode(false);
//         pipVideo.srcObject.getTracks().forEach((track) => track.stop());
//       });

//       //These will draw all the video elements in to the Canvas
//       function drawCanvas() {
//         //Getting all the video elements in the document
//         const videos = document.querySelectorAll("video");
//         try {
//           //Perform initial black paint on the canvas
//           ctx.fillStyle = "black";
//           ctx.fillRect(0, 0, source.width, source.height);

//           //Drawing the participant videos on the canvas in the grid format
//           const rows = getRowCount(videos.length);
//           const columns = getColCount(videos.length);
//           for (let i = 0; i < rows; i++) {
//             for (let j = 0; j < columns; j++) {
//               if (j + i * columns <= videos.length || videos.length === 1) {
//                 ctx.drawImage(
//                   videos[j + i * columns],
//                   j < 1 ? 0 : source.width / (columns / j),
//                   i < 1 ? 0 : source.height / (rows / i),
//                   source.width / columns,
//                   source.height / rows
//                 );
//               }
//             }
//           }
//         } catch (error) {
//           console.log(error);
//         }

//         //If pip mode is on, keep drawing the canvas when ever new frame is requested
//         if (document.pictureInPictureElement === pipVideo) {
//           requestAnimationFrame(drawCanvas);
//         }
//       }
//     } else {
//       alert("PIP is not supported by your browser");
//     }
//   };

//   return isMobile || isTab ? (
//     <MobileIconButton
//       id="pip-btn"
//       tooltipTitle={pipMode ? "Stop PiP" : "Start Pip"}
//       buttonText={pipMode ? "Stop PiP" : "Start Pip"}
//       isFocused={pipMode}
//       Icon={PipIcon}
//       onClick={() => {
//         togglePipMode();
//       }}
//       disabled={false}
//     />
//   ) : (
//     <OutlinedButton
//       Icon={PipIcon}
//       onClick={() => {
//         togglePipMode();
//       }}
//       isFocused={pipMode}
//       tooltip={pipMode ? "Stop PiP" : "Start Pip"}
//       disabled={false}
//     />
//   );
// }

// const MicBTN = () => {
//   const meeting = useMeeting();
//   const localMicOn = meeting?.localMicOn;

//   return (
//     <div className="flex items-center">
//       <button
//         onClick={() => meeting.toggleMic()}
//         className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
//         title={localMicOn ? "Mute Mic" : "Unmute Mic"}
//       >
//         {localMicOn ? (
//           <MicOnIcon className="h-6 w-6 text-black" />
//         ) : (
//           <MicOffIcon className="h-6 w-6 text-black" />
//         )}
//       </button>
//     </div>
//   );
// };

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
                      >
                        <button
                          onClick={() => {
                            getMics();
                          }}
                        >
                          <ChevronDownIcon
                            className="h-4 w-4"
                            style={{
                              color: mMeeting.localMicOn ? "white" : "black",
                            }}
                          />
                        </button>
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

// const WebCamBTN = () => {
//   const { selectedWebcam, setSelectedWebcam, isCameraPermissionAllowed } = useMeetingAppContext();
//   const { getCameras } = useMediaDevice();
//   const { getVideoTrack } = useMediaStream();
//   const mMeeting = useMeeting();
//   const [webcams, setWebcams] = useState([]);
//   const localWebcamOn = mMeeting?.localWebcamOn;
//   const changeWebcam = mMeeting?.changeWebcam;

//   const getWebcams = async () => {
//     const cams = await getCameras();
//     cams && cams.length && setWebcams(cams);
//   };

//   useEffect(() => {
//     getWebcams();
//   }, []);

//   return (
//     <div className="flex items-center">
//       <div className="flex items-center">
//         <button
//           onClick={async () => {
//             let track;
//             if (!localWebcamOn) {
//               track = await getVideoTrack({
//                 webcamId: selectedWebcam?.id,
//               });
//             }
//             mMeeting.toggleWebcam(track);
//           }}
//           className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
//           title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
//         >
//           {localWebcamOn ? (
//             <WebcamOnIcon className="h-6 w-6" />
//           ) : (
//             <WebcamOffIcon className="h-6 w-6" />
//           )}
//         </button>
//         <div className="relative">
//           <Popover>
//             {({ close }) => (
//               <>
//                 <Popover.Button
//                   disabled={!isCameraPermissionAllowed}
//                   className="flex items-center justify-center p-1 focus:outline-none"
//                   title="Camera Settings"
//                 >
//                   <ChevronDownIcon className="h-4 w-4 text-black" />
//                 </Popover.Button>
//                 <Transition
//                   as={Fragment}
//                   enter="transition ease-out duration-200"
//                   enterFrom="opacity-0 translate-y-1"
//                   enterTo="opacity-100 translate-y-0"
//                   leave="transition ease-in duration-150"
//                   leaveFrom="opacity-100 translate-y-0"
//                   leaveTo="opacity-0 translate-y-1"
//                 >
//                   <Popover.Panel className="absolute z-10 mt-2 w-72 -translate-x-1/2 left-1/2">
//                     <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white">
//                       <div className="p-4">
//                         <div>
//                           <p className="text-sm font-medium text-gray-700 mb-2">WEBCAM</p>
//                           <div className="space-y-1">
//                             {webcams.map(({ deviceId, label }, index) => (
//                               <button
//                                 key={`camera_${deviceId}`}
//                                 className={`w-full text-left px-3 py-2 text-sm rounded ${
//                                   deviceId === selectedWebcam?.id 
//                                     ? 'bg-gray-100 text-black' 
//                                     : 'text-gray-700 hover:bg-gray-50'
//                                 }`}
//                                 onClick={() => {
//                                   setSelectedWebcam({ id: deviceId });
//                                   changeWebcam(deviceId);
//                                   close();
//                                 }}
//                               >
//                                 {label || `Camera ${index + 1}`}
//                               </button>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </Popover.Panel>
//                 </Transition>
//               </>
//             )}
//           </Popover>
//         </div>
//       </div>
//     </div>
//   );
// };

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
                      >
                        <button
                          onClick={() => {
                            getWebcams();
                          }}
                        >
                          <ChevronDownIcon
                            className="h-4 w-4"
                            style={{
                              color: localWebcamOn ? "white" : "black",
                            }}
                          />
                        </button>
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

export function BottomBar({ bottomBarHeight, setIsMeetingLeft }) {
  const { sideBarMode, setSideBarMode } = useMeetingAppContext();
  
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
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    return (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
              ? "Starting Recording"
              : recordingState === Constants.recordingEvents.RECORDING_STOPPED
                ? "Start Recording"
                : recordingState === Constants.recordingEvents.RECORDING_STOPPING
                  ? "Stopping Recording"
                  : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        buttonText={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={() => {
          toggleScreenShare();
        }}
        disabled={
          presenterId
            ? localScreenShareOn
              ? false
              : true
            : isMobile
              ? true
              : false
        }
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={() => {
          toggleScreenShare();
        }}
        isFocused={localScreenShareOn}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
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

  // const ChatBTN = ({ isMobile, isTab }) => {
  //   return isMobile || isTab ? (
  //     <MobileIconButton
  //       tooltipTitle={"Chat"}
  //       buttonText={"Chat"}
  //       Icon={ChatIcon}
  //       isFocused={sideBarMode === sideBarModes.CHAT}
  //       onClick={() => {
  //         setSideBarMode((s) =>
  //           s === sideBarModes.CHAT ? null : sideBarModes.CHAT
  //         );
  //       }}
  //     />
  //   ) : (
  //     <OutlinedButton
  //       Icon={ChatIcon}
  //       onClick={() => {
  //         setSideBarMode((s) =>
  //           s === sideBarModes.CHAT ? null : sideBarModes.CHAT
  //         );
  //       }}
  //       isFocused={sideBarMode === "CHAT"}
  //       tooltip="View Chat"
  //     />
  //   );
  // };

  // const ParticipantsBTN = ({ isMobile, isTab }) => {
  //   const { participants } = useMeeting();
  //   return isMobile || isTab ? (
  //     <MobileIconButton
  //       tooltipTitle={"Participants"}
  //       isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
  //       buttonText={"Participants"}
  //       disabledOpacity={1}
  //       Icon={ParticipantsIcon}
  //       onClick={() => {
  //         setSideBarMode((s) =>
  //           s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
  //         );
  //       }}
  //       badge={`${new Map(participants)?.size}`}
  //     />
  //   ) : (
  //     <OutlinedButton
  //       Icon={ParticipantsIcon}
  //       onClick={() => {
  //         setSideBarMode((s) =>
  //           s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
  //         );
  //       }}
  //       isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
  //       tooltip={"View \nParticipants"}
  //       badge={`${new Map(participants)?.size}`}
  //     />
  //   );
  // };

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
        <MeetingIdCopyBTN />
      </div>

      {/* Middle - Controls */}
      <div className="absolute left-1/2 transform -translate-x-1/2" ref={tollTipEl}>
        <div className="flex items-center">
          {/* First group */}
          <div className="flex items-center space-x-4">
            <ControlButton><RecordingBTN {...buttonProps} /></ControlButton>
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
