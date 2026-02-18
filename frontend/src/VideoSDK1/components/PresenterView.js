// // PresenterView.js (full updated component)
// import { useMeeting, useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
// import { useEffect, useMemo, useRef, useState } from "react"; // Added useState for overlay timer
// import MicOffSmallIcon from "../icons/MicOffSmallIcon";
// import ScreenShareIcon from "../icons/ScreenShareIcon";
// import SpeakerIcon from "../icons/SpeakerIcon";
// import { nameTructed } from "../utils/helper";
// import { CornerDisplayName } from "./ParticipantView";
// import { useMeetingAppContext } from "../MeetingAppContextDef";

// export function PresenterView({ height }) {
//   const mMeeting = useMeeting();
//   const presenterId = mMeeting?.presenterId;
//   const { localScreenShareStream } = useMeetingAppContext();

//   const [showOverlay, setShowOverlay] = useState(false); // NEW: Control overlay visibility

//   console.log('PresenterView - Presenter ID:', presenterId, 'Meeting State:', {
//     isPresenting: mMeeting?.isPresenting,
//     localParticipant: mMeeting?.localParticipant?.id,
//     presenterId: mMeeting?.presenterId,
//     isLocalPresenting: mMeeting?.localParticipant?.id === mMeeting?.presenterId
//   });

//   const {
//     micOn,
//     webcamOn,
//     isLocal,
//     screenShareAudioStream,
//     screenShareOn,
//     displayName,
//     isActiveSpeaker,
//     screenShareStream,
//     screenShareVideoTrack,
//     screenShareAudioTrack,
//     screenShareVideoOn,
//     screenShareAudioOn,
//   } = useParticipant(presenterId || '');

//   const videoRef = useRef(null);
//   const audioPlayer = useRef(null);

//   // NEW: Auto-hide overlay after 3s when local sharing starts
//   useEffect(() => {
//     if (isLocal && localScreenShareStream && screenShareOn) {
//       setShowOverlay(true);
//       const timer = setTimeout(() => setShowOverlay(false), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [isLocal, localScreenShareStream, screenShareOn]);

//   // Video effect: Unmute for screen share (visual + tab audio)
//   useEffect(() => {
//     if (isLocal && localScreenShareStream && videoRef.current) {
//       console.log('Setting local video stream:', localScreenShareStream.getVideoTracks().length, 'video tracks');
//       videoRef.current.srcObject = localScreenShareStream;
//       videoRef.current.muted = false; // CHANGED: Unmute for screen share preview
//       videoRef.current.play().catch(err => console.error('Local video play error:', err));
//     } else if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }

//     return () => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//       }
//     };
//   }, [isLocal, localScreenShareStream]);

//   // Audio effect: FIXED deps + local audio handling
//   useEffect(() => {
//     if (audioPlayer.current) {
//       let streamToUse = null;
//       if (isLocal && localScreenShareStream && localScreenShareStream.getAudioTracks().length > 0) {
//         // For local: Use captured stream's audio (but mute playback to avoid echo)
//         streamToUse = new MediaStream();
//         const audioTrack = localScreenShareStream.getAudioTracks()[0];
//         if (audioTrack) {
//           streamToUse.addTrack(audioTrack);
//           audioPlayer.current.muted = true; // Mute local audio playback to prevent echo
//         }
//       } else if (!isLocal && screenShareOn && screenShareAudioStream?.track) {
//         // For remote: Unmuted
//         streamToUse = new MediaStream([screenShareAudioStream.track]);
//         audioPlayer.current.muted = false;
//       }

//       if (streamToUse) {
//         console.log('Setting audio stream:', streamToUse.getAudioTracks().length, 'tracks');
//         audioPlayer.current.srcObject = streamToUse;
//         audioPlayer.current.play().catch(err => console.error('Audio play error:', err));
//       } else {
//         audioPlayer.current.srcObject = null;
//       }
//     }
//   }, [screenShareAudioStream, screenShareOn, isLocal, localScreenShareStream]); // FIXED: Added screenShareOn to deps

//   console.log('PresenterView - Render state:', {
//     isLocal,
//     localScreenShareStream: !!localScreenShareStream,
//     screenShareOn,
//     presenterId,
//     videoTracks: localScreenShareStream?.getVideoTracks().length || 0
//   });

//   const showPlaceholder = !localScreenShareStream && screenShareOn; // Only if stream missing but sharing active

//   return (
//     <div className="bg-gray-750 rounded m-2 relative overflow-hidden w-full" style={{ height }}>
//       <audio autoPlay playsInline controls={false} ref={audioPlayer} />

