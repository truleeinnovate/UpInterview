// v1.0.0 - Ashok - Improved responsiveness

import React from "react";
import PropTypes from "prop-types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import RoundCard from "./RoundCard";

const SingleRoundView = ({
  rounds,
  interviewData,
  interviewId,
  currentRoundId,
  // canEditRound,
  onEditRound,
  onChangeRound,
}) => {
  console.log("SINGLE ROUND CARDS =======================================> ", rounds);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {/* v1.0.0 <------------------------------------------------- */}
        <button
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${hasPrevious
            ? "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
        >
          <ArrowLeft className="h-4 w-4 sm:mr-0 mr-1" />
          <span className="sm:hidden inline">Previous Round</span>
        </button>
        {/* v1.0.0 -------------------------------------------------> */}

        <div className="text-sm text-gray-500">
          Round {currentIndex + 1} of {sortedRounds.length}
        </div>
        {/* v1.0.0 <------------------------------------------------- */}
        <button
          onClick={goToNext}
          disabled={!hasNext}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${hasNext
            ? "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
        >
          <span className="sm:hidden inline">Next Round</span>
          <ArrowRight className="h-4 w-4 sm:ml-0 ml-1" />
        </button>
        {/* v1.0.0 -------------------------------------------------> */}
      </div>

      {/* Combined Round Header and Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
              <span className="text-sm font-medium">{currentRound?.sequence}</span>
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentRound?.roundTitle}
                </h3>
                <span
                  className={`mx-2 text-xs px-2 py-0.5 rounded-full ${currentRound?.status === "Scheduled"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : currentRound?.status === "Completed"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : currentRound?.status === "Draft"
                        ? "bg-gray-100 text-gray-800 border border-gray-400"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                >
                  {currentRound?.status === "RequestSent" ? "Request Sent" : currentRound?.status}
                </span>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="mr-2">
                  {currentRound?.interviewType?.charAt(0).toUpperCase() + currentRound?.interviewType?.slice(1)}
                </span>
                <span>•</span>
                <span className="mx-2">
                  {currentRound?.interviewMode?.charAt(0).toUpperCase() + currentRound?.interviewMode?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <RoundCard
          round={currentRound}
          interviewData={interviewData}
          interviewId={interviewId}
          // canEdit={canEditRound(currentRound)}
          onEdit={() => onEditRound(currentRound)}
          isActive={false}
          isExpanded={true}
          hideHeader={true}
        />
      </div>
    </div>
  );
};

SingleRoundView.propTypes = {
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired, // Changed from `id` to `_id`
      sequence: PropTypes.number.isRequired,
    })
  ).isRequired,
  interviewId: PropTypes.string,
  currentRoundId: PropTypes.string,
  // canEditRound: PropTypes.func,
  onEditRound: PropTypes.func,
  onChangeRound: PropTypes.func,
};

export default SingleRoundView;
