import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

/**
 * Custom hook to manage push-notifications for a given user.
 *
 * Similar to the other data hooks (e.g. useInterviews, useCandidates) this hook wraps
 * all server-interactions in React-Query queries / mutations so components only need
 * to consume the returned helpers.
 *
 * @param {string} ownerId – User id for whom the notifications have to be fetched.
 */
export const usePushNotifications = (ownerId) => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const pushNotificationPermissions = sharingPermissionscontext?.pushNotification || {};

  /* ---------------------------- Fetch notifications --------------------------- */
  const {
    data: notifications = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications', ownerId, pushNotificationPermissions],
    enabled: !!ownerId && pushNotificationPermissions?.view,
    staleTime: 1000 * 60, // 1 min cache
    retry: 1,
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/push-notifications/${ownerId}`);
      const sorted = Array.isArray(response.data)
        ? response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        : [];
      return sorted;
    },
  });

  /* -------------------------- Mark single as read --------------------------- */
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      if (!id) return;
      await axios.patch(`${config.REACT_APP_API_URL}/push-notifications/${id}/read`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', ownerId]);
    },
    onError: (err) => {
      console.error('Error marking notification as read:', err);
    },
  });

  /* -------------------------- Mark all as read --------------------------- */
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`${config.REACT_APP_API_URL}/push-notifications/${ownerId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', ownerId]);
    },
    onError: (err) => {
      console.error('Error marking all notifications as read:', err);
    },
  });

  const isMutationLoading = markAsReadMutation.isPending || markAllAsReadMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    /* --- Data --- */
    notifications,

    /* --- States --- */
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isMarkAsReadError: markAsReadMutation.isError,
    markAsReadError: markAsReadMutation.error,
    isMarkAllError: markAllAsReadMutation.isError,
    markAllError: markAllAsReadMutation.error,

    /* --- Helpers --- */
    refetchNotifications,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
  };
};
