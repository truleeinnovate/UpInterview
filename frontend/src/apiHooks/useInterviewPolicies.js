import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../config";

export const useInterviewPolicies = () => {
  const settlementPolicyMutation = useMutation({
    mutationFn: async ({ isMockInterview, roundStatus, dateTime }) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/interview-policies/settlement-policy`,
        {
          isMockInterview,
          roundStatus,
          dateTime,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );

      return response.data;
    },
  });

  return {
    getSettlementPolicy: settlementPolicyMutation.mutateAsync,
    isLoading: settlementPolicyMutation.isPending,
    isError: settlementPolicyMutation.isError,
    error: settlementPolicyMutation.error,
  };
};
