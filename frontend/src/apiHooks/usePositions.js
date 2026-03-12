// v1.0.0 - Ashok - fixed issue while updating or adding a new round with sequence

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { fetchFilterData } from "../api";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";

export const usePositions = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Positions?.View;
  const hasDeletePermission = effectivePermissions?.Positions?.Delete;

  // Build query key WITHOUT page (page is managed by useInfiniteQuery)
  const { page, ...filtersWithoutPage } = filters;

  const {
    data: responseData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["positions", filtersWithoutPage],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchFilterData(
        "position",
        effectivePermissions,
        { ...filtersWithoutPage, page: pageParam, limit: filters.limit || 20 }
      );
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage?.data?.total || lastPage?.total || 0;
      const positions = lastPage?.data?.positions || lastPage?.positions || lastPage?.data || [];
      const loadedSoFar = allPages.reduce((sum, p) => {
        const items = p?.data?.positions || p?.positions || p?.data || [];
        return sum + (Array.isArray(items) ? items.length : 0);
      }, 0);
      if (loadedSoFar < totalItems) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: false,
  });

  // Flatten all pages into a single array
  const positionData = responseData?.pages?.flatMap((p) => {
    return p?.data?.positions || p?.positions || p?.data || [];
  }) || [];
  const total = responseData?.pages?.[0]?.data?.total || responseData?.pages?.[0]?.total || positionData.length;

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

      // Invalidate to ensure consistency - force immediate refetch
      queryClient.invalidateQueries({ queryKey: ["positions"], refetchType: 'all' });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["position", variables.id], refetchType: 'all' });
      }
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

    onError: (error) => { },
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
        // if (!oldData) return oldData;
        // return oldData.map((position) => ({
        //   ...position,
        //   rounds:
        //     position.rounds?.filter((round) => round._id !== variables) || [],
        // }));
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export const usePositionById = (positionId) => {
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Positions?.View;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["position", positionId],
    queryFn: async () => {
      const authToken = Cookies.get("authToken") ?? "";
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/position/details/${positionId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    enabled: !!positionId && !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    position: data,
    isLoading,
    isError,
    error,
  };
};
