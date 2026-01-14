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

export default StatusBadge;
