// src/apiHooks/useSupportTickets.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from '../Context/Contextfetch';

// Always send cookies across domains (needed when FE + BE sit on *.azurewebsites.net)
axios.defaults.withCredentials = true;

export const useSupportTickets = () => {
  const queryClient = useQueryClient();
  const { userRole } = useCustomContext();          // “SuperAdmin”, “Admin”, “Individual”, …

  /* --------------------------------------------------------------------- */
  /*  Auth token                                                            */
  /* --------------------------------------------------------------------- */
  const authToken = Cookies.get('authToken') ?? '';
  const tokenPayload = authToken ? decodeJwt(authToken) : {};

  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  /* --------------------------------------------------------------------- */
  /*  QUERY: fetch tickets                                                  */
  /* --------------------------------------------------------------------- */
  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/get-tickets`,
        { headers: { Authorization: `Bearer ${authToken}` } }   // <------------------
      );

      const all = data?.tickets ?? [];
      if (!userRole) return [];

      if (['SuperAdmin', 'Support Team'].includes(userRole)) return all;
      if (!organization) {
        if (userRole === 'Admin' && userId) return all.filter(t => t.ownerId === userId);
      } else {
        if (userRole === 'Admin' && tenantId) return all.filter(t => t.tenantId === tenantId);
      }
      if (userRole === 'Individual' && userId) return all.filter(t => t.ownerId === userId);
      if (userId) return all.filter(t => t.assignedToId === userId);

      return [];
    } catch (err) {
      console.error('[useSupportTickets] GET /get-tickets failed:', err);
      throw err;          // Let React-Query handle it → isError / error
    }
  };

  const {
    data: tickets = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['supportTickets', userRole, tenantId, userId],
    queryFn: fetchTickets,
    enabled: !!userRole,           // wait until role is known
    staleTime: 1000 * 60 * 5,       // 5 min
    retry: 1,
  });

  /* --------------------------------------------------------------------- */
  /*  MUTATION: create / update ticket                                      */
  /* --------------------------------------------------------------------- */
  const submitTicketMutation = useMutation({
    mutationFn: async ({ data, editMode, ticketId }) => {
      const url = editMode
        ? `${config.REACT_APP_API_URL}/update-ticket/${ticketId}`
        : `${config.REACT_APP_API_URL}/create-ticket`;

      const method = editMode ? 'patch' : 'post';

      const res = await axios[method](url, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      return res.data;
    },

    onSuccess: ({ message }) => {
      toast.success(message || 'Ticket submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },

    onError: err => {
      console.error('[useSupportTickets] submitTicket failed:', err);
      toast.error(
        err?.response?.data?.message ??
        'Something went wrong while submitting the ticket'
      );
    },
  });

  /* --------------------------------------------------------------------- */
  /*  Public API                                                            */
  /* --------------------------------------------------------------------- */
  return {
    tickets,
    isLoading: isQueryLoading || submitTicketMutation.isPending,
    isQueryLoading,
    isMutationLoading: submitTicketMutation.isPending,
    isError,
    error,
    isMutationError: submitTicketMutation.isError,
    mutationError: submitTicketMutation.error,
    submitTicket: submitTicketMutation.mutateAsync,
  };
};
