import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";

const getTenantId = () => {
  const authToken = AuthCookieManager.getAuthToken();
  return authToken ? JSON.parse(atob(authToken.split(".")[1])).tenantId : null;
};

export const useInterviewGroups = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const interviewGroupPermissions =
    sharingPermissionscontext?.interviewGroup || {};
  const tenantId = getTenantId();

  const {
    data: interviewGroupData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["interviewGroups", interviewGroupPermissions, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/data`,
        { params: { tenantId } }
      );
      return Array.isArray(response.data) ? response.data.reverse() : [];
    },
    enabled: !!interviewGroupPermissions && !!tenantId,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const method = id ? "patch" : "post";
      const url = id
        ? `${config.REACT_APP_API_URL}/groups/update/${id}`
        : `${config.REACT_APP_API_URL}/groups`;

      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewGroups"]);
    },
    onError: (error) => {
      console.error("Error adding/updating interview group:", error);
    },
  });

  const isMutationLoading = mutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    // Full list of groups for the tenant (used in Round forms, templates, etc.)
    interviewGroupData,
    groups: interviewGroupData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isMutationError: mutation.isError,
    mutationError: mutation.error,
    addOrUpdateInterviewGroup: mutation.mutateAsync,
  };
};
