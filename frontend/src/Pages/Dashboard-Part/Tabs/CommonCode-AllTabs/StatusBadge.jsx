import React from "react";
import { Badge } from "./ui/badge";

function StatusBadge({ status, size = "md", className = "" }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case "In Progress":
      case "InProgress":
      case "Scheduled":
      case "Rescheduled":
        return "info";
      case "Completed":
      case "Selected":
      case "Opened":
        return "success";
      case "Cancelled":
      case "NoShow":
      case "InComplete":
        return "danger";
      case "Rejected":
        return "purple";
      case "Pending":
        return "warning";
      case "Draft":
        return "gray";
      case "RequestSent":
      case "Request Sent":
        return "orange";
      default:
        return "secondary";
    }
  };

  const getSizeMapping = (size) => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      case "md":
      default:
        return "default";
    }
  };

  return (
    <Badge
      variant={getStatusVariant(status)}
      size={getSizeMapping(size)}
      className={className}
    >
      {status === "RequestSent" ? "Request Sent" : status}
    </Badge>
  );
}

function getStatusBadgeColor(status) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-800 border border-gray-400";
    case "RequestSent":
      return "bg-orange-50 text-orange-800 border border-orange-200";
    case "Scheduled":
      return "bg-blue-50 text-blue-800 border border-blue-200";
    case "Rescheduled":
      return "bg-blue-100 text-blue-900 border border-blue-400";
    case "Completed":
      return "bg-green-50 text-green-800 border border-green-200";
    case "Cancelled":
      return "bg-red-50 text-red-800 border border-red-200";
    case "Rejected":
      return "bg-purple-50 text-purple-800 border border-purple-200";
    case "Selected":
      return "bg-teal-50 text-teal-800 border border-teal-200";
    case "InComplete":
      return "bg-yellow-50 text-yellow-800 border border-yellow-200";
    default:
      return "bg-gray-50 text-gray-800 border border-gray-200";
  }
}

export { StatusBadge, getStatusBadgeColor };

// export default StatusBadge;
