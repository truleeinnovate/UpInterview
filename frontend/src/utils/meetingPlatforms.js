import axios from 'axios';
import { config } from '../config';

/**
 * Google Meet platform integration
 */
export class GoogleMeetPlatform {
  constructor() {
    this.GOOGLE_AUTH_URL = config.REACT_APP_GOOGLE_AUTH_URL;
    this.GOOGLE_CLIENT_ID = config.REACT_APP_GOOGLE_CLIENT_ID;
    this.REDIRECT_URI = config.REACT_APP_GOOGLE_REDIRECT_URI;
    this.SCOPES = config.REACT_APP_GOOGLE_SCOPES;
  }

  /**
   * Creates a Google Meet event
   * @param {Object} options - Meeting creation options
   * @param {string} options.roundTitle - Title of the round
   * @param {string} options.instructions - Instructions for the meeting
   * @param {string} options.combinedDateTime - Combined date and time string
   * @param {number} options.duration - Duration in minutes
   * @param {Array} options.selectedInterviewers - Array of selected interviewers
   * @param {Function} options.onProgress - Progress callback function
   * @returns {Promise<string>} Promise that resolves to the meeting link
   */
  async createMeeting(options) {
    const { roundTitle, instructions, combinedDateTime, duration, selectedInterviewers, onProgress } = options;

    try {
      onProgress?.('Starting Google Meet creation...');

      // Step 1: Get authorization code
      const authUrl = `${this.GOOGLE_AUTH_URL}` +
        `client_id=${this.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${this.REDIRECT_URI}` +
        `&response_type=code` +
        `&access_type=offline&prompt=consent` +
        `&scope=${this.SCOPES}`;
      
      console.log("Redirecting to Google OAuth for authorization...");
      console.log("Auth URL:", authUrl);
      console.log("Client ID:", this.GOOGLE_CLIENT_ID);
      console.log("Redirect URI:", this.REDIRECT_URI);
      
      // Open OAuth popup
      const popup = window.open(authUrl, 'googleOAuth', 'width=500,height=600');
      
             return new Promise((resolve, reject) => {
         let isResolved = false; // Flag to track if promise has been resolved
         
         // Listen for the OAuth callback
         const handleOAuthCallback = async (event) => {
          if (event.origin !== window.location.origin) return;
          
          const { code, error } = event.data;
          
                     if (error) {
             console.error("OAuth error:", error);
             popup.close();
             window.removeEventListener('message', handleOAuthCallback);
             isResolved = true;
             reject(new Error(`OAuth error: ${error}`));
             return;
           }
          
          if (code) {
            console.log("Received authorization code, exchanging for tokens...");
            onProgress?.('Exchanging authorization code for tokens...');
            
            try {
              // Step 2: Exchange code for tokens
              const tokenResponse = await axios.post(`${config.REACT_APP_API_URL}/googlemeet/exchange_token`, { code });
              console.log("Token exchange successful");
              onProgress?.('Creating Google Meet event...');
              
              // Step 3: Create Google Meet event
              console.log("Creating meet with data:", {
                startDateTime: combinedDateTime,
                duration,
                roundTitle,
                instructions,
                selectedInterviewers: selectedInterviewers,
                selectedInterviewersLength: selectedInterviewers?.length || 0
              });
              
              // Handle case where combinedDateTime might be empty or invalid
              let finalDateTime = combinedDateTime;
              if (!finalDateTime) {
                console.log("No combinedDateTime, using current time + 15 minutes");
                const now = new Date();
                now.setMinutes(now.getMinutes() + 15);
                finalDateTime = now.toISOString();
              }
              
              // Parse the finalDateTime format: "05-08-2025 11:30 AM - 12:00 PM"
              console.log("finalDateTime value:", finalDateTime);
              console.log("finalDateTime type:", typeof finalDateTime);
              
              let startDate;
              if (finalDateTime.includes(" - ")) {
                // Format: "05-08-2025 11:30 AM - 12:00 PM"
                const startTimePart = finalDateTime.split(" - ")[0]; // "05-08-2025 11:30 AM"
                console.log("Extracted start time part:", startTimePart);
                
                // Parse DD-MM-YYYY HH:MM AM/PM format
                const dateTimeMatch = startTimePart.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/);
                if (dateTimeMatch) {
                  const [, day, month, year, hour, minute, ampm] = dateTimeMatch;
                  let hour24 = parseInt(hour);
                  if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
                  if (ampm === 'AM' && hour24 === 12) hour24 = 0;
                  
                  // Create date in YYYY-MM-DDTHH:MM:SS format
                  const isoDateString = `${year}-${month}-${day}T${hour24.toString().padStart(2, '0')}:${minute}:00`;
                  console.log("Converted to ISO format:", isoDateString);
                  startDate = new Date(isoDateString);
                } else {
                  throw new Error(`Could not parse date format: ${startTimePart}`);
                }
              } else {
                // Try to parse as regular date
                startDate = new Date(finalDateTime);
              }
              
              console.log("startDate:", startDate);
              console.log("startDate.getTime():", startDate.getTime());
              if (isNaN(startDate.getTime())) {
                throw new Error(`Invalid start date: ${finalDateTime}`);
              }
              
              const endDate = new Date(startDate.getTime() + duration * 60000);
              if (isNaN(endDate.getTime())) {
                throw new Error(`Invalid end date calculation`);
              }
              
              console.log("Final start date ISO:", startDate.toISOString());
              console.log("Final end date ISO:", endDate.toISOString());
              console.log("Duration in minutes:", duration);
              
              const meetData = {
                refreshToken: tokenResponse.data.refresh_token,
                summary: `${roundTitle} - Interview Round`,
                description: `Interview round: ${roundTitle}\nInstructions: ${instructions}`,
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                timeZone: "Asia/Kolkata",
                attendees: selectedInterviewers && selectedInterviewers.length > 0 ? selectedInterviewers.map(interviewer => {
                  const email = interviewer.contact?.email || interviewer.email;
                  console.log("Interviewer email:", email, "for interviewer:", interviewer);
                  return { email };
                }).filter(attendee => attendee.email) : []
              };
              
              console.log("Final attendees array:", meetData.attendees);
              
                             const meetResponse = await axios.post(`${config.REACT_APP_API_URL}/googlemeet/create_event`, meetData);
               
               console.log("Google Meet created successfully:", meetResponse.data.meetLink);
               console.log("Meet Link:", meetResponse.data.meetLink);
               
               // Close popup only after meeting creation is complete
               popup.close();
               window.removeEventListener('message', handleOAuthCallback);
               
               onProgress?.('Google Meet created successfully!');
               isResolved = true;
               resolve(meetResponse.data.meetLink);
              
                         } catch (err) {
               console.error("Error creating Google Meet:", err.response?.data || err.message);
               console.error("Full error object:", err);
               if (err.response) {
                 console.error("Response status:", err.response.status);
                 console.error("Response data:", err.response.data);
               }
               popup.close();
               window.removeEventListener('message', handleOAuthCallback);
               isResolved = true;
               reject(err);
             }
          }
        };
        
        window.addEventListener('message', handleOAuthCallback);
        
        // Remove the popup closed check entirely - rely only on the message event listener
      });
      
    } catch (err) {
      console.error("Error in Google Meet creation:", err);
      throw err;
    }
  }
}

