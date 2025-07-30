/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import RoundCard from "./RoundCard";

const VerticalRoundsView = ({ rounds, onEditRound }) => {
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Track expanded rounds
  const [expandedRounds, setExpandedRounds] = useState({});

  useEffect(() => {
    if (sortedRounds.length > 0) {
      setExpandedRounds({ [sortedRounds[0]._id]: true });
    }
  }, [rounds]);

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
    <div className="space-y-4">
      {sortedRounds.map((round, index) => (
        <div
          key={round._id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 hover:bg-gray-50">
            <div
              className="flex items-center flex-1"
              onClick={() => toggleRound(round._id)}
              style={{ cursor: "pointer" }}
            >
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
              {/* <button
                onClick={() => onEditRound(round)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-custom-blue hover:text-custom-blue/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit 
              </button> */}
              {/* <button 
              // onClick={() => toggleRound(round._id)} 
              // className="p-1"> */}
              {isExpanded(round._id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
              {/* </button> */}
            </div>
          </div>

          {isExpanded(round._id) && (
            <div className="px-4 pb-4">
              <RoundCard
                round={round}
                onEdit={() => onEditRound(round)}
                hideHeader={true}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerticalRoundsView;
