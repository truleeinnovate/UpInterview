import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get all payments for an organization
export const usePayments = (organizationId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.View;

  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payments", organizationId],
    queryFn: async () => {
      const endpoint = organizationId
        ? `${config.REACT_APP_API_URL}/payments/${organizationId}`
        : `${config.REACT_APP_API_URL}/payments`;
      const response = await axios.get(endpoint);
      return response.data?.payments || [];
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
    payments,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to get a single payment by ID
export const usePaymentById = (paymentId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.View;

  const {
    data: payment = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/payments/payment/${paymentId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!paymentId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    payment,
    isLoading,
    isError,
    error,
    refetch,
  };
};
