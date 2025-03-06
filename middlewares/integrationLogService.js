import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const integrationLogService = {
    // Create a new integration log entry
    createLog: async (logData) => {
        try {
            const response = await axios.post(`${API_URL}/integration-logs`, logData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all integration logs with search and pagination
    getLogs: async (searchQuery = '', page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/integration-logs`, {
                params: {
                    search: searchQuery,
                    page,
                    limit
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a specific integration log by ID
    getLogById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/integration-logs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete an integration log by ID
    deleteLog: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/integration-logs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
