// v1.0.0 - Applications Hook for managing candidate applications

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import Cookies from "js-cookie";

/**
 * Hook to fetch single application by ID
 */
export const useApplicationById = (applicationId) => {
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["application", applicationId],
        queryFn: async () => {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/application/${applicationId}`
            );
            return response.data;
        },
        enabled: !!applicationId,
        retry: 1,
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
    });

    return {
        application: responseData?.data || {},
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Hook to fetch applications by candidate ID
 */
export const useApplicationsByCandidate = (candidateId) => {
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["applications", "candidate", candidateId],
        queryFn: async () => {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/application/candidate/${candidateId}`
            );
            return response.data;
        },
        enabled: !!candidateId,
        retry: 1,
        staleTime: 1000 * 30, // 30 seconds
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        applications: responseData?.data || [],
        total: responseData?.total || 0,
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Hook to fetch applications by position ID
 */
export const useApplicationsByPosition = (positionId) => {
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["applications", "position", positionId],
        queryFn: async () => {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/application/position/${positionId}`
            );
            return response.data;
        },
        enabled: !!positionId,
        retry: 1,
        staleTime: 1000 * 30,
        cacheTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    return {
        applications: responseData?.data || [],
        total: responseData?.total || 0,
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Hook for application mutations (create, update)
 */
export const useApplicationMutations = () => {
    const queryClient = useQueryClient();
    const authToken = Cookies.get("authToken") ?? "";

    // Create application mutation
    const createMutation = useMutation({
        mutationFn: async (applicationData) => {
            const response = await axios.post(
                `${config.REACT_APP_API_URL}/application`,
                applicationData,
                {
                    headers: authToken
                        ? {
                            Authorization: `Bearer ${authToken}`,
                        }
                        : undefined,
                    withCredentials: true,
                }
            );

            return response.data;
        },

        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: ["applications", "candidate", variables.candidateId],
            });

            queryClient.invalidateQueries({
                queryKey: ["applications", "position", variables.positionId],
            });

            // FIX: Also invalidate the filter query used by CandidateViewer
            queryClient.invalidateQueries({
                queryKey: ["applications", "filter"],
            });
        },

        onError: (error) => {
            console.error("Error creating application:", error);
        },
    });

    // Update application mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axios.patch(
                `${config.REACT_APP_API_URL}/application/${id}`,
                data
            );
            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate all application queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
        onError: (error) => {
            console.error("Error updating application:", error);
        },
    });

    // Update application status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, action, status }) => {
            const response = await axios.put(
                `${config.REACT_APP_API_URL}/application/status/${id}`,
                { action, status }
            );
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
        },
        onError: (error) => {
            console.error("Error updating application status:", error);
        },
    });

    return {
        createApplication: createMutation.mutateAsync,
        updateApplication: updateMutation.mutateAsync,
        updateApplicationStatus: updateStatusMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        createError: createMutation.error,
        updateError: updateMutation.error,
    };
};

/**
 * Hook to filter applications by candidate and position
 */
export const useApplicationFilter = (candidateId, positionId) => {
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["applications", "filter", candidateId, positionId],
        queryFn: async () => {
            // Only fetch if both IDs are present
            if (!candidateId || !positionId) return { data: [], total: 0 };

            const response = await axios.get(
                `${config.REACT_APP_API_URL}/application/filter`,
                {
                    params: { candidateId, positionId }
                }
            );
            return response.data;
        },
        enabled: !!candidateId && !!positionId,
        retry: 1,
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
    });

    return {
        applications: responseData?.data || [],
        total: responseData?.total || 0,
        isLoading,
        isError,
        error,
        refetch,
    };
};

/**
 * Hook to filter applications with flexible criteria (status, tenant, candidate, position)
 */
export const useFilteredApplications = (filters = {}) => {
    const {
        data: responseData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["applications", "filtered", filters],
        queryFn: async () => {
            const params = {};
            if (filters.candidateId) params.candidateId = filters.candidateId;
            if (filters.positionId) params.positionId = filters.positionId;
            if (filters.status) params.status = filters.status; // Comma separated string
            if (filters.tenantId) params.tenantId = filters.tenantId;

            // If no filters provided, maybe return empty or all?
            // For now, let's assume at least one filter is usually desired, but the backend handles empty query by returning all (if we allowed it).
            // Backend currently checks if filters are present.

            const response = await axios.get(
                `${config.REACT_APP_API_URL}/application/filter`,
                { params }
            );
            return response.data;
        },
        enabled: Object.keys(filters).length > 0, // Only fetch if filters are provided
        retry: 1,
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
    });

    return {
        applications: responseData?.data || [],
        total: responseData?.total || 0,
        isLoading,
        isError,
        error,
        refetch,
    };
};
