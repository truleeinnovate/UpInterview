// v1.0.0 - Venkatesh - TanStack Query hook to fetch tenant tax configuration (GST, service charge)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";

const BASE_URL = `${config.REACT_APP_API_URL}/regional-taxes`;

export const useTenantTaxConfig = () => {
  const tenantId = AuthCookieManager.getCurrentTenantId();

  return useQuery({
    queryKey: ["tenantTaxConfig", tenantId || "default"],
    queryFn: async () => {
      const url = `${config.REACT_APP_API_URL}/wallet/tax-config`;
      const axiosConfig = tenantId ? { params: { tenantId } } : {};
      const response = await axios.get(url, axiosConfig);
      return response?.data || null;
    },
    enabled: !!tenantId,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useRegionalTaxConfigs = () => {
  return useQuery({
    queryKey: ["regionalTaxConfigs"],
    queryFn: async () => {
      const response = await axios.get(BASE_URL);
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useRegionalTaxConfigById = (id) => {
  return useQuery({
    queryKey: ["regionalTaxConfig", id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response?.data?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useCreateRegionalTaxConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(BASE_URL, payload);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["regionalTaxConfigs"]);
    },
  });
};

export const useUpdateRegionalTaxConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await axios.put(`${BASE_URL}/${id}`, payload);
      return response?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["regionalTaxConfigs"]);
      queryClient.invalidateQueries(["regionalTaxConfig", variables.id]);
    },
  });
};

export const useDeleteRegionalTaxConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["regionalTaxConfigs"]);
    },
  });
};
