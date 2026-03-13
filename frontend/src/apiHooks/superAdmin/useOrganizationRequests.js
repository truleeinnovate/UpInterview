import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { config } from "../../config";
import axios from "axios";
import { usePermissions } from "../../Context/PermissionsContext";

const fetchOrganizationRequests = async () => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/organization-requests`,
      {
        withCredentials: true,
      }
    );

    if (!Array.isArray(response.data)) {
      console.error("[FRONTEND] Unexpected response format:", response.data);
      return [];
    }

    // The backend now returns the contact data directly in the response
    const processedData = response.data.map((request, index) => {
      const processed = {
        ...request,
        // The contact data is now available in request.contact
        contact: request.contact || {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "",
        },
        // Keep tenant data if available
        tenant: request.tenant || {},
        _debug: {
          hasContact: !!request.contact,
          contactKeys: request.contact ? Object.keys(request.contact) : [],
        },
      };

      return processed;
    });

    return processedData;
  } catch (error) {
    console.error("Error fetching organization requests:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

export const useOrganizationRequests = ({
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  // Permissions gating similar to other super admin hooks
  const { superAdminPermissions, isInitialized } = usePermissions();
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
    queryKey: ["organizationRequests", limit, search, status],
    queryFn: async ({ pageParam = 0 }) => {
      const base = `${config.REACT_APP_API_URL}/organization-requests`;
      const params = new URLSearchParams();
      params.append("page", String(pageParam));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      
      const response = await axios.get(`${base}?${params.toString()}`, {
        withCredentials: true,
      });
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
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: [],
  });

  // Update search query
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const updateOrganizationStatus = async (id, updateData) => {
    try {
      const response = await axios.put(
        `${config.REACT_APP_API_URL}/organization-requests/${id}/status`,
        updateData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`[API] Failed to update status for request ${id}:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };

  // Flatten all pages
  const organizationRequests = infiniteData?.pages?.flatMap((p) => (Array.isArray(p) ? p : p?.data || [])) || [];
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
    organizationRequests,
    pagination: { ...defaultPagination, ...firstPagination, hasNext: !!hasNextPage, currentPage: 0 },
    isLoading,
    isError,
    error,
    searchQuery,
    filters,
    handleSearch,
    updateFilters,
    updateOrganizationStatus,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

// ✅ Add this new fetcher inside the same file
const fetchAllReqForPaymentPendingPage = async () => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/organization-requests/all-req-for-payment-pending-page`,
      { withCredentials: true }
    );

    if (!response.data?.success) {
      console.error("[FRONTEND] Unexpected response:", response.data);
      return [];
    }

    const requests = response.data.data || [];
    return requests;
  } catch (error) {
    console.error("Error fetching requests for payment pending page:", error);
    throw error;
  }
};

// ✅ Export a dedicated hook for this page
export const useAllReqForPaymentPendingPage = (options = {}) => {
  return useQuery({
    queryKey: ["allOrganizationRequestsForPaymentPendingPage"],
    queryFn: fetchAllReqForPaymentPendingPage,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useOrganizationRequests;
