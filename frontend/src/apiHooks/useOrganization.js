// v1.0.1 - Ashok - Updated to match add/update style & prop structure

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";

// ✅ Centralized Query Keys
export const organizationKeys = {
  all: ["organizations"],
  lists: () => [...organizationKeys.all, "list"],
  list: (filters) => [...organizationKeys.lists(), filters],
  details: () => [...organizationKeys.all, "detail"],
  detail: (id) => [...organizationKeys.details(), id],
  addresses: (id) => [...organizationKeys.detail(id), "addresses"],
};

//  ✅ Fetch Organization

export const useOrganization = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  const {
    data: organizationData,
    isLoading: organizationsLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["organization", tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error("Invalid organization ID");

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/organization-details/${tenantId}`,
      );

      return response.data?.organization ?? response.data;
    },
    enabled: !!tenantId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  return {
    organizationData,
    organizationsLoading,
    error,
    isError,
    refetch,
  };
};

// Single function that handles both the API call and React Query hook
// ✅ Fetch Organization Details by ID
export const useOrganizationDetails = (organizationId, options = {}) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/Organization/organization-details/${organizationId}`,
      );

      return response.data;
    },
    enabled: !!organizationId && (options.enabled ?? true),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

//  ✅ Add / Update Organization

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const url = `${config.REACT_APP_API_URL}/Organization/organization-details/${id}`;
      const response = await axios.patch(url, data, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    },

    onSuccess: (_, variables) => {
      // Refresh the updated organization record
      queryClient.invalidateQueries(["organization", variables.id]);

      // Optional: refresh all org list entries
      queryClient.invalidateQueries(["organizations"]);
    },
  });

  return {
    addOrUpdateOrganization: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

// export const useOrganizationAddresses = (organizationId, isOpen) => {
//   return useQuery({
//     queryKey: ["organizationAddresses", organizationId],
//     queryFn: async () => {
//       const response = await axios.get(
//         `${config.REACT_APP_API_URL}/Organization/organization-details/${organizationId}`,
//       );
//       return response.data.offices || [];
//     },
//     enabled: isOpen && !!organizationId,
//   });
// };
