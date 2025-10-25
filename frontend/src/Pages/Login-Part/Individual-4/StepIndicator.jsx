import React from 'react';
import { useLocation } from 'react-router-dom';

const StepIndicator = ({ currentStep, showLimitedSteps, isInternalInterviewer, completed }) => {
    const location = useLocation();
    const { Freelancer } = location.state || {};

    // Determine which steps to show
    const showAllSteps = Freelancer || isInternalInterviewer;
    const stepsToShow = showLimitedSteps ? 2 : showAllSteps ? 4 : 2;

    // Map the object-based completed status to an array: [basic, additional, interview, availability]
    // Default to false if undefined (handles partial objects or missing keys)
    const completedArray = [
        completed?.basicDetails || false,
        completed?.additionalDetails || false,
        completed?.interviewDetails || false,
        completed?.availabilityDetails || false,
    ].slice(0, stepsToShow);  // Slice to match visible steps

    const steps = [
        { name: 'Basic Details', path: '/signup/basic-details', icon: 'user' },
        { name: 'Additional Details', path: '/signup/additional-details', icon: 'briefcase' },
        { name: 'Interview Details', path: '/signup/interview-details', icon: 'chat' },
        { name: 'Availability', path: '/signup/availability', icon: 'calendar' },
    ];

    // Helper to determine if the connection (arrow) between step index and index+1 is completed
    const isConnectionCompleted = (index) => completedArray[index];

    // Helper for arrow color: blue if previous completed, orange if current is active here, else yellow
    const getArrowColor = (index) => {
        if (currentStep === index + 1) return 'text-orange-500'; // Connecting to current
        if (isConnectionCompleted(index)) return 'text-custom-blue'; // Completed
        return 'text-yellow-400'; // Pending (light yellow variant for icons)
    };

    return (
        <div>
            <div className="block mb-7 md:flex xl:flex lg:flex 2xl:flex items-center justify-center py-3 md:space-x-5 xl:space-x-5 lg:space-x-5 2xl:space-x-5">
                <div className="flex items-center justify-center space-x-2 mr-2">
                    {steps
                        .slice(0, stepsToShow) // Only show the required number of steps
                        .map((step, index) => (
                            <React.Fragment key={index}>
                                <div
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 transform
                    ${currentStep === index
                                            ? 'bg-orange-500 text-white scale-110 ring-2 ring-orange-100'  // In progress: Orange
                                            : completedArray[index]
                                                ? 'bg-custom-blue text-white'  // Completed: Custom blue
                                                : 'bg-yellow-50 text-yellow-500 ring-2 ring-yellow-100'  // Not completed: Light yellow
                                        }
                  `}
                                >
                                    {index + 1}
                                </div>
                                {/* Arrow - only show if not the last step */}
                                {index < stepsToShow - 1 && (
                                    <div className="flex-shrink-0 mx-2">
                                        <svg
                                            //   className={`w-5 h-5 ${getArrowColor(index)}`}
                                            className="w-5 h-5 text-gray-400"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
