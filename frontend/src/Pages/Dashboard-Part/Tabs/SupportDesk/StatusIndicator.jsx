/* eslint-disable react/prop-types */
import { FaCheckCircle, FaCircle } from "react-icons/fa";

function StatusIndicator({ currentStatus }) {
  const statusSteps = ["", "New", "Assigned", "Inprogress", "Resolved", "Close"];
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  return (
    <div className="flex justify-center items-center w-full  mx-auto mt-8 mb-8">
      {statusSteps.map((step, index) => (
        <div key={step || `step-${index}`} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center relative">
            {/* Status Circle */}
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                index === 0
                  ? "border-teal-600" // Default first circle
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
              ) : index < currentStepIndex ? (
                <FaCheckCircle className="text-teal-600 h-5 w-5 text-base" />
              ) : index === currentStepIndex ? (
                <div className="h-5 w-5 rounded-full bg-orange-500"></div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-300"></div>
              )}
            </div>
          </div>

          {/* Connecting Line */}
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
                  index < currentStepIndex - 1
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

export default StatusIndicator;
