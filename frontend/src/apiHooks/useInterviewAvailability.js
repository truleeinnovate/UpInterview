// src/apiHooks/useInterviewAvailability.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';

export const useInterviewAvailability = (contactId) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contactId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interview-availability/contact/${contactId}`
        );
        setAvailability(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [contactId]);

  return { availability, loading, error };
};