/**
 * Zoom platform integration (placeholder for future implementation)
 */
export class ZoomPlatform {
  constructor() {
    // Zoom configuration will be added here
  }

  async createMeeting(options) {
    // TODO: Implement Zoom meeting creation
    throw new Error("Zoom integration not yet implemented");
  }
}

/**
 * Microsoft Teams platform integration (placeholder for future implementation)
 */
export class TeamsPlatform {
  constructor() {
    // Teams configuration will be added here
  }

  async createMeeting(options) {
    // TODO: Implement Teams meeting creation
    throw new Error("Microsoft Teams integration not yet implemented");
  }
}

/**
 * Meeting platform factory
 */
export class MeetingPlatformFactory {
  static createPlatform(platformType) {
    switch (platformType.toLowerCase()) {
      case 'googlemeet':
      case 'google':
        return new GoogleMeetPlatform();
      case 'zoom':
        return new ZoomPlatform();
      case 'teams':
      case 'microsoftteams':
        return new TeamsPlatform();
      default:
        throw new Error(`Unsupported meeting platform: ${platformType}`);
    }
  }
}

/**
 * Main function to create meeting based on platform type
 * @param {string} platformType - Type of meeting platform ('googlemeet', 'zoom', 'teams')
 * @param {Object} options - Meeting creation options
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} Promise that resolves to the meeting link
 */
export const createMeeting = async (platformType, options, onProgress) => {
  const platform = MeetingPlatformFactory.createPlatform(platformType);
  return await platform.createMeeting(options, onProgress);
}; 