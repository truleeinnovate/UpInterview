import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get receipts with server-side pagination and filters
export const useReceipts = ({
  page = 0,
  limit = 10,
  search = "",
  status = "",
  method = "",
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
  if (method) queryParams.append("method", method);
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: [
      "receipts",
      limit,
      search,
      status,
      method,
      startDate,
      endDate,
      tenantId,
      ownerId,
      minAmount,
      maxAmount,
      organizationId
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const currentParams = new URLSearchParams(queryParams);
      currentParams.set("page", String(pageParam));
      
      const endpoint = organizationId
        ? `${config.REACT_APP_API_URL}/receipts/${organizationId}?${currentParams.toString()}`
        : `${config.REACT_APP_API_URL}/receipts?${currentParams.toString()}`;
      const response = await axios.get(endpoint);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage.pagination;
      if (pagination && pagination.hasNext) {
        return allPages.length; // Returns the next page index (since API is 0-indexed: page 0, page 1...)
      }
      return undefined;
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const receipts = data?.pages.flatMap((page) => page.data || page.receipts || []) || [];

  return {
    receipts,
    stats: data?.pages?.[0]?.stats,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
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
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
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
