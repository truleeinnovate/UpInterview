import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config';

const BASE_URL = `${config.REACT_APP_API_URL}`;

const fetchOrganizationData = async (model) => {
  const organizationId = Cookies.get('organizationId');
  try {
    const response = await axios.get(`${BASE_URL}/api/organization/${model}`, {
      params: { organizationId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for model ${model}:`, error);
    throw error;
  }
};

export default fetchOrganizationData;