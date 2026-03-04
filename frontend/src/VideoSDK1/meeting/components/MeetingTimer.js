// MeetingTimer.js - Auto-end call after grace period with countdown notifications
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { notify } from "../../../services/toastService";
import { useInterviews } from "../../../apiHooks/useInterviews";
import { extractUrlData } from "../../../apiHooks/useVideoCall";
import { useLocation } from "react-router-dom";
import { useMockInterviewById, useUpdateRoundStatus } from "../../../apiHooks/useMockInterviews";

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
    const { leave } = useMeeting();
    const { updateRoundStatus, useInterviewDetails } = useInterviews();
    const updateMockRoundStatus = useUpdateRoundStatus();
    // Countdown state for last 5 min visual overlay
    const [countdown, setCountdown] = useState(null); // remaining seconds

    // Refs to avoid stale closures
    const timerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const hasEndedRef = useRef(false);
    const shownNotificationsRef = useRef({});
    const location = useLocation();



    // Extract URL data once
    const urlData = useMemo(
        () => extractUrlData(location.search),
        [location.search],
    );
    const isMockInterview = urlData?.interviewType === "mockinterview";

    // ✅ ALWAYS call hooks
    const {
        mockInterview: mockinterview,
        isMockLoading,
        isError: isMockError,
    } = useMockInterviewById({
        mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId : null,
        enabled: isMockInterview, // ✅ THIS LINE
        // mockInterviewId: null,
    });

    const {
        data: interviewData,
        isLoading: isInterviewLoading,
        isError: interviewError,
    } = useInterviewDetails({
        roundId: !isMockInterview ? urlData.interviewRoundId : null,
        enabled: !isMockInterview,
    });

    const interviewRound =
        interviewData?.rounds?.[0] || mockinterview?.rounds?.[0] || {};

    // Robust date parser that handles:
    // 1. "24-02-2026 11:37 AM - 11:57 AM" (combined range format from RoundForm)
    // 2. "24-02-2026 11:37 AM" (DD-MM-YYYY HH:MM AM/PM)
    // 3. ISO strings
    const parseDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return null;

        // Step 1: If it contains " - ", extract only the start part
        let startPart = dateTimeStr;
        if (dateTimeStr.includes(" - ")) {
            startPart = dateTimeStr.split(" - ")[0].trim();
        }

        console.log("[MeetingTimer] Parsing start part:", startPart);

        // Step 2: Try DD-MM-YYYY HH:MM AM/PM format FIRST (e.g., "04-03-2026 07:12 PM")
        // IMPORTANT: Must check this BEFORE native Date() because Date("04-03-2026")
        // would incorrectly parse as April 3rd (MM-DD) instead of March 4th (DD-MM)
        const ddmmyyyyMatch = startPart.match(
            /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
        );
        if (ddmmyyyyMatch) {
            const [, day, month, year, hours, minutes, ampm] = ddmmyyyyMatch;
            let h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);

            if (ampm) {
                if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
                if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
            }

            const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, m);
            console.log("[MeetingTimer] DD-MM-YYYY parsed:", parsed.toLocaleString());
            if (!isNaN(parsed.getTime())) return parsed;
        }

        // Step 3: Handle YYYY-MM-DD HH:MM AM/PM format
        const yyyymmddMatch = startPart.match(
            /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
        );
        if (yyyymmddMatch) {
            const [, year, month, day, hours, minutes, ampm] = yyyymmddMatch;
            let h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);

            if (ampm) {
                if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
                if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
            }

            const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, m);
            if (!isNaN(parsed.getTime())) return parsed;
        }

        // Step 4: Fallback to native Date parse (ISO strings, etc.)
        const parsed = new Date(startPart);
        if (!isNaN(parsed.getTime())) return parsed;

        console.error("[MeetingTimer] Could not parse dateTime:", dateTimeStr);
        return null;
    };

    // Parse the scheduled end time and grace end time
    const getTimeBoundaries = useCallback(() => {
        if (!interviewRoundData) return null;

        const { dateTime, duration } = interviewRoundData;

        // Debug logging
        console.log("[MeetingTimer] interviewRoundData:", interviewRoundData);
        console.log("[MeetingTimer] dateTime:", dateTime, "| duration:", duration);

        if (!dateTime || !duration) {
            console.warn("[MeetingTimer] Missing dateTime or duration, timer disabled.");
            return null;
        }

        const startTime = parseDateTime(dateTime);
        if (!startTime) {
            console.error("[MeetingTimer] Failed to parse dateTime:", dateTime);
            return null;
        }

        // duration is stored as a string like "60" or "20" (minutes)
        const durationMinutes = parseInt(duration, 10);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            console.error("[MeetingTimer] Invalid duration:", duration);
            return null;
        }

        // Scheduled end = start + duration
        const scheduledEnd = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        // Grace end = scheduled end + 10 minutes
        const graceEnd = new Date(scheduledEnd.getTime() + 10 * 60 * 1000);

        // 10 min before scheduled end
        const tenMinWarning = new Date(scheduledEnd.getTime() - 10 * 60 * 1000);

        // 5 min before grace end (= scheduled end + 5 min)
        const fiveMinCountdown = new Date(graceEnd.getTime() - 5 * 60 * 1000);

        console.log("[MeetingTimer] Time boundaries:", {
            startTime: startTime.toLocaleString(),
            scheduledEnd: scheduledEnd.toLocaleString(),
            graceEnd: graceEnd.toLocaleString(),
            tenMinWarning: tenMinWarning.toLocaleString(),
            fiveMinCountdown: fiveMinCountdown.toLocaleString(),
            now: new Date().toLocaleString(),
        });

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
    const endMeeting = useCallback(async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        notify.critical("⏰ Meeting ended. Closing call...");

        // Build the payload based on status
        const payload = {
            roundId: interviewRound?._id,
            action: "Completed",
            reasonCode: "Automatic Call Ended"
        };

        try {
            // Update round status FIRST (before ending the meeting)
            if (isMockInterview) {
                const mockId =
                    mockinterview?._id ||
                    (typeof interviewRound?.mockInterviewId === "object"
                        ? interviewRound?.mockInterviewId?._id
                        : interviewRound?.mockInterviewId);

                await updateMockRoundStatus.mutateAsync({
                    mockInterviewId: mockId,
                    roundId: interviewRound?._id,
                    payload,
                });
            } else {
                await updateRoundStatus(payload);
            }
            console.log("[MeetingTimer] Round status updated successfully");
        } catch (error) {
            console.error("[MeetingTimer] Error updating round status:", error);
        }

        // Leave the meeting cleanly — don't use end() as it triggers internal
        // mediasoup "queue stopped" errors. leave() disconnects gracefully.
        try {
            leave();
        } catch (e) {
            console.log("[MeetingTimer] Leave cleanup:", e?.message || e);
        }

        // Show the leave screen — NO reload needed (reload would cause a loop)
        setIsMeetingLeft(true);
    }, [leave, setIsMeetingLeft, isMockInterview, updateMockRoundStatus, updateRoundStatus, interviewRound, mockinterview]);

    // Main timer logic
    useEffect(() => {
        const boundaries = getTimeBoundaries();
        console.log("[MeetingTimer] useEffect fired, boundaries:", boundaries ? "RESOLVED" : "NULL");
        if (!boundaries) return;

        const { scheduledEnd, graceEnd, tenMinWarning, fiveMinCountdown } = boundaries;

        const checkTime = () => {
            const now = new Date();
            const nowMs = now.getTime();
            const c1 = nowMs >= graceEnd.getTime();
            const c2 = nowMs >= fiveMinCountdown.getTime() && nowMs < graceEnd.getTime();
            const c3 = nowMs >= scheduledEnd.getTime() && nowMs < fiveMinCountdown.getTime();
            const c4 = nowMs >= tenMinWarning.getTime() && nowMs < scheduledEnd.getTime();
            console.log("[MeetingTimer] checkTime:", now.toLocaleTimeString(),
                "| c1(autoEnd):", c1, "| c2(countdown):", c2, "| c3(grace):", c3, "| c4(10min):", c4,
                "| shown:", JSON.stringify(shownNotificationsRef.current),
                "| nowMs:", nowMs, "| schedEndMs:", scheduledEnd.getTime(), "| diff:", nowMs - scheduledEnd.getTime());

            // 1. Auto-end when grace period expires
            if (c1) {
                console.log("[MeetingTimer] >>> AUTO-ENDING MEETING");
                endMeeting();
                return;
            }

            // 2. Last 5 minutes countdown (grace period - last 5 min)
            if (c2) {
                const remainingMs = graceEnd.getTime() - nowMs;
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
            if (c3) {
                if (!shownNotificationsRef.current.graceStarted) {
                    shownNotificationsRef.current.graceStarted = true;
                    console.log("[MeetingTimer] >>> FIRING: Grace period started");
                    notify.meetingAlert("Grace period started (10 min)");
                }
                return;
            }

            // 4. 10 minutes remaining before scheduled end
            if (c4) {
                if (!shownNotificationsRef.current.tenMinWarning) {
                    shownNotificationsRef.current.tenMinWarning = true;
                    console.log("[MeetingTimer] >>> FIRING: 10 min warning");
                    notify.meetingAlert("10 minutes remaining before scheduled end time.");
                }
                return;
            }

            // None of the conditions matched
            console.log("[MeetingTimer] NO CONDITION MATCHED!");
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
