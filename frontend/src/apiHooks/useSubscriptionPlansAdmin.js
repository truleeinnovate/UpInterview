// v1.0.0 - Super Admin subscription plans hook (list/create/update/delete)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { config } from '../config';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const getAuth = () => {
  const authToken = Cookies.get('authToken');
  const token = authToken ? decodeJwt(authToken) : null;
  const userId = token?.userId;
  const userName = token?.name || token?.email || 'System';
  const headers = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined;
  return { headers, userId, userName };
};

export const useSubscriptionPlansAdmin = () => {
  const queryClient = useQueryClient();
  const { headers, userName } = getAuth();

  // Remove any `_id` keys deep in the object (pricing/features, etc.)
  const stripIds = (input) => JSON.parse(
    JSON.stringify(input, (key, value) => (key === '_id' ? undefined : value))
  );

  const plansQuery = useQuery({
    queryKey: ['subscriptionPlansAdmin'],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/all-subscription-plans?t=${Date.now()}` , headers);
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const body = stripIds({ ...payload });
      if (!body.createdBy) body.createdBy = userName;
      return (await axios.post(`${config.REACT_APP_API_URL}/subscriptions`, body, headers)).data;
    },
    onMutate: async () => {
      toast.loading('Creating plan...', { id: 'plan-create' });
    },
    onSuccess: () => {
      toast.success('Plan created', { id: 'plan-create' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create plan';
      toast.error(msg, { id: 'plan-create' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const body = stripIds({ ...data });
      body.modifiedBy = body.modifiedBy || userName;
      return (await axios.put(`${config.REACT_APP_API_URL}/subscription-plan-update/${id}`, body, headers)).data;
    },
    onMutate: async () => {
      toast.loading('Updating plan...', { id: 'plan-update' });
    },
    onSuccess: () => {
      toast.success('Plan updated', { id: 'plan-update' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update plan';
      toast.error(msg, { id: 'plan-update' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return (await axios.delete(`${config.REACT_APP_API_URL}/subscription-plan-delete/${id}`, headers)).data;
    },
    onMutate: async () => {
      toast.loading('Deleting plan...', { id: 'plan-delete' });
    },
    onSuccess: () => {
      toast.success('Plan deleted', { id: 'plan-delete' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete plan';
      toast.error(msg, { id: 'plan-delete' });
    },
  });

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    isError: plansQuery.isError,
    error: plansQuery.error,
    refetch: plansQuery.refetch,
    createPlan: createMutation.mutateAsync,
    updatePlan: updateMutation.mutateAsync,
    deletePlan: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};
