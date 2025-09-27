// v1.0.0 - Ashok - modified as first round should open by default
// v1.0.1 - Ashok - fixed unique key error
// v1.0.2 - Ashok - Improved responsiveness

import React, { useState, useEffect } from "react";
// import PropTypes from 'prop-types';
import {
  // Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PositionRoundCard from "./PositionRoundCard";
// import { Button } from '../../CommonCode-AllTabs/ui/button';

const VerticalRoundsViewPosition = ({
  rounds,
  interviewData,
  canEditRound,
  onEditRound,
}) => {
  // console.log("rounds", rounds)
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Track expanded rounds
  const [expandedRounds, setExpandedRounds] = useState({});

  // v1.0.0 <-------------------------------------------------------------------
  // v1.0.1 <-------------------------------------------------------------------------------
  // Automatically expand the first round
  // useEffect(() => {
  //   if (sortedRounds.length > 0) {
  //     setExpandedRounds((prev) => {
  //       // Only set if nothing is expanded yet
  //       if (Object.keys(prev).length === 0) {
  //         return { [sortedRounds[0]._id]: true };
  //       }
  //       return prev;
  //     });
  //   }
  // }, [sortedRounds]);

  // Always expand the first round whenever the sorted list changes
  useEffect(() => {
  if (sortedRounds.length > 0) {
    const firstRoundId = sortedRounds[0]._id;

      setExpandedRounds((prev) => {
        const alreadyExpanded = Object.values(prev).some((v) => v);
        // If nothing is currently expanded OR the first round changed, expand the new first
        if (!alreadyExpanded || !prev[firstRoundId]) {
          return { [firstRoundId]: true };
        }
        return prev;
      });
    }
  }, [sortedRounds[0]?._id]); // Track the first round specifically



  // v1.0.1 ------------------------------------------------------------------------------->
  // v1.0.0 ------------------------------------------------------------------->

  // Toggle round expansion
  const toggleRound = (roundId) => {
    setExpandedRounds((prev) => {
      // If the clicked round is already expanded, close it
      if (prev[roundId]) {
        return { ...prev, [roundId]: false };
      }
      // Otherwise, close all rounds and open the clicked one
      return { [roundId]: true };
    });
  };

  // Check if a round is expanded
  const isExpanded = (roundId) => !!expandedRounds[roundId];

  return (
    <div className="space-y-4 ">
      {sortedRounds.map((round) => (
        <div
          // v1.0.1 <--------------------------------------------
          // key={round._id}
           key={`${round._id}-${round.sequence}`} // Fix applied here
          //  v1.0.1 ------------------------------------------->
          className="bg-white rounded-lg  border border-gray-200 shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleRound(round._id)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
                <span className="text-sm font-medium">{round.sequence}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {round.roundTitle}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  {/* <span className="mr-2">{round.interviewType}</span> */}
                  <span>•</span>
                  <span className="mx-2">{round.interviewMode}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* {canEditRound(round) && (
                <Button
                  onClick={() => onEditRound(round)}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Round
                </Button>
              )} */}
              {isExpanded(round._id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>

          {isExpanded(round._id) && (
            <div className="px-4 pb-4">
              <PositionRoundCard
                round={round}
                interviewData={interviewData}
                canEdit={canEditRound(round)}
                onEdit={() => onEditRound(round)}
                isActive={false}
                hideHeader={true}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// VerticalRoundsView.propTypes = {
//   rounds: PropTypes.arrayOf(PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     mode: PropTypes.string.isRequired,
//     sequence: PropTypes.number.isRequired
//   })).isRequired,
//   interviewId: PropTypes.string.isRequired,
//   canEditRound: PropTypes.func.isRequired,
//   onEditRound: PropTypes.func.isRequired
// };

export default VerticalRoundsViewPosition;
