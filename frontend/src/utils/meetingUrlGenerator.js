import { encryptData } from './PaymentCard.js';
import { config } from '../config.js';

console.log('=== meetingUrlGenerator.js loaded ===');

/**
 * Generates three custom URLs for a meeting with encrypted parameters
 * @param {string} meetingLink - The original meeting link (e.g., Google Meet, Zoom, Teams)
 * @param {string} roundId - The round ID to be encrypted and passed as parameter
 * @returns {Object} Object containing the three generated URLs
 */
export const generateMeetingUrls = (meetingLink, roundId) => {
  try {
    console.log('=== generateMeetingUrls START ===');
    console.log('Input meetingLink:', meetingLink);
    console.log('Input roundId:', roundId);
    
    if (!meetingLink || !roundId) {
      throw new Error('Meeting link and round ID are required');
    }

    // Encrypt meeting link and roundId
    console.log('Encrypting meeting link...');
    const encryptedMeetingLink = encryptData(meetingLink);
    console.log('Encrypted meeting link:', encryptedMeetingLink);
    
    console.log('Encrypting round ID...');
    const encryptedRoundId = encryptData(roundId);
    console.log('Encrypted round ID:', encryptedRoundId);

    if (!encryptedMeetingLink || !encryptedRoundId) {
      throw new Error('Failed to encrypt meeting data');
    }

               // Create three URLs with different parameters using config.REACT_APP_REDIRECT_URI + '/join-meeting'
           const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;
           const scheduleUrl = `${baseUrl}?schedule=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
           const interviewerUrl = `${baseUrl}?interviewer=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
           const candidateUrl = `${baseUrl}?candidate=true&meeting=${encodeURIComponent(encryptedMeetingLink)}&round=${encodeURIComponent(encryptedRoundId)}`;
       
           const result = {
             meetingId: meetingLink, // Original meeting link
             meetLink: [
               { linkType: 'schedule', link: scheduleUrl },
               { linkType: 'interviewer', link: interviewerUrl },
               { linkType: 'candidate', link: candidateUrl }
             ], // Three URLs with parameters in the correct format
             scheduleUrl,
             interviewerUrl,
             candidateUrl
           };

               console.log('=== Generated URLs ===');
           console.log('Original meeting link (meetingId):', result.meetingId);
           console.log('Schedule URL:', result.scheduleUrl);
           console.log('Interviewer URL:', result.interviewerUrl);
           console.log('Candidate URL:', result.candidateUrl);
           console.log('Meeting links array:', result.meetLink);
    console.log('=== generateMeetingUrls END ===');

    return result;
  } catch (error) {
    console.error('Error generating meeting URLs:', error);
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
export const updateRoundWithMeetingLinks = async (interviewId, roundId, roundData, meetingUrls, updateRoundWithMeetingLinksFn) => {
  try {
    console.log('=== updateRoundWithMeetingLinks START ===');
    console.log('Input interviewId:', interviewId);
    console.log('Input roundId:', roundId);
    console.log('Input roundData:', roundData);
    console.log('Input meetingUrls:', meetingUrls);
    console.log('updateRoundWithMeetingLinksFn type:', typeof updateRoundWithMeetingLinksFn);

    // Use the updateRoundWithMeetingLinks function from useInterviews hook
    console.log('Calling updateRoundWithMeetingLinksFn...');
    const result = await updateRoundWithMeetingLinksFn({
      interviewId,
      roundId,
      roundData,
      meetingUrls
    });

    console.log('Round update result:', result);
    console.log('Round updated with meeting links successfully');
    console.log('=== updateRoundWithMeetingLinks END ===');
    return result;
  } catch (error) {
    console.error('=== updateRoundWithMeetingLinks ERROR ===');
    console.error('Error updating round with meeting links:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    console.error('=== updateRoundWithMeetingLinks ERROR END ===');
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
export const processMeetingUrls = async (meetingLink, roundId, interviewId, roundData, updateRoundWithMeetingLinksFn) => {
  console.log('=== processMeetingUrls FUNCTION CALLED ===');
  try {
    console.log('=== processMeetingUrls START ===');
    console.log('Input meetingLink:', meetingLink);
    console.log('Input roundId:', roundId);
    console.log('Input interviewId:', interviewId);
    console.log('Input roundData:', roundData);
    console.log('updateRoundWithMeetingLinksFn type:', typeof updateRoundWithMeetingLinksFn);

    // Generate the three URLs
    console.log('Generating meeting URLs...');
    const meetingUrls = generateMeetingUrls(meetingLink, roundId);
    
    console.log('Created URLs:', {
      scheduleUrl: meetingUrls.scheduleUrl,
      interviewerUrl: meetingUrls.interviewerUrl,
      candidateUrl: meetingUrls.candidateUrl,
      originalMeetingLink: meetingUrls.meetingId
    });

    // Update the round data in the backend
    console.log('Updating round data in backend...');
    await updateRoundWithMeetingLinks(interviewId, roundId, roundData, meetingUrls, updateRoundWithMeetingLinksFn);

    console.log('=== processMeetingUrls SUCCESS ===');
    return meetingUrls;
  } catch (error) {
    console.error('=== processMeetingUrls ERROR ===');
    console.error('Error processing meeting URLs:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    console.error('=== processMeetingUrls ERROR END ===');
    throw error;
  }
}; 