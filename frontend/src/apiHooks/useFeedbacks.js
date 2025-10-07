import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchFilterData } from '../api.js';
import { usePermissions } from '../Context/PermissionsContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useFeedbacks = (filters = {}) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Feedback?.View;

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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/feedback/create`, feedbackData);
      return response.data;
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error("⚠️ Feedback already exists for this candidate and round!");
      } else {
        toast.error("❌ Failed to submit feedback: " + error.message);
      }
      // console.error('Error creating feedback:', error);
      // throw error;
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



export const useFeedbackData = (roundId, interviewerId) => {
  return useQuery({
    queryKey: ['feedbackData', roundId, interviewerId],
    queryFn: async () => {
      if (!roundId) {
        console.log('No round ID provided, skipping feedback fetch');
        return null;
      }

      console.log('🔍 Fetching feedback data for round ID:', roundId);
      console.log('👤 Interviewer ID for filtering:', interviewerId);

      // Build URL with query parameters
      let url = `${process.env.REACT_APP_API_URL}/feedback/round/${roundId}`;
      if (interviewerId) {
        url += `?interviewerId=${interviewerId}`;
      }

      console.log('🌐 Making API call to:', url);

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${Cookies.get('authToken')}`
        },
      });

      if (response.data.success) {
        console.log('✅ Feedback data fetched successfully:', response.data.data);
        console.log('📊 Response summary:', {
          hasInterviewRound: !!response.data.data.interviewRound,
          hasCandidate: !!response.data.data.candidate,
          hasPosition: !!response.data.data.position,
          interviewersCount: response.data.data.interviewers?.length || 0,
          feedbacksCount: response.data.data.feedbacks?.length || 0,
          interviewQuestionsCount: response.data.data.interviewQuestions?.length || 0,
          filteredByInterviewer: response.data.data.filteredByInterviewer || false
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch feedback data');
      }
    },
    enabled: !!roundId, // only run if roundId exists
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
};
