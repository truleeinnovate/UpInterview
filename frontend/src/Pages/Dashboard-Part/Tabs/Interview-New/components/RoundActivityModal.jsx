import React from "react";
import { createPortal } from "react-dom";
import { Activity, Clock, XCircle } from "lucide-react";

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black bg-opacity-40"
        onClick={onClose}
      />
      <div className="w-full max-w-xl h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Round Activity</h3>
            <p className="text-xs text-gray-500">
              {interviewData?.candidateId?.FirstName}{" "}
              {interviewData?.candidateId?.LastName} - {round?.roundTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {historyEntries.length === 0 ? (
            <div className="text-sm text-gray-500">
              No activity recorded for this round yet.
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="rounded-xl border border-blue-100 bg-blue-50/70 shadow-sm"
                  >
                    <div className="flex items-start justify-between px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                          <Activity className="h-4 w-4" />
                          <span>{entry?.action || "Activity"}</span>
                        </div>
                        {scheduledAt && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>Scheduled At: {scheduledAt}</span>
                          </div>
                        )}
                        {createdAtDisplay && (
                          <div className="text-xs text-gray-500">
                            Logged At: {createdAtDisplay}
                          </div>
                        )}
                        {entry?.createdBy && (
                          <div className="text-xs text-gray-500">
                            By User ID: {String(entry.createdBy).slice(-6)}
                          </div>
                        )}
                        {participants.length > 0 && (
                          <div className="text-[11px] text-gray-600">
                            Participants: {joinedCount}/{participants.length} joined
                          </div>
                        )}
                        {interviewers.length > 0 && (
                          <div className="text-[11px] text-gray-600">
                            Interviewers: {interviewers.length}
                          </div>
                        )}
                      </div>
                      {entry?.action && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {entry.action}
                        </span>
                      )}
                    </div>
                    {hasDetails && (
                      <div className="px-4 py-3 bg-blue-50 text-xs text-gray-700 border-t border-blue-100 space-y-1">
                        {reasonLabel && (
                          <div>
                            <span className="font-medium text-gray-500">Reason:</span>
                            <span className="ml-1">{reasonLabel}</span>
                          </div>
                        )}
                        {entry?.comment && (
                          <div>
                            <span className="font-medium text-gray-500">Comment:</span>
                            <span className="ml-1">{entry.comment}</span>
                          </div>
                        )}
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
