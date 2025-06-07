import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useInterviewGroups = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const interviewGroupPermissions = sharingPermissionscontext?.interviewGroup || {};

  console.log('useInterviewGroups initialized with permissions:', interviewGroupPermissions);

  const { 
    data: interviewGroupData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['interviewGroups', interviewGroupPermissions],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/groups`);
      return response.data.reverse();
    },
    enabled: !!interviewGroupPermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const method = id ? 'patch' : 'post';
      const url = id
        ? `${config.REACT_APP_API_URL}/groups/update/${id}`
        : `${config.REACT_APP_API_URL}/groups`;

      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewGroups']);
    },
    onError: (error) => {
      console.error('Error adding/updating interview group:', error);
    },
  });

  const isMutationLoading = mutation.isPending; 
  const isLoading = isQueryLoading || isMutationLoading;

  console.log('useInterviewGroups states:', {
    isQueryLoading,
    isMutationLoading,
    isLoading,
    interviewGroupDataCount: interviewGroupData.length,
    mutationState: mutation,
  });

  return {
    interviewGroupData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isMutationError: mutation.isError,
    mutationError: mutation.error,
    addOrUpdateInterviewGroup: mutation.mutateAsync,
  };
};