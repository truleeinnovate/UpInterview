// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   MeetingProvider,
// } from "@videosdk.live/react-sdk";
// import MeetingRoom from "./MeetingRoom";

// export default function JoinMeeting() {
//   const { roomId } = useParams();

//   const [name, setName] = useState("");
//   const [token, setToken] = useState(null);
//   const [joined, setJoined] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Fetch token ONLY after clicking Join
//   const joinMeeting = async () => {
//     if (!name.trim()) {
//       alert("Enter your name");
//       return;
//     }

//     setLoading(true);

//     const res = await fetch("http://localhost:5000/get-meeting-token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ roomId }),
//     });

//     const data = await res.json();
//     setToken(data.token);
//     setJoined(true);
//     setLoading(false);
//   };

//   // 🔹 PRE-JOIN SCREEN
//   if (!joined) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <div className="p-6 border rounded w-80">
//           <h2 className="text-xl font-bold mb-4">Join Meeting</h2>

//           <input
//             type="text"
//             placeholder="Enter your name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full px-3 py-2 border rounded mb-4"
//           />

//           <button
//             onClick={joinMeeting}
//             disabled={loading}
//             className="w-full px-4 py-2 bg-green-600 text-white rounded"
//           >
//             {loading ? "Joining..." : "Join Meeting"}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // 🔹 ACTUAL MEETING
//   return (
//     <MeetingProvider
//       token={token}
//       config={{
//         meetingId: roomId,
//         name,
//         micEnabled: true,
//         webcamEnabled: true,
//       }}
//     >
//       <MeetingRoom />
//     </MeetingProvider>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { VideoSDK } from "@videosdk.live/js-sdk";

const JoinMeeting = () => {
  const meetingRef = useRef(null);
  const [token, setToken] = useState(null);

  const roomId = window.location.pathname.split("/").pop();
  console.log("Joining room:", roomId);

  useEffect(() => {
    fetch("http://localhost:5000/get-meeting-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ JOIN TOKEN RECEIVED:", data.token);
        setToken(data.token);
      });
  }, []);

  useEffect(() => {
    if (!token) return;

    console.log("🚀 Initializing VideoSDK with token");

    meetingRef.current = VideoSDK.initMeeting({
      meetingId: roomId, // 🔥 MUST MATCH CREATED ROOM
      name: "User",
      micEnabled: true,
      webcamEnabled: true,
      token,
    });

    meetingRef.current.join();

    meetingRef.current.on("meeting-joined", () => {
      console.log("✅ Meeting joined");
    });

    meetingRef.current.on("participant-joined", (p) => {
      console.log("👤 Participant:", p.id);
    });
  }, [token]);

  return <div>Joining meeting...</div>;
};

export default JoinMeeting;
