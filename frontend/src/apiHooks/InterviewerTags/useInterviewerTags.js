import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import AuthCookieManager from "../../utils/AuthCookieManager/AuthCookieManager";

const getAuthHeaders = () => {
  const token = AuthCookieManager.getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Fetch single tag by ID
export const useGetInterviewerTagById = (id) => {
  return useQuery({
    queryKey: ["interviewer-tag", id],
    enabled: !!id, // only run if id exists
    queryFn: async () => {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/interviewer-tags/${id}`,
        getAuthHeaders(),
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch all tags
export const useInterviewerTags = ({
  category = "",
  active_only = false,
} = {}) => {
  return useQuery({
    queryKey: ["interviewer-tags", { category, active_only }],
    queryFn: async () => {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/interviewer-tags`,
        {
          ...getAuthHeaders(),
          params: { category, active_only },
        },
      );
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch paginated tags
export const usePaginatedTags = ({
  page = 0,
  limit = 10,
  search = "",
  category = "",
} = {}) => {
  return useQuery({
    queryKey: ["paginated-interviewer-tags", { page, limit, search, category }],
    queryFn: async () => {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/interviewer-tags/paginated`,
        {
          ...getAuthHeaders(),
          params: { page, limit, search, category },
        },
      );
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
        getAuthHeaders(),
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewer-tags"]);
      queryClient.invalidateQueries(["paginated-interviewer-tags"]);
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
        getAuthHeaders(),
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewer-tags"]);
      queryClient.invalidateQueries(["paginated-interviewer-tags"]);
    },
  });
};

// Delete tag
export const useDeleteInterviewerTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(
        `${config.REACT_APP_API_URL}/interviewer-tags/${id}`,
        getAuthHeaders(),
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewer-tags"]);
      queryClient.invalidateQueries(["paginated-interviewer-tags"]);
    },
  });
};
