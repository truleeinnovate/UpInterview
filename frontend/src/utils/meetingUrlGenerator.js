import { encryptData } from "./PaymentCard.js";
import { config } from "../config.js";

/**
 * Generates three custom URLs for a meeting with encrypted parameters
 * @param {string} meetingLink - The original meeting link (e.g., Google Meet, Zoom, Teams)
 * @param {string} roundId - The round ID to be encrypted and passed as parameter
 * @returns {Object} Object containing the three generated URLs
 */
export const generateMeetingUrls = (meetingLink, roundId) => {
  try {
    if (!meetingLink || !roundId) {
      throw new Error("Meeting link and round ID are required");
    }

    // Encrypt meeting link and roundId
    const encryptedMeetingLink = encryptData(meetingLink);

    const encryptedRoundId = encryptData(roundId);

    if (!encryptedMeetingLink || !encryptedRoundId) {
      throw new Error("Failed to encrypt meeting data");
    }

    // Create three URLs with different parameters using config.REACT_APP_REDIRECT_URI + '/join-meeting'
    const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
    const scheduleUrl = `${baseUrl}?schedule=true&meeting=${encodeURIComponent(
      encryptedMeetingLink
    )}&round=${encodeURIComponent(encryptedRoundId)}`;
    const interviewerUrl = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(
      encryptedMeetingLink
    )}&round=${encodeURIComponent(encryptedRoundId)}`;
    const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(
      encryptedMeetingLink
    )}&round=${encodeURIComponent(encryptedRoundId)}`;

    const result = {
      meetingId: meetingLink, // Original meeting link
      meetLink: [
        { linkType: "schedule", link: scheduleUrl },
        { linkType: "interviewer", link: interviewerUrl },
        { linkType: "candidate", link: candidateUrl },
      ], // Three URLs with parameters in the correct format
      scheduleUrl,
      interviewerUrl,
      candidateUrl,
    };

    return result;
  } catch (error) {
    console.error("Error generating meeting URLs:", error);
    throw error;
  }
};

/**
 * Updates round data with meeting links using the existing saveInterviewRound API
 * @param {string} interviewId - The interview ID
 * @param {string} roundId - The round ID
 * @param {Object} roundData - The existing round data
 * @param {Object} meetingUrls - Object containing meetingId and meetingLinks
 * @param {Function} updateRoundWithMeetingLinksFn - Function from useInterviews hook to update round
 * @returns {Promise} Promise that resolves when the update is complete
 */
export const updateRoundWithMeetingLinks = async (
  interviewId,
  roundId,
  roundData,
  meetingUrls,
  updateRoundWithMeetingLinksFn
) => {
  try {
    // Use the updateRoundWithMeetingLinks function from useInterviews hook
    const result = await updateRoundWithMeetingLinksFn({
      interviewId,
      roundId,
      roundData,
      meetingUrls,
    });

    return result;
  } catch (error) {
    console.error("=== updateRoundWithMeetingLinks ERROR ===");
    console.error("Error updating round with meeting links:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    console.error("=== updateRoundWithMeetingLinks ERROR END ===");
    throw error;
  }
};

/**
 * Main function to handle the complete process of generating and saving meeting URLs
 * @param {string} meetingLink - The original meeting link from the meeting platform API
 * @param {string} roundId - The round ID
 * @param {string} interviewId - The interview ID
 * @param {Object} roundData - The existing round data
 * @param {Function} updateRoundWithMeetingLinksFn - Function from useInterviews hook to update round
 * @returns {Promise<Object>} Promise that resolves with the generated URLs
 */
export const processMeetingUrls = async (
  meetingLink,
  roundId,
  interviewId,
  roundData,
  updateRoundWithMeetingLinksFn
) => {
  try {
    // Generate the three URLs
    const meetingUrls = generateMeetingUrls(meetingLink, roundId);

    // Update the round data in the backend
    await updateRoundWithMeetingLinks(
      interviewId,
      roundId,
      roundData,
      meetingUrls,
      updateRoundWithMeetingLinksFn
    );

    return meetingUrls;
  } catch (error) {
    console.error("=== processMeetingUrls ERROR ===");
    console.error("Error processing meeting URLs:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    console.error("=== processMeetingUrls ERROR END ===");
    throw error;
  }
};
