// v1.0.0 - Ashok - Fixed updating image and resume issue

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchFilterData } from "../api";
import { usePermissions } from "../Context/PermissionsContext";
import { config } from "../config";
import { uploadFile } from "./imageApis";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";

export const useCandidates = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();

  // Check if user has permission to view candidates
  const hasViewPermission = effectivePermissions?.Candidates?.View;
  const hasDeletePermission = effectivePermissions?.Candidates?.Delete;

  const {
    data: responseData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidates", filters],
    queryFn: async () => {
      const data = await fetchFilterData(
        "candidate",
        effectivePermissions,
        filters,
      );

      // console.log("data data", data);
      return data;
    },
    enabled: !!hasViewPermission, // Only fetch if user has permission
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    // refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnMount: "always",
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // Extract data and total from response
  const candidateData = responseData?.candidate || [];
  const totalCandidates = responseData?.total || 0;

  // In useCandidates hook, change data extraction to:
  // const candidateDatas = responseData?.data?.candidate || [];
  // const totalCandidatess = responseData?.data?.total || 0;

  // console.log("candidateDatas", candidateDatas);
  // console.log("totalCandidatess", totalCandidatess);

  //   console.log("candidateData", candidateData);
  //   console.log("totalCandidates", totalCandidates);

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
      // console.log("response", response);
      // const candidateId = response.data.data._id;
      const candidate = response.data?.data; // candidate may be undefined
      // v1.0.1 <----------------------------------------------------------------------
      const candidateId = candidate?._id || id; // only defined if changes occurred
      // v1.0.0 ---------------------------------------------------------------------->
      // console.log("candidateId", candidateId);

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
        if (variables.isModal && variables.onClose) {
          variables.onClose({});
        }
        return;
      }

      // FIXED: Optimistically update the cache - handle your specific backend structure
      // queryClient.setQueryData(["candidates", filters], (oldData) => {
      //   if (!oldData) return oldData;

      //   // Your backend returns { data: { candidate: [...], total: X } }
      //   if (oldData.data && oldData.data.candidate) {
      //     // New structure: { data: { candidate: [...], total: X } }
      //     if (variables.id) {
      //       // Update existing candidate
      //       const updatedCandidates = oldData.data.candidate.map((c) =>
      //         c._id === variables.id ? { ...c, ...data.data } : c
      //       );
      //       return {
      //         ...oldData,
      //         data: {
      //           ...oldData.data,
      //           candidate: updatedCandidates,
      //           total: oldData.data.total // total remains same for update
      //         }
      //       };
      //     } else {
      //       // Add new candidate
      //       return {
      //         ...oldData,
      //         data: {
      //           ...oldData.data,
      //           candidate: [data.data, ...oldData.data.candidate],
      //           total: oldData.data.total + 1
      //         }
      //       };
      //     }
      //   } else if (Array.isArray(oldData)) {
      //     // Old structure: array of candidates (fallback)
      //     if (variables.id) {
      //       return oldData.map((c) =>
      //         c._id === variables.id ? { ...c, ...data.data } : c
      //       );
      //     } else {
      //       return [data.data, ...oldData];
      //     }
      //   } else {
      //     // Unknown structure, return as is
      //     return oldData;
      //   }
      // });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries(["candidates"]);
    },
    onError: (error) => {
      console.error("Error adding/updating candidate:", error);
    },

    // onSuccess: (data, variables) => {
    //   const candidate = data?.data;

    //   if (!candidate) {
    //     // no changes — close the form safely
    //     // console.log("No changes detected, closing form.");
    //     if (variables.isModal && variables.onClose) {
    //       variables.onClose({}); // pass empty object
    //     }
    //     return;
    //   }

    //   // Optimistically update the cache
    //   queryClient.setQueryData(["candidates", filters], (oldData) => {
    //     if (!oldData) return oldData;

    //     if (variables.id) {
    //       // Update existing candidate
    //       return oldData.map((candidate) =>
    //         candidate._id === variables.id
    //           ? { ...candidate, ...data.data }
    //           : candidate
    //       );
    //     } else {
    //       // Add new candidate
    //       return [data.data, ...oldData];
    //     }
    //   });

    //   // Invalidate to ensure consistency
    //   queryClient.invalidateQueries(["candidates"]);
    // },
    // onError: (error) => {
    //   console.error("Error adding/updating candidate:", error);
    // },
  });

  // Delete candidate mutation
  const deleteMutation = useMutation({
    mutationFn: async (candidateId) => {
      if (!hasDeletePermission) {
        throw new Error("You don't have permission to delete candidates");
      }

      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/candidate/delete-candidate/${candidateId}`,
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
      // FIXED: Optimistically remove from cache - handle your specific backend structure
      queryClient.setQueryData(["candidates", filters], (oldData) => {
        if (!oldData) return oldData;

        // Your backend returns { data: { candidate: [...], total: X } }
        if (oldData.data && oldData.data.candidate) {
          // New structure: { data: { candidate: [...], total: X } }
          const filteredCandidates = oldData.data.candidate.filter(
            (candidate) => candidate._id !== candidateId,
          );
          return {
            ...oldData,
            data: {
              ...oldData.data,
              candidate: filteredCandidates,
              total: oldData.data.total - 1,
            },
          };
        } else if (Array.isArray(oldData)) {
          // Old structure: array of candidates (fallback)
          return oldData.filter((candidate) => candidate._id !== candidateId);
        } else {
          // Unknown structure, return as is
          return oldData;
        }
      });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries(["candidates"]);
    },
    onError: (error, candidateId) => {
      console.error("Error deleting candidate:", error);
      queryClient.invalidateQueries(["candidates"]);
    },

    // onSuccess: (data, candidateId) => {
    //   // Optimistically remove from cache
    //   queryClient.setQueryData(["candidates", filters], (oldData) => {
    //     if (!oldData) return oldData;
    //     return oldData.filter((candidate) => candidate._id !== candidateId);
    //   });

    //   // Invalidate queries to ensure consistency
    //   queryClient.invalidateQueries(["candidates"]);

    //   // console.log("Candidate deleted successfully:", data);
    // },
    // onError: (error, candidateId) => {
    //   console.error("Error deleting candidate:", error);
  });

  // Hook to fetch candidate positions for a specific candidate (for Candidate 360 Positions tab)
  const useCandidatePositions = (candidateId) => {
    return useQuery({
      queryKey: ["candidate-positions", candidateId],
      queryFn: async () => {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/candidateposition/candidate/${candidateId}`,
        );
        // Backend returns { data: [...] }
        return response.data?.data || [];
      },
      enabled: !!candidateId && !!hasViewPermission,
      retry: 1,
      staleTime: 1000 * 60 * 10,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });
  };

  // Aggregate loading states
  const isMutationLoading = mutation.isPending; // or mutation.isLoading for v4
  const isDeleteLoading = deleteMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading || isDeleteLoading;

  return {
    candidateData,
    totalCandidates,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isDeleteLoading,
    isError,
    error,
    isMutationError: mutation.isError,
    mutationError: mutation.error,
    addOrUpdateCandidate: mutation.mutateAsync,
    deleteCandidateData: deleteMutation.mutateAsync,
    refetch,
    useCandidatePositions,
  };
};

