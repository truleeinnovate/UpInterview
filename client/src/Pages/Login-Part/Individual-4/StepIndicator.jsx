import React from 'react';
import { useLocation } from 'react-router-dom';

const StepIndicator = ({ currentStep }) => { // Accept currentStep as a prop
  const location = useLocation();
  const { Freelancer } = location.state || {};
  const completed = Array(4).fill(false).map((_, index) => index < currentStep); // Mark steps as completed up to currentStep

  const steps = [
    { name: 'Basic Details', path: '/signup/basic-details', icon: 'user' },
    { name: 'Additional Details', path: '/signup/additional-details', icon: 'briefcase' },
    { name: 'Interview Details', path: '/signup/interview-details', icon: 'chat' },
    { name: 'Availability', path: '/signup/availability', icon: 'calendar' },
  ];

  return (
    <div>
      <div className="block mb-7 md:flex xl:flex lg:flex 2xl:flex items-center justify-center py-3 md:space-x-5 xl:space-x-5 lg:space-x-5 2xl:space-x-5">
        <div className="flex items-center justify-center space-x-2 mr-2">
          {steps
            .filter((_, index) => Freelancer || index < 2) // Show all steps for Freelancer, only 2 for non-Freelancer
            .map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 transform
                    ${currentStep === index
                      ? 'bg-orange-500 text-white scale-110 ring-2 ring-orange-100'
                      : completed[index]
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {index + 1}
                </div>
                {/* Arrow */}
                {index < (Freelancer ? steps.length - 1 : 1) && (
                  <div className="flex-shrink-0 mx-2">
                    <svg
                      className={`w-5 h-5 ${currentStep === index ? '' : 'text-gray-300'}`}
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