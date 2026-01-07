import React from "react";
import { createPortal } from "react-dom";
import { Activity, Clock, XCircle, Users, Calendar } from "lucide-react";

const RoundActivityModal = ({ isOpen, onClose, round, interviewData }) => {
  if (!isOpen) return null;

  const historyEntries = Array.isArray(round?.history)
    ? [...round.history].sort((a, b) => {
      // Sort by createdAt (schema timestamps) so newest activity appears first
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    })
    : [];

  // Same function used in VerticalRoundsView for consistent styling  
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800 border border-gray-400";
      case "RequestSent":
        return "bg-orange-50 text-orange-800 border border-orange-200";
      case "Scheduled":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "Rescheduled":
        return "bg-blue-100 text-blue-900 border border-blue-400";
      case "Completed":
        return "bg-green-50 text-green-800 border border-green-200";
      case "Cancelled":
        return "bg-red-50 text-red-800 border border-red-200";
      case "Rejected":
        return "bg-purple-50 text-purple-800 border border-purple-200";
      case "Selected":
        return "bg-teal-50 text-teal-800 border border-teal-200";
      case "InComplete":
      case "NoShow":
        return "bg-yellow-50 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const formatStatusLabel = (status) => {
    if (status === "RequestSent") return "Request Sent";
    if (status === "NoShow") return "No Show";
    if (status === "InComplete") return "Incomplete";
    return status;
  };

  const formatReasonLabel = (reason) => {
    if (!reason) return "";
    return reason
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black bg-opacity-40"
        onClick={onClose}
      />
      <div className="w-full max-w-xl h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Round Activity</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {interviewData?.candidateId?.FirstName}{" "}
              {interviewData?.candidateId?.LastName} - {round?.roundTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {historyEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Activity className="h-12 w-12 mb-3 text-gray-300" />
              <p className="text-sm">No activity recorded for this round yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyEntries.map((entry, index) => {
                const scheduledAt = entry?.scheduledAt;
                const reasonLabel = entry?.reasonCode || entry?.reason;
                const createdAtDisplay = entry?.createdAt
                  ? new Date(entry.createdAt).toLocaleString()
                  : "";
                const participants = Array.isArray(entry?.participants)
                  ? entry.participants
                  : [];
                const interviewers = Array.isArray(entry?.interviewers)
                  ? entry.interviewers
                  : [];
                const joinedCount = participants.filter(
                  (p) => p?.status === "Joined"
                ).length;

                const hasDetails = Boolean(reasonLabel || entry?.comment);

                const hasMeaningfulAction =
                  entry?.action && entry.action !== "Activity";

                const hasAnyContent =
                  Boolean(hasMeaningfulAction) ||
                  Boolean(scheduledAt) ||
                  Boolean(reasonLabel) ||
                  Boolean(entry?.comment) ||
                  participants.length > 0 ||
                  interviewers.length > 0;

                if (!hasAnyContent) {
                  return null;
                }

                return (
                  <div
                    key={entry?._id || `${scheduledAt || ""}-${index}`}
                    className="rounded-lg bg-white shadow-sm p-4"
                  >
                    {/* Title Row with Status Badge */}
                    <div className="flex justify-end items-center gap-2 mb-2">
                      {/* <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <Activity className="h-4 w-4" />
                      </div> */}

                      {entry?.action && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                            entry.action
                          )}`}
                        >
                          {formatStatusLabel(entry.action)}
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-col items-start gap-x-4 gap-y-1 text-sm text-gray-500">
                      {/* Scheduled Date/Time */}
                      {scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{scheduledAt}</span>
                        </div>
                      )}

                      {/* Interviewers */}
                      {interviewers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>Interviewers: {interviewers.length}</span>
                        </div>
                      )}

                      {/* Participants */}
                      {participants.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            Participants: {joinedCount}/{participants.length} joined
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Reason/Comment Section */}
                    {hasDetails && (
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        {reasonLabel && (
                          <div>
                            <span className="text-gray-500">Reason:</span>{" "}
                            <span>{formatReasonLabel(reasonLabel)}</span>
                          </div>
                        )}
                        {entry?.comment && (
                          <div>
                            <span className="text-gray-500">Comment:</span>{" "}
                            <span>{entry.comment}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Created At - at the end */}
                    {createdAtDisplay && (
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {createdAtDisplay}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RoundActivityModal;
