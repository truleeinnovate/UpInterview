import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get invoices with server-side pagination and filters
export const useInvoices = ({
  page = 0,
  limit = 10,
  search = "",
  status = "",
  type = "",
  startDate = "",
  endDate = "",
  tenantId = "",
  ownerId = "",
  minAmount = "",
  maxAmount = "",
  organizationId
} = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Billing?.ViewTab;

  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  if (type) queryParams.append("type", type);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (tenantId) queryParams.append("tenantId", tenantId);
  if (ownerId) queryParams.append("ownerId", ownerId);
  if (minAmount) queryParams.append("minAmount", String(minAmount));
  if (maxAmount) queryParams.append("maxAmount", String(maxAmount));

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "invoices",
      page,
      limit,
      search,
      status,
      type,
      startDate,
      endDate,
      tenantId,
      ownerId,
      minAmount,
      maxAmount,
      organizationId
    ],
    queryFn: async () => {
      const endpoint = organizationId
        ? `${config.REACT_APP_API_URL}/invoices/${organizationId}`
        : `${config.REACT_APP_API_URL}/invoices?${queryParams.toString()}`;
      const response = await axios.get(endpoint);
      return response.data;
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  return {
    invoices: data?.data || data?.invoices || [],
    pagination: data?.pagination || {
      currentPage: page,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
      itemsPerPage: limit,
    },
    stats: data?.stats,
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
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
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
