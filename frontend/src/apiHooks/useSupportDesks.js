import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import { toast } from 'react-toastify';
import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from '../Context/Contextfetch';
export const useSupportTickets = () => {
    const queryClient = useQueryClient();
    const { userRole } = useCustomContext();
    const authToken = Cookies.get('authToken');
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;
    const {
        data: tickets = [],
        isLoading: isQueryLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['supportTickets', userRole, tenantId, userId],
        queryFn: async () => {
            const response = await axios.get(`${config.REACT_APP_API_URL}/get-tickets`);
            let filteredTickets = response.data.tickets || [];

            if (userRole === 'SuperAdmin' || userRole === 'Support Team') {
                return filteredTickets;
            } else if (userRole === 'Admin' && tenantId) {
                return filteredTickets.filter(ticket => ticket.tenantId === tenantId);
            } else if (userRole === 'Individual' && userId) {
                return filteredTickets.filter(ticket => ticket.ownerId === userId);
            } else if (userId) {
                return filteredTickets.filter(ticket => ticket.assignedToId === userId);
            }
            return [];
        },
        enabled: !!userRole,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const mutation = useMutation({
        mutationFn: async ({ data, editMode, ticketId }) => {
            const url = editMode
                ? `${config.REACT_APP_API_URL}/update-ticket/${ticketId}`
                : `${config.REACT_APP_API_URL}/create-ticket`;

            const method = editMode ? 'patch' : 'post';
            const response = await axios[method](url, data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Ticket submitted successfully');
            queryClient.invalidateQueries(['supportTickets']);
        },
        onError: (err) => {
            console.error('Error submitting ticket:', err);
            toast.error('Something went wrong while submitting the ticket');
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    return {
        tickets,
        isLoading,
        isQueryLoading,
        isMutationLoading,
        isError,
        error,
        isMutationError: mutation.isError,
        mutationError: mutation.error,
        submitTicket: mutation.mutateAsync, // expects { data, editMode, ticketId }
    };
};
