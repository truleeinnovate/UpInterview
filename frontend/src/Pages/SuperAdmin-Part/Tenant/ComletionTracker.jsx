// Created by Ashok

import React from "react";
import { Check } from "lucide-react";

const CompletionTracker = ({ completionStatus, stepsToShow }) => {
  const fields = [
    { key: "basicDetails", label: "Basic Details" },
    { key: "availabilityDetails", label: "Availability Details" },
    { key: "interviewDetails", label: "Interview Details" },
    { key: "additionalDetails", label: "Additional Details" },
  ];

  const displayFields = stepsToShow ? fields.slice(0, stepsToShow) : fields;

  return (
    <div className="flex w-full max-w-3xl mx-auto mt-12 px-2 items-center relative">
      {displayFields.map((field, idx) => {
        const isCompleted = completionStatus?.[field.key];
        const isActive =
          !isCompleted &&
          Object.values(completionStatus).filter(Boolean).length === idx;
        const isLast = idx === displayFields.length - 1;
        const nextCompleted = completionStatus?.[displayFields[idx + 1]?.key];

        return (
          <div key={field.key} className="relative flex items-center justify-center flex-1">
            {/* Step */}
            <div className="flex flex-col items-center z-10">
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full border-4 flex items-center justify-center
                  shadow-lg transition-all duration-300
                  ${
                    isCompleted
                      ? "border-gradient-to-br from-green-400 to-emerald-600 bg-green-500 text-white shadow-green-400/80"
                      : isActive
                      ? "border-gradient-to-br from-gray-400 to-gray-600 bg-white text-gray-600 border-gray-400 shadow-blue-200"
                      : "border-gray-300 bg-white text-gray-400"
                  }
                  group-hover:scale-105
                `}
              >
                {isCompleted ? (
                  <Check size={24} className="transition-all drop-shadow" />
                ) : (
                  <span className="font-bold text-lg">{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-3 text-xs font-semibold text-center w-40
                  ${
                    isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "text-gray-600"
                      : "text-gray-500"
                  }
                  group-hover:scale-105
                `}
              >
                {field.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={`
                  absolute top-[1.375rem] left-[calc(50%+6px)] right-[calc(0%+10px)] h-1 w-full
                  -translate-y-1/2 transition-all duration-300 rounded
                  ${
                    isCompleted && nextCompleted
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gray-300"
                  }
                  shadow-md
                `}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CompletionTracker;
