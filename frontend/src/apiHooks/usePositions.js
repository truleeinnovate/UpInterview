import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const usePositions = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Positions?.View;

  const {
    data: positionData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['positions', filters],
    queryFn: async () => {
      const data = await fetchFilterData('position');
      return data.reverse();
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const positionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const method = id ? 'patch' : 'post';
      const url = id
        ? `${config.REACT_APP_API_URL}/position/${id}`
        : `${config.REACT_APP_API_URL}/position`;

      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['positions', filters], (oldData) => {
        if (!oldData) return oldData;
        
        if (variables.id) {
          // Update existing position
          return oldData.map(position => 
            position._id === variables.id 
              ? { ...position, ...data.data }
              : position
          );
        } else {
          // Add new position
          return [data.data, ...oldData];
        }
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries(['positions']);
    },
    onError: (error) => {
      console.error('Error adding/updating position:', error);
    },
  });

  const addRoundsMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/position/add-rounds`,
        payload
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['positions', filters], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(position => 
          position._id === variables.positionId 
            ? { ...position, rounds: [...(position.rounds || []), ...(Array.isArray(data.data) ? data.data : [data.data])] }
            : position
        );
      });
      
      queryClient.invalidateQueries(['positions']);
    },
    onError: (error) => {
      console.log('Error adding rounds:', error);
    },
  });

  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/position/delete-round/${roundId}`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['positions', filters], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(position => ({
          ...position,
          rounds: position.rounds?.filter(round => round._id !== variables) || []
        }));
      });
      
      queryClient.invalidateQueries(['positions']);
    },
    onError: (error) => {
      console.error('Error deleting round:', error);
      //toast.error('Failed to delete round');
    },
  });

  const isMutationLoading = positionMutation.isPending || addRoundsMutation.isPending || deleteRoundMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    positionData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isPositionMutationError: positionMutation.isError,
    positionMutationError: positionMutation.error,
    isAddRoundsMutationError: addRoundsMutation.isError,
    addRoundsMutationError: addRoundsMutation.error,
    addOrUpdatePosition: positionMutation.mutateAsync,
    addRounds: addRoundsMutation.mutateAsync,
    deleteRoundMutation: deleteRoundMutation.mutateAsync,
    refetch,
  };
};