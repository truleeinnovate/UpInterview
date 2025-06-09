import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const useQuestions = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = { questionBank: {} } } = usePermissions() || {};
  const sharingPermissions = useMemo(
    () => sharingPermissionscontext.questionBank || {},
    [sharingPermissionscontext]
  );

  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;

  // 1️⃣ Fetch My Questions
  const {
    data: myQuestionsList = {},
    isLoading: isMyQuestionsLoading,
    isError: isMyQuestionsError,
    error: myQuestionsError,
  } = useQuery({
    queryKey: ['myQuestions', sharingPermissions],
    queryFn: async () => {
      const filteredPositions = await fetchFilterData('tenentquestions', sharingPermissions);
      return Object.keys(filteredPositions).reduce((acc, key) => {
        acc[key] = Array.isArray(filteredPositions[key])
          ? filteredPositions[key].map((each) => ({ ...each, isAdded: false }))
          : [];
        return acc;
      }, {});
    },
    enabled: !!sharingPermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // 2️⃣ Fetch Created Lists
  const {
    data: createdLists = [],
    isLoading: isListsLoading,
    isError: isListsError,
    error: listsError,
  } = useQuery({
    queryKey: ['createdLists', userId],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`);
      return response.data.reverse();
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // 3️⃣ Fetch Suggested Questions
  const {
    data: suggestedQuestions = [],
    isLoading: isSuggestedQuestionsLoading,
    isError: isSuggestedQuestionsError,
    error: suggestedQuestionsError,
  } = useQuery({
    queryKey: ['suggestedQuestions'],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/suggested-questions/questions`);
      if (response.data.success) {
        return response.data.questions.map((q) => ({ ...q, isAdded: false }));
      }
      return [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

// ✅ Mutation #1: Save or Update a Question
  const saveOrUpdateQuestionMutation = useMutation({
    mutationFn: async ({ questionData, isEdit, questionId }) => {
      console.log('Starting saveOrUpdateQuestion mutation:', { isEdit, questionId });
      const url = isEdit
        ? `${config.REACT_APP_API_URL}/newquestion/${questionId}`
        : `${config.REACT_APP_API_URL}/newquestion`;
      const method = isEdit ? 'patch' : 'post';
      const response = await axios[method](url, questionData);
      console.log('Mutation response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('saveOrUpdateQuestion mutation succeeded');
      queryClient.invalidateQueries(['myQuestions']);
    },
    onError: (error) => {
      console.error('saveOrUpdateQuestion mutation failed:', error.response?.data?.message || error.message);
    },
  });

  // ✅ Mutation #2: Create or Update a List
  const saveOrUpdateListMutation = useMutation({
    mutationFn: async ({ isEditing, editingSectionId, newListName, newListNameForName, userId, orgId }) => {
      if (isEditing && editingSectionId) {
        const response = await axios.patch(`${config.REACT_APP_API_URL}/tenant-list/lists/${editingSectionId}`, {
          label: newListName,
          name: newListNameForName,
          ownerId: userId,
          tenantId: orgId,
        });
        return { updated: true, data: response.data };
      } else {
        const response = await axios.post(`${config.REACT_APP_API_URL}/tenant-list/lists`, {
          label: newListName,
          name: newListNameForName,
          ownerId: userId,
          tenantId: orgId,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      // Invalidate createdLists query
      queryClient.invalidateQueries(['createdLists']);
    },
    onError: (error) => {
      console.error('Failed to save or update list:', error.response?.data?.message || error.message);
    },
  });

  // ✅ Mutation #3: Add Question to List
  const addQuestionToListMutation = useMutation({
    mutationFn: async ({ listIds, questionId, userId, orgId }) => {
      const questionData = {
        tenantListId: listIds,
        suggestedQuestionId: questionId,
        ownerId: userId,
        tenantId: orgId,
      };
      const response = await axios.post(`${config.REACT_APP_API_URL}/newquestion`, questionData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate myQuestions, as adding a question to a list likely affects it
      queryClient.invalidateQueries(['myQuestions']);
    },
    onError: (error) => {
      console.error('Failed to add question to list:', error.response?.data?.message || error.message);
    },
  });

  return {
    myQuestionsList,
    createdLists,
    suggestedQuestions,
    isLoading: isMyQuestionsLoading || isListsLoading || isSuggestedQuestionsLoading,
    isError: isMyQuestionsError || isListsError || isSuggestedQuestionsError,
    myQuestionsError,
    listsError,
    suggestedQuestionsError,
    // Expose mutation functions and their states
    saveOrUpdateQuestion: saveOrUpdateQuestionMutation.mutateAsync,
    saveOrUpdateQuestionLoading: saveOrUpdateQuestionMutation.isPending,
    saveOrUpdateQuestionError: saveOrUpdateQuestionMutation.error,
    saveOrUpdateList: saveOrUpdateListMutation.mutateAsync,
    saveOrUpdateListLoading: saveOrUpdateListMutation.isPending,
    saveOrUpdateListError: saveOrUpdateListMutation.error,
    addQuestionToList: addQuestionToListMutation.mutateAsync,
    addQuestionToListLoading: addQuestionToListMutation.isPending,
    addQuestionToListError: addQuestionToListMutation.error,
  };
};