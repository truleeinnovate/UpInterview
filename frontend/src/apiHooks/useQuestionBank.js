import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const useQuestions = () => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.QuestionBank?.View;



  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  const {
    data: myQuestionsList = {},
    isLoading: isMyQuestionsLoading,
    isError: isMyQuestionsError,
    error: myQuestionsError,
  } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const data = await fetchFilterData('tenantquestions');
      return Object.keys(data).reduce((acc, key) => {
        acc[key] = Array.isArray(data[key])
          ? data[key].map(question => ({
            ...question,
            isAdded: false // Additional transformation
          }))
          : [];
        return acc;
      }, {});
    },
    enabled: !!hasViewPermission,
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
    queryKey: ['createdLists', userId, tenantId, organization],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`, {
        params: {
          tenantId: tenantId,
          organization: organization,
        },
      });
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

  // 4️⃣ Custom Hook: Fetch Question by Suggested ID
  const useQuestionBySuggestedId = (suggestedQuestionId) =>
    useQuery({
      queryKey: ['questionBySuggestedId', suggestedQuestionId, tenantId, userId],
      queryFn: async () => {
        if (!suggestedQuestionId) return null;
        try {
          const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`, {
            params: {
              [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId,
            },
          });
          return response.data;
        } catch (error) {
          if (error.response?.status === 404) {
            return null; // Handle not found gracefully
          }
          console.error('Error fetching question by suggested ID:', error.message);
          throw error; // Rethrow other errors for React Query to handle
        }
      },
      enabled: !!suggestedQuestionId && !!(organization ? tenantId : userId),
      staleTime: 1000 * 60 * 5,
    });

  // ✅ Mutation #1: Save or Update a Question
  const saveOrUpdateQuestionMutation = useMutation({
    mutationFn: async ({ questionData, isEdit, questionId }) => {
      // Ensure required fields are included
      const payload = {
        ...questionData,
        suggestedQuestionId: questionData.suggestedQuestionId || '',
        ownerId: userId || '',  // Add ownerId from current user
        isEdit: isEdit
      };

      console.log('Payload:', payload);
      console.log('isEdit:', isEdit);
      console.log('questionId:', questionId);

      const url = isEdit
        ? `${config.REACT_APP_API_URL}/newquestion/${questionId}`
        : `${config.REACT_APP_API_URL}/newquestion`;

      const method = isEdit ? 'patch' : 'post';
      const response = await axios[method](url, payload);
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
      queryClient.invalidateQueries(['createdLists']);
    },
    onError: (error) => {
      console.error('Failed to save or update list:', error.response?.data?.message || error.message);
    },
  });

  // ✅ Mutation #3: Add or Update Question in Lists
  const addQuestionToListMutation = useMutation({
    mutationFn: async ({ listIds, suggestedQuestionId }) => {
      if (!suggestedQuestionId || !listIds?.length) {
        throw new Error('Missing required fields');
      }

      try {
        // First get existing question with current lists
        const { data } = await axios.get(
          `${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`,
          { params: { [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId } }
        );

        // Merge existing and new list IDs
        const currentListIds = data.data?.tenantListId?.map(id => id.toString()) || [];
        const updatedListIds = [...new Set([...currentListIds, ...listIds])];

        // Update question with merged list IDs
        const response = await axios.patch(
          `${config.REACT_APP_API_URL}/newquestion/${data.data._id}`,
          { tenantListId: updatedListIds }
        );
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // Create new question if not found
          const createResponse = await axios.post(
            `${config.REACT_APP_API_URL}/newquestion`,
            {
              suggestedQuestionId,
              tenantListId: listIds,
              [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId
            }
          );
          return createResponse.data;
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['myQuestions']);
      queryClient.invalidateQueries(['questionBySuggestedId', variables.suggestedQuestionId]);
      queryClient.invalidateQueries(['allQuestionLists']);
    },
    onError: (error) => {
      console.error('Update failed:', error.response?.data?.message || error.message);
    }
  });

  // ✅ Mutation #4: Remove Question from Lists
  const removeQuestionFromListMutation = useMutation({
    mutationFn: async ({ suggestedQuestionId, listIdsToRemove, userId }) => {
      if (!suggestedQuestionId || !listIdsToRemove?.length) {
        throw new Error('Missing required fields: suggestedQuestionId or listIdsToRemove');
      }
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`, {
        params: {
          [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId,
        },
      });
      const existingQuestion = response.data;

      if (existingQuestion && existingQuestion.data) {
        const currentListIds = existingQuestion.data.tenantListId.map((id) => id.toString());
        const updatedListIds = currentListIds.filter((id) => !listIdsToRemove.includes(id));
        const updateResponse = await axios.patch(
          `${config.REACT_APP_API_URL}/newquestion/${existingQuestion.data._id}`,
          {
            tenantListId: updatedListIds,
            [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId,
            ownerId: userId,
          }
        );
        return updateResponse.data;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myQuestions']);
      queryClient.invalidateQueries(['questionBySuggestedId']);
    },
    onError: (error) => {
      console.error('Failed to remove question from lists:', error.response?.data?.message || error.message);
    },
  });

  return {
    myQuestionsList,
    createdLists,
    suggestedQuestions,
    useQuestionBySuggestedId,
    isLoading: isMyQuestionsLoading || isListsLoading || isSuggestedQuestionsLoading,
    isError: isMyQuestionsError || isListsError || isSuggestedQuestionsError,
    myQuestionsError,
    listsError,
    suggestedQuestionsError,
    saveOrUpdateQuestion: saveOrUpdateQuestionMutation.mutateAsync,
    saveOrUpdateQuestionLoading: saveOrUpdateQuestionMutation.isPending,
    saveOrUpdateQuestionError: saveOrUpdateQuestionMutation.error,
    saveOrUpdateList: saveOrUpdateListMutation.mutateAsync,
    saveOrUpdateListLoading: saveOrUpdateListMutation.isPending,
    saveOrUpdateListError: saveOrUpdateListMutation.error,
    addQuestionToList: addQuestionToListMutation.mutateAsync,
    addQuestionToListLoading: addQuestionToListMutation.isPending,
    addQuestionToListError: addQuestionToListMutation.error,
    removeQuestionFromList: removeQuestionFromListMutation.mutateAsync,
    removeQuestionFromListLoading: removeQuestionFromListMutation.isPending,
    removeQuestionFromListError: removeQuestionFromListMutation.error,
  };
};