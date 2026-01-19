import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// Get tenant ID from auth token
const getTenantId = () => {
    const token = AuthCookieManager.getAuthToken();
    if (!token) return null;

    // Basic JWT decoding to get tenantId (frontend-side)
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload).tenantId;
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
};

// Configure axios header with tenant ID/Auth token
const getAuthHeaders = () => {
    const token = AuthCookieManager.getAuthToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

/* -------------------------------------------------------------------------- */
/*                                INTERVIEWERS                                */
/* -------------------------------------------------------------------------- */

// Fetch paginated interviewers with filters
export const usePaginatedInterviewers = ({
    page = 0,
    limit = 10,
    search = '',
    tag = '',
    type = '',
    status = '',
    team = '',
    sortBy = '-createdAt'
} = {}) => {
    return useQuery({
        queryKey: ['interviewers', { page, limit, search, tag, type, status, team, sortBy }],
        queryFn: async () => {
            const { data } = await axios.get(`${config.REACT_APP_API_URL}/interviewers`, {
                ...getAuthHeaders(),
                params: { page, limit, search, tag, type, status, team, sortBy }
            });
            return data;
        },
        keepPreviousData: true,
    });
};

// Fetch all interviewers (for dropdowns mostly)
export const useAllInterviewers = ({ active_only = false } = {}) => {
    return useQuery({
        queryKey: ['all-interviewers', { active_only }],
        queryFn: async () => {
            const { data } = await axios.get(`${config.REACT_APP_API_URL}/interviewers/data`, {
                ...getAuthHeaders(),
                params: { active_only }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// Fetch single interviewer by ID
export const useInterviewerById = (id) => {
    return useQuery({
        queryKey: ['interviewer', id],
        queryFn: async () => {
            const { data } = await axios.get(`${config.REACT_APP_API_URL}/interviewers/${id}`, getAuthHeaders());
            return data;
        },
        enabled: !!id,
    });
};

// Create interviewer
export const useCreateInterviewer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (interviewerData) => {
            const { data } = await axios.post(
                `${config.REACT_APP_API_URL}/interviewers`,
                interviewerData,
                getAuthHeaders()
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewers']);
            queryClient.invalidateQueries(['all-interviewers']);
        },
    });
};

// Update interviewer
export const useUpdateInterviewer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axios.patch(
                `${config.REACT_APP_API_URL}/interviewers/${id}`,
                data,
                getAuthHeaders()
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['interviewers']);
            queryClient.invalidateQueries(['all-interviewers']);
            queryClient.invalidateQueries(['interviewer', variables.id]);
        },
    });
};

// Delete interviewer
export const useDeleteInterviewer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`${config.REACT_APP_API_URL}/interviewers/${id}`, getAuthHeaders());
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewers']);
            queryClient.invalidateQueries(['all-interviewers']);
        },
    });
};

// Toggle active status
export const useToggleInterviewerActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, is_active }) => {
            const { data } = await axios.patch(
                `${config.REACT_APP_API_URL}/interviewers/${id}/toggle-active`,
                { is_active },
                getAuthHeaders()
            );
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['interviewers']);
            queryClient.invalidateQueries(['all-interviewers']);
            queryClient.invalidateQueries(['interviewer', variables.id]);
        },
    });
};

/* -------------------------------------------------------------------------- */
/*                              INTERVIEWER TAGS                              */
/* -------------------------------------------------------------------------- */

// Fetch all tags
export const useInterviewerTags = ({ category = '', active_only = false } = {}) => {
    return useQuery({
        queryKey: ['interviewer-tags', { category, active_only }],
        queryFn: async () => {
            const { data } = await axios.get(`${config.REACT_APP_API_URL}/interviewer-tags`, {
                ...getAuthHeaders(),
                params: { category, active_only }
            });
            return data;
        },
        staleTime: 10 * 60 * 1000 // 10 minutes
    });
};

// Fetch paginated tags
export const usePaginatedTags = ({
    page = 0,
    limit = 10,
    search = '',
    category = ''
} = {}) => {
    return useQuery({
        queryKey: ['paginated-interviewer-tags', { page, limit, search, category }],
        queryFn: async () => {
            const { data } = await axios.get(`${config.REACT_APP_API_URL}/interviewer-tags/paginated`, {
                ...getAuthHeaders(),
                params: { page, limit, search, category }
            });
            return data;
        },
        keepPreviousData: true,
    });
};

// Create tag
export const useCreateInterviewerTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tagData) => {
            const { data } = await axios.post(
                `${config.REACT_APP_API_URL}/interviewer-tags`,
                tagData,
                getAuthHeaders()
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewer-tags']);
            queryClient.invalidateQueries(['paginated-interviewer-tags']);
        },
    });
};

// Update tag
export const useUpdateInterviewerTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axios.patch(
                `${config.REACT_APP_API_URL}/interviewer-tags/${id}`,
                data,
                getAuthHeaders()
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewer-tags']);
            queryClient.invalidateQueries(['paginated-interviewer-tags']);
        },
    });
};

// Delete tag
export const useDeleteInterviewerTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`${config.REACT_APP_API_URL}/interviewer-tags/${id}`, getAuthHeaders());
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewer-tags']);
            queryClient.invalidateQueries(['paginated-interviewer-tags']);
        },
    });
};
