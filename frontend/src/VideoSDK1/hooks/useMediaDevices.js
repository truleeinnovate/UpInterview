import { useState, useEffect, useRef } from "react";
import { useMediaDevice } from "@videosdk.live/react-sdk";

export default function useMediaDevices() {
  const [devices, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const [selectedWebcam, setSelectedWebcam] = useState(null);
  const [selectedMic, setSelectedMic] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] = useState(false);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] = useState(false);

  const { getCameras, getMicrophones, getPlaybackDevices, requestPermission } = useMediaDevice({
    onDeviceChanged: (newDevices) => {
      getDevices();
    },
  });

  const getDevices = async () => {
    try {
      const [cameras, mics, speakers] = await Promise.all([
        getCameras(),
        getMicrophones(),
        getPlaybackDevices(),
      ]);

      setDevices({
        webcams: cameras || [],
        mics: mics || [],
        speakers: speakers || [],
      });

      // Set default devices if not already set
      if (cameras?.length > 0 && !selectedWebcam) {
        setSelectedWebcam({ id: cameras[0].deviceId, label: cameras[0].label });
      }
      if (mics?.length > 0 && !selectedMic) {
        setSelectedMic({ id: mics[0].deviceId, label: mics[0].label });
      }
      if (speakers?.length > 0 && !selectedSpeaker) {
        setSelectedSpeaker({ id: speakers[0].deviceId, label: speakers[0].label });
      }

      // Check permissions
      const cameraPermission = await requestPermission("camera");
      const microphonePermission = await requestPermission("microphone");
      setIsCameraPermissionAllowed(cameraPermission);
      setIsMicrophonePermissionAllowed(microphonePermission);

    } catch (error) {
      console.error("Error getting devices:", error);
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  return {
    devices,
    selectedWebcam,
    selectedMic,
    selectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setSelectedWebcam,
    setSelectedMic,
    setSelectedSpeaker,
  };
}