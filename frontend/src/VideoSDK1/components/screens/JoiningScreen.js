import React, { useEffect, useRef } from "react";
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

export function JoiningScreen(

) {
  const {
    setSelectedMic,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext()

  const {
    checkPermissions,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });

  const audioTrackRef = useRef();
  const permissonAvaialble = useRef();

  useEffect(() => {
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => { };
  }, []);

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
      }
      currentAudioTrack.addEventListener("mute", (ev) => {
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
      }

      // For Audio
      if (isFirefox) {
        const isAudioAllowed = permission.get("audio");
        setIsMicrophonePermissionAllowed(isAudioAllowed);
      }

      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
      }

      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
      }
    } catch (ex) {
      console.log("Error in requestPermission ", ex);
    }
  }
  function onDeviceChanged() {
    getAudioDevices();
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

  // const getAudioDevices = async () => {
  //   try {
  //     // if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
  //       let mics = await getMicrophones();
  //       let speakers = await getPlaybackDevices();
  //       // const hasMic = mics.length > 0;
  //       // if (hasMic) {
  //       //   startMuteListener();
  //       // }

  //       setSelectedSpeaker({
  //         id: speakers[0]?.deviceId,
  //         label: speakers[0]?.label,
  //       });
  //       await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
  //       // setDevices((devices) => {
  //       //   return { ...devices, mics, speakers };
  //       // });
  //     // }
  //   } catch (err) {
  //     console.log("Error in getting audio devices", err);
  //   }
  // };
const getAudioDevices = async () => {
  try {
    let mics = [];
    let speakers = [];
    
    try {
      // Wrap in try-catch in case these methods fail
      mics = await getMicrophones() || [];
      speakers = await getPlaybackDevices() || [];
    } catch (e) {
      console.warn("Error getting audio devices:", e);
    }
    // Safely set speaker if available
    if (speakers && speakers.length > 0) {
      setSelectedSpeaker({
        id: speakers[0]?.deviceId || 'default',
        // label: speakers[0]?.label || 'Default Speaker'
      });
    }
    // Safely set mic if available
    // if (mics && mics.length > 0) {
    //   setSelectedMic({ 
    //     id: mics[0]?.deviceId || 'default', 
    //     label: mics[0]?.label || 'Default Microphone' 
    //   });
    // }
  } catch (err) {
    console.log("Error in getting audio devices", err);
  }
};

  return (
    <>
    
    </>
  );
}
