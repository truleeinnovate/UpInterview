// v1.0.0 - Ashok - Improved responsiveness

/* eslint-disable react/prop-types */
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoundCard from "./RoundCard";

const VerticalRoundsView = ({
  rounds,
  onEditRound,
  currentRoundId,
  onChangeRound,
}) => {
  console.log("handleEditRound", currentRoundId);

  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);

  // Track expanded state for the current round
  // const [isExpanded, setIsExpanded] = useState(true);

  // Find current round index
  const currentIndex = sortedRounds.findIndex(
    (round) => round._id === currentRoundId
  );
  const currentRound = sortedRounds[currentIndex];

  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      onChangeRound(sortedRounds[currentIndex - 1]._id);
      // setIsExpanded(false); // Expand the new round
    }
  };

  const goToNext = () => {
    if (currentIndex < sortedRounds.length - 1) {
      onChangeRound(sortedRounds[currentIndex + 1]._id);
      // setIsExpanded(false); // Expand the new round
    }
  };

  if (!currentRound) {
    return (
      <div className="text-center py-8 text-gray-500">No round selected</div>
    );
  }

  console.log("currentRound", currentRound);

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      {/* v1.0.0 <--------------------------------------------------------------- */}
      <div className="flex justify-between items-center ">
        <button
          onClick={goToPrevious}
          disabled={currentIndex <= 0}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md  ${
            currentIndex > 0
              ? "text-gray-700 hover:bg-gray-100"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="sm:hidden inline">Previous Round</span>
        </button>

        <div className="text-sm text-gray-500">
          Round {currentIndex + 1} of {sortedRounds.length}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex >= sortedRounds.length - 1}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md  ${
            currentIndex < sortedRounds.length - 1
              ? "text-gray-700 hover:bg-gray-100"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <span className="sm:hidden inline">Next Round</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      {/* v1.0.0 ---------------------------------------------------------------> */}

      {/* Current Round Card */}

      {/* Round Details (conditionally shown) */}
      {/* v1.0.0 <----------------------------------- */}
      <div className="sm:px-0 px-4 pb-4">
      {/* v1.0.0 -----------------------------------> */}
        <RoundCard
          round={currentRound}
          onEdit={() => onEditRound(currentRound)}
          isActive={true}
          hideHeader={true}
        />
      </div>
    </div>
  );
};

export default VerticalRoundsView;

// RoundCard.propTypes = {
//   round: PropTypes.shape({
//     roundName: PropTypes.string,
//     interviewType: PropTypes.string,
//     interviewMode: PropTypes.string,
//     interviewDuration: PropTypes.any,
//     instructions: PropTypes.string,
//     interviewerType: PropTypes.string,
//     assessmentTemplate: PropTypes.arrayOf(PropTypes.shape({
//       assessmentId: PropTypes.string,
//       assessmentName: PropTypes.string
//     })),
//     interviewers: PropTypes.arrayOf(PropTypes.oneOfType([
//       PropTypes.string,
//       PropTypes.shape({
//         interviewerId: PropTypes.string,
//         interviewerName: PropTypes.string
//       })
//     ])),
//     questions: PropTypes.arrayOf(PropTypes.string),
//     assessmentQuestions: PropTypes.arrayOf(PropTypes.shape({
//       sectionName: PropTypes.string,
//       questionId: PropTypes.string,
//       snapshot: PropTypes.arrayOf(PropTypes.shape({
//         questionText: PropTypes.string,
//         questionType: PropTypes.string,
//         score: PropTypes.number,
//         options: PropTypes.arrayOf(PropTypes.string),
//         correctAnswer: PropTypes.string
//       }))
//     })),
//     createdAt: PropTypes.string
//   }).isRequired,
//   isActive: PropTypes.bool,
//   hideHeader: PropTypes.bool,
//   toggleRound: PropTypes.func
// };
