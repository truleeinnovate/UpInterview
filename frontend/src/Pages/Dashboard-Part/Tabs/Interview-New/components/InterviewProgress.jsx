import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Clock, XCircle, Circle, ThumbsDown } from 'lucide-react';

const InterviewProgress = ({ 
  rounds, 
  interviewId,
  currentRoundId,
  viewMode = 'horizontal',
  onSelectRound
}) => {
  
  // Sort rounds by sequence
  const sortedRounds = [...rounds].sort((a, b) => a.sequence - b.sequence);
  
  const getStatusIcon = (round) => {
    switch (round.status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Scheduled':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Rejected':
        return <ThumbsDown className="h-5 w-5 text-purple-500" />;
      case 'Pending':
        return <Circle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusColor = (round, isCurrent) => {
    if (isCurrent) return 'bg-blue-100 border-blue-500';
    
    switch (round.status) {
      case 'Completed':
        return 'bg-green-50 border-green-200';
      case 'Scheduled':
        return 'bg-blue-50 border-blue-200';
      case 'Cancelled':
        return 'bg-red-50 border-red-200';
      case 'Rejected':
        return 'bg-purple-50 border-purple-200';
      case 'Pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center min-w-max">
        {sortedRounds.map((round, index) => {
          const isCurrent = round.id === currentRoundId;
          const isLast = index === sortedRounds.length - 1;
          
          return (
            <React.Fragment key={round._id}>
              <button 
                onClick={() => onSelectRound(round._id)}
                className={`flex items-center px-3 py-2 rounded-md border ${getStatusColor(round, isCurrent)} transition-colors duration-200 hover:bg-opacity-80`}
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 mr-2">
                    {index + 1}
                  </span>
                  <div className="mr-2">{getStatusIcon(round)}</div>
                  <span className="text-sm font-medium">{round.roundTitle}</span>
                </div>
              </button>
              
              {!isLast && (
                <div className="mx-2 h-1 w-8 bg-gray-300"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
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
