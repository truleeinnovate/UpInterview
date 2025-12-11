import { config } from '../../config.js';

const VIDEOSDK_API_KEY = config.REACT_APP_VIDEOSDK_API_KEY;

export async function createMeeting() {
  try {
    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'authorization': VIDEOSDK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VideoSDK API Error:', response.status, errorText);
      throw new Error('Failed to create meeting room');
    }

    const data = await response.json();
    return data.roomId;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

export async function validateMeeting(meetingId) {
  try {
    const response = await fetch(`https://api.videosdk.live/v2/rooms/validate/${meetingId}`, {
      method: 'GET',
      headers: {
        'authorization': VIDEOSDK_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VideoSDK Validation Error:', response.status, errorText);
      throw new Error('Invalid meeting ID');
    }

    const data = await response.json();
    return data.roomId;
  } catch (error) {
    console.error('Error validating meeting:', error);
    throw error;
  }
}

export function getAuthToken() {
  return VIDEOSDK_API_KEY;
}
