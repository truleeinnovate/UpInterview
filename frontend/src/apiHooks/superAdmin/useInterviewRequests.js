import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get interview requests (supports server-side pagination and filters)
export const useInterviewRequests = ({
  page = 0,
  limit = 10,
  search = "",
  status = "",
  type = "",
} = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InterviewRequest?.View;

  const params = new URLSearchParams();
  if (page !== undefined && page !== null) params.append("page", page.toString());
  if (limit !== undefined && limit !== null) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (type) params.append("type", type);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["interviewRequests", page, limit, search, status, type],
    queryFn: async () => {
      const url = `${config.REACT_APP_API_URL}/interviewrequest${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const defaultPagination = {
    currentPage: page,
    totalPages: 0,
    totalItems: Array.isArray(data) ? data.length : 0,
    hasNext: false,
    hasPrev: false,
    itemsPerPage: limit,
  };

  return {
    interviewRequests: Array.isArray(data) ? data : data?.data || [],
    pagination: Array.isArray(data) ? defaultPagination : data?.pagination || defaultPagination,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to get a single interview request by ID
export const useInterviewRequestById = (requestId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InterviewRequest?.View;

  const {
    data: interviewRequest = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["interviewRequest", requestId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/interviewrequest/${requestId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!requestId,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    interviewRequest,
    isLoading,
    isError,
    error,
    refetch,
  };
};
