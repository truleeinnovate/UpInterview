// v1.0.0 - Ashok - useQuestions Hook for Question Bank with pagination + sorting + search

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { notify } from "../../services/toastService";

export const useUploadQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type, createdBy }) => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("createdBy", createdBy);

      const res = await axios.post(
        `${config.REACT_APP_API_URL}/questions-manager/${type}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return res.data;
    },

    onSuccess: (_, { type }) => {
      notify.success("Questions uploaded successfully");
      // Refresh the respective question list
      queryClient.invalidateQueries(["questions", type]);
    },

    onError: (error) => {
      console.error("Upload failed:", error);
      notify.error("Failed to upload questions");
    },
  });
};

// export const useQuestionBankManager = ({
//   type,
//   page,
//   perPage,
//   searchTerm,
//   sortOrder,
//   filters,
// }) => {
//   return useQuery({
//     queryKey: [
//       "questions",
//       type,
//       page,
//       perPage,
//       searchTerm,
//       sortOrder,
//       filters,
//     ],
//     queryFn: async () => {
//       const res = await axios.get(
//         `${config.REACT_APP_API_URL}/questions-manager/${type}`,
//         {
//           params: { page, perPage, searchTerm, sortOrder, filters },
//         }
//       );
//       return res.data; // Expected: { questions, total }
//     },
//     keepPreviousData: true, // prevents flicker when changing pages
//     staleTime: 1000 * 60 * 2, // 2 minutes cache time
//   });
// };

export const useQuestionBankManager = ({
  type,
  page,
  perPage,
  searchTerm,
  sortOrder,
  filters,
}) => {
  return useQuery({
    queryKey: [
      "questions",
      type,
      page,
      perPage,
      searchTerm,
      sortOrder,
      filters,
    ],
    queryFn: async () => {
      // Map frontend keys to backend required keys
      const params = {
        page,
        perPage,
        searchTerm,
        sortOrder,
        ...(filters.topic && { topic: filters.topic }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.type && { questionType: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.subTopic && { subTopic: filters.subTopic }),
        ...(filters.area && { area: filters.area }),
        ...(filters.technology && { technology: filters.technology }),
        ...(filters.tags && { tags: filters.tags }),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.reviewStatus && { reviewStatus: filters.reviewStatus }),
        ...(filters.minexperience && { minexperience: filters.minexperience }),
        ...(filters.maxexperience && { maxexperience: filters.maxexperience }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        // Add other filters as needed (category, subTopic etc.)
      };
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/questions-manager/${type}`,
        { params }
      );
      return res.data; // { questions, total }
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateQuestionBankManager = (type) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, formData }) => {
      const res = await axios.put(
        `${config.REACT_APP_API_URL}/questions-manager/${type}/${questionId}`,
        formData
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch question list for that type
      queryClient.invalidateQueries(["questions", type]);
    },
  });
};

export const useDeleteQuestions = (type) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionIds) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/questions-manager/${type}`,
        { data: { questionIds } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        notify.success("Questions deleted successfully");
        // Invalidate the related query to refetch updated list
        queryClient.invalidateQueries({ queryKey: ["questions", type] });
      } else {
        notify.error("Failed to delete questions");
      }
    },
    onError: (error) => {
      console.error("Delete questions failed:", error);
      notify.error("Something went wrong while deleting");
    },
  });
};
