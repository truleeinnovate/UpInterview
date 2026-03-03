import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participantIds.length < 4
        ? 1
        : participantIds.length < 9
          ? 2
          : 3
      : participantIds.length < 5
        ? 2
        : participantIds.length < 7
          ? 3
          : participantIds.length < 9
            ? 4
            : participantIds.length < 10
              ? 3
              : participantIds.length < 11
                ? 4
                : 4;

  return (
    <div className="w-full h-full p-0.5 flex items-center justify-center">
      <div
        className="w-full h-full grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(participantIds.length, perRow)}, 1fr)`,
          gridAutoRows: '1fr',
        }}
      >
        {participantIds.map((participantId) => (
          <div
            key={`participant_${participantId}`}
            className="w-full h-full relative overflow-hidden"
          >
            <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden">
              <MemoizedParticipant
                participantId={participantId}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
      JSON.stringify(nextProps.participantIds) &&
      prevProps.isPresenting === nextProps.isPresenting
    );
  }
);
