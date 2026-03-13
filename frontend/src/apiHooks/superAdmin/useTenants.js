import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// All tenants list with infinite scroll
export const useTenants = ({
  limit = 20,
  search = "",
  status = "",
  subscriptionStatus = "",
  plan = "",
  createdDate = "",
  minUsers = "",
  maxUsers = "",
  type = "",
  valueFilter = "",
} = {}) => {
  const queryClient = useQueryClient();
  const { superAdminPermissions, isInitialized } = usePermissions();

  const hasViewPermission = superAdminPermissions?.Tenants?.View;
  const hasAnyPermissions =
    superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
  const isEnabled = Boolean(hasAnyPermissions || isInitialized);

  const {
    data: infiniteData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "tenants",
      limit,
      search,
      status,
      subscriptionStatus,
      plan,
      createdDate,
      minUsers,
      maxUsers,
      type,
      valueFilter,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pageParam.toString());
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
      if (valueFilter) queryParams.append("valueFilter", valueFilter);

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/all-tenants?${queryParams.toString()}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (pagination?.hasNext) {
        return (pagination?.currentPage ?? 0) + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages
  const tenants = infiniteData?.pages?.flatMap((p) => p?.data || []) || [];
  // Use first page's pagination for stats (totalItems, activeCount, etc.)
  const firstPagination = infiniteData?.pages?.[0]?.pagination || {};

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
    pagination: {
      ...firstPagination,
      currentPage: 0,
      totalPages: firstPagination.totalPages || 0,
      totalItems: firstPagination.totalItems || 0,
      hasNext: !!hasNextPage,
      hasPrev: false,
      itemsPerPage: limit,
    },
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
