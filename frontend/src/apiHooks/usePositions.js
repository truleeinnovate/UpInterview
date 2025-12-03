// v1.0.0 - Ashok - fixed issue while updating or adding a new round with sequence

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchFilterData } from "../api";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";

export const usePositions = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Positions?.View;
  const hasDeletePermission = effectivePermissions?.Positions?.Delete;

  const {
    data: responseData = {},

    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["positions", filters],

    queryFn: async () => {
      const data = await fetchFilterData(
        "position",
        effectivePermissions,
        filters
      );
      return data;
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    // refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnMount: "always",
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  //   // Then in your component
  // const positionData = responseData.positions || responseData.data || [];
  // const totalCount = responseData.total || positionData.length;

  const positionData =
    responseData.data?.positions ||
    responseData.positions ||
    responseData.data ||
    [];
  const total =
    responseData.data?.total || responseData.total || positionData.length;

  const positionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const method = id ? "patch" : "post";
      const url = id
        ? `${config.REACT_APP_API_URL}/position/${id}`
        : `${config.REACT_APP_API_URL}/position`;

      const response = await axios[method](url, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(["positions", filters], (oldData) => {
        // if (!oldData) return oldData;
        // if (variables.id) {
        //   // Update existing position
        //   return oldData.map(position =>
        //     position._id === variables.id
        //       ? { ...position, ...data.data }
        //       : position
        //   );
        // } else {
        //   // Add new position
        //   return [data.data, ...oldData];
        // }
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries(["positions"]);
    },
    onError: (error) => {
      console.error("Error adding/updating position:", error);
    },
  });

  // v1.0.0 <------------------------------------------------------------------------------
  const mergeUniqueRounds = (existingRounds, newRounds) => {
    const existingMap = new Map(
      existingRounds.map((round) => [round._id, round])
    );
    for (const newRound of newRounds) {
      existingMap.set(newRound._id, newRound); // This will replace if _id exists
    }
    return Array.from(existingMap.values());
  };

  const addRoundsMutation = useMutation({
    mutationFn: async (payload) => {
      // const response = await axios.post(
      //   `${config.REACT_APP_API_URL}/position/add-rounds`,
      //   payload
      // );
      // If editing, use PATCH, else POST
      const method = payload.roundId ? "patch" : "post";
      const url = payload.roundId
        ? `${config.REACT_APP_API_URL}/position/update-round/${payload?.positionId}/${payload?.roundId}`
        : `${config.REACT_APP_API_URL}/position/add-rounds`;

      const response = await axios[method](url, payload);
      return response.data;
    },

    // onSuccess: (data, variables) => {
    //   // Optimistically update the cache
    //   queryClient.setQueryData(['positions', filters], (oldData) => {
    //     if (!oldData) return oldData;
    //     return oldData.map(position =>
    //       position._id === variables.positionId
    //         ? { ...position, rounds: [...(position.rounds || []), ...(Array.isArray(data.data) ? data.data : [data.data])] }
    //         : position
    //     );
    //   });

    //   queryClient.invalidateQueries(['positions']);
    // },
    onSuccess: (data, variables) => {
      // queryClient.setQueryData(['positions', filters], (oldData) => {
      //   if (!oldData) return oldData;
      //   return oldData.map(position =>
      //     position._id === variables.positionId
      //       ? {
      //           ...position,
      //           rounds: mergeUniqueRounds(
      //             position.rounds || [],
      //             Array.isArray(data.data) ? data.data : [data.data]
      //           )
      //         }
      //       : position
      //   );
      // });
      queryClient.invalidateQueries(["positions"]);
    },

    onError: (error) => {},
  });
  // v1.0.0 ------------------------------------------------------------------------------>

  // Delete positiion round specific Round
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/position/delete-round/${roundId}`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(["positions", filters], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((position) => ({
          ...position,
          rounds:
            position.rounds?.filter((round) => round._id !== variables) || [],
        }));
      });

      queryClient.invalidateQueries(["positions"]);
    },
    onError: (error) => {
      console.error("Error deleting round:", error);
      //toast.error('Failed to delete round');
    },
  });

  // delete entire position api added by Ranjith

  const deleteMutation = useMutation({
    mutationFn: async (positionId) => {
      if (!hasDeletePermission) {
        throw new Error("You don't have permission to delete positions");
      }

      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/position/delete-position/${positionId}`
        // {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        //     'Content-Type': 'application/json'
        //   }
        // }
      );
      return response.data;
    },
    onSuccess: (data, positionId) => {
      // Optimistically remove from cache
      // queryClient.setQueryData(["positions", filters], (oldData) => {
      //   if (!oldData) return oldData;
      //   return oldData.filter(position => position._id !== positionId);
      // });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries(["positions"]);
    },
    onError: (error, positionId) => {
      console.error("Error deleting position:", error);

      // Revert optimistic update on error
      queryClient.invalidateQueries(["positions"]);
    },
  });

  const isMutationLoading =
    positionMutation.isPending ||
    addRoundsMutation.isPending ||
    deleteRoundMutation.isPending ||
    deleteMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    positionData,
    isLoading,
    total,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isPositionMutationError: positionMutation.isError,
    positionMutationError: positionMutation.error,
    isAddRoundsMutationError: addRoundsMutation.isError,
    addRoundsMutationError: addRoundsMutation.error,
    addOrUpdatePosition: positionMutation.mutateAsync,
    addRounds: addRoundsMutation.mutateAsync,
    deleteRoundMutation: deleteRoundMutation.mutateAsync,
    deletePositionMutation: deleteMutation.mutateAsync,
    refetch,
  };
};
