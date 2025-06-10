import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config';
import { decodeJwt } from './AuthCookieManager/jwtDecode';

const BASE_URL = `${config.REACT_APP_API_URL}`;

const fetchOrganizationData = async (model) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organizationId = tokenPayload?.tenantId;
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