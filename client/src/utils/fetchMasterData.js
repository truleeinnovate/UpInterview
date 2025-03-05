import axios from "axios";
import { config } from '../config.js'

export const fetchMasterData = async (endpoint) => {
  try {
    console.log("Backend API URL:", config.REACT_APP_API_URL, endpoint);
    console.log(`Fetching: ${config.REACT_APP_API_URL}/${endpoint}`);
    const response = await axios.get(`${config.REACT_APP_API_URL}/${endpoint}`);
    console.log("Raw Response:", response);
    console.log("Data Returned:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};
