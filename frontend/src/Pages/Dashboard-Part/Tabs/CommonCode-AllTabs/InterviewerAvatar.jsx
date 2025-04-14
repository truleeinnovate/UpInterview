import React from 'react';
import { User } from 'lucide-react';

function InterviewerAvatar({ interviewer, size = 'md', className = '' }) {
  // Determine size classes based on the size prop
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

  // Default values for missing properties
  const isExternal = interviewer?.isExternal || false; // Default to false if missing
  const imageUrl = interviewer?.imageUrl || null; // Default to null if missing
  const name = interviewer?.name || 'Unknown'; // Default name if missing

  // If no interviewer data is provided, show a placeholder
  if (!interviewer) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        <User className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-gray-500`} />
      </div>
    );
  }

  // For interviewers without an image
  if (!imageUrl) {
    return (
      <div
        className={`${sizeClasses} rounded-full ${
          isExternal ? 'bg-orange-100 border-orange-300' : 'bg-blue-100 border-blue-300'
        } flex items-center justify-center border ${className}`}
        title={`${name}${isExternal ? ' (Outsourced)' : ''}`}
      >
        <User
          className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} ${
            isExternal ? 'text-orange-500' : 'text-blue-500'
          }`}
        />
      </div>
    );
  }

  // For interviewers with an image
  return (
    <div
      className={`${sizeClasses} rounded-full overflow-hidden border ${
        isExternal ? 'border-orange-300' : 'border-blue-300'
      } ${className}`}
      title={`${name}${isExternal ? ' (Outsourced)' : ''}`}
    >
      <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

export default InterviewerAvatar;