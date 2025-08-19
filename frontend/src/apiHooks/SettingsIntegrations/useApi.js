import { useState, useCallback } from 'react';
import { api, ApiError } from '../utils/api';
import { useToast } from './useToast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showSuccessMessage = false, 
      successMessage = 'Operation completed successfully',
      showErrorMessage = true,
      onSuccess,
      onError 
    } = options;

    setLoading(true);
    try {
      const result = await apiCall();
      
      if (showSuccessMessage) {
        showSuccess(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      if (showErrorMessage) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

  return { execute, loading };
};