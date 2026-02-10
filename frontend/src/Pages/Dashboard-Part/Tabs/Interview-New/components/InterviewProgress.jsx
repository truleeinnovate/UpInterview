// v1.0.0 - Ashok - Improved responsiveness

import React from "react";
// import PropTypes from 'prop-types';
import { CheckCircle, Clock, XCircle, Circle, ThumbsDown } from "lucide-react";

const InterviewProgress = ({
  rounds,
  interviewId,
  currentRoundId,
  viewMode = "horizontal",
  // onSelectRound
}) => {
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  const getStatusIcon = (round) => {
    console.log("round", round.status);
    switch (round?.status) {
      // Active/In-Progress statuses
      case "Draft":
        return <Circle className="h-5 w-5 text-gray-400" />;
      case "RequestSent":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "Scheduled":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "InProgress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "Rescheduled":
        return <Clock className="h-5 w-5 text-blue-400" />;

      // Completed statuses
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Selected":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Evaluated":
        return <CheckCircle className="h-5 w-5 text-green-700" />;
      case "FeedbackSubmitted":
        return <CheckCircle className="h-5 w-5 text-teal-500" />;

      // Pending statuses
      case "FeedbackPending":
        return <Circle className="h-5 w-5 text-yellow-500" />;
      case "Pending":
        return <Circle className="h-5 w-5 text-yellow-500" />;
      case "InCompleted":
      case "InComplete":
        return <Circle className="h-5 w-5 text-yellow-600" />;

      // Negative statuses
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "NoShow":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "Skipped":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case "Rejected":
        return <ThumbsDown className="h-5 w-5 text-purple-500" />;

      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusColor = (round, isCurrent) => {
    if (isCurrent) return "bg-blue-100 border-blue-500";

    switch (round?.status) {
      // Active/In-Progress statuses
      case "Draft":
        return "bg-gray-100 border-gray-400";
      case "RequestSent":
        return "bg-orange-50 border-orange-200";
      case "Scheduled":
        return "bg-blue-50 border-blue-200";
      case "InProgress":
        return "bg-blue-100 border-blue-300";
      case "Rescheduled":
        return "bg-blue-100 border-blue-400";

      // Completed statuses
      case "Completed":
        return "bg-green-50 border-green-200";
      case "Selected":
        return "bg-teal-50 border-teal-200";
      case "Evaluated":
        return "bg-green-100 border-green-400";
      case "FeedbackSubmitted":
        return "bg-teal-100 border-teal-300";

      // Pending statuses
      case "FeedbackPending":
        return "bg-yellow-50 border-yellow-300";
      case "InCompleted":
      case "InComplete":
        return "bg-yellow-50 border-yellow-200";

      // Negative statuses
      case "Cancelled":
        return "bg-red-50 border-red-200";
      case "NoShow":
        return "bg-red-100 border-red-300";
      case "Skipped":
        return "bg-gray-100 border-gray-300";
      case "Rejected":
        return "bg-purple-50 border-purple-200";

      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    // v1.0.0 <----------------------------------------------------------------------
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center min-w-max">
        {sortedRounds.map((round, index) => {
          const isCurrent = round._id === currentRoundId;
          const isLast = index === sortedRounds.length - 1;

          return (
            <React.Fragment key={round._id}>
              <button
                // onClick={() => onSelectRound(round._id)}
                className={`flex items-center sm:px-1 sm:py-1 px-3 py-2 rounded-md border ${getStatusColor(
                  round,
                  isCurrent
                )} transition-colors duration-200 hover:bg-opacity-80`}
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center text-xs w-6 h-6 rounded-full bg-white border border-gray-200 sm:mr-0 mr-2">
                    {index + 1}
                  </span>
                  {/* v1.0.0 <------------------------------------------- */}
                  <div className="ml-2 mr-2">
                    {getStatusIcon(round)}
                  </div>
                  <span className="text-sm font-medium mr-2">
                    {round.roundTitle}
                  </span>
                  {/* v1.0.0 -------------------------------------------> */}
                </div>
              </button>

              {!isLast && (
                <div className="sm:w-3 sm:h-0.5 sm:mx-0.5 mx-2 h-1 w-8 bg-gray-300"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
    // v1.0.0 ---------------------------------------------------------------------->
  );
};

// InterviewProgress.propTypes = {
//   rounds: PropTypes.arrayOf(PropTypes.shape({
//     _id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     status: PropTypes.oneOf(['Completed', 'Scheduled', 'Cancelled', 'Rejected', 'Pending']).isRequired,
//     sequence: PropTypes.number.isRequired
//   })).isRequired,
//   interviewId: PropTypes.string.isRequired,
//   currentRoundId: PropTypes.string,
//   viewMode: PropTypes.oneOf(['horizontal', 'vertical']),
//   onSelectRound: PropTypes.func.isRequired
// };

export default InterviewProgress;
