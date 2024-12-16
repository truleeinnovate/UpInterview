import axios from "axios";

// Retrieve the backend URL from the environment variable
const backendUrl = process.env.REACT_APP_API_URL;

if (!backendUrl) {
  console.error("REACT_APP_API_URL is not defined. Please set it in the environment.");
} else {
  console.log("REACT_APP_API_URL :", backendUrl);
}

export const fetchMasterData = async (endpoint) => {
  try {
    // Use the backend URL from the environment variable
    const response = await axios.get(`${backendUrl}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};
