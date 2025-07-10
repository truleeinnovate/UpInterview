import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useAssessments = () => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Assessment_Template?.View;
  const initialLoad = useRef(true);

  const {
    data: assessmentData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['Assessment_Template'],
    queryFn: async () => {
      const data = await fetchFilterData('assessment');
      return data.map(assessment => ({
        ...assessment,
        // Add any assessment-specific transformations here
      })).reverse(); // Latest first
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  console.log("assessmentData---", assessmentData);

  // Add/Update assessment mutation
  const addOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      let response;

      if (isEditing) {
        response = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData
        );
      } else {
        if (!tabsSubmitStatus?.["Basicdetails"]) {
          response = await axios.post(
            `${config.REACT_APP_API_URL}/assessments/new-assessment`,
            assessmentData
          );
        } else {
          response = await axios.patch(
            `${config.REACT_APP_API_URL}/assessments/update/${tabsSubmitStatus.responseId}`,
            assessmentData
          );
        }
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['Assessment_Template']);
    },
    onError: (error) => {
      console.error('Assessment save error:', error.message);
    }
  });

  // Questions upsert mutation
  const upsertAssessmentQuestions = useMutation({
    mutationFn: async (questionsData) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        questionsData
      );
      return response.data;
    },
    onError: (error) => {
      console.error('Questions upsert error:', error.message);
    }
  });

  // Fetch assessment questions by assessment ID
  const fetchAssessmentQuestions = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessment-questions/list/${assessmentId}`
      );
      if (response.data.success) {
        return {
          data: response.data.data,
          error: null
        };
      } else {
        throw new Error('Failed to fetch assessment questions');
      }
    } catch (error) {
      console.error('Error fetching assessment questions:', error.message);
      return {
        data: null,
        error: error.message
      };
    }
  };


  // Fetch results for a specific assessment
const fetchAssessmentResults = async (assessmentId) => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/assessments/${assessmentId}/results`
    );
    return {
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Error fetching assessment results:', error.message);
    return {
      data: [],
      error: error.message
    };
  }
};


// Fetch scheduled assessments for a specific assessment
const fetchScheduledAssessments = async (assessmentId) => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`
    );
    return {
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Error fetching scheduled assessments:', error.message);
    return {
      data: [],
      error: error.message
    };
  }
};



  // Calculate loading states
  const isMutationLoading = addOrUpdateAssessment.isPending || upsertAssessmentQuestions.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

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
    fetchScheduledAssessments
  };
};