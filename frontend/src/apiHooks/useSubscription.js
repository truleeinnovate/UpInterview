// v1.0.0 - Venkatesh - Implement TanStack Query hook for subscriptions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { config } from '../config';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const getUserContext = () => {
  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization; // could be boolean true or string 'false'
  const userType = organization === true ? 'organization' : 'individual';
  return { authToken, ownerId, tenantId, organization, userType };
};

const authHeader = (authToken) => ({ headers: { Authorization: `Bearer ${authToken}` } });

const formatPlans = (plans, userType) => {
  if (!Array.isArray(plans)) return [];
  const filtered = plans.filter((p) => p.subscriptionType === userType);
  return filtered.map((plan) => {
    const monthlyPricing = plan.pricing?.find((p) => p.billingCycle === 'monthly');
    const annualPricing = plan.pricing?.find((p) => p.billingCycle === 'annual');

    const calcPct = (price, discount) => (price && discount ? Math.round((discount / price) * 100) : 0);

    return {
      name: plan.name,
      planId: plan._id,
      monthlyPrice: monthlyPricing?.price || 0,
      annualPrice: annualPricing?.price || 0,
      isDefault: plan.name === 'Pro',
      razorpayPlanIds: plan.razorpayPlanIds || {},
      features: Array.isArray(plan.features)
        ? plan.features.map((f) => `${f.name} (${f.description})`)
        : [],
      monthlyBadge:
        monthlyPricing?.discountType === 'percentage' && monthlyPricing?.discount > 0
          ? `Save ${calcPct(monthlyPricing.price, monthlyPricing.discount)}%`
          : null,
      annualBadge:
        annualPricing?.discountType === 'percentage' && annualPricing?.discount > 0
          ? `Save ${calcPct(annualPricing.price, annualPricing.discount)}%`
          : null,
      monthlyDiscount:
        monthlyPricing?.discountType === 'percentage' && monthlyPricing?.discount > 0
          ? parseInt(monthlyPricing.discount)
          : null,
      annualDiscount:
        annualPricing?.discountType === 'percentage' && annualPricing?.discount > 0
          ? parseInt(annualPricing.discount)
          : null,
    };
  });
};

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const { authToken, ownerId, tenantId, organization, userType } = getUserContext();

  // Current subscription
  const {
    data: subscriptionData = {},
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription', ownerId],
    queryFn: async () => {
      if (!ownerId) return {};
      const res = await axios.get(`${config.REACT_APP_API_URL}/subscriptions/${ownerId}`,(authToken ? authHeader(authToken) : undefined));
      const sub = res?.data?.customerSubscription?.[0] || {};
      if (sub && !sub.paymentMethod) {
        sub.paymentMethod = 'card';
      }
      return sub;
    },
    enabled: !!ownerId,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Available plans
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['subscriptionPlans', userType],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/all-subscription-plans?t=${Date.now()}`,(authToken ? authHeader(authToken) : undefined));
      return formatPlans(res?.data || [], userType);
    },
    enabled: !!userType,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }) => {
      if (!subscriptionData?._id || !subscriptionData?.razorpaySubscriptionId) {
        throw new Error('No active subscription found');
      }
      const payload = {
        subscriptionId: subscriptionData._id,
        razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
        newPlanId: planId,
        newBillingCycle: billingCycle,
        tenantId,
        ownerId,
      };
      toast.loading('Updating your subscription plan...', { id: 'subscription-update' });
      const res = await axios.post(
        `${config.REACT_APP_API_URL}/subscription-update/update-subscription-plan`,
        payload,
        authToken ? authHeader(authToken) : undefined
      );
      return res.data;
    },
    onSuccess: () => {
      toast.dismiss('subscription-update');
      toast.success('Your subscription plan has been updated successfully!');
      queryClient.invalidateQueries(['subscription', ownerId]);
      queryClient.invalidateQueries(['subscriptionPlans', userType]);
    },
    onError: (error) => {
      toast.dismiss('subscription-update');
      const msg = error?.response?.data?.message || error?.message || 'Failed to update subscription plan';
      toast.error(msg);
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ reason = 'user_requested' } = {}) => {
      if (!subscriptionData?._id || !subscriptionData?.razorpaySubscriptionId) {
        throw new Error('No active subscription found');
      }
      const payload = {
        subscriptionId: subscriptionData._id,
        razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
        tenantId,
        ownerId,
        reason,
      };
      toast.loading('Processing your cancellation request...', { id: 'subscription-cancel' });
      const res = await axios.post(
        `${config.REACT_APP_API_URL}/cancel-subscription`,
        payload,
        authToken ? authHeader(authToken) : undefined
      );
      return res.data;
    },
    onSuccess: () => {
      toast.dismiss('subscription-cancel');
      toast.success('Your subscription has been cancelled successfully!');
      queryClient.invalidateQueries(['subscription', ownerId]);
      queryClient.invalidateQueries(['subscriptionPlans', userType]);
    },
    onError: (error) => {
      toast.dismiss('subscription-cancel');
      const msg = error?.response?.data?.message || error?.message || 'Failed to cancel subscription';
      toast.error(msg);
    },
  });

  // Initialize customer subscription (DB + invoice) mutation
  const createCustomerSubscriptionMutation = useMutation({
    mutationFn: async (payload) => {
      if (!ownerId || !tenantId) {
        throw new Error('Missing owner or tenant information');
      }
      const res = await axios.post(
        `${config.REACT_APP_API_URL}/create-customer-subscription`,
        payload,
        authToken ? authHeader(authToken) : undefined
      );
      return res.data;
    },
    onSuccess: () => {
      // Keep data fresh
      queryClient.invalidateQueries(['subscription', ownerId]);
      queryClient.invalidateQueries(['subscriptionPlans', userType]);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create customer subscription';
      toast.error(msg);
    },
  });

  // Create subscription (Razorpay) mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (payload) => {
      if (!ownerId || !tenantId) {
        throw new Error('Missing owner or tenant information');
      }
      const res = await axios.post(
        `${config.REACT_APP_API_URL}/payment/create-subscription`,
        payload,
        authToken ? authHeader(authToken) : undefined
      );
      return res.data;
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create subscription payment session';
      toast.error(msg);
    },
  });

  // Verify subscription payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(
        `${config.REACT_APP_API_URL}/payment/verify`,
        payload,
        authToken ? authHeader(authToken) : undefined
      );
      return res.data;
    },
    onSuccess: () => {
      // Keep subscription data fresh after successful verification
      queryClient.invalidateQueries(['subscription', ownerId]);
      queryClient.invalidateQueries(['subscriptionPlans', userType]);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Payment verification failed';
      toast.error(msg);
    },
  });

  const isMutationLoading =
    updateMutation.isPending ||
    cancelMutation.isPending ||
    createCustomerSubscriptionMutation.isPending ||
    createSubscriptionMutation.isPending ||
    verifyPaymentMutation.isPending;

  return {
    // data
    subscriptionData,
    plans,

    // loading/error states
    isSubscriptionLoading,
    isPlansLoading,
    isMutationLoading,
    isSubscriptionError,
    subscriptionError,
    isPlansError,
    plansError,

    // actions
    updateSubscriptionPlan: updateMutation.mutateAsync,
    cancelSubscription: cancelMutation.mutateAsync,
    createCustomerSubscription: createCustomerSubscriptionMutation.mutateAsync,
    createSubscription: createSubscriptionMutation.mutateAsync,
    verifySubscriptionPayment: verifyPaymentMutation.mutateAsync,

    // utils
    refetchSubscription,
    refetchPlans,

    // user context (for convenience)
    ownerId,
    tenantId,
    organization,
    userType,
  };
};
