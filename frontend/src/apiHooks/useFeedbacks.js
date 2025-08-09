import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchFilterData } from '../api.js';
import { usePermissions } from '../Context/PermissionsContext';
import axios from 'axios';

export const useFeedbacks = (filters = {}) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Feedback?.View;

  console.log('[useFeedbacks] Debug:', {
    hasViewPermission,
    isInitialized,
    effectivePermissions: !!effectivePermissions,
    feedbackPermissions: effectivePermissions?.Feedback
  });

  return useQuery({
    queryKey: ['feedbacks', filters],
    queryFn: async () => {
      const data = await fetchFilterData('feedback', effectivePermissions);
      return data.reverse();
    },
    enabled: !!hasViewPermission && isInitialized,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
};

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/feedback`, feedbackData);
      return response.data;
    },
    onError: (error) => {
      console.error('Error creating feedback:', error);
      throw error;
    },
  });
};

export const useUpdateFeedback = () => {
  return useMutation({
    mutationFn: async ({ feedbackId, feedbackData }) => {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/feedback/${feedbackId}`, feedbackData);
      return response.data;
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      throw error;
    },
  });
};
