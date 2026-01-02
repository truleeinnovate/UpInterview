import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../config";

// Helper to get common headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("authToken")}`,
});

const BASE_URL = `${config.REACT_APP_API_URL}/interview-policies`;

export const useInterviewPolicies = () => {
  // Existing Settlement Policy Mutation
  const settlementPolicyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`${BASE_URL}/settlement-policy`, data, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // -------------- BELOW HOOKS ARE BEING USED IN SUPER ADMIN ---------------------
  /* 
  Super admins Interview Policy
  */
  // Add this inside your useInterviewPolicies hook
  const createPolicyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`${BASE_URL}/create-policy`, data, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 1. GET ALL Policies Mutation
  const getAllPoliciesMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get(BASE_URL, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 2. GET Policy Mutation (Triggered on demand)
  const getPolicyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 3. UPDATE Policy Mutation
  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 4. DELETE Policy Mutation
  const deletePolicyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  return {
    // Actions
    getSettlementPolicy: settlementPolicyMutation.mutateAsync,
    createPolicy: createPolicyMutation.mutateAsync,
    getAllPolicies: getAllPoliciesMutation.mutateAsync,
    getPolicy: getPolicyMutation.mutateAsync,
    updatePolicy: updatePolicyMutation.mutateAsync,
    deletePolicy: deletePolicyMutation.mutateAsync,

    // Loading States
    isLoading:
      settlementPolicyMutation.isPending ||
      createPolicyMutation.isPending ||
      getAllPoliciesMutation.isPending ||
      getPolicyMutation.isPending ||
      updatePolicyMutation.isPending ||
      deletePolicyMutation.isPending,

    // Errors
    errors: {
      settlement: settlementPolicyMutation.error,
      allPolicies: getAllPoliciesMutation.error,
      get: getPolicyMutation.error,
      update: updatePolicyMutation.error,
      delete: deletePolicyMutation.error,
    },
  };
};
