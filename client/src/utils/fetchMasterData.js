import axios from "axios";

export const fetchMasterData = async (endpoint) => {
  try {
    // const response = await axios.get(`${process.env.REACT_APP_API_URL}/${endpoint}`);
    const response = await axios.get(`https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net/${endpoint}`);
    console.log('response :', response)
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};