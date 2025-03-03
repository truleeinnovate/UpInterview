import axios from "axios";

export const fetchMasterData = async (endpoint) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};