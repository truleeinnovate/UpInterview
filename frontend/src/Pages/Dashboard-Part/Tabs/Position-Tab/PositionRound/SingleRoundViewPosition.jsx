// v1.0.0 - Ashok - Improved responsiveness
import React from "react";
import PropTypes from "prop-types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PositionRoundCard from "./PositionRoundCard";

const SingleRoundViewPosition = ({
  rounds,
  interviewId,
  currentRoundId,
  canEditRound,
  onEditRound,
  onChangeRound,
}) => {
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Find the current round index
  const currentIndex = sortedRounds.findIndex(
    (round) => round._id === currentRoundId
  );

  // Get the current round
  const currentRound = sortedRounds[currentIndex];

  // Determine if we have previous or next rounds
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sortedRounds.length - 1;

  // Get previous and next round IDs
  const previousRoundId = hasPrevious
    ? sortedRounds[currentIndex - 1]._id
    : null;
  const nextRoundId = hasNext ? sortedRounds[currentIndex + 1]._id : null;

  // Handle navigation
  const goToPrevious = () => {
    if (hasPrevious && previousRoundId) {
      onChangeRound(previousRoundId);
    }
  };

  const goToNext = () => {
    if (hasNext && nextRoundId) {
      onChangeRound(nextRoundId);
    }
  };

  if (!currentRound) {
    return <div className="text-center py-8">No round selected</div>;
  }

  // v1.0.0 <---------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className={`inline-flex items-center px-3 py-2  shadow-sm text-sm font-medium rounded-md ${
            hasPrevious
              ? "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
              : "text-gray-400 bg-gray-100 cursor-not-allowed"
          }`}
        >
          {/* <ArrowLeft className="h-4 w-4 mr-1" /> */}
          <ArrowLeft className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
          <span className="sm:hidden inline">Previous Round</span>
        </button>

        <div className="text-sm text-gray-500">
          Round {currentIndex + 1} of {sortedRounds.length}
        </div>

        <button
          onClick={goToNext}
          disabled={!hasNext}
          className={`inline-flex items-center px-3 py-2   shadow-sm text-sm font-medium rounded-md ${
            hasNext
              ? "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
              : "text-gray-400 bg-gray-100 cursor-not-allowed"
          }`}
        >
          <span className="sm:hidden inline">Next Round</span>
          {/* <ArrowRight className="h-4 w-4 ml-1" /> */}
          <ArrowRight className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
        </button>
      </div>
      {/* {sortedRounds.map((round) => (
      <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
                <span className="text-sm font-medium">{round.sequence}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{round.roundName
                }</h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <span className="mr-2">{round.interviewType}</span>
                  <span>•</span>
                  <span className="mx-2">{round.interviewMode}</span>
                </div>
              </div>
            </div>


))} */}

      <div className="sm:px-2 px-4 pb-4">
        <PositionRoundCard
          round={currentRound}
          interviewId={interviewId}
          canEdit={canEditRound(currentRound)}
          onEdit={() => onEditRound(currentRound)}
          isActive={true}
        />
      </div>
    </div>
  );
  // v1.0.0 --------------------------------------------------------------->
};

SingleRoundViewPosition.propTypes = {
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      sequence: PropTypes.number.isRequired,
    })
  ).isRequired,
  interviewId: PropTypes.string,
  currentRoundId: PropTypes.string,
  canEditRound: PropTypes.func,
  onEditRound: PropTypes.func,
  onChangeRound: PropTypes.func,
};

export default SingleRoundViewPosition;
