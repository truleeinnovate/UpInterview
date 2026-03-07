// PresenterView.js — Simplified, reliable screen sharing
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { nameTructed } from "../utils/helper";
import { CornerDisplayName } from "./ParticipantView";
import { useMeetingAppContext } from "../MeetingAppContextDef";

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;
  const { localScreenShareStream } = useMeetingAppContext();
  const [showOverlay, setShowOverlay] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  const {
    micOn,
    isLocal,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
    screenShareStream,
  } = useParticipant(presenterId || "");

  const videoRef = useRef(null);
  const audioPlayer = useRef(null);

  // Auto-hide overlay after 3s
  useEffect(() => {
    if (isLocal && presenterId) {
      setShowOverlay(true);
      const timer = setTimeout(() => setShowOverlay(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLocal, presenterId]);

  // === MAIN VIDEO ATTACHMENT EFFECT ===
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    console.log("[PresenterView] Effect running:", {
      isLocal,
      presenterId,
      hasLocalStream: !!localScreenShareStream,
      hasScreenShareStream: !!screenShareStream,
      screenShareOn,
      screenShareStreamType: screenShareStream ? typeof screenShareStream : "null",
      screenShareStreamTrack: screenShareStream?.track ? "has .track" : "no .track",
    });

    let stream = null;

    // Source 1: Local native getDisplayMedia stream (only if still active)
    if (isLocal && localScreenShareStream && localScreenShareStream.active) {
      stream = localScreenShareStream;
      console.log("[PresenterView] LOCAL: Using context stream (active)");
    }

    // === VIDEOSDK STREAM (local fallback + remote) ===
    if (!stream && screenShareStream) {
      if (screenShareStream.track) {
        // VideoSDK wraps tracks as { track: MediaStreamTrack }
        try {
          stream = new MediaStream([screenShareStream.track]);
          console.log("[PresenterView] VIDEOSDK: Created MediaStream from .track");
        } catch (e) {
          console.error("[PresenterView] Failed to create MediaStream from track:", e);
        }
      } else if (screenShareStream instanceof MediaStream) {
        stream = screenShareStream;
        console.log("[PresenterView] VIDEOSDK: Using native MediaStream");
      }
    }

    if (stream) {
      console.log("[PresenterView] Attaching stream to video element, active:", stream.active);
      el.srcObject = stream;
      // Wait for metadata to load before playing to avoid AbortError
      el.onloadedmetadata = () => {
        el.play().catch(() => { }); // Safely ignore interrupt errors
      };
      setStreamReady(true);
    } else {
      console.log("[PresenterView] No stream available yet");
      el.srcObject = null;
      setStreamReady(false);
    }

    return () => {
      // Don't clear on re-run, let next effect handle it
    };
  }, [isLocal, presenterId, localScreenShareStream, screenShareStream, screenShareOn]);

  // Audio handling
  useEffect(() => {
    if (!audioPlayer.current) return;

    if (
      isLocal &&
      localScreenShareStream &&
      typeof localScreenShareStream.getAudioTracks === "function" &&
      localScreenShareStream.getAudioTracks().length > 0
    ) {
      const audioStream = new MediaStream([localScreenShareStream.getAudioTracks()[0]]);
      audioPlayer.current.muted = true;
      audioPlayer.current.srcObject = audioStream;
      audioPlayer.current.play().catch(() => { });
    } else if (!isLocal && screenShareAudioStream?.track) {
      const audioStream = new MediaStream([screenShareAudioStream.track]);
      audioPlayer.current.muted = false;
      audioPlayer.current.srcObject = audioStream;
      audioPlayer.current.play().catch(() => { });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, isLocal, localScreenShareStream]);

  return (
    <div className="relative overflow-hidden w-full bg-black" style={{ height }}>
      <audio playsInline controls={false} ref={audioPlayer} />

      <div className="absolute h-full w-full">
        {/* Always render video — hidden until stream ready */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-contain bg-black"
          style={{ display: streamReady ? "block" : "none" }}
        />

        {/* Loading state */}
        {!streamReady && (
          <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center">
            <ScreenShareIcon style={{ height: 48, width: 48, color: "#22c55e" }} />
            <p className="text-white text-lg font-semibold mt-4">
              Screen share starting...
            </p>
          </div>
        )}

        {/* Top banner overlay */}
        {isLocal && showOverlay && (
          <div className="absolute top-4 left-4 right-4 bg-gray-750/80 backdrop-blur-sm p-3 rounded-lg flex items-center justify-between z-10 border border-white/20">
            <div className="flex items-center space-x-2">
              <ScreenShareIcon style={{ height: 20, width: 20, color: "white" }} />
              <p className="text-white text-sm font-medium">
                You are presenting to everyone
              </p>
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
          {!micOn ? (
            <MicOffSmallIcon fillcolor="white" />
          ) : isActiveSpeaker ? (
            <SpeakerIcon />
          ) : null}
        </div>

        <CornerDisplayName
          {...{
            isLocal,
            displayName: (displayName || "").split("|||")[0],
            micOn,
            webcamOn: false,
            isPresenting: true,
            participantId: presenterId,
            isActiveSpeaker,
          }}
        />
      </div>
    </div>
  );
}