import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// Get tenant ID from auth token
const getTenantId = () => {
  const authToken = AuthCookieManager.getAuthToken();
  return authToken ? JSON.parse(atob(authToken.split('.')[1])).tenantId : null;
};

// Legacy hook: fetch all groups for a tenant (no pagination)
export const useGroupsQuery = () => {
  const tenantId = getTenantId();

  return useQuery({
    queryKey: ['groups', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/data`,
        {
          params: { tenantId },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error("Invalid groups data format:", response.data);
        return [];
      }
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Paginated & filterable groups hook (used by InterviewerGroups list)
export const usePaginatedGroups = ({
  page = 0,
  limit,
  search = '',
  status = '',
} = {}) => {
  const tenantId = getTenantId();

  // Build query params
  const queryParams = new URLSearchParams();
  if (tenantId) queryParams.append('tenantId', tenantId);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['groups-paginated', tenantId, page, limit, search, status],
    queryFn: async () => {
      if (!tenantId) {
        return {
          data: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalItems: 0,
            hasNext: false,
            hasPrev: false,
            itemsPerPage: limit,
          },
        };
      }

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  return {
    groups: data?.data || [],
    pagination:
      data?.pagination || {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        hasNext: false,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Create group mutation
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const tenantId = getTenantId();

  return useMutation({
    mutationFn: async (groupData) => {
      const response = await axios.post(`${config.REACT_APP_API_URL}/groups`, {
        ...groupData,
        tenantId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['groups-paginated']);
    },
    onError: (error) => {
      console.error("Error creating group:", error);
      throw error;
    },
  });
};

// Update group mutation
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, groupData }) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/groups/update/${groupId}`,
        groupData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['groups-paginated']);
    },
    onError: (error) => {
      console.error("Error updating group:", error);
      throw error;
    },
  });
};

// Delete group mutation
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/groups/delete/${groupId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['groups-paginated']);
    },
    onError: (error) => {
      console.error("Error deleting group:", error);
      throw error;
    },
  });
};

// Add member to group mutation
export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberData }) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/groups/${groupId}/members`,
        memberData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['groups-paginated']);
    },
    onError: (error) => {
      console.error("Error adding group member:", error);
      throw error;
    },
  });
};

// Remove member from group mutation
export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, memberId }) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/groups/${groupId}/members/${memberId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      queryClient.invalidateQueries(['groups-paginated']);
    },
    onError: (error) => {
      console.error("Error removing group member:", error);
      throw error;
    },
  });
};

// Fetch group by ID
export const useGroupById = (groupId) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/${groupId}`
      );
      return response.data;
    },
    enabled: !!groupId,
  });
};

// Fetch group members
export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/${groupId}/members`
      );
      return response.data;
    },
    enabled: !!groupId,
  });
};