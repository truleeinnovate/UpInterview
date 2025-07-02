import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchFilterData } from "../api";
import { usePermissions } from "../Context/PermissionsContext";
import { config } from "../config";
import { uploadFile } from "./imageApis";

// export const useCandidates = () => {
//   const queryClient = useQueryClient();
//   // const { sharingPermissionscontext = {} } = usePermissions() || {};
//   // const candidatePermissions = sharingPermissionscontext?.candidate || {};

//   const {
//     data: candidateData = [],
//     isLoading: isQueryLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["candidates"],
//     queryFn: async () => {
//       const filteredCandidates = await fetchFilterData(
//         "candidate",
//       );
//       return filteredCandidates
//         .map((candidate) => {
//           if (candidate.ImageData?.filename) {
//             return {
//               ...candidate,
//               imageUrl: `${
//                 config.REACT_APP_API_URL
//               }/${candidate.ImageData.path.replace(/\\/g, "/")}`,
//             };
//           }
//           return candidate;
//         })
//         .reverse();
//     },
//     // enabled: !!candidatePermissions,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   });

export const useCandidates = () => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();

  // Check if user has permission to view candidates
  const hasViewPermission = effectivePermissions?.Candidates?.View;

  const {
    data: candidateData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const data = await fetchFilterData("candidate", effectivePermissions);
      return data.map((candidate) => {
        if (candidate.ImageData?.filename) {
          return {
            ...candidate,
            imageUrl: `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, "/")}`,
          };
        }
        return candidate;
      }).reverse();
    },
    enabled: !!hasViewPermission, // Only fetch if user has permission
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      const candidateId = response.data.data._id;

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

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["candidates"]);
    },
    onError: (error) => {
      console.error("Error adding/updating candidate:", error);
    },
  });

  // Use mutation.isPending instead of checking status (for v5+)
  // For v4, use mutation.isLoading
  const isMutationLoading = mutation.isPending; // or mutation.isLoading for v4
  const isLoading = isQueryLoading || isMutationLoading;

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
  };
};
