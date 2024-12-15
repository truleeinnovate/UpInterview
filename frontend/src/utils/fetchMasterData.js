import axios from "axios";
// const backendUrl = process.env.NODE_ENV === 'production'
// ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net'
// : 'http://localhost:4041';


export const fetchMasterData = async (endpoint) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/${endpoint}`);
    console.log('Fetched data:', response.data);  // Log the data
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    throw error;
  }
};

