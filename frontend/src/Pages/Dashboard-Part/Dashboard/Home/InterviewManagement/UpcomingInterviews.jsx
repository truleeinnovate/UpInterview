// src/components/dashboard/InterviewerSchedule.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Briefcase,
  Hash,
  Video
} from "lucide-react";
import { parse, isValid, addMinutes, subMinutes, isAfter } from "date-fns";
import MeetPlatformBadge from "../../../../../utils/MeetPlatformBadge/meetPlatformBadge";
import { useUpcomingRoundsForInterviewer } from "../../../../../apiHooks/useUpcomingRoundsForInterviews";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { createJoinMeetingUrl } from "../../../Tabs/Interview-New/components/joinMeeting";
import { useSingleContact } from "../../../../../apiHooks/useUsers";

// Helper to extract only start time from "start - end" format
const formatStartDateTime = (dateTimeString) => {
  if (!dateTimeString) return "To be scheduled";
  const startPart = dateTimeString.split(" - ")[0].trim();
  return startPart;
};

const InterviewerSchedule = () => {
  const navigate = useNavigate();

  const { data: upcomingRounds = [], isLoading } = useUpcomingRoundsForInterviewer();
  const { singleContact } = useSingleContact();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (upcomingRounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % upcomingRounds.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [upcomingRounds.length]);

  const getStatusDetails = (status) => {
    switch (status) {
      case "Confirmed":
      case "Scheduled":
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          icon: <CheckCircle size={16} />,
        };
      case "Pending":
      case "Reschedule":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          icon: <Clock size={16} />,
        };
      case "Cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: <XCircle size={16} />,
        };
      default:
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: <XCircle size={16} />,
        };
    }
  };

  const handleJoinClick = (round) => {
    if (!round) return;

    const isMock = round.type === "mockinterview";
    const type = isMock ? "mockinterview" : "interview";

    const interviewData = {
      _id: round.interviewId || round._id,
      ownerId: round.ownerId || null,
    };

    const joinUrl = createJoinMeetingUrl(round, interviewData, singleContact.contactId, type);

    if (joinUrl) {
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Unable to generate meeting link.");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* v1.0.1 <------------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
            Upcoming Interviews
          </h2>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      {/* v1.0.1 -------------------------------------------------------------------> */}

      {/* v1.0.2 <---------------------------------------------------------------- */}
      <div className="relative h-[300px] overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Loading upcoming rounds...</p>
          </div>
        ) : upcomingRounds.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No upcoming interview rounds found.</p>
          </div>
        ) : (
          upcomingRounds.map((round, index) => {
            const statusToShow = round?.status || "Pending";
            const statusDetails = getStatusDetails(statusToShow);
            const interviewCode = round?.interviewCode || "no interview";

            // Correct mapping from new backend fields
            const isMock = round.type === "mockinterview";

            const candidateName = isMock
              ? round?.mockCandidateName || "Unknown Candidate"
              : round?.candidateName || "Unknown Candidate";

            const positionTitle = isMock
              ? round?.mockCurrentRole || "Mock Interview"
              : round?.positionTitle || "Unknown Position";

            const companyName = isMock
              ? "Mock Interview"
              : round?.companyName || "Not Specified";

            const candidateEmail = isMock
              ? "—" // mock usually no email
              : round?.candidateEmail || "no email provided";

            // ─── Join button enable/disable logic ──────────────────────────────
            let canJoin = false;
            if (round?.dateTime && (round.status === "Scheduled" || round.status === "Rescheduled") && round.meetPlatform) {
              const parts = round.dateTime.split(" - ").map(s => s.trim());

              if (parts.length !== 2) return; // invalid format

              const [startFull, endTimeOnly] = parts;

              // startFull: "19-02-2026 05:51 PM"
              const start = parse(startFull, 'dd-MM-yyyy hh:mm a', new Date());

              if (!isValid(start)) {
                console.warn(`[WARN] Invalid start time parse for round ${round._id}: ${startFull}`);
                return;
              }

              // endTimeOnly: "06:51 PM"
              // Take date from start + time from end
              const endDateStr = startFull.split(' ')[0]; // "19-02-2026"
              const endFull = `${endDateStr} ${endTimeOnly}`; // "19-02-2026 06:51 PM"

              const end = parse(endFull, 'dd-MM-yyyy hh:mm a', new Date());

              if (!isValid(end)) {
                console.warn(`[WARN] Invalid end time parse for round ${round._id}: ${endFull}`);
                return;
              }

              const now = new Date();
              const startMinus15 = subMinutes(start, 15);
              const endPlus10 = addMinutes(end, 10);

              canJoin = isAfter(now, startMinus15) && isAfter(endPlus10, now);
            }

            return (
              <div
                key={round._id}
                className={`absolute top-0 left-0 w-full p-5 border border-gray-100 rounded-xl bg-white hover:border-purple-100 hover:shadow-md transition-all duration-500
                  ${index === currentIndex
                    ? "opacity-100 translate-x-0"
                    : index < currentIndex
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0"
                  }`}
              >
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-start gap-3">
                    <div className="grid grid-cols-1 items-center gap-2">
                      {/* date and time */}
                      <div className="flex items-center gap-2 w-full">
                        <Calendar size={18} className="text-gray-400" />
                        <div className="text-sm font-medium text-gray-800">
                          {formatStartDateTime(round.dateTime)}
                        </div>
                      </div>
                      {/* Decreased width here */}
                      <div className="max-w-[100px] sm:max-w-[110px] md:max-w-[120px]">
                        <MeetPlatformBadge platform={round?.meetPlatform} />
                      </div>
                    </div>

                    {/* Right side: Platform badge + Join button side-by-side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {(round?.status === "Scheduled" ||
                        round?.status === "Rescheduled") && round?.meetPlatform && (
                          <button
                            onClick={() => canJoin && handleJoinClick(round)}
                            disabled={!canJoin}
                            className={`
                              inline-flex items-center gap-1.5
                              px-3 py-1.5
                              ${canJoin
                                ? "bg-custom-blue hover:bg-custom-blue/90 text-white cursor-pointer"
                                : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-50"}
                              text-sm font-medium
                              rounded-lg
                              transition-all duration-200
                              shadow-sm
                              whitespace-nowrap
                            `}
                          >
                            <Video size={16} />
                            Join
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-2">
                    {/* candidate name and email */}
                    <div className="flex items-center gap-2 w-56">
                      <User size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {candidateName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {candidateEmail}
                        </p>
                      </div>
                    </div>

                    {/* position title, company name */}
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {positionTitle}
                        </p>
                        <p className="text-sm text-gray-600">
                          {companyName ? companyName : "Not Specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-3">
                    {/* roundTitle, interviewMode */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.interviewMode}
                      </span>
                    </div>

                    {/* status */}
                    <div className="flex items-center gap-2">
                      {statusDetails.icon}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusDetails.bg} ${statusDetails.text}`}
                      >
                        {statusToShow === "RequestSent"
                          ? "Request Sent"
                          : statusToShow === "InProgress"
                            ? "In Progress"
                            : statusToShow === "FeedbackPending"
                              ? "Feedback Pending"
                              : statusToShow === "FeedbackSubmitted"
                                ? "Feedback Submitted"
                                : statusToShow === "NoShow"
                                  ? "No Show"
                                  : statusToShow === "InCompleted"
                                    ? "In Completed"
                                    : capitalizeFirstLetter(statusToShow)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation dots */}
      {upcomingRounds.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {upcomingRounds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-custom-blue w-4" : "bg-gray-300"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewerSchedule;