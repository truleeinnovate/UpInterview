// services/interviewerSchedulingService.js
// v1.0.0 - Venkatesh - Service to check interviewer availability using InterviewerScheduling model
// v1.0.1 - Venkatesh - Rewritten to use dedicated InterviewerScheduling collection

const { InterviewerScheduling } = require("../models/InterviewerScheduling");
const { parse } = require("date-fns");

/**
 * Parse a dateTime string like "02-03-2026 10:56 AM - 11:56 AM" into { start: Date, end: Date }
 * Format: "dd-MM-yyyy hh:mm a - hh:mm a"
 */
function parseDateTimeRange(dateTimeStr) {
    if (!dateTimeStr || typeof dateTimeStr !== "string") return null;

    try {
        const parts = dateTimeStr.split(" - ");
        if (parts.length !== 2) return null;

        const startPart = parts[0].trim(); // "02-03-2026 10:56 AM"
        const endTimePart = parts[1].trim(); // "11:56 AM"

        // Parse start datetime
        const startDate = parse(startPart, "dd-MM-yyyy hh:mm a", new Date());
        if (isNaN(startDate.getTime())) return null;

        // Extract date portion and combine with end time
        const datePortion = startPart.split(" ")[0]; // "02-03-2026"
        const endDateStr = `${datePortion} ${endTimePart}`;
        const endDate = parse(endDateStr, "dd-MM-yyyy hh:mm a", new Date());
        if (isNaN(endDate.getTime())) return null;

        return { start: startDate, end: endDate };
    } catch (error) {
        console.error(
            "[interviewerSchedulingService] Error parsing dateTime:",
            dateTimeStr,
            error.message
        );
        return null;
    }
}

/**
 * Check if two time ranges overlap.
 * Two ranges [s1, e1] and [s2, e2] overlap if s1 < e2 AND s2 < e1
 */
function doTimesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

// ─── Active statuses where the interviewer is considered "booked" ────
const ACTIVE_STATUSES = ["Scheduled", "InProgress", "Rescheduled"];

/**
 * Get the set of interviewer contact IDs that are already booked
 * at the given scheduled time.
 *
 * @param {string} scheduledDateTimeStr - "02-03-2026 10:56 AM - 11:56 AM"
 * @returns {Set<string>} - Set of booked contact ID strings
 */
async function getBookedInterviewerIds(scheduledDateTimeStr) {
    const bookedIds = new Set();

    const requested = parseDateTimeRange(scheduledDateTimeStr);
    if (!requested) {
        console.warn(
            "[interviewerSchedulingService] Could not parse scheduledDateTime:",
            scheduledDateTimeStr
        );
        return bookedIds;
    }

    // Query all active scheduling records
    const activeSlots = await InterviewerScheduling.find({
        status: { $in: ACTIVE_STATUSES },
    })
        .select("interviewerId dateTime")
        .lean();

    for (const slot of activeSlots) {
        const slotTime = parseDateTimeRange(slot.dateTime);
        if (!slotTime) continue;

        // Check overlap
        if (
            doTimesOverlap(
                requested.start,
                requested.end,
                slotTime.start,
                slotTime.end
            )
        ) {
            bookedIds.add(slot.interviewerId.toString());
        }
    }

    return bookedIds;
}

/**
 * Create scheduling records for interviewers when a round is scheduled.
 * Call this when a round is created/updated with interviewers and dateTime.
 *
 * @param {string} roundId - The round ObjectId
 * @param {string[]} interviewerIds - Array of contact IDs
 * @param {string} dateTime - "02-03-2026 10:56 AM - 11:56 AM"
 * @param {string} [reason] - Optional reason
 */
async function createSchedulingRecords(roundId, interviewerIds, dateTime, reason = "") {
    if (!roundId || !interviewerIds?.length || !dateTime) return;

    const records = interviewerIds.map((interviewerId) => ({
        interviewerId,
        roundId,
        dateTime,
        status: "Scheduled",
        reason,
    }));

    // Remove any existing records for this round first (in case of reschedule)
    await InterviewerScheduling.deleteMany({ roundId });

    // Insert new records
    await InterviewerScheduling.insertMany(records);
    console.log(
        `[interviewerSchedulingService] Created ${records.length} scheduling records for round ${roundId}`
    );
}

/**
 * Update scheduling record status when a round status changes.
 *
 * @param {string} roundId - The round ObjectId
 * @param {string} newStatus - New status (Completed, Cancelled, NoShow, etc.)
 * @param {string} [reason] - Optional reason for status change
 */
async function updateSchedulingStatus(roundId, newStatus, reason = "") {
    if (!roundId || !newStatus) return;

    const updateData = { status: newStatus };
    if (reason) updateData.reason = reason;

    const result = await InterviewerScheduling.updateMany(
        { roundId },
        { $set: updateData }
    );
    console.log(
        `[interviewerSchedulingService] Updated ${result.modifiedCount} scheduling records for round ${roundId} to status: ${newStatus}`
    );
}

module.exports = {
    getBookedInterviewerIds,
    createSchedulingRecords,
    updateSchedulingStatus,
    parseDateTimeRange,
};
