"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  MessageSquarePlus,
  Video,
  Clock,
  ChevronRight,
  X,
  User,
  Briefcase,
  CalendarClock,
} from "lucide-react";
import { useFeedbacks } from "../../../../../apiHooks/useFeedbacks";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

// const BRAND = "rgb(33, 121, 137)";
const BRAND_LIGHT = "rgba(33, 121, 137, 0.08)";
const BRAND_BORDER = "rgba(33, 121, 137, 0.2)";

const upcomingInterviews = [
  {
    _id: "ui-1",
    interviewId: "INT-1012",
    candidate: "Sarah Lee",
    role: "Frontend Engineer",
    round: "Technical Round 1",
    startsAt: new Date(Date.now() + 10 * 60 * 1000),
    meetingLink: "#",
  },
  {
    _id: "ui-2",
    interviewId: "INT-1015",
    candidate: "David Kim",
    role: "Product Manager",
    round: "Behavioral",
    startsAt: new Date(Date.now() + 25 * 60 * 1000),
    meetingLink: "#",
  },
];

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function timeUntil(date) {
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
  if (seconds <= 0) return "now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d`;
}

function SlaCountdown({ deadline }) {
  const [remaining, setRemaining] = useState("");
  const [urgency, setUrgency] = useState("normal");

  const update = useCallback(() => {
    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) {
      setRemaining("Overdue");
      setUrgency("critical");
      return;
    }
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    setRemaining(`${hours}h ${minutes}m left`);
    setUrgency(hours < 4 ? "warning" : "normal");
  }, [deadline]);

  useEffect(() => {
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [update]);

  const colorMap = {
    normal: "text-muted-foreground",
    warning: "text-amber-600",
    critical: "text-red-600",
  };

  return (
    <span
      className={`text-xs font-medium flex items-center gap-1 ${colorMap[urgency]}`}
    >
      <Clock className="h-3 w-3" />
      SLA: {remaining}
    </span>
  );
}

