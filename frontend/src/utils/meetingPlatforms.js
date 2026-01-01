import axios from "axios";
import { config } from "../config";

/**
 * Google Meet platform integration
 */
export class GoogleMeetPlatform {
  constructor() {
    // console.log('1 config.REACT_APP_GOOGLE_AUTH_URL', config.REACT_APP_GOOGLE_AUTH_URL);
    // console.log('2 config.REACT_APP_GOOGLE_CLIENT_ID', config.REACT_APP_GOOGLE_CLIENT_ID);
    // console.log('3 config.REACT_APP_GOOGLE_REDIRECT_URI', config.REACT_APP_GOOGLE_REDIRECT_URI);
    // console.log('4 config.REACT_APP_GOOGLE_SCOPES', config.REACT_APP_GOOGLE_SCOPES);
    this.GOOGLE_AUTH_URL = config.REACT_APP_GOOGLE_AUTH_URL;
    this.GOOGLE_CLIENT_ID = config.REACT_APP_GOOGLE_CLIENT_ID;
    this.REDIRECT_URI = config.REACT_APP_GOOGLE_REDIRECT_URI;
    this.SCOPES = config.REACT_APP_GOOGLE_SCOPES;
    // console.log("GOOGLE_AUTH_URL:", this.GOOGLE_AUTH_URL);
    // console.log("GOOGLE_CLIENT_ID:", this.GOOGLE_CLIENT_ID);
    // console.log("REDIRECT_URI:", this.REDIRECT_URI);
    // console.log("SCOPES:", this.SCOPES);
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
    const {
      roundTitle,
      instructions,
      combinedDateTime,
      duration,
      selectedInterviewers,
      onProgress,
    } = options;

    try {
      onProgress?.("Starting Google Meet creation...");

      // Step 1: Get authorization code
      const authUrl =
        `${this.GOOGLE_AUTH_URL}` +
        `client_id=${this.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${this.REDIRECT_URI}` +
        `&response_type=code` +
        `&access_type=offline&prompt=consent` +
        `&scope=${this.SCOPES}`;

      // console.log("Redirecting to Google OAuth for authorization...");
      // console.log("Auth URL:", authUrl);
      // console.log("Client ID:", this.GOOGLE_CLIENT_ID);
      // console.log("Redirect URI:", this.REDIRECT_URI);

      // Open OAuth popup
      const popup = window.open(authUrl, "googleOAuth", "width=500,height=600");

      return new Promise((resolve, reject) => {
        let isResolved = false; // Flag to track if promise has been resolved

        // Listen for the OAuth callback
        const handleOAuthCallback = async (event) => {
          if (event.origin !== window.location.origin) return;

          const { code, error } = event.data;

          if (error) {
            console.error("OAuth error:", error);
            popup.close();
            window.removeEventListener("message", handleOAuthCallback);
            isResolved = true;
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (code) {
            // console.log("Received authorization code, exchanging for tokens...");
            onProgress?.("Exchanging authorization code for tokens...");

            try {
              // Step 2: Exchange code for tokens
              const tokenResponse = await axios.post(
                `${config.REACT_APP_API_URL}/googlemeet/exchange_token`,
                { code }
              );
              // console.log("Token exchange successful");
              onProgress?.("Creating Google Meet event...");

              // Step 3: Create Google Meet event
              // console.log("Creating meet with data:", {
              //   startDateTime: combinedDateTime,
              //   duration,
              //   roundTitle,
              //   instructions,
              //   selectedInterviewers: selectedInterviewers,
              //   selectedInterviewersLength: selectedInterviewers?.length || 0
              // });

              // Handle case where combinedDateTime might be empty or invalid
              let finalDateTime = combinedDateTime;
              if (!finalDateTime) {
                // console.log("No combinedDateTime, using current time + 15 minutes");
                const now = new Date();
                now.setMinutes(now.getMinutes() + 15);
                finalDateTime = now.toISOString();
              }

              // Parse the finalDateTime format: "05-08-2025 11:30 AM - 12:00 PM"
              // console.log("finalDateTime value:", finalDateTime);
              // console.log("finalDateTime type:", typeof finalDateTime);

              let startDate;
              if (finalDateTime.includes(" - ")) {
                // Format: "05-08-2025 11:30 AM - 12:00 PM"
                const startTimePart = finalDateTime.split(" - ")[0]; // "05-08-2025 11:30 AM"
                // console.log("Extracted start time part:", startTimePart);

                // Parse DD-MM-YYYY HH:MM AM/PM format
                const dateTimeMatch = startTimePart.match(
                  /(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/
                );
                if (dateTimeMatch) {
                  const [, day, month, year, hour, minute, ampm] =
                    dateTimeMatch;
                  let hour24 = parseInt(hour);
                  if (ampm === "PM" && hour24 !== 12) hour24 += 12;
                  if (ampm === "AM" && hour24 === 12) hour24 = 0;

                  // Create date in YYYY-MM-DDTHH:MM:SS format
                  const isoDateString = `${year}-${month}-${day}T${hour24
                    .toString()
                    .padStart(2, "0")}:${minute}:00`;
                  // console.log("Converted to ISO format:", isoDateString);
                  startDate = new Date(isoDateString);
                } else {
                  throw new Error(
                    `Could not parse date format: ${startTimePart}`
                  );
                }
              } else {
                // Try to parse as regular date
                startDate = new Date(finalDateTime);
              }

              // console.log("startDate:", startDate);
              // console.log("startDate.getTime():", startDate.getTime());
              if (isNaN(startDate.getTime())) {
                throw new Error(`Invalid start date: ${finalDateTime}`);
              }

              const endDate = new Date(startDate.getTime() + duration * 60000);
              if (isNaN(endDate.getTime())) {
                throw new Error(`Invalid end date calculation`);
              }

              // console.log("Final start date ISO:", startDate.toISOString());
              // console.log("Final end date ISO:", endDate.toISOString());
              // console.log("Duration in minutes:", duration);

              const meetData = {
                refreshToken: tokenResponse.data.refresh_token,
                summary: `${roundTitle} - Interview Round`,
                description: `Interview round: ${roundTitle}\nInstructions: ${instructions}`,
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                timeZone: "Asia/Kolkata",
                attendees:
                  selectedInterviewers && selectedInterviewers.length > 0
                    ? selectedInterviewers
                        .map((interviewer) => {
                          const email =
                            interviewer.contact?.email || interviewer.email;
                          return { email };
                        })
                        .filter((attendee) => attendee.email)
                    : [],
              };

              // console.log("Final attendees array:", meetData.attendees);

              const meetResponse = await axios.post(
                `${config.REACT_APP_API_URL}/googlemeet/create_event`,
                meetData
              );

              //  console.log("Google Meet created successfully:", meetResponse.data.meetLink);
              //  console.log("Meet Link:", meetResponse.data.meetLink);

              // Close popup only after meeting creation is complete
              popup.close();
              window.removeEventListener("message", handleOAuthCallback);

              onProgress?.("Google Meet created successfully!");
              isResolved = true;
              resolve(meetResponse.data.meetLink);
            } catch (err) {
              console.error(
                "Error creating Google Meet:",
                err.response?.data || err.message
              );
              console.error("Full error object:", err);
              if (err.response) {
                console.error("Response status:", err.response.status);
                console.error("Response data:", err.response.data);
              }
              popup.close();
              window.removeEventListener("message", handleOAuthCallback);
              isResolved = true;
              reject(err);
            }
          }
        };

        window.addEventListener("message", handleOAuthCallback);

        // Remove the popup closed check entirely - rely only on the message event listener
      });
    } catch (err) {
      console.error("Error in Google Meet creation:", err);
      throw err;
    }
  }
}

/**
 * Zoom platform integration
 */
// export class ZoomPlatform {
//   constructor() {
//     this.ZOOM_API_URL = `${config.REACT_APP_API_URL}`;
//   }

//   /**
//    * Creates a Zoom meeting
//    * @param {Object} options - Meeting creation options
//    * @param {Object} options.payload - Prebuilt payload (topic, duration, start_time, etc.)
//    * @param {Function} options.onProgress - Progress callback
//    * @returns {Promise<string>} Zoom meeting join URL
//    */
//   async createMeeting(options) {
//     // ✅ Expecting { payload } because your UI sends it like:
//     // const meetingLink = await createMeeting(selectedMeetingPlatform, { payload }, ...)
//     const { payload, onProgress } = options;

//     try {
//       onProgress?.("Starting Zoom meeting creation...");

//         // const res = await fetch('http://localhost:5000/api/create-meeting', {
//               //   method: 'POST',
//               //   headers: { 'Content-Type': 'application/json' },
//               //   body: JSON.stringify(payload)
//               // });

//       // ✅ Send payload directly to backend
//       const response = await axios.post(
//         `${this.ZOOM_API_URL}/api/create-meeting`,
//         payload,
//         {
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       // ✅ Return Zoom meeting join URL
//       if (response.data) {
//         onProgress?.("Zoom meeting created successfully!");
//         return response.data;
//       } else {
//         throw new Error("Zoom API did not return a join_url");
//       }

//     } catch (err) {
//       console.error("Error creating Zoom meeting:", err.response?.data || err.message);
//       throw err;
//     }
//   }
// }

// export class ZoomPlatform {
//   constructor() {
//     // Zoom configuration will be added here
//   }

//   async createMeeting(options) {
//     // TODO: Implement Zoom meeting creation
//     throw new Error("Zoom integration not yet implemented");
//   }
// }

export class ZoomPlatform {
  constructor() {
    // this.ZOOM_API_URL = `${config.REACT_APP_API_URL}`;
  }

  async createMeeting(options) {
    const { payload, onProgress } = options;

    try {
      onProgress?.("Starting Zoom meeting creation...");

      // Validate and format start_time for Zoom
      // if (payload.start_time) {
      //   const startDate = new Date(payload.start_time);
      //   if (isNaN(startDate.getTime())) {
      //     throw new Error("Invalid start time format");
      //   }
      //   // Zoom expects ISO string without the 'Z' for specific timezone handling
      //   payload.start_time = startDate.toISOString().replace('Z', '');
      // }

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/api/create-meeting`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data) {
        onProgress?.("Zoom meeting created successfully!");
        return response.data;
      } else {
        throw new Error("Zoom API did not return a join_url");
      }
    } catch (err) {
      console.error(
        "Error creating Zoom meeting:",
        err.response?.data || err.message
      );
      throw err;
    }
  }
}

/**
 * VideoSDK platform integration
 */
export class VideoSDKPlatform {
  constructor() {
    this.API_BASE_URL = "https://api.videosdk.live";
  }

  async createMeeting(options) {
    const { roundTitle, instructions, combinedDateTime, duration, selectedInterviewers, onProgress } = options;

    try {
      onProgress?.("Creating VideoSDK meeting...");
      
      // Get the VideoSDK token
      const token = await this.getToken();
      
      // Prepare the request payload
      const payload = {
        title: roundTitle,
        description: instructions,
        // Add any additional VideoSDK specific parameters here
      };
      
      // Create the meeting
      const response = await fetch(`${this.API_BASE_URL}/v2/rooms`, {
        method: "POST",
        headers: { 
          'Authorization': token, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create VideoSDK meeting');
      }

      const data = await response.json();

      if (!data.roomId) {
        throw new Error('No roomId received from VideoSDK API');
      }

      // Construct the meeting URL
      const meetingLink = `${window.location.origin}/videosdk-meeting?meetingId=${data.roomId}`;
      
      onProgress?.("VideoSDK meeting created successfully!");
      
      // Return in the expected format
      return meetingLink;
    } catch (error) {
      console.error("Error creating VideoSDK meeting:", error);
      onProgress?.(`Error: ${error.message}`);
      throw error;
    }
  }

  async getToken() {
    const token = process.env.REACT_APP_VIDEOSDK_TOKEN;
    if (!token) {
      throw new Error("VideoSDK token is not configured. Please set REACT_APP_VIDEOSDK_TOKEN in your environment variables.");
    }
    return token;
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
        return new GoogleMeetPlatform();
      case 'zoommeet':
      case 'zoom':
        return new ZoomPlatform();
      case 'videosdk':
      case 'platform':
        return new VideoSDKPlatform();
      case 'teams':
        return new TeamsPlatform();
      default:
        throw new Error(`Unsupported platform: ${platformType}`);
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
