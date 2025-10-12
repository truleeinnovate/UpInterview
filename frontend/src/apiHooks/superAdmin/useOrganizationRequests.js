import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { config } from '../../config';
import axios from 'axios';

const fetchOrganizationRequests = async () => {
  try {
    const response = await axios.get(`${config.REACT_APP_API_URL}/organization-requests`);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization requests:', error);
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
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      await axios.patch(`${config.REACT_APP_API_URL}/organization-requests/${requestId}/status`, {
        status: newStatus,
      });
      // Refetch data to update the UI
      await refetch();
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
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
    updateRequestStatus,
    refetch,
  };
};

export default useOrganizationRequests;