function JoinCountdown({ startsAt, onExpire }) {
  const [minutesLeft, setMinutesLeft] = useState(null);

  useEffect(() => {
    function calc() {
      const ms = startsAt.getTime() - Date.now();
      if (ms <= 0) {
        onExpire?.();
        return;
      }
      setMinutesLeft(Math.ceil(ms / (1000 * 60)));
    }
    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [startsAt, onExpire]);

  if (minutesLeft === null || minutesLeft <= 0) return null;

  return (
    <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full text-amber-700 bg-amber-50 border border-amber-200">
      <Clock className="h-3 w-3 mr-1" />
      Starts in {minutesLeft} min
    </span>
  );
}

function FeedbackCard({ item, onDismiss }) {
  const navigate = useNavigate();

  const candidateName = item.candidateId
    ? `${capitalizeFirstLetter(item?.candidateId?.FirstName)} ${capitalizeFirstLetter(item?.candidateId?.LastName)}`
    : "Unknown Candidate";

  const roleTitle =
    capitalizeFirstLetter(item?.positionId?.title) || "Role Not Specified";
  const roundName =
    capitalizeFirstLetter(item?.roundDetails?.roundTitle) || "Interview Round";

  // Use updatedAt for completion time
  const completedDate = item?.updatedAt
    ? new Date(item?.updatedAt)
    : new Date();
  // Standard 24h SLA
  const slaDate = new Date(completedDate?.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-custom-blue/20 bg-white hover:shadow-sm transition-shadow">
      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white bg-custom-blue text-sm font-semibold mt-0.5">
        {candidateName
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center text-sm font-semibold text-gray-800 leading-tight min-w-0">
              <p className="text-gray-800 truncate max-w-[160px]">
                {roleTitle}
              </p>
              <p className="mx-1.5 text-gray-800 font-normal">&ndash;</p>
              <p className="text-gray-800 truncate max-w-[200px]">
                {candidateName}
              </p>
            </div>
            <div className="text-xs text-gray-800 mt-0.5 flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <p className="text-gray-800 truncate max-w-[200px]">
                  {roundName}
                </p>
              </div>
              <span className="text-gray-800">|</span>
              <div className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                <p>Completed {timeAgo(completedDate)}</p>
              </div>
            </div>
          </div>
          <SlaCountdown deadline={slaDate} />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() =>
              navigate(`/feedback/edit/${item._id}`, {
                state: { feedback: { ...item }, mode: "edit" },
              })
            }
            className="flex items-center gap-2 text-xs px-4 py-1 rounded-sm font-semibold bg-custom-blue hover:bg-custom-blue/90 text-white"
          >
            <MessageSquarePlus className="h-3 w-3" />
            Submit Feedback
          </button>
          <button
            onClick={() =>
              navigate(`/feedback/view/${item._id}`, {
                state: { feedback: { ...item }, mode: "view" },
              })
            }
            className="flex items-center gap-2 px-4 py-1 rounded-sm font-semibold border border-gray-400 text-xs bg-transparent"
          >
            View Details
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        onClick={() => onDismiss(item._id)}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function UpcomingInterviewCard({ item, onExpire }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
      style={{
        borderColor: "rgba(245, 158, 11, 0.3)",
        backgroundColor: "rgba(245, 158, 11, 0.03)",
      }}
    >
      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold mt-0.5 bg-amber-500">
        <Video className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Interview Starting Soon
              </p>
              <JoinCountdown startsAt={item.startsAt} onExpire={onExpire} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <p className="text-gray-800 truncate max-w-[160px]">
                  {item.candidate}
                </p>
              </div>
              <span className="text-gray-800">|</span>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <p className="text-gray-800 truncate max-w-[160px]">
                  {item.role}
                </p>
              </div>
              <span className="text-gray-800">|</span>
              <p className="text-gray-800 truncate max-w-[160px]">
                {item.round}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            size="sm"
            className="flex items-center gap-2 px-4 py-1 rounded-sm text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600"
          >
            <Video className="h-3 w-3" />
            Join Interview
          </button>
          <Link to={`/interviews/${item.interviewId}`}>
            <button className="flex items-center gap-2 px-4 py-1 rounded-sm font-semibold border border-gray-400 text-xs bg-transparent">
              View Details
              <ChevronRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActionRequiredSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50">
        <div className="h-7 w-7 rounded-md shimmer" />
        <div className="h-4 w-32 rounded shimmer" />
        <div className="h-5 w-6 rounded shimmer" />
      </div>

      <div className="p-5 space-y-8">
        {/* Section Title Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 rounded shimmer" />
            <div className="h-3 w-32 rounded shimmer" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-white"
              >
                {/* Avatar Circle */}
                <div className="h-10 w-10 rounded-full flex-shrink-0 shimmer" />

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    {/* Name/Role line */}
                    <div className="h-4 w-3/4 rounded shimmer" />
                    {/* SLA line */}
                    <div className="h-3 w-16 rounded shimmer" />
                  </div>

                  {/* Meta info line */}
                  <div className="h-3 w-1/2 rounded shimmer" />

                  {/* Buttons */}
                  <div className="flex gap-2 pt-1">
                    <div className="h-7 w-28 rounded-sm shimmer" />
                    <div className="h-7 w-28 rounded-sm shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActionRequiredCards() {
  const [filters] = useState({
    page: 0,
    limit: Infinity,
    status: ["draft"],
  });

  const { data: feedbacksResponse, isLoading } = useFeedbacks(filters);

  const draftFeedbacks = feedbacksResponse?.feedbacks || [];

  const [dismissedFeedback, setDismissedFeedback] = useState([]);
  const [expiredInterviews, setExpiredInterviews] = useState([]);

  const visibleFeedback = draftFeedbacks.filter(
    (f) => !dismissedFeedback.includes(f._id),
  );

  const visibleUpcoming = upcomingInterviews.filter(
    (u) => !expiredInterviews.includes(u._id),
  );

  const totalActions = visibleFeedback.length + visibleUpcoming.length;

  if (isLoading) return <ActionRequiredSkeleton />;
  if (totalActions === 0) return null;

  return (
    <div className="border border-gray-300 bg-white rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3 border-b border-custom-blue/10 bg-custom-blue/10"
      >
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center text-white bg-custom-blue"
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold">Action Required</h2>
          <span className="text-xs text-white px-1.5 py-1 bg-custom-blue rounded-sm">
            {totalActions}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-5">
          {/* Feedback Pending Section */}
          {visibleFeedback.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus
                  className="h-4 w-4 text-custom-blue"
                  // style={{ color: BRAND }}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Feedback Pending
                </h3>
                <div variant="secondary" className="text-xs h-5 px-1.5">
                  {visibleFeedback.length}
                </div>
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                {visibleFeedback.map((item) => (
                  <FeedbackCard
                    key={item._id}
                    item={item}
                    onDismiss={(id) =>
                      setDismissedFeedback((prev) => [...prev, id])
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Interviews Section */}
          {visibleUpcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Interviews Starting Soon
                </h3>
                <span variant="secondary" className="text-xs h-5 px-1.5">
                  {visibleUpcoming.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                {visibleUpcoming.map((item) => (
                  <UpcomingInterviewCard
                    key={item._id}
                    item={item}
                    onExpire={() =>
                      setExpiredInterviews((prev) => [...prev, item._id])
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
