/**
 * Timezone utility functions for formatting dates and times
 */

/**
 * Format a date string to local timezone with country/city information
 * @param {string} dateTimeString - The date string to format (can be a time range like "04-08-2025 07:28 PM - 07:58 PM")
 * @param {string} format - The format type ('full', 'time', 'date', 'short', 'range', 'start-only')
 * @returns {string} Formatted date string
 */
export const formatToLocalTime = (dateTimeString, format = 'start-only') => {
  if (!dateTimeString) {
    return 'Not Available';
  }

  try {
    // Check if it's a time range format (e.g., "04-08-2025 07:28 PM - 07:58 PM")
    if (dateTimeString.includes(' - ')) {
      return formatTimeRange(dateTimeString, format);
    }

    const date = new Date(dateTimeString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Get user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeZoneName = timeZone.replace(/_/g, ' ');

    // Format options based on the requested format
    let options = {};

    switch (format) {
      case 'time':
        options = {
          hour: '2-digit',
          minute: '2-digit',
          // timeZoneName: 'short'
        };
        break;
      case 'date':
        options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          // timeZoneName: 'short'
        };
        break;
      case 'short':
        options = {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          // timeZoneName: 'short'
        };
        break;
      case 'full':
        options = {
          // weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          // timeZoneName: 'long'
        };
        break;
      case 'start-only':
      default:
        options = {
          // weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          // timeZoneName: 'long'
        };
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Format Error';
  }
};

/**
 * Format a time range string (e.g., "04-08-2025 07:28 PM - 07:58 PM")
 * @param {string} timeRangeString - The time range string
 * @param {string} format - The format type
 * @returns {string} Formatted time range string
 */
const formatTimeRange = (timeRangeString, format = 'full') => {
  try {
    // Parse the time range format: "04-08-2025 07:28 PM - 07:58 PM"
    const parts = timeRangeString.split(' - ');
    if (parts.length !== 2) {
      return timeRangeString; // Return original if not a valid range
    }

    const datePart = parts[0]; // "04-08-2025 07:28 PM"
    const endTimePart = parts[1]; // "07:58 PM"

    // Parse the start date and time
    const startDate = parseCustomDateTime(datePart);
    if (!startDate) {
      return timeRangeString;
    }

    // Parse the end time (same date, different time)
    const endTime = parseCustomTime(endTimePart);
    if (!endTime) {
      return timeRangeString;
    }

    // Create end date (same date as start, but with end time)
    const endDate = new Date(startDate);
    endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // Get user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // const timeZoneName = timeZone.replace(/_/g, ' ');
    const timeZoneName = ""

    // Format based on the requested format
    switch (format) {
      case 'time':
        return `${formatTime(startDate)} - ${formatTime(endDate)} ${timeZoneName}`;
      case 'short':
        return `${formatShortDateTime(startDate)} - ${formatTime(endDate)} ${timeZoneName}`;
      case 'range':
        return `${formatTime(startDate)} - ${formatTime(endDate)}`;
      case 'start-only':
        return `${formatFullDateTime(startDate)} ${timeZoneName}`;
      case 'full':
      default:
        return `${formatFullDateTime(startDate)} - ${formatTime(endDate)}`;  // ${timeZoneName}
    }
  } catch (error) {
    console.error('Error formatting time range:', error);
    return timeRangeString;
  }
};

/**
 * Parse custom date time format: "04-08-2025 07:28 PM"
 * @param {string} dateTimeString - The date time string
 * @returns {Date|null} Parsed date or null
 */
const parseCustomDateTime = (dateTimeString) => {
  try {
    // Format: "04-08-2025 07:28 PM"
    const match = dateTimeString.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (!match) {
      return null;
    }

    const [, day, month, year, hour, minute, period] = match;
    let hour24 = parseInt(hour);
    
    // Convert 12-hour to 24-hour format
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour24, parseInt(minute));
  } catch (error) {
    console.error('Error parsing custom date time:', error);
    return null;
  }
};

/**
 * Parse custom time format: "07:58 PM"
 * @param {string} timeString - The time string
 * @returns {Date|null} Parsed time or null
 */
