/* eslint-disable react/prop-types */
import { FaCheckCircle, FaCircle } from "react-icons/fa";

function InterviewStatusIndicator({ currentStatus }) {
  // Define base status steps
  const getStatusSteps = (status) => {
    const baseSteps = ["", "New", "Contacted", "In Progress"];

    // Add the final status based on currentStatus
    if (status === "Active") {
      return [...baseSteps, "Active"];
    } else if (status === "InActive" || status === "Blacklisted") {
      return [...baseSteps, status];
    } else {
      return [...baseSteps, "Active/InActive"];
    }
  };

  const statusSteps = getStatusSteps(currentStatus);
  const currentStepIndex = statusSteps.indexOf(currentStatus);
  const isFinalRed =
    currentStatus === "InActive" || currentStatus === "Blacklisted";

  return (
    <div className="flex justify-center items-center w-full max-w-4xl mx-auto mb-8">
      {statusSteps.map((step, index) => (
        <div
          key={step || `step-${index}`}
          className="flex items-center flex-1 last:flex-initial"
        >
          <div className="flex flex-col items-center relative">
            {/* Status Circle */}
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                index === 0
                  ? "border-teal-600" // Default first circle
                  : isFinalRed && index === statusSteps.length - 1
                  ? "border-red-600"
                  : currentStatus === "Active" && index > 0
                  ? "border-teal-600"
                  : index < currentStepIndex
                  ? "border-teal-600"
                  : index === currentStepIndex
                  ? "border-orange-500"
                  : "border-gray-300"
              }`}
            >
              {/* First circle has no tick */}
              {index === 0 ? (
                <FaCircle className="text-teal-600 h-5 w-5 text-base" />
              ) : isFinalRed && index === statusSteps.length - 1 ? (
                <FaCheckCircle className="text-red-600 h-5 w-5 text-base" />
              ) : currentStatus === "Active" && index > 0 ? (
                <FaCheckCircle className="text-teal-600 h-5 w-5 text-base" />
              ) : index < currentStepIndex ? (
                <FaCheckCircle className="text-teal-600 h-5 w-5 text-base" />
              ) : index === currentStepIndex ? (
                <div className="h-5 w-5 rounded-full bg-orange-500"></div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-300"></div>
              )}
            </div>
          </div>

          {index < statusSteps.length - 1 && (
            <div className="relative flex-1 h-[2px] mx-2">
              {/* Text Between Circles */}
              {index >= 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
                  {statusSteps[index + 1]}
                </div>
              )}
              {/* Line */}
              <div
                className={`h-full ${
                  isFinalRed && index === statusSteps.length - 2
                    ? "bg-red-600"
                    : currentStatus === "Active"
                    ? "bg-teal-600"
                    : index < currentStepIndex - 1
                    ? "bg-teal-600"
                    : index === currentStepIndex - 1
                    ? "bg-orange-500"
                    : "bg-gray-300"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default InterviewStatusIndicator;
