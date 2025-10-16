//<-------v1.0.0------Venkatesh----tanStack Query added
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

// Fetch all tasks for current user (filters applied client-side similar to existing code)
export const useTasks = (filters = {}) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Tasks?.View;

  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId; // reserved for future server-side filtering
  const organization = tokenPayload?.organization; // reserved for future server-side filtering

  return useQuery({
    queryKey: ['tasks', ownerId, tenantId, organization],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      let tasks = Array.isArray(res.data) ? res.data : [];
      // match existing behavior: client-side filter by ownerId
      tasks = tasks.filter((t) => t?.ownerId === ownerId);

      // optional client-side filter by status if provided
      if (Array.isArray(filters.status) && filters.status.length > 0) {
        tasks = tasks.filter((t) => filters.status.includes(t?.status));
      }

      return tasks;
    },
    enabled: !!ownerId && !!hasViewPermission && (typeof isInitialized === 'boolean' ? isInitialized : true),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Fetch a single task by id
export const useTaskById = (taskId) => {
  const authToken = Cookies.get('authToken');
  
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      
      const res = await axios.get(`${config.REACT_APP_API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!taskId,
    retry: 2,
    staleTime: 1000 * 30, // 30 seconds - reduce stale time for edit mode
    cacheTime: 1000 * 60 * 5, // 5 minutes - reduce cache time
    refetchOnWindowFocus: true, // Enable refetch on focus for fresh data
    refetchOnMount: true, // Enable refetch on mount to ensure fresh data in edit mode
    refetchOnReconnect: true, // Enable refetch on reconnect
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const authToken = Cookies.get('authToken');
  
  return useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${config.REACT_APP_API_URL}/tasks`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (error) => {
      console.error('Failed to create task:', error?.response?.data?.message || error.message);
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const authToken = Cookies.get('authToken');
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (!id) throw new Error('Missing task id');
      const res = await axios.patch(`${config.REACT_APP_API_URL}/tasks/${id}`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['tasks']);
      if (variables?.id) {
        queryClient.invalidateQueries(['task', variables.id]);
      }
    },
    onError: (error) => {
      console.error('Failed to update task:', error?.response?.data?.message || error.message);
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const authToken = Cookies.get('authToken');
  const { effectivePermissions } = usePermissions();
  const hasDeletePermission = effectivePermissions?.Tasks?.Delete;
  
  return useMutation({
    mutationFn: async (id) => {
      if (!hasDeletePermission) {
        throw new Error("You don't have permission to delete tasks");
      }
      if (!id) throw new Error('Missing task id');
      
      // Make sure this endpoint matches your backend route
      const res = await axios.delete(`${config.REACT_APP_API_URL}/tasks/delete-task/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (error) => {
      console.error('Failed to delete task:', error?.response?.data?.message || error.message);
    },
  });
};



// const deleteMutation = useMutation({
//   mutationFn: async (positionId) => {
//     if (!hasDeletePermission) {
//       throw new Error("You don't have permission to delete positions");
//     }

//     const response = await axios.delete(
//       `${config.REACT_APP_API_URL}/position/delete-position/${positionId}`,
//       // {
//       //   headers: {
//       //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//       //     'Content-Type': 'application/json'
//       //   }
//       // }
//     );
//     return response.data;
//   },
//   onSuccess: (data, positionId) => {
//     // Optimistically remove from cache
//     queryClient.setQueryData(["positions", filters], (oldData) => {
//       if (!oldData) return oldData;
//       return oldData.filter(position => position._id !== positionId);
//     });
    
//     // Invalidate queries to ensure consistency
//     queryClient.invalidateQueries(["positions"]);
    
//     console.log("Position deleted successfully:", data);
//   },
//   onError: (error, positionId) => {
//     console.error("Error deleting position:", error);
    
//     // Revert optimistic update on error
//     queryClient.invalidateQueries(["positions"]);
//   },
// });
