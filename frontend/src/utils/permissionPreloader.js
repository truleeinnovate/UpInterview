import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from './AuthCookieManager/AuthCookieManager';

// Preload permissions to improve performance
export const preloadPermissions = async () => {
  try {
    const activeToken = AuthCookieManager.getActiveToken();
    if (!activeToken) {
      return null;
    }

    const userType = AuthCookieManager.getUserType();
    const permissionsUrl = `${config.REACT_APP_API_URL}/users/permissions`;

    const response = await axios.get(permissionsUrl, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${activeToken}`
      }
    });

    const permissionData = response.data;
    
    // Cache the permissions immediately
    const cacheKey = `permissions_${userType}`;
    const cacheData = {
      permissions: permissionData,
      timestamp: Date.now()
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    return permissionData;
  } catch (error) {
    console.warn('Failed to preload permissions:', error);
    return null;
  }
};

// Check if permissions are cached and valid
export const hasValidCachedPermissions = () => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) {
      return false;
    }

    const cacheKey = `permissions_${userType}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return false;
    }

    const { timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    return age < CACHE_DURATION;
  } catch (error) {
    return false;
  }
}; 