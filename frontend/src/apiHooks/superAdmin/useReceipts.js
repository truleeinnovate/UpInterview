import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get all receipts for an organization
export const useReceipts = (organizationId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.ViewTab;

  const {
    data: receipts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["receipts", organizationId],
    queryFn: async () => {
      const endpoint = organizationId
        ? `${config.REACT_APP_API_URL}/receipts/${organizationId}`
        : `${config.REACT_APP_API_URL}/receipts`;
      const response = await axios.get(endpoint);
      return response.data?.receipts || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    receipts,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to get a single receipt by ID
export const useReceiptById = (receiptId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.View;

  const {
    data: receipt = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["receipt", receiptId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/receipts/receipt/${receiptId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!receiptId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    receipt,
    isLoading,
    isError,
    error,
    refetch,
  };
};
