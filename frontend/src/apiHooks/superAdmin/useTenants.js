// v1.0.0 - Ashok - In online tenant is null by getting by it's Id

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// All tenants list with pagination and filters
export const useTenants = ({
  page = 0,
  limit = 10,
  search = "",
  status = "",
  subscriptionStatus = "",
  plan = "",
  createdDate = "",
  minUsers = "",
  maxUsers = "",
  type = "",
} = {}) => {
  const queryClient = useQueryClient();
  const { superAdminPermissions, isInitialized } = usePermissions();

  const hasViewPermission = superAdminPermissions?.Tenants?.View;
  const hasAnyPermissions =
    superAdminPermissions && Object.keys(superAdminPermissions).length > 0;

  // Simple enabled logic - enable if we have permissions or if initialized
  const isEnabled = Boolean(hasAnyPermissions || isInitialized);

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  if (subscriptionStatus)
    queryParams.append("subscriptionStatus", subscriptionStatus);
  if (plan) queryParams.append("plan", plan);
  if (createdDate) queryParams.append("createdDate", createdDate);
  if (minUsers) queryParams.append("minUsers", minUsers);
  if (maxUsers) queryParams.append("maxUsers", maxUsers);
  if (type) queryParams.append("type", type);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "tenants",
      page,
      limit,
      search,
      status,
      subscriptionStatus,
      plan,
      createdDate,
      minUsers,
      maxUsers,
      type,
    ],
    queryFn: async () => {
      const response = await axios.get(
        `${
          config.REACT_APP_API_URL
        }/Organization/all-organizations?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true, // Keep previous data while fetching new page
  });

  // Add or Update Tenant
  const addOrUpdateTenant = useMutation({
    mutationFn: async ({ isEditing, id, tenantData }) => {
      if (isEditing) {
        const { data } = await axios.patch(
          `${config.REACT_APP_API_URL}/Organization/${id}`,
          tenantData
        );
        return data;
      } else {
        const { data } = await axios.post(
          `${config.REACT_APP_API_URL}/Organization`,
          tenantData
        );
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["tenants"]);
    },
    onError: (err) => {
      console.error("Tenant mutation error:", err.message);
    },
  });

  return {
    tenants: data?.data || [],
    pagination: data?.pagination || {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
      itemsPerPage: limit,
    },
    isLoading,
    isError,
    error,
    refetch,
    addOrUpdateTenant: addOrUpdateTenant.mutateAsync,
    isAddOrUpdateTenantLoading: addOrUpdateTenant.isPending,
    addOrUpdateTenantError: addOrUpdateTenant.error,
  };
};

// Individual tenant details by ID
export const useTenantById = (id) => {
  const queryClient = useQueryClient();

  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Tenants?.View;
  const hasAnyPermissions =
    superAdminPermissions && Object.keys(superAdminPermissions).length > 0;

  // Simple enabled logic - enable if we have permissions or if initialized, and have an ID
  const isEnabled = Boolean((hasAnyPermissions || isInitialized) && id);

  const {
    data: tenant,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/${id}`
      );
      return response.data?.organization || null;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  // Mutation for deleting a tenant and associated data (super admin only)
  const deleteTenantData = useMutation({
    mutationFn: async (tenantId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/Organization/${tenantId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tenants"]);
    },
    onError: (error) => {
      console.error("Error deleting tenant:", error);
      throw error;
    },
  });
  return {
    tenant,
    isLoading,
    isError,
    error,
    refetch,
    deleteTenantData,
  };
};
