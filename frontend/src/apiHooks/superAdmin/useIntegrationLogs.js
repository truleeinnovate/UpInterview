// v1.0.0 - Ashok - Added console statements to check data fetching

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all integration logs
export const useIntegrationLogs = (options = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.IntegrationLogs?.View;

  const {
    data: responseData = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["integrationLogs", options],
    queryFn: async () => {
      const page = Number.isFinite(options.page) ? options.page : undefined;
      const limit = Number.isFinite(options.limit) ? options.limit : undefined;
      const search = typeof options.search === "string" ? options.search : undefined;
      const statusParam = Array.isArray(options.status)
        ? options.status.join(",")
        : typeof options.status === "string"
        ? options.status
        : undefined;
      const severityParam = Array.isArray(options.severity)
        ? options.severity.join(",")
        : typeof options.severity === "string"
        ? options.severity
        : undefined;

      const hasParams =
        page !== undefined ||
        limit !== undefined ||
        (search && search.length > 0) ||
        (statusParam && statusParam.length > 0) ||
        (severityParam && severityParam.length > 0);

      const axiosConfig = hasParams
        ? { params: { page, limit, search, status: statusParam, severity: severityParam } }
        : undefined;

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/integration-logs`,
        axiosConfig
      );
      return response.data ?? null;
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const payload = responseData;
  const integrations = Array.isArray(payload)
    ? payload
    : payload?.data || [];

  const fallbackTotal = Array.isArray(integrations) ? integrations.length : 0;
  const pagination = Array.isArray(payload)
    ? {
        currentPage: 0,
        totalPages: 1,
        totalItems: fallbackTotal,
        hasNext: false,
        hasPrev: false,
        itemsPerPage: 0,
      }
    : payload?.pagination || {
        currentPage: 0,
        totalPages: 1,
        totalItems: fallbackTotal,
        hasNext: false,
        hasPrev: false,
        itemsPerPage: 0,
      };

  const stats = Array.isArray(payload) ? null : payload?.stats || null;

  return {
    integrations,
    pagination,
    stats,
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