//       <div className="video-contain absolute h-full w-full">
//         {/* Video rendering (unchanged logic) */}
//         {isLocal ? (
//           localScreenShareStream ? (
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               className="h-full w-full object-cover"
//               style={{}} // No blur needed
//             />
//           ) : (
//             <div className="h-full w-full bg-black flex items-center justify-center">
//               <p className="text-white">Screen share loading...</p>
//             </div>
//           )
//         ) : (
//           <VideoPlayer
//             participantId={presenterId}
//             type="share"
//             containerStyle={{ height: "100%", width: "100%" }}
//             className="h-full"
//             classNameVideo="h-full"
//           />
//         )}

//         {/* REFINED: Small top banner overlay (non-blocking, auto-hides) */}
//         {isLocal && localScreenShareStream && showOverlay && (
//           <div className="absolute top-4 left-4 right-4 bg-gray-750/80 backdrop-blur-sm p-3 rounded-lg flex items-center justify-between z-10 border border-white/20">
//             <div className="flex items-center space-x-2">
//               <ScreenShareIcon style={{ height: 20, width: 20, color: "white" }} />
//               <p className="text-white text-sm font-medium">You are presenting to everyone</p>
//             </div>
//             <button
//               className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium ml-2"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 mMeeting.toggleScreenShare();
//                 setShowOverlay(false);
//               }}
//             >
//               STOP
//             </button>
//           </div>
//         )}

//         {/* Bottom label (unchanged) */}
//         <div className="bottom-2 left-2 bg-gray-750/80 p-2 absolute rounded-md flex items-center z-10">
//           {!micOn ? <MicOffSmallIcon fillcolor="white" /> : micOn && isActiveSpeaker ? <SpeakerIcon /> : null}
//           <p className="text-sm text-white ml-1">
//             {isLocal ? 'You are presenting' : `${nameTructed(displayName, 15)} is presenting`}
//           </p>
//         </div>

//         {/* Placeholder only if truly no stream */}
//         {showPlaceholder && (
//           <div className="h-full flex items-center justify-center z-5">
//             <p className="text-white">No screen share active</p>
//           </div>
//         )}

//         {/* CornerDisplayName (add key fix below) */}
//         <CornerDisplayName 
//           {...{ 
//             isLocal, 
//             displayName, 
//             micOn, 
//             webcamOn: false, 
//             isPresenting: true, 
//             participantId: presenterId, 
//             isActiveSpeaker 
//           }} 
//         />
//       </div>
//     </div>
//   );
// }






