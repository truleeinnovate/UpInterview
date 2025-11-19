// v1.0.0 - Super Admin subscription plans hook (list/create/update/delete)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { config } from '../config';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { notify } from '../services/toastService';

const getAuth = () => {
  const authToken = Cookies.get('authToken');
  const token = authToken ? decodeJwt(authToken) : null;
  const userId = token?.userId;
  const userName = token?.name || token?.email || 'System';
  const headers = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined;
  return { headers, userId, userName };
};

export const useSubscriptionPlansAdmin = (options = {}) => {
  const queryClient = useQueryClient();
  const { headers, userName } = getAuth();

  // Remove any `_id` keys deep in the object (pricing/features, etc.)
  const stripIds = (input) => JSON.parse(
    JSON.stringify(input, (key, value) => (key === '_id' ? undefined : value))
  );

  const { page, limit, search, subscriptionTypes, activeStates, createdDate } = options || {};

  const plansQuery = useQuery({
    queryKey: ['subscriptionPlansAdmin', { page: page || 1, limit: limit || 10, search: search || '', subscriptionTypes: subscriptionTypes || '', activeStates: activeStates || '', createdDate: createdDate || '' }],
    queryFn: async () => {
      const params = {};
      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (typeof search === 'string' && search.trim()) params.search = search.trim();
      if (subscriptionTypes) params.subscriptionTypes = subscriptionTypes;
      if (activeStates) params.activeStates = activeStates;
      if (createdDate) params.createdDate = createdDate;

      const url = `${config.REACT_APP_API_URL}/all-subscription-plans`;
      const res = await axios.get(url, { ...(headers || {}), params });
      const data = res?.data;
      // Legacy array response fallback
      if (Array.isArray(data)) {
        return { plans: data, total: data.length, page: page || 1, itemsPerPage: limit || data.length };
      }
      return {
        plans: Array.isArray(data?.plans) ? data.plans : [],
        total: data?.total ?? 0,
        page: data?.page ?? (page || 1),
        itemsPerPage: data?.itemsPerPage ?? (limit || 10),
      };
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
      notify.success('Plan created', { id: 'plan-create' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create plan';
      notify.error(msg, { id: 'plan-create' });
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
      notify.success('Plan updated', { id: 'plan-update' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update plan';
      notify.error(msg, { id: 'plan-update' });
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
      notify.success('Plan deleted', { id: 'plan-delete' });
      queryClient.invalidateQueries(['subscriptionPlansAdmin']);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete plan';
      notify.error(msg, { id: 'plan-delete' });
    },
  });

  const normalized = plansQuery.data || { plans: [], total: 0, page: page || 1, itemsPerPage: limit || 10 };

  return {
    plans: normalized.plans,
    total: normalized.total,
    currentPage: normalized.page,
    itemsPerPage: normalized.itemsPerPage,
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
