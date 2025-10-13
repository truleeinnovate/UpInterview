// v1.0.0----------Venkatesh----------changes in candidate name and position first letter capital
// v1.0.1 - Ashok - Improved responsiveness

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Briefcase,
  Hash,
} from "lucide-react";
import { parse, isValid, isAfter, isToday, startOfDay } from "date-fns";
import { useInterviews } from "../../../../../apiHooks/useInterviews";

const InterviewerSchedule = () => {
  const navigate = useNavigate();
  const { interviewData } = useInterviews();
  // interviewData is get from useInterviews hook
  const interviewRounds = useMemo(() => {
    return interviewData.flatMap((interview) => {
      if (!Array.isArray(interview.rounds)) return [];
      return interview.rounds.map((round) => ({
        ...round,
        interviewCode: interview.interviewCode,
        candidateId: interview.candidateId,
        positionId: interview.positionId,
      }));
    });
  }, [interviewData]);
  const [upcomingRounds, setUpcomingRounds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (interviewRounds && interviewRounds.length > 0) {
      const now = new Date();
      const today = startOfDay(now);

      const filtered = interviewRounds.filter((round) => {
        if (!round.dateTime) return false;
        const startTime = round.dateTime.split(" - ")[0];
        const parsedStart = parse(startTime, "dd-MM-yyyy hh:mm a", new Date());
        return (
          isValid(parsedStart) &&
          (isAfter(parsedStart, today) || isToday(parsedStart))
        );
      });

      filtered.sort((a, b) => {
        const aStart = parse(
          a.dateTime.split(" - ")[0],
          "dd-MM-yyyy hh:mm a",
          new Date()
        );
        const bStart = parse(
          b.dateTime.split(" - ")[0],
          "dd-MM-yyyy hh:mm a",
          new Date()
        );
        return aStart - bStart;
      });

      setUpcomingRounds(filtered.slice(0, 3));
      setCurrentIndex(0);
    }
  }, [interviewRounds]);

  useEffect(() => {
    if (upcomingRounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % upcomingRounds.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [upcomingRounds.length]);

  const displayDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "No date available";
    try {
      const [startTime, endTime] = dateTimeStr.split(" - ");
      const parsedStart = parse(startTime, "dd-MM-yyyy hh:mm a", new Date());
      if (!isValid(parsedStart)) return "Invalid date";

      const dateOptions = { day: "numeric", month: "short", year: "numeric" };
      const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };

      return (
        <div className="flex flex-col">
          <span>{parsedStart.toLocaleString("en-US", dateOptions)}</span>
          <span className="text-sm text-gray-600">
            {parsedStart.toLocaleString("en-US", timeOptions)}
            {endTime && ` - ${endTime}`}
          </span>
        </div>
      );
    } catch {
      return "Invalid date";
    }
  };

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
      default:
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          icon: <XCircle size={16} />,
        };
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
        <button
          onClick={() => navigate("/interviewList")}
          className="flex items-center sm:space-x-1 space-x-2 bg-custom-blue text-white sm:text-xs px-3 py-1.5 sm:rounded-lg rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm font-medium">View All</span>
          <ChevronRight className="w-[18px] h-[18px]" />
        </button>
      </div>
      {/* v1.0.1 -------------------------------------------------------------------> */}

      <div className="relative h-[220px] overflow-hidden">
        {upcomingRounds.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No upcoming interview rounds found.</p>
          </div>
        ) : (
          upcomingRounds.map((round, index) => {
            const statusToShow = round.status || "Pending";
            const statusDetails = getStatusDetails(statusToShow);
            const interviewCode = round.interviewCode || "no interview";
            const candidateName = round.candidateId
              ? // <------v1.0.0----------Venkatesh----------
                `${
                  round.candidateId.FirstName &&
                  round.candidateId.FirstName.charAt(0).toUpperCase() +
                    round.candidateId.FirstName.slice(1)
                } ${
                  round.candidateId.LastName &&
                  round.candidateId.LastName.charAt(0).toUpperCase() +
                    round.candidateId.LastName.slice(1)
                }` || "Unknown Candidate"
              : "Unknown Candidate";
            const positionTitle = round.positionId?.title
              ? round.positionId?.title.charAt(0).toUpperCase() +
                round.positionId?.title.slice(1)
              : "Unknown Position";
            // ------v1.0.0----------Venkatesh---------->
            const companyName = round.positionId?.companyname || "";
            const candidateEmail =
              round.candidateId?.Email || "no email provided";

            return (
              <div
                key={round._id}
                className={`absolute top-0 left-0 w-full p-5 border border-gray-100 rounded-xl bg-white hover:border-purple-100 hover:shadow-md transition-all duration-500
                  ${
                    index === currentIndex
                      ? "opacity-100 translate-x-0"
                      : index < currentIndex
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0"
                  }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center">
                    {/* date and time */}
                    <div className="flex items-center gap-2 w-56">
                      <Calendar size={18} className="text-gray-400" />
                      <p className="font-medium text-gray-800">
                        {displayDateTime(round.dateTime)}
                      </p>
                    </div>
                    {/* interview code */}
                    <div className="flex items-center gap-2">
                      <Hash size={18} className="text-gray-400" />
                      <span className="font-medium text-custom-blue">
                        {interviewCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* candidate name and email */}
                    <div className="flex items-center gap-2 w-56">
                      <User size={18} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">
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
                        <p className="font-medium text-gray-800">
                          {positionTitle}
                        </p>
                        {companyName && (
                          <p className="text-sm text-gray-600">{companyName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* roundTitle, interviewMode */}
                    <div className="flex flex-wrap gap-2 w-56">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.interviewMode}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round?.meetPlatform}
                      </span>
                    </div>
                    {/* status */}
                    <div className="flex items-center gap-2">
                      {statusDetails.icon}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusDetails.bg} ${statusDetails.text}`}
                      >
                        {statusToShow}
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
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-custom-blue w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewerSchedule;
