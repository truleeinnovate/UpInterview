import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";
import { notify } from "../../services/toastService";

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Hook to get all withdrawal requests (superadmin) - SIMPLE VERSION
export const useWithdrawalRequests = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.WithdrawalRequest?.View !== false;

  const {
    data: withdrawalRequestsData = { withdrawalRequests: [], total: 0 },
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["withdrawalRequests"],
    queryFn: async () => {
      const url = `${config.REACT_APP_API_URL}/wallet/get-all-withdrawals-requests`;
      const response = await axios.get(url);
      return response.data || { withdrawalRequests: [], total: 0 };
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  return {
    withdrawalRequests: withdrawalRequestsData?.withdrawalRequests || [],
    total: withdrawalRequestsData?.total || 0,
    hasMore: withdrawalRequestsData?.hasMore || false,
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
