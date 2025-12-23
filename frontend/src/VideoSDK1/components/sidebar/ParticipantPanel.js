import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useMemo } from "react";
import MicOffIcon from "../../icons/ParticipantTabPanel/MicOffIcon";
import MicOnIcon from "../../icons/ParticipantTabPanel/MicOnIcon";
import RaiseHand from "../../icons/ParticipantTabPanel/RaiseHand";
import VideoCamOffIcon from "../../icons/ParticipantTabPanel/VideoCamOffIcon";
import VideoCamOnIcon from "../../icons/ParticipantTabPanel/VideoCamOnIcon";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { nameTructed } from "../../utils/helper";

function ParticipantListItem({ participantId, raisedHand }) {
  const { micOn, webcamOn, displayName, isLocal } =
    useParticipant(participantId);

  return (
    <div className="p-2 hover:bg-gray-50 border-b border-gray-100">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {isLocal ? 'You' : nameTructed(displayName, 15)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {raisedHand && (
            <div className="text-yellow-500">
              <RaiseHand />
            </div>
          )}
          <div className={!micOn ? 'text-red-500' : 'text-gray-500'}>
            {micOn ? <MicOnIcon className="h-4 w-4" /> : <MicOffIcon className="h-4 w-4" />}
          </div>
          <div className={!webcamOn ? 'text-red-500' : 'text-gray-500'}>
            {webcamOn ? <VideoCamOnIcon className="h-4 w-4" /> : <VideoCamOffIcon className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParticipantPanel({ panelHeight }) {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;
  
  // Calculate height for the participant list (panel height - header height)
  const listHeight = panelHeight - 60; // 60px for header

  const sortedRaisedHandsParticipants = useMemo(() => {
    const participantIds = [...participants.keys()];

    const notRaised = participantIds.filter(
      (pID) =>
        raisedHandsParticipants.findIndex(
          ({ participantId: rPID }) => rPID === pID
        ) === -1
    );

    const raisedSorted = raisedHandsParticipants.sort((a, b) => {
      if (a.raisedHandOn > b.raisedHandOn) {
        return -1;
      }
      if (a.raisedHandOn < b.raisedHandOn) {
        return 1;
      }
      return 0;
    });

    const combined = [
      ...raisedSorted.map(({ participantId: p }) => ({
        raisedHand: true,
        participantId: p,
      })),
      ...notRaised.map((p) => ({ raisedHand: false, participantId: p })),
    ];

    return combined;
  }, [raisedHandsParticipants, participants]);

  const filterParticipants = (sortedRaisedHandsParticipants) =>
    sortedRaisedHandsParticipants;

  const part = useMemo(
    () => filterParticipants(sortedRaisedHandsParticipants, participants),

    [sortedRaisedHandsParticipants, participants]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {participants && participants.size > 0 ? (
          [...participants.keys()].map((participantId) => (
            <ParticipantListItem
              key={participantId}
              participantId={participantId}
              raisedHand={raisedHandsParticipants.find(
                ({ participantId: pID }) => pID === participantId
              )}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No participants</p>
          </div>
        )}
      </div>
    </div>
  );
}
