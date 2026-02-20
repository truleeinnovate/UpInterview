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


export const formatRequestedDate = (dateValue) => {
  if (!dateValue) return "N/A";

  try {
    // If it's an ISO string (like "2026-02-20T07:47:40.169Z")
    if (dateValue.includes('T') && dateValue.includes('Z')) {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "Invalid date";

      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${day} ${month} ${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }

    // If it's already formatted (like "20 Feb 2026, 01:17 pm")
    if (dateValue.includes(',')) {
      // Convert "20 Feb 2026, 01:17 pm" to "20 Feb 2026, 01:17 PM"
      return dateValue.replace(/(am|pm)/i, (match) => match.toUpperCase());
    }

    // If it's in DD-MM-YYYY format with time range
    if (dateValue.includes(' - ')) {
      const [datePart, timePart] = dateValue.split(' - ');
      const [day, month, year] = datePart.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(month) - 1];

      return `${day} ${monthName} ${year}, ${timePart}`;
    }

    return dateValue;
  } catch (error) {
    console.error("Error formatting requested date:", error);
    return dateValue || "N/A";
  }
};