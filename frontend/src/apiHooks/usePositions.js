import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const usePositions = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const positionPermissions = sharingPermissionscontext?.position || {};


  const {
    data: positionData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['positions', positionPermissions],
    queryFn: async () => {
      const filteredPositions = await fetchFilterData('position', positionPermissions);
      return filteredPositions.reverse(); // Latest first
    },
    enabled: !!positionPermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    deleteRoundMutation:deleteRoundMutation.mutateAsync
  };
};