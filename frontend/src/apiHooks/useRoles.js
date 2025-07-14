

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

export const useRolesQuery = ({ filters = {}, fetchAllRoles = false } = {}) => {
  const userType = AuthCookieManager.getUserType();

  return useQuery({
    queryKey: ['roles', userType, filters, fetchAllRoles],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/getAllRoles`);
      const allRoles = response.data;



      // Apply userType-based filtering
      let filteredRoles;
      if (userType === 'superAdmin') {
        // If fetchAllRoles is true, return unfiltered roles (with optional filters applied)
        if (fetchAllRoles) {
          if (filters && Object.keys(filters).length > 0) {
            return allRoles.filter(role =>
              Object.entries(filters).every(([key, value]) => role[key] === value)
            );
          }
          return allRoles;
        }
        filteredRoles = allRoles;
      } else {
        filteredRoles = allRoles.filter(role => role.roleType === 'organization');
      }

      // Apply additional client-side filters if provided
      if (filters && Object.keys(filters).length > 0) {
        filteredRoles = filteredRoles.filter(role =>
          Object.entries(filters).every(([key, value]) => role[key] === value)
        );
      }

      return filteredRoles;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    enabled: !!userType,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
