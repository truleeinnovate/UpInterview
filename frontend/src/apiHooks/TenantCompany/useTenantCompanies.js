import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../../config";

// Helper to get common headers
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("authToken")}`,
});

const BASE_URL = `${config.REACT_APP_API_URL}/tenant-companies`;

export const useCompanies = () => {
  // 1. CREATE Company Mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`${BASE_URL}/create-company`, data, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 2. GET ALL Companies Mutation
  const getAllCompaniesMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.get(BASE_URL, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 3. GET Single Company Mutation (by ID)
  const getCompanyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 4. UPDATE Company Mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, updateData }) => {
      const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  // 5. DELETE Company Mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    },
  });

  return {
    // Actions
    createCompany: createCompanyMutation.mutateAsync,
    getAllCompanies: getAllCompaniesMutation.mutateAsync,
    getCompany: getCompanyMutation.mutateAsync,
    updateCompany: updateCompanyMutation.mutateAsync,
    deleteCompany: deleteCompanyMutation.mutateAsync,

    // Loading States
    isLoading:
      createCompanyMutation.isPending ||
      getAllCompaniesMutation.isPending ||
      getCompanyMutation.isPending ||
      updateCompanyMutation.isPending ||
      deleteCompanyMutation.isPending,

    // Errors
    errors: {
      create: createCompanyMutation.error,
      allCompanies: getAllCompaniesMutation.error,
      get: getCompanyMutation.error,
      update: updateCompanyMutation.error,
      delete: deleteCompanyMutation.error,
    },
  };
};
