// using for timestamp created at and updated at
export const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
  
    const date = new Date(timestamp);
  
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // ensures 24-hour format
    }).format(date);
  };
  