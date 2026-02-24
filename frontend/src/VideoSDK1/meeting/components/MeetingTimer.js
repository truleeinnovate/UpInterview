// MeetingTimer.js - Auto-end call after grace period with countdown notifications
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { notify } from "../../../services/toastService";

/**
 * MeetingTimer Component
 *
 * Timeline for a meeting scheduled 12:32 PM – 1:32 PM (60 min):
 *  - 1:22 PM → notify.warning: "10 minutes remaining"
 *  - 1:32 PM → notify.critical: "Scheduled time over, grace period started"
 *  - 1:37 PM → Countdown overlay: "Call ends in 5:00" (decreasing)
 *  - 1:42 PM → Call automatically ends
 */
export function MeetingTimer({ interviewRoundData, setIsMeetingLeft }) {
    const { end } = useMeeting();

    // Countdown state for last 5 min visual overlay
    const [countdown, setCountdown] = useState(null); // remaining seconds

    // Refs to avoid stale closures
    const timerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const hasEndedRef = useRef(false);
    const shownNotificationsRef = useRef({});

    // Parse the scheduled end time and grace end time
    const getTimeBoundaries = useCallback(() => {
        if (!interviewRoundData) return null;

        const { dateTime, duration } = interviewRoundData;
        if (!dateTime || !duration) return null;

        // Parse dateTime string (can be ISO string or various date formats)
        const startTime = new Date(dateTime);
        if (isNaN(startTime.getTime())) return null;

        // duration is stored as a string like "60" (minutes)
        const durationMinutes = parseInt(duration, 10);
        if (isNaN(durationMinutes) || durationMinutes <= 0) return null;

        // Scheduled end = start + duration
        const scheduledEnd = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        // Grace end = scheduled end + 10 minutes
        const graceEnd = new Date(scheduledEnd.getTime() + 10 * 60 * 1000);

        // 10 min before scheduled end
        const tenMinWarning = new Date(scheduledEnd.getTime() - 10 * 60 * 1000);

        // 5 min before grace end (= scheduled end + 5 min)
        const fiveMinCountdown = new Date(graceEnd.getTime() - 5 * 60 * 1000);

        return {
            startTime,
            scheduledEnd,
            graceEnd,
            tenMinWarning,
            fiveMinCountdown,
            durationMinutes,
        };
    }, [interviewRoundData]);

    // Format seconds to MM:SS
    const formatTime = (totalSeconds) => {
        if (totalSeconds <= 0) return "0:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // End the meeting
    const endMeeting = useCallback(() => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        notify.critical("⏰ Meeting time has expired. Ending call...");

        try {
            end();
        } catch (error) {
            console.error("Error ending meeting:", error);
            // Fallback: just set meeting left
            if (setIsMeetingLeft) {
                setIsMeetingLeft(true);
            }
        }
    }, [end, setIsMeetingLeft]);

    // Main timer logic
    useEffect(() => {
        const boundaries = getTimeBoundaries();
        if (!boundaries) return;

        const { scheduledEnd, graceEnd, tenMinWarning, fiveMinCountdown } = boundaries;

        const checkTime = () => {
            const now = new Date();

            // 1. Auto-end when grace period expires
            if (now >= graceEnd) {
                endMeeting();
                return;
            }

            // 2. Last 5 minutes countdown (grace period - last 5 min)
            if (now >= fiveMinCountdown && now < graceEnd) {
                const remainingMs = graceEnd.getTime() - now.getTime();
                const remainingSec = Math.ceil(remainingMs / 1000);
                setCountdown(remainingSec);

                // Start countdown interval if not already running
                if (!countdownIntervalRef.current) {
                    countdownIntervalRef.current = setInterval(() => {
                        const currentNow = new Date();
                        const currentRemainingMs = graceEnd.getTime() - currentNow.getTime();
                        const currentRemainingSec = Math.ceil(currentRemainingMs / 1000);

                        if (currentRemainingSec <= 0) {
                            clearInterval(countdownIntervalRef.current);
                            countdownIntervalRef.current = null;
                            endMeeting();
                            return;
                        }

                        setCountdown(currentRemainingSec);
                    }, 1000);
                }
                return;
            }

            // 3. Scheduled time over, grace period started
            if (now >= scheduledEnd && now < fiveMinCountdown) {
                if (!shownNotificationsRef.current.graceStarted) {
                    shownNotificationsRef.current.graceStarted = true;
                    notify.critical("⚠️ Scheduled time is over. 10-minute grace period has started.");
                }
                return;
            }

            // 4. 10 minutes remaining before scheduled end
            if (now >= tenMinWarning && now < scheduledEnd) {
                if (!shownNotificationsRef.current.tenMinWarning) {
                    shownNotificationsRef.current.tenMinWarning = true;
                    notify.warning("⏰ 10 minutes remaining before scheduled end time.");
                }
                return;
            }
        };

        // Check immediately
        checkTime();

        // Then check every 5 seconds (the countdown interval handles per-second updates)
        timerRef.current = setInterval(checkTime, 5000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
    }, [getTimeBoundaries, endMeeting]);

    // Only render the countdown overlay for the last 5 minutes
    if (countdown === null) return null;

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div
                className="flex items-center gap-3 px-5 py-3 rounded-lg border-2 shadow-lg backdrop-blur-sm bg-red-50 border-red-500 transition-all duration-300"
                style={{
                    animation: "fadeInSlide 0.3s ease-out",
                    minWidth: "250px",
                }}
            >
                <svg
                    className="w-5 h-5 text-red-500 animate-pulse"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-semibold text-sm text-red-800">
                    Call ends in {formatTime(countdown)}
                </span>
            </div>

            {/* Inline animation keyframes */}
            <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}

export default MeetingTimer;
