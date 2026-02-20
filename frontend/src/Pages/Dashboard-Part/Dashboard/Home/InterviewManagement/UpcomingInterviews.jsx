// src/components/dashboard/InterviewerSchedule.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Briefcase,
  Video
} from "lucide-react";
import { parse, isValid, addMinutes, subMinutes, isAfter } from "date-fns";
import MeetPlatformBadge from "../../../../../utils/MeetPlatformBadge/meetPlatformBadge";
import { useUpcomingRoundsForInterviewer } from "../../../../../apiHooks/useUpcomingRoundsForInterviews";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { createJoinMeetingUrl } from "../../../Tabs/Interview-New/components/joinMeeting";
import { useSingleContact } from "../../../../../apiHooks/useUsers";

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
  const carouselRef = useRef(null);
  const intervalRef = useRef(null); // Stable ref for interval ID

  // Limit to max 3 upcoming rounds for carousel
  const displayedRounds = upcomingRounds.slice(0, 3);

  useEffect(() => {
    if (displayedRounds.length <= 1) {
      // Clear interval if ≤1 item
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start auto-slide
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayedRounds.length);
    }, 3500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayedRounds.length]);

  // Pause on hover
  useEffect(() => {
    const container = carouselRef.current;
    if (!container || displayedRounds.length <= 1) return;

    const pause = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const resume = () => {
      if (displayedRounds.length > 1 && !intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % displayedRounds.length);
        }, 3500);
      }
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayedRounds.length]);

  const getStatusDetails = (status) => {
    switch (status) {
      case "Confirmed":
      case "Scheduled":
      case "Completed":
        return { bg: "bg-green-100", text: "text-green-600", icon: <CheckCircle size={16} /> };
      case "Pending":
      case "Reschedule":
        return { bg: "bg-yellow-100", text: "text-yellow-600", icon: <Clock size={16} /> };
      case "Cancelled":
        return { bg: "bg-red-100", text: "text-red-600", icon: <XCircle size={16} /> };
      default:
        return { bg: "bg-red-100", text: "text-red-600", icon: <XCircle size={16} /> };
    }
  };

  const handleJoinClick = (round) => {
    if (!round) return;

    const isMock = round.type === "mockinterview";
    const type = isMock ? "mockinterview" : "interview";

    const interviewData = {
      _id: round.interviewId || round._id,
    };

    const joinUrl = createJoinMeetingUrl(round, interviewData, singleContact?.contactId, type);

    if (joinUrl) {
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Unable to generate meeting link.");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Interviews</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div ref={carouselRef} className="relative h-[300px] overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : displayedRounds.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No upcoming interviews found.</p>
          </div>
        ) : (
          displayedRounds.map((round, index) => {
            const statusToShow = round?.status || "Pending";
            const statusDetails = getStatusDetails(statusToShow);

            const isMock = round.type === "mockinterview";

            const candidateName = isMock
              ? round?.mockCandidateName || "Mock Candidate"
              : round?.candidateName || "Unknown Candidate";

            const positionTitle = isMock
              ? round?.mockCurrentRole || "Mock Interview"
              : round?.positionTitle || "Not Specified";

            const companyName = isMock
              ? "—"  // No company for mock
              : round?.companyName || "Not Specified";

            const interviewTypeLabel = isMock ? "Mock Interview" : "Real Interview";

            let canJoin = false;
            if (round?.dateTime && (round.status === "Scheduled" || round.status === "Rescheduled") && round.meetPlatform) {
              const parts = round.dateTime.split(" - ").map(s => s.trim());
              if (parts.length !== 2) return null;

              const [startFull, endTimeOnly] = parts;
              const start = parse(startFull, 'dd-MM-yyyy hh:mm a', new Date());

              if (!isValid(start)) return null;

              let end = parse(`${startFull.split(' ')[0]} ${endTimeOnly}`, 'dd-MM-yyyy hh:mm a', new Date());

              if (!isValid(end)) {
                const period = startFull.split(' ').pop();
                const fallbackEnd = `${startFull.split(' ')[0]} ${endTimeOnly} ${period}`;
                end = parse(fallbackEnd, 'dd-MM-yyyy hh:mm a', new Date());
                if (!isValid(end)) return null;
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
                  ${index === currentIndex ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}
              >
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-start gap-3">
                    <div className="grid grid-cols-1 items-center gap-2">
                      <div className="flex items-center gap-2 w-full">
                        <Calendar size={18} className="text-gray-400" />
                        <div className="text-sm font-medium text-gray-800">
                          {formatStartDateTime(round.dateTime)}
                        </div>
                      </div>
                      <div className="max-w-[120px]">
                        <MeetPlatformBadge platform={round?.meetPlatform} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {(round?.status === "Scheduled" || round?.status === "Rescheduled") && round?.meetPlatform && (
                        <button
                          onClick={() => canJoin && handleJoinClick(round)}
                          disabled={!canJoin}
                          className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap
                          ${canJoin ? "bg-custom-blue hover:bg-custom-blue/90 text-white cursor-pointer" : "bg-gray-400 text-gray-200 cursor-not-allowed opacity-50"}
                        `}
                        >
                          <Video size={16} />
                          Join
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-2">
                    {/* Candidate name – no email anymore */}
                    <div className="flex items-center gap-2 w-56">
                      <User size={18} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-800">{candidateName}</p>
                    </div>

                    {/* Position & Company */}
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{capitalizeFirstLetter(positionTitle)}</p>
                        <p className="text-sm text-gray-600">{companyName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle || "Round"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.interviewMode || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {statusDetails.icon}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusDetails.bg} ${statusDetails.text}`}
                      >
                        {capitalizeFirstLetter(statusToShow)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-custom-blue rounded-lg text-xs font-medium">
                        {interviewTypeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {displayedRounds.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {displayedRounds.map((_, index) => (
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