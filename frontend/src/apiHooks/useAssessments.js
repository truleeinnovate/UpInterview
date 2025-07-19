// v1.0.0  -  Ashraf  -  while editing assessment id not getting issues
//v1.0.1  -  Ashraf  -  AssessmentTemplates permission name changed to AssessmentTemplates
//v1.0.2  -  Ashraf  -  assessment question api data get when exist is true
//v1.0.3  -  Ashraf  -  assessment data getting loop so added usecallback
//v1.0.4  -  Ashraf  -  assessment data added reverse to get updated data first
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
  // <---------------------- v1.0.3

import { useEffect, useRef, useCallback } from 'react';
// ------------------------------ v1.0.3 >
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useAssessments = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  // <---------------------- v1.0.1
  const hasViewPermission = effectivePermissions?.AssessmentTemplates?.View;
  // ---------------------- v1.0.1 >
  const initialLoad = useRef(true);

  const {
    data: assessmentData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    // <---------------------- v1.0.1
    queryKey: ['AssessmentTemplates', filters],
    // ---------------------- v1.0.1 >
    queryFn: async () => {
      const data = await fetchFilterData('assessment');
      return data.map(assessment => ({
        ...assessment,
        // <---------------------- v1.0.4
        // Add any assessment-specific transformations here
      })).reverse();
        // ---------------------- v1.0.4 >

    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const isLoading = isQueryLoading;

  // <---------------------- v1.0.0

  const addOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      
      if (isEditing && id && id !== '' && id !== null && id !== undefined) {
        
        const { data } = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData,
        );
        return data;
      }
      
      
      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessments/new-assessment`,
        assessmentData,
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      // <---------------------- v1.0.1
      queryClient.setQueryData(['AssessmentTemplates', filters], (oldData) => {
      // ---------------------- v1.0.1 >
        if (!oldData) return oldData;
        
        if (variables.isEditing && variables.id && variables.id !== '' && variables.id !== null && variables.id !== undefined) {
          // <---------------------- v1.0.0
          // Update existing assessment
          return oldData.map(assessment => 
            assessment._id === variables.id 
              ? { ...assessment, ...data.data }
              : assessment
          );
        } else {
          // Add new assessment
          return [data.data, ...oldData];
        }
      });
      
      // Invalidate to ensure consistency
      // <---------------------- v1.0.1
      queryClient.invalidateQueries(['AssessmentTemplates']);
      // ---------------------- v1.0.1 >
    },
    onError: (err) => {
      console.error('Assessment save error:', err.message);
    },
  });

  const upsertAssessmentQuestions = useMutation({
    mutationFn: async (assessmentQuestionsData) => {
      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        assessmentQuestionsData,
      );
      return data;
    },
    onSuccess: () => {
      // <---------------------- v1.0.1
      queryClient.invalidateQueries(['AssessmentTemplates']);
      // ---------------------- v1.0.1 >
    },
    onError: (err) => {
      console.error('Assessment questions save error:', err.message);
    },
  });
  // <---------------------- v1.0.3
  const fetchAssessmentQuestions = useCallback(async (assessmentId) => {
  // ------------------------------ v1.0.3 >
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessment-questions/list/${assessmentId}`
      );
      if (response.data.success) {
        // <---------------------- v1.0.2
        // If exists is false, the data might be empty or have empty sections
        if (response.data.exists === false) {
          return { data: { sections: [] }, error: null };
        }
        
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      return { data: null, error: error.message };
    }
  }, []);

  const fetchAssessmentResults = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessments/${assessmentId}/results`
      );
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      return { data: null, error: error.message };
    }
  };

  const fetchScheduledAssessments = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`
      );
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching scheduled assessments:', error);
      return { data: null, error: error.message };
    }
  };

  const isMutationLoading = addOrUpdateAssessment.isPending || upsertAssessmentQuestions.isPending;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    console.log('useAssessments state update:', {
      assessmentDataCount: assessmentData.length,
      isLoading,
      isQueryLoading,
      isMutationLoading
    });
  }, [assessmentData.length, isLoading, isQueryLoading, isMutationLoading]);

  return {
    assessmentData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isAddOrUpdateAssessmentError: addOrUpdateAssessment.isError,
    addOrUpdateAssessmentError: addOrUpdateAssessment.error,
    isUpsertQuestionsError: upsertAssessmentQuestions.isError,
    upsertQuestionsError: upsertAssessmentQuestions.error,
    addOrUpdateAssessment: addOrUpdateAssessment.mutateAsync,
    upsertAssessmentQuestions: upsertAssessmentQuestions.mutateAsync,
    fetchAssessmentQuestions, // assessment questions getting 
    fetchAssessmentResults,
    fetchScheduledAssessments,
    refetch,
  };
};