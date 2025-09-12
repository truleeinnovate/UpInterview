// v1.0.0 - Ashok - Fixed updating image and resume issue

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchFilterData } from "../api";
import { usePermissions } from "../Context/PermissionsContext";
import { config } from "../config";
import { uploadFile } from "./imageApis";

export const useCandidates = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();

  // Check if user has permission to view candidates
  const hasViewPermission = effectivePermissions?.Candidates?.View;
  const hasDeletePermission = effectivePermissions?.Candidates?.Delete;

  const {
    data: candidateData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidates", filters],
    queryFn: async () => {
      const data = await fetchFilterData("candidate", effectivePermissions);
      return data
        .map((candidate) => {
          if (candidate.ImageData?.filename) {
            return {
              ...candidate,
              imageUrl: `${
                config.REACT_APP_API_URL
              }/${candidate.ImageData.path.replace(/\\/g, "/")}`,
            };
          }
          return candidate;
        })
        .reverse();
    },
    enabled: !!hasViewPermission, // Only fetch if user has permission
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
      profilePicFile,
      resumeFile,
      isProfilePicRemoved,
      isResumeRemoved,
    }) => {
      const method = id ? "patch" : "post";
      const url = id
        ? `${config.REACT_APP_API_URL}/candidate/${id}`
        : `${config.REACT_APP_API_URL}/candidate`;

      const response = await axios[method](url, data);
      console.log("response", response);
      // const candidateId = response.data.data._id;
      const candidate = response.data?.data; // candidate may be undefined
      // v1.0.1 <----------------------------------------------------------------------
      const candidateId = candidate?._id || id; // only defined if changes occurred
      // v1.0.0 ---------------------------------------------------------------------->
      console.log("candidateId", candidateId);

      if (candidateId) {
        // uploading or updating files profilePic and resume
        // --- Profile Picture ---
        // Delete profile picture if removed
        if (isProfilePicRemoved && !profilePicFile) {
          await uploadFile(null, "image", "candidate", candidateId);
        }
        // Upload new profile picture
        else if (profilePicFile instanceof File) {
          await uploadFile(profilePicFile, "image", "candidate", candidateId);
        }

        // --- Resume ---
        // Delete resume if removed
        if (isResumeRemoved && !resumeFile) {
          await uploadFile(null, "resume", "candidate", candidateId);
        }
        // Upload new resume
        else if (resumeFile instanceof File) {
          await uploadFile(resumeFile, "resume", "candidate", candidateId);
        }
      }

      return response.data;
    },

    onSuccess: (data, variables) => {
      const candidate = data?.data;

      if (!candidate) {
        // no changes — close the form safely
        console.log("No changes detected, closing form.");
        if (variables.isModal && variables.onClose) {
          variables.onClose({}); // pass empty object
        }
        return;
      }

      // Optimistically update the cache
      queryClient.setQueryData(["candidates", filters], (oldData) => {
        if (!oldData) return oldData;

        if (variables.id) {
          // Update existing candidate
          return oldData.map((candidate) =>
            candidate._id === variables.id
              ? { ...candidate, ...data.data }
              : candidate
          );
        } else {
          // Add new candidate
          return [data.data, ...oldData];
        }
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries(["candidates"]);
    },
    onError: (error) => {
      console.error("Error adding/updating candidate:", error);
    },
  });

  // Delete candidate mutation
  const deleteMutation = useMutation({
    mutationFn: async (candidateId) => {
      if (!hasDeletePermission) {
        throw new Error("You don't have permission to delete candidates");
      }

      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/candidate/delete-candidate/${candidateId}`
        // {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        //     'Content-Type': 'application/json'
        //   }
        // }
      );
      return response.data;
    },
    onSuccess: (data, candidateId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(["candidates", filters], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter((candidate) => candidate._id !== candidateId);
      });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries(["candidates"]);

      console.log("Candidate deleted successfully:", data);
    },
    onError: (error, candidateId) => {
      console.error("Error deleting candidate:", error);

      // Revert optimistic update on error
      queryClient.invalidateQueries(["candidates"]);
    },
  });

  // Use mutation.isPending instead of checking status (for v5+)
  // For v4, use mutation.isLoading
  const isMutationLoading = mutation.isPending; // or mutation.isLoading for v4
  const isDeleteLoading = deleteMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading || isDeleteLoading;

  return {
    candidateData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isMutationError: mutation.isError,
    mutationError: mutation.error,
    addOrUpdateCandidate: mutation.mutateAsync,
    deleteCandidateData: deleteMutation.mutateAsync,
    refetch,
  };
};
