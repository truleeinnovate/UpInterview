import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";

// Get tenant ID from auth token
const getTenantId = () => {
  const authToken = AuthCookieManager.getAuthToken();
  return authToken ? JSON.parse(atob(authToken.split(".")[1])).tenantId : null;
};

// Legacy hook: fetch all teams for a tenant (no pagination)
export const useTeamsQuery = () => {
  const tenantId = getTenantId();

  return useQuery({
    queryKey: ["teams", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/data`,
        {
          params: { tenantId },
        },
      );
      console.log("response.data ", response.data);

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error("Invalid teams data format:", response.data);
        return [];
      }
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Backward compatibility alias
export const useGroupsQuery = useTeamsQuery;

// Paginated & filterable teams hook (used by My Teams list)
export const usePaginatedTeams = ({
  page = 0,
  limit,
  search = "",
  status = "",
} = {}) => {
  const tenantId = getTenantId();

  // Build query params
  const queryParams = new URLSearchParams();
  if (tenantId) queryParams.append("tenantId", tenantId);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["teams-paginated", tenantId, page, limit, search, status],
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
        `${config.REACT_APP_API_URL}/groups?${queryParams.toString()}`,
      );

      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  return {
    teams: data?.data || [],
    // Backward compatibility
    groups: data?.data || [],
    pagination: data?.pagination || {
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

// Backward compatibility alias
export const usePaginatedGroups = usePaginatedTeams;

// Create team mutation
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const tenantId = getTenantId();

  return useMutation({
    mutationFn: async (teamData) => {
      const response = await axios.post(`${config.REACT_APP_API_URL}/groups`, {
        ...teamData,
        tenantId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teams-paginated"]);
      // Backward compatibility
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["groups-paginated"]);
    },
    onError: (error) => {
      console.error("Error creating team:", error);
      throw error;
    },
  });
};

// Backward compatibility alias
export const useCreateGroup = useCreateTeam;

// Update team mutation
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, teamData, groupId, groupData }) => {
      // Support both new and old field names
      const id = teamId || groupId;
      const data = teamData || groupData;

      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/groups/update/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teams-paginated"]);
      queryClient.invalidateQueries(["team"]);
      // Backward compatibility
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["groups-paginated"]);
      queryClient.invalidateQueries(["group"]);
    },
    onError: (error) => {
      console.error("Error updating team:", error);
      throw error;
    },
  });
};

// Backward compatibility alias
export const useUpdateGroup = useUpdateTeam;

// Delete team mutation
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/groups/delete/${teamId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teams-paginated"]);
      // Backward compatibility
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["groups-paginated"]);
    },
    onError: (error) => {
      console.error("Error deleting team:", error);
      throw error;
    },
  });
};

// Backward compatibility alias
export const useDeleteGroup = useDeleteTeam;

// Add member to team mutation
export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, memberData, groupId }) => {
      const id = teamId || groupId;
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/groups/${id}/members`,
        memberData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teams-paginated"]);
      // Backward compatibility
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["groups-paginated"]);
    },
    onError: (error) => {
      console.error("Error adding team member:", error);
      throw error;
    },
  });
};

// Backward compatibility alias
export const useAddGroupMember = useAddTeamMember;

// Remove member from team mutation
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, memberId, groupId }) => {
      const id = teamId || groupId;
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/groups/${id}/members/${memberId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["teams-paginated"]);
      // Backward compatibility
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["groups-paginated"]);
    },
    onError: (error) => {
      console.error("Error removing team member:", error);
      throw error;
    },
  });
};

// Backward compatibility alias
export const useRemoveGroupMember = useRemoveTeamMember;

// Fetch team by ID
export const useTeamById = (teamId) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/${teamId}`,
      );
      return response.data;
    },
    enabled: !!teamId,
  });
};

// Backward compatibility alias
export const useGroupById = useTeamById;

// Fetch team members
export const useTeamMembers = (teamId) => {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/groups/${teamId}/members`,
      );
      return response.data;
    },
    enabled: !!teamId,
  });
};

// Backward compatibility alias
export const useGroupMembers = useTeamMembers;