// PresenterView.js (Full updated with all previous fixes + remote fallback + enhanced logging)
import { useMeeting, useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { nameTructed } from "../utils/helper";
import { CornerDisplayName } from "./ParticipantView";
import { useMeetingAppContext } from "../MeetingAppContextDef";

export function PresenterView({ height }) {
  const mMeeting = useMeeting({
    // ... existing config ...
    onPresenterChanged: (presenterId) => {
      console.log('onPresenterChanged:', presenterId); // NEW: Log state change
    },
  });
  const presenterId = mMeeting?.presenterId;
  const { localScreenShareStream } = useMeetingAppContext();

  const [showOverlay, setShowOverlay] = useState(false);

  const {
    micOn,
    webcamOn,
    isLocal,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
    screenShareStream, // NEW: Explicitly destructure for remote
    screenShareVideoTrack, // NEW: For manual fallback
  } = useParticipant(presenterId || '');

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null); // NEW: For remote manual fallback
  const audioPlayer = useRef(null);

  // Auto-hide overlay (unchanged)
  useEffect(() => {
    if (isLocal && localScreenShareStream && screenShareOn) {
      setShowOverlay(true);
      const timer = setTimeout(() => setShowOverlay(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLocal, localScreenShareStream, screenShareOn]);

  // Local video (unchanged)
  useEffect(() => {
    if (isLocal && localScreenShareStream && videoRef.current) {
      console.log('Setting local video stream:', localScreenShareStream.getVideoTracks().length, 'video tracks');
      videoRef.current.srcObject = localScreenShareStream;
      videoRef.current.muted = false;
      videoRef.current.play().catch(err => console.error('Local video play error:', err));
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    return () => { if (videoRef.current) videoRef.current.srcObject = null; };
  }, [isLocal, localScreenShareStream]);

  // NEW: Remote video fallback (if VideoPlayer stream delayed)
  useEffect(() => {
    if (!isLocal && screenShareOn && screenShareVideoTrack && remoteVideoRef.current && !screenShareStream) {
      // Manual stream if VideoSDK hook stream missing
      const manualStream = new MediaStream([screenShareVideoTrack]);
      console.log('Remote fallback: Using manual stream with', manualStream.getVideoTracks().length, 'tracks');
      remoteVideoRef.current.srcObject = manualStream;
      remoteVideoRef.current.play().catch(err => console.error('Remote video play error:', err));
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    return () => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; };
  }, [!isLocal, screenShareOn, screenShareVideoTrack, screenShareStream]);

  // Audio (enhanced logging)
  useEffect(() => {
    if (audioPlayer.current) {
      let streamToUse = null;
      if (isLocal && localScreenShareStream && localScreenShareStream.getAudioTracks().length > 0) {
        streamToUse = new MediaStream([localScreenShareStream.getAudioTracks()[0]]);
        audioPlayer.current.muted = true; // Local echo prevention
      } else if (!isLocal && screenShareOn && screenShareAudioStream?.track) {
        streamToUse = new MediaStream([screenShareAudioStream.track]);
        audioPlayer.current.muted = false;
      }
      if (streamToUse) {
        console.log('Setting audio stream:', !!streamToUse.getAudioTracks().length ? 'has tracks' : 'no tracks', '(local:', isLocal, ')');
        audioPlayer.current.srcObject = streamToUse;
        audioPlayer.current.play().catch(err => console.error('Audio play error:', err));
      } else {
        console.log('No audio stream to set (screenShareOn:', screenShareOn, ', audioTrack:', !!screenShareAudioStream?.track, ')');
        audioPlayer.current.srcObject = null;
      }
    }
  }, [screenShareAudioStream, screenShareOn, isLocal, localScreenShareStream]);

  // NEW: Log remote stream details for diagnosis
  useEffect(() => {
    if (!isLocal && presenterId) {
      console.log('Remote stream check:', {
        screenShareOn,
        hasScreenShareStream: !!screenShareStream,
        videoTrackCount: screenShareStream?.getVideoTracks?.()?.length || screenShareVideoTrack ? 1 : 0,
        audioTrack: !!screenShareAudioStream?.track,
        presenterId
      });
    }
  }, [!isLocal, screenShareOn, screenShareStream, screenShareVideoTrack, screenShareAudioStream]);

  console.log('PresenterView - Render state:', {
    isLocal,
    localScreenShareStream: !!localScreenShareStream,
    screenShareOn,
    presenterId,
    videoTracks: localScreenShareStream?.getVideoTracks().length || 0
  });

  const showPlaceholder = !screenShareOn; // Simplified: Only if not active

  return (
    <div className="bg-gray-750 rounded m-2 relative overflow-hidden w-full" style={{ height }}>
      <audio playsInline controls={false} ref={audioPlayer} />

      <div className="video-contain absolute h-full w-full">
        {isLocal ? (
          // Local: Manual <video>
          localScreenShareStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-black flex items-center justify-center">
              <p className="text-white">Screen share loading...</p>
            </div>
          )
        ) : (
          // Remote: VideoPlayer + Fallback <video> if stream missing
          <>
            <VideoPlayer
              participantId={presenterId}
              type="share"
              containerStyle={{ height: "100%", width: "100%" }}
              className="h-full"
              classNameVideo="h-full"
            />
            {screenShareOn && screenShareVideoTrack && !screenShareStream && (
              // NEW: Fallback manual video (hides under VideoPlayer if both active)
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </>
        )}

        {/* Top banner overlay (unchanged) */}
        {isLocal && localScreenShareStream && showOverlay && (
          <div className="absolute top-4 left-4 right-4 bg-gray-750/80 backdrop-blur-sm p-3 rounded-lg flex items-center justify-between z-10 border border-white/20">
            <div className="flex items-center space-x-2">
              <ScreenShareIcon style={{ height: 20, width: 20, color: "white" }} />
              <p className="text-white text-sm font-medium">You are presenting to everyone</p>
            </div>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium ml-2"
              onClick={(e) => {
                e.stopPropagation();
                mMeeting.toggleScreenShare();
                setShowOverlay(false);
              }}
            >
              STOP
            </button>
          </div>
        )}

        {/* Bottom label */}
        <div className="bottom-2 left-2 bg-gray-750/80 p-2 absolute rounded-md flex items-center z-10">
          {!micOn ? <MicOffSmallIcon fillcolor="white" /> : micOn && isActiveSpeaker ? <SpeakerIcon /> : null}
          <p className="text-sm text-white ml-1">
            {isLocal ? 'You are presenting' : `${nameTructed(displayName, 15)} is presenting`}
          </p>
        </div>

        {showPlaceholder && (
          <div className="h-full flex items-center justify-center z-5">
            <p className="text-white">No screen share active</p>
          </div>
        )}

        <CornerDisplayName
          {...{ isLocal, displayName, micOn, webcamOn: false, isPresenting: true, participantId: presenterId, isActiveSpeaker }}
        />
      </div>
    </div>
  );
}