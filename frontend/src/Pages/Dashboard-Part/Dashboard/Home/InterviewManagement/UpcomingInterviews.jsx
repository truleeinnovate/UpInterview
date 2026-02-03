// v1.0.0----------Venkatesh----------changes in candidate name and position first letter capital
// v1.0.1 - Ashok - Improved responsiveness
// v1.0.2 - Ashok - Fixed responsiveness issues
// v1.0.3 - Ashok - Added meeting platform icons and styles
// v1.0.4 - Ashok - Changed react icons to svg for better customization
// v1.0.5 - Ashok - Changed video platform name from Custom to Platform

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
import MeetPlatformBadge from "../../../../../utils/MeetPlatformBadge/meetPlatformBadge";

const InterviewerSchedule = () => {
  const navigate = useNavigate();
  const type = "analytics";
  const { interviewData, responseDashBoard } = useInterviews(
    {
      type: "upcoming", // Special type for upcoming interviews
      page: 1,
      limit: 10, // Get exactly 10 records as requested
      upcomingOnly: true, // Flag to indicate we want upcoming interviews
    },
    1,
    10,
    type,
  );

  console.log("interviewData InterviewerSchedule", responseDashBoard);
  // interviewData is get from useInterviews hook
  const interviewRounds = responseDashBoard?.upcomingRoundsData;

  // useMemo(() => {
  //   return interviewData.flatMap((interview) => {
  //     if (!Array.isArray(interview.rounds)) return [];
  //     return interview.rounds.map((round) => ({
  //       ...round,
  //       interviewCode: interview.interviewCode,
  //       candidateId: interview.candidateId,
  //       positionId: interview.positionId,
  //     }));
  //   });
  // }, [interviewData]);
  const [upcomingRounds, setUpcomingRounds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (interviewRounds && interviewRounds.length > 0) {
      // const now = new Date();
      // const today = startOfDay(now);

      // const filtered = interviewRounds.filter((round) => {
      //   if (!round.dateTime) return false;
      //   const startTime = round.dateTime.split(" - ")[0];
      //   const parsedStart = parse(startTime, "dd-MM-yyyy hh:mm a", new Date());
      //   return (
      //     isValid(parsedStart) &&
      //     (isAfter(parsedStart, today) || isToday(parsedStart))
      //   );
      // });

      // filtered.sort((a, b) => {
      //   const aStart = parse(
      //     a.dateTime.split(" - ")[0],
      //     "dd-MM-yyyy hh:mm a",
      //     new Date()
      //   );
      //   const bStart = parse(
      //     b.dateTime.split(" - ")[0],
      //     "dd-MM-yyyy hh:mm a",
      //     new Date()
      //   );
      //   return aStart - bStart;
      // });

      setUpcomingRounds(interviewRounds);
      setCurrentIndex(0);
    }
  }, [interviewRounds]);
  console.log("interviewRounds InterviewerSchedule", upcomingRounds);
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
          onClick={() => navigate("/interviews")}
          className="flex items-center sm:space-x-1 space-x-2 bg-custom-blue text-white sm:text-xs px-3 py-1.5 sm:rounded-lg rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm font-medium">View All</span>
          <ChevronRight className="w-[18px] h-[18px]" />
        </button>
      </div>
      {/* v1.0.1 -------------------------------------------------------------------> */}

      {/* v1.0.2 <---------------------------------------------------------------- */}
      {/* <div className="relative h-[220px] overflow-hidden"> */}
      <div className="relative h-[300px] overflow-hidden">
        {upcomingRounds.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No upcoming interview rounds found.</p>
          </div>
        ) : (
          upcomingRounds.map((round, index) => {
            const statusToShow = round?.status || "Pending";
            const statusDetails = getStatusDetails(statusToShow);
            const interviewCode = round?.interviewCode || "no interview";
            const candidateName = round?.candidate
              ? // <------v1.0.0----------Venkatesh----------
                `${
                  round?.candidate?.FirstName &&
                  round?.candidate?.FirstName.charAt(0).toUpperCase() +
                    round?.candidate?.FirstName.slice(1)
                } ${
                  round?.candidate?.LastName &&
                  round?.candidate?.LastName.charAt(0).toUpperCase() +
                    round?.candidate?.LastName.slice(1)
                }` || "Unknown Candidate"
              : "Unknown Candidate";
            const positionTitle = round?.position?.title
              ? round.position?.title?.charAt(0).toUpperCase() +
                round.position?.title?.slice(1)
              : "Unknown Position";
            // ------v1.0.0----------Venkatesh---------->
            const companyName = round.position?.companyname || "";
            const candidateEmail =
              round.candidate?.Email || "no email provided";

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
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-start gap-2">
                    <div className="grid grid-cols-1 items-center gap-2">
                      {/* date and time */}
                      <div className="flex items-center gap-2 w-full">
                        <Calendar size={18} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-800">
                          {displayDateTime(round.dateTime)}
                        </p>
                      </div>
                      {/* interview code */}
                      <div className="flex items-center gap-2">
                        <Hash size={18} className="text-gray-400" />
                        <span className="text-xs font-medium text-custom-blue">
                          {interviewCode}
                        </span>
                      </div>
                    </div>
                    {/* <span className="inline-flex items-center gap-1.5 py-1 px-2.5 text-xs">
                      {round?.meetPlatform === "googlemeet" ? (
                        <div className="flex items-center gap-2 bg-green-50 text-gray-600 px-2 py-1 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            className="h-6 w-6"
                          >
                            <g fill="none" fill-rule="evenodd">
                              <rect
                                x="8"
                                y="12"
                                width="32"
                                height="12"
                                rx="4"
                                ry="4"
                                fill="#ffe70b"
                              />

                              <rect
                                x="8"
                                y="24"
                                width="32"
                                height="12"
                                rx="4"
                                ry="4"
                                fill="#34A853"
                              />

                              <rect
                                x="8"
                                y="12"
                                width="4"
                                height="24"
                                rx="2"
                                ry="2"
                                fill="#4285F4"
                              />

                              <rect
                                x="36"
                                y="12"
                                width="4"
                                height="24"
                                rx="2"
                                ry="2"
                                fill="#34A853"
                              />

                              <rect
                                x="12"
                                y="16"
                                width="24"
                                height="16"
                                rx="3"
                                ry="3"
                                fill="#ffffff"
                              />

                              <path fill="#00f829" d="M36 20l14-4v18l-14-4z" />
                            </g>
                          </svg>

                          <strong className="text-green-600">
                            Google Meet
                          </strong>
                        </div>
                      ) : round?.meetPlatform === "zoom" ? (
                        <div className="flex items-center gap-2 bg-blue-50 text-gray-600 py-1 px-2 rounded-md">
                          <span className="inline-flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              className="w-6 h-6"
                            >
                              <circle cx="24" cy="24" r="24" fill="#2D8CFF" />
                              <path
                                fill="#fff"
                                d="M30.5 18.5v3.3l4-3.3v11l-4-3.3v3.3c0 1.1-.9 2-2 2h-9c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2z"
                              />
                            </svg>
                          </span>
                          <strong className="text-blue-600">Zoom</strong>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="#9e9e9e"
                            className="w-6 h-6"
                          >
                            <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
                          </svg>

                          <strong>Platform</strong>
                        </div>
                      )}
                    </span> */}
                    <MeetPlatformBadge platform={round?.meetPlatform} />
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
                        {/* {companyName && ( */}
                        <p className="text-sm text-gray-600">
                          {companyName ? companyName : "Not Specified"}
                        </p>
                        {/* )} */}
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
                      {/* <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round?.meetPlatform}
                      </span> */}
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
      {/* v1.0.2 ----------------------------------------------------------------> */}

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
