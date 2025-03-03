import axios from 'axios';

// const API_URL = 'http://localhost:8080/api';

export const internalLogService = {
    // Create a new log entry
    createLog: async (logData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/internal-logs`, logData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all logs with search and pagination
    getLogs: async (searchQuery = '', page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/internal-logs`, {
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

    // Get a specific log by ID
    getLogById: async (id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/internal-logs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete a log by ID
    deleteLog: async (id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/internal-logs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
