import axios from "axios";
import { decryptData } from "../../src/utils/PaymentCard.js";
import { useQuery } from "@tanstack/react-query";
import { config } from "../config.js";
// Common utility to decrypt URL param

export const decryptParam = (param) => {
  if (!param) return null;
  try {
    const decoded = decodeURIComponent(param);
    return decryptData(decoded);
  } catch (error) {
    console.error("Error decrypting param:", error);
    return null;
  }
};

// Separate function to extract data from URL
export const extractUrlData = (search) => {
  const params = new URLSearchParams(search);
  const isSchedule = params.get("scheduler") === "true";
  const isCandidate = params.get("candidate") === "true";
  const isInterviewer = params.get("interviewer") === "true";
  const meetLink = decryptParam(params.get("meeting"));
  const roundData = decryptParam(params.get("round"));
  const token = params.get("interviewertoken") || params.get("schedulertoken");
  const interviewerId = decryptParam(token);

  return {
    isSchedule,
    isCandidate,
    isInterviewer,
    meetLink,
    roundData,
    interviewRoundId: roundData || "",
    interviewerId: interviewerId || "",
  };
};

// Custom hook for candidate details (replaces fetchCandidateDetails)
// export const useCandidateDetails = (roundId) => {
//   return useQuery({
//     queryKey: ["candidateDetails", roundId],
//     queryFn: async () => {
//       if (!roundId) throw new Error("Round ID is required");
//       const res = await axios.get(
//         `${config.REACT_APP_API_URL}/feedback/candidate-details`,
//         {
//           params: { roundId },
//           headers: { Accept: "application/json" },
//         }
//       );
//       if (!res.data?.success || !res.data.candidate) {
//         throw new Error(res.data?.message || "Candidate data not found");
//       }
//       return {
//         ...res.data.candidate,
//         position: res.data.position,
//         round: res.data.round,
//       };
//     },
//     enabled: !!roundId,
//     retry: 2, // Matches original retry attempts
//     retryDelay: (attempt) => attempt * 1000,
//   });
// };

// Custom hook for pre-auth contact details
export const useContactDetails = (contactId, roundId) => {
  return useQuery({
    queryKey: ["contactDetails", contactId, roundId],
    queryFn: async () => {
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/feedback/contact-details`,
        {
          params: { contactId, roundId },
        }
      );
      if (res.status !== 200) {
        throw new Error(res.data?.error || "Error fetching contact details");
      }
      return res.data;
    },
    enabled: !!contactId && !!roundId,
  });
};

// Custom hook for scheduler round details
export const useSchedulerRoundDetails = (roundId, isSchedule) => {
  return useQuery({
    queryKey: ["schedulerRound", roundId],
    queryFn: async () => {
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/feedback/round/${roundId}`
      );
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Error fetching round details");
      }
      return res.data.data;
    },
    enabled: !!roundId && isSchedule,
  });
};
