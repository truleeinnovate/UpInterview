/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import RoundCard from "./RoundCard";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const VerticalRoundsView = ({ rounds, onEditRound, template }) => {
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Track expanded rounds
  const [expandedRounds, setExpandedRounds] = useState({});

  // useEffect(() => {
  //   if (sortedRounds.length > 0) {
  //     setExpandedRounds({ [sortedRounds[0]._id]: true });
  //   }
  // }, [rounds]);

  useEffect(() => {
    if (sortedRounds.length > 0) {
      const firstRoundId = sortedRounds[0]._id;

      setExpandedRounds((prev) => {
        const isAnyExpanded = Object.values(prev).some((v) => v);
        const isFirstExpanded = prev[firstRoundId];

        // Expand first round if nothing expanded or first round changed
        if (!isAnyExpanded || !isFirstExpanded) {
          return { [firstRoundId]: true };
        }

        return prev;
      });
    }
  }, [sortedRounds[0]?._id]); // Track only when first round changes

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
          key={round._id || `${round.sequence}-${index}`}
          className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
        >
          <div
            onClick={() => toggleRound(round?._id)}
            // className="flex justify-between items-center p-4 hover:bg-gray-50"
            className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
          >
            <div
              className="flex items-center "
            // onClick={() => toggleRound(round?._id)}
            // style={{ cursor: "pointer" }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-custom-blue mr-2">
                <span className="text-sm font-medium">{round?.sequence}</span>
              </div>
              <div>
                <h3
                  className="sm:text-sm md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-900"
                //  className="text-lg font-semibold text-gray-900"
                >
                  {round.roundTitle}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  {/* <span className="mr-2">{round?.interviewType}</span> */}
                  <span>•</span>
                  <span className="mx-2">
                    {capitalizeFirstLetter(round?.interviewMode)}
                  </span>
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
            <div className="sm:px-0 px-4 pb-4">
              <RoundCard
                round={round}
                onEdit={() => onEditRound(round)}
                hideHeader={true}
                template={template}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerticalRoundsView;