const parseCustomTime = (timeString) => {
  try {
    // Format: "07:58 PM"
    const match = timeString.match(/(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (!match) {
      return null;
    }

    const [, hour, minute, period] = match;
    let hour24 = parseInt(hour);
    
    // Convert 12-hour to 24-hour format
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const date = new Date();
    date.setHours(hour24, parseInt(minute), 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing custom time:', error);
    return null;
  }
};

/**
 * Format time only (HH:MM AM/PM)
 * @param {Date} date - The date object
 * @returns {string} Formatted time
 */
const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Format short date time (MMM DD, HH:MM AM/PM)
 * @param {Date} date - The date object
 * @returns {string} Formatted short date time
 */
const formatShortDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Format full date time (Weekday, Month DD, YYYY at HH:MM AM/PM)
 * @param {Date} date - The date object
 * @returns {string} Formatted full date time
 */
const formatFullDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Format duration from minutes to a readable format
 * @param {number|string} minutes - Duration in minutes or time range string
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes) {
    return 'Not Available';
  }

  // Check if it's a time range string
  if (typeof minutes === 'string' && minutes.includes(' - ')) {
    return calculateDurationFromRange(minutes);
  }

  const mins = parseInt(minutes);
  if (isNaN(mins)) {
    return 'Invalid Duration';
  }

  if (mins < 60) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Calculate duration from time range format (e.g., "04-08-2025 07:28 PM - 07:58 PM")
 * @param {string} timeRangeString - The time range string
 * @returns {string} Formatted duration
 */
const calculateDurationFromRange = (timeRangeString) => {
  try {
    const parts = timeRangeString.split(' - ');
    if (parts.length !== 2) {
      return 'Invalid Duration';
    }

    const datePart = parts[0]; // "04-08-2025 07:28 PM"
    const endTimePart = parts[1]; // "07:58 PM"

    // Parse the start date and time
    const startDate = parseCustomDateTime(datePart);
    if (!startDate) {
      return 'Invalid Duration';
    }

    // Parse the end time
    const endTime = parseCustomTime(endTimePart);
    if (!endTime) {
      return 'Invalid Duration';
    }

    // Create end date (same date as start, but with end time)
    const endDate = new Date(startDate);
    endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // Calculate difference in minutes
    const diffInMs = endDate - startDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(diffInMinutes / 60);
    const remainingMinutes = diffInMinutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error calculating duration from range:', error);
    return 'Duration calculation error';
  }
};

/**
 * Get current local timezone information
 * @returns {object} Timezone information
 */
export const getLocalTimezoneInfo = () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const offsetSign = offset <= 0 ? '+' : '-';
  
  return {
    timeZone,
    // timeZoneName: timeZone.replace(/_/g, ' '),
    offset: `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`,
    offsetHours,
    offsetMinutes,
    offsetSign
  };
};

/**
 * Check if a date is in the past, present, or future
 * @param {string} dateTimeString - The date string to check (can be a time range)
 * @returns {string} 'past', 'present', or 'future'
 */
export const getDateStatus = (dateTimeString) => {
  if (!dateTimeString) {
    return 'unknown';
  }

  try {
    let startDate;

    // Check if it's a time range format
    if (dateTimeString.includes(' - ')) {
      const parts = dateTimeString.split(' - ');
      const datePart = parts[0]; // "04-08-2025 07:28 PM"
      startDate = parseCustomDateTime(datePart);
      if (!startDate) {
        return 'unknown';
      }
    } else {
      startDate = new Date(dateTimeString);
    }

    const now = new Date();
    
    // Compare dates properly - if startDate is before now, it's past
    if (startDate < now) {
      return 'past';
    } else if (startDate > now) {
      // Check if it's within 30 minutes (present)
      const diffInMinutes = (startDate - now) / (1000 * 60);
      if (diffInMinutes <= 30) {
        return 'present';
      } else {
        return 'future';
      }
    } else {
      return 'present';
    }
  } catch (error) {
    console.error('Error checking date status:', error);
    return 'unknown';
  }
};

/**
 * Get a human-readable time until the interview
 * @param {string} dateTimeString - The interview date string (can be a time range)
 * @returns {string} Human-readable time until interview
 */
export const getTimeUntilInterview = (dateTimeString) => {
  if (!dateTimeString) {
    return 'Not Available';
  }

  try {
    let startDate;

    // Check if it's a time range format
    if (dateTimeString.includes(' - ')) {
      const parts = dateTimeString.split(' - ');
      const datePart = parts[0]; // "04-08-2025 07:28 PM"
      startDate = parseCustomDateTime(datePart);
      if (!startDate) {
        return 'Time calculation error';
      }
    } else {
      startDate = new Date(dateTimeString);
    }

    const now = new Date();
    const diffInMs = startDate - now;

    if (diffInMs < 0) {
      // Calculate how long ago the interview was
      const diffInMinutes = Math.floor(Math.abs(diffInMs) / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else {
        return 'Just started';
      }
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} from now`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} from now`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} from now`;
    } else {
      return 'Starting now';
    }
  } catch (error) {
    console.error('Error calculating time until interview:', error);
    return 'Time calculation error';
  }
}; 