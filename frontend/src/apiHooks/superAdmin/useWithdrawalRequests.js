import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";
import { notify } from "../../services/toastService";

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Hook to get all withdrawal requests (superadmin) - SIMPLE VERSION
export const useWithdrawalRequests = (options) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.WithdrawalRequest?.View !== false;

  // Support optional server-side pagination/search/filters
  const isPaginated = options && typeof options === 'object';
  const {
    page = 0,
    limit = 10,
    search = '',
    status = '',
    mode = '',
    minAmount = '',
    maxAmount = '',
    startDate = '',
    endDate = '',
  } = options || {};

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: isPaginated
      ? [
          "withdrawalRequests",
          page,
          limit,
          search,
          status,
          mode,
          minAmount,
          maxAmount,
          startDate,
          endDate,
        ]
      : ["withdrawalRequests"],
    queryFn: async () => {
      const base = `${config.REACT_APP_API_URL}/wallet/get-all-withdrawals-requests`;
      if (isPaginated) {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (mode) params.append('mode', mode);
        if (minAmount !== '' && minAmount !== undefined) params.append('minAmount', String(minAmount));
        if (maxAmount !== '' && maxAmount !== undefined) params.append('maxAmount', String(maxAmount));
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await axios.get(`${base}?${params.toString()}`);
        return response.data;
      }
      const response = await axios.get(base);
      return response.data || { withdrawalRequests: [], total: 0 };
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  // Normalize data across modes
  const dataArray = Array.isArray(data)
    ? data
    : (data?.data || data?.withdrawalRequests || []);

  const defaultPagination = {
    currentPage: page,
    totalPages: 0,
    totalItems: Array.isArray(data) ? data.length : (data?.total || dataArray.length || 0),
    hasNext: false,
    hasPrev: false,
    itemsPerPage: limit,
  };

  return {
    withdrawalRequests: dataArray,
    pagination: Array.isArray(data) ? defaultPagination : (data?.pagination || defaultPagination),
    total: data?.total ?? (Array.isArray(data) ? data.length : dataArray.length),
    hasMore: data?.hasMore || false,
    stats: data?.stats || null,
    isLoading,
    isError,
    error,
    refetch,
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
