import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { config } from "../config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomIdFromUrl = searchParams.get("roomId");
  const isInviteJoin = Boolean(roomIdFromUrl);

  const [meetingLink, setMeetingLink] = useState(
    roomIdFromUrl
      ? `${window.location.origin}/meeting/${roomIdFromUrl}`
      : ""
  );
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- CREATE MEETING ----------------
  const createMeeting = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.REACT_APP_API_URL}/create-meeting`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.roomId) return alert("Failed to create meeting");

      const link = `${window.location.origin}/meeting/${data.roomId}`;
      setMeetingLink(link);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- JOIN MEETING ----------------
  const joinMeeting = () => {
    if (!name) return alert("Enter your name");

    const linkToUse = meetingLink;
    if (!linkToUse) return alert("Meeting link missing");

    navigate(`/meeting/${meetingLink.split("/").pop()}`, {
      state: { name }
    });
  };

  return (
    <div className="p-10 font-sans max-w-xl mx-auto">
      {/* CREATE MEETING UI (ONLY if not invite link) */}
      {!isInviteJoin && (
        <>
          <button
            onClick={createMeeting}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>

          {meetingLink && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg">
              <p className="font-bold mb-2">Meeting Link</p>
              <a
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {meetingLink}
              </a>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(meetingLink)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => window.open(meetingLink, "_blank")}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Open Meeting
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* NAME + JOIN (COMMON FOR BOTH CASES) */}
      {(meetingLink || isInviteJoin) && (
        <div className="mt-6">
          <label className="block mb-2 font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />

          <button
            onClick={joinMeeting}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Join Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
