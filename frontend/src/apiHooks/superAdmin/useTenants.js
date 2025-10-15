// v1.0.0 - Ashok - In online tenant is null by getting by it's Id

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// All tenants list
export const useTenants = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions, isInitialized } = usePermissions();

  const hasViewPermission = superAdminPermissions?.Tenants?.View;
  const hasAnyPermissions = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;

  // Simple enabled logic - enable if we have permissions or if initialized
  const isEnabled = Boolean(hasAnyPermissions || isInitialized);

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
      return response.data.organizations.reverse() || [];
    },
    enabled: isEnabled,
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
    const queryClient = useQueryClient();
  
  // v1.0.0 <-------------------------------------------------------------------
  console.log('2. CURRENT TENANT ID AT USE TENANT HOOK: ', id);
  // v1.0.0 ------------------------------------------------------------------->
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.Tenants?.View;
  const hasAnyPermissions = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;

  // Simple enabled logic - enable if we have permissions or if initialized, and have an ID
  const isEnabled = Boolean((hasAnyPermissions || isInitialized) && id);

  // v1.0.0 <--------------------------------------------------------------------
    console.log('HOOK1 PERMISSIONS: ', superAdminPermissions);
    console.log('HOOK2 hasAnyPermissions: ', hasAnyPermissions);
    console.log('HOOK3 isInitialized: ', isInitialized);
    console.log('HOOK4 isEnabled: ', isEnabled);
  // v1.0.0 -------------------------------------------------------------------->

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
        // v1.0.0 <-------------------------------------------------------------------
          console.log('3. CURRENT TENANT BY ITS ID AT USE TENANT HOOK: ', response.data?.organization);
        // v1.0.0 ------------------------------------------------------------------->
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
        console.log("Tenant deleted successfully, invalidating tenants query");
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
