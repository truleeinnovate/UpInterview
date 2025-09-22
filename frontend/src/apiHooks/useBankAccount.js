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

// Hook to get bank accounts
export const useBankAccounts = (ownerId) => {
  return useQuery({
    queryKey: ["bankAccounts", ownerId],
    queryFn: async () => {
      if (!ownerId) return [];
      
      const response = await axios.get(
        `${API_BASE_URL}/wallet/bank-accounts/${ownerId}`,
        getAuthHeaders()
      );
      return response.data.bankAccounts || [];
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to add bank account
export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bankAccountData) => {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/bank-accounts`,
        bankAccountData,
        getAuthHeaders()
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch bank accounts
      queryClient.invalidateQueries(["bankAccounts"]);
      toast.success("Bank account added successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to add bank account";
      toast.error(message);
      console.error("Error adding bank account:", error);
    }
  });
};

// Hook to verify bank account
export const useVerifyBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bankAccountId) => {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/bank-accounts/${bankAccountId}/verify`,
        {},
        getAuthHeaders()
      );
      // Return both data and status so we can distinguish 200 vs 202
      return { data: response.data, status: response.status };
    },
    onSuccess: ({ data, status }) => {
      queryClient.invalidateQueries(["bankAccounts"]);
      if (status === 202 || /initiated/i.test(data?.message || "")) {
        toast.info(
          data?.message ||
            "Verification initiated. It may take a few minutes to complete."
        );
      } else {
        toast.success(data?.message || "Bank account verified successfully!");
      }
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to verify bank account";
      toast.error(message);
      console.error("Error verifying bank account:", error);
    }
  });
};

// Hook to delete/deactivate bank account
export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bankAccountId, ownerId }) => {
      const response = await axios.delete(
        `${API_BASE_URL}/wallet/bank-accounts/${bankAccountId}`,
        getAuthHeaders()
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["bankAccounts", variables.ownerId]);
      toast.success("Bank account removed successfully!");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to remove bank account";
      toast.error(message);
      console.error("Error removing bank account:", error);
    }
  });
};

// Hook to set default bank account
export const useSetDefaultBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bankAccountId, ownerId }) => {
      const response = await axios.put(
        `${API_BASE_URL}/wallet/bank-accounts/${bankAccountId}/default`,
        { ownerId },
        getAuthHeaders()
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["bankAccounts", variables.ownerId]);
      toast.success("Default bank account updated!");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to set default bank account";
      toast.error(message);
      console.error("Error setting default bank account:", error);
    }
  });
};
