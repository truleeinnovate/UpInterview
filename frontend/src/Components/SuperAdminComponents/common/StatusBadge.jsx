// v1.0.0 - Ashok - improved responsiveness
// v1.0.1 - Ashok - updated colors
// v1.0.2 - Ashok - added colors

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
      case "normal":
      case "scheduled":
        return "bg-custom-blue/10 text-custom-blue rounded-full px-2 py-1 font-semibold";
      case "pending":
      case "awaiting":
        return "bg-support px-2 py-1 rounded-full font-semibold";
      case "submitted":
      case "payment_pending":
      case "draft":
      case "assigned":
      case "contacted":
      case "hold":
      case "expired":
      case "in_progress":
      case "in progress":
      case "inprogress":
      case "medium":
        return "badge-warning px-2 py-1 rounded-full font-semibold";
      case "inactive":
      case "failed":
      case "rejected":
      case "overdue":
      case "error":
      case "cancelled":
      case "close":
      case "closed":
      case "blacklisted":
      case "high":
        return "badge-error";
      default:
        return "badge-neutral px-2 py-1 rounded-full font-semibold";
    }
  };

  return (
    <span className={`text-xs ${getStatusClass()}`}>{text || status}</span>
  );
}

export default StatusBadge;
