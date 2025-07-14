import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get all invoices for an organization
export const useInvoices = (organizationId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.ViewTab;

  const {
    data: invoices = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoices", organizationId],
    queryFn: async () => {
      const endpoint = organizationId
        ? `${config.REACT_APP_API_URL}/invoices/${organizationId}`
        : `${config.REACT_APP_API_URL}/invoices`;
      const response = await axios.get(endpoint);
      return response.data?.invoices || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    invoices,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to get a single invoice by ID
export const useInvoiceById = (invoiceId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.View;

  const {
    data: invoice = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/invoices/invoice/${invoiceId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!invoiceId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    invoice,
    isLoading,
    isError,
    error,
    refetch,
  };
};
