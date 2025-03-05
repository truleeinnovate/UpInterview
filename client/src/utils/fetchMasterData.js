import axios from "axios";
import { config } from '../config.js'

export const fetchMasterData = async (endpoint) => {
  try {
    const response = await axios.get(`${config.REACT_APP_API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};
