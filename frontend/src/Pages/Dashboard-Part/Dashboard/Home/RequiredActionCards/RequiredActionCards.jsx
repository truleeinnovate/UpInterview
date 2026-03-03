"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom";
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
} from "lucide-react"

const BRAND = "rgb(33, 121, 137)"
const BRAND_LIGHT = "rgba(33, 121, 137, 0.08)"
const BRAND_BORDER = "rgba(33, 121, 137, 0.2)"

const feedbackPending = [
  {
    id: "fb-1",
    interviewId: "INT-1001",
    candidate: "John Doe",
    role: "Backend Developer",
    round: "Technical Round 2",
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "fb-2",
    interviewId: "INT-1005",
    candidate: "Alice Wang",
    role: "Data Engineer",
    round: "System Design",
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 19 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "fb-3",
    interviewId: "INT-1008",
    candidate: "Marcus Johnson",
    role: "DevOps Engineer",
    round: "Cultural Fit",
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 23 * 60 * 60 * 1000),
    status: "pending",
  },
]

const upcomingInterviews = [
  {
    id: "ui-1",
    interviewId: "INT-1012",
    candidate: "Sarah Lee",
    role: "Frontend Engineer",
    round: "Technical Round 1",
    startsAt: new Date(Date.now() + 10 * 60 * 1000),
    meetingLink: "#",
  },
  {
    id: "ui-2",
    interviewId: "INT-1015",
    candidate: "David Kim",
    role: "Product Manager",
    round: "Behavioral",
    startsAt: new Date(Date.now() + 25 * 60 * 1000),
    meetingLink: "#",
  },
]

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function timeUntil(date) {
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000)
  if (seconds <= 0) return "now"
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d`
}

function SlaCountdown({ deadline }) {
  const [remaining, setRemaining] = useState("")
  const [urgency, setUrgency] = useState("normal")

  const update = useCallback(() => {
    const ms = deadline.getTime() - Date.now()
    if (ms <= 0) {
      setRemaining("Overdue")
      setUrgency("critical")
      return
    }
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    setRemaining(`${hours}h ${minutes}m left`)
    setUrgency(hours < 4 ? "warning" : "normal")
  }, [deadline])

  useEffect(() => {
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [update])

  const colorMap = {
    normal: "text-muted-foreground",
    warning: "text-amber-600",
    critical: "text-red-600",
  }

  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${colorMap[urgency]}`}>
      <Clock className="h-3 w-3" />
      SLA: {remaining}
    </span>
  )
}

function JoinCountdown({ startsAt, onExpire }) {
  const [minutesLeft, setMinutesLeft] = useState(null)

  useEffect(() => {
    function calc() {
      const ms = startsAt.getTime() - Date.now()
      if (ms <= 0) {
        onExpire?.()
        return
      }
      setMinutesLeft(Math.ceil(ms / (1000 * 60)))
    }
    calc()
    const interval = setInterval(calc, 30000)
    return () => clearInterval(interval)
  }, [startsAt, onExpire])

  if (minutesLeft === null || minutesLeft <= 0) return null

  return (
    <span
      variant="secondary"
      className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full text-amber-700 bg-amber-50 border border-amber-200"
    >
      <Clock className="h-3 w-3 mr-1" />
      Starts in {minutesLeft} min
    </span>
  )
}

function FeedbackCard({ item, onDismiss }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return null

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow" style={{ borderColor: BRAND_BORDER }}>
      <div
        className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold mt-0.5"
        style={{ backgroundColor: BRAND }}
      >
        {item.candidate.split(" ").map(n => n[0]).join("")}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {item.role} &ndash; {item.candidate}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Briefcase className="h-3 w-3" />
              {item.round}
              <span className="text-border">|</span>
              <CalendarClock className="h-3 w-3" />
              Completed {timeAgo(item.completedAt)}
            </p>
          </div>
          <SlaCountdown deadline={item.slaDeadline} />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            className="flex items-center gap-2 text-xs px-4 py-1 rounded-sm font-semibold bg-custom-blue hover:bg-custom-blue/90 text-white"
            onClick={() => setSubmitted(true)}
          >
            <MessageSquarePlus className="h-3 w-3" />
            Submit Feedback
          </button>
          <Link to={`/interviews/${item.interviewId}`}>
            <button className="flex items-center gap-2 px-4 py-1 rounded-sm font-semibold border border-gray-400 text-xs bg-transparent">
              View Details
              <ChevronRight className="h-3 w-3" />
            </button>
          </Link>
        </div>
      </div>

      <button
        onClick={() => onDismiss(item.id)}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function UpcomingInterviewCard({ item, onExpire }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
      style={{ borderColor: "rgba(245, 158, 11, 0.3)", backgroundColor: "rgba(245, 158, 11, 0.03)" }}
    >
      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold mt-0.5 bg-amber-500">
        <Video className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Interview Starting Soon
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {item.candidate}
              <span className="text-border">|</span>
              <Briefcase className="h-3 w-3" />
              {item.role}
              <span className="text-border">|</span>
              {item.round}
            </p>
          </div>
          <JoinCountdown startsAt={item.startsAt} onExpire={onExpire} />
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
  )
}

export function ActionRequiredCards() {
  const [dismissedFeedback, setDismissedFeedback] = useState([])
  const [expiredInterviews, setExpiredInterviews] = useState([])

  const visibleFeedback = feedbackPending.filter(f => !dismissedFeedback.includes(f.id))
  const visibleUpcoming = upcomingInterviews.filter(u => !expiredInterviews.includes(u.id))

  const totalActions = visibleFeedback.length + visibleUpcoming.length

  if (totalActions === 0) return null

  return (
    <div className="border-border overflow-hidden mb-8">
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ backgroundColor: BRAND_LIGHT, borderColor: BRAND_BORDER }}
      >
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center text-white"
          style={{ backgroundColor: BRAND }}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">Action Required</h2>
          <span
            className="text-xs text-white px-1.5 py-0"
            style={{ backgroundColor: BRAND }}
          >
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
                <MessageSquarePlus className="h-4 w-4" style={{ color: BRAND }} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Feedback Pending
                </h3>
                <div variant="secondary" className="text-xs h-5 px-1.5">
                  {visibleFeedback.length}
                </div>
              </div>
              <div className="space-y-3">
                {visibleFeedback.map(item => (
                  <FeedbackCard
                    key={item.id}
                    item={item}
                    onDismiss={(id) => setDismissedFeedback(prev => [...prev, id])}
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
              <div className="space-y-3">
                {visibleUpcoming.map(item => (
                  <UpcomingInterviewCard
                    key={item.id}
                    item={item}
                    onExpire={() => setExpiredInterviews(prev => [...prev, item.id])}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
