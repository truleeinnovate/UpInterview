import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

// API hooks for getting the data and showing it in the candidate table and 
// kanban from the backend mapping
export const useCandidates = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const candidatePermissions = sharingPermissionscontext?.candidate || {};

  const { data: candidateData = [], isLoading } = useQuery({
    queryKey: ['candidates', candidatePermissions],
    
    queryFn: async () => {
      const filteredCandidates = await fetchFilterData('candidate', candidatePermissions);
      console.log('filteredCandidates', filteredCandidates);
      return filteredCandidates.map(candidate => {
        if (candidate.ImageData?.filename) {
          return {
            ...candidate,
            imageUrl: `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`,
          };
        }
        console.log('candidate', candidate);
        return candidate;
      }).reverse();
    },
    enabled: !!candidatePermissions,
  });

  // API hooks for adding or updating the candidate data
  const addOrUpdateCandidate = useMutation({
    mutationFn: async ({ id, data, file }) => {
      const method = id ? 'patch' : 'post';
      const url = id 
        ? `${config.REACT_APP_API_URL}/candidate/${id}` 
        : `${config.REACT_APP_API_URL}/candidate`;
        
      const response = await axios[method](url, data);
      const candidateId = response.data.data._id;

      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "candidate");
        imageData.append("id", candidateId);

        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    }
  });

  return { candidateData, isLoading, addOrUpdateCandidate };
};
