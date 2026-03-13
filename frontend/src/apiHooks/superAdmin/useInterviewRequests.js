import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get interview requests (supports server-side pagination and filters)
export const useInterviewRequests = ({
  limit = 10,
  search = "",
  status = "",
  type = "",
} = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InterviewRequest?.View;

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
    queryKey: ["interviewRequests", limit, search, status, type],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append("page", pageParam.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (type) params.append("type", type);
      
      const url = `${config.REACT_APP_API_URL}/interviewrequest${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination?.hasNext || (pagination?.currentPage !== undefined && pagination?.currentPage < (pagination?.totalPages - 1))) {
        return (pagination?.currentPage ?? 0) + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages
  const interviewRequests = infiniteData?.pages?.flatMap((p) => (Array.isArray(p) ? p : p?.data || [])) || [];
  // Use first page's pagination for stats
  const firstPagination = infiniteData?.pages?.[0]?.pagination || {};

  const defaultPagination = {
    currentPage: 0,
    totalPages: firstPagination.totalPages || 0,
    totalItems: firstPagination.totalItems || (Array.isArray(infiniteData?.pages?.[0]) ? infiniteData.pages[0].length : 0),
    hasNext: !!hasNextPage,
    hasPrev: false,
    itemsPerPage: limit,
  };

  return {
    interviewRequests,
    pagination: { ...defaultPagination, ...firstPagination, hasNext: !!hasNextPage, currentPage: 0 },
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
