// v1.0.0 - Venkatesh - TanStack Query hook to fetch tenant tax configuration (GST, service charge)

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

export const useTenantTaxConfig = () => {
  const tenantId = AuthCookieManager.getCurrentTenantId();

  return useQuery({
    queryKey: ['tenantTaxConfig', tenantId || 'default'],
    queryFn: async () => {
      const url = `${config.REACT_APP_API_URL}/wallet/tax-config`;
      const axiosConfig = tenantId ? { params: { tenantId } } : {};
      const response = await axios.get(url, axiosConfig);
      return response?.data || null;
    },
    enabled: !!tenantId,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
