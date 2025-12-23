import React, { useEffect, useRef, useState } from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";
import ConfirmBox from "../ConfirmBox";
import NetworkStats from "../NetworkStats";
import DropDownCam from "../DropDownCam";
import DropDownSpeaker from "../DropDownSpeaker";
import DropDown from "../DropDown";
import useMediaStream from "../../hooks/useMediaStream";
import useIsMobile from "../../hooks/useIsMobile";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  setMicOn,
  setWebcamOn,
  onClickStartMeeting,
  customAudioStream,
  setCustomAudioStream,
  setCustomVideoStream,
  micOn,
  webcamOn,
}) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext()
  const isMobile = useIsMobile();

  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const {
    checkPermissions,
    getCameras,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [didDeviceChange, setDidDeviceChange] = useState(false);
  const [testSpeaker, setTestSpeaker] = useState(false)

  const videoPlayerRef = useRef();
  const audioPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();
  const webcamRef = useRef();
  const micRef = useRef();

  useEffect(() => {
    webcamRef.current = webcamOn;
  }, [webcamOn]);

  useEffect(() => {
    micRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (micOn) {
      // Close the existing audio track if there's a new one
      if (audioTrackRef.current && audioTrackRef.current !== audioTrack) {
        audioTrackRef.current.stop();
      }

      audioTrackRef.current = audioTrack;

      if (audioTrack) {
        const audioSrcObject = new MediaStream([audioTrack]);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.srcObject = audioSrcObject;
          audioPlayerRef.current
            .play()
            .catch((error) => console.log("audio play error", error));
        }
      } else {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.srcObject = null;
        }
      }
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {

      // Close the existing video track if there's a new one
      if (videoTrackRef.current && videoTrackRef.current !== videoTrack) {
        videoTrackRef.current.stop(); // Stop the existing video track
      }

      videoTrackRef.current = videoTrack;

      var isPlaying =
        videoPlayerRef.current.currentTime > 0 &&
        !videoPlayerRef.current.paused &&
        !videoPlayerRef.current.ended &&
        videoPlayerRef.current.readyState >
        videoPlayerRef.current.HAVE_CURRENT_DATA;

      if (videoTrack) {
        const videoSrcObject = new MediaStream([videoTrack]);

        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = videoSrcObject;
          if (videoPlayerRef.current.pause && !isPlaying) {
            videoPlayerRef.current
              .play()
              .catch((error) => console.log("error", error));
          }
        }
      } else {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = null;
        }
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => {
    getCameraDevices();
  }, [isCameraPermissionAllowed]);

  useEffect(() => {
    getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => { };
  }, []);

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (webcamOn) {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (micOn) {
      if (audioTrack) {
        audioTrack.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId) => {
    if (webcamOn) {
      const currentvideoTrack = videoTrackRef.current;
      if (currentvideoTrack) {
        currentvideoTrack.stop();
      }

      const stream = await getVideoTrack({
        webcamId: deviceId,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };
  const changeMic = async (deviceId) => {
    if (micOn) {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      const stream = await getAudioTrack({
        micId: deviceId,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTrack);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }) => {
    if (mic) {
      const stream = await getAudioTrack({
        micId: selectedMic.id,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks?.length ? audioTracks[0] : null;
      setAudioTrack(audioTrack);
    }

    if (webcam) {
      const stream = await getVideoTrack({
        webcamId: selectedWebcam?.id,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }
      currentAudioTrack.addEventListener("mute", (ev) => {
        setDlgMuted(true);
      });
    }
  }

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);

      // For Video
      if (isFirefox) {
        const isVideoAllowed = permission.get("video");
        setIsCameraPermissionAllowed(isVideoAllowed);
        // Removed automatic enabling of webcam even when permission is granted
      }

      // For Audio
      if (isFirefox) {
        const isAudioAllowed = permission.get("audio");
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        // Removed automatic enabling of mic even when permission is granted
      }

      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        // Removed automatic enabling of mic even when permission is granted
      }

      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
        // Removed automatic enabling of webcam even when permission is granted
      }
    } catch (ex) {
      console.log("Error in requestPermission ", ex);
    }
  }
  function onDeviceChanged() {
    setDidDeviceChange(true);
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  }

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.VIDEO
      );
      const microphonePermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.AUDIO
      );

      setIsCameraPermissionAllowed(cameraPermissionAllowed);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed);

      // Removed automatic enabling of mic and webcam on load
      // They will be turned on manually by the user
      
      // Only request permissions if they are not already granted
      if (!microphonePermissionAllowed) {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      
      if (!cameraPermissionAllowed) {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      // For firefox, it will request audio and video simultaneously.
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcam({
          id: webcams[0]?.deviceId,
          label: webcams[0]?.label,
        });
        setDevices((devices) => {
          return { ...devices, webcams };
        });
      }
    } catch (err) {
      console.log("Error in getting camera devices", err);
    }
  };

  const getAudioDevices = async () => {
    try {
      if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
        let mics = await getMicrophones();
        let speakers = await getPlaybackDevices();
        const hasMic = mics.length > 0;
        if (hasMic) {
          startMuteListener();
        }

        setSelectedSpeaker({
          id: speakers[0]?.deviceId,
          label: speakers[0]?.label,
        });
        await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        setDevices((devices) => {
          return { ...devices, mics, speakers };
        });
      }
    } catch (err) {
      console.log("Error in getting audio devices", err);
    }
  };


  useEffect(() => {
    getAudioDevices()
  }, [])

  const ButtonWithTooltip = ({ onClick, onState, OnIcon, OffIcon }) => {
    const btnRef = useRef();
    return (
      <button
        ref={btnRef}
        onClick={onClick}
        className={`rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${onState ? 'bg-white text-gray-800' : 'bg-red-600 text-white'}`}
        aria-label={onState ? 'Turn off' : 'Turn on'}
      >
        {onState ? (
          <OnIcon className="w-6 h-6" />
        ) : (
          <OffIcon className="w-6 h-6" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row xl:flex-row 2xl:flex-row gap-6">
          {/* Video Preview Section */}
          <div className="w-full lg:w-7/12 xl:w-8/12">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview</h2>
              <div className="relative aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
                {/* Network Stats */}
                {/* <div className="absolute top-4 right-4 z-10">
                  <NetworkStats />
                </div> */}
                
                {/* Audio Element for Mobile */}
                {isMobile && (
                  <audio
                    autoPlay
                    playsInline
                    muted={!testSpeaker}
                    ref={audioPlayerRef}
                    className="hidden"
                    controls={false}
                  />
                )}
                
                {/* Video Element */}
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={videoPlayerRef}
                  controls={false}
                  className="h-full w-full object-cover transform -scale-x-100"
                  style={{ backgroundColor: '#1c1c1c' }}
                />
                
                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0">
                  <div className="flex justify-center space-x-6">
                    {isMicrophonePermissionAllowed ? (
                      <button
                        onClick={_toggleMic}
                        className='flex flex-col items-center justify-center text-white'
                      >
                        {micOn ? (
                          <Mic className="w-8 h-8 text-white" />
                        ) : (
                          <MicOff className="w-8 h-8 text-white" />
                        )}
                        <span className="text-xs mt-1">{micOn ? 'Mute' : 'Unmute'}</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center">
                        <MicOff className="w-8 h-8 text-red-500" />
                        <span className="text-xs text-red-500 mt-1">No Mic</span>
                      </div>
                    )}

                    {isCameraPermissionAllowed ? (
                      <button
                        onClick={_toggleWebcam}
                        className='flex flex-col items-center justify-center text-white'
                      >
                        {webcamOn ? (
                          <Video className="w-8 h-8 text-white" />
                        ) : (
                          <VideoOff className="w-8 h-8 text-white" />
                        )}
                        <span className="text-xs mt-1">{webcamOn ? 'Stop Video' : 'Start Video'}</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center">
                        <VideoOff className="w-8 h-8 text-red-500" />
                        <span className="text-xs text-red-500 mt-1">No Camera</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Device Controls */}
              {/* <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Device Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Microphone</label>
                    <DropDown
                      mics={mics}
                      changeMic={changeMic}
                      customAudioStream={customAudioStream}
                      audioTrack={audioTrack}
                      micOn={micOn}
                      didDeviceChange={didDeviceChange}
                      setDidDeviceChange={setDidDeviceChange}
                      testSpeaker={testSpeaker}
                      setTestSpeaker={setTestSpeaker}
                    />
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Speaker</label>
                    <div className={!isMobile ? 'block' : 'hidden'}>
                      <DropDownSpeaker speakers={speakers} />
                    </div>
                    {isMobile && (
                      <div className="text-xs text-gray-500">Use device controls</div>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Camera</label>
                    <DropDownCam
                      changeWebcam={changeWebcam}
                      webcams={webcams}
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          
          {/* Meeting Details Section */}
          <div className="w-full lg:w-5/12 xl:w-4/12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Meeting Details</h2>
              <div className="space-y-6">
                <MeetingDetailsScreen
                  participantName={participantName}
                  setParticipantName={setParticipantName}
                  videoTrack={videoTrack}
                  setVideoTrack={setVideoTrack}
                  onClickStartMeeting={onClickStartMeeting}
                  onClickJoin={async (id) => {
                    const token = await getToken();
                    const { meetingId, err } = await validateMeeting({
                      roomId: id,
                      token,
                    });
                    if (meetingId === id) {
                      setToken(token);
                      setMeetingId(id);
                      onClickStartMeeting();
                    } else {
                      console.error(err || 'Failed to join meeting');
                    }
                  }}
                  _handleOnCreateMeeting={async () => {
                    const token = await getToken();
                    const { meetingId, err } = await createMeeting({ token });

                    if (meetingId) {
                      setToken(token);
                      setMeetingId(meetingId);
                    }
                    return { meetingId, err };
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="Your default microphone is muted, please unmute it or increase audio input volume from system settings."
      />

      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </div>
  );
}
