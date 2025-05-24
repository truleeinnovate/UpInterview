import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const usePositions = () => {
    const queryClient = useQueryClient();
    const { sharingPermissionscontext = {} } = usePermissions() || {};
    const positionPermissions = sharingPermissionscontext?.position || {};

    // Fetch positions
    const { data: positions = [], isLoading: isPositionsLoading } = useQuery({
        queryKey: ['positions', positionPermissions],
        queryFn: async () => {
            const filteredPositions = await fetchFilterData('position', positionPermissions);
            return filteredPositions.reverse(); // Latest first
        },
        enabled: !!positionPermissions,
    });

    // Add/update position mutation
    const addOrUpdatePosition = useMutation({
        mutationFn: async ({ id, data }) => {
            const method = id ? 'patch' : 'post';
            const url = id
                ? `${config.REACT_APP_API_URL}/position/${id}`
                : `${config.REACT_APP_API_URL}/position`;

            const response = await axios[method](url, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['positions']);
        },
    });

    // Add/update round mutation
    const addOrUpdateRound = useMutation({
        mutationFn: async ({ positionId, round, roundId }) => {
            const payload = roundId
                ? { positionId, round, roundId }
                : { positionId, round };

            const response = await axios.post(
                `${config.REACT_APP_API_URL}/position/add-rounds`,
                payload
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['positions']);
        },
    });

    // Fetch single position details
    const usePositionDetails = (id, tenantId) => {
        return useQuery({
            queryKey: ['position', id],
            queryFn: async () => {
                const response = await axios.get(
                    `${config.REACT_APP_API_URL}/position/details/${id}`,
                    { params: { tenantId } }
                );
                return response.data;
            },
            enabled: !!id && !!tenantId,
        });
    };

    return {
        positions,
        isPositionsLoading,
        addOrUpdatePosition,
        addOrUpdateRound,
        usePositionDetails
    };
};