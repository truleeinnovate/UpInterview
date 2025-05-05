/* eslint-disable react/prop-types */

import { User } from 'lucide-react';

function InterviewerAvatar({ interviewer, size = 'md', className = '' }) {
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6 text-xs';
      case 'lg':
        return 'h-12 w-12 text-base';
      case 'md':
      default:
        return 'h-8 w-8 text-sm';
    }
  };

  const sizeClasses = getSizeClasses(size);
  
  if (!interviewer) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        <User className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-gray-500`} />
      </div>
    );
  }

  // For external interviewers without an image
  if (interviewer.isExternal && !interviewer.imageUrl) {
    return (
      <div className={`${sizeClasses} rounded-full bg-orange-100 flex items-center justify-center border border-orange-300 ${className}`} title={`${interviewer.name} (Outsourced)`}>
        <User className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-orange-500`} />
      </div>
    );
  }

  // For internal interviewers without an image
  if (!interviewer.isExternal && !interviewer.imageUrl) {
    return (
      <div className={`${sizeClasses} rounded-full bg-blue-100 flex items-center justify-center border border-blue-300 ${className}`} title={interviewer.name}>
        <User className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-blue-500`} />
      </div>
    );
  }

  // For interviewers with an image
  return (
    <div className={`${sizeClasses} rounded-full overflow-hidden border ${interviewer.isExternal ? 'border-orange-300' : 'border-blue-300'} ${className}`} title={`${interviewer.name}${interviewer.isExternal ? ' (Outsourced)' : ''}`}>
      <img 
        src={interviewer.imageUrl} 
        alt={interviewer.name} 
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default InterviewerAvatar;