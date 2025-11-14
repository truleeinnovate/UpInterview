import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const useInterviewers = () => {
    const [interviewers, setInterviewers] = useState({
        data: [],
        loading: true,
        error: null
    });

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const tenantId = tokenPayload?.tenantId;

    const fetchInterviewers = useCallback(async () => {
        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/users/interviewers/${tenantId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            setInterviewers({
                data: response.data.data || [],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching interviewers:', error);
            setInterviewers(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, []);

    useEffect(() => {
        fetchInterviewers();
    }, [fetchInterviewers]);

    const refetch = () => {
        setInterviewers(prev => ({ ...prev, loading: true }));
        fetchInterviewers();
    };

    return {
        interviewers: interviewers.data,
        loading: interviewers.loading,
        error: interviewers.error,
        refetch
    };
};

export default useInterviewers;
