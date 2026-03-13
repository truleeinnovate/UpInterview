import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";
import { notify } from "../../services/toastService";

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Hook to get all withdrawal requests (superadmin) - SIMPLE VERSION
export const useWithdrawalRequests = ({
  limit = 10,
  search = '',
  status = '',
  mode = '',
  minAmount = '',
  maxAmount = '',
  startDate = '',
  endDate = '',
} = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.WithdrawalRequest?.View !== false;

  const {
    data: infiniteData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "withdrawalRequests",
      limit,
      search,
      status,
      mode,
      minAmount,
      maxAmount,
      startDate,
      endDate,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const base = `${config.REACT_APP_API_URL}/wallet/get-all-withdrawals-requests`;
      const params = new URLSearchParams();
      params.append('page', String(pageParam));
      params.append('limit', String(limit));
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (mode) params.append('mode', mode);
      if (minAmount !== '' && minAmount !== undefined) params.append('minAmount', String(minAmount));
      if (maxAmount !== '' && maxAmount !== undefined) params.append('maxAmount', String(maxAmount));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(`${base}?${params.toString()}`);
      return response.data || { withdrawalRequests: [], total: 0 };
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination?.hasNext || (pagination?.currentPage !== undefined && pagination?.currentPage < (pagination?.totalPages - 1))) {
        return (pagination?.currentPage ?? 0) + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  // Flatten all pages
  const withdrawalRequests = infiniteData?.pages?.flatMap((p) => p?.withdrawalRequests || p?.data || []) || [];
  
  // Use first page's pagination for stats
  const firstPagination = infiniteData?.pages?.[0]?.pagination || {};

  const defaultPagination = {
    currentPage: 0,
    totalPages: firstPagination.totalPages || 0,
    totalItems: firstPagination.totalItems || infiniteData?.pages?.[0]?.total || withdrawalRequests.length,
    hasNext: !!hasNextPage,
    hasPrev: false,
    itemsPerPage: limit,
  };

  return {
    withdrawalRequests,
    pagination: { ...defaultPagination, ...firstPagination, hasNext: !!hasNextPage, currentPage: 0 },
    total: infiniteData?.pages?.[0]?.total ?? withdrawalRequests.length,
    hasMore: !!hasNextPage,
    stats: infiniteData?.pages?.[0]?.stats || null,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

// Hook to get a single withdrawal request by ID
export const useWithdrawalRequestById = (requestId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.WithdrawalRequest?.View;

  const {
    data: withdrawalRequest = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["withdrawalRequest", requestId],
    queryFn: async () => {
      if (!requestId) return null;
      
      // Use the new specific endpoint for single withdrawal request
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/wallet/withdrawal-request/${requestId}`
      );
      return response.data?.withdrawalRequest || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!requestId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
  });

  return {
    withdrawalRequest,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to process withdrawal (mark as completed)
export const useProcessWithdrawal = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions } = usePermissions();
  const hasEditPermission = superAdminPermissions?.WithdrawalRequest?.Edit;

  const mutation = useMutation({
    mutationFn: async ({ withdrawalRequestId, transactionReference, processedBy, adminNotes, actualMode }) => {
      if (!hasEditPermission) {
        throw new Error("You don't have permission to process withdrawals");
      }
      
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/wallet/withdrawals/${withdrawalRequestId}/process`,
        {
          transactionReference,
          processedBy,
          adminNotes,
          actualMode
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(`Withdrawal ${data.withdrawalRequest?.withdrawalCode} processed successfully`);
      queryClient.invalidateQueries(["withdrawalRequests"]);
      queryClient.invalidateQueries(["withdrawalRequest"]);
    },
    onError: (error) => {
      notify.error(error.response?.data?.error || "Failed to process withdrawal");
    },
  });

  return {
    processWithdrawal: mutation.mutateAsync,
    isProcessing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

// Hook to fail withdrawal
export const useFailWithdrawal = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions } = usePermissions();
  const hasEditPermission = superAdminPermissions?.WithdrawalRequest?.Edit;

  const mutation = useMutation({
    mutationFn: async ({ withdrawalRequestId, failureReason, failedBy, adminNotes }) => {
      if (!hasEditPermission) {
        throw new Error("You don't have permission to fail withdrawals");
      }
      
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/wallet/withdrawals/${withdrawalRequestId}/fail`,
        {
          failureReason,
          failedBy,
          adminNotes
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(`Withdrawal ${data.withdrawalRequest?.withdrawalCode} marked as failed`);
      queryClient.invalidateQueries(["withdrawalRequests"]);
      queryClient.invalidateQueries(["withdrawalRequest"]);
    },
    onError: (error) => {
      notify.error(error.response?.data?.error || "Failed to mark withdrawal as failed");
    },
  });

  return {
    failWithdrawal: mutation.mutateAsync,
    isFailing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
