import React from "react";
import { User } from "lucide-react";

function InterviewerAvatar({ interviewer, size = "md", className = "" }) {
  // Size classes
  const getSizeClasses = (size) => {
    switch (size) {
      case "sm":
        return "h-6 w-6 text-xs";
      case "md":
        return "h-8 w-8 text-sm";
      case "lg":
        return "h-9 w-9 text-base";
      case "xl":
        return "h-11 w-11 text-lg";
      case "2xl":
        return "h-14 w-14 text-xl";
      default:
        return "h-8 w-8 text-sm";
    }
  };

  // Icon size mapping
  const getIconSize = (size) => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "md":
        return "h-4 w-4";
      case "lg":
        return "h-5 w-5";
      case "xl":
        return "h-6 w-6";
      case "2xl":
        return "h-7 w-7";
      default:
        return "h-4 w-4";
    }
  };

  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  // Defaults
  const isExternal = interviewer?.isExternal || false;
  const imageUrl = interviewer?.imageUrl || null;
  const name =
    interviewer?.name ||
    `${interviewer?.firstName || ""} ${interviewer?.lastName || ""}`.trim() ||
    "Unknown";

  // No interviewer
  if (!interviewer) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-gray-200 flex items-center justify-center ${className}`}
      >
        <User className={`${iconSize} text-gray-500`} />
      </div>
    );
  }

  // No image
  if (!imageUrl) {
    return (
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center border
          ${
            isExternal
              ? "bg-orange-100 border-orange-300"
              : "bg-blue-100 border-custom-blue/10"
          } ${className}`}
        title={`${name}${isExternal ? " (Outsourced)" : ""}`}
      >
        <User
          className={`${iconSize} ${
            isExternal ? "text-orange-500" : "text-custom-blue"
          }`}
        />
      </div>
    );
  }

  // With image
  return (
    <div
      className={`${sizeClasses} rounded-full overflow-hidden border
        ${
          isExternal
            ? "border-orange-300"
            : "border-custom-blue/10"
        } ${className}`}
      title={`${name}${isExternal ? " (Outsourced)" : ""}`}
    >
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default InterviewerAvatar;
