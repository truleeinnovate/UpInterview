import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

/* ---------- PARTICIPANT VIEW ---------- */
function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn, displayName } =
    useParticipant(participantId);

  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      videoRef.current.srcObject = new MediaStream([webcamStream.track]);
    }
  }, [webcamStream, webcamOn]);

  return (
    <div>
      <p>{displayName}</p>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}

/* ---------- MEETING ROOM ---------- */
function MeetingRoom() {
  const { join, participants } = useMeeting({
    onMeetingJoined: () => console.log("✅ Meeting joined"),
    onParticipantJoined: (p) =>
      console.log("👤 Participant joined:", p.displayName),
  });

  useEffect(() => {
    join();
  }, [join]);

  return (
    <div>
      {[...participants.keys()].map((id) => (
        <ParticipantView key={id} participantId={id} />
      ))}
    </div>
  );
}

/* ---------- JOIN MEETING ---------- */
export default function JoinMeeting() {
  const { roomId } = useParams();
  const location = useLocation();
  const name = location.state?.name || "Guest";

  const [token, setToken] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/get-meeting-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ TOKEN RECEIVED");
        setToken(data.token);
      });
  }, [roomId]);

  if (!token) return <div>Joining meeting...</div>;

  return (
    <MeetingProvider
      token={token}
      config={{
        meetingId: roomId,
        name,
        micEnabled: true,
        webcamEnabled: true,
      }}
    >
      <MeetingRoom />
    </MeetingProvider>
  );
}
