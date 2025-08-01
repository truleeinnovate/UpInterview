// v1.0.0 - Ashok - Added console statements to check data fetching

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all integration logs
export const useIntegrationLogs = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.IntegrationLogs?.View;

  const {
    data: integrations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["integrationLogs"],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/integration-logs`
      );
      // v1.0.0 <------------------------------------------------------
      console.log("1. INTEGRATION LOGS AT RESPONSE HOOK: ", response.data);
      // v1.0.0 ------------------------------------------------------>
      return response.data || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    integrations,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to fetch integration log by ID
export const useIntegrationLogById = (logId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.IntegrationLogs?.View;

  const {
    data: selectedLog = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["integrationLog", logId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/integration-logs/${logId}`
      );
      // v1.0.0 <------------------------------------------------------
      console.log("3. INTEGRATION LOGS AT RESPONSE HOOK: ", response.data);
      // v1.0.0 ------------------------------------------------------>
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!logId,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    selectedLog,
    isLoading,
    isError,
    error,
    refetch,
  };
};
