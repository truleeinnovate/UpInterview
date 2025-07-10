import Cookies from 'js-cookie';
import axios from 'axios';
import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
import { config } from './config';

export const fetchFilterData = async (endpoint, effectivePermissions = {}) => {
  // console.log("Sending X-Permissions header:", JSON.stringify(effectivePermissions));

  try {
    const authToken = Cookies.get('authToken') ?? '';
    let tokenPayload = {};

    if (authToken) {
      tokenPayload = decodeJwt(authToken);
    }

    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;

    if (!userId || !tenantId) {
      throw new Error('Missing userId or tenantId');
    }

    const response = await axios.get(`${config.REACT_APP_API_URL}/api/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'x-permissions': JSON.stringify(effectivePermissions) // Send permissions in headers
      },
      withCredentials: true,
    });

    // console.log('API Response for', endpoint, ':', response.data);
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};