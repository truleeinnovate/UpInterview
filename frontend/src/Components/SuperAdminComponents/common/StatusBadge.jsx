function StatusBadge({ status, text }) {
  const getStatusClass = () => {
    const normalizedStatus = (status || "").toLowerCase();
    switch (normalizedStatus) {
      case "active":
      case "completed":
      case "approved":
      case "paid":
      case "success":
      case "created":
      case "accepted":
        return "badge-success";
      case "pending":
      case "in_progress":
      case "in progress":
      case "inprogress":
      case "awaiting":
      case "submitted":
      case "payment_pending":
      case "draft":
      case "new":
      case "contacted":
        return "badge-warning";
      case "inactive":
      case "failed":
      case "rejected":
      case "overdue":
      case "error":
      case "cancelled":
      case "blacklisted":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  return <span className={`${getStatusClass()}`}>{text || status}</span>;
}

export default StatusBadge;
