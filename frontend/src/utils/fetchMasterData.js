import axios from "axios";
import { config } from "../config";

export const fetchMasterData = async (endpoint) => {
  try {
    // All master data endpoints are mounted under "/master-data" in the backend
    const response = await axios.get(`${config.REACT_APP_API_URL}/master-data/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};