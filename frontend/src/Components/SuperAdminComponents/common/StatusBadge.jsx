// v1.0.0 - Ashok - improved responsiveness

function StatusBadge({ status, text }) {
  const getStatusClass = () => {
    const normalizedStatus = (status || "").toLowerCase();
    switch (normalizedStatus) {
      case "active":
      case "completed":
      case "resolved":
      case "approved":
      case "paid":
      case "success":
      case "hire":
      case "created":
      case "accepted":
      case "opened":
        return "badge-success";
      case "pending":
      case "in_progress":
      case "in progress":
      case "inprogress":
      case "awaiting":
        return "bg-secondary px-2 py-1 rounded-full";
      case "submitted":
      case "payment_pending":
      case "draft":
      case "assigned":
      case "contacted":
      case "hold":
      case "expired":
        return "badge-warning";
      case "inactive":
      case "failed":
      case "rejected":
      case "overdue":
      case "error":
      case "cancelled":
      case "close":
      case "closed":
      case "blacklisted":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  // v1.0.0 <----------------------------------------------------------------------
  return <span className={`sm:text-xs ${getStatusClass()}`}>{text || status}</span>;
  // v1.0.0 ---------------------------------------------------------------------->
}

export default StatusBadge;
