/* eslint-disable react/prop-types */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import RoundCard from './RoundCard';
import PropTypes from 'prop-types';

const VerticalRoundsView = ({
  rounds,
  onEditRound,
  currentRoundId,
  onChangeRound
}) => {

  console.log("handleEditRound",currentRoundId);
  
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);
  
  // Track expanded state for the current round
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Find current round index
  const currentIndex = sortedRounds.findIndex(round => round._id === currentRoundId);
  const currentRound = sortedRounds[currentIndex];
  
  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      onChangeRound(sortedRounds[currentIndex - 1]._id);
      setIsExpanded(false); // Expand the new round
    }
  };
  
  const goToNext = () => {
    if (currentIndex < sortedRounds.length - 1) {
      onChangeRound(sortedRounds[currentIndex + 1]._id);
      setIsExpanded(false); // Expand the new round
    }
  };

  if (!currentRound) {
    return <div className="text-center py-8 text-gray-500">No round selected</div>;
  }

  console.log("currentRound", currentRound);
  

  return (
    <div className="space-y-4">
      {/* Navigation Controls */}
      <div className="flex justify-between items-center ">
        <button
          onClick={goToPrevious}
          disabled={currentIndex <= 0}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md  ${
            currentIndex > 0 
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous Round
        </button>
        
        <div className="text-sm text-gray-500">
          Round {currentIndex + 1} of {sortedRounds.length}
        </div>
        
        <button
          onClick={goToNext}
          disabled={currentIndex >= sortedRounds.length - 1}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md  ${
            currentIndex < sortedRounds.length - 1
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Next Round
          <ChevronRight className="h-5 w-5 ml-1" />
        </button>
      </div>

      {/* Current Round Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
     
        {/* <div className="flex justify-between items-center p-4 hover:bg-gray-50">
          <div 
            className="flex items-center flex-1 min-w-0 cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
          
            
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {currentRound.roundName}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="">{currentRound.interviewType}</span>
             
                <span className="">{currentRound.interviewMode}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEditRound(currentRound)}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-custom-blue  rounded-md"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </button>
     
          </div>
        </div> */}

        {/* Round Details (conditionally shown) */}
        {/* {isExpanded && ( */}
          {/* <div className="border-t border-gray-200">
            <div className="p-4 pt-3"> */}
              <RoundCard
                round={currentRound}
                onEdit={() => onEditRound(currentRound)} 
                isActive={true}
                hideHeader={true}
              />
            {/* </div>
          </div> */}
        {/* )} */}
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