export const useCandidateById = (candidateId) => {
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Candidates?.View;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: async () => {
      const authToken = Cookies.get("authToken") ?? "";
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate/details/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        },
      );
      return response.data;
    },
    enabled: !!candidateId && !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    candidate: data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Validation hooks
export const useValidateEmail = (email) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  return useQuery({
    queryKey: ["validate-email", email, tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate/check-email`,
        {
          params: { email, tenantId }, // tenantId injected here
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      return response.data;
    },
    // Only enable if we have a valid email and a tenantId
    enabled: !!tenantId && email?.length > 5 && email.includes("@"),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useValidatePhone = (phone) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  return useQuery({
    queryKey: ["validate-phone", phone, tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate/check-phone`,
        {
          params: { phone, tenantId },
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      return response.data;
    },
    enabled: !!tenantId && phone?.length >= 10,
    retry: false,
  });
};

export const useValidateLinkedIn = (url) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  return useQuery({
    queryKey: ["validate-linkedin", url, tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/candidate/check-linkedin`,
        {
          params: { url, tenantId },
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );
      return response.data;
    },
    enabled: !!tenantId && !!url && url.includes("linkedin.com"),
    retry: false,
  });
};

export const useCandidateStats = (candidateId) => {
  return useQuery({
    queryKey: ["candidate-stats", candidateId],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/candidate/${candidateId}/stats`);
      return response.data;
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
