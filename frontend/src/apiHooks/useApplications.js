// v1.0.0 - Applications Hook for managing candidate applications

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";

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

    // Create application mutation
    const createMutation = useMutation({
        mutationFn: async (applicationData) => {
            const response = await axios.post(
                `${config.REACT_APP_API_URL}/application`,
                applicationData
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

    return {
        createApplication: createMutation.mutateAsync,
        updateApplication: updateMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        createError: createMutation.error,
        updateError: updateMutation.error,
    };
};
