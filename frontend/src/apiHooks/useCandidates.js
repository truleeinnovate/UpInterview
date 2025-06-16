import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useCandidates = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const candidatePermissions = sharingPermissionscontext?.candidate || {};

  const {
    data: candidateData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['candidates', candidatePermissions],
    queryFn: async () => {
      const filteredCandidates = await fetchFilterData('candidate', candidatePermissions);
      return filteredCandidates.map(candidate => {
        if (candidate.ImageData?.filename) {
          return {
            ...candidate,
            imageUrl: `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`,
          };
        }
        return candidate;
      }).reverse();
    },
    enabled: !!candidatePermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const method = id ? 'patch' : 'post';
      const url = id
        ? `${config.REACT_APP_API_URL}/candidate/${id}`
        : `${config.REACT_APP_API_URL}/candidate`;

      const response = await axios[method](url, data);
      const candidateId = response.data.data._id;

      if (file) {
        const imageData = new FormData();
        imageData.append('image', file);
        imageData.append('type', 'candidate');
        imageData.append('id', candidateId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Error adding/updating candidate:', error);
    },
  });

  // Use mutation.isPending instead of checking status (for v5+)
  // For v4, use mutation.isLoading
  const isMutationLoading = mutation.isPending; // or mutation.isLoading for v4
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    candidateData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isMutationError: mutation.isError,
    mutationError: mutation.error,
    addOrUpdateCandidate: mutation.mutateAsync,
  };
};