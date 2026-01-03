// v1.0.0 - Ashok - improved responsiveness
// v1.0.1 - Ashok - updated colors
// v1.0.2 - Ashok - added colors

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * A component that displays a status badge with a colored background and white text.
 * The color of the background is determined by the status prop.
 * The text prop is optional and defaults to the status prop.
 * @param {Object} props
 * @property {string} status - the status of the item
 * @property {string} [text] - the text to display in the badge, defaults to status
 * @returns {React.ReactElement} - a status badge component
 */
/*******  fb8416a6-2992-4904-833b-4c89a8f6e419  *******/ function StatusBadge({
  status,
  text,
}) {
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
        return "badge-support px-2 py-1 rounded-full font-semibold";
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
        return "badge-error px-2 py-1 rounded-full font-semibold";
      case "credited":
        return "badge-success px-2 py-1 rounded-full font-semibold";
      default:
        return "badge-neutral px-2 py-1 rounded-full font-semibold";
    }
  };

  return (
    <span className={`text-xs ${getStatusClass()}`}>
      {text === "InProgress" || status === "InProgress"
        ? "In Progress"
        : text || status}
    </span>
  );
}

export default StatusBadge;
