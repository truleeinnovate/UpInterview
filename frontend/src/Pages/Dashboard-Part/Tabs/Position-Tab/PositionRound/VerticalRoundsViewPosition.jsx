import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Edit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PositionRoundCard from './PositionRoundCard';
import { Button } from '../../CommonCode-AllTabs/ui/button';

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

  // Toggle round expansion
const toggleRound = (roundId) => {
  setExpandedRounds(prev => {
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
        <div key={round._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  {round.roundTitle}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  {/* <span className="mr-2">{round.interviewType}</span> */}
                  <span>•</span>
                  <span className="mx-2">{round.interviewMode}</span>
                </div>
              </div>
            </div>
            <div 
            
            className='flex items-center space-x-4'>
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
