import { FaCheckCircle, FaCircle } from "react-icons/fa";

function InterviewStatusIndicator({ currentStatus, isExpanded }) {
  const getStatusSteps = (status) => {
    const baseSteps = ["", "New", "Contacted", "In Progress"];
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

  const circleSize = isExpanded ? "w-5 h-5" : "w-8 h-8";
  const iconSize = isExpanded ? "h-3 w-3" : "h-5 w-5";
  const textSize = isExpanded ? "text-xs" : "text-sm";

  return (
    <div className="flex justify-center items-center w-full">
      {statusSteps.map((step, index) => (
        <div
          key={step || `step-${index}`}
          className="flex items-center flex-1 last:flex-initial"
        >
          {/* Step Circle */}
          <div className="flex flex-col items-center relative">
            <div
              className={`rounded-full border-2 flex items-center justify-center ${circleSize} ${
                index === 0
                  ? "border-custom-blue"
                  : isFinalRed && index === statusSteps.length - 1
                  ? "border-red-600"
                  : currentStatus === "Active" && index > 0
                  ? "border-custom-blue"
                  : index < currentStepIndex
                  ? "border-custom-blue"
                  : index === currentStepIndex
                  ? "border-orange-500"
                  : "border-gray-300"
              }`}
            >
              {index === 0 ? (
                <FaCircle className={`text-custom-blue ${iconSize}`} />
              ) : isFinalRed && index === statusSteps.length - 1 ? (
                <FaCheckCircle className={`text-red-600 ${iconSize}`} />
              ) : currentStatus === "Active" && index > 0 ? (
                <FaCheckCircle className={`text-custom-blue ${iconSize}`} />
              ) : index < currentStepIndex ? (
                <FaCheckCircle className={`text-custom-blue ${iconSize}`} />
              ) : index === currentStepIndex ? (
                <div className={`${iconSize} rounded-full bg-orange-500`} />
              ) : (
                <div className={`${iconSize} rounded-full bg-gray-300`} />
              )}
            </div>
          </div>

          {/* Connecting line + status text */}
          {index < statusSteps.length - 1 && (
            <div className="relative flex-1 h-[2px] mx-1">
              {/* Status label between circles */}
              <div
                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-500 whitespace-nowrap ${textSize}`}
              >
                {statusSteps[index + 1]}
              </div>

              <div
                className={`h-full ${
                  isFinalRed && index === statusSteps.length - 2
                    ? "bg-red-600"
                    : currentStatus === "Active"
                    ? "bg-custom-blue"
                    : index < currentStepIndex - 1
                    ? "bg-custom-blue"
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
