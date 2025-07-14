import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// All tenants list
export const useTenants = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions, isInitialized } = usePermissions();

  const hasViewPermission = superAdminPermissions?.Tenants?.View;

  const {
    data: tenants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/all-organizations`
      );
      return response.data.organizations || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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
    tenants,
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
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Tenants?.View;

  const {
    data: tenant = null,
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
    enabled: isInitialized && !!hasViewPermission && !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    tenant,
    isLoading,
    isError,
    error,
    refetch,
  };
};
