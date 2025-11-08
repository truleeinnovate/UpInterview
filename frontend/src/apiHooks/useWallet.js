//<----v1.0.0-----Venkatesh-----tanStack Query added
//v1.0.1--Venkatesh-----Added tenantId support to useWallet hook using getCurrentTenantId from AuthCookieManager

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { usePermissions } from '../Context/PermissionsContext';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// Fetch wallet details for a user (defaults to current user)
export const useWallet = (userIdOverride) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Wallet?.View;
  const userId = userIdOverride || AuthCookieManager.getCurrentUserId();
  //const tenantId = AuthCookieManager.getCurrentTenantId(); // Get tenantId from auth manager

  return useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      if (!userId) return null;
      // Pass tenantId as query parameter
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/wallet/${userId}`,
      );
      // Return the full wallet data object to match context structure
      // This maintains backward compatibility while also allowing access to walletDetials if needed
      const walletData = response?.data || {};
      const walletArr = walletData?.walletDetials;
      
      // If walletDetials exists and has items, merge the first item properties into the main object
      if (Array.isArray(walletArr) && walletArr.length > 0) {
        return { ...walletData, ...walletArr[0] };
      }
      
      return walletData;
    },
    enabled: !!userId && !!hasViewPermission && isInitialized,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Verify wallet payment and invalidate wallet query on success
export const useVerifyWalletPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${config.REACT_APP_API_URL}/wallet/verify-payment`, payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      const ownerId = variables?.ownerId;
      if (ownerId) {
        queryClient.invalidateQueries(['wallet', ownerId]);
      }
    },
    onError: (error) => {
      console.error('Error verifying wallet payment:', error);
    },
  });
};

// Create Razorpay order for wallet top-up
export const useCreateWalletOrder = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${config.REACT_APP_API_URL}/wallet/create-order`, payload);
      return res.data;
    },
    onError: (error) => {
      console.error('Error creating wallet order:', error);
    },
  });
};

//----v1.0.0---->
