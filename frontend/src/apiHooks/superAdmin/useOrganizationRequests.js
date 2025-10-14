import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { config } from '../../config';
import axios from 'axios';

const fetchOrganizationRequests = async () => {
  try {
    console.log('[FRONTEND] Fetching organization requests...');
    const response = await axios.get(`${config.REACT_APP_API_URL}/organization-requests`, {
      withCredentials: true
    });

    console.log('[FRONTEND] Raw API response:', response);

    if (!Array.isArray(response.data)) {
      console.error('[FRONTEND] Unexpected response format:', response.data);
      return [];
    }

    console.log(`[FRONTEND] Received ${response.data.length} organization requests`);

    // The backend now returns the contact data directly in the response
    const processedData = response.data.map((request, index) => {
      const processed = {
        ...request,
        // The contact data is now available in request.contact
        contact: request.contact || {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          countryCode: ''
        },
        // Keep tenant data if available
        tenant: request.tenant || {},
        _debug: {
          hasContact: !!request.contact,
          contactKeys: request.contact ? Object.keys(request.contact) : []
        }
      };

      console.log(`[FRONTEND] Processed request ${index}:`, {
        id: request._id,
        ownerId: request.ownerId,
        hasContact: !!request.contact,
        contact: request.contact || {},
        _debug: processed._debug
      });

      return processed;
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching organization requests:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

export const useOrganizationRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [],
  });

  const {
    data: organizationRequests = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organizationRequests'],
    queryFn: fetchOrganizationRequests,
    // Enable refetching on window focus only if needed
    refetchOnWindowFocus: false,
  });

  // Apply search and filters
  const filteredData = organizationRequests.filter((request) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      Object.values(request).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Status filter
    const matchesStatus =
      filters.status.length === 0 || filters.status.includes(request.status);

    return matchesSearch && matchesStatus;
  });

  // Update search query
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Update status of a request
  // const updateRequestStatus = async (requestId, newStatus) => {
  //   try {
  //     await axios.patch(`${config.REACT_APP_API_URL}/organization-requests/${requestId}/status`, {
  //       status: newStatus,
  //     });
  //     // Refetch data to update the UI
  //     await refetch();
  //     return true;
  //   } catch (error) {
  //     console.error('Error updating request status:', error);
  //     throw error;
  //   }
  // };

  const updateOrganizationStatus = async (id, updateData) => {
    try {
        console.log(`[API] Updating status for request ${id} with data:`, updateData);
        const response = await axios.put(
            `${config.REACT_APP_API_URL}/organization-requests/${id}/status`,
            updateData,
            { withCredentials: true }
        );
        console.log(`[API] Status update successful for request ${id}`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to update status for request ${id}:`, {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
  };

  return {
    organizationRequests: filteredData,
    isLoading,
    error,
    searchQuery,
    filters,
    handleSearch,
    updateFilters,
    // updateRequestStatus,
    updateOrganizationStatus, // Add this line
    refetch,
  };
};

  // ✅ Add this new fetcher inside the same file
const fetchAllReqForPaymentPendingPage = async () => {
  try {
    console.log('[FRONTEND] Fetching all requests for payment pending page...');
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/organization-requests/all-req-for-payment-pending-page`,
      { withCredentials: true }
    );

    if (!response.data?.success) {
      console.error('[FRONTEND] Unexpected response:', response.data);
      return [];
    }

    const requests = response.data.data || [];
    console.log(`[FRONTEND] Received ${requests.length} total organization requests`);
    return requests;
  } catch (error) {
    console.error('Error fetching requests for payment pending page:', error);
    throw error;
  }
};

// ✅ Export a dedicated hook for this page
export const useAllReqForPaymentPendingPage = () => {
  return useQuery({
    queryKey: ['allOrganizationRequestsForPaymentPendingPage'],
    queryFn: fetchAllReqForPaymentPendingPage,
    refetchOnWindowFocus: false,
  });
};

export default useOrganizationRequests;
