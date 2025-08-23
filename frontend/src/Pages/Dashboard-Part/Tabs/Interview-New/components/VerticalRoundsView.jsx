// v1.0.0 - Ashok - modified as first card should open by default and added optional chaining(?)
// v1.0.1 - Ashok - improved first should open by default
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import RoundCard from "./RoundCard";
import { Button } from "../../CommonCode-AllTabs/ui/button";
import { Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Calendar, XCircle } from 'lucide-react';

const VerticalRoundsView = ({
  rounds,
  interviewData,
  canEditRound,
  onEditRound,
  onInitiateAction
}) => {
  console.log('Received rounds:', rounds);
  console.log('onInitiateAction prop:', onInitiateAction);
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Track expanded rounds
  const [expandedRounds, setExpandedRounds] = useState({});

  // v1.0.1 <-------------------------------------------------------------------------------------
  // v1.0.0 <----------------------------------------------------------
  // Open first round by default
  // useEffect(() => {
  //   if (sortedRounds.length > 0) {
  //     setExpandedRounds({ [sortedRounds[0]._id]: true });
  //   }
  // }, [rounds]);

  useEffect(() => {
    console.log('Sorted Rounds:', sortedRounds);
    if (sortedRounds.length > 0) {
      setExpandedRounds(sortedRounds[0]._id);
    }
  }, [rounds]);

  // v1.0.0 ---------------------------------------------------------->

  // Toggle round expansion
  // const toggleRound = (roundId) => {
  //   setExpandedRounds((prev) => ({
  //     ...prev,
  //     [roundId]: !prev[roundId],
  //   }));
  // };

  // Check if a round is expanded
  // const isExpanded = (roundId) => !!expandedRounds[roundId];

  // Toggle round expansion (only one open at a time)
  const toggleRound = (roundId) => {
    setExpandedRounds((prev) => (prev === roundId ? null : roundId));
  };

  // Check if a round is expanded
  const isExpanded = (roundId) => expandedRounds === roundId;
  // v1.0.1 -------------------------------------------------------------------------------------->

  // v1.0.0 <----------------------------------------------------------
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  // v1.0.0 ---------------------------------------------------------->

  function getStatusBadgeColor(status) {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border border-gray-400';
      case 'RequestSent':
        return 'bg-orange-50 text-orange-800 border border-orange-200';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      case 'Rescheduled':
        return 'bg-blue-100 text-blue-900 border border-blue-400';
      case 'Completed':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'Rejected':
        return 'bg-purple-50 text-purple-800 border border-purple-200';
      case 'Selected':
        return 'bg-teal-50 text-teal-800 border border-teal-200';
      case 'InComplete':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  }

  return (
    <div className="space-y-4">
      {sortedRounds.map((round) => (
        <div
          key={round._id}
          className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleRound(round?._id)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
                <span className="text-sm font-medium">{round?.sequence}</span>
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {round?.roundTitle}
                  </h3>
                  <span className={`mx-2 text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(round?.status)}`}>
                    {capitalizeFirstLetter(round?.status)}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <span className="mr-2">
                    {capitalizeFirstLetter(round?.interviewType)}
                  </span>
                  <span>•</span>
                  <span className="mx-2">
                    {capitalizeFirstLetter(round?.interviewMode)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isExpanded(round._id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          {isExpanded(round._id) && (
            <div className="px-4 pb-4">
              <RoundCard
                round={round}
                interviewData={interviewData}
                canEdit={canEditRound(round)}
                // onEdit={() => onEditRound(round)}
                onEdit={(r, opts) => onEditRound(r, opts)}
                isActive={false}
                hideHeader={true}
                onInitiateAction={onInitiateAction}
                // isExpanded={isExpanded}
                isExpanded={isExpanded(round._id)}
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

export default VerticalRoundsView;
