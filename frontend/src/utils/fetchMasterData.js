import axios from "axios";
const backendUrl = process.env.NODE_ENV === 'production'
? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net'
: 'http://localhost:4041';


export const fetchMasterData = async (endpoint) => {
  try {
    const response = await axios.get(`${backendUrl}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};