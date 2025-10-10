import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };
};

// Hook to get withdrawal requests
export const useWithdrawalRequests = (ownerId, status = null) => {
  return useQuery({
    queryKey: ["withdrawalRequests", ownerId, status],
    queryFn: async () => {
      if (!ownerId) return { withdrawalRequests: [], total: 0 };
      
      let url = `${API_BASE_URL}/wallet/withdrawals/${ownerId}`;
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    },
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create withdrawal request
export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawalData) => {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/withdrawals`,
        withdrawalData,
        getAuthHeaders()
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate wallet and withdrawal queries
      queryClient.invalidateQueries(["wallet"]);
      queryClient.invalidateQueries(["withdrawalRequests"]);
      // Also invalidate specific owner's withdrawal requests
      if (variables?.ownerId) {
        queryClient.invalidateQueries(["withdrawalRequests", variables.ownerId]);
      }
      
      toast.success(
        `Withdrawal request created successfully! ${
          data.withdrawalRequest?.withdrawalCode || ""
        }`
      );
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to create withdrawal request";
      toast.error(message);
      console.error("Error creating withdrawal:", error);
    }
  });
};

// Hook to cancel withdrawal request
export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ withdrawalRequestId, reason }) => {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/withdrawals/${withdrawalRequestId}/cancel`,
        { reason },
        getAuthHeaders()
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["wallet"]);
      queryClient.invalidateQueries(["withdrawalRequests"]);
      toast.success("Withdrawal request cancelled successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to cancel withdrawal request";
      toast.error(message);
      console.error("Error cancelling withdrawal:", error);
    }
  });
};

// Hook to get withdrawal summary
export const useWithdrawalSummary = (ownerId) => {
  return useQuery({
    queryKey: ["withdrawalSummary", ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      const response = await axios.get(
        `${API_BASE_URL}/wallet/withdrawals/${ownerId}/summary`,
        getAuthHeaders()
      );
      return response.data.summary;
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to calculate withdrawal fees
export const calculateWithdrawalFees = (amount) => {
  const processingFee = Math.max(amount * 0.02, 10); // 2% or minimum ₹10
  const tax = processingFee * 0.18; // 18% GST
  const netAmount = amount - processingFee - tax;
  
  return {
    amount,
    processingFee,
    tax,
    totalFees: processingFee + tax,
    netAmount
  };
};

// Helper function to get withdrawal status color
export const getWithdrawalStatusColor = (status) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    queued: "bg-purple-100 text-purple-800",
    initiated: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    reversed: "bg-orange-100 text-orange-800",
    on_hold: "bg-amber-100 text-amber-800"
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

// Helper function to format withdrawal mode
export const formatWithdrawalMode = (mode) => {
  const modeNames = {
    IMPS: "IMPS (Instant)",
    NEFT: "NEFT (2-4 hours)",
    RTGS: "RTGS (30 mins)",
    UPI: "UPI (Instant)",
    card: "Card Transfer"
  };
  
  return modeNames[mode] || mode;
};
